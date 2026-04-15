import { BlockPermutation, ItemStack, system, world, EntityComponentTypes, EquipmentSlot, Direction } from "@minecraft/server";
export class AppleBlock {
    static getBlockData(block) {
        let scoreboard = world.scoreboard.getObjective("mbl_ts_apple_block");
        if (!scoreboard) {
            world.scoreboard.addObjective("mbl_ts_apple_block");
            scoreboard = world.scoreboard.getObjective("mbl_ts_apple_block");
            const data = JSON.stringify({ location: block.location, time: system.currentTick });
            scoreboard.setScore(data, 0);
            return JSON.parse(data);
        }
        const entries = scoreboard.getParticipants();
        for (const entry of entries) {
            const data = JSON.parse(entry.displayName);
            if (data.location.x === block.location.x && data.location.y === block.location.y && data.location.z === block.location.z) {
                return data;
            }
        }
    }
    static setBlockData(block, data) {
        let scoreboard = world.scoreboard.getObjective("mbl_ts_apple_block");
        if (!scoreboard) {
            world.scoreboard.addObjective("mbl_ts_apple_block");
            scoreboard = world.scoreboard.getObjective("mbl_ts_apple_block");
            scoreboard.setScore(JSON.stringify(data), 0);
            return;
        }
        const entries = scoreboard.getParticipants();
        for (const entry of entries) {
            const entryData = JSON.parse(entry.displayName);
            if (entryData.location.x === block.location.x && entryData.location.y === block.location.y && entryData.location.z === block.location.z) {
                scoreboard.removeParticipant(entry);
                scoreboard.setScore(JSON.stringify(data), 0);
                return;
            }
        }
        scoreboard.setScore(JSON.stringify(data), 0);
        return;
    }
    static pingBlock(block) {
        const data = this.getBlockData(block);
        if (!data) {
            const newData = { location: block.location, time: system.currentTick };
            this.setBlockData(block, newData);
            return;
        }
        //check if it can update to the next stage
        const stage = block.permutation.getAllStates()['mbl_ts:stage'];
        const ticksPerDay = 24000;
        if (stage === 0) {
            //check if 1 day has passed
            if (system.currentTick - data.time >= ticksPerDay) {
                //update to bruised apple block
                block.setPermutation(BlockPermutation.resolve("mbl_ts:apple_block", { "mbl_ts:stage": 1 }));
                data.time = system.currentTick;
                this.setBlockData(block, data);
            }
        }
        else if (stage === 1) {
            //check if 5 days have passed
            if (system.currentTick - data.time >= ticksPerDay * 5) {
                //update to rotten apple block
                block.setPermutation(BlockPermutation.resolve("mbl_ts:apple_block", { "mbl_ts:stage": 2 }));
                data.time = system.currentTick;
                this.setBlockData(block, data);
            }
        }
        else if (stage === 2) {
            //rotten apple block does not update anymore
            return;
        }
    }
    //this drops the correct items and then also removes the data from the scoreboard
    static removeBlock(block) {
        const scoreboard = world.scoreboard.getObjective("mbl_ts_apple_block");
        if (!scoreboard)
            return;
        const entries = scoreboard.getParticipants();
        for (const entry of entries) {
            const data = JSON.parse(entry.displayName);
            if (data.location.x === block.location.x && data.location.y === block.location.y && data.location.z === block.location.z) {
                const stage = block.permutation.getAllStates()['mbl_ts:stage'];
                if (stage === 0) {
                    //drop 1 apple
                    world.getDimension(block.dimension.id).spawnItem(new ItemStack("minecraft:apple", 1), { x: block.location.x + 0.5, y: block.location.y, z: block.location.z + 0.5 });
                }
                else if (stage === 1) {
                    //drop 1 bruised apple
                    world.getDimension(block.dimension.id).spawnItem(new ItemStack("mbl_ts:bruised_apple", 1), { x: block.location.x + 0.5, y: block.location.y, z: block.location.z + 0.5 });
                }
                else if (stage === 2) {
                    //drop 1-3 yeast
                    const amount = Math.floor(Math.random() * 3) + 1;
                    world.getDimension(block.dimension.id).spawnItem(new ItemStack("mbl_ts:yeast", amount), { x: block.location.x + 0.5, y: block.location.y, z: block.location.z + 0.5 });
                }
                scoreboard.removeParticipant(entry);
                block.setPermutation(BlockPermutation.resolve('minecraft:air'));
                return;
            }
        }
    }
}
/**
 * Allows players to place and interact with apple blocks
 * - Places apple blocks with appropriate stage based on apple type:
 *   - minecraft:apple → Stage 0 (Fresh texture)
 *   - mbl_ts:bruised_apple → Stage 1 (Bruised texture)
 * - Removes existing apple blocks when interacted with
 * - Blocks naturally progress: Stage 0 → Stage 1 → Stage 2 (rotten) over time
 */
export function placeAndTakeAppleBlock(player, block, face) {
    if (!player || !block)
        return undefined;
    // Calculate the target location based on the block face
    const targetLocation = { ...block.location };
    switch (face) {
        case Direction.Up:
            targetLocation.y += 1;
            break;
        case Direction.Down:
            targetLocation.y -= 1;
            break;
        case Direction.North:
            targetLocation.z -= 1;
            break;
        case Direction.South:
            targetLocation.z += 1;
            break;
        case Direction.East:
            targetLocation.x += 1;
            break;
        case Direction.West:
            targetLocation.x -= 1;
            break;
    }
    // Get the target block where we want to place/interact
    const targetBlock = block.dimension.getBlock(targetLocation);
    if (!targetBlock)
        return undefined;
    // Check if the target block is an apple block
    if (targetBlock.permutation.getAllStates()['mbl_ts:stage'] !== undefined) {
        // Remove the apple block and give the player the corresponding item
        AppleBlock.removeBlock(targetBlock);
        return;
    }
    // Only place apple block if the target location is air
    if (targetBlock.typeId !== "minecraft:air") {
        return; // Don't replace existing blocks, only air
    }
    // Check if player is holding an apple in their main hand
    const equippableComponent = player.getComponent(EntityComponentTypes.Equippable);
    if (!equippableComponent)
        return;
    const mainHand = equippableComponent.getEquipmentSlot(EquipmentSlot.Mainhand);
    if (!mainHand)
        return;
    const heldItem = mainHand.getItem();
    if (!heldItem || (heldItem.typeId !== "minecraft:apple" && heldItem.typeId !== "mbl_ts:bruised_apple"))
        return;
    // Take one apple from the player's hand
    if (heldItem.amount > 1) {
        // If holding multiple apples, reduce the amount by 1
        heldItem.amount -= 1;
        mainHand.setItem(heldItem);
    }
    else {
        // If holding only one apple, remove it completely
        mainHand.setItem(undefined);
    }
    // Place the apple block at the target location with the correct stage
    let initialStage = 0; // Default stage for fresh apple
    // Set the appropriate stage based on the apple type
    if (heldItem.typeId === "mbl_ts:bruised_apple") {
        initialStage = 1; // Bruised apple starts at stage 1 (shows bruised texture)
    }
    // minecraft:apple stays at stage 0 (fresh texture)
    targetBlock.setPermutation(BlockPermutation.resolve('mbl_ts:apple_block', { "mbl_ts:stage": initialStage }));
    AppleBlock.setBlockData(targetBlock, { location: targetLocation, time: system.currentTick });
    return;
}
