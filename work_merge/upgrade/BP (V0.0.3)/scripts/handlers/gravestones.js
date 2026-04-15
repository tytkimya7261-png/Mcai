/**

 * Gravestone System for TSXA-Addon

 *

 * This system handles:

 * - Spawning tiny invisible gravestone entities when players die
 * - Storing player's dropped items in the entity's inventory
 * - Placing gravestone blocks at death location
 * - Dropping items and despawning entity when gravestone block is broken
 * - Maintaining item states (durability, enchantments, lore, etc.)
 *
 * Usage:
 * 1. When a player dies, their items are automatically collected into a gravestone entity
 * 2. An invisible entity is spawned and a gravestone block is placed at the death location
 * 3. Breaking the gravestone block drops all stored items and removes the entity
 * 4. Items maintain their original properties (durability, enchantments, etc.)
 */
import { system } from "@minecraft/server";
import { generateID } from "../utils";
import { GameSettings } from "./gamesettings";
export class GravestoneSystem {
    /**
     * Handle player death event - to be called from main.ts
     */
    static handlePlayerDeathEvent(player, deathLocation) {
        const gamesettings = GameSettings.getGravestonesEnabled();
        if (gamesettings == false)
            return; // Gravestones disabled in game settings
        // Wait a moment for items to drop, then collect them
        system.runTimeout(() => {
            // Find all dropped items near the death location
            const nearbyItems = player.dimension.getEntities({
                type: "minecraft:item",
                location: deathLocation,
                maxDistance: 5
            });
            const droppedItems = [];
            // Collect the ItemStacks from the dropped item entities
            for (const itemEntity of nearbyItems) {
                try {
                    const itemComponent = itemEntity.getComponent("item");
                    if (itemComponent?.itemStack) {
                        // Clone the ItemStack to preserve all properties
                        const itemStack = itemComponent.itemStack.clone();
                        droppedItems.push(itemStack);
                        // Remove the dropped item entity from the world
                        itemEntity.remove();
                    }
                }
                catch (error) {
                    console.error("Error processing dropped item:", error);
                }
            }
            // Create gravestone with collected items
            if (droppedItems.length > 0) {
                this.handlePlayerDeath(player, deathLocation, droppedItems);
            }
        }, 10); // Wait 10 ticks (0.5 seconds) for items to finish dropping
    }
    /**
     * Handle gravestone block break event - to be called from main.ts
     */
    static handleGravestoneBlockBreak(player, block) {
        const blockLocation = {
            x: block.location.x,
            y: block.location.y,
            z: block.location.z
        };
        // Try to get UUID from block, otherwise use proximity search
        const uuid = this.getGravestoneUUID(block);
        system.run(() => {
            if (this.breakGravestone(player.dimension, blockLocation, uuid)) {
                player.sendMessage("§aGravestone broken! Items have been dropped.");
            }
            else {
                player.sendMessage("§cNo gravestone entity found for this block.");
            }
        });
    }
    /**
     * Spawn a tiny invisible gravestone entity at the specified location
     */
    static spawnGravestoneEntity(dimension, location, uuid, playerName) {
        try {
            // Calculate the centered position within the gravestone block
            const centeredLocation = {
                x: Math.floor(location.x) + 0.5,
                y: Math.floor(location.y) + 0.1, // Slightly above the block floor to avoid clipping
                z: Math.floor(location.z) + 0.5
            };
            // Spawn the custom gravestone entity from your behavior pack at the centered location
            const entity = dimension.spawnEntity("mbl_ts:gravestone_storage", centeredLocation);
            // Tag the entity for identification
            entity.addTag(`gravestone_uuid_${uuid}`);
            entity.addTag("mbl_gravestone_entity");
            // Set name for debugging
            entity.nameTag = `§0[§n${playerName}'s§0]\n§8[§7Gravestone§0]§r`;
            // Make the entity very small and invisible so it's not noticeable
            return entity;
        }
        catch (error) {
            console.error("Failed to spawn gravestone entity:", error);
            return undefined;
        }
    }
    /**
     * Place a gravestone block at the specified location
     */
    static placeGravestoneBlock(dimension, location, uuid) {
        try {
            const blockLocation = {
                x: Math.floor(location.x),
                y: Math.floor(location.y),
                z: Math.floor(location.z)
            };
            // Check if the location is valid and not occupied by important blocks
            const block = dimension.getBlock(blockLocation);
            if (!block)
                return false;
            // Don't replace solid blocks, only air and replaceable blocks
            if (block.typeId !== "minecraft:air" &&
                !block.typeId.includes("water") &&
                !block.typeId.includes("grass") &&
                !block.typeId.includes("flower") &&
                !block.typeId.includes("sapling")) {
                // Try one block higher
                blockLocation.y += 1;
            }
            // Generate random cardinal direction
            const cardinalDirections = ["north", "south", "east", "west"];
            const randomDirection = cardinalDirections[Math.floor(Math.random() * cardinalDirections.length)];
            try {
                // Try to place custom gravestone block first with random cardinal direction
                const placedBlock = dimension.getBlock(blockLocation);
                if (placedBlock) {
                    placedBlock.setType("mbl_ts:gravestone");
                    placedBlock.setPermutation(placedBlock.permutation.withState("minecraft:cardinal_direction", randomDirection));
                }
                return true;
            }
            catch (error) {
                // If custom block doesn't exist, use cobblestone as fallback
                dimension.setBlockType(blockLocation, "minecraft:cobblestone");
                return true;
            }
        }
        catch (error) {
            console.error("Failed to place gravestone block:", error);
            return false;
        }
    }
    /**
     * Store player's dropped items in the gravestone entity
     */
    static storeItemsInGravestone(entity, items) {
        try {
            const inventoryComponent = entity.getComponent("inventory");
            if (!inventoryComponent) {
                console.error("Gravestone entity does not have inventory component");
                return false;
            }
            const container = inventoryComponent.container;
            if (!container) {
                console.error("Could not access gravestone entity container");
                return false;
            }
            // Store items in the entity's inventory
            let slotIndex = 0;
            for (const item of items) {
                if (slotIndex >= container.size)
                    break;
                if (item && item.typeId !== "minecraft:air") {
                    container.setItem(slotIndex, item);
                    slotIndex++;
                }
            }
            return true;
        }
        catch (error) {
            console.error("Failed to store items in gravestone:", error);
            return false;
        }
    }
    /**
     * Find gravestone entity by UUID
     */
    static findGravestoneEntity(dimension, uuid) {
        try {
            const entities = dimension.getEntities({
                tags: [`gravestone_uuid_${uuid}`]
            });
            return entities.length > 0 ? entities[0] : undefined;
        }
        catch (error) {
            console.error("Failed to find gravestone entity:", error);
            return undefined;
        }
    }
    /**
     * Drop all items from gravestone entity and remove it
     */
    static breakGravestone(dimension, blockLocation, uuid) {
        try {
            let entity;
            if (uuid) {
                entity = this.findGravestoneEntity(dimension, uuid);
            }
            else {
                // Find gravestone entity near the broken block
                const nearbyEntities = dimension.getEntities({
                    location: blockLocation,
                    maxDistance: 2,
                    tags: ["mbl_gravestone_entity"]
                });
                entity = nearbyEntities.length > 0 ? nearbyEntities[0] : undefined;
            }
            if (!entity) {
                console.error("Could not find gravestone entity to break");
                return false;
            }
            const inventoryComponent = entity.getComponent("inventory");
            if (inventoryComponent && inventoryComponent.container) {
                const container = inventoryComponent.container;
                // Drop all items at the block location
                for (let i = 0; i < container.size; i++) {
                    const item = container.getItem(i);
                    if (item && item.typeId !== "minecraft:air") {
                        // Add small random offset to prevent items from stacking perfectly
                        const dropLocation = {
                            x: blockLocation.x + 0.5 + (Math.random() - 0.5) * 0.3,
                            y: blockLocation.y + 0.5,
                            z: blockLocation.z + 0.5 + (Math.random() - 0.5) * 0.3
                        };
                        dimension.spawnItem(item, dropLocation);
                    }
                }
            }
            // Remove the entity
            entity.remove();
            return true;
        }
        catch (error) {
            console.error("Failed to break gravestone:", error);
            return false;
        }
    }
    /**
     * Handle player death - create gravestone with their items
     */
    static handlePlayerDeath(player, deathLocation, droppedItems) {
        try {
            const uuid = generateID();
            const dimension = player.dimension;
            // Spawn invisible gravestone entity
            const entity = this.spawnGravestoneEntity(dimension, deathLocation, uuid, player.name);
            if (!entity) {
                console.error("Failed to spawn gravestone entity");
                return false;
            }
            // Store items in the entity
            if (!this.storeItemsInGravestone(entity, droppedItems)) {
                console.error("Failed to store items in gravestone");
                entity.remove();
                return false;
            }
            // Place gravestone block
            if (!this.placeGravestoneBlock(dimension, deathLocation, uuid)) {
                console.error("Failed to place gravestone block");
                entity.remove();
                return false;
            }
            return true;
        }
        catch (error) {
            console.error("Failed to handle player death:", error);
            return false;
        }
    }
    /**
     * Clean up all gravestone entities (useful for debugging/maintenance)
     */
    static cleanupAllGravestones(dimension) {
        try {
            const entities = dimension.getEntities({
                tags: ["mbl_gravestone_entity"]
            });
            let cleaned = 0;
            for (const entity of entities) {
                entity.remove();
                cleaned++;
            }
            return cleaned;
        }
        catch (error) {
            console.error("Failed to cleanup gravestone entities:", error);
            return 0;
        }
    }
    /**
     * Get all gravestone entities in the dimension
     */
    static getAllGravestoneEntities(dimension) {
        try {
            return dimension.getEntities({
                tags: ["mbl_gravestone_entity"]
            });
        }
        catch (error) {
            console.error("Failed to get all gravestone entities:", error);
            return [];
        }
    }
    /**
     * Check if a block is a gravestone
     */
    static isGravestoneBlock(block) {
        return block.typeId === "mbl_ts:gravestone";
    }
    /**
     * Check if there's a gravestone entity near this block
     */
    static isNearGravestoneEntity(block) {
        try {
            const nearbyEntities = block.dimension.getEntities({
                location: block.location,
                maxDistance: 2,
                tags: ["mbl_gravestone_entity"]
            });
            return nearbyEntities.length > 0;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Extract UUID from gravestone block (if stored)
     */
    static getGravestoneUUID(block) {
        try {
            // This would depend on how you store the UUID in the block
            // For now, we'll return undefined and rely on proximity search
            return undefined;
        }
        catch (error) {
            console.error("Failed to get gravestone UUID:", error);
            return undefined;
        }
    }
}
