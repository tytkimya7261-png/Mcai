import { world, EntityInventoryComponent, ItemComponentTypes } from "@minecraft/server";
const MAX_NAILER_DURABILITY = 400;
const DURABILITY_LOSS_PER_USE = 10;
/**
 * Updates the lore of the nailer to show remaining durability
 */
export function updateNailerLore(itemStack) {
    const durabilityComp = itemStack.getComponent(ItemComponentTypes.Durability);
    if (!durabilityComp)
        return;
    const currentDurability = durabilityComp.maxDurability - durabilityComp.damage;
    const lore = [`§7Durability: §f${currentDurability}/${MAX_NAILER_DURABILITY}`];
    itemStack.setLore(lore);
}
/**
 * Handles nailer usage - consumes durability and updates lore
 */
export function handleNailerUse(player, itemStack, slot) {
    const inventory = player.getComponent(EntityInventoryComponent.componentId);
    if (!inventory?.container)
        return;
    const currentItem = inventory.container.getItem(slot);
    if (!currentItem || currentItem.typeId !== "mbl_ts:nailer")
        return;
    const durabilityComp = currentItem.getComponent(ItemComponentTypes.Durability);
    if (!durabilityComp)
        return;
    // Add durability damage
    const newDamage = durabilityComp.damage + DURABILITY_LOSS_PER_USE;
    if (newDamage >= durabilityComp.maxDurability) {
        // Nailer is broken, remove it
        inventory.container.setItem(slot, undefined);
        player.playSound("random.break");
    }
    else {
        // Update durability
        durabilityComp.damage = newDamage;
        // Update lore
        const currentDurability = durabilityComp.maxDurability - durabilityComp.damage;
        const lore = [`§7Durability: §f${currentDurability}/${MAX_NAILER_DURABILITY}`];
        currentItem.setLore(lore);
        // Set the item back in the slot
        inventory.container.setItem(slot, currentItem);
    }
}
/**
 * Pulse function to update nailer lore for all players
 */
export function nailerPulse() {
    for (const player of world.getAllPlayers()) {
        const inventory = player.getComponent(EntityInventoryComponent.componentId);
        if (!inventory?.container)
            continue;
        // Check mainhand
        const mainhand = inventory.container.getItem(player.selectedSlotIndex);
        if (mainhand?.typeId === "mbl_ts:nailer") {
            updateNailerLore(mainhand);
            inventory.container.setItem(player.selectedSlotIndex, mainhand);
        }
        // Check all inventory slots for nailers
        for (let i = 0; i < inventory.container.size; i++) {
            const item = inventory.container.getItem(i);
            if (item?.typeId === "mbl_ts:nailer") {
                const durabilityComp = item.getComponent(ItemComponentTypes.Durability);
                if (durabilityComp) {
                    const currentDurability = durabilityComp.maxDurability - durabilityComp.damage;
                    const expectedLore = `§7Durability: §f${currentDurability}/${MAX_NAILER_DURABILITY}`;
                    const currentLore = item.getLore();
                    // Only update if lore is missing or different
                    if (currentLore.length === 0 || currentLore[0] !== expectedLore) {
                        updateNailerLore(item);
                        inventory.container.setItem(i, item);
                    }
                }
            }
        }
    }
}
