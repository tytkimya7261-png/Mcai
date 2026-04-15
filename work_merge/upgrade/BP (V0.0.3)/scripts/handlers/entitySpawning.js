import { Difficulty, world } from "@minecraft/server";
import { GameSettings } from "./gamesettings";
const zombies = [
    "mbl_ts:zombie_bloater", //20%
    "mbl_ts:zombie_small", //5%
    "mbl_ts:zombie_crawler", //20%
    "mbl_ts:zombie_walker" //50%
];
export function onEntitySpawned(event) {
    if (world.getDifficulty() === Difficulty.Peaceful)
        return; //no mob spawns on peaceful
    const gameSettings = GameSettings.getSpawningSettings();
    if (gameSettings == undefined)
        return;
    const entity = event.entity;
    if (!entity.isValid)
        return;
    const type = entity.typeId;
    // Mapping of entity type IDs to their corresponding settings keys
    const entityTypeMap = {
        "minecraft:cow": "cows",
        "minecraft:sheep": "sheep",
        "minecraft:pig": "pigs",
        "minecraft:wolf": "wolfs",
        "minecraft:chicken": "chickens",
        "minecraft:rabbit": "rabbits",
        "minecraft:horse": "horses",
        "minecraft:llama": "llamas",
        "minecraft:villager": "villagers",
        "minecraft:skeleton": "skeletons",
        "minecraft:zombie": "zombies",
        "minecraft:zombie_villager": "zombies", // Also replace zombie villagers
        "minecraft:husk": "zombies", // Replace husks with custom zombies too
        "minecraft:enderman": "endermen",
        "minecraft:creeper": "creepers",
        "minecraft:spider": "spiders"
    };
    const settingKey = entityTypeMap[type];
    if (settingKey) {
        const spawnChance = gameSettings[settingKey];
        const randomValue = Math.random() * 100;
        // If spawn chance is 0, let the original entity spawn normally
        if (spawnChance == 0)
            return;
        // If random value is less than or equal to spawn chance, replace with zombie
        if (randomValue <= spawnChance) {
            try {
                // Select a zombie type based on weighted chances
                const zombieRoll = Math.random() * 100;
                let randomZombieType;
                if (zombieRoll < 50) {
                    randomZombieType = "mbl_ts:zombie_walker"; // 50%
                }
                else if (zombieRoll < 70) {
                    randomZombieType = "mbl_ts:zombie_bloater"; // 20%
                }
                else if (zombieRoll < 90) {
                    randomZombieType = "mbl_ts:zombie_crawler"; // 20%
                }
                else if (zombieRoll < 95) {
                    randomZombieType = "mbl_ts:zombie_small"; // 5%
                }
                else {
                    randomZombieType = "mbl_ts:zombie_armless"; // 5%
                }
                //spawn new zombie and remove original entity
                world.getDimension(entity.dimension.id).spawnEntity(randomZombieType, entity.location);
                entity.remove();
            }
            catch (error) {
                // If spawning fails, let the original entity spawn normally
            }
        }
        // Otherwise, let the original entity spawn normally (do nothing)
    }
}
