import { ActionFormData } from '@minecraft/server-ui';
import { GameSettingsMainForm } from './gamesettings';
import { CollectablesMainForm } from './collectables';
// =====================================================
// ENUMS AND CONFIGURATION - All text and settings
// =====================================================
// Text Enums for easy configuration
export var GuidebookText;
(function (GuidebookText) {
    // Main Menu
    GuidebookText["MAIN_TITLE"] = "TSZA Add-On Guidebook";
    GuidebookText["MAIN_WELCOME"] = "Welcome to \u00A7bTrue Survival Zombie Apocalypse Add-On\u00A7r \n\nThis is a post-apocalyptic experience like no other! Scavenge for food, fight against hordes of zombies, Survive and Thrive! \n\nThis guidebook will walk you through the basics of surviving in a zombie-infested world, the new systems introduced, and tips to help you become a true survivor. \n\nIf this guidebook is lost, you can craft a replacement by combining a rag and a book in a crafting table. \n\nThe Add-On is balanced for Easy and Normal, play on Hard if you're an experienced player.";
    // Button Text
    GuidebookText["BTN_CORE_GAMEPLAY"] = "Core Gameplay";
    GuidebookText["BTN_SETTINGS"] = "Settings";
    GuidebookText["BTN_COLLECTABLES"] = "Collectables";
    GuidebookText["BTN_FEEDBACK"] = "Feedback";
    GuidebookText["BTN_BACK"] = "\u2190 Back";
    GuidebookText["BTN_MAIN_MENU"] = "Main Menu";
    GuidebookText["BTN_CLOSE"] = "Close";
    // Menu Titles
    GuidebookText["TITLE_CORE_GAMEPLAY"] = "Core Gameplay";
    GuidebookText["TITLE_FEEDBACK"] = "Feedback";
    // Menu Bodies
    GuidebookText["BODY_CORE_GAMEPLAY"] = "Select a topic to learn more about:";
    // Core Gameplay Buttons
    GuidebookText["BTN_NEW_SURVIVAL"] = "New Survival System";
    GuidebookText["BTN_STRUCTURES"] = "Structures and Loots";
    GuidebookText["BTN_VEHICLES"] = "Vehicles";
    GuidebookText["BTN_TRADERS"] = "Traders and Survivors";
    GuidebookText["BTN_ZOMBIES"] = "Zombies";
    // Content Titles
    GuidebookText["CONTENT_NEW_SURVIVAL_TITLE"] = "New Survival Systems";
    GuidebookText["CONTENT_STRUCTURES_TITLE"] = "Structures and Loots";
    GuidebookText["CONTENT_VEHICLES_TITLE"] = "Vehicles";
    GuidebookText["CONTENT_TRADERS_TITLE"] = "Traders and Survivors";
    GuidebookText["CONTENT_ZOMBIES_TITLE"] = "Zombies";
    GuidebookText["CONTENT_FEEDBACK_TITLE"] = "Feedback";
    // Short Template Content
    GuidebookText["CONTENT_NEW_SURVIVAL"] = "Now let's talk about the new \u00A7b\u00A7lSurvival Systems\u00A7r you'll need to deal with in True Survival: Zombie Apocalypse. These new systems are your \u00A75\u00A7lEnergy Levels\u00A7r, \u00A75\u00A7lHydration\u00A7r, and \u00A75\u00A7lToxicity\u00A7r. \n\nYou can toggle how you see these settings within this menu. \n\nYour Hydration and Energy Levels \u00A74\u00A7ldecrease over time\u00A7r. If they get too low, you'll become sick or weak. Restore hydration with \u00A72\u00A7lPlastic Bottles of Water\u00A7r and \u00A72\u00A7lTinned Soda Cans\u00A7r. Restoring your energy is more difficult, as you'll need to find \u00A72\u00A7lEnergy Drinks\u00A7r, \u00A72\u00A7lMedicine\u00A7r, or \u00A72\u00A7lSleep\u00A7r. \n\nToxicity builds up from \u00A74\u00A7lZombie Bites\u00A7r or \u00A74\u00A7lContaminated Water\u00A7r. A high Toxicity level will make you sick and can lead to death. You can reduce toxicity with medicines like \u00A72\u00A7lAnti-Toxin Brew\u00A7r and \u00A72\u00A7lPurity Brew\u00A7r. \n\nAll the items you need to survive can be \u00A75\u00A7lfound in structures\u00A7r that randomly generate throughout your world. \n\nGiven the apocalypse, almost all \u00A74\u00A7lfresh food\u00A7r you gather will now start to \u00A74\u00A7lspoil over time\u00A7r. \u00A72\u00A7lCanned Foods\u00A7r you find in structures will not spoil, so plan your meals carefully.";
    GuidebookText["CONTENT_STRUCTURES"] = "The world is filled with countless new structures, from small houses and shops to vast skyscrapers, each packed with lootable containers waiting to be searched. \n\nLook for \u00A72\u00A7lCrates\u00A7r, \u00A72\u00A7lDrawers\u00A7r, \u00A72\u00A7lCupboards\u00A7r, \u00A72\u00A7lToolboxes\u00A7r, \u00A72\u00A7lFirst Aid Kits\u00A7r, and \u00A72\u00A7lTrash Cans\u00A7r. Inside, you can find everything from \u00A73\u00A7lCollectable Movie Posters\u00A7r to display on your walls, to clothes, food, medicine, and weapons. You will not always find items as other survivors may have got to the loot before you!\n\nSome weapons are stronger than others! The \u00A75\u00A7lFlamethrower\u00A7r, \u00A75\u00A7lNailer\u00A7r, and \u00A75\u00A7lChainsaw\u00A7r are among the best, but they require \u00A74\u00A7lFuel\u00A7r or \u00A74\u00A7lNails\u00A7r to operate. \n\nIf you manage to find a \u00A72\u00A7lCrowbar\u00A7r, it's both a powerful melee weapon and a vital tool, you'll need it to open \u00A75\u00A7lSupply Crates\u00A7r, which can be called in using a \u00A72\u00A7lWalkie-Talkie\u00A7r. \n\n\u00A75\u00A7lBackpacks\u00A7r will be your life saver if you have a lot of inventory, allowing you to carry far more supplies. Note you will not be able to put bundles or shulker boxes in Backpacks. You can craft backpacks with a chest, leather, a lead and dye.\n\n\u00A72\u00A7lPaintbrushes\u00A7r can also be found and used to customise your vehicles. \n\nEncounter new dog types in the wild. You can tame them with bones. Breed them with a Can of Apex K9 Dog Food. They are an excellent storage companion and will defend you if you're attacked. If you want them to sit you must crouch and interact.\n\nOne important resource is \u00A73\u00A7lSteel\u00A7r. To create it, smelt Iron Ingots to produce \u00A75\u00A7lUnrefined Steel\u00A7r. Then, smelt \u00A75\u00A7lNickel Ore\u00A7r into ingots and combine them together in a refining bench to make \u00A72\u00A7lSteel Ingots\u00A7r. This is a key crafting material for advanced tools and vehicles.";
    GuidebookText["CONTENT_VEHICLES"] = "Throughout the apocalypse, you'll come across broken-down vehicles that can be rebuilt and driven. \n\n\u00A73\u00A7lMotorbikes\u00A7r require 2 tyres, while \u00A73\u00A7lCars\u00A7r and \u00A73\u00A7lPickup Trucks\u00A7r need 4. Tyres and Engines come in \u00A73\u00A7lthree different levels of quality\u00A7r, each influencing a vehicle's overall durability. \n\nTyres are found in Crates, but for an \u00A75\u00A7lEngine\u00A7r it must be crafted in the \u00A73\u00A7lRefining Table\u00A7r after discovering \u00A72\u00A7lTitanium Ingots\u00A7r. \n\n\u00A75\u00A7lTitanium Scrap\u00A7r can be found in loot boxes and combined into \u00A72\u00A7lTitanium Ingots\u00A7r using a refining table.\n\nAll vehicles require \u00A74\u00A7lFuel\u00A7r. To make it, find \u00A75\u00A7lCrude Oil\u00A7r deposits near \u00A72\u00A7lShale\u00A7r in desert and swamp biomes. Combine the oil with a \u00A72\u00A7lCanister\u00A7r to create a \u00A72\u00A7lGas Canister\u00A7r, your vehicle's lifeline. \n\nBe aware of your fuel while you're driving as it also drains with time";
    GuidebookText["CONTENT_TRADERS"] = "Across the wasteland you'll encounter other survivors, some will ignore you, while others will trade. \n\nTo get a trade and interaction with a survivor, you must have an \u00A75\u00A7lExperience Level\u00A7r of 15 or higher. \n\nIf you wish for a survivor to accompany and defend you on your journeys, you'll need to give them a \u00A73\u00A7lZombie Vaccine\u00A7r. \n\nTo make the Vaccine you must first get a \u00A74\u00A7lZombie Heart\u00A7r from Infected Loot Drops. Then place this in a Brewing Stand with a bottle of water to get a \u00A72\u00A7lBottle of Zombie Goo\u00A7r. \n\nNext you need to \u00A73\u00A7lObtain Yeast\u00A7r. To get Yeast, hold an apple, crouch, and place it on the ground. After a full Minecraft day, break it to harvest the yeast.\n\nIn a Crafting Table, combine the Yeast with Sugar and a Water Bottle to make a \u00A73\u00A7lSweet Yeast Mix\u00A7r. Brew this mix with \u00A74\u00A7lDirty Plastic Water Bottles\u00A7r to create \u00A72\u00A7lFizzy Water\u00A7r.\n\nYou also need to Smelt Nether Wart in a furnace to make \u00A75\u00A7lDried Nether Wart\u00A7r.\n\nBrew the \u00A72\u00A7lFizzy Water\u00A7r with \u00A75\u00A7lDried Nether Wart\u00A7r to produce a \u00A72\u00A7lNether Wart Solution\u00A7r.\n\nFinally, brew the \u00A72\u00A7lBottles of Zombie Goo\u00A7r with the \u00A72\u00A7lNether Wart Solution\u00A7r to craft the \u00A73\u00A7lZombie Vaccine\u00A7r.\n\nSurvivors you encounter will be looking for \u00A72\u00A7lPackaged Goods\u00A7r such as Packaged Beetroot and Packaged Broad Beans. To create these, gather \u00A73\u00A7lPlastic\u00A7r and combine them in a \u00A75\u00A7lPackaging Table\u00A7r to make an \u00A72\u00A7lEmpty Packet\u00A7r. \n\nThen combine the empty packet with food items to craft tradeable goods. \n\nThere are also five new growable crops \u00A72\u00A7lTomato\u00A7r, \u00A72\u00A7lLentil\u00A7r, \u00A72\u00A7lSpinach\u00A7r, \u00A72\u00A7lBroad Bean\u00A7r, and \u00A72\u00A7lPeanut\u00A7r. Their seeds can be found in drawers and cupboards. Once grown, these crops can be eaten or packaged for trade.";
    GuidebookText["CONTENT_ZOMBIES"] = "The world is now overrun by the \u00A74\u00A7lInfected\u00A7r. These creatures are relentless, drawn to noise, movement, and even the faintest scent of the living. They can detect you from long distances, so stay alert. \n\nThe most common type are the \u00A74\u00A7lWalkers\u00A7r, slow but persistent. Don't underestimate them, large groups can easily overwhelm you. \n\n\u00A74\u00A7lBloaters\u00A7r are often found near water sources. They are slightly stronger than normal walker zombies. \n\n\u00A74\u00A7lCrawlers\u00A7r drag themselves along the ground, often hidden in tall grass or dark corners. They may be slow, but they can catch you off guard if you're not paying attention.";
    GuidebookText["CONTENT_FEEDBACK"] = "\u00A7fFuture updates are on their way!\u00A7r\n\nCome back here later to see the changelog of new content. \n\n\u00A7eHave your say on Future Updates:\u00A7r \n\n\u00A79Discord:\u00A7r https://discord.gg/tJyfzqFK95 \n\n\u00A79Website:\u00A7r www.mobblocks.com \n\n\u00A79YouTube:\u00A7r youtube.com/@MobBlocks \n\n\u00A79MCPEDL Guide:\u00A7r https://mcpedl.com/true-survival-zombie-apocalypse-addon/";
    // Error Messages
    GuidebookText["ERROR_CONTENT_NOT_FOUND"] = "\u00A7cError: Content not found!";
})(GuidebookText || (GuidebookText = {}));
// Icon Enums for easy configuration
export var GuidebookIcons;
(function (GuidebookIcons) {
    GuidebookIcons["BOOK"] = "textures/mobblocks/ts/icons/survive";
    GuidebookIcons["SWORD"] = "textures/mobblocks/ts/icons/gameplay";
    GuidebookIcons["GEAR"] = "textures/mobblocks/ts/icons/updates";
    GuidebookIcons["CHAT"] = "textures/mobblocks/ts/icons/logo";
    GuidebookIcons["HEART"] = "textures/mobblocks/ts/icons/survive";
    GuidebookIcons["STRUCTURE"] = "textures/mobblocks/ts/icons/structures";
    GuidebookIcons["MINECART"] = "textures/mobblocks/ts/icons/car";
    GuidebookIcons["VILLAGER"] = "textures/mobblocks/ts/icons/trade";
    GuidebookIcons["MOB_SPAWNER"] = "textures/mobblocks/ts/icons/zombie";
    GuidebookIcons["ARROW_LEFT"] = "textures/mobblocks/ts/icons/return";
    GuidebookIcons["CANCEL"] = "textures/mobblocks/ts/icons/return";
    GuidebookIcons["COLLECTABLES"] = "textures/mobblocks/ts/icons/collect";
})(GuidebookIcons || (GuidebookIcons = {}));
// Core Gameplay Content Mapping
const CORE_GAMEPLAY_CONTENT = {
    newSurvivalSystem: {
        title: GuidebookText.CONTENT_NEW_SURVIVAL_TITLE,
        content: GuidebookText.CONTENT_NEW_SURVIVAL
    },
    structuresAndLoots: {
        title: GuidebookText.CONTENT_STRUCTURES_TITLE,
        content: GuidebookText.CONTENT_STRUCTURES
    },
    vehicles: {
        title: GuidebookText.CONTENT_VEHICLES_TITLE,
        content: GuidebookText.CONTENT_VEHICLES
    },
    tradersAndSurvivors: {
        title: GuidebookText.CONTENT_TRADERS_TITLE,
        content: GuidebookText.CONTENT_TRADERS
    },
    zombies: {
        title: GuidebookText.CONTENT_ZOMBIES_TITLE,
        content: GuidebookText.CONTENT_ZOMBIES
    }
};
// =====================================================
// FORM FUNCTIONS
// =====================================================
/**
 * Main guidebook function - displays the primary menu
 */
export function showGuidebook(player) {
    const form = new ActionFormData()
        .title(GuidebookText.MAIN_TITLE)
        .body(GuidebookText.MAIN_WELCOME);
    // Add main menu buttons
    form.button(GuidebookText.BTN_CORE_GAMEPLAY, GuidebookIcons.SWORD);
    form.button(GuidebookText.BTN_SETTINGS, GuidebookIcons.GEAR);
    form.button(GuidebookText.BTN_COLLECTABLES, GuidebookIcons.COLLECTABLES);
    form.button(GuidebookText.BTN_FEEDBACK, GuidebookIcons.CHAT);
    form.show(player).then((response) => {
        if (response.canceled)
            return;
        switch (response.selection) {
            case 0:
                showCoreGameplayMenu(player);
                break;
            case 1:
                // Forward to existing game settings system
                showSettingsRedirect(player);
                break;
            case 2:
                //collectables
                CollectablesMainForm(player);
                break;
            case 3:
                showFeedbackMenu(player);
                break;
        }
    });
}
/**
 * Settings redirect - forwards to existing game settings
 */
function showSettingsRedirect(player) {
    player.sendMessage("§aOpening Game Settings...");
    GameSettingsMainForm(player);
}
/**
 * Core Gameplay menu with all gameplay-related topics
 */
function showCoreGameplayMenu(player) {
    const form = new ActionFormData()
        .title(GuidebookText.TITLE_CORE_GAMEPLAY)
        .body(GuidebookText.BODY_CORE_GAMEPLAY);
    // Add core gameplay buttons
    form.button(GuidebookText.BTN_NEW_SURVIVAL, GuidebookIcons.HEART);
    form.button(GuidebookText.BTN_STRUCTURES, GuidebookIcons.STRUCTURE);
    form.button(GuidebookText.BTN_VEHICLES, GuidebookIcons.MINECART);
    form.button(GuidebookText.BTN_TRADERS, GuidebookIcons.VILLAGER);
    form.button(GuidebookText.BTN_ZOMBIES, GuidebookIcons.MOB_SPAWNER);
    // Add back button
    form.button(GuidebookText.BTN_BACK, GuidebookIcons.ARROW_LEFT);
    form.show(player).then((response) => {
        if (response.canceled)
            return;
        switch (response.selection) {
            case 0:
                showContentPage(player, 'newSurvivalSystem', () => showCoreGameplayMenu(player));
                break;
            case 1:
                showContentPage(player, 'structuresAndLoots', () => showCoreGameplayMenu(player));
                break;
            case 2:
                showContentPage(player, 'vehicles', () => showCoreGameplayMenu(player));
                break;
            case 3:
                showContentPage(player, 'tradersAndSurvivors', () => showCoreGameplayMenu(player));
                break;
            case 4:
                showContentPage(player, 'zombies', () => showCoreGameplayMenu(player));
                break;
            case 5:
                // Back button
                showGuidebook(player);
                break;
        }
    });
}
/**
 * Feedback menu for user input
 */
function showFeedbackMenu(player) {
    const form = new ActionFormData()
        .title(GuidebookText.CONTENT_FEEDBACK_TITLE)
        .body(GuidebookText.CONTENT_FEEDBACK)
        .button(GuidebookText.BTN_CLOSE)
        .button(GuidebookText.BTN_BACK);
    form.show(player).then((response) => {
        if (response.canceled)
            return;
        if (response.selection === 1) {
            // Back to main menu
            showGuidebook(player);
        }
    });
}
/**
 * Generic content page display function
 */
function showContentPage(player, contentKey, backCallback) {
    const content = CORE_GAMEPLAY_CONTENT[contentKey];
    if (!content) {
        player.sendMessage(GuidebookText.ERROR_CONTENT_NOT_FOUND);
        backCallback();
        return;
    }
    const form = new ActionFormData()
        .title(content.title)
        .body(content.content)
        .button(GuidebookText.BTN_BACK)
        .button(GuidebookText.BTN_MAIN_MENU);
    form.show(player).then((response) => {
        if (response.canceled)
            return;
        if (response.selection === 0) {
            // Back button
            backCallback();
        }
        else if (response.selection === 1) {
            // Main menu button
            showGuidebook(player);
        }
    });
}
