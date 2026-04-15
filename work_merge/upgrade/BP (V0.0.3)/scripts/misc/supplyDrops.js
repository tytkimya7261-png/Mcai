import { EntityComponentTypes, EquipmentSlot, ItemComponentTypes, world } from "@minecraft/server";
const supplyDrops = [
    "mbl_ts:supply_crate",
    "mbl_ts:supply_crate_food",
    "mbl_ts:supply_crate_medical"
];
const supplyDropLootTables = [
    "mobblocks/ts/supply_crate",
    "mobblocks/ts/supply_crate_food",
    "mobblocks/ts/supply_crate_medical"
];
export function onSupplyDropHurt(event) {
    if (isHoldingCrowbar(event.damagingEntity) && supplyDrops.includes(event.hitEntity.typeId)) {
        //handle opening system
        damageCrowbar(event.damagingEntity);
        supplyDropTrigger(event.hitEntity);
    }
}
export function onSupplyDropInteract(event) {
    if (isHoldingCrowbar(event.player) && supplyDrops.includes(event.target.typeId)) {
        //handle opening system
        damageCrowbar(event.player);
        supplyDropTrigger(event.target);
    }
}
function supplyDropTrigger(entity) {
    if (!supplyDrops.includes(entity.typeId))
        return;
    const index = supplyDrops.indexOf(entity.typeId);
    const lootTable = supplyDropLootTables[index];
    world.getDimension(entity.dimension.id).runCommand(`loot spawn ${entity.location.x} ${entity.location.y} ${entity.location.z} loot "${lootTable}"`);
    world.getDimension(entity.dimension.id).spawnEntity("mbl_ts:supply_crate_open", entity.location);
    //then despawn the entity
    entity.remove();
}
//this applies 1 damage to the crowbar when used on a supply drop
function damageCrowbar(player) {
    const component = player.getComponent(EntityComponentTypes.Equippable);
    if (!component)
        return;
    const mainHand = component.getEquipmentSlot(EquipmentSlot.Mainhand);
    if (!mainHand)
        return;
    const item = mainHand.getItem();
    if (!item)
        return;
    const durability = item.getComponent(ItemComponentTypes.Durability);
    if (!durability)
        return;
    if (durability.damage >= durability.maxDurability - 1) {
        //break the item
        mainHand.setItem(undefined);
        return;
    }
    durability.damage += 1;
    mainHand.setItem(item);
}
function isHoldingCrowbar(player) {
    const component = player.getComponent(EntityComponentTypes.Equippable);
    if (!component)
        return false;
    const mainHand = component.getEquipmentSlot(EquipmentSlot.Mainhand);
    if (!mainHand)
        return false;
    const item = mainHand.getItem();
    if (!item)
        return false;
    return item.typeId === "mbl_ts:crowbar";
}
