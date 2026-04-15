/*

Standing Chairs
Fallen Sideways Chairs
Fallen Chairs
Shelve Rack
Fallen Shelve Rack

50/50 on placing:
Trash Can
newspaper Stack
skeleton body

Crate
draws
cupboard
backpack blocks (x5)
first aid kit
toolbox

*/
import { BlockPermutation, world, system, } from "@minecraft/server";
import { GameSettings } from "./gamesettings";
const standingChairs = [
    "mbl_ts:chair_black",
    "mbl_ts:chair_blue",
    "mbl_ts:chair_gray",
    "mbl_ts:chair_green",
    "mbl_ts:chair_red",
];
const fallenSidewaysChairs = [
    "mbl_ts:chair_black_fallen",
    "mbl_ts:chair_blue_fallen",
    "mbl_ts:chair_gray_fallen",
    "mbl_ts:chair_green_fallen",
    "mbl_ts:chair_red_fallen",
];
const fallenChairs = [
    "mbl_ts:chair_black_fallen_2",
    "mbl_ts:chair_blue_fallen_2",
    "mbl_ts:chair_gray_fallen_2",
    "mbl_ts:chair_green_fallen_2",
    "mbl_ts:chair_red_fallen_2",
];
const standingShelvingRacks = [
    "mbl_ts:shelving_rack_acacia",
    "mbl_ts:shelving_rack_birch",
    "mbl_ts:shelving_rack_dark_oak",
    "mbl_ts:shelving_rack_jungle",
    "mbl_ts:shelving_rack_mangrove",
    "mbl_ts:shelving_rack_oak",
    "mbl_ts:shelving_rack_spruce",
];
const fallenShelvingRacks = [
    "mbl_ts:shelving_rack_fallen_acacia",
    "mbl_ts:shelving_rack_fallen_birch",
    "mbl_ts:shelving_rack_fallen_dark_oak",
    "mbl_ts:shelving_rack_fallen_jungle",
    "mbl_ts:shelving_rack_fallen_mangrove",
    "mbl_ts:shelving_rack_fallen_oak",
    "mbl_ts:shelving_rack_fallen_spruce",
];
// 50/50 chance items
const fiftyFiftyItems = [
    "mbl_ts:trash_can_fallen",
    "mbl_ts:newspaper",
    "mbl_ts:skeleton_sitting",
];
// Wooden Crates
const woodenCrates = [
    "mbl_ts:wooden_crate_acacia",
    "mbl_ts:wooden_crate_birch",
    "mbl_ts:wooden_crate_jungle",
    "mbl_ts:wooden_crate_oak",
    "mbl_ts:wooden_crate_spruce",
];
// Cupboards
const cupboards = [
    "mbl_ts:cupboard_acacia",
    "mbl_ts:cupboard_birch",
    "mbl_ts:cupboard_cherry",
    "mbl_ts:cupboard_dark_oak",
    "mbl_ts:cupboard_jungle",
    "mbl_ts:cupboard_mangrove",
    "mbl_ts:cupboard_oak",
    "mbl_ts:cupboard_pale",
    "mbl_ts:cupboard_spruce",
];
// Draws
const draws = [
    "mbl_ts:draws_acacia",
    "mbl_ts:draws_birch",
    "mbl_ts:draws_cherry",
    "mbl_ts:draws_dark_oak",
    "mbl_ts:draws_jungle",
    "mbl_ts:draws_mangrove",
    "mbl_ts:draws_oak",
    "mbl_ts:draws_pale",
    "mbl_ts:draws_spruce",
];
// Backpack Blocks
const backpackBlocks = [
    "mbl_ts:blue_backpack_block",
    "mbl_ts:brown_backpack_block",
    "mbl_ts:gray_backpack_block",
    "mbl_ts:green_backpack_block",
    "mbl_ts:red_backpack_block",
];
// Individual decoration items
const floorStones = "mbl_ts:floor_stones";
const gravestone = "mbl_ts:gravestone";
const ironBarsRusty = "mbl_ts:iron_bars_rusty";
const lanternOff = "mbl_ts:lantern_off";
const metalTable = "mbl_ts:metal_table";
const radio = "mbl_ts:radio";
const firstAidKit = "mbl_ts:first_aid_kit";
const toolbox = "mbl_ts:toolbox";
const trashCan = "mbl_ts:trash_can";
// Wood types available across different furniture
const woodTypes = [
    "acacia",
    "birch",
    "cherry",
    "dark_oak",
    "jungle",
    "mangrove",
    "oak",
    "pale",
    "spruce",
];
// Map placement blocks to their variants
const placementBlockVariants = {
    // Furniture with wood variants
    "mbl_ts:draws_placement": draws,
    "mbl_ts:cupboard_placement": cupboards,
    "mbl_ts:wooden_crate_placement": woodenCrates,
    "mbl_ts:standing_shelving_rack_placement": standingShelvingRacks,
    "mbl_ts:fallen_shelving_rack_placement": fallenShelvingRacks,
    // Furniture with color variants
    "mbl_ts:standing_chair_placement": standingChairs,
    "mbl_ts:fallen_sideways_chair_placement": fallenSidewaysChairs,
    "mbl_ts:fallen_chair_placement": fallenChairs,
    "mbl_ts:backpack_block_placement": backpackBlocks,
    // 50/50 chance items
    "mbl_ts:trashcan_fallen_placement": ["mbl_ts:trash_can_fallen"],
    "mbl_ts:newspaper_placement": ["mbl_ts:newspaper"],
    "mbl_ts:skeleton_placement": ["mbl_ts:skeleton_sitting"],
    // Individual items (always spawn)
    "mbl_ts:first_aid_kit_placement": [firstAidKit],
    "mbl_ts:toolbox_placement": [toolbox],
    "mbl_ts:trash_can_placement": [trashCan],
};
// Define which placement blocks are 50/50 chance
const fiftyFiftyPlacementBlocks = [
    "mbl_ts:trashcan_fallen_placement",
    "mbl_ts:newspaper_placement",
    "mbl_ts:skeleton_placement",
];
// Define which blocks can rotate to any cardinal direction (not just inherit placement block rotation)
const randomRotationBlocks = [
    // Fallen items that can face any direction
    "mbl_ts:chair_black_fallen",
    "mbl_ts:chair_blue_fallen",
    "mbl_ts:chair_gray_fallen",
    "mbl_ts:chair_green_fallen",
    "mbl_ts:chair_red_fallen",
    "mbl_ts:chair_black_fallen_2",
    "mbl_ts:chair_blue_fallen_2",
    "mbl_ts:chair_gray_fallen_2",
    "mbl_ts:chair_green_fallen_2",
    "mbl_ts:chair_red_fallen_2",
    "mbl_ts:shelving_rack_fallen_acacia",
    "mbl_ts:shelving_rack_fallen_birch",
    "mbl_ts:shelving_rack_fallen_dark_oak",
    "mbl_ts:shelving_rack_fallen_jungle",
    "mbl_ts:shelving_rack_fallen_mangrove",
    "mbl_ts:shelving_rack_fallen_oak",
    "mbl_ts:shelving_rack_fallen_spruce",
    // Items that can face any direction
    "mbl_ts:newspaper",
    "mbl_ts:trash_can_fallen",
    "mbl_ts:first_aid_kit",
    "mbl_ts:skeleton_sitting",
];
// Structure-wide theme storage for consistent wood types
const structureThemes = new Map();
// Define furniture families - items in the same family should match colors/wood types
const furnitureFamilies = {
    chairs: {
        standing: standingChairs,
        fallenSideways: fallenSidewaysChairs,
        fallen: fallenChairs,
    },
    storage: {
        cupboards: cupboards,
        draws: draws,
        woodenCrates: woodenCrates,
    },
    shelving: {
        standing: standingShelvingRacks,
        fallen: fallenShelvingRacks,
    },
    backpacks: {
        blocks: backpackBlocks,
    },
};
// Map placement blocks to their furniture families
const placementBlockFamilies = {
    "mbl_ts:standing_chair_placement": "chairs",
    "mbl_ts:fallen_sideways_chair_placement": "chairs",
    "mbl_ts:fallen_chair_placement": "chairs",
    "mbl_ts:cupboard_placement": "storage",
    "mbl_ts:draws_placement": "storage",
    "mbl_ts:wooden_crate_placement": "storage",
    "mbl_ts:standing_shelving_rack_placement": "shelving",
    "mbl_ts:fallen_shelving_rack_placement": "shelving",
    "mbl_ts:backpack_block_placement": "backpacks",
};
const MINIMUM_STRUCTURE_DISTANCE = 500;
const MAX_SEARCH_RADIUS = 32; // Maximum chunks to search (32 * 16 = 512 blocks)
// Cache for structure lookups
const structureDataMap = new Map();
// Structure family definitions - cleaner organization
const STRUCTURE_FAMILIES = {
    skyscrapper: ["skyscrapper_1", "skyscrapper_2"],
    cabin_swamp: ["cabin_1_swamp", "cabin_2_swamp"],
    caravan: ["caravan_forest", "caravan_meadow"],
    snow_cottage: ["snow_cottage_1", "snow_cottage_2"],
    ruins: ["ruins_1", "ruins_2", "ruins_3"],
    chicken: ["chicken_acacia", "chicken_spruce"],
    factory: ["factory_small"],
    house_taiga: ["taiga_house_large", "taiga_house_small"],
    camp: ["camp_desert", "camp_forest"],
    tree_house: ["tree_house"],
};
const slowLoadStructures = [
    "skyscrapper_1",
    "skyscrapper_2",
    "factory",
    "factory_small",
    "factory_large",
    "warehouse",
    "taiga_house_large",
    "factory_small",
    "factory_large",
    "gas_station_1",
    "shop",
];
/**
 * Calculate 2D distance between two points (ignoring Y axis)
 */
function calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dz * dz);
}
/**
 * Get the family name for a structure type
 */
function getStructureFamily(structureType) {
    for (const [family, types] of Object.entries(STRUCTURE_FAMILIES)) {
        if (types.includes(structureType)) {
            return family;
        }
    }
    return null; // Unique structure (no family)
}
/**
 * Check if two structures belong to the same family
 */
function areSameFamily(type1, type2) {
    const family1 = getStructureFamily(type1);
    const family2 = getStructureFamily(type2);
    // Both must have families and they must match
    return family1 !== null && family2 !== null && family1 === family2;
}
/**
 * Extract structure type from block ID
 */
function getStructureTypeFromBlockId(blockId) {
    if (blockId.startsWith("mbl_ts:structure_")) {
        return blockId.replace("mbl_ts:structure_", "");
    }
    return null;
}
/**
 * Efficiently remove nearby structure spawning blocks of the same family
 */
function removeNearbyStructureSpawners(centerBlock, structureType) {
    const centerPos = centerBlock.location;
    const dimension = centerBlock.dimension;
    const centerFamily = getStructureFamily(structureType);
    if (!centerFamily) {
        return false; // No family restrictions for unique structures
    }
    let removedCount = 0;
    const maxRemovals = 10; // Limit removals per tick for performance
    try {
        // Search in a spiral pattern for better coverage
        for (let radius = 1; radius <= MAX_SEARCH_RADIUS && removedCount < maxRemovals; radius++) {
            const chunkPositions = getSpiralChunkPositions(centerPos, radius);
            for (const chunkPos of chunkPositions) {
                if (removedCount >= maxRemovals)
                    break;
                const distance = calculateDistance(centerPos, chunkPos);
                if (distance > MINIMUM_STRUCTURE_DISTANCE)
                    continue;
                try {
                    const block = dimension.getBlock(chunkPos);
                    if (!block ||
                        (block.location.x === centerPos.x &&
                            block.location.z === centerPos.z)) {
                        continue; // Skip center block and invalid blocks
                    }
                    const blockStructureType = getStructureTypeFromBlockId(block.typeId);
                    if (blockStructureType &&
                        areSameFamily(structureType, blockStructureType)) {
                        block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                        removedCount++;
                    }
                }
                catch (error) {
                    // Skip problematic blocks
                    continue;
                }
            }
        }
    }
    catch (error) {
        // Handle any unexpected errors gracefully
    }
    return removedCount > 0;
}
/**
 * Generate positions in a spiral pattern around center point
 * More efficient than nested loops for large search areas
 */
function getSpiralChunkPositions(center, maxRadius) {
    const positions = [];
    const chunkSize = 16;
    for (let r = 1; r <= maxRadius; r++) {
        // Top edge (left to right)
        for (let x = -r; x <= r; x++) {
            positions.push({
                x: center.x + x * chunkSize,
                y: center.y,
                z: center.z + -r * chunkSize,
            });
        }
        // Right edge (top to bottom, excluding corners)
        for (let z = -r + 1; z <= r - 1; z++) {
            positions.push({
                x: center.x + r * chunkSize,
                y: center.y,
                z: center.z + z * chunkSize,
            });
        }
        // Bottom edge (right to left, excluding right corner)
        for (let x = r - 1; x >= -r; x--) {
            positions.push({
                x: center.x + x * chunkSize,
                y: center.y,
                z: center.z + r * chunkSize,
            });
        }
        // Left edge (bottom to top, excluding corners)
        for (let z = r - 1; z >= -r + 1; z--) {
            positions.push({
                x: center.x + -r * chunkSize,
                y: center.y,
                z: center.z + z * chunkSize,
            });
        }
    }
    return positions;
}
const structureData = [
    {
        id: "mbl_ts/skyscrapper_1", // Fixed typo: "skyscrapper" -> "skyscrapper"
        offsets: { x: -19, y: -8, z: -28 }, // Fixed property name
        messages: ["§aA skyscrapper has appeared nearby! Explore the heights!"],
    },
    {
        id: "mbl_ts/skyscrapper_2",
        offsets: { x: -19, y: -5, z: -28 }, // Add data for skyscrapper_2
        messages: ["§aAnother skyscrapper has risen! Check out the architecture!"],
    },
    {
        id: "mbl_ts/cabin_1_swamp",
        offsets: { x: -12, y: -5, z: -12 }, // Add data for cabin_1_swamp
        messages: ["§aA cabin has appeared in the swamp!"],
    },
    {
        id: "mbl_ts/cabin_2_swamp",
        offsets: { x: -6, y: -5, z: -8 }, // Add data for cabin_2_swamp
        messages: ["§aA cabin has appeared in the swamp!"],
    },
    {
        id: "mbl_ts/camp_desert",
        offsets: { x: -8, y: -7, z: -8 }, // Add data for camp_desert
        messages: ["§aA camp has appeared in the desert!"],
    },
    {
        id: "mbl_ts/camp_forest",
        offsets: { x: -8, y: -5, z: -8 }, // Add data for camp_forest
        messages: ["§aA camp has appeared in the forest!"],
    },
    {
        id: "mbl_ts/caravan_forest",
        offsets: { x: -8, y: -4, z: -8 }, // Add data for caravan_forest
        messages: ["§aA caravan has appeared in the forest!"],
    },
    {
        id: "mbl_ts/caravan_meadow",
        offsets: { x: -8, y: -4, z: -8 }, // Add data for caravan_meadow
        messages: ["§aA caravan has appeared in the meadow!"],
    },
    {
        id: "mbl_ts/chicken_acacia",
        offsets: { x: -12, y: -7, z: -18 }, // Add data for chicken_acacia
        messages: ["§aA chicken coop has appeared!"],
    },
    {
        id: "mbl_ts/chicken_spruce",
        offsets: { x: -12, y: -7, z: -18 }, // Add data for chicken_spruce
        messages: ["§aA chicken coop has appeared!"],
    },
    {
        id: "mbl_ts/factory",
        offsets: { x: -20, y: -10, z: -20 }, // Add data for factory
        messages: ["§aA factory has appeared! Explore the industrial site!"],
    },
    {
        id: "mbl_ts/gas_station_1",
        offsets: { x: -12, y: -5, z: -12 }, // Add data for gas_station_1
        messages: ["§aA gas station has appeared!"],
    },
    {
        id: "mbl_ts/lighthouse",
        offsets: { x: -8, y: -6, z: -8 }, // Add data for lighthouse
        messages: ["§aA lighthouse has appeared!"],
    },
    {
        id: "mbl_ts/old_town_hall",
        offsets: { x: -20, y: -7, z: -20 }, // Add data for old_town_hall
        messages: ["§aThe old town hall has appeared!"],
    },
    {
        id: "mbl_ts/pig_pen",
        offsets: { x: -12, y: -8, z: -12 }, // Add data for pig_pen
        messages: ["§aA pig pen has appeared!"],
    },
    {
        id: "mbl_ts/ruins_1",
        offsets: { x: -15, y: -9, z: -15 }, // Add data for ruins_1
        messages: ["§aAncient ruins have appeared! Explore the mysteries!"],
    },
    {
        id: "mbl_ts/ruins_2",
        offsets: { x: -15, y: -4, z: -15 }, // Add data for ruins_2
        messages: ["§aAncient ruins have appeared! Explore the mysteries!"],
    },
    {
        id: "mbl_ts/ruins_3",
        offsets: { x: -15, y: -4, z: -15 }, // Add data for ruins_3
        messages: ["§aAncient ruins have appeared! Explore the mysteries!"],
    },
    {
        id: "mbl_ts/shop",
        offsets: { x: -12, y: -8, z: -35 }, // Add data for shop
        messages: ["§aA shop has appeared! Check out the goods!"],
    },
    {
        id: "mbl_ts/snow_cottage_1",
        offsets: { x: -10, y: -5, z: -10 }, // Add data for snow_cottage_1
        messages: ["§aA cozy snow cottage has appeared!"],
    },
    {
        id: "mbl_ts/snow_cottage_2",
        offsets: { x: -10, y: -5, z: -10 }, // Add data for snow_cottage_2
        messages: ["§aA cozy snow cottage has appeared!"],
    },
    {
        id: "mbl_ts/taiga_house_large",
        offsets: { x: -25, y: -10, z: -25 }, // Add data for taiga_house_large
        messages: ["§aA large taiga house has appeared!"],
    },
    {
        id: "mbl_ts/taiga_house_small",
        offsets: { x: -10, y: -8, z: -10 }, // Add data for taiga_house_small
        messages: ["§aA small taiga house has appeared!"],
    },
    {
        id: "mbl_ts/warehouse",
        offsets: { x: -20, y: -8, z: -20 }, // Add data for warehouse
        messages: ["§aA warehouse has appeared! Explore the storage area!"],
    },
    {
        id: "mbl_ts/watch_tower",
        offsets: { x: -6, y: 0, z: -6 }, // Add data for watch_tower
        messages: ["§aA watch tower has appeared!"],
    },
    {
        id: "mbl_ts/water_tower",
        offsets: { x: -8, y: -5, z: -8 }, // Add data for water_tower
        messages: ["§aA water tower has appeared!"],
    },
    {
        id: "mbl_ts/tree_house",
        offsets: { x: -4, y: 0, z: -4 }, // Add data for tree_house
        messages: ["§aA tree house has appeared!"],
    },
];
// Initialize structure data map for faster lookups
function initializeStructureDataMap() {
    if (structureDataMap.size > 0)
        return; // Already initialized
    structureData.forEach((structure) => {
        structureDataMap.set(structure.id, structure);
    });
}
export function getTypeById(block) {
    const typeId = block.typeId;
    // Check if it's a structure spawner block
    if (typeId.startsWith("mbl_ts:structure_")) {
        const structureType = typeId.replace("mbl_ts:structure_", "");
        const validTypes = [
            "skyscrapper_1",
            "skyscrapper_2",
            "cabin_1_swamp",
            "cabin_2_swamp",
            "camp_desert",
            "camp_forest",
            "caravan_forest",
            "caravan_meadow",
            "chicken_acacia",
            "chicken_spruce",
            "factory",
            "gas_station_1",
            "lighthouse",
            "old_town_hall",
            "pig_pen",
            "ruins_1",
            "ruins_2",
            "ruins_3",
            "shop",
            "snow_cottage_1",
            "snow_cottage_2",
            "taiga_house_large",
            "taiga_house_small",
            "warehouse",
            "watch_tower",
            "water_tower",
            "tree_house",
        ];
        if (validTypes.includes(structureType)) {
            return structureType;
        }
    }
    return null;
}
export function generateCustomStructure(block, type) {
    try {
        const enabled = GameSettings.getStructuresEnabled();
        if (!enabled) {
            //set the block to air to prevent re-triggering
            block.setPermutation(BlockPermutation.resolve("minecraft:air"));
            return;
        }
        initializeStructureDataMap();
        const position = block.location;
        // Optimized player check - smaller radius for better performance
        const nearbyPlayers = block.dimension.getPlayers({
            location: position,
            maxDistance: 80, // Reduced from 120
        });
        if (nearbyPlayers.length === 0) {
            return;
        }
        // Remove the spawning block
        block.setPermutation(BlockPermutation.resolve("minecraft:air"));
        const structureId = `mbl_ts/${type}`;
        const structure = structureDataMap.get(structureId);
        if (!structure) {
            return;
        }
        if (!structure.offsets) {
            return;
        }
        const structurePosition = {
            x: position.x + structure.offsets.x,
            y: position.y + structure.offsets.y,
            z: position.z + structure.offsets.z,
        };
        let time = 5;
        let tickingAreaName = null;
        // Load the structure with improved command
        if (slowLoadStructures.includes(type)) {
            time = 30;
            // Create a temporary ticking area for large structures
            // Calculate ticking area bounds (4 chunks = 64 blocks in each direction)
            const tickingRadius = 64;
            const tickingFrom = {
                x: Math.floor(structurePosition.x - tickingRadius),
                y: 0,
                z: Math.floor(structurePosition.z - tickingRadius),
            };
            const tickingTo = {
                x: Math.floor(structurePosition.x + tickingRadius),
                y: 319,
                z: Math.floor(structurePosition.z + tickingRadius),
            };
            // Generate unique ticking area name
            tickingAreaName = `temp_structure_${type}_${Date.now()}`;
            try {
                const tickingCommand = `tickingarea add ${tickingFrom.x} ${tickingFrom.y} ${tickingFrom.z} ${tickingTo.x} ${tickingTo.y} ${tickingTo.z} ${tickingAreaName}`;
                block.dimension.runCommand(tickingCommand);
            }
            catch (tickError) {
                // Continue anyway, structure might still load
            }
        }
        const command = `structure load "${structure.id}" ${Math.floor(structurePosition.x)} ${Math.floor(structurePosition.y)} ${Math.floor(structurePosition.z)} 0_degrees none layer_by_layer ${time}`;
        try {
            const result = block.dimension.runCommand(command);
            // Send success message to nearby players
            if (structure.messages && Array.isArray(structure.messages)) {
                structure.messages.forEach((message) => {
                    nearbyPlayers.forEach((player) => {
                        player.sendMessage(message);
                    });
                });
            }
            // Remove the ticking area after structure loads (with a delay for layer_by_layer loading)
            if (tickingAreaName) {
                const cleanupDelay = time * 20 + 60; // Convert seconds to ticks and add buffer
                system.runTimeout(() => {
                    try {
                        const removeCommand = `tickingarea remove ${tickingAreaName}`;
                        block.dimension.runCommand(removeCommand);
                    }
                    catch (removeError) {
                        // Ignore cleanup errors
                    }
                }, cleanupDelay);
            }
        }
        catch (cmdError) {
            // Remove ticking area if structure load failed
            if (tickingAreaName) {
                try {
                    block.dimension.runCommand(`tickingarea remove ${tickingAreaName}`);
                }
                catch (cleanupError) {
                    // Ignore cleanup errors
                }
            }
            // Try alternative command format
            try {
                const altCommand = `structure load ${structure.id} ${Math.floor(structurePosition.x)} ${Math.floor(structurePosition.y)} ${Math.floor(structurePosition.z)}`;
                block.dimension.runCommand(altCommand);
            }
            catch (altError) {
                // Ignore alternative command errors
            }
        }
    }
    catch (error) {
        world.sendMessage(`§c[DEBUG] Structure generation error: ${error}`);
    }
}
/**
 * Find the best matching variant for chairs based on preferred color
 */
function findBestChairVariant(variants, preferredColor) {
    // Try to find exact color match first
    const exactMatch = variants.find((variant) => variant.includes(`_${preferredColor}`));
    if (exactMatch)
        return exactMatch;
    // If no exact match, try common chair colors in priority order
    const priorityColors = [
        preferredColor,
        "black",
        "blue",
        "gray",
        "green",
        "red",
    ];
    for (const color of priorityColors) {
        const match = variants.find((variant) => variant.includes(`_${color}`));
        if (match)
            return match;
    }
    // Fallback to random variant
    return variants[Math.floor(Math.random() * variants.length)];
}
/**
 * Find the best matching variant for backpacks based on preferred color
 */
function findBestBackpackVariant(variants, preferredColor) {
    // Try to find exact color match first
    const exactMatch = variants.find((variant) => variant.includes(`${preferredColor}_backpack`));
    if (exactMatch)
        return exactMatch;
    // If no exact match, try common backpack colors in priority order
    const priorityColors = [
        preferredColor,
        "blue",
        "brown",
        "gray",
        "green",
        "red",
    ];
    for (const color of priorityColors) {
        const match = variants.find((variant) => variant.includes(`${color}_backpack`));
        if (match)
            return match;
    }
    // Fallback to random variant
    return variants[Math.floor(Math.random() * variants.length)];
}
/**
 * Find the best matching variant for a furniture type with the preferred wood type
 */
function findBestVariant(variants, preferredWoodType) {
    // Try to find exact match first
    const exactMatch = variants.find((variant) => variant.includes(`_${preferredWoodType}`));
    if (exactMatch)
        return exactMatch;
    // If no exact match, try other wood types in priority order
    const priorityWoodTypes = [
        preferredWoodType,
        "oak",
        "spruce",
        "birch",
        "acacia",
    ];
    for (const woodType of priorityWoodTypes) {
        const match = variants.find((variant) => variant.includes(`_${woodType}`));
        if (match)
            return match;
    }
    // Fallback to random variant if no wood types match
    return variants[Math.floor(Math.random() * variants.length)];
}
/**
 * Extract wood type from a block ID
 */
function extractWoodType(blockId) {
    for (const woodType of woodTypes) {
        if (blockId.includes(`_${woodType}`)) {
            return woodType;
        }
    }
    return null;
}
/**
 * Extract color from a chair block ID
 */
function extractChairColor(blockId) {
    // Handle all chair patterns:
    // mbl_ts:chair_black, mbl_ts:chair_black_fallen, mbl_ts:chair_black_fallen_2
    const patterns = [
        /chair_(\w+)_fallen_2$/, // Match fallen_2 first (most specific)
        /chair_(\w+)_fallen$/, // Match fallen second
        /chair_(\w+)$/, // Match basic chair last
    ];
    for (const pattern of patterns) {
        const match = blockId.match(pattern);
        if (match) {
            const color = match[1];
            // Make sure it's a valid chair color
            const validColors = ["black", "blue", "gray", "green", "red"];
            if (validColors.includes(color)) {
                return color;
            }
        }
    }
    return null;
}
/**
 * Extract backpack color from a block ID
 */
function extractBackpackColor(blockId) {
    const colorPattern = /(\w+)_backpack_block/;
    const match = blockId.match(colorPattern);
    return match ? match[1] : null;
}
/**
 * Quick and efficient nearby furniture search - only checks immediate surrounding blocks
 */
function findNearbyFurnitureTheme(block, familyName) {
    const centerPos = block.location;
    const radius = 3; // Smaller, more efficient radius
    // Simple and fast search pattern - check key positions first
    const searchOffsets = [
        // Adjacent blocks (most likely to have matching furniture)
        { x: 1, y: 0, z: 0 },
        { x: -1, y: 0, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: -1 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: -1, z: 0 },
        // Diagonal adjacent
        { x: 1, y: 0, z: 1 },
        { x: -1, y: 0, z: -1 },
        { x: 1, y: 0, z: -1 },
        { x: -1, y: 0, z: 1 },
        // 2-block radius key positions
        { x: 2, y: 0, z: 0 },
        { x: -2, y: 0, z: 0 },
        { x: 0, y: 0, z: 2 },
        { x: 0, y: 0, z: -2 },
    ];
    for (const offset of searchOffsets) {
        try {
            const checkPos = {
                x: Math.floor(centerPos.x + offset.x),
                y: Math.floor(centerPos.y + offset.y),
                z: Math.floor(centerPos.z + offset.z),
            };
            const checkBlock = block.dimension.getBlock(checkPos);
            if (!checkBlock)
                continue;
            const blockId = checkBlock.typeId;
            if (familyName === "chairs") {
                // Quick chair check - use simple array lookup
                const allChairs = [
                    ...standingChairs,
                    ...fallenSidewaysChairs,
                    ...fallenChairs,
                ];
                if (allChairs.includes(blockId)) {
                    const color = extractChairColor(blockId);
                    if (color) {
                        return color;
                    }
                }
            }
            else if (familyName === "storage") {
                const allStorage = [...cupboards, ...draws, ...woodenCrates];
                if (allStorage.includes(blockId)) {
                    const woodType = extractWoodType(blockId);
                    if (woodType) {
                        return woodType;
                    }
                }
            }
            else if (familyName === "shelving") {
                const allShelving = [...standingShelvingRacks, ...fallenShelvingRacks];
                if (allShelving.includes(blockId)) {
                    const woodType = extractWoodType(blockId);
                    if (woodType) {
                        return woodType;
                    }
                }
            }
        }
        catch (error) {
            // Skip invalid positions silently
            continue;
        }
    }
    return null;
}
// Track which placement blocks have already been randomized
const processedPlacementBlocks = new Set();
/**
 * Check if a position is within 50 blocks of world spawn point
 */
function isNearSpawnPoint(position) {
    const spawnPoint = world.getDefaultSpawnLocation();
    const distance = Math.sqrt(Math.pow(position.x - spawnPoint.x, 2) +
        Math.pow(position.z - spawnPoint.z, 2));
    return distance <= 50;
}
/**
 * Handle placement block randomization on tick
 */
export function onPlacementBlock(event) {
    const block = event.block;
    const blockId = block.typeId;
    const position = block.location;
    // Check if structure is too close to spawn point
    if (isNearSpawnPoint(position)) {
        block.setPermutation(BlockPermutation.resolve("minecraft:air"));
        return;
    }
    // Create unique identifier for this block position
    const blockKey = `${position.x}_${position.y}_${position.z}`;
    // Skip if already processed
    if (processedPlacementBlocks.has(blockKey))
        return;
    // Check if this is a placement block we handle
    const variants = placementBlockVariants[blockId];
    if (!variants) {
        return;
    }
    // Mark as processed
    processedPlacementBlocks.add(blockKey);
    try {
        // Handle 50/50 chance items
        if (fiftyFiftyPlacementBlocks.includes(blockId)) {
            const shouldSpawn = Math.random() < 0.5;
            if (!shouldSpawn) {
                // Replace with air
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
                return;
            }
        }
        let selectedVariant;
        // Check if this placement block belongs to a furniture family
        const familyName = placementBlockFamilies[blockId];
        if (familyName) {
            // Handle backpacks differently - they should always be random
            if (familyName === "backpacks") {
                selectedVariant = variants[Math.floor(Math.random() * variants.length)];
            }
            else {
                // For other furniture families, try to match nearby furniture
                let familyTheme = findNearbyFurnitureTheme(block, familyName);
                if (familyTheme) {
                    // Found matching furniture nearby - use its theme
                    if (familyName === "chairs") {
                        selectedVariant = findBestChairVariant(variants, familyTheme);
                    }
                    else {
                        selectedVariant = findBestVariant(variants, familyTheme);
                    }
                }
                else {
                    // No nearby furniture found - use random for immediate placement
                    selectedVariant =
                        variants[Math.floor(Math.random() * variants.length)];
                }
            }
        }
        else {
            // Not part of a furniture family, use random
            selectedVariant = variants[Math.floor(Math.random() * variants.length)];
        }
        // Get the current rotation/direction from the placement block
        const currentStates = block.permutation.getAllStates();
        const originalDirection = currentStates["minecraft:cardinal_direction"];
        // Determine final rotation
        let finalDirection = originalDirection;
        // Check if this block type should get random rotation
        if (randomRotationBlocks.includes(selectedVariant)) {
            const cardinalDirections = ["north", "south", "east", "west"];
            finalDirection =
                cardinalDirections[Math.floor(Math.random() * cardinalDirections.length)];
        }
        // Create the new block with the determined rotation
        let newPermutation = BlockPermutation.resolve(selectedVariant);
        if (finalDirection) {
            newPermutation = newPermutation.withState("minecraft:cardinal_direction", finalDirection);
        }
        // Replace the placement block
        block.setPermutation(newPermutation);
    }
    catch (error) {
        // If anything goes wrong, just place a random variant or remove the block
        try {
            if (fiftyFiftyPlacementBlocks.includes(blockId)) {
                block.setPermutation(BlockPermutation.resolve("minecraft:air"));
            }
            else {
                const randomVariant = variants[Math.floor(Math.random() * variants.length)];
                block.setPermutation(BlockPermutation.resolve(randomVariant));
            }
        }
        catch (finalError) {
            // Last resort - remove the block
            block.setPermutation(BlockPermutation.resolve("minecraft:air"));
        }
    }
}
/**
 * Debug function to test placement block system
 */
export function testPlacementSystem() {
    // Test function for debugging placement blocks
}
