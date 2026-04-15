/**
 * Composter System - Handles adding compostable items to composters
 * Maps all rotten/spoiled food items with their composting chance rates
 */
// Composting chance rates for all compostable items
const COMPOSTABLE_ITEMS = {
    // 85% chance items (fully rotten)
    "mbl_ts:rotted_wheat": 85,
    "mbl_ts:rotten_apple": 85,
    "mbl_ts:rotten_beef": 85,
    "mbl_ts:rotten_beetroot": 85,
    "mbl_ts:rotten_broad_bean": 85,
    "mbl_ts:rotten_chicken": 85,
    "mbl_ts:rotten_cod": 85,
    "mbl_ts:rotten_egg": 85,
    "mbl_ts:rotten_mutton": 85,
    "mbl_ts:rotten_porkchop": 85,
    "mbl_ts:rotten_salmon": 85,
    // 80% chance items (spoiled)
    "mbl_ts:spoiled_cod": 80,
    "mbl_ts:spoiled_mushroom_stew": 80,
    "mbl_ts:spoiled_pie": 80,
    "mbl_ts:spoiled_salmon": 80,
    // 75% chance items
    "mbl_ts:rancid_peanut": 75,
    // 70% chance items (slimy/dead)
    "mbl_ts:dead_glow_berries": 70,
    "mbl_ts:slimy_carrot": 70,
    "mbl_ts:slimy_chicken": 70,
    "mbl_ts:slimy_cod": 70,
    "mbl_ts:slimy_melon": 70,
    "mbl_ts:slimy_salmon": 70,
    "mbl_ts:slimy_spinach": 70,
    // 65% chance items (mouldy/moldy)
    "mbl_ts:moldy_lentil": 65,
    "mbl_ts:mouldy_bread": 65,
    "mbl_ts:mouldy_cookie": 65,
    "mbl_ts:mouldy_potato": 65,
    "mbl_ts:mouldy_sweet_berries": 65,
    // 60% chance items (fermented/sour/squashed)
    "mbl_ts:fermented_beetroot_soup": 60,
    "mbl_ts:sour_beetroot_soup": 60,
    "mbl_ts:spoiling_wheat": 60,
    "mbl_ts:squashed_berries": 60,
    // 55% chance items (dull/soft/wilted/wrinkled)
    "mbl_ts:dull_glow_berries": 55,
    "mbl_ts:soft_broad_bean": 55,
    "mbl_ts:soft_cookie": 55,
    "mbl_ts:wilted_carrot": 55,
    "mbl_ts:wrinkled_beetroot": 55,
    // 50% chance items (cracked/musty/sour/sprouting/wilting)
    "mbl_ts:cracked_egg": 50,
    "mbl_ts:musty_lentil": 50,
    "mbl_ts:sour_milk_bucket": 50,
    "mbl_ts:sprouting_potato": 50,
    "mbl_ts:wilting_spinach": 50,
    // 45% chance items (dry/stale)
    "mbl_ts:dry_pumpkin_pie": 45,
    "mbl_ts:stale_beef": 45,
    "mbl_ts:stale_bread": 45,
    "mbl_ts:stale_melon": 45,
    "mbl_ts:stale_mutton": 45,
    "mbl_ts:stale_porkchop": 45,
    "mbl_ts:stale_rabbit": 45,
    // 40% chance items (gamey/spoiling/stale)
    "mbl_ts:gamey_rabbit": 40,
    "mbl_ts:gamey_rabbit_stew": 40,
    "mbl_ts:spoiling_milk_bucket": 40,
    "mbl_ts:stale_peanut": 40,
    // 35% chance items (bruised)
    "mbl_ts:bruised_apple": 35,
    "mbl_ts:bruised_tomato": 35,
    // 30% chance items (cold)
    "mbl_ts:cold_baked_potato": 25,
    "mbl_ts:cold_chicken": 30,
    "mbl_ts:cold_mushroom_stew": 30,
    "mbl_ts:cold_mutton": 30,
    "mbl_ts:cold_porkchop": 30,
    "mbl_ts:cold_rabbit": 30,
    "mbl_ts:cold_rabbit_stew": 30,
    "mbl_ts:cold_steak": 30,
};
/**
 * Check if an item is compostable
 */
export function isCompostable(itemTypeId) {
    return itemTypeId in COMPOSTABLE_ITEMS;
}
/**
 * Get the composting chance for an item (0-100)
 */
function getCompostingChance(itemTypeId) {
    return COMPOSTABLE_ITEMS[itemTypeId] || 0;
}
/**
 * Get the current composter level from block state
 */
function getComposterLevel(block) {
    try {
        const composterLevel = block.permutation.getState("composter_fill_level");
        return typeof composterLevel === "number" ? composterLevel : 0;
    }
    catch {
        return 0;
    }
}
/**
 * Set the composter level
 */
function setComposterLevel(block, level) {
    try {
        const newPermutation = block.permutation.withState("composter_fill_level", level);
        block.setPermutation(newPermutation);
    }
    catch { }
}
/**
 * Handle composter interaction when player is holding compostable food
 * Returns true if item was composted, false otherwise
 */
export function handleComposterInteraction(player, block, heldItem) {
    try {
        // Check if block is a composter
        if (block.typeId !== "minecraft:composter") {
            return false;
        }
        // Check if item is compostable
        if (!isCompostable(heldItem.typeId)) {
            return false;
        }
        // Get current composter level
        const currentLevel = getComposterLevel(block);
        // If composter is full (level 8), don't add more
        if (currentLevel >= 8) {
            return false;
        }
        // Get composting chance for this item
        const chance = getCompostingChance(heldItem.typeId);
        // Roll the dice (0-100)
        const roll = Math.random() * 100;
        // If successful, increase composter level
        if (roll < chance) {
            const newLevel = Math.min(currentLevel + 1, 8);
            setComposterLevel(block, newLevel);
            // Play composter fill sound
            block.dimension.playSound("block.composter.fill_success", block.location);
            // Spawn success particle effect (green particles)
            block.dimension.spawnParticle("minecraft:crop_growth_emitter", {
                x: block.location.x + 0.5,
                y: block.location.y + 0.5,
                z: block.location.z + 0.5
            });
        }
        else {
            // Play composter fill sound (even on failure in vanilla)
            block.dimension.playSound("block.composter.fill", block.location);
            // Spawn fail particle effect (brown/dust particles)
        }
        // Always consume the item (vanilla behavior)
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Custom component handler for composter block interaction
 * Use this with block custom components
 */
export function onComposterInteract(event) {
    try {
        const player = event.player;
        if (!player)
            return;
        const block = event.block;
        if (!block)
            return;
        // Get the item the player is holding
        const inventory = player.getComponent("minecraft:inventory");
        if (!inventory?.container)
            return;
        const heldItem = inventory.container.getItem(player.selectedSlotIndex);
        if (!heldItem)
            return;
        // Try to compost the item
        const wasComposted = handleComposterInteraction(player, block, heldItem);
        // If item was composted, decrease stack
        if (wasComposted) {
            if (heldItem.amount > 1) {
                heldItem.amount -= 1;
                inventory.container.setItem(player.selectedSlotIndex, heldItem);
            }
            else {
                inventory.container.setItem(player.selectedSlotIndex, undefined);
            }
        }
    }
    catch { }
}
