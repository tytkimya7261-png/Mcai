import { EquipmentSlot, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
// Supply drop types configuration
const SUPPLY_DROPS = {
    armory: {
        entity: "mbl_ts:supply_crate",
        name: "Armory Supply Drop",
        icon: "textures/mobblocks/ts/menu/armory_icon"
    },
    food: {
        entity: "mbl_ts:supply_crate_food",
        name: "Food Supply Drop",
        icon: "textures/mobblocks/ts/menu/food_icon"
    },
    medical: {
        entity: "mbl_ts:supply_crate_medical",
        name: "Medical Supply Drop",
        icon: "textures/mobblocks/ts/menu/medical_icon"
    }
};
// Reusable function for supply drops
function handleSupplyDrop(player, entityType) {
    const location = player.location;
    const spawnLocation = { x: location.x, y: location.y + 100, z: location.z };
    // Spawn the supply crate entity
    const entity = player.dimension.spawnEntity(entityType, spawnLocation);
    entity.addEffect("slow_falling", 20 * 1000, { amplifier: 2, showParticles: false });
    // Play sound using player.playSound
    player.playSound("walkie_talkie_supply", { volume: 1, pitch: 1 });
    // Remove walkie talkie from inventory using proper API
    removeWalkieTalkie(player);
}
// Send help function
function sendHelp(player) {
    const location = player.location;
    const soldierOffsets = [
        { x: 0, y: 0, z: 4 }, // Behind
        { x: 0, y: 0, z: -4 }, // In front
        { x: 4, y: 0, z: 0 }, // Right
        { x: -4, y: 0, z: 0 } // Left
    ];
    // Spawn soldiers using dimension.spawnEntity
    soldierOffsets.forEach(offset => {
        const spawnLocation = {
            x: location.x + offset.x,
            y: location.y + offset.y,
            z: location.z + offset.z
        };
        player.dimension.spawnEntity("mbl_ts:soldier", spawnLocation);
    });
    // Play sound using player.playSound
    player.playSound("walkie_talkie_army", { volume: 1, pitch: 1 });
    // Remove walkie talkie from inventory
    removeWalkieTalkie(player);
}
// Helper function to remove walkie talkie from player inventory
function removeWalkieTalkie(player) {
    const inventoryComponent = player.getComponent("inventory");
    if (!inventoryComponent || !inventoryComponent.container)
        return;
    const container = inventoryComponent.container;
    // Find and remove walkie talkie from inventory
    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (item?.typeId === "mbl_ts:walkie_talkie") {
            if (item.amount > 1) {
                // If there are multiple, decrease the amount
                const newItem = new ItemStack(item.typeId, item.amount - 1);
                container.setItem(i, newItem);
            }
            else {
                // If only one, remove it completely
                container.setItem(i, undefined);
            }
            break; // Only remove one
        }
    }
}
// Main walkie talkie handler
export function handleWalkieTalkieUse(event) {
    const player = event.source;
    const component = player.getComponent("equippable");
    if (!component)
        return;
    const item = component.getEquipment(EquipmentSlot.Mainhand);
    if (item?.typeId !== "mbl_ts:walkie_talkie")
        return;
    player.playSound("walkie_talkie_active", { volume: 1, pitch: 1 });
    const gui = new ActionFormData();
    gui.title("Walkie Talkie");
    // Add supply drop buttons
    Object.values(SUPPLY_DROPS).forEach(drop => {
        gui.button(drop.name, drop.icon);
    });
    gui.button("Exit", "textures/mobblocks/ts/menu/exit_icon");
    gui.show(player).then(result => {
        if (result.canceled || result.selection === undefined)
            return;
        const selection = result.selection;
        const supplyDrops = Object.values(SUPPLY_DROPS);
        // Handle supply drops
        if (selection < supplyDrops.length) {
            handleSupplyDrop(player, supplyDrops[selection].entity);
        }
        // Exit option - do nothing
    });
}
