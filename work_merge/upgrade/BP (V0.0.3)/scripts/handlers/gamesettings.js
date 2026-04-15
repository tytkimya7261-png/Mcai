import { world } from "@minecraft/server";
const defaultSettings = {
    spawning: {
        cows: 0,
        sheep: 0,
        pigs: 0,
        wolfs: 0,
        chickens: 0,
        rabbits: 0,
        horses: 0,
        llamas: 0,
        villagers: 0,
        skeletons: 0,
        zombies: 0,
        endermen: 0,
        creepers: 0,
        spiders: 0,
    },
    structures: false,
    gravestones: true,
    attributes: {
        actionbar: {
            type: "default",
            trigger: "default"
        }
    },
    dataVersion: 1
};
export class GameSettings {
    static SCOREBOARD_OBJECTIVE = "mbl_ts_game_settings";
    static SETTINGS_KEY = "global_game_settings";
    /**
     * Retrieves the current game settings from the world scoreboard
     * @returns GameSettingsType - The current game settings or default settings if none exist
     */
    static getData() {
        let scoreboard = world.scoreboard.getObjective(this.SCOREBOARD_OBJECTIVE);
        if (!scoreboard) {
            world.scoreboard.addObjective(this.SCOREBOARD_OBJECTIVE);
            scoreboard = world.scoreboard.getObjective(this.SCOREBOARD_OBJECTIVE);
        }
        const participants = scoreboard.getParticipants();
        if (participants.length > 0) {
            try {
                const data = JSON.parse(participants[0].displayName);
                return data;
            }
            catch (error) {
                // Invalid JSON, return defaults
                return { ...defaultSettings };
            }
        }
        // No settings found, return defaults
        return { ...defaultSettings };
    }
    /**
     * Saves the game settings to the world scoreboard
     * @param settings - The settings to save
     */
    static setData(settings) {
        let scoreboard = world.scoreboard.getObjective(this.SCOREBOARD_OBJECTIVE);
        if (!scoreboard) {
            world.scoreboard.addObjective(this.SCOREBOARD_OBJECTIVE);
            scoreboard = world.scoreboard.getObjective(this.SCOREBOARD_OBJECTIVE);
        }
        const newData = JSON.stringify(settings);
        // Clear all existing participants (should only be one)
        const participants = scoreboard.getParticipants();
        for (const participant of participants) {
            scoreboard.removeParticipant(participant);
        }
        // Add the new settings as a single entry
        scoreboard.addScore(newData, 0);
    }
    /**
     * Gets the spawning settings for all mobs
     * @returns SpawningSettingsType - Current mob spawning configuration
     */
    static getSpawningSettings() {
        const data = this.getData();
        return data.spawning;
    }
    /**
     * Sets the spawning settings for all mobs
     * @param spawning - New spawning configuration
     */
    static setSpawningSettings(spawning) {
        const data = this.getData();
        this.setData({
            ...data,
            spawning: spawning
        });
    }
    static getStructuresEnabled() {
        const data = this.getData();
        return data.structures;
    }
    static setStructuresEnabled(enabled) {
        const data = this.getData();
        this.setData({
            ...data,
            structures: enabled
        });
    }
    /**
     * Gets the spawning rate for a specific mob type
     * @param mobType - The type of mob to get spawning rate for
     * @returns number - The spawning rate (0-100)
     */
    static getMobSpawningRate(mobType) {
        const spawning = this.getSpawningSettings();
        return spawning[mobType];
    }
    /**
     * Sets the spawning rate for a specific mob type
     * @param mobType - The type of mob to set spawning rate for
     * @param rate - The new spawning rate (0-100)
     */
    static setMobSpawningRate(mobType, rate) {
        const spawning = this.getSpawningSettings();
        spawning[mobType] = Math.max(0, Math.min(100, rate)); // Clamp between 0-100
        this.setSpawningSettings(spawning);
    }
    /**
     * Gets whether gravestones are enabled
     * @returns boolean - True if gravestones are enabled
     */
    static getGravestonesEnabled() {
        const data = this.getData();
        return data.gravestones;
    }
    /**
     * Sets whether gravestones are enabled
     * @param enabled - True to enable gravestones, false to disable
     */
    static setGravestonesEnabled(enabled) {
        const data = this.getData();
        this.setData({
            ...data,
            gravestones: enabled
        });
    }
    /**
     * Gets the attribute display settings
     * @returns AttributeDisplayType - Current attribute display configuration
     */
    static getAttributeSettings() {
        const data = this.getData();
        return data.attributes;
    }
    /**
     * Sets the attribute display settings
     * @param attributes - New attribute display configuration
     */
    static setAttributeSettings(attributes) {
        const data = this.getData();
        this.setData({
            ...data,
            attributes: attributes
        });
    }
    /**
     * Resets all settings to their default values
     */
    static resetToDefaults() {
        this.setData({ ...defaultSettings });
    }
    /**
     * Gets the current data version for migration purposes
     * @returns number - Current data version
     */
    static getDataVersion() {
        const data = this.getData();
        return data.dataVersion;
    }
}
