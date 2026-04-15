import { EntityComponentTypes, ItemStack, world } from "@minecraft/server";
/**
 * Flamethrower System - Manages flamethrower activation based on fuel availability
 * Call this function from the player pulse system to constantly check flamethrower state
 */
const FLAMETHROWER_ID = "mbl_ts:flamethrower";
const FLAMETHROWER_ACTIVE_ID = "mbl_ts:flamethrower_active";
const FUEL_ITEM_ID = "mbl_ts:fuel_item";
const FLAMETHROWER_RANGE = 10; // Range in blocks to detect entities
const FIRE_DURATION = 15; // Duration in seconds to set entities on fire
/**
 * Check if player has fuel in their inventory
 */
function hasFuel(player) {
    try {
        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        if (!inventory)
            return false;
        const container = inventory.container;
        if (!container)
            return false;
        // Search through all inventory slots for fuel
        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (item && item.typeId === FUEL_ITEM_ID) {
                // Check if the fuel item has durability remaining
                const durability = item.getComponent("minecraft:durability");
                if (durability && durability.damage < durability.maxDurability) {
                    return true;
                }
            }
        }
        return false;
    }
    catch {
        return false;
    }
}
/**
 * Get the player's currently equipped mainhand item
 */
function getEquippedItem(player) {
    try {
        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        if (!inventory)
            return undefined;
        const container = inventory.container;
        if (!container)
            return undefined;
        return container.getItem(player.selectedSlotIndex);
    }
    catch {
        return undefined;
    }
}
/**
 * Set the player's mainhand item
 */
function setEquippedItem(player, item) {
    try {
        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        if (!inventory)
            return;
        const container = inventory.container;
        if (!container)
            return;
        if (item) {
            container.setItem(player.selectedSlotIndex, item);
        }
        else {
            container.setItem(player.selectedSlotIndex, undefined);
        }
    }
    catch { }
}
/**
 * Update flamethrower lore to show durability remaining
 */
function updateFlamethrowerLore(flamethrower) {
    try {
        const durability = flamethrower.getComponent("minecraft:durability");
        if (durability) {
            const remaining = durability.maxDurability - durability.damage;
            const maxDur = durability.maxDurability;
            flamethrower.setLore([`§7Durability: §f${remaining}§7/§f${maxDur}`]);
        }
    }
    catch { }
}
/**
 * Update fuel item lore to show gas remaining
 */
function updateFuelLore(fuel) {
    try {
        const durability = fuel.getComponent("minecraft:durability");
        if (durability) {
            const remaining = durability.maxDurability - durability.damage;
            const maxDur = durability.maxDurability;
            fuel.setLore([`§7Gas Remaining: §f${remaining}§7/§f${maxDur}`]);
        }
    }
    catch { }
}
/**
 * Transform flamethrower to active version
 */
function transformToActive(player, flamethrower) {
    try {
        const activeFlamethrowerStack = new ItemStack(FLAMETHROWER_ACTIVE_ID, flamethrower.amount);
        // Transfer durability from old flamethrower to new one
        const oldDurability = flamethrower.getComponent("minecraft:durability");
        const newDurability = activeFlamethrowerStack.getComponent("minecraft:durability");
        if (oldDurability && newDurability) {
            newDurability.damage = oldDurability.damage;
        }
        // Update lore to show durability
        updateFlamethrowerLore(activeFlamethrowerStack);
        setEquippedItem(player, activeFlamethrowerStack);
    }
    catch { }
}
/**
 * Transform active flamethrower back to normal version
 */
function transformToNormal(player, activeFlamethrowerStack) {
    try {
        const flamethrowerStack = new ItemStack(FLAMETHROWER_ID, activeFlamethrowerStack.amount);
        // Transfer durability from active flamethrower to normal one
        const oldDurability = activeFlamethrowerStack.getComponent("minecraft:durability");
        const newDurability = flamethrowerStack.getComponent("minecraft:durability");
        if (oldDurability && newDurability) {
            newDurability.damage = oldDurability.damage;
        }
        // Update lore to show durability
        updateFlamethrowerLore(flamethrowerStack);
        setEquippedItem(player, flamethrowerStack);
    }
    catch { }
}
/**
 * Consume fuel durability
 * @param player - The player whose fuel to consume
 * @param amount - Amount of durability to consume from fuel
 */
function consumeFuel(player, amount) {
    try {
        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        if (!inventory)
            return;
        const container = inventory.container;
        if (!container)
            return;
        // Search through all inventory slots for fuel
        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (item && item.typeId === FUEL_ITEM_ID) {
                const durability = item.getComponent("minecraft:durability");
                if (durability && durability.damage < durability.maxDurability) {
                    // Add damage to the fuel item (consuming fuel)
                    durability.damage = Math.min(durability.maxDurability, durability.damage + amount);
                    // If the fuel is completely used up, remove it
                    if (durability.damage >= durability.maxDurability) {
                        container.setItem(i, undefined);
                    }
                    else {
                        // Update lore to show remaining fuel
                        updateFuelLore(item);
                        // Update the item with new durability
                        container.setItem(i, item);
                    }
                    return; // Only consume from the first fuel item found
                }
            }
        }
    }
    catch { }
}
/**
 * Set entities in front of the player on fire when using the flamethrower
 * @param player - The player using the flamethrower
 */
function setEntitiesOnFire(player) {
    try {
        const viewDirection = player.getViewDirection();
        const playerLocation = player.location;
        // Get all entities in the dimension
        const dimension = player.dimension;
        const nearbyEntities = dimension.getEntities({
            location: playerLocation,
            maxDistance: FLAMETHROWER_RANGE,
            excludeTypes: ["minecraft:item"] // Don't set fire to dropped items
        });
        for (const entity of nearbyEntities) {
            // Skip the player themselves
            if (entity.id === player.id)
                continue;
            if (entity.typeId == "minecraftplayer")
                continue; // Don't set other players on fire
            try {
                // Calculate vector from player to entity
                const entityLocation = entity.location;
                const toEntity = {
                    x: entityLocation.x - playerLocation.x,
                    y: entityLocation.y - playerLocation.y,
                    z: entityLocation.z - playerLocation.z
                };
                // Normalize the vector to entity
                const distance = Math.sqrt(toEntity.x * toEntity.x + toEntity.y * toEntity.y + toEntity.z * toEntity.z);
                if (distance === 0)
                    continue;
                const normalizedToEntity = {
                    x: toEntity.x / distance,
                    y: toEntity.y / distance,
                    z: toEntity.z / distance
                };
                // Calculate dot product to check if entity is in front of player
                const dotProduct = viewDirection.x * normalizedToEntity.x +
                    viewDirection.y * normalizedToEntity.y +
                    viewDirection.z * normalizedToEntity.z;
                // If dot product > 0.3, entity is roughly in front of the player (within ~90 degree cone)
                if (dotProduct > 0.3 && distance <= FLAMETHROWER_RANGE) {
                    // Set the entity on fire for 4 seconds (80 ticks)
                    entity.setOnFire(FIRE_DURATION, true);
                }
            }
            catch { }
        }
    }
    catch { }
}
/**
 * Consume flamethrower durability and fuel when flamethrower is used (interaction)
 * Call this from the item use event handler
 * Uses 25 fuel durability and 5 flamethrower durability per use
 */
export function consumeFuelOnFlamethrowerUse(player) {
    try {
        // Play attack sound when flamethrower is used
        player.playSound("ts_flamethrower.attack", { pitch: 1.0, volume: 1.0 });
        // Set entities in front of the player on fire
        setEntitiesOnFire(player);
        // Consume 25 durability from fuel
        consumeFuel(player, 25);
        // Consume 5 durability from the flamethrower itself
        const equippedItem = getEquippedItem(player);
        if (equippedItem && equippedItem.typeId === FLAMETHROWER_ACTIVE_ID) {
            const flamethrowerDurability = equippedItem.getComponent("minecraft:durability");
            if (flamethrowerDurability) {
                flamethrowerDurability.damage = Math.min(flamethrowerDurability.maxDurability, flamethrowerDurability.damage + 5);
                // If flamethrower is broken, remove it
                if (flamethrowerDurability.damage >= flamethrowerDurability.maxDurability) {
                    setEquippedItem(player, undefined);
                }
                else {
                    // Update lore to show remaining durability
                    updateFlamethrowerLore(equippedItem);
                    setEquippedItem(player, equippedItem);
                }
            }
        }
    }
    catch { }
}
/**
 * Update lore for all flamethrower and fuel items in player's inventory
 * This ensures lore is always up-to-date even when picking up items
 */
function updateAllItemLore(player) {
    try {
        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        if (!inventory)
            return;
        const container = inventory.container;
        if (!container)
            return;
        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (!item)
                continue;
            // Update flamethrower lore
            if (item.typeId === FLAMETHROWER_ID || item.typeId === FLAMETHROWER_ACTIVE_ID) {
                updateFlamethrowerLore(item);
                container.setItem(i, item);
            }
            // Update fuel lore
            else if (item.typeId === FUEL_ITEM_ID) {
                updateFuelLore(item);
                container.setItem(i, item);
            }
        }
    }
    catch { }
}
/**
 * Main pulse function - Call this regularly to manage flamethrower states
 * This should be called from the player pulse system (e.g., playerPulseFast)
 */
export function flamethrowerPulse() {
    try {
        const players = [...world.getAllPlayers()];
        for (const player of players) {
            try {
                // Update lore for all flamethrowers and fuel items
                updateAllItemLore(player);
                const equippedItem = getEquippedItem(player);
                if (!equippedItem)
                    continue;
                const itemTypeId = equippedItem.typeId;
                const playerHasFuel = hasFuel(player);
                // Case 1: Holding normal flamethrower + has fuel → Transform to active
                if (itemTypeId === FLAMETHROWER_ID && playerHasFuel) {
                    transformToActive(player, equippedItem);
                }
                // Case 2: Holding active flamethrower + no fuel → Transform back to normal
                else if (itemTypeId === FLAMETHROWER_ACTIVE_ID && !playerHasFuel) {
                    transformToNormal(player, equippedItem);
                }
            }
            catch { }
        }
    }
    catch { }
}
