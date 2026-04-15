import { BlockPermutation, system } from "@minecraft/server";
export function onCupboardInteract(event) {
    const block = event.block;
    const player = event.player;
    const blockLocation = block.location;
    // Configuration for different loot blocks
    const lootBlocks = {
        "mbl_ts:trash_can": { sound: "block.ts_trash_can.open", lootTable: "mobblocks/ts/blocks/loot_blocks/trash_can" },
        "mbl_ts:toolbox": { sound: "block.ts_toolbox.open", lootTable: "mobblocks/ts/blocks/loot_blocks/toolbox" },
        "mbl_ts:blue_backpack": { sound: "block.ts_backpack.open", lootTable: "mobblocks/ts/blocks/loot_blocks/blue_backpack" },
        "mbl_ts:red_backpack": { sound: "block.ts_backpack.open", lootTable: "mobblocks/ts/blocks/loot_blocks/red_backpack" },
        "mbl_ts:brown_backpack": { sound: "block.ts_backpack.open", lootTable: "mobblocks/ts/blocks/loot_blocks/brown_backpack" },
        "mbl_ts:gray_backpack": { sound: "block.ts_backpack.open", lootTable: "mobblocks/ts/blocks/loot_blocks/gray_backpack" },
        "mbl_ts:green_backpack": { sound: "block.ts_backpack.open", lootTable: "mobblocks/ts/blocks/loot_blocks/green_backpack" },
        // Backpack Blocks
        "mbl_ts:blue_backpack_block": { sound: "block.ts_backpack.open", lootTable: "mobblocks/ts/blocks/loot_blocks/backpacks/blue_backpack" },
        "mbl_ts:red_backpack_block": { sound: "block.ts_backpack.open", lootTable: "mobblocks/ts/blocks/loot_blocks/backpacks/red_backpack" },
        "mbl_ts:brown_backpack_block": { sound: "block.ts_backpack.open", lootTable: "mobblocks/ts/blocks/loot_blocks/backpacks/brown_backpack" },
        "mbl_ts:gray_backpack_block": { sound: "block.ts_backpack.open", lootTable: "mobblocks/ts/blocks/loot_blocks/backpacks/gray_backpack" },
        "mbl_ts:green_backpack_block": { sound: "block.ts_backpack.open", lootTable: "mobblocks/ts/blocks/loot_blocks/backpacks/green_backpack" },
        "mbl_ts:first_aid_kit": { sound: "block.ts_first_aid.open", lootTable: "mobblocks/ts/blocks/loot_blocks/first_aid_kit" },
        // Cupboards
        "mbl_ts:cupboard_acacia": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/cupboards/acacia" },
        "mbl_ts:cupboard_birch": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/cupboards/birch" },
        "mbl_ts:cupboard_cherry": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/cupboards/cherry" },
        "mbl_ts:cupboard_dark_oak": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/cupboards/dark_oak" },
        "mbl_ts:cupboard_jungle": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/cupboards/jungle" },
        "mbl_ts:cupboard_mangrove": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/cupboards/mangrove" },
        "mbl_ts:cupboard_oak": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/cupboards/oak" },
        "mbl_ts:cupboard_pale": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/cupboards/pale" },
        "mbl_ts:cupboard_spruce": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/cupboards/spruce" },
        // Drawers
        "mbl_ts:draws_acacia": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/draws/acacia" },
        "mbl_ts:draws_birch": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/draws/birch" },
        "mbl_ts:draws_cherry": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/draws/cherry" },
        "mbl_ts:draws_dark_oak": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/draws/dark_oak" },
        "mbl_ts:draws_jungle": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/draws/jungle" },
        "mbl_ts:draws_mangrove": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/draws/mangrove" },
        "mbl_ts:draws_oak": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/draws/oak" },
        "mbl_ts:draws_pale": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/draws/pale" },
        "mbl_ts:draws_spruce": { sound: "block.ts_draws.open", lootTable: "mobblocks/ts/blocks/loot_blocks/draws/spruce" },
        // Wooden Crates
        "mbl_ts:wooden_crate_acacia": { sound: "block.ts_wooden_crate.open", lootTable: "mobblocks/ts/blocks/loot_blocks/wooden_crates/acacia" },
        "mbl_ts:wooden_crate_birch": { sound: "block.ts_wooden_crate.open", lootTable: "mobblocks/ts/blocks/loot_blocks/wooden_crates/birch" },
        "mbl_ts:wooden_crate_jungle": { sound: "block.ts_wooden_crate.open", lootTable: "mobblocks/ts/blocks/loot_blocks/wooden_crates/jungle" },
        "mbl_ts:wooden_crate_oak": { sound: "block.ts_wooden_crate.open", lootTable: "mobblocks/ts/blocks/loot_blocks/wooden_crates/oak" },
        "mbl_ts:wooden_crate_spruce": { sound: "block.ts_wooden_crate.open", lootTable: "mobblocks/ts/blocks/loot_blocks/wooden_crates/spruce" }
    };
    // Check if block is unopened and is a configured loot block
    const currentStage = block.permutation.getAllStates();
    const blockConfig = lootBlocks[block.typeId];
    if (currentStage['mbl_ts:stage'] === 0 && blockConfig) {
        // Update block stage
        const rotation = currentStage['minecraft:cardinal_direction'];
        block.setPermutation(BlockPermutation.resolve(block.typeId, { 'mbl_ts:stage': currentStage['mbl_ts:stage'] + 1, 'minecraft:cardinal_direction': rotation }));
        // Play sound, spawn loot and XP
        system.run(() => {
            const centerX = blockLocation.x + 0.5;
            const centerY = blockLocation.y + 1.0;
            const centerZ = blockLocation.z + 0.5;
            // Use configured sound or default to drawers sound
            const soundToPlay = blockConfig.sound || "block.ts_draws.open";
            block.dimension.playSound(soundToPlay, blockLocation, { pitch: 1.0, volume: 1.0 });
            block.dimension.runCommand(`loot spawn ${centerX} ${centerY} ${centerZ} loot "${blockConfig.lootTable}"`);
            block.dimension.runCommand(`summon xp_orb ${centerX} ${centerY} ${centerZ}`);
        });
    }
}
