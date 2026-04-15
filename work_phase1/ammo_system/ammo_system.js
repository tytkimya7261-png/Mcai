/**
 * AMMO SYSTEM CONTROLLER - Post-Apocalyptic Survival ULTIMATE v5.0.0
 * Manages magazine items, ammo consumption, and reload mechanics
 * 
 * @module ammo_system
 * @requires @minecraft/server
 */

import { world, system, EntityComponentTypes } from '@minecraft/server';

// ============================================================================
// AMMO SYSTEM CONFIGURATION
// ============================================================================

const AMMO_CONFIG = {
  magazine_9mm: { capacity: 30, typeId: 'mypack:magazine_9mm' },
  magazine_556nato: { capacity: 30, typeId: 'mypack:magazine_556nato' },
  magazine_762x39: { capacity: 30, typeId: 'mypack:magazine_762x39' },
  magazine_338lapua: { capacity: 20, typeId: 'mypack:magazine_338lapua' },
  magazine_12gauge: { capacity: 8, typeId: 'mypack:magazine_12gauge' },
  magazine_grenade: { capacity: 6, typeId: 'mypack:magazine_grenade' }
};

const OBJECTIVE_NAME = 'ammo';
const SCOREBOARD_DISPLAY = 'sidebar';

// ============================================================================
// AMMO SYSTEM CLASS
// ============================================================================

class AmmoSystem {
  constructor() {
    this.playerAmmo = new Map(); // UUID -> ammo count
    this.playerMagazine = new Map(); // UUID -> magazine type
    this.initialized = false;
  }

  /**
   * Initialize ammo system on world load
   */
  initialize() {
    try {
      // Create/verify scoreboard objective
      const scoreboard = world.scoreboard;
      let objective = scoreboard.getObjective(OBJECTIVE_NAME);
      
      if (!objective) {
        objective = scoreboard.addObjective(OBJECTIVE_NAME, 'Ammo Count');
        console.log('[AmmoSystem] Created ammo scoreboard objective');
      }
      
      this.initialized = true;
      console.log('[AmmoSystem] Initialized successfully');
    } catch (error) {
      console.error('[AmmoSystem] Initialization failed:', error.message);
    }
  }

  /**
   * Get current ammo for a player
   * @param {Player} player - Target player
   * @returns {number} Current ammo count (0 if no magazine)
   */
  getPlayerAmmo(player) {
    try {
      const objective = world.scoreboard.getObjective(OBJECTIVE_NAME);
      if (!objective) return 0;
      
      const score = objective.getScore(player);
      return score !== undefined ? Math.max(0, score) : 0;
    } catch (error) {
      console.warn('[AmmoSystem] Error getting ammo:', error.message);
      return 0;
    }
  }

  /**
   * Set ammo count for a player
   * @param {Player} player - Target player
   * @param {number} count - New ammo count
   */
  setPlayerAmmo(player, count) {
    try {
      const objective = world.scoreboard.getObjective(OBJECTIVE_NAME);
      if (!objective) {
        this.initialize();
        return this.setPlayerAmmo(player, count);
      }
      
      objective.setScore(player, Math.max(0, Math.floor(count)));
    } catch (error) {
      console.warn('[AmmoSystem] Error setting ammo:', error.message);
    }
  }

  /**
   * Get magazine type from player's inventory
   * @param {Player} player - Target player
   * @returns {string|null} Magazine identifier or null
   */
  getEquippedMagazine(player) {
    try {
      const inv = player.getComponent('minecraft:inventory')?.container;
      if (!inv) return null;
      
      const item = inv.getItem(player.selectedSlotIndex);
      if (!item) return null;
      
      const typeId = item.typeId;
      return Object.values(AMMO_CONFIG).some(m => m.typeId === typeId) 
        ? typeId 
        : null;
    } catch (error) {
      console.warn('[AmmoSystem] Error checking magazine:', error.message);
      return null;
    }
  }

  /**
   * Handle weapon fire event
   * Decrements ammo count and returns whether fire is allowed
   * 
   * @param {Player} player - Firing player
   * @param {string} weaponId - Weapon identifier (for logging)
   * @returns {boolean} True if fire allowed, false if out of ammo
   */
  onWeaponFire(player, weaponId = 'unknown') {
    const currentAmmo = this.getPlayerAmmo(player);
    
    if (currentAmmo > 0) {
      this.setPlayerAmmo(player, currentAmmo - 1);
      // Optional: trigger visual/audio feedback
      this.showAmmoHud(player);
      return true; // Fire allowed
    } else {
      // No ammo - weapon misfire
      player.playSound('note.bass', { volume: 0.5, pitch: 0.5 });
      return false;
    }
  }

  /**
   * Handle reload event
   * Converts magazine item to ammo count
   * 
   * @param {Player} player - Reloading player
   * @param {string} magazineTypeId - Magazine identifier
   * @returns {boolean} True if reload successful
   */
  onReload(player, magazineTypeId) {
    // Find magazine config
    const magConfig = Object.values(AMMO_CONFIG).find(
      m => m.typeId === magazineTypeId
    );
    
    if (!magConfig) {
      console.warn(`[AmmoSystem] Unknown magazine type: ${magazineTypeId}`);
      return false;
    }

    try {
      const inv = player.getComponent('minecraft:inventory')?.container;
      if (!inv) return false;

      // Remove magazine from inventory
      inv.setItem(player.selectedSlotIndex, undefined);
      
      // Set ammo to magazine capacity
      this.setPlayerAmmo(player, magConfig.capacity);
      
      // Trigger reload sound
      player.playSound('item.armor.equip_generic', { volume: 1.0, pitch: 1.2 });
      
      // Display reload message
      player.onScreenDisplay.setActionBar(
        `§6Reloaded! Ammo: ${magConfig.capacity}`
      );
      
      return true;
    } catch (error) {
      console.warn('[AmmoSystem] Reload failed:', error.message);
      return false;
    }
  }

  /**
   * Display HUD showing current ammo count
   * @param {Player} player - Target player
   */
  showAmmoHud(player) {
    const currentAmmo = this.getPlayerAmmo(player);
    const displayText = `§c❙ Ammo: ${currentAmmo}`;
    player.onScreenDisplay.setTitleText(displayText, { fadeInDuration: 0, fadeOutDuration: 2, stayDuration: 2 });
  }

  /**
   * Check if player has equipped a magazine
   * @param {Player} player - Target player
   * @returns {boolean} True if magazine equipped
   */
  hasMagazineEquipped(player) {
    return this.getEquippedMagazine(player) !== null;
  }

  /**
   * Get ammo capacity for current magazine
   * @param {Player} player - Target player
   * @returns {number} Capacity or 0 if no magazine
   */
  getMagazineCapacity(player) {
    const magType = this.getEquippedMagazine(player);
    if (!magType) return 0;
    
    const config = Object.values(AMMO_CONFIG).find(m => m.typeId === magType);
    return config?.capacity || 0;
  }

  /**
   * Reset all ammo for testing/debug
   * @param {Player} player - Target player (null = all players)
   */
  resetAmmo(player = null) {
    try {
      if (player) {
        this.setPlayerAmmo(player, 0);
        console.log(`[AmmoSystem] Reset ammo for ${player.name}`);
      } else {
        world.getAllPlayers().forEach(p => this.setPlayerAmmo(p, 0));
        console.log('[AmmoSystem] Reset ammo for all players');
      }
    } catch (error) {
      console.warn('[AmmoSystem] Reset failed:', error.message);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE & EXPORTS
// ============================================================================

export const ammoSystem = new AmmoSystem();

// ============================================================================
// WORLD INITIALIZATION
// ============================================================================

world.beforeEvents.worldLoad.subscribe(() => {
  console.log('[AmmoSystem] World loading...');
  ammoSystem.initialize();
});

// ============================================================================
// TICK HANDLER (Optional: Update HUD constantly)
// ============================================================================

let tickCounter = 0;
const HUD_UPDATE_INTERVAL = 5; // Update every 5 ticks

system.runInterval(() => {
  tickCounter++;
  
  if (tickCounter % HUD_UPDATE_INTERVAL === 0) {
    try {
      world.getAllPlayers().forEach(player => {
        const ammo = ammoSystem.getPlayerAmmo(player);
        if (ammo > 0) {
          player.onScreenDisplay.setTitle(`§6Ammo: ${ammo}`, 
            { 
              fadeInDuration: 0, 
              fadeOutDuration: 1, 
              stayDuration: 5 
            }
          );
        }
      });
    } catch (error) {
      // Silently ignore tick errors
    }
  }
}, 1);

// ============================================================================
// COMMAND HANDLERS (For testing/debugging)
// ============================================================================

world.afterEvents.chatSend.subscribe((event) => {
  const { sender, message } = event;
  
  if (message.startsWith('!ammo')) {
    const args = message.split(' ');
    
    switch (args[1]) {
      case 'get':
        const current = ammoSystem.getPlayerAmmo(sender);
        sender.sendMessage(`§6Current ammo: ${current}`);
        break;
        
      case 'set':
        if (args[2] !== undefined) {
          const count = parseInt(args[2]);
          ammoSystem.setPlayerAmmo(sender, count);
          sender.sendMessage(`§6Set ammo to ${count}`);
        }
        break;
        
      case 'reset':
        ammoSystem.resetAmmo(sender);
        sender.sendMessage(`§6Ammo reset to 0`);
        break;
        
      case 'reload':
        const magType = ammoSystem.getEquippedMagazine(sender);
        if (magType) {
          ammoSystem.onReload(sender, magType);
          sender.sendMessage(`§6Reloaded!`);
        } else {
          sender.sendMessage(`§cNo magazine equipped`);
        }
        break;
        
      default:
        sender.sendMessage(`§cUsage: !ammo [get|set <count>|reset|reload]`);
    }
  }
});

console.log('[AmmoSystem] Module loaded and ready');
