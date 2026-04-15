"use strict";
// import { 
//     world, 
//     system, 
//     Entity, 
//     Player, 
//     EntityInventoryComponent, 
//     ItemStack,
//     Vector3,
//     EntityComponentTypes
// } from "@minecraft/server";
// // Constants
// export const TURRET_IDENTIFIER = "mbl_ts:slingshot_auto_turret";
// const MARBLE_ITEM_ID = "mbl_ts:marble"; // Adjust to your actual marble item ID
// const MARBLES_PER_SHOT = 4;
// const FIRE_ANIMATION_DURATION = 40; // 2 seconds total (0.5s * 4 loops = 2s, 20 ticks per second * 2)
// const MARBLE_PROJECTILE_ID = "mbl_ts:marble_projectile";
// const MARBLE_FIRE_INTERVAL = 10; // 0.5 seconds between each marble (10 ticks)
// // Turret state tracking
// interface TurretState {
//     entityId: string;
//     isFiring: boolean;
//     firingStartTime: number;
//     loadedMarbles: number;
// }
// const turretStates = new Map<string, TurretState>();
// /**
//  * Count marbles in player inventory
//  */
// function countMarblesInPlayerInventory(player: Player): number {
//     const inventory = player.getComponent("minecraft:inventory") as EntityInventoryComponent;
//     if (!inventory || !inventory.container) return 0;
//     let marbleCount = 0;
//     const container = inventory.container;
//     for (let i = 0; i < container.size; i++) {
//         const item = container.getItem(i);
//         if (item && item.typeId === MARBLE_ITEM_ID) {
//             marbleCount += item.amount;
//         }
//     }
//     return marbleCount;
// }
// /**
//  * Remove marbles from player inventory
//  */
// function removeMarblesFromPlayerInventory(player: Player, count: number): boolean {
//     const inventory = player.getComponent("minecraft:inventory") as EntityInventoryComponent;
//     if (!inventory || !inventory.container) return false;
//     let remainingToRemove = count;
//     const container = inventory.container;
//     for (let i = 0; i < container.size && remainingToRemove > 0; i++) {
//         const item = container.getItem(i);
//         if (item && item.typeId === MARBLE_ITEM_ID) {
//             if (item.amount <= remainingToRemove) {
//                 remainingToRemove -= item.amount;
//                 container.setItem(i, undefined);
//             } else {
//                 item.amount -= remainingToRemove;
//                 container.setItem(i, item);
//                 remainingToRemove = 0;
//             }
//         }
//     }
//     return remainingToRemove === 0;
// }
// /**
//  * Update turret ammo state based on loaded marbles
//  */
// function updateTurretAmmoState(turret: Entity): void {
//     const state = getTurretState(turret);
//     const hasAmmo = state.loadedMarbles >= MARBLES_PER_SHOT;
//     try {
//         turret.setProperty("mbl_ts:has_ammo", hasAmmo);
//         turret.setProperty("mbl_ts:is_loaded", hasAmmo);
//         turret.setProperty("mbl_ts:ammo_count", state.loadedMarbles);
//     } catch (error) {
//     }
// }
// /**
//  * Load marbles into turret from player inventory
//  */
// function loadTurret(turret: Entity, player: Player): void {
//     const marbleCount = countMarblesInPlayerInventory(player);
//     if (marbleCount < MARBLES_PER_SHOT) {
//         player.sendMessage("§cYou need 4 marbles to load the turret!");
//         return;
//     }
//     // Check if turret is already loaded
//     const state = getTurretState(turret);
//     if (state.loadedMarbles >= MARBLES_PER_SHOT) {
//         player.sendMessage("§cTurret is already loaded! Interact again to fire.");
//         return;
//     }
//     // Remove 4 marbles from player inventory
//     if (removeMarblesFromPlayerInventory(player, MARBLES_PER_SHOT)) {
//         // Update state
//         state.loadedMarbles = MARBLES_PER_SHOT;
//         try {
//             turret.setProperty("mbl_ts:is_loaded", true);
//             turret.setProperty("mbl_ts:has_ammo", true);
//             turret.setProperty("mbl_ts:ammo_count", MARBLES_PER_SHOT);
//         } catch (error) {
//             console.warn(`Failed to set turret loaded state: ${error}`);
//         }
//         player.sendMessage("§aLoaded 4 marbles into the turret!");
//         turret.dimension.playSound("random.click", turret.location, { volume: 1.0, pitch: 0.8 });
//     } else {
//         player.sendMessage("§cFailed to load marbles!");
//     }
// }
// /**
//  * Fire the turret (shoots 4 marbles in sequence)
//  */
// function fireTurret(turret: Entity, player: Player): void {
//     const state = getTurretState(turret);
//     if (state.isFiring) {
//         player.sendMessage("§cTurret is already firing!");
//         return;
//     }
//     if (state.loadedMarbles < MARBLES_PER_SHOT) {
//         player.sendMessage("§cTurret is not loaded!");
//         return;
//     }
//     // Start firing sequence
//     state.isFiring = true;
//     state.firingStartTime = system.currentTick;
//     try {
//         turret.setProperty("mbl_ts:is_firing", true);
//     } catch (error) {
//         console.warn(`Failed to set turret firing state: ${error}`);
//     }
//     player.sendMessage("§eFiring turret!");
//     turret.dimension.playSound("mob.villager.yes", turret.location, { volume: 1.0, pitch: 1.2 });
//     // Schedule marble shots - fire at 0, 0.5s, 1.0s, 1.5s (every 10 ticks)
//     for (let i = 0; i < MARBLES_PER_SHOT; i++) {
//         const delay = i * MARBLE_FIRE_INTERVAL; // 0, 10, 20, 30 ticks
//         system.runTimeout(() => {
//             if (turret.isValid) {
//                 shootMarble(turret, i);
//             }
//         }, delay);
//     }
//     // Complete firing after animation (2 seconds)
//     system.runTimeout(() => {
//         if (turret.isValid) {
//             completeFiring(turret);
//         }
//     }, FIRE_ANIMATION_DURATION);
// }
// /**
//  * Shoot a single marble projectile
//  */
// /**
//  * Shoot a single marble projectile
//  */
// function shootMarble(turret: Entity, marbleIndex: number): void {
//     try {
//         const location = turret.location;
//         // Get the turret's rotation (head rotation)
//         const rotation = turret.getRotation();
//         // Convert rotation (yaw/pitch) to direction vector
//         // Yaw is Y rotation (horizontal), Pitch is X rotation (vertical)
//         const yawRad = ((rotation.y + 90) * Math.PI) / 180;
//         const pitchRad = (-rotation.x * Math.PI) / 180;
//         const targetDirection: Vector3 = {
//             x: Math.cos(pitchRad) * Math.cos(yawRad),
//             y: Math.sin(pitchRad),
//             z: Math.cos(pitchRad) * Math.sin(yawRad)
//         };
//         // Normalize just to be safe
//         const length = Math.sqrt(targetDirection.x ** 2 + targetDirection.y ** 2 + targetDirection.z ** 2);
//         targetDirection.x /= length;
//         targetDirection.y /= length;
//         targetDirection.z /= length;
//         console.warn(`[TURRET] Rotation - Yaw: ${rotation.y.toFixed(2)}, Pitch: ${rotation.x.toFixed(2)}`);
//         console.warn(`[TURRET] Direction - x: ${targetDirection.x.toFixed(3)}, y: ${targetDirection.y.toFixed(3)}, z: ${targetDirection.z.toFixed(3)}`);
//         // DEBUG: Draw a line of particles showing the direction the turret is facing
//         for (let i = 1; i <= 20; i++) {
//             const debugParticleLocation: Vector3 = {
//                 x: location.x + targetDirection.x * i,
//                 y: location.y + 1.65 + targetDirection.y * i,
//                 z: location.z + targetDirection.z * i
//             };
//             turret.dimension.spawnParticle("minecraft:critical_hit_emitter", debugParticleLocation);
//         }
//         // Adjust spawn position slightly forward and up
//         const spawnLocation: Vector3 = {
//             x: location.x + targetDirection.x * 1.5,
//             y: location.y + 1.65,
//             z: location.z + targetDirection.z * 1.5
//         };
//         // Spawn projectile
//         const projectile = turret.dimension.spawnEntity(MARBLE_PROJECTILE_ID, spawnLocation);
//         // Apply velocity to projectile aimed at target (straight shot, no arc)
//         const velocity: Vector3 = {
//             x: targetDirection.x * 2.5,
//             y: targetDirection.y * 2.5,
//             z: targetDirection.z * 2.5
//         };
//         projectile.applyImpulse(velocity);
//         // Play sound
//         turret.dimension.playSound("random.bow", turret.location, { volume: 1.0, pitch: 1.5 });
//         // Visual effect (particle)
//         turret.dimension.spawnParticle("minecraft:villager_happy", spawnLocation);
//     } catch (error) {
//         console.warn(`[TURRET ERROR] Failed to shoot marble: ${error}`);
//     }
// }
// /**
//  * Complete the firing sequence and reset state
//  */
// function completeFiring(turret: Entity): void {
//     const state = getTurretState(turret);
//     state.isFiring = false;
//     state.loadedMarbles = 0;
//     try {
//         turret.setProperty("mbl_ts:is_firing", false);
//         turret.setProperty("mbl_ts:is_loaded", false);
//         turret.setProperty("mbl_ts:has_ammo", false);
//         turret.setProperty("mbl_ts:ammo_count", 0);
//     } catch (error) {
//         console.warn(`Failed to reset turret state: ${error}`);
//     }
//     turret.dimension.playSound("random.click", turret.location, { volume: 0.8, pitch: 0.6 });
// }
// /**
//  * Get or create turret state
//  */
// function getTurretState(turret: Entity): TurretState {
//     const id = turret.id;
//     if (!turretStates.has(id)) {
//         turretStates.set(id, {
//             entityId: id,
//             isFiring: false,
//             firingStartTime: 0,
//             loadedMarbles: 0
//         });
//         // Ensure properties are set correctly on first access
//         try {
//             turret.setProperty("mbl_ts:is_loaded", false);
//             turret.setProperty("mbl_ts:has_ammo", false);
//             turret.setProperty("mbl_ts:is_firing", false);
//             turret.setProperty("mbl_ts:ammo_count", 0);
//         } catch (error) {
//             console.warn(`Failed to initialize turret properties: ${error}`);
//         }
//     }
//     return turretStates.get(id)!;
// }
// /**
//  * Handle turret interaction events
//  */
// export function handleTurretInteraction(turret: Entity, player: Player): void {
//     const state = getTurretState(turret);
//     // If turret is loaded, fire it
//     if (state.loadedMarbles >= MARBLES_PER_SHOT) {
//         fireTurret(turret, player);
//     } else {
//         // If not loaded, try to load from player inventory
//         loadTurret(turret, player);
//     }
// }
// /**
//  * Update all turret states (no longer needed for inventory monitoring)
//  */
// export function updateAllTurrets(): void {
//     // This function is kept for compatibility but no longer needs to do anything
//     // since we're not monitoring inventory anymore
// }
// /**
//  * Clean up invalid turret states (called from main pulse)
//  */
// export function cleanupTurretStates(): void {
//     const validIds = new Set<string>();
//     for (const dimension of [world.getDimension("overworld"), world.getDimension("nether"), world.getDimension("the_end")]) {
//         for (const turret of dimension.getEntities({ type: TURRET_IDENTIFIER })) {
//             validIds.add(turret.id);
//         }
//     }
//     // Remove states for entities that no longer exist
//     for (const [id, state] of turretStates.entries()) {
//         if (!validIds.has(id)) {
//             turretStates.delete(id);
//         }
//     }
// }
