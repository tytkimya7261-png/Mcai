import { world, system, ItemStack } from "@minecraft/server";
import { encodeString, decodeString } from "../utils";
const FOOD_EXPIRY_CONFIG = [
    // Two-stage spoilage items (fresh → spoiling → final)
    {
        itemId: 'minecraft:wheat',
        into: "mbl_ts:spoiling_wheat",
        days: 5
    },
    {
        itemId: 'mbl_ts:spoiling_wheat',
        into: "mbl_ts:rotted_wheat",
        days: 5
    },
    {
        itemId: 'minecraft:apple',
        into: "mbl_ts:bruised_apple",
        days: 3
    },
    {
        itemId: 'mbl_ts:bruised_apple',
        into: "mbl_ts:rotton_apple",
        days: 3
    },
    {
        itemId: 'minecraft:beetroot',
        into: "mbl_ts:wrinkled_beetroot",
        days: 3
    },
    {
        itemId: 'mbl_ts:wrinkled_beetroot',
        into: "mbl_ts:rotted_beetroot",
        days: 3
    },
    {
        itemId: 'minecraft:potato',
        into: "mbl_ts:sprouting_potato",
        days: 4
    },
    {
        itemId: 'mbl_ts:sprouting_potato',
        into: "mbl_ts:mouldy_potato",
        days: 4
    },
    {
        itemId: 'minecraft:carrot',
        into: "mbl_ts:wilted_carrot",
        days: 3
    },
    {
        itemId: 'mbl_ts:wilted_carrot',
        into: "mbl_ts:slimy_carrot",
        days: 3
    },
    {
        itemId: 'minecraft:melon_slice',
        into: "mbl_ts:stale_melon",
        days: 2
    },
    {
        itemId: 'mbl_ts:stale_melon',
        into: "mbl_ts:slimy_melon",
        days: 2
    },
    {
        itemId: 'minecraft:sweet_berries',
        into: "mbl_ts:squashed_berries",
        days: 1.5
    },
    {
        itemId: 'mbl_ts:squashed_berries',
        into: "mbl_ts:mouldy_sweet_berries",
        days: 1.5
    },
    {
        itemId: 'minecraft:glow_berries',
        into: "mbl_ts:dull_glow_berries",
        days: 2
    },
    {
        itemId: 'mbl_ts:dull_glow_berries',
        into: "mbl_ts:dead_glow_berries",
        days: 2
    },
    {
        itemId: 'minecraft:bread',
        into: "mbl_ts:stale_bread",
        days: 3
    },
    {
        itemId: 'mbl_ts:stale_bread',
        into: "mbl_ts:mouldy_bread",
        days: 3
    },
    {
        itemId: 'minecraft:pumpkin_pie',
        into: "mbl_ts:dry_pumpkin_pie",
        days: 2
    },
    {
        itemId: 'mbl_ts:dry_pumpkin_pie',
        into: "mbl_ts:spoiled_pie",
        days: 2
    },
    {
        itemId: 'minecraft:cookie',
        into: "mbl_ts:soft_cookie",
        days: 4
    },
    {
        itemId: 'mbl_ts:soft_cookie',
        into: "mbl_ts:mouldy_cookie",
        days: 4
    },
    {
        itemId: 'minecraft:beetroot_soup',
        into: "mbl_ts:fermented_beetroot_soup",
        days: 2
    },
    {
        itemId: 'mbl_ts:fermented_beetroot_soup',
        into: "mbl_ts:sour_beetroot_soup",
        days: 2
    },
    {
        itemId: 'minecraft:rabbit_stew',
        into: "mbl_ts:cold_rabbit_stew",
        days: 0.5
    },
    {
        itemId: 'mbl_ts:cold_rabbit_stew',
        into: "mbl_ts:gamey_rabbit_stew",
        days: 0.5
    },
    {
        itemId: 'minecraft:mushroom_stew',
        into: "mbl_ts:cold_mushroom_stew",
        days: 0.5
    },
    {
        itemId: 'mbl_ts:cold_mushroom_stew',
        into: "mbl_ts:spoiled_mushroom_stew",
        days: 0.5
    },
    {
        itemId: 'minecraft:baked_potato',
        into: "mbl_ts:cold_baked_potato",
        days: 1
    },
    {
        itemId: 'minecraft:porkchop',
        into: "mbl_ts:stale_porkchop",
        days: 1
    },
    {
        itemId: 'mbl_ts:stale_porkchop',
        into: "mbl_ts:rotton_porkchop",
        days: 1
    },
    {
        itemId: 'minecraft:beef',
        into: "mbl_ts:stale_beef",
        days: 1
    },
    {
        itemId: 'mbl_ts:stale_beef',
        into: "mbl_ts:rotton_beef",
        days: 1
    },
    {
        itemId: 'minecraft:mutton',
        into: "mbl_ts:stale_mutton",
        days: 1
    },
    {
        itemId: 'mbl_ts:stale_mutton',
        into: "mbl_ts:rotton_mutton",
        days: 1
    },
    {
        itemId: 'minecraft:rabbit',
        into: "mbl_ts:stale_rabbit",
        days: 1
    },
    {
        itemId: 'mbl_ts:stale_rabbit',
        into: "mbl_ts:gamey_rabbit",
        days: 1
    },
    {
        itemId: 'minecraft:cod',
        into: "mbl_ts:slimy_cod",
        days: 0.5
    },
    {
        itemId: 'minecraft:salmon',
        into: "mbl_ts:slimy_salmon",
        days: 0.5
    },
    {
        itemId: 'minecraft:cooked_chicken',
        into: "mbl_ts:cold_chicken",
        days: 1
    },
    {
        itemId: 'minecraft:cooked_porkchop',
        into: "mbl_ts:cold_porkchop",
        days: 1
    },
    {
        itemId: 'minecraft:cooked_beef',
        into: "mbl_ts:cold_steak",
        days: 1
    },
    {
        itemId: 'minecraft:cooked_mutton',
        into: "mbl_ts:cold_mutton",
        days: 1
    },
    {
        itemId: 'minecraft:cooked_rabbit',
        into: "mbl_ts:cold_rabbit",
        days: 1
    },
    {
        itemId: 'minecraft:cooked_cod',
        into: "mbl_ts:spoiled_cod",
        days: 1
    },
    {
        itemId: 'minecraft:cooked_salmon',
        into: "mbl_ts:spoiled_salmon",
        days: 1
    },
    {
        itemId: 'minecraft:egg',
        into: "mbl_ts:cracked_egg",
        days: 2
    },
    {
        itemId: 'mbl_ts:cracked_egg',
        into: "mbl_ts:rotton_egg",
        days: 2
    },
    {
        itemId: 'minecraft:milk_bucket',
        into: "mbl_ts:spoiling_milk_bucket",
        days: 0.75
    },
    {
        itemId: 'mbl_ts:spoiling_milk_bucket',
        into: "mbl_ts:sour_milk_bucket",
        days: 0.75
    },
    {
        itemId: 'mbl_ts:tomato',
        into: "mbl_ts:bruised_tomato",
        days: 1
    },
    {
        itemId: 'mbl_ts:spinach',
        into: "mbl_ts:wilting_spinach",
        days: 1
    },
    {
        itemId: 'mbl_ts:broad_bean',
        into: "mbl_ts:soft_broad_bean",
        days: 1
    },
    {
        itemId: 'mbl_ts:peanut',
        into: "mbl_ts:stale_peanut",
        days: 1
    },
    {
        itemId: 'mbl_ts:bruised_tomato',
        into: "mbl_ts:rotten_tomato",
        days: 1
    },
    {
        itemId: 'mbl_ts:wilting_spinach',
        into: "mbl_ts:slimy_spinach",
        days: 1
    },
    {
        itemId: 'mbl_ts:soft_broad_bean',
        into: "mbl_ts:rotten_broad_bean",
        days: 1
    },
    {
        itemId: 'mbl_ts:stale_peanut',
        into: "mbl_ts:rancid_peanut",
        days: 1
    },
    {
        itemId: 'mbl_ts:lentil',
        into: "mbl_ts:musty_lentil",
        days: 1
    },
    {
        itemId: 'mbl_ts:musty_lentil',
        into: "mbl_ts:mouldy_lentil",
        days: 1
    }
    // Single-stage items (only one transformation) are intentionally excluded from final transformation
];
// Helper to convert days to ticks (1 Minecraft day = 24000 ticks)
function daysToTicks(days) {
    return Math.floor(days * 24000);
}
// Helper to get expiry config for an item
function getFoodConfig(itemId) {
    return FOOD_EXPIRY_CONFIG.find(config => config.itemId === itemId);
}
/**
 * Efficiently gets all storage entities and blocks in front of the player using cone-shaped ray projection
 * Optimized for performance with minimal loops - called every 20 ticks
 */
export function getStorages(player) {
    const rayRange = 6; // Ray casting range
    const coneAngle = 30; // Cone angle in degrees (15 degrees each side)
    const rayCount = 5; // Number of rays in the cone
    const entities = [];
    const blocks = [];
    // Get player's view direction and position
    const viewDirection = player.getViewDirection();
    const playerLocation = player.location;
    const headOffset = player.getHeadLocation().y - playerLocation.y;
    // Calculate perpendicular vector for cone spreading (horizontal spread)
    const rightVector = {
        x: -viewDirection.z, // Perpendicular to view direction
        y: 0, // Keep horizontal
        z: viewDirection.x
    };
    // Normalize the right vector
    const rightLength = Math.sqrt(rightVector.x * rightVector.x + rightVector.z * rightVector.z);
    if (rightLength > 0) {
        rightVector.x /= rightLength;
        rightVector.z /= rightLength;
    }
    // Pre-calculate step vector for ray projection (normalize to 0.5 block increments)
    const stepLength = 0.5;
    // Storage block types (chest-like containers and all shulker box variants)
    const storageBlockTypes = new Set([
        'minecraft:chest',
        'minecraft:trapped_chest',
        'minecraft:barrel',
        'minecraft:undyed_shulker_box',
        'minecraft:white_shulker_box',
        'minecraft:orange_shulker_box',
        'minecraft:magenta_shulker_box',
        'minecraft:light_blue_shulker_box',
        'minecraft:yellow_shulker_box',
        'minecraft:lime_shulker_box',
        'minecraft:pink_shulker_box',
        'minecraft:gray_shulker_box',
        'minecraft:light_gray_shulker_box',
        'minecraft:cyan_shulker_box',
        'minecraft:purple_shulker_box',
        'minecraft:blue_shulker_box',
        'minecraft:brown_shulker_box',
        'minecraft:green_shulker_box',
        'minecraft:red_shulker_box',
        'minecraft:black_shulker_box',
        'minecraft:ender_chest',
        'minecraft:hopper',
        'minecraft:dropper',
        'minecraft:dispenser'
    ]);
    // Get dimension for efficient entity/block queries
    const dimension = player.dimension;
    // Create cone of rays
    const maxSteps = Math.ceil(rayRange / stepLength);
    const angleStep = (coneAngle * Math.PI / 180) / (rayCount - 1); // Convert to radians
    const halfAngle = (coneAngle * Math.PI / 180) / 2;
    // Ensure we always have a center ray pointing exactly where the player is looking
    const rayAngles = [];
    // Add center ray (angle = 0)
    rayAngles.push(0);
    // Add side rays
    for (let i = 1; i < rayCount; i++) {
        const angle = -halfAngle + (i * angleStep);
        rayAngles.push(angle);
    }
    for (const angle of rayAngles) {
        // Calculate ray direction for this angle
        let rayDirection;
        if (angle === 0) {
            // Center ray - use exact view direction
            rayDirection = { ...viewDirection };
        }
        else {
            // Side rays - apply angle offset
            rayDirection = {
                x: viewDirection.x * Math.cos(angle) + rightVector.x * Math.sin(angle),
                y: viewDirection.y,
                z: viewDirection.z * Math.cos(angle) + rightVector.z * Math.sin(angle)
            };
        }
        const stepVector = {
            x: rayDirection.x * stepLength,
            y: rayDirection.y * stepLength,
            z: rayDirection.z * stepLength
        };
        // Cast this ray
        for (let step = 1; step <= maxSteps; step++) {
            // Project ray position
            const rayPosition = {
                x: playerLocation.x + stepVector.x * step,
                y: playerLocation.y + headOffset + stepVector.y * step,
                z: playerLocation.z + stepVector.z * step
            };
            // Round to block coordinates for block checking
            const baseBlockLocation = {
                x: Math.floor(rayPosition.x),
                y: Math.floor(rayPosition.y),
                z: Math.floor(rayPosition.z)
            };
            // Check 3 Y levels: below, at, and above the ray position
            const yOffsets = [-1, 0, 1];
            for (const yOffset of yOffsets) {
                const blockLocation = {
                    x: baseBlockLocation.x,
                    y: baseBlockLocation.y + yOffset,
                    z: baseBlockLocation.z
                };
                try {
                    // Check for storage block at this position
                    const block = dimension.getBlock(blockLocation);
                    if (block && storageBlockTypes.has(block.typeId)) {
                        // Avoid duplicates using coordinate check
                        if (!blocks.some(b => b.location.x === blockLocation.x &&
                            b.location.y === blockLocation.y &&
                            b.location.z === blockLocation.z)) {
                            blocks.push(block);
                        }
                    }
                    // Check for entities with storage component in 1x1x1 area around ray position
                    // Use getEntitiesAtBlockLocation for efficiency
                    const nearbyEntities = dimension.getEntitiesAtBlockLocation(blockLocation);
                    for (const entity of nearbyEntities) {
                        // Skip players - they have inventory but shouldn't be treated as storage
                        if (entity.typeId === 'minecraft:player') {
                            continue;
                        }
                        // Check if entity has inventory component (storage capability)
                        const inventoryComponent = entity.getComponent("inventory");
                        if (inventoryComponent && !entities.includes(entity)) {
                            entities.push(entity);
                        }
                    }
                }
                catch (error) {
                    // Skip invalid block positions (out of world bounds, unloaded chunks, etc.)
                    continue;
                }
            }
        }
    }
    return { entities, blocks };
}
/**
 * Processes food expiry for player inventory and all detected storage containers
 * Checks timestamps encoded in item lore and replaces expired items
 */
export function processFoodExpiry(player) {
    const currentTick = system.currentTick;
    const storages = getStorages(player);
    // Process player inventory
    const playerInventory = player.getComponent("inventory");
    if (playerInventory?.container) {
        processContainerFoodExpiry(playerInventory.container, currentTick);
    }
    // Process all detected storage blocks
    for (const block of storages.blocks) {
        const inventory = block.getComponent("inventory");
        if (inventory?.container) {
            processContainerFoodExpiry(inventory.container, currentTick);
        }
    }
    // Process all detected storage entities
    for (const entity of storages.entities) {
        const inventory = entity.getComponent("inventory");
        if (inventory?.container) {
            processContainerFoodExpiry(inventory.container, currentTick);
        }
    }
}
/**
 * Processes food expiry for a specific container
 */
function processContainerFoodExpiry(container, currentTick) {
    // First pass: Update all food items with current time
    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (!item)
            continue;
        const foodConfig = getFoodConfig(item.typeId);
        if (!foodConfig)
            continue; // Not a food item we track
        const updatedItem = processFoodItem(item, foodConfig, currentTick);
        // Only update the container if the item actually changed
        if (updatedItem !== item) {
            container.setItem(i, updatedItem);
        }
    }
    // Second pass: Auto-stack similar items
    autoStackSimilarFoodItems(container);
}
/**
 * Automatically stacks food items with similar timestamps (within 1 minute)
 * Merges items with the same type and similar timestamps into single stacks
 */
function autoStackSimilarFoodItems(container) {
    const STACK_TIME_THRESHOLD = 1200; // 1 minute in ticks (20 ticks/sec * 60 sec)
    // Track which slots have been processed to avoid re-processing
    const processedSlots = new Set();
    for (let i = 0; i < container.size; i++) {
        if (processedSlots.has(i))
            continue;
        const baseItem = container.getItem(i);
        if (!baseItem)
            continue;
        const baseFoodConfig = getFoodConfig(baseItem.typeId);
        if (!baseFoodConfig)
            continue; // Not a food item we track
        const baseTimestamp = extractTimestampFromItem(baseItem);
        if (baseTimestamp === null)
            continue; // No timestamp found
        // Get max stack size for this item (default to 64)
        const maxStackSize = baseItem.maxAmount || 64;
        let currentAmount = baseItem.amount;
        // Skip if already at max stack
        if (currentAmount >= maxStackSize) {
            processedSlots.add(i);
            continue;
        }
        // Look for similar items to merge
        for (let j = i + 1; j < container.size; j++) {
            if (processedSlots.has(j))
                continue;
            const compareItem = container.getItem(j);
            if (!compareItem)
                continue;
            // Skip if the compare item is already at max stack - don't merge full stacks with smaller ones
            const compareMaxStackSize = compareItem.maxAmount || 64;
            if (compareItem.amount >= compareMaxStackSize)
                continue;
            // Must be same item type
            if (compareItem.typeId !== baseItem.typeId)
                continue;
            const compareTimestamp = extractTimestampFromItem(compareItem);
            if (compareTimestamp === null)
                continue;
            // Check if timestamps are within threshold (1 minute)
            const timeDifference = Math.abs(baseTimestamp - compareTimestamp);
            if (timeDifference > STACK_TIME_THRESHOLD)
                continue;
            // Can merge! Use the older timestamp (higher value = older)
            const mergedTimestamp = Math.max(baseTimestamp, compareTimestamp);
            const spaceAvailable = maxStackSize - currentAmount;
            const amountToMerge = Math.min(spaceAvailable, compareItem.amount);
            // Merge items
            currentAmount += amountToMerge;
            const remainingAmount = compareItem.amount - amountToMerge;
            // Update the base stack with merged amount and older timestamp
            const mergedItem = createItemWithLore(new ItemStack(baseItem.typeId, currentAmount), baseFoodConfig, mergedTimestamp, world.getAbsoluteTime(), false);
            container.setItem(i, mergedItem);
            // Handle remaining items in the compare slot
            if (remainingAmount > 0) {
                // Keep remaining items with their original timestamp
                const remainingItem = createItemWithLore(new ItemStack(compareItem.typeId, remainingAmount), baseFoodConfig, compareTimestamp, world.getAbsoluteTime(), false);
                container.setItem(j, remainingItem);
            }
            else {
                // All items merged, clear the slot
                container.setItem(j, undefined);
                processedSlots.add(j);
            }
            // If base stack is now full, stop merging
            if (currentAmount >= maxStackSize) {
                break;
            }
        }
        processedSlots.add(i);
    }
}
/**
 * Extracts the timestamp from a food item's lore
 * Returns null if no timestamp is found
 */
function extractTimestampFromItem(item) {
    const lore = item.getLore();
    if (lore.length === 0)
        return null;
    try {
        const decoded = decodeString(lore[0]);
        if (decoded.startsWith("t:")) {
            return parseInt(decoded.substring(2));
        }
    }
    catch {
        // Not encoded data
    }
    return null;
}
/**
 * Processes a single food item for expiry and timestamp management
 * Only returns a new ItemStack when the lore actually needs to change
 */
function processFoodItem(item, config, currentTick) {
    const lore = item.getLore();
    // Check if item is already fully spoiled (final stage) - don't process further
    if (lore.length > 1 && lore.some(line => line.includes("§r§cFully Spoiled"))) {
        return item; // Return unchanged - already at final state
    }
    let timestamp = null;
    // Check if first line contains encoded timestamp
    if (lore.length > 0) {
        try {
            const decoded = decodeString(lore[0]);
            // Check for timestamp format (t:123456)
            const parts = decoded.split('|');
            for (const part of parts) {
                if (part.startsWith('t:')) {
                    const parsed = parseInt(part.substring(2));
                    if (!isNaN(parsed) && parsed > 0) {
                        timestamp = parsed;
                        break;
                    }
                }
            }
        }
        catch {
            // First line is not encoded data
        }
    }
    // If no timestamp found, this is a fresh item - add timestamp and lore
    if (timestamp === null) {
        timestamp = currentTick;
        return createItemWithLore(item, config, timestamp, currentTick, false);
    }
    // Check expiry - consider expired if less than 1 minute remaining
    const age = currentTick - timestamp;
    const ticksToExpire = daysToTicks(config.days);
    const ticksRemaining = ticksToExpire - age;
    if (ticksRemaining <= 1200) { // Less than 1 minute remaining = expired
        // Item has expired - create new expired item
        try {
            const expiredItem = new ItemStack(config.into, item.amount);
            // Check if expired item also has expiry config (for multi-stage expiry)
            const expiredConfig = getFoodConfig(config.into);
            if (expiredConfig) {
                return createItemWithLore(expiredItem, expiredConfig, currentTick, currentTick, true);
            }
            else {
                // Final stage - no further decay
                const finalLore = [];
                finalLore.push(encodeString(`t:${timestamp}`));
                finalLore.push("§r§cFully Spoiled");
                finalLore.push("§r§7Wouldn't Recommend Eating This!");
                expiredItem.setLore(finalLore);
                return expiredItem;
            }
        }
        catch (error) {
            // Item doesn't exist - mark current item as fully spoiled instead
            const finalLore = [];
            finalLore.push(encodeString(`t:${timestamp}`));
            finalLore.push("§r§cFully Spoiled");
            finalLore.push("§r§7This food cannot be consumed");
            finalLore.push("§r§8Invalid transformation prevented");
            const spoiledItem = item.clone();
            spoiledItem.setLore(finalLore);
            return spoiledItem;
        }
    }
    // Calculate what the time display should be
    const totalRealTimeMinutes = Math.floor(ticksRemaining / 1200);
    const currentDaysRemaining = Math.floor(totalRealTimeMinutes / 20);
    const currentMinutesRemaining = totalRealTimeMinutes % 20;
    // Check if current lore matches what it should be
    const expectedTimeDisplay = `§r§6Days: §r§7${currentDaysRemaining} §r§7(§r§e${currentMinutesRemaining} Minutes§r§7)`;
    // If we have lore, check if the time display matches
    if (lore.length >= 3) {
        const currentTimeDisplay = lore[2];
        // Only update if the time display is different from expected
        if (currentTimeDisplay !== expectedTimeDisplay) {
            return createItemWithLore(item, config, timestamp, currentTick, false);
        }
    }
    else {
        // Item doesn't have proper lore structure, add it
        return createItemWithLore(item, config, timestamp, currentTick, false);
    }
    // No changes needed, return original item
    return item;
}
/**
 * Helper function to create an item with proper lore structure
 * Always creates exactly 3 lines of lore
 */
function createItemWithLore(item, config, timestamp, currentTick, isExpired) {
    const newItem = new ItemStack(item.typeId, item.amount);
    // Copy nameTag if it exists
    if (item.nameTag) {
        newItem.nameTag = item.nameTag;
    }
    const age = currentTick - timestamp;
    const ticksToExpire = daysToTicks(config.days);
    const ticksRemaining = Math.max(0, ticksToExpire - age);
    const totalRealTimeMinutes = Math.floor(ticksRemaining / 1200);
    const daysRemaining = Math.floor(totalRealTimeMinutes / 20);
    const minutesRemaining = totalRealTimeMinutes % 20;
    // Create exactly 3 lines of lore
    const newLore = [];
    newLore.push(encodeString(`t:${timestamp}`)); // Line 1: Encoded timestamp
    if (isExpired) {
        newLore.push("§r§cExpired - Will decay further:"); // Line 2: Status
    }
    else {
        newLore.push("§r§eSpoiling in:"); // Line 2: Status
    }
    newLore.push(`§r§6Days: §r§7${daysRemaining} §r§7(§r§e${minutesRemaining} Minutes§r§7)`); // Line 3: Time display
    newItem.setLore(newLore);
    return newItem;
}
