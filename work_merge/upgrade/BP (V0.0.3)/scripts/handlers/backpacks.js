/**
 * Backpack System for TSXA-Addon
 *
 * This system handles:
 * - Spawning backpack entities in the world when backpack items are used
 * - Managing UUID-based identification and tracking of backpacks
 * - Loading and saving inventory data to/from scoreboard storage
 * - Handling banned items (shulker boxes, bundles) by dropping them on the ground
 * - Converting backpack entities back to items when picked up
 *
 * Usage:
 * 1. Right-click with a backpack item to place it in the world at the target block
 * 2. The backpack will spawn as an entity with a UUID tag for identification
 * 3. Saved inventory data is automatically loaded into the spawned entity
 * 4. Interact with backpack entities to access their inventory
 * 5. Pick up backpack entities to convert them back to items (preserving inventory)
 *
 * Banned Items:
 * - Shulker boxes and bundles cannot be stored in backpacks
 * - These items are automatically dropped on the ground when entities are removed
 * - This prevents issues with nested NBT data that cannot be properly serialized
 */
import { ItemStack, world, EquipmentSlot, EnchantmentType } from "@minecraft/server";
import { decodeString, encodeString, generateID } from "../utils";
const backpacks = [
    "mbl_ts:backpack_black_item",
    "mbl_ts:backpack_blue_item",
    "mbl_ts:backpack_brown_item",
    "mbl_ts:backpack_cyan_item",
    "mbl_ts:backpack_gray_item",
    "mbl_ts:backpack_green_item",
    "mbl_ts:backpack_light_blue_item",
    "mbl_ts:backpack_silver_item",
    "mbl_ts:backpack_lime_item",
    "mbl_ts:backpack_magenta_item",
    "mbl_ts:backpack_orange_item",
    "mbl_ts:backpack_pink_item",
    "mbl_ts:backpack_purple_item",
    "mbl_ts:backpack_red_item",
    "mbl_ts:backpack_white_item",
    "mbl_ts:backpack_yellow_item"
];
// Items that cannot be stored in backpacks due to NBT data limitations
const bannedItems = [
    "minecraft:undyed_shulker_box",
    "minecraft:white_shulker_box",
    "minecraft:orange_shulker_box",
    "minecraft:magenta_shulker_box",
    "minecraft:light_blue_shulker_box",
    "minecraft:yellow_shulker_box",
    "minecraft:lime_shulker_box",
    "minecraft:pink_shulker_box",
    "minecraft:gray_shulker_box",
    "minecraft:light_gray_shulker_box",
    "minecraft:cyan_shulker_box",
    "minecraft:purple_shulker_box",
    "minecraft:blue_shulker_box",
    "minecraft:brown_shulker_box",
    "minecraft:green_shulker_box",
    "minecraft:red_shulker_box",
    "minecraft:black_shulker_box",
    //colors for bundles
    "minecraft:bundle",
    "minecraft:white_bundle",
    "minecraft:orange_bundle",
    "minecraft:magenta_bundle",
    "minecraft:light_blue_bundle",
    "minecraft:yellow_bundle",
    "minecraft:lime_bundle",
    "minecraft:pink_bundle",
    "minecraft:gray_bundle",
    "minecraft:light_gray_bundle",
    "minecraft:cyan_bundle",
    "minecraft:purple_bundle",
    "minecraft:blue_bundle",
    "minecraft:brown_bundle",
    "minecraft:green_bundle",
    "minecraft:red_bundle",
    "minecraft:black_bundle"
];
export class BackpackSystem {
    static isBackPack(item) {
        return backpacks.includes(item.typeId);
    }
    static isBannedItem(item) {
        return bannedItems.includes(item.typeId);
    }
    static getUUID(item) {
        const lore = item.getLore();
        if (!lore || lore.length === 0) {
            return undefined;
        }
        // Decode the first lore line
        const decoded = decodeString(lore[0]);
        if (!decoded) {
            return undefined;
        }
        // Extract UUID by removing the prefix
        if (decoded.includes("§7UUID_")) {
            const uuid = decoded.replace("§7UUID_", "");
            return uuid;
        }
        else {
            return undefined;
        }
    }
    static createUUID(item) {
        const uuid = generateID();
        const encodedUUID = encodeString("§7UUID_" + uuid);
        item.setLore([encodedUUID]);
        return item;
    }
    /**
     * Raycast to find the block the player is looking at
     */
    static getTargetBlock(player, maxDistance = 10) {
        const raycastHit = player.getBlockFromViewDirection({
            maxDistance: maxDistance,
            includeLiquidBlocks: false,
            includePassableBlocks: false
        });
        if (raycastHit) {
            const blockLocation = raycastHit.block.location;
            // Return the position above the target block for entity spawning
            return {
                x: blockLocation.x + 0.5,
                y: blockLocation.y + 1,
                z: blockLocation.z + 0.5
            };
        }
        return undefined;
    }
    /**
     * Spawn a backpack entity at the specified location with UUID tagging
     */
    static spawnBackpackEntity(dimension, location, uuid, backpackType, player) {
        try {
            // Determine the entity type based on backpack color
            const entityType = this.getEntityTypeFromBackpack(backpackType);
            const entity = dimension.spawnEntity(entityType, location);
            // Tag the entity with the UUID for easy identification
            entity.addTag(`backpack_uuid_${uuid}`);
            entity.addTag("mbl_backpack_entity");
            // Set custom name for easier debugging
            entity.nameTag = `§6${player.name}'s§r\n§0[ §bBackpack §0]§r`;
            return entity;
        }
        catch (error) {
            console.error("Failed to spawn backpack entity:", error);
            return undefined;
        }
    }
    /**
     * Convert backpack item type to corresponding entity type
     */
    static getEntityTypeFromBackpack(backpackType) {
        // Map backpack items to their corresponding entities
        // For now, we'll use a generic entity - you may want to create specific backpack entities
        const entityMap = {
            "mbl_ts:backpack_black_item": "mbl_ts:backpack_black",
            "mbl_ts:backpack_blue_item": "mbl_ts:backpack_blue",
            "mbl_ts:backpack_brown_item": "mbl_ts:backpack_brown",
            "mbl_ts:backpack_cyan_item": "mbl_ts:backpack_cyan",
            "mbl_ts:backpack_gray_item": "mbl_ts:backpack_gray",
            "mbl_ts:backpack_green_item": "mbl_ts:backpack_green",
            "mbl_ts:backpack_light_blue_item": "mbl_ts:backpack_light_blue",
            "mbl_ts:backpack_silver_item": "mbl_ts:backpack_silver",
            "mbl_ts:backpack_lime_item": "mbl_ts:backpack_lime",
            "mbl_ts:backpack_magenta_item": "mbl_ts:backpack_magenta",
            "mbl_ts:backpack_orange_item": "mbl_ts:backpack_orange",
            "mbl_ts:backpack_pink_item": "mbl_ts:backpack_pink",
            "mbl_ts:backpack_purple_item": "mbl_ts:backpack_purple",
            "mbl_ts:backpack_red_item": "mbl_ts:backpack_red",
            "mbl_ts:backpack_white_item": "mbl_ts:backpack_white",
            "mbl_ts:backpack_yellow_item": "mbl_ts:backpack_yellow"
        };
        return entityMap[backpackType] || "mbl_ts:backpack_black";
    }
    /**
     * Load inventory data into a backpack entity
     */
    static loadInventoryToEntity(entity, items) {
        try {
            const inventoryComponent = entity.getComponent("inventory");
            if (!inventoryComponent) {
                console.error("Entity does not have inventory component");
                return false;
            }
            const container = inventoryComponent.container;
            if (!container) {
                console.error("Could not access entity container");
                return false;
            }
            // Clear existing inventory
            for (let i = 0; i < container.size; i++) {
                container.setItem(i, undefined);
            }
            // Load items from serialized data
            for (let i = 0; i < items.length && i < container.size; i++) {
                const serializedItem = items[i];
                if (serializedItem && serializedItem.id !== "minecraft:air") {
                    try {
                        const itemStack = new ItemStack(serializedItem.id, serializedItem.amount);
                        // Set durability if applicable
                        if (serializedItem.durability !== undefined) {
                            const durabilityComponent = itemStack.getComponent("durability");
                            if (durabilityComponent) {
                                try {
                                    durabilityComponent.damage = serializedItem.durability;
                                }
                                catch (error) {
                                }
                            }
                        }
                        // Set name tag if present
                        if (serializedItem.nameTag) {
                            itemStack.nameTag = serializedItem.nameTag;
                        }
                        // Set lore if present
                        if (serializedItem.lore) {
                            itemStack.setLore(serializedItem.lore);
                        }
                        // Set enchantments if present
                        if (serializedItem.enchantments && serializedItem.enchantments.length > 0) {
                            const enchantableComponent = itemStack.getComponent("enchantable");
                            if (enchantableComponent) {
                                // Try to add enchantments from the serialized data
                                // We'll recreate the enchantments list and add them all at once
                                if (serializedItem.enchantments.length > 0) {
                                    try {
                                        const enchants = serializedItem.enchantments;
                                        for (const ench of enchants) {
                                            const newEnch = new EnchantmentType(ench.type.id);
                                            enchantableComponent.addEnchantment({ type: newEnch, level: ench.level });
                                        }
                                    }
                                    catch (enchError) {
                                    }
                                }
                            }
                        }
                        container.setItem(i, itemStack);
                    }
                    catch (error) {
                        console.error(`Failed to create item ${serializedItem.id}:`, error);
                    }
                }
            }
            return true;
        }
        catch (error) {
            console.error("Failed to load inventory to entity:", error);
            return false;
        }
    }
    /**
     * Find backpack entity by UUID
     */
    static findBackpackEntity(dimension, uuid) {
        try {
            const entities = dimension.getEntities({
                tags: [`backpack_uuid_${uuid}`]
            });
            return entities.length > 0 ? entities[0] : undefined;
        }
        catch (error) {
            console.error("Failed to find backpack entity:", error);
            return undefined;
        }
    }
    /**
     * Handle banned items by dropping them on the ground
     */
    static dropBannedItems(entity) {
        try {
            const inventoryComponent = entity.getComponent("inventory");
            if (!inventoryComponent)
                return;
            const container = inventoryComponent.container;
            if (!container)
                return;
            const location = entity.location;
            const dimension = entity.dimension;
            for (let i = 0; i < container.size; i++) {
                const item = container.getItem(i);
                if (item && this.isBannedItem(item)) {
                    // Spawn the banned item on the ground
                    dimension.spawnItem(item, location);
                    // Remove from container
                    container.setItem(i, undefined);
                }
            }
        }
        catch (error) {
            console.error("Failed to drop banned items:", error);
        }
    }
    /**
     * Remove backpack entity by UUID
     */
    static removeBackpackEntity(dimension, uuid) {
        try {
            const entity = this.findBackpackEntity(dimension, uuid);
            if (entity) {
                // Save inventory (this will drop banned items first)
                this.saveInventoryFromEntity(entity, uuid);
                entity.remove();
                return true;
            }
            return false;
        }
        catch (error) {
            console.error("Failed to remove backpack entity:", error);
            return false;
        }
    }
    /**
     * Handle backpack item use - spawn entity and load inventory
     */
    static handleBackpackUse(player, backpackItem) {
        try {
            // Check if item has UUID, create one if not
            let uuid = this.getUUID(backpackItem);
            if (!uuid) {
                backpackItem = this.createUUID(backpackItem);
                uuid = this.getUUID(backpackItem);
                if (!uuid) {
                    return false;
                }
                // Update the item in player's inventory
                const equipable = player.getComponent("equippable");
                if (equipable) {
                    equipable.setEquipment(EquipmentSlot.Mainhand, backpackItem);
                }
            }
            // Get target location
            const targetLocation = this.getTargetBlock(player);
            if (!targetLocation) {
                player.sendMessage("§cNo valid location to place backpack!");
                return false;
            }
            // Check if a backpack entity already exists at this location
            const existingEntity = this.findBackpackEntity(player.dimension, uuid);
            if (existingEntity) {
                player.sendMessage("§cThis backpack is already placed in the world!");
                return false;
            }
            // Spawn backpack entity
            const entity = this.spawnBackpackEntity(player.dimension, targetLocation, uuid, backpackItem.typeId, player);
            if (!entity) {
                player.sendMessage("§cFailed to place backpack!");
                return false;
            }
            // Load saved inventory
            const savedInventory = this.getInventory(uuid);
            if (savedInventory) {
                if (!this.loadInventoryToEntity(entity, savedInventory)) {
                    // Error handling is done inside loadInventoryToEntity
                }
            }
            // Remove item from player's inventory
            const equipable = player.getComponent("equippable");
            if (equipable) {
                const currentItem = equipable.getEquipment(EquipmentSlot.Mainhand);
                if (currentItem && currentItem.amount > 1) {
                    const newItem = currentItem.clone();
                    newItem.amount = currentItem.amount - 1;
                    equipable.setEquipment(EquipmentSlot.Mainhand, newItem);
                }
                else {
                    equipable.setEquipment(EquipmentSlot.Mainhand, undefined);
                }
            }
            player.playSound("block.ts_backpack.open");
            player.sendMessage("§aBackpack placed successfully!");
            return true;
        }
        catch (error) {
            player.sendMessage("§cAn error occurred while placing the backpack!");
            return false;
        }
    }
    /**
     * Save inventory from entity back to storage
     */
    static saveInventoryFromEntity(entity, uuid) {
        try {
            // Drop banned items BEFORE saving inventory
            this.dropBannedItems(entity);
            const inventoryComponent = entity.getComponent("inventory");
            if (!inventoryComponent) {
                console.error("Entity does not have inventory component");
                return false;
            }
            const container = inventoryComponent.container;
            if (!container) {
                console.error("Could not access entity container");
                return false;
            }
            const items = [];
            // Serialize all items in the container
            for (let i = 0; i < container.size; i++) {
                const item = container.getItem(i);
                if (item && item.typeId !== "minecraft:air") {
                    const serializedItem = {
                        id: item.typeId,
                        amount: item.amount
                    };
                    // Get durability if applicable
                    const durabilityComponent = item.getComponent("durability");
                    if (durabilityComponent) {
                        try {
                            serializedItem.durability = durabilityComponent.damage;
                        }
                        catch (error) {
                            // Don't set durability if we can't read it
                        }
                    }
                    // Get name tag if present
                    if (item.nameTag) {
                        serializedItem.nameTag = item.nameTag;
                    }
                    // Get lore if present
                    const lore = item.getLore();
                    if (lore && lore.length > 0) {
                        serializedItem.lore = lore;
                    }
                    // Get enchantments if present
                    const enchantableComponent = item.getComponent("enchantable");
                    if (enchantableComponent && enchantableComponent.getEnchantments().length > 0) {
                        serializedItem.enchantments = enchantableComponent.getEnchantments();
                    }
                    items.push(serializedItem);
                }
                else {
                    // Push empty slot to maintain inventory structure
                    items.push({
                        id: "minecraft:air",
                        amount: 0
                    });
                }
            }
            // Save to storage
            this.setInventory(uuid, items);
            return true;
        }
        catch (error) {
            console.error("Failed to save inventory from entity:", error);
            return false;
        }
    }
    /**
     * Get all backpack entities in the world
     */
    static getAllBackpackEntities(dimension) {
        try {
            return dimension.getEntities({
                tags: ["mbl_backpack_entity"]
            });
        }
        catch (error) {
            console.error("Failed to get all backpack entities:", error);
            return [];
        }
    }
    /**
     * Convert backpack entity back to item when picked up
     */
    static pickupBackpackEntity(player, entity) {
        try {
            // Extract UUID from entity tags
            const tags = entity.getTags();
            const uuidTag = tags.find(tag => tag.startsWith("backpack_uuid_"));
            if (!uuidTag) {
                return false;
            }
            const uuid = uuidTag.replace("backpack_uuid_", "");
            // Save current inventory state (this will drop banned items first)
            this.saveInventoryFromEntity(entity, uuid);
            // Get entity location before removing it
            const entityLocation = entity.location;
            // Determine backpack type from entity
            const backpackType = this.getBackpackTypeFromEntity(entity.typeId);
            // Create backpack item
            const backpackItem = new ItemStack(backpackType, 1);
            backpackItem.setLore([encodeString("§7UUID_" + uuid)]);
            // Add to player inventory
            const inventory = player.getComponent("inventory");
            if (inventory && inventory.container) {
                const leftover = inventory.container.addItem(backpackItem);
                if (leftover) {
                    // Drop at the entity's original location if inventory is full
                    player.dimension.spawnItem(leftover, entityLocation);
                    player.sendMessage("§eInventory full! Backpack dropped where it was picked up.");
                }
                else {
                    player.playSound("block.ts_backpack.open");
                    player.sendMessage("§aBackpack picked up!");
                }
            }
            // Remove entity
            entity.remove();
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Convert entity type back to backpack item type
     */
    static getBackpackTypeFromEntity(entityType) {
        const entityMap = {
            "mbl_ts:backpack_black": "mbl_ts:backpack_black_item",
            "mbl_ts:backpack_blue": "mbl_ts:backpack_blue_item",
            "mbl_ts:backpack_brown": "mbl_ts:backpack_brown_item",
            "mbl_ts:backpack_cyan": "mbl_ts:backpack_cyan_item",
            "mbl_ts:backpack_gray": "mbl_ts:backpack_gray_item",
            "mbl_ts:backpack_green": "mbl_ts:backpack_green_item",
            "mbl_ts:backpack_light_blue": "mbl_ts:backpack_light_blue_item",
            "mbl_ts:backpack_light_gray": "mbl_ts:backpack_light_gray_item",
            "mbl_ts:backpack_lime": "mbl_ts:backpack_lime_item",
            "mbl_ts:backpack_magenta": "mbl_ts:backpack_magenta_item",
            "mbl_ts:backpack_orange": "mbl_ts:backpack_orange_item",
            "mbl_ts:backpack_pink": "mbl_ts:backpack_pink_item",
            "mbl_ts:backpack_purple": "mbl_ts:backpack_purple_item",
            "mbl_ts:backpack_red": "mbl_ts:backpack_red_item",
            "mbl_ts:backpack_white": "mbl_ts:backpack_white_item",
            "mbl_ts:backpack_yellow": "mbl_ts:backpack_yellow_item"
        };
        return entityMap[entityType] || "mbl_ts:backpack_white_item";
    }
    /**
     * Clean up all backpack entities (useful for debugging/maintenance)
     */
    static cleanupAllBackpacks(dimension) {
        try {
            const entities = this.getAllBackpackEntities(dimension);
            let cleaned = 0;
            for (const entity of entities) {
                // Try to extract UUID from tags
                const tags = entity.getTags();
                const uuidTag = tags.find(tag => tag.startsWith("backpack_uuid_"));
                if (uuidTag) {
                    const uuid = uuidTag.replace("backpack_uuid_", "");
                    // Save inventory (this will drop banned items first)
                    this.saveInventoryFromEntity(entity, uuid);
                }
                entity.remove();
                cleaned++;
            }
            return cleaned;
        }
        catch (error) {
            console.error("Failed to cleanup backpack entities:", error);
            return 0;
        }
    }
    static getInventory(UUID) {
        const objective = world.scoreboard.getObjective("mbl_ts_backpacks");
        if (!objective)
            return undefined;
        for (const user of objective.getParticipants()) {
            const parsedData = JSON.parse(user.displayName);
            if (parsedData.uuid === UUID)
                return parsedData.items;
        }
        return undefined;
    }
    static setInventory(UUID, items) {
        const objective = world.scoreboard.getObjective("mbl_ts_backpacks");
        if (!objective) {
            world.scoreboard.addObjective("mbl_ts_backpacks");
            //this can never return undefined due to it creating itself again if mising
            this.setInventory(UUID, items);
            return;
        }
        for (const user of objective.getParticipants()) {
            const parsedData = JSON.parse(user.displayName);
            if (parsedData.uuid === UUID) {
                objective.removeParticipant(user);
                objective.setScore(JSON.stringify({ uuid: UUID, items: items }), 0);
                return;
            }
        }
        objective.setScore(JSON.stringify({ uuid: UUID, items: items }), 0);
    }
}
