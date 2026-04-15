import { EntityComponentTypes, Player, world, system, EquipmentSlot } from "@minecraft/server";
import { generateID, getActionbarLayout } from "../utils";
import { PlayerCollectables } from "./collectables";
import { processFoodExpiry } from "./food";
import { GameSettings } from "./gamesettings";
import { GravestoneSystem } from "./gravestones";
import { LegInjurySystem } from "../misc/legInjury";
import { getActionBar } from "./vehicles";
// Player data cache system to prevent scoreboard conflicts
const playerDataCache = new Map();
const pendingUpdates = new Set();
let cacheUpdateInterval = null;
// Sleep tracking system
const ENERGY_RESTORE_AMOUNT = 50;
const SLEEP_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes in milliseconds
const exampleData = {
    attributes: {
        hydration: {
            value: 100,
            time: null
        },
        energy: {
            value: 100,
            time: null
        },
        toxicity: 0
    },
    stats: {
        deaths: 0,
        kills: []
    },
    settings: {
        actionbar: {
            layout: "default",
            showMode: "default"
        }
    },
    dataVersion: 0
};
/**
 * Initialize the cache update system
 */
function initializeCacheSystem() {
    if (cacheUpdateInterval !== null)
        return; // Already initialized
    // Update scoreboard from cache every 3 seconds
    cacheUpdateInterval = system.runInterval(() => {
        flushCacheToScoreboard();
    }, 60); // 60 ticks = 3 seconds
}
/**
 * Get player's unique cache key
 */
function getPlayerCacheKey(player) {
    return `${player.name}_${CustomPlayer.getUniqueID(player)}`;
}
/**
 * Load player data from scoreboard into cache
 */
function loadPlayerDataToCache(player) {
    const cacheKey = getPlayerCacheKey(player);
    // Check if already in cache
    if (playerDataCache.has(cacheKey)) {
        return playerDataCache.get(cacheKey);
    }
    // Load from scoreboard
    let scoreboard = world.scoreboard.getObjective("mbl_ts_database");
    if (scoreboard == undefined) {
        world.scoreboard.addObjective("mbl_ts_database");
        scoreboard = world.scoreboard.getObjective("mbl_ts_database");
    }
    for (const user of scoreboard.getParticipants()) {
        try {
            const data = JSON.parse(user.displayName);
            if (data.user.name == player.name && data.user.uniqueID == CustomPlayer.getUniqueID(player)) {
                // Cache the data
                playerDataCache.set(cacheKey, data);
                return data;
            }
        }
        catch (error) {
            // Skip invalid data entries
            continue;
        }
    }
    // No existing data found, create new
    const newData = {
        user: {
            name: player.name,
            uniqueID: CustomPlayer.getUniqueID(player)
        },
        ...exampleData
    };
    // Cache the new data
    playerDataCache.set(cacheKey, newData);
    pendingUpdates.add(cacheKey);
    return newData;
}
/**
 * Mark player data as needing update in scoreboard
 */
function markPlayerForUpdate(player, data) {
    const cacheKey = getPlayerCacheKey(player);
    playerDataCache.set(cacheKey, data);
    pendingUpdates.add(cacheKey);
}
/**
 * Flush pending cache updates to scoreboard
 */
function flushCacheToScoreboard() {
    if (pendingUpdates.size === 0)
        return;
    let scoreboard = world.scoreboard.getObjective("mbl_ts_database");
    if (scoreboard == undefined) {
        world.scoreboard.addObjective("mbl_ts_database");
        scoreboard = world.scoreboard.getObjective("mbl_ts_database");
    }
    const processedUpdates = new Set();
    for (const cacheKey of pendingUpdates) {
        try {
            const data = playerDataCache.get(cacheKey);
            if (!data)
                continue;
            const newDataString = JSON.stringify(data);
            // Remove existing entry for this player
            for (const user of scoreboard.getParticipants()) {
                try {
                    const existingData = JSON.parse(user.displayName);
                    if (existingData.user.name === data.user.name && existingData.user.uniqueID === data.user.uniqueID) {
                        scoreboard.removeParticipant(user);
                        break;
                    }
                }
                catch (error) {
                    // Skip invalid entries
                    continue;
                }
            }
            // Add updated entry
            scoreboard.addScore(newDataString, 0);
            processedUpdates.add(cacheKey);
        }
        catch (error) {
        }
    }
    // Remove processed updates
    for (const processedKey of processedUpdates) {
        pendingUpdates.delete(processedKey);
    }
}
/**
 * Sleep tracking system functions
 */
function checkSleepEnergyRestore(player) {
    try {
        // Check cooldown first
        const lastSleepReward = player.getDynamicProperty("mbl_ts:last_sleep_reward");
        const currentTime = Date.now();
        // If on cooldown, don't give energy
        if (lastSleepReward !== undefined && (currentTime - lastSleepReward) < SLEEP_COOLDOWN_MS) {
            return;
        }
        const sleptAtNight = player.getDynamicProperty("mbl_ts:sleep_was_night");
        // If player is currently sleeping and they entered bed during night
        if (player.isSleeping && sleptAtNight === true) {
            // Player is sleeping during night - give energy and set cooldown
            const playerData = CustomPlayer.getData(player);
            const currentEnergy = playerData.attributes.energy.value;
            const newEnergy = Math.min(100, currentEnergy + ENERGY_RESTORE_AMOUNT);
            playerData.attributes.energy.value = newEnergy;
            CustomPlayer.setData(player, playerData);
            player.sendMessage(`§a§l[RESTED] §r§7You slept through the night and gained §e${ENERGY_RESTORE_AMOUNT} energy§7!`);
            // Set cooldown
            player.setDynamicProperty("mbl_ts:last_sleep_reward", currentTime);
            player.setDynamicProperty("mbl_ts:sleep_was_night", undefined);
        }
    }
    catch (error) {
        // Silently handle errors
    }
}
export class CustomPlayer {
    static getData(player) {
        // Initialize cache system if not done already
        initializeCacheSystem();
        // Load from cache (which loads from scoreboard if not cached)
        return loadPlayerDataToCache(player);
    }
    static setData(player, data) {
        // Initialize cache system if not done already
        initializeCacheSystem();
        // Update cache and mark for scoreboard update
        markPlayerForUpdate(player, data);
    }
    static getAttributes(player) {
        const data = this.getData(player);
        return data.attributes;
    }
    static setAttributes(player, attributes) {
        const data = this.getData(player);
        this.setData(player, {
            ...data,
            attributes: attributes
        });
    }
    static getUniqueID(player) {
        const id = player.getTags().find(x => x.startsWith("mbl_ts_ID_"));
        if (id != undefined)
            return id;
        const newId = generateID();
        player.addTag(`mbl_ts_ID_${newId}`);
        return newId;
    }
    static resetDatabase() {
        // Clear cache
        playerDataCache.clear();
        pendingUpdates.clear();
        // Clear scoreboard
        let scoreboard = world.scoreboard.getObjective("mbl_ts_database");
        if (scoreboard == undefined) {
            world.scoreboard.addObjective("mbl_ts_database");
            scoreboard = world.scoreboard.getObjective("mbl_ts_database");
        }
        for (const user of scoreboard.getParticipants()) {
            scoreboard.removeParticipant(user);
        }
        world.sendMessage("§7[CACHE] Database and cache cleared");
    }
}
/**
 * Manually flush cache to scoreboard (for debugging or immediate updates)
 */
export function flushPlayerCache() {
    flushCacheToScoreboard();
}
/**
 * Get cache statistics for debugging
 */
export function getCacheStats() {
    return {
        cachedPlayers: playerDataCache.size,
        pendingUpdates: pendingUpdates.size,
        cacheKeys: Array.from(playerDataCache.keys())
    };
}
export function playerPulseFast() {
    const players = world.getAllPlayers();
    for (const player of players) {
        clearBannedItems(player);
    }
}
export function playerPulse() {
    const players = world.getAllPlayers();
    for (const player of players) {
        //pings the collectables to see if they exist
        PlayerCollectables.checkAndAddInventoryCollectables(player);
        processFoodExpiry(player);
        giveGuideBook(player);
        // Check for sleep energy restoration
        checkSleepEnergyRestore(player);
        if (isWearingParachute(player)) {
            //if the player is wearing the parachute then give feather falling
            player.addEffect("slow_falling", 80, { amplifier: 255, showParticles: false }); // 4 seconds duration (80 ticks)
        }
        else {
            player.removeEffect("slow_falling");
        }
        const playerData = CustomPlayer.getData(player);
        const globalSettings = GameSettings.getAttributeSettings();
        // Get player stats actionbar
        const playerStatsActionbar = getActionbarLayout(playerData.attributes, globalSettings.actionbar.type);
        // Get vehicle stats actionbar if player is riding a vehicle
        const vehicleStatsActionbar = getActionBar(player);
        // Determine what to show based on settings and vehicle state
        let finalActionbar = "";
        if (vehicleStatsActionbar) {
            // Player is riding a vehicle - vehicle stats always show
            if (globalSettings.actionbar.trigger === "crouch") {
                // Crouch mode: only show player stats when crouching, but always show vehicle stats
                if (player.isSneaking) {
                    finalActionbar = `${playerStatsActionbar}\n${vehicleStatsActionbar}`;
                }
                else {
                    finalActionbar = vehicleStatsActionbar;
                }
            }
            else {
                // Default mode: always show both player and vehicle stats
                finalActionbar = `${playerStatsActionbar}\n${vehicleStatsActionbar}`;
            }
        }
        else {
            // Player is not riding a vehicle - use normal player stats logic
            if (globalSettings.actionbar.trigger === "crouch") {
                // Only show actionbar when crouching
                if (player.isSneaking) {
                    finalActionbar = playerStatsActionbar;
                }
                else {
                    finalActionbar = ""; // Clear actionbar when not crouching
                }
            }
            else {
                // Always show actionbar (default behavior)
                finalActionbar = playerStatsActionbar;
            }
        }
        player.onScreenDisplay.setActionBar(finalActionbar);
        //this updates the timers for the players attributes & gives effects if needed
        updateAttribuutes(player);
        if (player.hasTag("mbl_ts_godmode"))
            return; //if the player has godmode then do not update their attributes
        sendAttributeEffects(player);
    }
}
function updateAttribuutes(player) {
    const attributes = CustomPlayer.getAttributes(player);
    let needsUpdate = false;
    let updatedAttributes = { ...attributes };
    // Initialize timers if they are null (don't mutate original object)
    if (attributes.energy.time == null) {
        updatedAttributes.energy = {
            ...attributes.energy,
            time: Date.now() + ((30 + Math.floor(Math.random() * 15)) * 1000) //30-45 seconds
        };
        needsUpdate = true;
    }
    if (attributes.hydration.time == null) {
        updatedAttributes.hydration = {
            ...attributes.hydration,
            time: Date.now() + ((30 + Math.floor(Math.random() * 15)) * 1000) //30-45 seconds
        };
        needsUpdate = true;
    }
    // Use the potentially updated attributes for time checks
    const currentAttributes = needsUpdate ? updatedAttributes : attributes;
    //check if the time has passed for energy
    if (currentAttributes.energy.time != null && currentAttributes.energy.time < Date.now()) {
        updatedAttributes.energy = {
            value: Math.max(0, Math.min(100, currentAttributes.energy.value - 1)),
            time: Date.now() + ((30 + Math.floor(Math.random() * 15)) * 1000)
        };
        needsUpdate = true;
    }
    //check if the time has passed for hydration
    if (currentAttributes.hydration.time != null && currentAttributes.hydration.time < Date.now()) {
        updatedAttributes.hydration = {
            value: Math.max(0, Math.min(100, currentAttributes.hydration.value - 1)),
            time: Date.now() + ((30 + Math.floor(Math.random() * 15)) * 1000)
        };
        needsUpdate = true;
    }
    // Ensure toxicity is never automatically decremented - it should only change through items/actions
    // Toxicity has no timer and should remain at its current value
    updatedAttributes.toxicity = attributes.toxicity;
    // Only update if something actually changed
    if (needsUpdate) {
        CustomPlayer.setAttributes(player, updatedAttributes);
    }
}
function sendAttributeEffects(player) {
    const attributes = CustomPlayer.getAttributes(player);
    if (attributes.hydration.value <= 10) {
        player.addEffect("mining_fatigue", 20 * 5, { amplifier: 0 });
    }
    if (attributes.hydration.value <= 5) {
        player.addEffect("fatal_poison", 20 * 5, { amplifier: 0 });
    }
    if (attributes.toxicity >= 90) {
        player.addEffect("poison", 20 * 5, { amplifier: 0 });
    }
    if (attributes.energy.value <= 10) {
        player.addEffect("weakness", 20 * 5, { amplifier: 0 });
    }
}
const bannedItems = [
    "mbl_ts:vehicle_tyre_icon",
    "mbl_ts:vehicle_engine_icon",
    "mbl_ts:vehicle_upgrade_icon",
    "mbl_ts:vehicle_fuel_icon",
    "mbl_ts:vehicle_background_icon"
];
function clearBannedItems(player) {
    const curserInventory = player.getComponent(EntityComponentTypes.CursorInventory);
    if (curserInventory != undefined && curserInventory.item != undefined) {
        if (bannedItems.includes(curserInventory.item.typeId)) {
            curserInventory.clear();
        }
    }
    const inventory = player.getComponent(EntityComponentTypes.Inventory);
    if (inventory != undefined) {
        for (let i = 0; i < inventory.container.size; i++) {
            const item = inventory.container.getItem(i);
            if (item != undefined && bannedItems.includes(item.typeId)) {
                inventory.container.setItem(i, undefined);
            }
        }
    }
}
export function handleEntityDeath(event) {
    if (event.deadEntity instanceof Player) {
        GravestoneSystem.handlePlayerDeathEvent(event.deadEntity, event.deadEntity.location);
        // Reset leg injury system on death
        LegInjurySystem.resetPlayerInjurySystem(event.deadEntity);
        // Note: Collectables are NOT reset on death - they persist across deaths
        const playerData = CustomPlayer.getData(event.deadEntity);
        playerData.stats.deaths += 1;
        // Reset attributes to default values when player dies
        playerData.attributes = {
            hydration: {
                value: 100,
                time: null
            },
            energy: {
                value: 100,
                time: null
            },
            toxicity: 0
        };
        CustomPlayer.setData(event.deadEntity, playerData);
    }
    else if (event.damageSource.damagingEntity instanceof Player) {
        const killer = event.damageSource.damagingEntity;
        const playerData = CustomPlayer.getData(killer);
        const mobType = event.deadEntity.typeId;
        const existingKill = playerData.stats.kills.find(kill => kill.mob === mobType);
        if (existingKill) {
            existingKill.amount += 1;
        }
        else {
            playerData.stats.kills.push({ mob: mobType, amount: 1 });
        }
        CustomPlayer.setData(killer, playerData);
    }
}
export function giveGuideBook(player) {
    if (player.hasTag("mbl_ts_guidebook"))
        return;
    system.run(() => {
        player.runCommand(`give @s mbl_ts:guidebook`);
        player.addTag("mbl_ts_guidebook");
    });
}
function isWearingParachute(player) {
    //checks if the player is wearing the parachute in the chest armor slot
    const equippable = player.getComponent(EntityComponentTypes.Equippable);
    if (equippable != undefined) {
        const chestItem = equippable.getEquipment(EquipmentSlot.Mainhand);
        if (chestItem != undefined && chestItem.typeId === "mbl_ts:parachute") {
            return true;
        }
    }
    return false;
}
