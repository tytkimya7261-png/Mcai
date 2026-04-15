const collectables = {
    // Main DVD Collection
    "mbl_ts:blocks_28_later_dvd": {
        Collectableid: "BL28",
        name: "28 Blocks Later Poster"
    },
    "mbl_ts:chickens_came_back_dvd": {
        Collectableid: "CCB1",
        name: "Chickens Came Back Poster"
    },
    "mbl_ts:chunks_28_later_dvd": {
        Collectableid: "CK28",
        name: "28 Chunks Later Poster"
    },
    "mbl_ts:dawn_of_the_witches_dvd": {
        Collectableid: "DOTW",
        name: "Dawn of the Witches Poster"
    },
    "mbl_ts:day_of_the_zombies_dvd": {
        Collectableid: "DOTZ",
        name: "Day of the Zombies Poster"
    },
    "mbl_ts:minecart_to_the_end_dvd": {
        Collectableid: "MTTE",
        name: "Minecraft to the End Poster"
    },
    "mbl_ts:night_of_the_mobs_dvd": {
        Collectableid: "NOTM",
        name: "Night of the Mob Poster"
    },
    "mbl_ts:the_return_of_the_skeleton_dvd": {
        Collectableid: "ROTS",
        name: "The Return of the Skeleton Poster"
    },
    "mbl_ts:villagers_of_the_dead_dvd": {
        Collectableid: "VOTD",
        name: "Villagers of the Dead Poster"
    },
    "mbl_ts:wither_of_darkness_dvd": {
        Collectableid: "WODA",
        name: "Wither of Darkness Poster"
    },
    // JB Collection
    "mbl_ts:block_one_dvd": {
        Collectableid: "BLK1",
        name: "Block One Poster"
    },
    "mbl_ts:fighting_panda_dvd": {
        Collectableid: "FPND",
        name: "Fighting Panda Poster"
    },
    "mbl_ts:school_of_cobble_dvd": {
        Collectableid: "SOCB",
        name: "School of Cobble Poster"
    },
    "mbl_ts:shallow_steve_dvd": {
        Collectableid: "SHST",
        name: "Shallow Steve Poster"
    },
    "mbl_ts:super_creeper_bro_dvd": {
        Collectableid: "SCBR",
        name: "Super Creeper Bro Poster"
    },
    // Walking Mobs (WM) Collection
    "mbl_ts:wm_season_1": {
        Collectableid: "WM01",
        name: "The Walking Mobs (Season 1) Poster"
    },
    "mbl_ts:wm_season_2": {
        Collectableid: "WM02",
        name: "The Walking Mobs (Season 2) Poster"
    },
    "mbl_ts:wm_season_3": {
        Collectableid: "WM03",
        name: "The Walking Mobs (Season 3) Poster"
    },
    "mbl_ts:wm_season_4": {
        Collectableid: "WM04",
        name: "The Walking Mobs (Season 4) Poster"
    },
    "mbl_ts:wm_season_5": {
        Collectableid: "WM05",
        name: "The Walking Mobs (Season 5) Poster"
    },
    "mbl_ts:wm_season_6": {
        Collectableid: "WM06",
        name: "The Walking Mobs (Season 6) Poster"
    },
    "mbl_ts:wm_season_7": {
        Collectableid: "WM07",
        name: "The Walking Mobs (Season 7) Poster"
    },
    "mbl_ts:wm_season_8": {
        Collectableid: "WM08",
        name: "The Walking Mobs (Season 8) Poster"
    },
    "mbl_ts:wm_season_9": {
        Collectableid: "WM09",
        name: "The Walking Mobs (Season 9) Poster"
    },
    "mbl_ts:wm_season_10": {
        Collectableid: "WM10",
        name: "The Walking Mobs (Season 10) Poster"
    },
    "mbl_ts:wm_season_11": {
        Collectableid: "WM11",
        name: "The Walking Mobs (Season 11) Poster"
    }
};
export class PlayerCollectables {
    static COLLECTABLE_PROPERTY = "mbl:collectables";
    static getPlayerCollectables(player) {
        try {
            const collectablesData = player.getDynamicProperty(this.COLLECTABLE_PROPERTY);
            if (!collectablesData) {
                return [];
            }
            return JSON.parse(collectablesData);
        }
        catch (error) {
            return [];
        }
    }
    static addCollectable(player, collectableId) {
        const currentCollectables = this.getPlayerCollectables(player);
        // Check if player already has this collectable
        if (currentCollectables.includes(collectableId)) {
            return false;
        }
        // Add the new collectable
        currentCollectables.push(collectableId);
        try {
            player.setDynamicProperty(this.COLLECTABLE_PROPERTY, JSON.stringify(currentCollectables));
            return true;
        }
        catch (error) {
            return false;
        }
    }
    static removeCollectable(player, collectableId) {
        const currentCollectables = this.getPlayerCollectables(player);
        const index = currentCollectables.indexOf(collectableId);
        if (index === -1) {
            return false; // Player doesn't have this collectable
        }
        currentCollectables.splice(index, 1);
        try {
            player.setDynamicProperty(this.COLLECTABLE_PROPERTY, JSON.stringify(currentCollectables));
            return true;
        }
        catch (error) {
            return false;
        }
    }
    static hasCollectable(player, collectableId) {
        const collectables = this.getPlayerCollectables(player);
        return collectables.includes(collectableId);
    }
    static getCollectableCount(player) {
        return this.getPlayerCollectables(player).length;
    }
    static getUnlockedCollectables(player) {
        const unlockedIds = this.getPlayerCollectables(player);
        const unlockedCollectables = [];
        for (const id of unlockedIds) {
            const collectable = this.getCollectableById(id);
            if (collectable) {
                unlockedCollectables.push(collectable);
            }
        }
        return unlockedCollectables;
    }
    static getLockedCollectables(player) {
        const unlockedIds = this.getPlayerCollectables(player);
        const allCollectableIds = Object.keys(collectables);
        return allCollectableIds
            .filter(id => !unlockedIds.includes(collectables[id].Collectableid))
            .map(id => collectables[id].Collectableid);
    }
    static clearAllCollectables(player) {
        try {
            player.setDynamicProperty(this.COLLECTABLE_PROPERTY, JSON.stringify([]));
        }
        catch (error) {
        }
    }
    static getCollectableById(collectableId) {
        for (const [itemId, collectable] of Object.entries(collectables)) {
            if (collectable.Collectableid === collectableId) {
                return collectable;
            }
        }
        return null;
    }
    static getItemIdByCollectableId(collectableId) {
        for (const [itemId, collectable] of Object.entries(collectables)) {
            if (collectable.Collectableid === collectableId) {
                return itemId;
            }
        }
        return null;
    }
    static getProgress(player) {
        const unlockedCount = this.getCollectableCount(player);
        const totalCount = Object.keys(collectables).length;
        const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
        return {
            unlocked: unlockedCount,
            total: totalCount,
            percentage: percentage,
            remaining: totalCount - unlockedCount
        };
    }
    static checkAndAddInventoryCollectables(player) {
        const newlyAdded = [];
        const inventory = player.getComponent("inventory");
        if (!inventory || !inventory.container)
            return newlyAdded;
        for (let i = 0; i < inventory.container.size; i++) {
            const item = inventory.container.getItem(i);
            if (!item)
                continue;
            // Check if this item is a collectable
            const collectable = collectables[item.typeId];
            if (collectable && !this.hasCollectable(player, collectable.Collectableid)) {
                // Add the collectable to player's collection
                if (this.addCollectable(player, collectable.Collectableid)) {
                    newlyAdded.push(collectable.Collectableid);
                    // Send unlock message to player
                    player.sendMessage(`§a§l[COLLECTIBLE UNLOCKED!] §r§7You've discovered: §e${collectable.name}§7!`);
                }
            }
        }
        return newlyAdded;
    }
}
