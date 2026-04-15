import { EntityComponentTypes, ItemStack, world, EntityDamageCause } from "@minecraft/server";
/**
 * Chainsaw System - Manages chainsaw activation based on fuel availability
 * Call this function from the player pulse system to constantly check chainsaw state
 */
const CHAINSAW_ID = "mbl_ts:chainsaw";
const CHAINSAW_ACTIVE_ID = "mbl_ts:chainsaw_active";
const FUEL_ITEM_ID = "mbl_ts:fuel_item";
const CHAINSAW_DAMAGE = 15; // Damage amount per hit
const CHAINSAW_RANGE = 3.5; // Range in blocks to detect entities
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
 * Update chainsaw lore to show durability remaining
 */
function updateChainsawLore(chainsaw) {
    try {
        const durability = chainsaw.getComponent("minecraft:durability");
        if (durability) {
            const remaining = durability.maxDurability - durability.damage;
            const maxDur = durability.maxDurability;
            chainsaw.setLore([`§7Durability: §f${remaining}§7/§f${maxDur}`]);
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
 * Transform chainsaw to active version
 */
function transformToActive(player, chainsaw) {
    try {
        const activeChainsawStack = new ItemStack(CHAINSAW_ACTIVE_ID, chainsaw.amount);
        // Transfer durability from old chainsaw to new one
        const oldDurability = chainsaw.getComponent("minecraft:durability");
        const newDurability = activeChainsawStack.getComponent("minecraft:durability");
        if (oldDurability && newDurability) {
            newDurability.damage = oldDurability.damage;
        }
        // Update lore to show durability
        updateChainsawLore(activeChainsawStack);
        setEquippedItem(player, activeChainsawStack);
        // Play idle sound when chainsaw becomes active
        player.playSound("ts_chainsaw.idle", { pitch: 1.0, volume: 0.5 });
    }
    catch { }
}
/**
 * Transform active chainsaw back to normal version
 */
function transformToNormal(player, activeChainsawStack) {
    try {
        const chainsawStack = new ItemStack(CHAINSAW_ID, activeChainsawStack.amount);
        // Transfer durability from active chainsaw to normal one
        const oldDurability = activeChainsawStack.getComponent("minecraft:durability");
        const newDurability = chainsawStack.getComponent("minecraft:durability");
        if (oldDurability && newDurability) {
            newDurability.damage = oldDurability.damage;
        }
        // Update lore to show durability
        updateChainsawLore(chainsawStack);
        setEquippedItem(player, chainsawStack);
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
 * Damage entities in front of the player when using the chainsaw
 * @param player - The player using the chainsaw
 */
function damageEntitiesInFront(player) {
    try {
        const viewDirection = player.getViewDirection();
        const playerLocation = player.location;
        // Get all entities in the dimension
        const dimension = player.dimension;
        const nearbyEntities = dimension.getEntities({
            location: playerLocation,
            maxDistance: CHAINSAW_RANGE,
            excludeTypes: ["minecraft:item"] // Don't damage dropped items
        });
        for (const entity of nearbyEntities) {
            // Skip the player themselves
            if (entity.id === player.id)
                continue;
            if (entity.typeId == "minecraftplayer")
                continue;
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
                // If dot product > 0.5, entity is roughly in front of the player (within ~60 degree cone)
                if (dotProduct > 0.5 && distance <= CHAINSAW_RANGE) {
                    // Apply damage to the entity
                    entity.applyDamage(CHAINSAW_DAMAGE, {
                        cause: EntityDamageCause.entityAttack,
                        damagingEntity: player
                    });
                }
            }
            catch { }
        }
    }
    catch { }
}
/**
 * Consume chainsaw durability and fuel when chainsaw is used (interaction)
 * Call this from the item use event handler
 * Uses 25 fuel durability and 5 chainsaw durability per use
 */
export function consumeFuelOnChainsawUse(player) {
    try {
        // Play attack sound when chainsaw is used
        player.playSound("ts_chainsaw.attack", { pitch: 1.0, volume: 1.0 });
        // Damage entities in front of the player
        damageEntitiesInFront(player);
        // Consume 25 durability from fuel
        consumeFuel(player, 25);
        // Consume 5 durability from the chainsaw itself
        const equippedItem = getEquippedItem(player);
        if (equippedItem && equippedItem.typeId === CHAINSAW_ACTIVE_ID) {
            const chainsawDurability = equippedItem.getComponent("minecraft:durability");
            if (chainsawDurability) {
                chainsawDurability.damage = Math.min(chainsawDurability.maxDurability, chainsawDurability.damage + 5);
                // If chainsaw is broken, remove it
                if (chainsawDurability.damage >= chainsawDurability.maxDurability) {
                    setEquippedItem(player, undefined);
                }
                else {
                    // Update lore to show remaining durability
                    updateChainsawLore(equippedItem);
                    setEquippedItem(player, equippedItem);
                }
            }
        }
    }
    catch { }
}
/**
 * Update lore for all chainsaw and fuel items in player's inventory
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
            // Update chainsaw lore
            if (item.typeId === CHAINSAW_ID || item.typeId === CHAINSAW_ACTIVE_ID) {
                updateChainsawLore(item);
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
 * Main pulse function - Call this regularly to manage chainsaw states
 * This should be called from the player pulse system (e.g., playerPulseFast)
 */
export function chainsawPulse() {
    try {
        const players = [...world.getAllPlayers()];
        for (const player of players) {
            try {
                // Update lore for all chainsaws and fuel items
                updateAllItemLore(player);
                const equippedItem = getEquippedItem(player);
                if (!equippedItem)
                    continue;
                const itemTypeId = equippedItem.typeId;
                const playerHasFuel = hasFuel(player);
                // Case 1: Holding normal chainsaw + has fuel → Transform to active
                if (itemTypeId === CHAINSAW_ID && playerHasFuel) {
                    transformToActive(player, equippedItem);
                }
                // Case 2: Holding active chainsaw + no fuel → Transform back to normal
                else if (itemTypeId === CHAINSAW_ACTIVE_ID && !playerHasFuel) {
                    transformToNormal(player, equippedItem);
                }
            }
            catch { }
        }
    }
    catch { }
}
