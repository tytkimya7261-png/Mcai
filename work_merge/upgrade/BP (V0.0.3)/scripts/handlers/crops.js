import { BlockPermutation, ItemStack, world } from "@minecraft/server";
import { getMainHand, setMainHand } from "../utils";
export class CropHandler {
    static getMaxGrowthLevel(blockTypeId) {
        // Define maximum growth levels for specific plants
        const maxLevels = {
            "mbl_ts:peanut_plant": 2,
            // Other plants default to level 3
        };
        return maxLevels[blockTypeId] ?? 3;
    }
    static getCropTime(block) {
        const scoreboard = world.scoreboard.getObjective("mbl_ts:crop_time");
        if (!scoreboard) {
            world.scoreboard.addObjective("mbl_ts:crop_time");
            return this.getCropTime(block);
        }
        const blockString = `${block.x}_${block.y}_${block.z}`;
        const scores = scoreboard.getScores().filter(score => score.participant.displayName === blockString);
        if (scores.length > 0) {
            return scores[0].score;
        }
        return 0;
    }
    static setCropTime(block, time) {
        const scoreboard = world.scoreboard.getObjective("mbl_ts:crop_time");
        if (!scoreboard) {
            world.scoreboard.addObjective("mbl_ts:crop_time");
            this.setCropTime(block, time);
            return;
        }
        const blockString = `${block.x}_${block.y}_${block.z}`;
        //remove the previous score if it exists
        const previousScore = scoreboard.getScores().find(score => score.participant.displayName === blockString);
        if (previousScore) {
            scoreboard.removeParticipant(previousScore.participant);
        }
        // Add the new score
        scoreboard.addScore(blockString, time);
    }
    static breakCropBlock(block) {
        // Remove the crop from the scoreboard
        const scoreboard = world.scoreboard.getObjective("mbl_ts:crop_time");
        if (scoreboard) {
            const blockString = `${block.location.x}_${block.location.y}_${block.location.z}`;
            const previousScore = scoreboard.getScores().find(score => score.participant.displayName === blockString);
            if (previousScore) {
                scoreboard.removeParticipant(previousScore.participant);
            }
        }
    }
    static updateCropBlock(block) {
        try {
            const currentLevel = block.permutation.getAllStates()["mbl_ts:level"] || 0;
            const maxLevel = this.getMaxGrowthLevel(block.typeId);
            // If crop is already at max level, remove from scoreboard and return
            if (currentLevel >= maxLevel) {
                this.breakCropBlock(block);
                return;
            }
            const canGrow = this.canGrow(block);
            if (!canGrow) {
                return;
            }
            const value = currentLevel + 1;
            if (value > maxLevel) {
                return;
            }
            // Set the new permutation with increased level
            block.setPermutation(BlockPermutation.resolve(block.typeId, {
                "mbl_ts:level": value
            }));
            if (value >= maxLevel) {
                // Remove from scoreboard when crop reaches max level
                this.breakCropBlock(block);
            }
        }
        catch (e) { }
    }
    static getGrowthInterval(blockTypeId) {
        // Define growth intervals for specific plants (in seconds)
        const growthIntervals = {
            "mbl_ts:spinach_plant": 300, // 5 minutes per stage (20 minutes total for 4 stages)
            // Other plants default to 2 minutes per stage
        };
        return growthIntervals[blockTypeId] ?? 120; // Default 2 minutes
    }
    static canGrow(block) {
        //gets the time and if it has passed the required growth interval it can grow then it will reset the time back to the current timestamp
        const currentTime = Date.now();
        const cropTime = this.getCropTime(block.location);
        const growthInterval = this.getGrowthInterval(block.typeId);
        if (cropTime === 0) {
            this.setCropTime(block.location, currentTime / 1000);
            return false; // Initial state, cannot grow yet
        }
        if (currentTime / 1000 - cropTime >= growthInterval) {
            this.setCropTime(block.location, currentTime / 1000);
            return true;
        }
        return false;
    }
    static boneMealCrop(block, player) {
        const mainHand = getMainHand(player);
        if (mainHand == undefined || mainHand.typeId !== "minecraft:bone_meal")
            return;
        const handCount = mainHand.amount;
        if (handCount == 1) {
            setMainHand(player, undefined);
        }
        else {
            setMainHand(player, new ItemStack(mainHand.typeId, handCount - 1));
        }
        const currentLevel = block.permutation.getAllStates()["mbl_ts:level"] || 0;
        const maxLevel = this.getMaxGrowthLevel(block.typeId);
        //uses a randomizer between 1 and 3 to increase the level of the crop
        const chance = Math.floor(Math.random() * 3) + 1;
        world.getDimension(block.dimension.id).spawnParticle("minecraft:crop_growth_emitter", {
            x: block.location.x + 0.5,
            y: block.location.y,
            z: block.location.z + 0.5
        });
        if (chance === 1) {
            return; // 33% chance to not increase the level
        }
        const newLevel = currentLevel + 1;
        if (newLevel > maxLevel)
            return; // Crop is fully grown, do not increase further
        block.setPermutation(BlockPermutation.resolve(block.typeId, {
            "mbl_ts:level": newLevel
        }));
        // If crop reached max level, remove it from scoreboard
        if (newLevel >= maxLevel) {
            this.breakCropBlock(block);
        }
    }
}
