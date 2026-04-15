import { Player, system, world, EntityDamageCause } from '@minecraft/server';
import { CollectablesMainForm } from './forms/collectables';
import { CustomPlayer, playerPulse, playerPulseFast, handleEntityDeath, flushPlayerCache, getCacheStats } from './handlers/customPlayer';
import { handleWalkieTalkieUse } from './forms/walkieTalkie';
import { handleItemUse, onItemUse } from './handlers/itemUse';
import { BackpackSystem } from './handlers/backpacks';
import { GravestoneSystem } from './handlers/gravestones';
import { onRadioInteract } from './misc/radio';
import { onCupboardInteract } from './misc/cupboard';
import { onSupplyDropHurt, onSupplyDropInteract } from './misc/supplyDrops';
import { AppleBlock, placeAndTakeAppleBlock } from './misc/appleBlock';
import { onEntitySpawned } from './handlers/entitySpawning';
import { onZombieCorpseLoot } from './handlers/zombieBodies';
import { calculateVehicleTilt, getVehicles, handleVehicleMovement, handlePlayerRejoin, handleVehicleRiding, initializeVehicleInventory, processVehicleParts, handleVehicleDamage, removeDroppedVehicleIconItems } from './handlers/vehicles';
// Human survivor dialog imports removed - entity now uses natural Minecraft behavior
import { flashlightPulse } from './misc/flashlight';
import { CropHandler } from './handlers/crops';
import { LegInjurySystem } from './misc/legInjury';
import { onWaterBottleUse } from './misc/dirtyWater';
import { GameSettings } from './handlers/gamesettings';
import { generateCustomStructure, getTypeById, onPlacementBlock, testPlacementSystem } from './handlers/structures';
import { showGuidebook } from './forms/guidebook';
import { chainsawPulse } from './misc/chainsaw';
import { flamethrowerPulse } from './misc/flamethrower';
import { handleComposterInteraction, isCompostable } from './misc/composter';
import { nailerPulse } from './misc/nailer';
// import { TURRET_IDENTIFIER, handleTurretInteraction, updateAllTurrets, cleanupTurretStates } from './handlers/slingshotTurret'
world.beforeEvents.playerBreakBlock.subscribe((event) => {
    if (event.block.typeId === "mbl_ts:apple_block") {
        event.cancel = true;
        system.run(() => AppleBlock.removeBlock(event.block));
    }
});
system.beforeEvents.startup.subscribe((event) => {
    event.blockComponentRegistry.registerCustomComponent('mbl_ts:radio', {
        onPlayerInteract: onRadioInteract
    });
    event.blockComponentRegistry.registerCustomComponent('mbl_ts:opening', {
        onPlayerInteract: onCupboardInteract
    });
    event.blockComponentRegistry.registerCustomComponent('mbl_ts:apple_block', {
        onPlayerInteract: (eventData) => AppleBlock.removeBlock(eventData.block),
        onPlace: (eventData) => AppleBlock.pingBlock(eventData.block),
        onTick: (eventData) => AppleBlock.pingBlock(eventData.block)
    });
    event.blockComponentRegistry.registerCustomComponent('mbl_ts:crop_handler', {
        onTick: (eventData) => CropHandler.updateCropBlock(eventData.block),
        onPlace: (eventData) => CropHandler.updateCropBlock(eventData.block),
        onPlayerBreak: (eventData) => CropHandler.breakCropBlock(eventData.block),
        onPlayerInteract: (eventData) => {
            if (eventData.player)
                CropHandler.boneMealCrop(eventData.block, eventData.player);
        }
    });
    event.blockComponentRegistry.registerCustomComponent('mbl_ts:placement_block', {
        onTick: onPlacementBlock
    });
    event.customCommandRegistry.registerCommand({ name: "mbl:collectables", description: "Opens the collectables menu", cheatsRequired: false, permissionLevel: 0 }, (event) => {
        system.run(() => CollectablesMainForm(event.sourceEntity));
        return undefined;
    });
    event.customCommandRegistry.registerCommand({ name: "mbl:guide", description: "Opens the guidebook menu", cheatsRequired: false, permissionLevel: 0 }, (event) => {
        system.run(() => showGuidebook(event.sourceEntity));
        return undefined;
    });
    event.customCommandRegistry.registerCommand({ name: "mbl:reset", description: "Resets the player database", cheatsRequired: false, permissionLevel: 0 }, (event) => {
        const player = event.sourceEntity;
        //resets the whole player database by removing all the values
        system.run(() => {
            CustomPlayer.resetDatabase();
            GameSettings.resetToDefaults();
            player.sendMessage("§8[§6!§8] §aSuccessfully Reset the Databases!");
        });
        return undefined;
    });
    event.customCommandRegistry.registerCommand({ name: "mbl:testplacement", description: "Tests the placement block system", cheatsRequired: false, permissionLevel: 0 }, (event) => {
        system.run(() => testPlacementSystem());
        return undefined;
    });
    event.customCommandRegistry.registerCommand({ name: "mbl:testfall", description: "Test fall damage leg injury (debug)", cheatsRequired: true, permissionLevel: 1 }, (event) => {
        const player = event.sourceEntity;
        if (player) {
            // Simulate a moderate fall damage (4 hearts)
            system.run(() => {
                player.applyDamage(4, { cause: EntityDamageCause.fall });
                player.sendMessage("§eSimulated fall damage for testing leg injury system!");
            });
        }
        return undefined;
    });
    event.blockComponentRegistry.registerCustomComponent("mbl_ts:custom_structure", {
        "onTick": (onTickEvent) => {
            const block = onTickEvent.block;
            const type = getTypeById(block);
            if (type) {
                generateCustomStructure(block, type);
            }
        }
    });
});
world.afterEvents.itemUse.subscribe((event) => {
    handleWalkieTalkieUse(event);
    handleItemUse(event);
    onWaterBottleUse(event.source);
    if (event.itemStack.typeId == "mbl_ts:guidebook") {
        showGuidebook(event.source);
    }
});
world.afterEvents.itemCompleteUse.subscribe(onItemUse);
world.afterEvents.itemStartUse.subscribe((event) => {
    const block = event.source.getBlockFromViewDirection();
    if (block && event.source.isSneaking) {
        placeAndTakeAppleBlock(event.source, block.block, block.face);
    }
});
const zombies = [
    "minecraft:zombie",
    "mbl_ts:zombie_armless",
    "mbl_ts:zombie_bloater",
    "mbl_ts:zombie_small",
    "mbl_ts:zombie_crawler",
    "mbl_ts:zombie_frozen",
    "mbl_ts:zombie_human_survivor",
    "mbl_ts:zombie_jungle",
    "mbl_ts:zombie_swamp",
    "mbl_ts:zombie_walker",
    "mbl_ts:zombie_armless_body",
    "mbl_ts:zombie_bloater_body",
    "mbl_ts:zombie_small_body",
    "mbl_ts:zombie_crawler_body",
    "mbl_ts:zombie_frozen_body",
    "mbl_ts:zombie_human_survivor_body",
    "mbl_ts:zombie_jungle_body",
    "mbl_ts:zombie_swamp_body",
    "mbl_ts:zombie_walker_body"
];
world.afterEvents.entityHitEntity.subscribe((event) => {
    try {
        // if (event.hitEntity.typeId == "mbl_ts:human_survivor") handleSurvivor(event.damagingEntity as Player, event.hitEntity)
        if (event.damagingEntity instanceof Player && event.hitEntity.hasTag("mbl_backpack_entity")) {
            BackpackSystem.pickupBackpackEntity(event.damagingEntity, event.hitEntity);
        }
        onSupplyDropHurt(event);
        if (zombies.includes(event.damagingEntity.typeId) && event.hitEntity.typeId == "minecraft:player") {
            //random between 1-3 
            const rand = Math.floor(Math.random() * 3) + 1;
            const playerData = CustomPlayer.getAttributes(event.hitEntity);
            //cant go more than 100 and less than 0
            const newInfection = Math.min(100, Math.max(0, (playerData.toxicity || 0) + rand));
            CustomPlayer.setAttributes(event.hitEntity, { ...playerData, toxicity: newInfection });
        }
        if (zombies.includes(event.hitEntity.typeId)) {
            event.hitEntity.dimension.spawnParticle("mbl_ts:toxic_splatter", { x: event.hitEntity.location.x + 0.5, y: event.hitEntity.location.y, z: event.hitEntity.location.z + 0.5 });
        }
    }
    catch { }
});
world.afterEvents.entityHurt.subscribe((event) => {
    try {
        handleVehicleDamage(event.hurtEntity);
        LegInjurySystem.handleFallDamage(event);
    }
    catch { }
});
world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    onSupplyDropInteract(event);
    // Human survivor interactions removed - entity now uses natural Minecraft taming and trading
    // if (event.target.typeId === TURRET_IDENTIFIER) {
    //     handleTurretInteraction(event.target, event.player)
    // }
});
// Handle bed interactions for sleep tracking
world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    const block = event.block;
    const player = event.player;
    // Handle composter interaction with compostable items
    if (block.typeId === "minecraft:composter") {
        const inventory = player.getComponent("minecraft:inventory");
        if (inventory?.container) {
            const heldItem = inventory.container.getItem(player.selectedSlotIndex);
            if (heldItem && isCompostable(heldItem.typeId)) {
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
        }
    }
    // Check if player is interacting with any bed type
    if (block.typeId.includes("bed")) {
        const currentTime = world.getTimeOfDay();
        // getTimeOfDay returns 0-24000
        // Day: 0-13000, Night: 13000-24000
        // Only track sleep attempts during night time
        if (currentTime >= 13000 && currentTime < 24000) {
            // Player is sleeping during night - mark for energy reward
            player.setDynamicProperty("mbl_ts:sleep_was_night", true);
        }
        else {
            // Player is trying to sleep during day - clear any existing flag
            player.setDynamicProperty("mbl_ts:sleep_was_night", undefined);
        }
    }
});
world.afterEvents.entityDie.subscribe(handleEntityDeath);
world.beforeEvents.playerBreakBlock.subscribe((event) => {
    if (GravestoneSystem.isGravestoneBlock(event.block)) {
        GravestoneSystem.handleGravestoneBlockBreak(event.player, event.block);
    }
});
world.afterEvents.entitySpawn.subscribe((event) => {
    onEntitySpawned(event);
});
world.afterEvents.playerJoin.subscribe((event) => {
    const player = world.getAllPlayers().find(p => p.id === event.playerId);
    if (player)
        handlePlayerRejoin(player);
});
world.afterEvents.playerLeave.subscribe((event) => {
    LegInjurySystem.cleanupPlayerData(event.playerId);
});
system.runInterval(() => {
    playerPulseFast();
    flashlightPulse();
    chainsawPulse();
    flamethrowerPulse();
    nailerPulse();
    handleVehicleRiding();
    if (system.currentTick % 20 === 0) {
        playerPulse();
    }
    // if (system.currentTick % 200 === 0) {
    //     cleanupTurretStates() // Clean up invalid turret states every 10 seconds
    // }
    getVehicles().forEach(entity => {
        calculateVehicleTilt(entity);
        handleVehicleMovement(entity);
        initializeVehicleInventory(entity);
        processVehicleParts(entity);
    });
    // Clean up dropped vehicle icon items every 5 seconds
    removeDroppedVehicleIconItems();
});
// Handle variant to skin property transfer for zombie transformations
system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id === "mbl:walker_to_crawler" && event.sourceEntity) {
        const walker = event.sourceEntity;
        const skinValue = walker.getProperty("mbl_ts:skin");
        const dimension = walker.dimension;
        // Delay transformation by 1 second (20 ticks) to let walker hit the ground
        system.runTimeout(() => {
            // Check if walker still exists
            if (!walker.isValid)
                return;
            const location = walker.location;
            // Spawn smoke particle effect
            dimension.spawnParticle("minecraft:large_explosion", { x: location.x, y: location.y + 0.5, z: location.z });
            // Spawn crawler at walker's location
            const crawler = dimension.spawnEntity("mbl_ts:zombie_crawler", location);
            // Wait a tick to ensure crawler is fully initialized
            system.runTimeout(() => {
                if (!crawler.isValid)
                    return;
                // Set the skin property to match the walker
                if (typeof skinValue === "number") {
                    crawler.setProperty("mbl_ts:skin", skinValue);
                }
                // Trigger force_alive to ensure body_type is set and component groups are properly added
                crawler.triggerEvent("mbl_ts:force_alive");
            }, 1);
            // Remove the walker
            walker.remove();
        }, 5); // 2 ticks = 0.1 seconds
    }
    // Handle zombie corpse loot spawning
    if (event.id === "mbl:zombie_corpse_loot") {
        onZombieCorpseLoot(event);
    }
});
// Cache debug system - using custom command approach  
system.runInterval(() => {
    world.getAllPlayers().forEach(player => {
        if (player.getDynamicProperty("cache_debug") === "true") {
            const stats = getCacheStats();
            player.setDynamicProperty("cache_debug", "false");
        }
        if (player.getDynamicProperty("cache_flush") === "true") {
            const updated = flushPlayerCache();
            player.setDynamicProperty("cache_flush", "false");
        }
    });
}, 5);
