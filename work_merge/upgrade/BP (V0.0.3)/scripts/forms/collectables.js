import { ActionFormData } from "@minecraft/server-ui";
import { PlayerCollectables } from "../handlers/collectables";
export function CollectablesMainForm(player) {
    const form = new ActionFormData();
    form.title("Collectables Menu");
    const progress = PlayerCollectables.getProgress(player);
    const barLength = 20;
    const filledBars = Math.floor((progress.percentage / 100) * barLength);
    const emptyBars = barLength - filledBars;
    const progressBar = `§a${"❚".repeat(filledBars)}§7${"❚".repeat(emptyBars)}§r`;
    form.body(`§7You have collected:§e ${progress.unlocked}§7/§6${progress.total}§r\n§8[${progressBar}§8] §e${progress.percentage} Percent§r`);
    form.button("§9View Unlocked\n§8Collectables");
    form.button("§9View Locked\n§8Collectables");
    form.button("§l§cExit Menu§r\n§8Click Here");
    form.show(player).then(response => {
        if (response.selection == undefined || response.canceled || response.selection === 2)
            return;
        if (response.selection === 0) {
            unlockedCollectablesForm(player);
            return;
        }
        if (response.selection === 1) {
            lockedCollectablesForm(player);
            return;
        }
    });
}
function unlockedCollectablesForm(player) {
    const form = new ActionFormData();
    form.title("Unlocked Collectables");
    const unlockedCollectables = PlayerCollectables.getUnlockedCollectables(player);
    form.body(`§7You have unlocked the following collectables:\n\n${unlockedCollectables.map(c => `§e- ${c.name}`).join("\n")}\n`);
    form.button("§l§cBack§r\n§8Click Here");
    form.show(player).then(response => {
        if (response.selection == undefined || response.canceled || response.selection === 0) {
            CollectablesMainForm(player);
            return;
        }
    });
}
function lockedCollectablesForm(player) {
    const form = new ActionFormData();
    form.title("Locked Collectables");
    const lockedCollectableIds = PlayerCollectables.getLockedCollectables(player);
    form.body(`§7You have not yet unlocked the following collectables:\n\n${lockedCollectableIds.map(id => {
        const collectable = PlayerCollectables.getCollectableById(id);
        return collectable ? `§e- ${collectable.name}` : `§e- Unknown Collectable (ID: ${id})`;
    }).join("\n")}\n`);
    form.button("§l§cBack§r\n§8Click Here");
    form.show(player).then(response => {
        if (response.selection == undefined || response.canceled || response.selection === 0) {
            CollectablesMainForm(player);
            return;
        }
    });
}
