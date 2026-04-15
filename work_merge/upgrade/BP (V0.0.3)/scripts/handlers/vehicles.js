import { ItemLockMode, ItemStack, world } from "@minecraft/server";
import { CustomPlayer } from "./customPlayer";
const VEHICLE_TYPES = ["mbl_ts:pickup_truck", "mbl_ts:sedan_car", "mbl_ts:bike_vehicle", "mbl_ts:bicycle"];
// Vehicle items for cars/trucks
const VEHICLE_ITEMS = {
    1: "mbl_ts:vehicle_tyre_icon",
    2: "mbl_ts:vehicle_engine_icon",
    3: "mbl_ts:vehicle_upgrade_icon",
    4: "mbl_ts:vehicle_upgrade_icon",
    7: "mbl_ts:vehicle_fuel_icon"
};
// Bicycle items (5-slot layout with 2 wheel slots)
const BICYCLE_ITEMS = {
    0: "mbl_ts:vehicle_background_icon", // Background
    1: "mbl_ts:vehicle_tyre_icon", // Tire icon
    4: "mbl_ts:vehicle_background_icon" // Background (removed slot 3 background)
};
const BACKGROUND_SLOTS = [0, 5, 6, 8, 9, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
const FREE_SLOTS = [10, 11, 12, 13, 16];
// Bicycle slots (2 wheel slots after tire icon)
const BICYCLE_BACKGROUND_SLOTS = [0, 4];
const BICYCLE_FREE_SLOTS = [2, 3]; // Slots 2 and 3 for front and back wheels
const PART_SLOTS = {
    TIRES: 10,
    ENGINE: 11,
    UPGRADE_1: 12,
    UPGRADE_2: 13,
    FUEL: 16
};
// Bicycle part slots (2 wheel slots)
const BICYCLE_PART_SLOTS = {
    FRONT_WHEEL: 2, // Front wheel at position 2
    BACK_WHEEL: 3 // Back wheel at position 3
};
const PART_TYPES = {
    TIRE: ["mbl_ts:tyre_part_1", "mbl_ts:tyre_part_2", "mbl_ts:tyre_part_3"],
    ENGINE: ["mbl_ts:engine_part_1", "mbl_ts:engine_part_2", "mbl_ts:engine_part_3"],
    FUEL: ["mbl_ts:fuel_item"],
    SPEED_UPGRADE: ["mbl_ts:speed_upgrade"],
    HEALTH_UPGRADE: ["mbl_ts:health_upgrade"],
    BICYCLE_WHEEL: ["mbl_ts:front_wheel", "mbl_ts:back_wheel"]
};
// Track players currently riding vehicles
const ridingPlayers = new Set();
// Track vehicle movement data
const vehicleTrackingMap = new Map();
// Track vehicle speed data (updates more frequently)
const vehicleSpeedMap = new Map();
// Track vehicle tilt interpolation data
const vehicleTiltMap = new Map();
// Track vehicle sound system data
const vehicleSoundMap = new Map();
// Vehicles that have sound systems (pickup truck and sedan)
const VEHICLES_WITH_SOUND = ["mbl_ts:pickup_truck", "mbl_ts:sedan_car"];
// Zombie types that can be knocked back by vehicles
const ZOMBIE_TYPES = [
    "minecraft:zombie",
    "mbl_ts:zombie_armless",
    "mbl_ts:zombie_bloater",
    "mbl_ts:zombie_small",
    "mbl_ts:zombie_crawler",
    "mbl_ts:zombie_human_survivor",
    "mbl_ts:zombie_walker"
];
// Blocks that should be ignored for vehicle tilting (flowers, ground cover, etc.)
const TILT_IGNORE_BLOCKS = [
    // Flowers and plants
    "minecraft:poppy",
    "minecraft:wildflowers",
    "minecraft:dandelion",
    "minecraft:blue_orchid",
    "minecraft:allium",
    "minecraft:azure_bluet",
    "minecraft:red_tulip",
    "minecraft:orange_tulip",
    "minecraft:white_tulip",
    "minecraft:pink_tulip",
    "minecraft:oxeye_daisy",
    "minecraft:cornflower",
    "minecraft:lily_of_the_valley",
    "minecraft:wither_rose",
    "minecraft:sunflower",
    "minecraft:lilac",
    "minecraft:rose_bush",
    "minecraft:peony",
    "minecraft:tall_grass",
    "minecraft:large_fern",
    "minecraft:grass",
    "minecraft:fern",
    "minecraft:dead_bush",
    "minecraft:seagrass",
    "minecraft:tall_seagrass",
    "minecraft:pink_petals",
    "minecraft:short_grass",
    "minecraft:tall_grass",
    "minecraft:short_dry_grass",
    "minecraft:tall_dry_grass",
    // Ground cover and small items
    "minecraft:snow_layer", // Already handled specially in the code
    "minecraft:carpet",
    "minecraft:white_carpet",
    "minecraft:orange_carpet",
    "minecraft:magenta_carpet",
    "minecraft:light_blue_carpet",
    "minecraft:yellow_carpet",
    "minecraft:lime_carpet",
    "minecraft:pink_carpet",
    "minecraft:gray_carpet",
    "minecraft:light_gray_carpet",
    "minecraft:cyan_carpet",
    "minecraft:purple_carpet",
    "minecraft:blue_carpet",
    "minecraft:brown_carpet",
    "minecraft:green_carpet",
    "minecraft:red_carpet",
    "minecraft:black_carpet",
    // Mushrooms and fungi
    "minecraft:red_mushroom",
    "minecraft:brown_mushroom",
    "minecraft:crimson_fungus",
    "minecraft:warped_fungus",
    "minecraft:red_mushroom_block",
    "minecraft:brown_mushroom_block",
    "minecraft:mushroom_stem",
    "minecraft:crimson_stem",
    "minecraft:warped_stem",
    "minecraft:stripped_crimson_stem",
    "minecraft:stripped_warped_stem",
    "minecraft:crimson_hyphae",
    "minecraft:warped_hyphae",
    "minecraft:stripped_crimson_hyphae",
    "minecraft:stripped_warped_hyphae",
    // Saplings
    "minecraft:oak_sapling",
    "minecraft:spruce_sapling",
    "minecraft:birch_sapling",
    "minecraft:jungle_sapling",
    "minecraft:acacia_sapling",
    "minecraft:dark_oak_sapling",
    "minecraft:mangrove_propagule",
    "minecraft:cherry_sapling",
    "minecraft:bamboo_sapling",
    // Small decorative blocks
    "minecraft:torch",
    "minecraft:soul_torch",
    "minecraft:redstone_torch",
    "minecraft:flower_pot",
    "minecraft:potted_oak_sapling",
    "minecraft:potted_spruce_sapling",
    "minecraft:potted_birch_sapling",
    "minecraft:potted_jungle_sapling",
    "minecraft:potted_acacia_sapling",
    "minecraft:potted_dark_oak_sapling",
    "minecraft:potted_fern",
    "minecraft:potted_dandelion",
    "minecraft:potted_poppy",
    "minecraft:potted_blue_orchid",
    "minecraft:potted_allium",
    "minecraft:potted_azure_bluet",
    "minecraft:potted_red_tulip",
    "minecraft:potted_orange_tulip",
    "minecraft:potted_white_tulip",
    "minecraft:potted_pink_tulip",
    "minecraft:potted_oxeye_daisy",
    "minecraft:potted_cornflower",
    "minecraft:potted_lily_of_the_valley",
    "minecraft:potted_wither_rose",
    "minecraft:potted_red_mushroom",
    "minecraft:potted_brown_mushroom",
    "minecraft:potted_dead_bush",
    "minecraft:potted_cactus",
    "minecraft:potted_bamboo",
    "minecraft:potted_crimson_fungus",
    "minecraft:potted_warped_fungus",
    "minecraft:potted_crimson_roots",
    "minecraft:potted_warped_roots",
    // Other small items that shouldn't affect tilting
    "minecraft:lever",
    "minecraft:stone_button",
    "minecraft:oak_button",
    "minecraft:spruce_button",
    "minecraft:birch_button",
    "minecraft:jungle_button",
    "minecraft:acacia_button",
    "minecraft:dark_oak_button",
    "minecraft:mangrove_button",
    "minecraft:cherry_button",
    "minecraft:bamboo_button",
    "minecraft:crimson_button",
    "minecraft:warped_button",
    "minecraft:polished_blackstone_button",
    "minecraft:stone_pressure_plate",
    "minecraft:oak_pressure_plate",
    "minecraft:spruce_pressure_plate",
    "minecraft:birch_pressure_plate",
    "minecraft:jungle_pressure_plate",
    "minecraft:acacia_pressure_plate",
    "minecraft:dark_oak_pressure_plate",
    "minecraft:mangrove_pressure_plate",
    "minecraft:cherry_pressure_plate",
    "minecraft:bamboo_pressure_plate",
    "minecraft:crimson_pressure_plate",
    "minecraft:warped_pressure_plate",
    "minecraft:light_weighted_pressure_plate",
    "minecraft:heavy_weighted_pressure_plate",
    "minecraft:polished_blackstone_pressure_plate",
    // Signs and item frames
    "minecraft:oak_sign",
    "minecraft:spruce_sign",
    "minecraft:birch_sign",
    "minecraft:jungle_sign",
    "minecraft:acacia_sign",
    "minecraft:dark_oak_sign",
    "minecraft:mangrove_sign",
    "minecraft:cherry_sign",
    "minecraft:bamboo_sign",
    "minecraft:crimson_sign",
    "minecraft:warped_sign",
    "minecraft:oak_wall_sign",
    "minecraft:spruce_wall_sign",
    "minecraft:birch_wall_sign",
    "minecraft:jungle_wall_sign",
    "minecraft:acacia_wall_sign",
    "minecraft:dark_oak_wall_sign",
    "minecraft:mangrove_wall_sign",
    "minecraft:cherry_wall_sign",
    "minecraft:bamboo_wall_sign",
    "minecraft:crimson_wall_sign",
    "minecraft:warped_wall_sign",
    "minecraft:item_frame",
    "minecraft:glow_item_frame",
    // Crops and farming
    "minecraft:wheat",
    "minecraft:carrots",
    "minecraft:potatoes",
    "minecraft:beetroots",
    "minecraft:sweet_berry_bush",
    "minecraft:cocoa",
    "minecraft:pumpkin_stem",
    "minecraft:attached_pumpkin_stem",
    "minecraft:melon_stem",
    "minecraft:attached_melon_stem",
    "minecraft:nether_wart",
    // Water plants
    "minecraft:kelp",
    "minecraft:kelp_plant",
    "minecraft:sea_pickle",
    // Nether/End plants
    "minecraft:nether_sprouts",
    "minecraft:crimson_roots",
    "minecraft:warped_roots",
    "minecraft:chorus_flower",
    "minecraft:chorus_plant"
];
// Dynamic property key for tracking vehicle riding state
const VEHICLE_RIDING_PROPERTY = "mbl_ts:was_riding_vehicle";
/**
 * Check if the rider of a bicycle has enough energy to power it
 * @param entity The bicycle entity
 * @returns true if rider has energy > 0, false otherwise
 */
function checkBicycleRiderEnergy(entity) {
    try {
        const riders = entity.getComponent("minecraft:rideable");
        if (!riders || riders.getRiders().length === 0) {
            return false;
        }
        const rider = riders.getRiders()[0];
        if (rider.typeId !== "minecraft:player") {
            return false;
        }
        const player = rider;
        const playerData = CustomPlayer.getAttributes(player);
        return playerData.energy.value > 0;
    }
    catch {
        return false;
    }
}
/**
 * Gets the action bar string for a player riding a vehicle
 * @param player The player to check
 * @returns The action bar string if player is riding a vehicle, empty string otherwise
 */
export function getActionBar(player) {
    try {
        // Get the entity the player is riding
        const ridingEntity = player.getComponent("minecraft:riding")?.entityRidingOn;
        // Check if the entity is a vehicle
        if (!ridingEntity || !VEHICLE_TYPES.includes(ridingEntity.typeId)) {
            return "";
        }
        const entity = ridingEntity;
        const inventory = entity.getComponent("inventory")?.container;
        if (!inventory)
            return "";
        // Calculate speed based on position changes
        const currentPosition = entity.location;
        const currentTime = Date.now();
        let speed = 0;
        let speedData = vehicleSpeedMap.get(entity.id);
        if (!speedData) {
            // First time tracking speed for this vehicle
            speedData = {
                lastX: currentPosition.x,
                lastZ: currentPosition.z,
                lastCheckTime: currentTime,
                currentSpeed: 0,
                lastSpeedUpdate: currentTime
            };
            vehicleSpeedMap.set(entity.id, speedData);
            speed = 0;
        }
        else {
            // Check if we should calculate new speed (every 0.5 seconds)
            const timeSinceLastUpdate = (currentTime - speedData.lastSpeedUpdate) / 1000;
            if (timeSinceLastUpdate >= 0.5) {
                // Calculate distance moved since last speed update
                const distance = Math.sqrt(Math.pow(currentPosition.x - speedData.lastX, 2) +
                    Math.pow(currentPosition.z - speedData.lastZ, 2));
                // Calculate new speed
                const newSpeed = Math.round((distance / timeSinceLastUpdate) * 10) / 10;
                // Update tracking data for next calculation
                speedData.lastX = currentPosition.x;
                speedData.lastZ = currentPosition.z;
                speedData.lastSpeedUpdate = currentTime;
                speedData.currentSpeed = newSpeed;
                vehicleSpeedMap.set(entity.id, speedData);
                speed = newSpeed;
            }
            else {
                // Use the last calculated speed (keeps speed visible longer)
                speed = speedData.currentSpeed;
            }
        }
        // Get health info
        const healthComponent = entity.getComponent("minecraft:health");
        let currentHealth = 0;
        let maxHealth = 0;
        if (healthComponent) {
            currentHealth = Math.round(healthComponent.currentValue);
            maxHealth = Math.round(healthComponent.effectiveMax);
        }
        // Get durability info for all parts
        let statusInfo = "";
        // Speed info
        statusInfo += `§bSpeed: ${speed} b/s §8| `;
        // Health info
        if (healthComponent) {
            statusInfo += `§aHealth: ${currentHealth}/${maxHealth} §8| `;
        }
        // Energy/Fuel info
        if (entity.typeId === "mbl_ts:bicycle") {
            // For bicycles, show rider's energy
            const riders = entity.getComponent("minecraft:rideable");
            if (riders && riders.getRiders().length > 0) {
                const rider = riders.getRiders()[0];
                if (rider.typeId === "minecraft:player") {
                    const player = rider;
                    const playerData = CustomPlayer.getAttributes(player);
                    statusInfo += `§dEnergy: ${playerData.energy.value}%`;
                }
                else {
                    statusInfo += "§cEnergy: N/A";
                }
            }
            else {
                statusInfo += "§cEnergy: N/A";
            }
        }
        else {
            // Original fuel info for cars, trucks, and motorbikes
            const fuelItem = inventory.getItem(PART_SLOTS.FUEL);
            if (fuelItem && fuelItem.getComponent("minecraft:durability")) {
                const durability = fuelItem.getComponent("minecraft:durability");
                if (durability) {
                    const percentage = Math.floor(((durability.maxDurability - durability.damage) / durability.maxDurability) * 100);
                    statusInfo += `§eFuel: ${percentage}%`;
                }
            }
            else {
                statusInfo += "§cFuel: 0%";
            }
        }
        return statusInfo;
    }
    catch {
        return "";
    }
}
export function getVehicles() {
    return world.getDimension("overworld").getEntities().filter(e => VEHICLE_TYPES.includes(e.typeId));
}
// Legacy function name for backwards compatibility
function getPickupTrucks() {
    return getVehicles();
}
export function openPickupMenu(player, entity) {
    initializeVehicleInventory(entity);
    processVehicleParts(entity);
    const wheelType = entity.getProperty("mbl_ts:wheel_type") ?? 0;
    if (entity.typeId === "mbl_ts:bicycle") {
        // Simplified status for bicycles
        const hasWheels = entity.getProperty("mbl_ts:has_wheels") ?? false;
        const hasEnergy = entity.getProperty("mbl_ts:has_energy") ?? false;
        player.sendMessage(`§6=== Bicycle Status ===`);
        player.sendMessage(`§7Has Wheels: §e${hasWheels ? "Yes" : "No"}`);
        player.sendMessage(`§7Has Energy: §e${hasEnergy ? "Yes" : "No"}`);
        player.sendMessage(`§7§oPlace tires in the bicycle inventory and make sure you have energy!`);
    }
    else {
        // Original status for cars, trucks, and motorbikes
        const engineType = entity.getProperty("mbl_ts:engine_type") ?? 0;
        const hasFuel = entity.getProperty("mbl_ts:has_fuel") ?? false;
        player.sendMessage(`§6=== Vehicle Status ===`);
        player.sendMessage(`§7Wheel Type: §e${wheelType === 0 ? "None" : wheelType}`);
        player.sendMessage(`§7Engine Type: §e${engineType === 0 ? "None" : engineType}`);
        player.sendMessage(`§7Has Fuel: §e${hasFuel ? "Yes" : "No"}`);
        player.sendMessage(`§7§oPlace parts in the vehicle inventory to upgrade it!`);
    }
}
export function processVehicleParts(entity) {
    const inventory = entity.getComponent("inventory")?.container;
    if (!inventory)
        return;
    let wheelType = 0;
    let engineType = 0;
    let hasFuel = false;
    let hasSpeedUpgrade = false;
    let hasHealthUpgrade = false;
    let hasEnergy = false; // For bicycles
    // Handle new bicycles differently
    if (entity.typeId === "mbl_ts:bicycle") {
        // For bicycles, check both wheel slots for either wheel type - no engine, fuel, or upgrades
        const slot2Item = inventory.getItem(BICYCLE_PART_SLOTS.FRONT_WHEEL);
        const slot3Item = inventory.getItem(BICYCLE_PART_SLOTS.BACK_WHEEL);
        // Check what wheel types are present in either slot
        let hasFrontWheelType = false;
        let hasBackWheelType = false;
        // Check slot 2
        if (slot2Item) {
            if (slot2Item.typeId === "mbl_ts:front_wheel")
                hasFrontWheelType = true;
            if (slot2Item.typeId === "mbl_ts:back_wheel")
                hasBackWheelType = true;
        }
        // Check slot 3
        if (slot3Item) {
            if (slot3Item.typeId === "mbl_ts:front_wheel")
                hasFrontWheelType = true;
            if (slot3Item.typeId === "mbl_ts:back_wheel")
                hasBackWheelType = true;
        }
        // Bicycle has wheels only if both wheel types are present (regardless of slot)
        wheelType = (hasFrontWheelType && hasBackWheelType) ? 1 : 0;
        // For bicycles, check if player has energy
        hasEnergy = checkBicycleRiderEnergy(entity);
    }
    else {
        // For cars, trucks, and motorbikes, use original logic
        const tiresItem = inventory.getItem(PART_SLOTS.TIRES);
        // Motorbikes need 2 tires, cars need 4 tires
        const requiredTires = entity.typeId === "mbl_ts:bike_vehicle" ? 2 : 4;
        if (tiresItem && tiresItem.amount >= requiredTires) {
            const tireTypeIndex = PART_TYPES.TIRE.findIndex(tire => tire === tiresItem.typeId);
            if (tireTypeIndex !== -1) {
                wheelType = tireTypeIndex + 1;
            }
        }
    }
    // Only check engine and fuel for non-bicycle vehicles
    if (entity.typeId !== "mbl_ts:bicycle") {
        const engineItem = inventory.getItem(PART_SLOTS.ENGINE);
        if (engineItem) {
            const engineTypeIndex = PART_TYPES.ENGINE.findIndex(engine => engine === engineItem.typeId);
            if (engineTypeIndex !== -1) {
                engineType = engineTypeIndex + 1;
            }
        }
        const fuelItem = inventory.getItem(PART_SLOTS.FUEL);
        if (fuelItem && PART_TYPES.FUEL.includes(fuelItem.typeId)) {
            hasFuel = true;
        }
    }
    // Only check upgrades for non-bicycle vehicles
    if (entity.typeId !== "mbl_ts:bicycle") {
        // Check upgrade slots (12 and 13) for speed and health upgrades
        const upgrade1Item = inventory.getItem(PART_SLOTS.UPGRADE_1);
        const upgrade2Item = inventory.getItem(PART_SLOTS.UPGRADE_2);
        // Check both upgrade slots for speed and health upgrades (no duplicates allowed)
        [upgrade1Item, upgrade2Item].forEach(upgradeItem => {
            if (upgradeItem) {
                if (PART_TYPES.SPEED_UPGRADE.includes(upgradeItem.typeId) && !hasSpeedUpgrade) {
                    hasSpeedUpgrade = true;
                }
                else if (PART_TYPES.HEALTH_UPGRADE.includes(upgradeItem.typeId) && !hasHealthUpgrade) {
                    hasHealthUpgrade = true;
                }
            }
        });
        // Apply speed upgrade effect
        if (hasSpeedUpgrade) {
            try {
                // Apply speed effect directly to entity with higher amplifier (level 4 = amplifier 3)
                entity.addEffect("speed", 999999, {
                    amplifier: 3, // Level 4 speed for better effect
                    showParticles: false
                });
            }
            catch { }
        }
        else {
            try {
                // Remove speed effect directly from entity
                entity.removeEffect("speed");
            }
            catch { }
        }
    }
    // Set properties based on vehicle type
    if (entity.typeId === "mbl_ts:bicycle") {
        // Bicycles only have has_wheels and has_energy properties
        const hasWheels = wheelType > 0;
        entity.setProperty("mbl_ts:has_wheels", hasWheels);
        entity.setProperty("mbl_ts:has_energy", hasEnergy);
    }
    else {
        // Other vehicles have all the standard properties  
        entity.setProperty("mbl_ts:wheel_type", wheelType);
        entity.setProperty("mbl_ts:engine_type", engineType);
        entity.setProperty("mbl_ts:has_fuel", hasFuel);
        entity.setProperty("mbl_ts:health_upgrade", hasHealthUpgrade);
    }
}
export function handleVehicleMovement(entity) {
    const inventory = entity.getComponent("inventory")?.container;
    if (!inventory)
        return;
    // Check if someone is riding the vehicle
    const riders = entity.getComponent("minecraft:rideable");
    const hasRider = riders && riders.getRiders().length > 0;
    if (!hasRider) {
        // No one riding, clean up tracking data and return
        vehicleTrackingMap.delete(entity.id);
        vehicleSpeedMap.delete(entity.id);
        vehicleTiltMap.delete(entity.id);
        // Clean up sound data for vehicles with sound systems
        if (VEHICLES_WITH_SOUND.includes(entity.typeId)) {
            vehicleSoundMap.delete(entity.id);
        }
        return;
    }
    // Get or create tracking data for this vehicle
    const currentPosition = entity.location;
    const currentTime = Date.now();
    let trackingData = vehicleTrackingMap.get(entity.id);
    if (!trackingData) {
        // First time tracking this vehicle
        trackingData = {
            lastX: currentPosition.x,
            lastZ: currentPosition.z,
            lastCheckTime: currentTime,
            isMoving: false,
            fuelTick: 0
        };
        vehicleTrackingMap.set(entity.id, trackingData);
        return; // Skip first tick to establish baseline
    }
    // Calculate distance moved since last check
    const distance = Math.sqrt(Math.pow(currentPosition.x - trackingData.lastX, 2) +
        Math.pow(currentPosition.z - trackingData.lastZ, 2));
    // Time since last check (in seconds)
    const timeDelta = (currentTime - trackingData.lastCheckTime) / 1000;
    // Determine if vehicle is moving (moved more than 0.1 blocks)
    const isMoving = distance > 0.1;
    // Update tracking data
    trackingData.lastX = currentPosition.x;
    trackingData.lastZ = currentPosition.z;
    trackingData.lastCheckTime = currentTime;
    trackingData.isMoving = isMoving;
    if (isMoving) {
        // Vehicle is moving - consume fuel/energy and potentially degrade parts
        if (entity.typeId === "mbl_ts:bicycle") {
            // Bicycle energy consumption - drain rider's energy
            if (Math.random() < 0.15) { // 15% chance to consume energy per movement tick
                const rider = riders?.getRiders()[0];
                if (rider && rider.typeId === "minecraft:player") {
                    const player = rider;
                    const playerData = CustomPlayer.getAttributes(player);
                    if (playerData.energy.value > 0) {
                        // Consume 1 energy point
                        CustomPlayer.setAttributes(player, {
                            ...playerData,
                            energy: {
                                value: Math.max(0, playerData.energy.value - 1),
                                time: playerData.energy.time
                            }
                        });
                    }
                }
            }
        }
        else {
            // Original fuel consumption for cars, trucks, and motorbikes
            // Get engine type to determine fuel consumption rate
            const engineType = entity.getProperty("mbl_ts:engine_type") ?? 0;
            // Calculate fuel consumption chance based on engine type
            // Engine 0: 35%, Engine 1: 40%, Engine 2: 50%, Engine 3: 60%
            let fuelConsumptionChance = 0.35; // 35% base chance (no engine)
            if (engineType === 1) {
                fuelConsumptionChance = 0.40; // 40% for engine type 1
            }
            else if (engineType === 2) {
                fuelConsumptionChance = 0.50; // 50% for engine type 2
            }
            else if (engineType === 3) {
                fuelConsumptionChance = 0.60; // 60% for engine type 3
            }
            // Fuel consumption - varies by engine type
            if (Math.random() < fuelConsumptionChance) {
                const fuelItem = inventory.getItem(PART_SLOTS.FUEL);
                if (fuelItem && fuelItem.getComponent("minecraft:durability")) {
                    const durability = fuelItem.getComponent("minecraft:durability");
                    if (durability && durability.damage < durability.maxDurability - 1) {
                        durability.damage += 1;
                        try {
                            inventory.setItem(PART_SLOTS.FUEL, fuelItem);
                        }
                        catch {
                            // If setting fails, remove the item
                            inventory.setItem(PART_SLOTS.FUEL, undefined);
                        }
                    }
                    else if (durability) {
                        // Fuel is used up, remove it
                        inventory.setItem(PART_SLOTS.FUEL, undefined);
                    }
                }
            }
        }
        // Parts degradation - different for bicycles vs other vehicles  
        if (entity.typeId === "mbl_ts:bicycle") {
            // Bicycles have wheel degradation in both slots (regardless of wheel type)
            [BICYCLE_PART_SLOTS.FRONT_WHEEL, BICYCLE_PART_SLOTS.BACK_WHEEL].forEach(slot => {
                if (Math.random() < 1 / 15) { // 1/15 chance for wheel degradation
                    const wheelItem = inventory.getItem(slot);
                    // Check if it's any bicycle wheel type
                    if (wheelItem && (wheelItem.typeId === "mbl_ts:front_wheel" || wheelItem.typeId === "mbl_ts:back_wheel") && wheelItem.getComponent("minecraft:durability")) {
                        const durability = wheelItem.getComponent("minecraft:durability");
                        if (durability && durability.damage < durability.maxDurability - 1) {
                            durability.damage += 1;
                            try {
                                inventory.setItem(slot, wheelItem);
                            }
                            catch {
                                // If setting fails, remove the item
                                inventory.setItem(slot, undefined);
                            }
                        }
                        else if (durability) {
                            // Wheel is broken, remove it
                            inventory.setItem(slot, undefined);
                        }
                    }
                }
            });
        }
        else {
            // Original parts degradation for cars, trucks, and motorbikes
            [PART_SLOTS.TIRES, PART_SLOTS.ENGINE, PART_SLOTS.UPGRADE_1, PART_SLOTS.UPGRADE_2].forEach(slot => {
                // Set different degradation chances: Tires 1/15, Engine 1/20, Speed Upgrades 1/15
                let degradationChance;
                if (slot === PART_SLOTS.TIRES) {
                    degradationChance = 1 / 15; // Tires degrade more often
                }
                else if (slot === PART_SLOTS.ENGINE) {
                    degradationChance = 1 / 20; // Engine degrades less often
                }
                else {
                    // For upgrade slots, only damage speed upgrades during movement
                    const partItem = inventory.getItem(slot);
                    if (!partItem || !PART_TYPES.SPEED_UPGRADE.includes(partItem.typeId)) {
                        return; // Skip if not a speed upgrade (health upgrades only take damage when vehicle is hurt)
                    }
                    degradationChance = 1 / 15; // Speed upgrades degrade like tires
                }
                if (Math.random() < degradationChance) {
                    const partItem = inventory.getItem(slot);
                    if (partItem && partItem.getComponent("minecraft:durability")) {
                        const durability = partItem.getComponent("minecraft:durability");
                        let partName = "Part";
                        // Determine part name for logging/debugging
                        if (slot === PART_SLOTS.TIRES)
                            partName = "Tires";
                        else if (slot === PART_SLOTS.ENGINE)
                            partName = "Engine";
                        else if (PART_TYPES.SPEED_UPGRADE.includes(partItem.typeId)) {
                            partName = "Speed Upgrade";
                        }
                        if (durability && durability.damage < durability.maxDurability - 1) {
                            durability.damage += 1;
                            try {
                                inventory.setItem(slot, partItem);
                            }
                            catch {
                                // If setting fails, remove the item
                                inventory.setItem(slot, undefined);
                            }
                        }
                        else if (durability) {
                            // Part is broken, remove it
                            inventory.setItem(slot, undefined);
                        }
                    }
                }
            });
        }
        // Force update parts after movement to reflect durability changes
        processVehicleParts(entity);
        // Update part display names with durability info
        updateVehiclePartDisplayNames(entity);
    }
    // Handle sound system for vehicles with sound systems (pickup truck and sedan)
    if (VEHICLES_WITH_SOUND.includes(entity.typeId)) {
        handleVehicleSoundSystem(entity, isMoving);
    }
    // Handle zombie knockback when vehicle is moving
    if (isMoving) {
        handleVehicleZombieKnockback(entity);
    }
    // Show durability action bar to riders (always when someone is riding)
    showDurabilityActionBar(entity);
}
/**
 * Handles the sound system for vehicles with sound systems (pickup truck and sedan)
 * Plays car loop sound with gradually changing pitch based on speed
 * @param entity The vehicle entity
 * @param isMoving Whether the vehicle is currently moving
 */
function handleVehicleSoundSystem(entity, isMoving) {
    const currentTime = Date.now();
    // Check if vehicle has all required parts (engine, tires, and fuel)
    const inventory = entity.getComponent("inventory")?.container;
    if (!inventory)
        return;
    const hasEngine = inventory.getItem(PART_SLOTS.ENGINE) !== undefined;
    const hasTires = inventory.getItem(PART_SLOTS.TIRES) !== undefined;
    const hasFuel = inventory.getItem(PART_SLOTS.FUEL) !== undefined;
    // Only play sound if vehicle has all essential parts
    if (!hasEngine || !hasTires || !hasFuel) {
        // Clean up sound data if vehicle doesn't have required parts
        vehicleSoundMap.delete(entity.id);
        return;
    }
    // Get or create sound data for this vehicle
    let soundData = vehicleSoundMap.get(entity.id);
    if (!soundData) {
        soundData = {
            isPlaying: false,
            lastSoundTime: 0,
            currentPitch: 0.5,
            targetPitch: 0.5,
            lastPitchUpdate: currentTime
        };
        vehicleSoundMap.set(entity.id, soundData);
    }
    // Calculate current speed for pitch adjustment
    let currentSpeed = 0;
    const speedData = vehicleSpeedMap.get(entity.id);
    if (speedData) {
        currentSpeed = speedData.currentSpeed;
    }
    // Calculate target pitch based on speed
    // Similar to the reference animation: starts at 0.5, increases gradually
    // Speed levels 0-19 map to pitch 0.5-1.2 (like the reference)
    const maxSpeed = 8; // Adjust this based on your vehicle's max speed
    const speedLevel = Math.min(19, Math.floor((currentSpeed / maxSpeed) * 19));
    const newTargetPitch = Math.max(0.5, Math.min(1.2, 0.5 + (speedLevel * 0.0368421052631579)));
    // Update target pitch if it changed
    if (Math.abs(newTargetPitch - soundData.targetPitch) > 0.01) {
        soundData.targetPitch = newTargetPitch;
        soundData.lastPitchUpdate = currentTime;
    }
    // Gradually interpolate current pitch towards target pitch
    const pitchUpdateInterval = 50; // Update pitch every 50ms
    if (currentTime - soundData.lastPitchUpdate >= pitchUpdateInterval) {
        const pitchDifference = soundData.targetPitch - soundData.currentPitch;
        const pitchChangeRate = 0.05; // How fast pitch changes (smaller = smoother)
        if (Math.abs(pitchDifference) > 0.01) {
            soundData.currentPitch += pitchDifference * pitchChangeRate;
            soundData.currentPitch = Math.max(0.5, Math.min(1.2, soundData.currentPitch));
        }
        else {
            soundData.currentPitch = soundData.targetPitch;
        }
        soundData.lastPitchUpdate = currentTime;
    }
    // Play sound with variable interval based on pitch (like reference animation)
    // Higher pitch = shorter intervals for more realistic engine sound
    const baseSoundInterval = 200; // Base interval in ms
    const pitchFactor = (soundData.currentPitch - 0.5) / 0.7; // Normalize pitch to 0-1
    const soundInterval = Math.max(80, baseSoundInterval - (pitchFactor * 120)); // 200ms down to 80ms
    const timeSinceLastSound = currentTime - soundData.lastSoundTime;
    if (timeSinceLastSound >= soundInterval) {
        try {
            // Get all players within 8 blocks of the vehicle
            const vehicleLocation = entity.location;
            const nearbyPlayers = entity.dimension.getPlayers({
                location: vehicleLocation,
                maxDistance: 8
            });
            // Play sound near each player within radius
            for (const player of nearbyPlayers) {
                try {
                    player.playSound("mbl.ts_car_loop", {
                        pitch: soundData.currentPitch,
                        volume: 1.0
                    });
                }
                catch (playerSoundError) {
                    // Handle individual player sound errors silently
                }
            }
            soundData.lastSoundTime = currentTime;
            soundData.isPlaying = true;
        }
        catch (error) {
            // Handle any errors silently
        }
    }
    // Update the sound data in the map
    vehicleSoundMap.set(entity.id, soundData);
}
/**
 * Handles zombie knockback when a moving vehicle hits them
 * @param entity The vehicle entity
 */
export function handleVehicleZombieKnockback(entity) {
    // Get vehicle speed
    const speedData = vehicleSpeedMap.get(entity.id);
    if (!speedData || speedData.currentSpeed <= 0) {
        // Vehicle is not moving, no knockback
        return;
    }
    const vehicleSpeed = speedData.currentSpeed;
    const vehicleLocation = entity.location;
    const vehicleVelocity = entity.getVelocity();
    // Calculate vehicle's movement direction (normalized)
    const velMagnitude = Math.sqrt(vehicleVelocity.x ** 2 + vehicleVelocity.z ** 2);
    if (velMagnitude < 0.01)
        return; // Not moving horizontally
    const vehicleDirX = vehicleVelocity.x / velMagnitude;
    const vehicleDirZ = vehicleVelocity.z / velMagnitude;
    // Calculate detection radius based on vehicle type (larger vehicles = larger radius)
    let detectionRadius = 2.5;
    if (entity.typeId === "mbl_ts:pickup_truck" || entity.typeId === "mbl_ts:sedan_car") {
        detectionRadius = 3.0; // Larger vehicles have bigger hitbox
    }
    else if (entity.typeId === "mbl_ts:bicycle") {
        detectionRadius = 2.0; // Smaller radius for bicycle
    }
    // Find nearby zombies
    const nearbyEntities = entity.dimension.getEntities({
        location: vehicleLocation,
        maxDistance: detectionRadius,
        excludeTypes: ["minecraft:player"]
    });
    // Filter for zombies only
    const nearbyZombies = nearbyEntities.filter(e => ZOMBIE_TYPES.includes(e.typeId));
    for (const zombie of nearbyZombies) {
        try {
            const zombieLocation = zombie.location;
            // Calculate vector from vehicle to zombie
            const dx = zombieLocation.x - vehicleLocation.x;
            const dz = zombieLocation.z - vehicleLocation.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            if (distance > 0) {
                // Normalize direction to zombie
                const dirX = dx / distance;
                const dirZ = dz / distance;
                // Calculate dot product to check if zombie is in front of vehicle
                // Dot product > 0 means zombie is in front (in the direction of movement)
                const dotProduct = (vehicleDirX * dirX) + (vehicleDirZ * dirZ);
                // Only knockback zombies in front (dot product > 0.3 for a ~70° cone in front)
                if (dotProduct <= 0.3) {
                    continue; // Zombie is not in front, skip it
                }
                // Calculate knockback strength based on vehicle speed
                // Minimum 3 blocks, scales with speed
                const minKnockback = 3.0;
                const speedMultiplier = 0.5;
                const knockbackStrength = minKnockback + (vehicleSpeed * speedMultiplier);
                // More horizontal knockback - reduced upward force
                const horizontalForce = knockbackStrength * 0.2; // Increased horizontal multiplier
                const upwardForce = 0.15 + (vehicleSpeed * 0.02); // Much reduced upward component
                // Apply impulse to knock zombie back
                try {
                    zombie.applyImpulse({
                        x: dirX * horizontalForce,
                        y: upwardForce,
                        z: dirZ * horizontalForce
                    });
                }
                catch (error) {
                    // If applyImpulse fails, try setting velocity directly
                    try {
                        const currentVel = zombie.getVelocity();
                        zombie.clearVelocity();
                        zombie.applyImpulse({
                            x: dirX * horizontalForce,
                            y: upwardForce,
                            z: dirZ * horizontalForce
                        });
                    }
                    catch { }
                }
                // Apply damage based on vehicle speed
                const damage = Math.floor(vehicleSpeed * 0.5); // 0.5 damage per b/s
                if (damage > 0) {
                    zombie.applyDamage(damage);
                }
            }
        }
        catch (error) {
            // Silently handle errors (zombie might be invalid or removed)
        }
    }
}
function showDurabilityActionBar(entity) {
    // Action bar is now handled by the custom player system in customPlayer.ts
    // This function is kept for compatibility but no longer displays anything
}
export function checkVehicleInventories() {
    getPickupTrucks().forEach(entity => {
        initializeVehicleInventory(entity);
        processVehicleParts(entity);
    });
}
export function resetAllVehicleTilts() {
    getPickupTrucks().forEach(entity => {
        try {
            entity.setProperty("mbl_ts:positive_car_tilt", 0);
            entity.setProperty("mbl_ts:negative_car_tilt", 0);
        }
        catch { }
    });
}
function updatePartDisplayName(item, partName) {
    const durability = item.getComponent("minecraft:durability");
    if (durability) {
        const current = durability.maxDurability - durability.damage;
        const max = durability.maxDurability;
        // Show "Remaining Gas" for fuel, "Durability" for other parts
        if (partName === "Fuel") {
            item.setLore([`§7Remaining Gas: §e${current}/${max}`]);
        }
        else {
            item.setLore([`§7Durability: §e${current}/${max}`]);
        }
    }
    else {
        if (partName === "Fuel") {
            item.setLore([`§7Remaining Gas: §cN/A`]);
        }
        else {
            item.setLore([`§7Durability: §cN/A`]);
        }
    }
    return item;
}
function updateVehiclePartDisplayNames(entity) {
    const inventory = entity.getComponent("inventory")?.container;
    if (!inventory)
        return;
    if (entity.typeId === "mbl_ts:bicycle") {
        // Bicycles have wheels in either slot - update display names based on actual wheel type
        [BICYCLE_PART_SLOTS.FRONT_WHEEL, BICYCLE_PART_SLOTS.BACK_WHEEL].forEach(slot => {
            const wheelItem = inventory.getItem(slot);
            if (wheelItem) {
                let wheelName = "";
                if (wheelItem.typeId === "mbl_ts:front_wheel") {
                    wheelName = "Front Wheel";
                }
                else if (wheelItem.typeId === "mbl_ts:back_wheel") {
                    wheelName = "Back Wheel";
                }
                if (wheelName) {
                    const updatedWheel = updatePartDisplayName(wheelItem, wheelName);
                    inventory.setItem(slot, updatedWheel);
                }
            }
        });
    }
    else {
        // Original display updates for cars, trucks, and motorbikes
        // Update fuel display
        const fuelItem = inventory.getItem(PART_SLOTS.FUEL);
        if (fuelItem && PART_TYPES.FUEL.includes(fuelItem.typeId)) {
            const updatedFuel = updatePartDisplayName(fuelItem, "Fuel");
            inventory.setItem(PART_SLOTS.FUEL, updatedFuel);
        }
        // Update tires display
        const tiresItem = inventory.getItem(PART_SLOTS.TIRES);
        if (tiresItem && PART_TYPES.TIRE.includes(tiresItem.typeId)) {
            const updatedTires = updatePartDisplayName(tiresItem, "Tires");
            inventory.setItem(PART_SLOTS.TIRES, updatedTires);
        }
        // Update engine display
        const engineItem = inventory.getItem(PART_SLOTS.ENGINE);
        if (engineItem && PART_TYPES.ENGINE.includes(engineItem.typeId)) {
            const updatedEngine = updatePartDisplayName(engineItem, "Engine");
            inventory.setItem(PART_SLOTS.ENGINE, updatedEngine);
        }
        // Update upgrade displays
        const upgrade1Item = inventory.getItem(PART_SLOTS.UPGRADE_1);
        if (upgrade1Item) {
            let upgradeName = "Upgrade";
            if (PART_TYPES.SPEED_UPGRADE.includes(upgrade1Item.typeId)) {
                upgradeName = "Speed Upgrade";
            }
            else if (PART_TYPES.HEALTH_UPGRADE.includes(upgrade1Item.typeId)) {
                upgradeName = "Health Upgrade";
            }
            const updatedUpgrade1 = updatePartDisplayName(upgrade1Item, upgradeName);
            inventory.setItem(PART_SLOTS.UPGRADE_1, updatedUpgrade1);
        }
        const upgrade2Item = inventory.getItem(PART_SLOTS.UPGRADE_2);
        if (upgrade2Item) {
            let upgradeName = "Upgrade";
            if (PART_TYPES.SPEED_UPGRADE.includes(upgrade2Item.typeId)) {
                upgradeName = "Speed Upgrade";
            }
            else if (PART_TYPES.HEALTH_UPGRADE.includes(upgrade2Item.typeId)) {
                upgradeName = "Health Upgrade";
            }
            const updatedUpgrade2 = updatePartDisplayName(upgrade2Item, upgradeName);
            inventory.setItem(PART_SLOTS.UPGRADE_2, updatedUpgrade2);
        }
    }
}
export function initializeVehicleInventory(entity) {
    const inventory = entity.getComponent("inventory")?.container;
    if (!inventory)
        return;
    if (entity.typeId === "mbl_ts:bicycle") {
        // Initialize bicycle inventory (simplified 5-slot layout)
        // Slot 0: Background, Slot 1: Tire Icon, Slot 2: FREE (for tires), Slot 3: Background, Slot 4: Background
        Object.entries(BICYCLE_ITEMS).forEach(([slot, typeId]) => {
            const slotIndex = parseInt(slot);
            const current = inventory.getItem(slotIndex);
            if (!current || current.typeId !== typeId) {
                try {
                    const item = new ItemStack(typeId, 1);
                    item.lockMode = ItemLockMode.slot;
                    inventory.setItem(slotIndex, item);
                }
                catch {
                    // Silently handle invalid item identifiers
                }
            }
        });
        // Clear any other slots that might exist beyond slot 4
        for (let i = 5; i < inventory.size; i++) {
            inventory.setItem(i, undefined);
        }
    }
    else {
        // Original inventory setup for cars, trucks, and motorbikes
        Object.entries(VEHICLE_ITEMS).forEach(([slot, typeId]) => {
            const slotIndex = parseInt(slot);
            const current = inventory.getItem(slotIndex);
            if (!current || current.typeId !== typeId) {
                try {
                    const item = new ItemStack(typeId, 1);
                    item.lockMode = ItemLockMode.slot;
                    inventory.setItem(slotIndex, item);
                }
                catch {
                    // Silently handle invalid item identifiers
                }
            }
        });
        BACKGROUND_SLOTS.forEach(slot => {
            if (!FREE_SLOTS.includes(slot)) {
                const current = inventory.getItem(slot);
                if (!current || current.typeId !== "mbl_ts:vehicle_background_icon") {
                    try {
                        const item = new ItemStack("mbl_ts:vehicle_background_icon", 1);
                        item.lockMode = ItemLockMode.slot;
                        inventory.setItem(slot, item);
                    }
                    catch {
                        // Silently handle invalid item identifiers
                    }
                }
            }
        });
    }
}
export function getVehicleIconItemIds() {
    // Return all vehicle UI icon item IDs
    const iconIds = [];
    // Add all vehicle items (tire, engine, upgrade, fuel icons)
    iconIds.push(...Object.values(VEHICLE_ITEMS));
    // Add background icon
    iconIds.push("mbl_ts:vehicle_background_icon");
    return iconIds;
}
export function removeDroppedVehicleIconItems() {
    try {
        // Get all vehicle icon item IDs that should be removed
        const iconItemIds = getVehicleIconItemIds();
        if (iconItemIds.length === 0)
            return;
        // Get all dropped items in the world
        const droppedItems = world.getDimension("overworld").getEntities({
            type: "minecraft:item"
        });
        if (droppedItems.length === 0)
            return;
        // Create a set for quick lookup
        const iconItemSet = new Set(iconItemIds);
        // Check each dropped item and remove if it matches a vehicle icon
        droppedItems.forEach(droppedItemEntity => {
            try {
                const itemComponent = droppedItemEntity.getComponent("minecraft:item");
                if (!itemComponent || !itemComponent.itemStack)
                    return;
                const droppedItemStack = itemComponent.itemStack;
                const itemTypeId = droppedItemStack.typeId;
                // If this is a vehicle icon item, remove it
                if (iconItemSet.has(itemTypeId)) {
                    droppedItemEntity.remove();
                }
            }
            catch (e) {
                // Silently handle errors for individual dropped items
            }
        });
    }
    catch (e) {
        // Silently handle errors for the entire operation
    }
}
function findGroundLevel(dimension, x, y, z) {
    for (let currentY = Math.floor(y + 10); currentY >= Math.floor(y - 20); currentY--) {
        try {
            const block = dimension.getBlock({ x, y: currentY, z });
            if (block && !block.isAir && block.typeId !== "minecraft:air") {
                // Skip blocks that should be ignored for tilting
                if (TILT_IGNORE_BLOCKS.includes(block.typeId)) {
                    continue;
                }
                // Check if it's a snow layer block
                if (block.typeId === "minecraft:snow_layer") {
                    // Get the layers state (1-8, representing height)
                    const layersState = block.permutation.getState("layers");
                    // Only consider snow layers as solid ground if they're 4 layers or higher
                    if (layersState && layersState >= 4) {
                        return currentY;
                    }
                    // If snow layers are less than 4, continue looking below
                    continue;
                }
                else {
                    // Regular solid block that's not in the ignore list, return this level
                    return currentY;
                }
            }
        }
        catch { }
    }
    return y - 30;
}
export function calculateVehicleTilt(entity) {
    try {
        const { x, y, z } = entity.location;
        const dimension = entity.dimension;
        const viewDirection = entity.getViewDirection();
        // Different detection points based on vehicle type
        let frontOffset, backOffset;
        if (entity.typeId === "mbl_ts:pickup_truck") {
            // Pickup truck - closer detection points
            frontOffset = 2;
            backOffset = 1.5;
        }
        else if (entity.typeId === "mbl_ts:sedan_car") {
            // Sedan car - current detection points
            frontOffset = 2.5;
            backOffset = 2.2;
        }
        else {
            // Default for other vehicles (motorbike, etc.)
            frontOffset = 2.0;
            backOffset = 1.5;
        }
        const frontX = Math.floor(x + viewDirection.x * frontOffset);
        const frontZ = Math.floor(z + viewDirection.z * frontOffset);
        const backX = Math.floor(x - viewDirection.x * backOffset);
        const backZ = Math.floor(z - viewDirection.z * backOffset);
        // Particles commented out for later use if needed
        // dimension.spawnParticle("minecraft:heart_particle", { x: frontX, y: y, z: frontZ });
        // dimension.spawnParticle("minecraft:villager_angry", { x: backX, y: y, z: backZ });
        const frontGroundLevel = findGroundLevel(dimension, frontX, y, frontZ);
        const backGroundLevel = findGroundLevel(dimension, backX, y, backZ);
        const heightDifference = backGroundLevel - frontGroundLevel;
        // Get or create tilt interpolation data
        let tiltData = vehicleTiltMap.get(entity.id);
        if (!tiltData) {
            tiltData = {
                currentPositiveTilt: 0,
                currentNegativeTilt: 0,
                targetPositiveTilt: 0,
                targetNegativeTilt: 0
            };
            vehicleTiltMap.set(entity.id, tiltData);
        }
        // Calculate target tilt based on height difference
        let targetPositiveTilt = 0;
        let targetNegativeTilt = 0;
        if (Math.abs(heightDifference) > 0.1) {
            const tiltAmount = Math.min(25, Math.abs(heightDifference) * 10);
            if (heightDifference > 0) {
                targetPositiveTilt = tiltAmount;
            }
            else {
                targetNegativeTilt = tiltAmount;
            }
        }
        // Update target tilts
        tiltData.targetPositiveTilt = targetPositiveTilt;
        tiltData.targetNegativeTilt = targetNegativeTilt;
        // Smooth interpolation (fade factor - higher = faster transition)
        const fadeSpeed = 0.75; // Much faster transition - snaps most of the way quickly with small fade at end
        // Interpolate current tilts towards target tilts
        tiltData.currentPositiveTilt += (tiltData.targetPositiveTilt - tiltData.currentPositiveTilt) * fadeSpeed;
        tiltData.currentNegativeTilt += (tiltData.targetNegativeTilt - tiltData.currentNegativeTilt) * fadeSpeed;
        // Round to avoid tiny decimal values
        tiltData.currentPositiveTilt = Math.round(tiltData.currentPositiveTilt * 100) / 100;
        tiltData.currentNegativeTilt = Math.round(tiltData.currentNegativeTilt * 100) / 100;
        // Apply the interpolated tilt values to the entity
        entity.setProperty("mbl_ts:positive_car_tilt", Math.round(tiltData.currentPositiveTilt));
        entity.setProperty("mbl_ts:negative_car_tilt", Math.round(tiltData.currentNegativeTilt));
        // Store updated tilt data
        vehicleTiltMap.set(entity.id, tiltData);
        // Action bar removed - no longer showing tilt info
        // showTiltActionBar(entity);
    }
    catch {
        try {
            entity.setProperty("mbl_ts:positive_car_tilt", 0);
            entity.setProperty("mbl_ts:negative_car_tilt", 0);
        }
        catch { }
    }
}
export function showTiltActionBar(entity) {
    try {
        const positiveTilt = entity.getProperty("mbl_ts:positive_car_tilt") ?? 0;
        const negativeTilt = entity.getProperty("mbl_ts:negative_car_tilt") ?? 0;
        const riders = entity.getComponent("minecraft:rideable");
        if (riders) {
            for (const rider of riders.getRiders()) {
                if (rider.typeId === "minecraft:player") {
                    const player = rider;
                    const tiltInfo = `§6Vehicle Tilt: §ePos: ${positiveTilt}° §cNeg: ${negativeTilt}°`;
                    player.onScreenDisplay.setActionBar(tiltInfo);
                }
            }
        }
    }
    catch { }
}
export function handleVehicleRiding() {
    try {
        const vehicles = getPickupTrucks();
        const allPlayers = world.getAllPlayers();
        for (const player of allPlayers) {
            const isCurrentlyRiding = isPlayerRidingVehicle(player);
            const wasRiding = ridingPlayers.has(player.name);
            if (isCurrentlyRiding && !wasRiding) {
                // Player just started riding - apply vehicle controls
                const vehicle = getPlayerVehicle(player);
                applyVehicleControls(player, vehicle);
                ridingPlayers.add(player.name);
                // Set dynamic property to track riding state
                try {
                    player.setDynamicProperty(VEHICLE_RIDING_PROPERTY, true);
                }
                catch { }
            }
            else if (!isCurrentlyRiding && wasRiding) {
                // Player just stopped riding - always reset controls
                resetPlayerControls(player);
                ridingPlayers.delete(player.name);
                // Clear dynamic property
                try {
                    player.setDynamicProperty(VEHICLE_RIDING_PROPERTY, false);
                }
                catch { }
            }
        }
    }
    catch { }
}
function isPlayerRidingVehicle(player) {
    try {
        const vehicles = getPickupTrucks();
        for (const vehicle of vehicles) {
            const riders = vehicle.getComponent("minecraft:rideable");
            if (riders) {
                for (const rider of riders.getRiders()) {
                    if (rider.id === player.id) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    catch {
        return false;
    }
}
function getPlayerVehicle(player) {
    try {
        const vehicles = getPickupTrucks();
        for (const vehicle of vehicles) {
            const riders = vehicle.getComponent("minecraft:rideable");
            if (riders) {
                for (const rider of riders.getRiders()) {
                    if (rider.id === player.id) {
                        return vehicle;
                    }
                }
            }
        }
        return null;
    }
    catch {
        return null;
    }
}
function isPlayerNearVehicle(player, vehicles) {
    try {
        const playerLoc = player.location;
        for (const vehicle of vehicles) {
            const vehicleLoc = vehicle.location;
            const distance = Math.sqrt(Math.pow(playerLoc.x - vehicleLoc.x, 2) +
                Math.pow(playerLoc.y - vehicleLoc.y, 2) +
                Math.pow(playerLoc.z - vehicleLoc.z, 2));
            if (distance <= 5) { // Within 5 block radius
                return true;
            }
        }
        return false;
    }
    catch {
        return false;
    }
}
function applyVehicleControls(player, vehicle) {
    try {
        // Bicycles only hide horse health HUD - everything else stays normal
        if (vehicle && vehicle.typeId === "mbl_ts:bicycle") {
            // Hide horse health HUD element for bicycle
            player.runCommand("hud @s hide horse_health");
            return;
        }
        // Apply full vehicle controls to cars, trucks, and motorbikes
        // Remove left and right strafe movement permissions only
        player.runCommand("inputpermission set @s move_left disabled");
        player.runCommand("inputpermission set @s move_right disabled");
        // Set to third person camera
        player.runCommand("camera @s set minecraft:third_person");
        // Apply invisibility based on vehicle type using addEffect method
        if (vehicle && (vehicle.typeId === "mbl_ts:pickup_truck" || vehicle.typeId === "mbl_ts:sedan_car")) {
            // Apply invisibility for enclosed vehicles (pickup trucks and sedans), not for open vehicles like motorbikes
            player.addEffect("invisibility", 999999, {
                amplifier: 0,
                showParticles: false
            });
        }
        // Note: bike_vehicle (motorbike) is intentionally NOT included here to keep player visible
        // Hide horse health HUD element
        player.runCommand("hud @s hide horse_health");
        // Hide status effects HUD element (hides potion effect icons)
        player.runCommand("hud @s hide status_effects");
    }
    catch { }
}
function resetPlayerControls(player) {
    try {
        // Restore left and right strafe movement permissions
        player.runCommand("inputpermission set @s move_left enabled");
        player.runCommand("inputpermission set @s move_right enabled");
        // Reset to default camera
        player.runCommand("camera @s clear");
        // Remove invisibility effect using removeEffect method
        player.removeEffect("invisibility");
        // Show horse health HUD element again (applies to all vehicles including bicycle)
        player.runCommand("hud @s reset horse_health");
        // Show status effects HUD element again
        player.runCommand("hud @s reset status_effects");
    }
    catch { }
}
export function handlePlayerRejoin(player) {
    try {
        // Check if player was previously riding a vehicle
        const wasRidingVehicle = player.getDynamicProperty(VEHICLE_RIDING_PROPERTY);
        if (wasRidingVehicle) {
            // Player was riding but is no longer in vehicle (due to disconnect/rejoin)
            // Reset their controls and clear the property
            resetPlayerControls(player);
            player.setDynamicProperty(VEHICLE_RIDING_PROPERTY, false);
            // Remove from tracking set if present
            ridingPlayers.delete(player.name);
            player.sendMessage("§6Vehicle controls have been reset after rejoining.");
        }
    }
    catch { }
}
export function handleVehicleDamage(entity) {
    if (!VEHICLE_TYPES.includes(entity.typeId))
        return;
    const inventory = entity.getComponent("inventory")?.container;
    if (!inventory)
        return;
    [PART_SLOTS.UPGRADE_1, PART_SLOTS.UPGRADE_2].forEach(slot => {
        const upgradeItem = inventory.getItem(slot);
        if (upgradeItem) {
            // Handle existing health upgrade damage logic
            if (upgradeItem.typeId === "mbl_ts:health_upgrade") {
                if (Math.random() < 1 / 15) {
                    const durability = upgradeItem.getComponent("minecraft:durability");
                    if (durability && durability.damage < durability.maxDurability - 1) {
                        durability.damage += 1;
                        try {
                            inventory.setItem(slot, upgradeItem);
                        }
                        catch {
                            inventory.setItem(slot, undefined);
                        }
                    }
                    else if (durability) {
                        inventory.setItem(slot, undefined);
                    }
                }
            }
            // New logic: 50% chance to damage any vehicle upgrade item with 1-2 damage
            if (PART_TYPES.SPEED_UPGRADE.includes(upgradeItem.typeId) ||
                PART_TYPES.HEALTH_UPGRADE.includes(upgradeItem.typeId)) {
                if (Math.random() < 0.5) { // 50% chance
                    const durability = upgradeItem.getComponent("minecraft:durability");
                    if (durability) {
                        // Deal 1-2 damage (random)
                        const damageAmount = Math.floor(Math.random() * 2) + 1; // Random 1 or 2
                        const newDamage = Math.min(durability.damage + damageAmount, durability.maxDurability);
                        if (newDamage >= durability.maxDurability) {
                            // Item is destroyed
                            inventory.setItem(slot, undefined);
                        }
                        else {
                            // Apply damage
                            durability.damage = newDamage;
                            try {
                                inventory.setItem(slot, upgradeItem);
                            }
                            catch {
                                inventory.setItem(slot, undefined);
                            }
                        }
                    }
                }
            }
        }
    });
}
