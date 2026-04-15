import { world, system, EquipmentSlot } from "@minecraft/server";
// Dynamic property constants
const FLASHLIGHT_POSITIONS_PROPERTY = "mbl_ts:flashlight_positions";
const FLASHLIGHT_STATE_PROPERTY = "mbl_ts:flashlight_state";
const MAX_PROPERTY_LENGTH = 32000; // Stay well under the limit
const FLASHLIGHT_RANGE = 3; // Range to check for active flashlights
const MOVEMENT_THRESHOLD = 1.5; // Distance player must move before updating light position
export class FlashlightSystem {
    static playerLastPositions = new Map();
    // Flashlight item IDs that can be activated
    static flashlightItems = [
        "mbl_ts:flashlight_item",
        // Add more flashlight item IDs as needed
    ];
    // Battery item ID
    static batteryItemId = "mbl_ts:battery";
    /**
     * Handle flashlight item interaction - toggles flashlight on/off
     */
    static handleFlashlightInteraction(player) {
        // Check if player is holding a flashlight
        if (!this.isHoldingFlashlight(player)) {
            player.sendMessage("§cYou must be holding a flashlight to use it!");
            return false;
        }
        // Toggle flashlight state
        const currentState = this.getFlashlightState(player);
        if (!currentState) {
            // Trying to turn on - check for battery
            if (!this.hasBattery(player)) {
                player.sendMessage("§cYou need a battery to power the flashlight!");
                return false;
            }
            this.setFlashlightState(player, true);
            player.playSound("item.ts_flashlight.on_off");
            player.sendMessage("§aFlashlight turned on!");
        }
        else {
            // Turning off
            this.setFlashlightState(player, false);
            player.playSound("item.ts_flashlight.on_off");
            player.sendMessage("§7Flashlight turned off!");
            // Clear the player's flashlight immediately when turned off
            this.clearPlayerFlashlight(player);
        }
        // Update battery lore after state change
        this.updateBatteryLore(player);
        return true;
    }
    /**
     * Check if player is holding a flashlight item
     */
    static isHoldingFlashlight(player) {
        const equippable = player.getComponent("minecraft:equippable");
        if (!equippable)
            return false;
        // Check mainhand
        const mainhand = equippable.getEquipment(EquipmentSlot.Mainhand);
        if (mainhand && this.flashlightItems.includes(mainhand.typeId)) {
            return true;
        }
        // Check offhand
        const offhand = equippable.getEquipment(EquipmentSlot.Offhand);
        if (offhand && this.flashlightItems.includes(offhand.typeId)) {
            return true;
        }
        return false;
    }
    /**
     * Check if player has any flashlight in their inventory (including hands)
     */
    static hasFlashlightInInventory(player) {
        // First check if holding one
        if (this.isHoldingFlashlight(player)) {
            return true;
        }
        // Then check inventory
        const inventory = player.getComponent("minecraft:inventory");
        if (!inventory?.container)
            return false;
        for (let i = 0; i < inventory.container.size; i++) {
            const item = inventory.container.getItem(i);
            if (item && this.flashlightItems.includes(item.typeId)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Get flashlight state for a player
     */
    static getFlashlightState(player) {
        try {
            return player.getDynamicProperty(FLASHLIGHT_STATE_PROPERTY) || false;
        }
        catch {
            return false;
        }
    }
    /**
     * Set flashlight state for a player
     */
    static setFlashlightState(player, state) {
        try {
            player.setDynamicProperty(FLASHLIGHT_STATE_PROPERTY, state);
        }
        catch {
            // Failed to set state
        }
    }
    /**
     * Check if player has a battery in their inventory
     */
    static hasBattery(player) {
        const inventory = player.getComponent("minecraft:inventory");
        if (!inventory?.container)
            return false;
        for (let i = 0; i < inventory.container.size; i++) {
            const item = inventory.container.getItem(i);
            if (item && item.typeId === this.batteryItemId) {
                return true;
            }
        }
        return false;
    }
    /**
     * Update battery item lore with remaining percentage
     */
    static updateBatteryLore(player) {
        const inventory = player.getComponent("minecraft:inventory");
        if (!inventory?.container)
            return;
        for (let i = 0; i < inventory.container.size; i++) {
            const item = inventory.container.getItem(i);
            if (item && item.typeId === this.batteryItemId) {
                const durability = item.getComponent("minecraft:durability");
                if (durability) {
                    const remaining = durability.maxDurability - (durability.damage || 0);
                    const percentage = Math.round((remaining / durability.maxDurability) * 100);
                    // Create battery lore with percentage
                    let lore;
                    if (percentage > 75) {
                        lore = [`§a${percentage}% Battery Remaining`];
                    }
                    else if (percentage > 50) {
                        lore = [`§e${percentage}% Battery Remaining`];
                    }
                    else if (percentage > 25) {
                        lore = [`§6${percentage}% Battery Remaining`];
                    }
                    else if (percentage > 0) {
                        lore = [`§c${percentage}% Battery Remaining`];
                    }
                    else {
                        lore = [`§4Battery Depleted`];
                    }
                    item.setLore(lore);
                    inventory.container.setItem(i, item);
                }
            }
        }
    }
    /**
     * Consume battery durability (1 point per call)
     */
    static consumeBattery(player) {
        const inventory = player.getComponent("minecraft:inventory");
        if (!inventory?.container)
            return false;
        for (let i = 0; i < inventory.container.size; i++) {
            const item = inventory.container.getItem(i);
            if (item && item.typeId === this.batteryItemId) {
                const currentDurability = item.getComponent("minecraft:durability");
                if (currentDurability) {
                    const newDamage = (currentDurability.damage || 0) + 1;
                    if (newDamage >= currentDurability.maxDurability) {
                        // Battery is depleted, remove it
                        inventory.container.setItem(i, undefined);
                        player.sendMessage("§cBattery depleted! Flashlight turned off.");
                        this.setFlashlightState(player, false);
                        this.clearPlayerFlashlight(player);
                        return false;
                    }
                    else {
                        // Reduce durability
                        currentDurability.damage = newDamage;
                        inventory.container.setItem(i, item);
                        return true;
                    }
                }
                break;
            }
        }
        return false;
    }
    /**
     * Main pulse function - call this from the existing playerPulseFast()
     */
    static pulse() {
        for (const player of world.getAllPlayers()) {
            // Update battery lore for all players every 40 ticks (2 seconds)
            if (system.currentTick % 40 === 0) {
                if (this.hasBattery(player)) {
                    this.updateBatteryLore(player);
                }
            }
            if (this.hasActiveFlashlight(player)) {
                this.updatePlayerFlashlight(player);
                // Consume battery every second (20 ticks)
                if (system.currentTick % 20 === 0) {
                    if (!this.consumeBattery(player)) {
                        // Battery consumption failed (either no battery or depleted)
                        // Flash light will be turned off automatically by consumeBattery
                        continue;
                    }
                    // Update battery lore after consumption
                    this.updateBatteryLore(player);
                }
            }
            else {
                // Clear flashlight if player doesn't have active flashlight
                // (either not holding one, or turned off, or both)
                if (this.getFlashlightState(player)) {
                    if (!this.isHoldingFlashlight(player)) {
                        // Player was using flashlight but no longer holding it - turn it off
                        this.setFlashlightState(player, false);
                        player.sendMessage("§7Flashlight automatically turned off (not holding flashlight)");
                    }
                    else if (!this.hasFlashlightInInventory(player)) {
                        // Player doesn't have any flashlight in inventory - turn it off
                        this.setFlashlightState(player, false);
                        player.sendMessage("§7Flashlight automatically turned off (no flashlight in inventory)");
                    }
                    else if (!this.hasBattery(player)) {
                        // Player doesn't have any battery in inventory - turn it off
                        this.setFlashlightState(player, false);
                        player.sendMessage("§7Flashlight automatically turned off (no battery in inventory)");
                    }
                }
                this.clearPlayerFlashlight(player);
            }
        }
        // Clean up orphaned light blocks every few ticks
        if (system.currentTick % 60 === 0) {
            this.cleanupOrphanedLights();
        }
    }
    /**
     * Check if player has an active flashlight (turned on AND holding flashlight)
     */
    static hasActiveFlashlight(player) {
        // Must be holding flashlight AND have it turned on
        return this.isHoldingFlashlight(player) && this.getFlashlightState(player);
    }
    /**
     * Update flashlight for a specific player
     */
    static updatePlayerFlashlight(player) {
        const currentPos = player.location;
        const lastPos = this.playerLastPositions.get(player.id);
        // Check if player has moved enough to warrant updating the light
        if (lastPos && this.getDistance(currentPos, lastPos) < MOVEMENT_THRESHOLD) {
            return;
        }
        // Remove old light block for this player
        this.clearPlayerFlashlight(player);
        // Place new light block at player's position
        const lightPos = {
            x: Math.floor(currentPos.x),
            y: Math.floor(currentPos.y),
            z: Math.floor(currentPos.z)
        };
        try {
            const block = player.dimension.getBlock(lightPos);
            if (block && block.typeId === "minecraft:air") {
                block.setType("minecraft:light_block_12");
                this.saveFlashlightPosition(player.id, lightPos);
                this.playerLastPositions.set(player.id, currentPos);
            }
        }
        catch (error) {
            // Block placement failed, ignore silently
        }
    }
    /**
     * Clear flashlight for a specific player
     */
    static clearPlayerFlashlight(player) {
        const positions = this.getFlashlightPositions();
        const playerPositions = positions.filter(pos => pos.playerId === player.id);
        for (const pos of playerPositions) {
            try {
                const block = player.dimension.getBlock(pos);
                if (block && block.typeId === "minecraft:light_block_12") {
                    block.setType("minecraft:air");
                }
            }
            catch (error) {
                // Block removal failed, continue
            }
        }
        // Remove from stored positions
        this.removePlayerFlashlightPositions(player.id);
        this.playerLastPositions.delete(player.id);
    }
    /**
     * Clean up orphaned light blocks (no active flashlight player nearby)
     */
    static cleanupOrphanedLights() {
        const positions = this.getFlashlightPositions();
        const toRemove = [];
        for (const pos of positions) {
            let hasNearbyActivePlayer = false;
            // Check if any player with active flashlight is nearby
            for (const player of world.getAllPlayers()) {
                if (this.hasActiveFlashlight(player) &&
                    this.getDistance(player.location, pos) <= FLASHLIGHT_RANGE) {
                    hasNearbyActivePlayer = true;
                    break;
                }
            }
            if (!hasNearbyActivePlayer) {
                // Remove the light block
                try {
                    const overworld = world.getDimension("overworld");
                    const block = overworld.getBlock(pos);
                    if (block && block.typeId === "minecraft:light_block_12") {
                        block.setType("minecraft:air");
                    }
                }
                catch (error) {
                    // Block removal failed, mark for removal from storage anyway
                }
                toRemove.push(pos);
            }
        }
        // Remove orphaned positions from storage
        if (toRemove.length > 0) {
            this.removeFlashlightPositions(toRemove);
        }
    }
    /**
     * Save flashlight position to dynamic properties
     */
    static saveFlashlightPosition(playerId, position) {
        const positions = this.getFlashlightPositions();
        const newPosition = {
            x: position.x,
            y: position.y,
            z: position.z,
            playerId: playerId
        };
        // Remove existing positions for this player first
        const filteredPositions = positions.filter(pos => pos.playerId !== playerId);
        filteredPositions.push(newPosition);
        this.setFlashlightPositions(filteredPositions);
    }
    /**
     * Remove flashlight positions for a specific player
     */
    static removePlayerFlashlightPositions(playerId) {
        const positions = this.getFlashlightPositions();
        const filteredPositions = positions.filter(pos => pos.playerId !== playerId);
        this.setFlashlightPositions(filteredPositions);
    }
    /**
     * Remove specific flashlight positions
     */
    static removeFlashlightPositions(toRemove) {
        const positions = this.getFlashlightPositions();
        const filteredPositions = positions.filter(pos => !toRemove.some(remove => remove.x === pos.x &&
            remove.y === pos.y &&
            remove.z === pos.z &&
            remove.playerId === pos.playerId));
        this.setFlashlightPositions(filteredPositions);
    }
    /**
     * Get all flashlight positions from dynamic properties
     */
    static getFlashlightPositions() {
        try {
            const data = world.getDynamicProperty(FLASHLIGHT_POSITIONS_PROPERTY);
            if (!data)
                return [];
            return JSON.parse(data);
        }
        catch (error) {
            return [];
        }
    }
    /**
     * Set flashlight positions in dynamic properties
     */
    static setFlashlightPositions(positions) {
        try {
            const data = JSON.stringify(positions);
            // Check if data is too large
            if (data.length > MAX_PROPERTY_LENGTH) {
                // Remove oldest entries until we're under the limit
                while (positions.length > 0 && JSON.stringify(positions).length > MAX_PROPERTY_LENGTH) {
                    positions.shift();
                }
            }
            world.setDynamicProperty(FLASHLIGHT_POSITIONS_PROPERTY, JSON.stringify(positions));
        }
        catch (error) {
            // Property setting failed, clear it
            try {
                world.setDynamicProperty(FLASHLIGHT_POSITIONS_PROPERTY, JSON.stringify([]));
            }
            catch { }
        }
    }
    /**
     * Calculate distance between two positions
     */
    static getDistance(pos1, pos2) {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2) +
            Math.pow(pos1.z - pos2.z, 2));
    }
    /**
     * Clear all flashlight data (useful for cleanup)
     */
    static clearAllFlashlights() {
        try {
            world.setDynamicProperty(FLASHLIGHT_POSITIONS_PROPERTY, JSON.stringify([]));
            this.playerLastPositions.clear();
        }
        catch (error) {
            // Cleanup failed
        }
    }
    /**
     * Handle player leaving - clean up their flashlights
     */
    static handlePlayerLeave(player) {
        this.clearPlayerFlashlight(player);
        this.setFlashlightState(player, false);
    }
}
// Export functions for easy integration
export function flashlightPulse() {
    FlashlightSystem.pulse();
}
export function handleFlashlightToggle(player) {
    return FlashlightSystem.handleFlashlightInteraction(player);
}
