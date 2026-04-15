import { Player, system, ItemStack } from "@minecraft/server";
import { getMainHand, setMainHand } from "../utils";
// Dynamic property to track leg injury state
const LEG_INJURY_PROPERTY = "mbl_ts:leg_injured";
const LEG_INJURY_LEVEL_PROPERTY = "mbl_ts:leg_injury_level";
// Map to track active injury timers for each player
const activeInjuryTimers = new Map();
// Injury levels based on fall damage amount
const INJURY_LEVELS = {
    MINOR: {
        level: 1,
        minDamage: 2, // 1 heart of fall damage
        slownessDuration: 30, // 30 seconds
        slownessAmplifier: 0,
        message: "§6You hurt your leg from the fall! (Minor injury - 30s slowness)"
    },
    MODERATE: {
        level: 2,
        minDamage: 4, // 2 hearts of fall damage
        slownessDuration: 60, // 60 seconds
        slownessAmplifier: 1,
        message: "§cYou severely hurt your leg from the fall! (Moderate injury - 60s slowness)"
    },
    SEVERE: {
        level: 3,
        minDamage: 8, // 4 hearts of fall damage
        slownessDuration: 120, // 120 seconds
        slownessAmplifier: 2,
        message: "§4You badly injured your leg from the fall! (Severe injury - 120s slowness)"
    }
};
export class LegInjurySystem {
    /**
     * Handle fall damage and apply leg injury if needed
     */
    static handleFallDamage(event) {
        // Check if the hurt entity is a player
        if (!(event.hurtEntity instanceof Player)) {
            return;
        }
        const player = event.hurtEntity;
        // Check if damage source is fall damage
        if (event.damageSource.cause !== "fall") {
            return;
        }
        // Don't apply injury if player already has a leg injury
        if (this.hasLegInjury(player)) {
            return;
        }
        const damage = event.damage;
        let injury = null;
        // Determine injury severity based on damage amount
        if (damage >= INJURY_LEVELS.SEVERE.minDamage) {
            injury = INJURY_LEVELS.SEVERE;
        }
        else if (damage >= INJURY_LEVELS.MODERATE.minDamage) {
            injury = INJURY_LEVELS.MODERATE;
        }
        else if (damage >= INJURY_LEVELS.MINOR.minDamage) {
            injury = INJURY_LEVELS.MINOR;
        }
        if (injury) {
            this.applyLegInjury(player, injury);
            player.sendMessage(injury.message);
            player.sendMessage("§eUse a healing brace to treat your injury!");
            player.playSound("entity.player.hurt", { volume: 1, pitch: 0.8 });
        }
    }
    /**
     * Apply leg injury effects to player
     */
    static applyLegInjury(player, injury) {
        try {
            const playerId = player.id;
            // Cancel any existing timer for this player
            this.cancelInjuryTimer(playerId);
            // Set injury properties
            player.setDynamicProperty(LEG_INJURY_PROPERTY, true);
            player.setDynamicProperty(LEG_INJURY_LEVEL_PROPERTY, injury.level);
            // Apply slowness effect
            player.addEffect("slowness", injury.slownessDuration * 20, {
                amplifier: injury.slownessAmplifier,
                showParticles: true
            });
            // Schedule injury removal (backup in case player doesn't use splint)
            const timerId = system.runTimeout(() => {
                if (this.hasLegInjury(player)) {
                    this.removeLegInjury(player);
                    player.sendMessage("§aYour leg injury has naturally healed.");
                }
                // Remove timer from tracking when it completes
                activeInjuryTimers.delete(playerId);
            }, injury.slownessDuration * 20);
            // Track the timer ID for this player
            activeInjuryTimers.set(playerId, timerId);
        }
        catch (error) {
            // Silent error handling
        }
    }
    /**
     * Check if player has a leg injury
     */
    static hasLegInjury(player) {
        try {
            return player.getDynamicProperty(LEG_INJURY_PROPERTY) || false;
        }
        catch {
            return false;
        }
    }
    /**
     * Get player's injury level (1-3)
     */
    static getInjuryLevel(player) {
        try {
            return player.getDynamicProperty(LEG_INJURY_LEVEL_PROPERTY) || 0;
        }
        catch {
            return 0;
        }
    }
    /**
     * Remove leg injury from player
     */
    static removeLegInjury(player) {
        try {
            const playerId = player.id;
            // Cancel any active timer for this player
            this.cancelInjuryTimer(playerId);
            // Clear injury properties
            player.setDynamicProperty(LEG_INJURY_PROPERTY, false);
            player.setDynamicProperty(LEG_INJURY_LEVEL_PROPERTY, 0);
            // Remove slowness effect
            player.removeEffect("slowness");
        }
        catch (error) {
            // Silent error handling
        }
    }
    /**
     * Cancel any active injury timer for a player
     */
    static cancelInjuryTimer(playerId) {
        const timerId = activeInjuryTimers.get(playerId);
        if (timerId !== undefined) {
            system.clearRun(timerId);
            activeInjuryTimers.delete(playerId);
        }
    }
    /**
     * Reset leg injury system for a player (called when player dies/respawns)
     */
    static resetPlayerInjurySystem(player) {
        try {
            const playerId = player.id;
            // Cancel any active timers
            this.cancelInjuryTimer(playerId);
            // Clear injury properties (these should already be cleared by death, but just in case)
            player.setDynamicProperty(LEG_INJURY_PROPERTY, false);
            player.setDynamicProperty(LEG_INJURY_LEVEL_PROPERTY, 0);
            // Remove slowness effect (should be cleared by death, but just in case)
            player.removeEffect("slowness");
        }
        catch (error) {
            // Silent error handling
        }
    }
    /**
     * Handle healing brace usage
     */
    static useHealingBrace(player) {
        if (!this.hasLegInjury(player)) {
            player.sendMessage("§cYou don't have a leg injury to treat!");
            return false;
        }
        const injuryLevel = this.getInjuryLevel(player);
        // Remove the injury
        this.removeLegInjury(player);
        // Show success message
        let recoveryMessage = "§aYou've successfully treated your leg injury!";
        switch (injuryLevel) {
            case 1:
                recoveryMessage = "§aYou've treated your minor leg injury!";
                break;
            case 2:
                recoveryMessage = "§aYou've treated your moderate leg injury!";
                break;
            case 3:
                recoveryMessage = "§aYou've treated your severe leg injury!";
                break;
        }
        player.sendMessage(recoveryMessage);
        player.playSound("random.levelup", { volume: 0.5, pitch: 1.2 });
        const mainhand = getMainHand(player);
        if (mainhand) {
            const amount = mainhand.amount;
            if (amount === 1) {
                setMainHand(player, undefined);
            }
            else {
                setMainHand(player, new ItemStack("mbl_ts:healing_brace", amount - 1));
            }
        }
        return true;
    }
    /**
     * Clean up player data when player leaves
     */
    static cleanupPlayerData(playerId) {
        // Cancel any active injury timers for the player
        this.cancelInjuryTimer(playerId);
    }
    /**
     * Show injury status to player (for debugging or UI)
     */
    static showInjuryStatus(player) {
        if (!this.hasLegInjury(player)) {
            player.sendMessage("§aYour legs are healthy!");
            return;
        }
        const level = this.getInjuryLevel(player);
        let statusMessage = "§6Leg Injury Status: ";
        switch (level) {
            case 1:
                statusMessage += "§eMinor (Level 1)";
                break;
            case 2:
                statusMessage += "§6Moderate (Level 2)";
                break;
            case 3:
                statusMessage += "§cSevere (Level 3)";
                break;
        }
        player.sendMessage(statusMessage);
        player.sendMessage("§eUse a healing brace to treat your injury!");
    }
}
