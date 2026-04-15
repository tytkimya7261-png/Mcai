/**
 * Handles zombie corpse loot spawning when a zombie dies and transforms into a corpse
 */
export function onZombieCorpseLoot(event) {
    const entity = event.sourceEntity;
    if (!entity || !entity.isValid)
        return;
    try {
        // Check if loot has already been spawned for this corpse
        if (entity.hasTag("loot_spawned")) {
            return; // Loot already spawned, don't spawn again
        }
        // Get entity location
        const location = entity.location;
        // Check if there's a player within 30 blocks
        const nearbyPlayers = entity.dimension.getPlayers({
            location: location,
            maxDistance: 30
        });
        // Only spawn loot if a player is nearby
        if (nearbyPlayers.length === 0)
            return;
        // Round coordinates for loot spawn
        const x = Math.floor(location.x);
        const y = Math.floor(location.y);
        const z = Math.floor(location.z);
        // Use the /loot spawn command to spawn items from the generic zombie body loot table
        // Note: Path is relative to the loot_tables folder
        const lootCommand = `loot spawn ${x} ${y} ${z} loot "mobblocks/ts/zombies/zombie_body_loot"`;
        entity.dimension.runCommand(lootCommand);
        //need to use execute command to spawn xp on the entity itself
        const xpCommand = `summon xp_orb ${x} ${y} ${z}`;
        const xpAmount = Math.floor(Math.random() * (3 - 0 + 1)) + 0; // Random XP between 0 and 3
        for (let i = 0; i < xpAmount; i++) {
            entity.dimension.runCommand(xpCommand);
        }
        // Tag the entity to prevent duplicate loot spawning
        entity.addTag("loot_spawned");
    }
    catch (error) {
    }
}
