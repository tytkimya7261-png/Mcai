import { EquipmentSlot } from "@minecraft/server";
export function encodeString(text, symbol = "§") {
    // Replace special characters that could cause issues in JSON
    const safeText = text
        .replace(/"/g, "^") // Replace quotes with ^
        .replace(/'/g, "~") // Replace single quotes with ~
        .replace(/§/g, "#"); // Replace existing color codes with #
    // Add a color symbol before every single character
    return safeText.split("").map(char => `${symbol}${char}`).join("");
}
export function decodeString(encodedText, symbol = "§") {
    // Remove all color symbols from the text
    const decoded = encodedText.replace(new RegExp(`${symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'), '');
    // Restore special characters
    return decoded
        .replace(/\^/g, '"') // Restore quotes
        .replace(/~/g, "'") // Restore single quotes
        .replace(/#/g, "§"); // Restore color codes
}
export function generateID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 15; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
        if ((i + 1) % 5 === 0 && i !== 14)
            id += '_';
    }
    return id;
}
export function getActionbarLayout(attributes, layout) {
    switch (layout) {
        case "icons":
            //need to get icons for this
            return `§b§7 ${attributes.hydration.value} §7 ${attributes.energy.value} §2§7 ${attributes.toxicity}`;
        case "short":
            return `§bHydr: §7${attributes.hydration.value} §dEner:§7 ${attributes.energy.value} §2Tox: §7${attributes.toxicity}`;
        case "default":
        default:
            return `§bHydration: §7${attributes.hydration.value} §dEnergy:§7 ${attributes.energy.value} §2Toxicity: §7${attributes.toxicity}`;
    }
}
export function getMainHand(player) {
    const equippable = player.getComponent("minecraft:equippable");
    if (!equippable)
        return undefined;
    return equippable.getEquipment(EquipmentSlot.Mainhand);
}
export function setMainHand(player, item) {
    const equippable = player.getComponent("minecraft:equippable");
    if (!equippable)
        return;
    equippable.setEquipment(EquipmentSlot.Mainhand, item);
}
export function addItemToInventory(player, item) {
    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory || inventory.container == undefined)
        return false;
    const leftover = inventory.container.addItem(item);
    return leftover === undefined;
}
