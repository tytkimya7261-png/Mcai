import { ActionFormData, MessageFormData } from '@minecraft/server-ui';
import { GameSettingsMainForm } from './gamesettings';
// =====================================================
// ENUMS AND CONFIGURATION - All text and settings
// =====================================================
// Text Enums for easy configuration
export var GuidebookText;
(function (GuidebookText) {
    // Main Menu
    GuidebookText["MAIN_TITLE"] = "True Survival Zombie Apocalypse Add-On";
    GuidebookText["MAIN_WELCOME"] = "Welcome to True Survival, This guidebook will walk you through the basics of surviving etc";
    // Button Text
    GuidebookText["BTN_CORE_GAMEPLAY"] = "Core Gameplay";
    GuidebookText["BTN_SETTINGS"] = "Settings";
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
    GuidebookText["CONTENT_NEW_SURVIVAL_TITLE"] = "New Survival System";
    GuidebookText["CONTENT_STRUCTURES_TITLE"] = "Structures and Loots";
    GuidebookText["CONTENT_VEHICLES_TITLE"] = "Vehicles";
    GuidebookText["CONTENT_TRADERS_TITLE"] = "Traders and Survivors";
    GuidebookText["CONTENT_ZOMBIES_TITLE"] = "Zombies";
    GuidebookText["CONTENT_FEEDBACK_TITLE"] = "Feedback";
    // Short Template Content
    GuidebookText["CONTENT_NEW_SURVIVAL"] = "Introduces thirst, temperature, infection, stamina and mental health systems.";
    GuidebookText["CONTENT_STRUCTURES"] = "Discover abandoned houses, military outposts, medical centers and bunkers.";
    GuidebookText["CONTENT_VEHICLES"] = "Use cars, motorcycles, trucks, boats and helicopters. Requires fuel.";
    GuidebookText["CONTENT_TRADERS"] = "Interact with traders, survivors, doctors, mechanics and guards.";
    GuidebookText["CONTENT_ZOMBIES"] = "Face walkers, runners, crawlers, spitters, bloaters and alpha zombies.";
    GuidebookText["CONTENT_FEEDBACK"] = "Help improve True Survival by reporting bugs and suggesting features.";
    // Error Messages
    GuidebookText["ERROR_CONTENT_NOT_FOUND"] = "\u00A7cError: Content not found!";
})(GuidebookText || (GuidebookText = {}));
// Icon Enums for easy configuration
export var GuidebookIcons;
(function (GuidebookIcons) {
    GuidebookIcons["BOOK"] = "textures/ui/book_writable";
    GuidebookIcons["SWORD"] = "textures/ui/sword_diamond";
    GuidebookIcons["GEAR"] = "textures/ui/gear";
    GuidebookIcons["CHAT"] = "textures/ui/chat_send";
    GuidebookIcons["HEART"] = "textures/ui/heart_full";
    GuidebookIcons["STRUCTURE"] = "textures/ui/structure_block";
    GuidebookIcons["MINECART"] = "textures/ui/minecart_normal";
    GuidebookIcons["VILLAGER"] = "textures/ui/villager";
    GuidebookIcons["MOB_SPAWNER"] = "textures/ui/mob_spawner";
    GuidebookIcons["ARROW_LEFT"] = "textures/ui/arrow_left";
    GuidebookIcons["CANCEL"] = "textures/ui/cancel";
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
    const form = new MessageFormData()
        .title(GuidebookText.CONTENT_FEEDBACK_TITLE)
        .body(GuidebookText.CONTENT_FEEDBACK)
        .button1(GuidebookText.BTN_CLOSE)
        .button2(GuidebookText.BTN_BACK);
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
    const form = new MessageFormData()
        .title(content.title)
        .body(content.content)
        .button1(GuidebookText.BTN_BACK)
        .button2(GuidebookText.BTN_MAIN_MENU);
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
