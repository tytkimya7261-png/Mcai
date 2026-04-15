import { system } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { GameSettings } from '../handlers/gamesettings';
/**
 * Main Game Settings Menu - Action Form with category buttons
 * @param player - The player to show the form to
 */
export function GameSettingsMainForm(player) {
    const form = new ActionFormData()
        .title("§l§6Game Settings")
        .body("§8Configure global game settings for the server")
        .button("§9Apocalypse Mode\n§8Configure mob spawn rates")
        .button("§9Structures\n§8Toggle structure generation")
        .button("§9Gravestones\n§8Toggle gravestone system")
        .button("§9Attribute Display\n§8Configure actionbar settings")
        .button("§9Exit\n§8Close settings menu");
    form.show(player).then((response) => {
        if (response.canceled || response.selection === undefined)
            return;
        switch (response.selection) {
            case 0: // Mob Spawning
                SpawningSettingsForm(player);
                break;
            case 1: // Structures
                StructuresSettingsForm(player);
                break;
            case 2: // Gravestones
                GravestoneSettingsForm(player);
                break;
            case 3: // Attribute Display
                AttributeDisplayForm(player);
                break;
            case 4: // Exit
                return;
        }
    });
}
function StructuresSettingsForm(player) {
    const currentEnabled = GameSettings.getStructuresEnabled();
    const form = new ModalFormData()
        .title("§l§6Structure Settings")
        .toggle("§9Enable Structures\n§8When enabled, world structures will generate normally", { defaultValue: currentEnabled });
    form.show(player).then((response) => {
        if (response.canceled || !response.formValues)
            return;
        const newEnabled = response.formValues[0];
        GameSettings.setStructuresEnabled(newEnabled);
    });
}
/**
 * Mob Spawning Settings Form - Modal form with sliders for each mob type
 * @param player - The player to show the form to
 */
function SpawningSettingsForm(player) {
    const currentSettings = GameSettings.getSpawningSettings();
    const form = new ModalFormData()
        .title("§l§6Mob Spawning Settings")
        .label("§8Override vanilla mob spawning (0% = No override, 100% = Complete override)")
        .divider()
        .slider("§9Cows", 0, 100, { defaultValue: currentSettings.cows, valueStep: 5 })
        .slider("§9Sheep", 0, 100, { defaultValue: currentSettings.sheep, valueStep: 5 })
        .slider("§9Pigs", 0, 100, { defaultValue: currentSettings.pigs, valueStep: 5 })
        .slider("§9Wolves", 0, 100, { defaultValue: currentSettings.wolfs, valueStep: 5 })
        .slider("§9Chickens", 0, 100, { defaultValue: currentSettings.chickens, valueStep: 5 })
        .slider("§9Rabbits", 0, 100, { defaultValue: currentSettings.rabbits, valueStep: 5 })
        .slider("§9Horses", 0, 100, { defaultValue: currentSettings.horses, valueStep: 5 })
        .slider("§9Llamas", 0, 100, { defaultValue: currentSettings.llamas, valueStep: 5 })
        .slider("§9Villagers", 0, 100, { defaultValue: currentSettings.villagers, valueStep: 5 })
        .slider("§9Skeletons", 0, 100, { defaultValue: currentSettings.skeletons, valueStep: 5 })
        .slider("§9Zombies", 0, 100, { defaultValue: currentSettings.zombies, valueStep: 5 })
        .slider("§9Endermen", 0, 100, { defaultValue: currentSettings.endermen, valueStep: 5 })
        .slider("§9Creepers", 0, 100, { defaultValue: currentSettings.creepers, valueStep: 5 })
        .slider("§9Spiders", 0, 100, { defaultValue: currentSettings.spiders, valueStep: 5 })
        .submitButton("§l§aSave Changes");
    form.show(player).then((response) => {
        if (response.canceled || !response.formValues) {
            // Return to main menu
            system.run(() => GameSettingsMainForm(player));
            return;
        }
        const newSettings = {
            cows: response.formValues[2],
            sheep: response.formValues[3],
            pigs: response.formValues[4],
            wolfs: response.formValues[5],
            chickens: response.formValues[6],
            rabbits: response.formValues[7],
            horses: response.formValues[8],
            llamas: response.formValues[9],
            villagers: response.formValues[10],
            skeletons: response.formValues[11],
            zombies: response.formValues[12],
            endermen: response.formValues[13],
            creepers: response.formValues[14],
            spiders: response.formValues[15],
        };
        GameSettings.setSpawningSettings(newSettings);
        // Show confirmation and return to main menu
        player.sendMessage("§aMob spawning settings saved successfully!");
        system.run(() => GameSettingsMainForm(player));
    });
}
/**
 * Gravestone Settings Form - Simple toggle with confirmation
 * @param player - The player to show the form to
 */
function GravestoneSettingsForm(player) {
    const currentEnabled = GameSettings.getGravestonesEnabled();
    const form = new ModalFormData()
        .title("§l§6Gravestone Settings")
        .toggle("§9Enable Gravestones\n§8When enabled, gravestones will spawn when players die", { defaultValue: currentEnabled })
        .submitButton("§l§cSave Changes");
    form.show(player).then((response) => {
        if (response.canceled || !response.formValues) {
            // Return to main menu
            system.run(() => GameSettingsMainForm(player));
            return;
        }
        const enabled = response.formValues[0];
        GameSettings.setGravestonesEnabled(enabled);
        // Show confirmation and return to main menu
        const status = enabled ? "§aenabled" : "§cdisabled";
        player.sendMessage(`§aGravestones have been ${status}!`);
        system.run(() => GameSettingsMainForm(player));
    });
}
/**
 * Attribute Display Settings Form - Dropdowns for layout and trigger options
 * @param player - The player to show the form to
 */
function AttributeDisplayForm(player) {
    const currentSettings = GameSettings.getAttributeSettings();
    const layoutOptions = ["Default", "Short"];
    const triggerOptions = ["Always Show", "Show on Crouch"];
    const currentLayoutIndex = currentSettings.actionbar.type === "default" ? 0 : 1;
    const currentTriggerIndex = currentSettings.actionbar.trigger === "default" ? 0 : 1;
    const form = new ModalFormData()
        .title("§l§6Attribute Display Settings")
        .dropdown("§bActionbar Layout\n§8Choose how player attributes are displayed", layoutOptions, { defaultValueIndex: currentLayoutIndex })
        .dropdown("§eDisplay Trigger\n§8Choose when the actionbar is shown", triggerOptions, { defaultValueIndex: currentTriggerIndex })
        .submitButton("§l§aSave Changes");
    form.show(player).then((response) => {
        if (response.canceled || !response.formValues) {
            // Return to main menu
            system.run(() => GameSettingsMainForm(player));
            return;
        }
        const layoutIndex = response.formValues[0];
        const triggerIndex = response.formValues[1];
        const layoutType = layoutIndex === 0 ? "default" : "short";
        const triggerType = triggerIndex === 0 ? "default" : "crouch";
        GameSettings.setAttributeSettings({
            actionbar: {
                type: layoutType,
                trigger: triggerType
            }
        });
        // Show confirmation and return to main menu
        player.sendMessage("§aAttribute display settings saved successfully!");
        system.run(() => GameSettingsMainForm(player));
    });
}
