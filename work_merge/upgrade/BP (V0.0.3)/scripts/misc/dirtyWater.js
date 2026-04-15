import { ItemStack, world } from "@minecraft/server";
import { addItemToInventory, getMainHand, setMainHand } from "../utils";
export function onWaterBottleUse(player) {
    const mainHand = getMainHand(player);
    if (mainHand?.typeId == "mbl_ts:bottle_of_water_0") {
        const waterBlock = player.getBlockFromViewDirection({ includeLiquidBlocks: true, maxDistance: 5 });
        if (waterBlock != undefined && waterBlock.block.typeId == "minecraft:water") {
            const newItem = new ItemStack("mbl_ts:bottle_of_water_dirty_4", 1);
            const amount = mainHand.amount;
            setMainHand(player, amount - 1 > 0 ? new ItemStack("mbl_ts:bottle_of_water_0", amount - 1) : undefined);
            const add = addItemToInventory(player, newItem);
            if (!add) {
                world.getDimension(player.dimension.id).spawnItem(newItem, player.location);
            }
        }
    }
}
