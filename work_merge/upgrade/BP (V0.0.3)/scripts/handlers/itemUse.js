import { ItemStack } from "@minecraft/server";
import { CustomPlayer } from "./customPlayer";
import { BackpackSystem } from "./backpacks";
import { handleFlashlightToggle } from "../misc/flashlight";
import { LegInjurySystem } from "../misc/legInjury";
import { consumeFuelOnChainsawUse } from "../misc/chainsaw";
import { consumeFuelOnFlamethrowerUse } from "../misc/flamethrower";
import { handleNailerUse } from "../misc/nailer";
const placedLightBlocks = new Map();
const consumableItems = {
    "mbl_ts:king_kola": { attributes: { hydration: 30 }, replaceItem: { id: "mbl_ts:empty_drink_tin", count: 1 }, sound: "player_drinking" },
    "mbl_ts:cherry_king_kola": { attributes: { hydration: 30 }, replaceItem: { id: "mbl_ts:empty_drink_tin", count: 1 }, sound: "player_drinking" },
    "mbl_ts:vanilla_king_kola": { attributes: { hydration: 30 }, replaceItem: { id: "mbl_ts:empty_drink_tin", count: 1 }, sound: "player_drinking" },
    "mbl_ts:cherry_popso": { attributes: { hydration: 30 }, replaceItem: { id: "mbl_ts:empty_drink_tin", count: 1 }, sound: "player_drinking" },
    "mbl_ts:dr_poppers": { attributes: { hydration: 30 }, replaceItem: { id: "mbl_ts:empty_drink_tin", count: 1 }, sound: "player_drinking" },
    "mbl_ts:freshers_fruit_twist": { attributes: { hydration: 30 }, replaceItem: { id: "mbl_ts:empty_drink_tin", count: 1 }, sound: "player_drinking" },
    "mbl_ts:freshers_orange": { attributes: { hydration: 30 }, replaceItem: { id: "mbl_ts:empty_drink_tin", count: 1 }, sound: "player_drinking" },
    "mbl_ts:popso": { attributes: { hydration: 30 }, replaceItem: { id: "mbl_ts:empty_drink_tin", count: 1 }, sound: "player_drinking" },
    "mbl_ts:popso_max": { attributes: { hydration: 30 }, replaceItem: { id: "mbl_ts:empty_drink_tin", count: 1 }, sound: "player_drinking" },
    "mbl_ts:popso_max_lime": { attributes: { hydration: 30 }, replaceItem: { id: "mbl_ts:empty_drink_tin", count: 1 }, sound: "player_drinking" },
    "mbl_ts:bottle_of_water_4": { attributes: { hydration: 100 }, replaceItem: { id: "mbl_ts:bottle_of_water_3", count: 1 }, sound: "player_drinking" },
    "mbl_ts:bottle_of_water_3": { attributes: { hydration: 90 }, replaceItem: { id: "mbl_ts:bottle_of_water_2", count: 1 }, sound: "player_drinking" },
    "mbl_ts:bottle_of_water_2": { attributes: { hydration: 80 }, replaceItem: { id: "mbl_ts:bottle_of_water_1", count: 1 }, sound: "player_drinking" },
    "mbl_ts:bottle_of_water_1": { attributes: { hydration: 70 }, replaceItem: { id: "mbl_ts:bottle_of_water_0", count: 1 }, sound: "player_drinking" },
    "mbl_ts:bottle_of_water_dirty_4": { attributes: { hydration: 10, toxicity: 5 }, replaceItem: { id: "mbl_ts:bottle_of_water_dirty_3", count: 1 }, sound: "player_drinking", effects: [{ id: "hunger", duration: 20, amplifier: 2 }] },
    "mbl_ts:bottle_of_water_dirty_3": { attributes: { hydration: 10, toxicity: 5 }, replaceItem: { id: "mbl_ts:bottle_of_water_dirty_2", count: 1 }, sound: "player_drinking", effects: [{ id: "hunger", duration: 20, amplifier: 2 }] },
    "mbl_ts:bottle_of_water_dirty_2": { attributes: { hydration: 10, toxicity: 5 }, replaceItem: { id: "mbl_ts:bottle_of_water_dirty_1", count: 1 }, sound: "player_drinking", effects: [{ id: "hunger", duration: 20, amplifier: 2 }] },
    "mbl_ts:bottle_of_water_dirty_1": { attributes: { hydration: 10, toxicity: 5 }, replaceItem: { id: "mbl_ts:bottle_of_water_0", count: 1 }, sound: "player_drinking", effects: [{ id: "hunger", duration: 20, amplifier: 2 }] },
    "mbl_ts:bandage": { attributes: {}, effects: [{ id: "regeneration", duration: 3, amplifier: 4 }], sound: "extra.bandage", replaceItem: { id: "mbl_ts:rag", count: 1 } },
    "mbl_ts:leg_splint": { attributes: {}, sound: "player_hurt" },
    "mbl_ts:mighty_healing_brew": { attributes: { hydration: -50, toxicity: -40 }, effects: [{ id: "regeneration", duration: 30, amplifier: 5 }], sound: "player_pills" },
    "mbl_ts:vitality_brew": { attributes: { hydration: -25, toxicity: -40 }, sound: "player_pills" },
    "mbl_ts:purity_brew": { attributes: { hydration: -25, toxicity: -40 }, sound: "player_pills" },
    "mbl_ts:valor_brew": { attributes: { hydration: -25, toxicity: -40 }, sound: "player_pills", effects: [{ id: "regeneration", duration: 10, amplifier: 1 }] },
    "mbl_ts:anti_toxin_brew": { attributes: { hydration: -25, toxicity: -40 }, sound: "player_pills" },
    "mbl_ts:stamina_brew": { attributes: { energy: 80 }, sound: "player_pills", },
    "mbl_ts:energy_pack": { attributes: { energy: 90 }, sound: "player_pills" },
    "mbl_ts:power_brew": { attributes: { hydration: -50, energy: 100 }, effects: [{ id: "speed", duration: 30, amplifier: 2 }, { id: "strength", duration: 30, amplifier: 2 }, { id: "jump_boost", duration: 30, amplifier: 2 }], sound: "player_pills", replaceItem: { id: "minecraft:paper", count: 1 } },
    "mbl_ts:crimson_buffalo": { attributes: { energy: 40 }, sound: "player_drinking", replaceItem: { id: "mbl_ts:empty_drink_tin", count: 1 } },
    "mbl_ts:midway_energy": { attributes: { energy: 40 }, sound: "player_drinking", replaceItem: { id: "mbl_ts:empty_drink_tin", count: 1 } },
    "mbl_ts:dumb": { attributes: { energy: -10 }, effects: [{ id: "hunger", duration: 120, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:earth": { attributes: { energy: -10 }, effects: [{ id: "hunger", duration: 120, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:twonk": { attributes: { energy: -10 }, effects: [{ id: "hunger", duration: 120, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:peanut": { attributes: { energy: 20 } },
    // Spoiled food items - intermediate stages (some have effects)
    "mbl_ts:bruised_apple": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:wrinkled_beetroot": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:sprouting_potato": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }, { id: "poison", duration: 10, amplifier: 0 }] },
    "mbl_ts:wilted_carrot": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:stale_melon": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:squashed_berries": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:dull_glow_berries": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:stale_bread": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:dry_pumpkin_pie": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:soft_cookie": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:fermented_beetroot_soup": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:cold_rabbit_stew": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:cold_mushroom_stew": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:cold_baked_potato": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:stale_chicken": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }, { id: "poison", duration: 200, amplifier: 1 }] },
    "mbl_ts:stale_porkchop": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:stale_beef": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:stale_mutton": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:stale_rabbit": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    "mbl_ts:slimy_cod": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }, { id: "weakness", duration: 400, amplifier: 1 }] },
    "mbl_ts:slimy_salmon": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }, { id: "weakness", duration: 400, amplifier: 1 }] },
    "mbl_ts:cold_chicken": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 4 }] },
    "mbl_ts:cold_porkchop": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 4 }] },
    "mbl_ts:cold_steak": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 4 }] },
    "mbl_ts:cold_mutton": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 4 }] },
    "mbl_ts:cold_rabbit": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 4 }] },
    "mbl_ts:spoiled_cod": { attributes: {}, effects: [{ id: "poison", duration: 10, amplifier: 1 }, { id: "weakness", duration: 100, amplifier: 0 }, { id: "nausea", duration: 20, amplifier: 0 }] },
    "mbl_ts:spoiled_salmon": { attributes: {}, effects: [{ id: "poison", duration: 10, amplifier: 1 }, { id: "weakness", duration: 100, amplifier: 0 }, { id: "nausea", duration: 20, amplifier: 0 }] },
    "mbl_ts:cracked_egg": { attributes: {}, effects: [{ id: "poison", duration: 10, amplifier: 0 }, { id: "weakness", duration: 20, amplifier: 0 }] },
    "mbl_ts:spoiling_milk_bucket": { attributes: {}, effects: [{ id: "hunger", duration: 50, amplifier: 10 }] },
    // Spoiled food items - final stages (all have negative effects)
    "mbl_ts:rotton_apple": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 1 }, { id: "nausea", duration: 20, amplifier: 1 }] },
    "mbl_ts:rotted_beetroot": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 1 }, { id: "weakness", duration: 1200, amplifier: 1 }, { id: "nausea", duration: 240, amplifier: 1 }] },
    "mbl_ts:mouldy_potato": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 1 }, { id: "hunger", duration: 1200, amplifier: 10 }] },
    "mbl_ts:slimy_carrot": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 1 }] },
    "mbl_ts:slimy_melon": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 1 }] },
    "mbl_ts:mouldy_sweet_berries": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 1 }] },
    "mbl_ts:dead_glow_berries": { attributes: {}, effects: [{ id: "weakness", duration: 200, amplifier: 1 }, { id: "poison", duration: 20, amplifier: 1 }] },
    "mbl_ts:mouldy_bread": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 1 }] },
    "mbl_ts:spoiled_pie": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 1 }] },
    "mbl_ts:mouldy_cookie": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 0 }] },
    "mbl_ts:sour_beetroot_soup": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 1 }, { id: "hunger", duration: 100, amplifier: 10 }, { id: "slowness", duration: 40, amplifier: 0 }, { id: "nausea", duration: 40, amplifier: 0 }, { id: "weakness", duration: 100, amplifier: 2 }] },
    "mbl_ts:gamey_rabbit_stew": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 1 }] },
    "mbl_ts:spoiled_mushroom_stew": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 1 }] },
    "mbl_ts:rotton_chicken": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 2 }, { id: "nausea", duration: 40, amplifier: 0 }] },
    "mbl_ts:rotton_porkchop": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 2 }, { id: "nausea", duration: 40, amplifier: 0 }] },
    "mbl_ts:rotton_beef": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 2 }, { id: "nausea", duration: 40, amplifier: 0 }] },
    "mbl_ts:rotton_mutton": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 2 }, { id: "nausea", duration: 40, amplifier: 0 }] },
    "mbl_ts:gamey_rabbit": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 0 }, { id: "weakness", duration: 100, amplifier: 1 }, { id: "nausea", duration: 40, amplifier: 1 }] },
    "mbl_ts:rotton_cod": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 1 }, { id: "weakness", duration: 100, amplifier: 1 }, { id: "nausea", duration: 40, amplifier: 1 }] },
    "mbl_ts:rotton_egg": { attributes: {}, effects: [{ id: "poison", duration: 20, amplifier: 1 }, { id: "blindness", duration: 40, amplifier: 1 }] },
    "mbl_ts:sour_milk_bucket": { attributes: {}, effects: [{ id: "poison", duration: 30, amplifier: 1 }, { id: "weakness", duration: 200, amplifier: 1 }, { id: "darkness", duration: 100, amplifier: 1 }, { id: "nausea", duration: 30, amplifier: 0 }] },
    "mbl_ts:beef_jerky_original": { attributes: {}, effects: [{ id: "regeneration", duration: 5, amplifier: 2 }], sound: "player_eat" },
    "mbl_ts:beef_jerky_spicy": { attributes: {}, effects: [{ id: "regeneration", duration: 5, amplifier: 2 }], sound: "player_eat" },
    "mbl_ts:beef_jerky_teriyaki": { attributes: {}, effects: [{ id: "regeneration", duration: 5, amplifier: 2 }], sound: "player_eat" },
    "mbl_ts:beef_jerky_teriyaki_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:beef_jerky_spicy_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:beef_jerky_original_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:ramen_noodles_chicken_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:glazed_donut": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:tin_of_beans_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:tin_of_beef_ravioli_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:tin_of_beef_stew_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:tin_of_carbonara_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:tin_of_chicken_curry_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:tin_of_chicken_soup_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:tin_of_custard_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:tin_of_macaroni_cheese_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:tin_of_mushroom_soup_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:tin_of_oxtail_soup_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:tin_of_spaghetti_hoops_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:tin_of_stewed_steak_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:tin_of_tomato_soup_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    "mbl_ts:tin_of_vegetable_soup_open": { attributes: {}, effects: [{ id: "hunger", duration: 100, amplifier: 10 }], sound: "player_eat" },
    // New spoiled food items
    "mbl_ts:wilting_spinach": { attributes: {}, effects: [{ id: "weakness", duration: 600, amplifier: 0 }], sound: "player_eat" },
    "mbl_ts:slimy_spinach": { attributes: {}, effects: [{ id: "poison", duration: 300, amplifier: 0 }], sound: "player_eat" },
    "mbl_ts:musty_lentil": { attributes: {}, effects: [{ id: "weakness", duration: 600, amplifier: 0 }], sound: "player_eat" },
    "mbl_ts:moldy_lentil": { attributes: {}, effects: [{ id: "poison", duration: 300, amplifier: 0 }], sound: "player_eat" },
    "mbl_ts:bruised_tomato": { attributes: {}, effects: [{ id: "weakness", duration: 600, amplifier: 0 }], sound: "player_eat" },
    "mbl_ts:rotten_tomato": { attributes: {}, effects: [{ id: "poison", duration: 200, amplifier: 1 }], sound: "player_eat" },
    "mbl_ts:soft_broad_bean": { attributes: {}, effects: [{ id: "weakness", duration: 600, amplifier: 0 }], sound: "player_eat" },
    "mbl_ts:rotten_broad_bean": { attributes: {}, effects: [{ id: "poison", duration: 300, amplifier: 0 }], sound: "player_eat" },
    "mbl_ts:stale_peanut": { attributes: {}, effects: [{ id: "weakness", duration: 600, amplifier: 0 }], sound: "player_eat" },
    "mbl_ts:rancid_peanut": { attributes: {}, effects: [{ id: "poison", duration: 300, amplifier: 0 }], sound: "player_eat" }
};
export function onItemUse(event) {
    const player = event.source;
    const item = event.itemStack;
    // Check if it's a nailer (shooter items fire on itemCompleteUse)
    if (item.typeId === "mbl_ts:nailer") {
        handleNailerUse(player, item, player.selectedSlotIndex);
        return;
    }
    // Special handling for leg splint
    if (item.typeId === "mbl_ts:healing_brace") {
        if (LegInjurySystem.useHealingBrace(player)) {
            player.playSound("extra.healing_brace", { volume: 1, pitch: 1 });
            // Successfully used leg splint - item will be consumed automatically
            return;
        }
        else {
            // Failed to use (no injury) - prevent consumption by canceling
            return;
        }
    }
    const consumable = consumableItems[item.typeId];
    if (!consumable)
        return;
    // Check condition requirements
    if (consumable.condition === "inWater" && !player.isInWater) {
        return; // Cannot use this item if not in water
    }
    //the min is 0 and max is 100
    // Apply attributes
    const playerData = CustomPlayer.getAttributes(player);
    let updateAttributes = false;
    let newAttributes = {
        hydration: playerData.hydration.value,
        energy: playerData.energy.value,
        toxicity: playerData.toxicity
    };
    if (consumable.attributes.hydration) {
        const value = consumable.attributes.hydration;
        newAttributes.hydration = Math.min(100, Math.max(0, playerData.hydration.value + value));
        updateAttributes = true;
    }
    if (consumable.attributes.energy) {
        const value = consumable.attributes.energy;
        newAttributes.energy = Math.min(100, Math.max(0, playerData.energy.value + value));
        updateAttributes = true;
    }
    if (consumable.attributes.toxicity) {
        const value = consumable.attributes.toxicity;
        newAttributes.toxicity = Math.min(100, Math.max(0, playerData.toxicity + value));
        updateAttributes = true;
    }
    if (updateAttributes) {
        CustomPlayer.setAttributes(player, {
            hydration: {
                value: newAttributes.hydration,
                time: playerData.hydration.time
            },
            energy: {
                value: newAttributes.energy,
                time: playerData.energy.time
            },
            toxicity: newAttributes.toxicity
        });
    }
    // Apply effects or remove all effects (for milk bucket)
    if (item.typeId === "minecraft:milk_bucket") {
        // Milk bucket removes all effects
        const effects = player.getEffects();
        for (const effect of effects) {
            player.removeEffect(effect.typeId);
        }
    }
    else if (consumable.effects) {
        // Apply normal effects
        for (const effect of consumable.effects) {
            player.addEffect(effect.id, effect.duration * 20, { amplifier: effect.amplifier });
        }
    }
    // Add replacement item to inventory
    if (consumable.replaceItem) {
        const replaceItemStack = new ItemStack(consumable.replaceItem.id, consumable.replaceItem.count);
        const component = player.getComponent("inventory");
        if (!component)
            return;
        component.container.addItem(replaceItemStack);
    }
    // Play sound
    if (consumable.sound) {
        player.playSound(consumable.sound, { volume: 1, pitch: 1 });
    }
}
/**
 * Main item use handler that handles both consumables and backpacks
 */
export function handleItemUse(event) {
    const player = event.source;
    const item = event.itemStack;
    // Check if it's a chainsaw (active version)
    if (item.typeId === "mbl_ts:chainsaw_active") {
        consumeFuelOnChainsawUse(player);
        return;
    }
    // Check if it's a flamethrower (active version)
    if (item.typeId === "mbl_ts:flamethrower_active") {
        consumeFuelOnFlamethrowerUse(player);
        return;
    }
    // Check if it's a flashlight
    if (item.typeId === "mbl_ts:flashlight_item") {
        handleFlashlightToggle(player);
        return;
    }
    // Check if it's a backpack
    if (BackpackSystem.isBackPack(item)) {
        BackpackSystem.handleBackpackUse(player, item);
        return;
    }
}
/**
 * Handles item release events (for shooter items like the nailer)
 */
export function handleItemRelease(event) {
    const player = event.source;
    const item = event.itemStack;
    // Check if it's a nailer
    if (item?.typeId === "mbl_ts:nailer") {
        handleNailerUse(player, item, player.selectedSlotIndex);
        return;
    }
}
