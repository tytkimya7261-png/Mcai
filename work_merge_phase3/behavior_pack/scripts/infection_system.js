/**
 * PHASE 2: INFECTION SYSTEM
 * 
 * Manages player infection mechanics:
 * - 1-hour (3600 tick) infection timer
 * - Visual effects (red tint, particles)
 * - Antidote cure mechanism
 * - Transformation to zombie on uncured death
 * 
 * GameTest API implementation for Bedrock Edition
 * Version: 1.0.0 (Phase 2)
 */

import { world, system, EntityTypes, ItemStack } from '@minecraft/server';

/**
 * InfectionManager handles all infection-related mechanics
 */
class InfectionManager {
  constructor() {
    this.CONFIG = {
      INFECTION_DURATION: 3600, // 1 hour in game ticks (50ms per tick)
      UPDATE_INTERVAL: 1, // Update every tick
      PARTICLE_EMIT_INTERVAL: 10, // Emit particles every 10 ticks
      EFFECT_STRENGTH: 1,
      PARTICLE_SPAWN_RADIUS: 0.5,
    };

    this.infectedPlayers = new Map(); // Map<player UUID, { timer, isInfected }>
    this.scoreboardSetup = false;
  }

  /**
   * Initialize infection system
   * Called once on addon load
   */
  init() {
    try {
      this.setupScoreboards();
      this.registerEventListeners();
      this.scheduleTickLoop();
      console.warn('[INFECTION] System initialized');
    } catch (error) {
      console.error(`[INFECTION] Init failed: ${error.message}`);
    }
  }

  /**
   * Setup scoreboards for tracking infection
   */
  setupScoreboards() {
    try {
      const objectives = world.scoreboard.getObjectives();
      
      // Check if objectives already exist
      const hasInfection = objectives.some(obj => obj.id === 'infection_timer');
      const hasStatus = objectives.some(obj => obj.id === 'infection_status');

      if (!hasInfection) {
        world.scoreboard.addObjective('infection_timer', 'Infection Timer (ticks)');
      }
      if (!hasStatus) {
        world.scoreboard.addObjective('infection_status', 'Infection Status (1=infected)');
      }

      this.scoreboardSetup = true;
      console.warn('[INFECTION] Scoreboards created/verified');
    } catch (error) {
      console.error(`[INFECTION] Scoreboard setup failed: ${error.message}`);
    }
  }

  /**
   * Register event listeners for infection triggers
   */
  registerEventListeners() {
    // Listen for damage events (zombie bite)
    world.beforeEvents.entityHurt.subscribe((event) => {
      this.onEntityDamaged(event);
    });

    // Listen for item use (antidote)
    world.beforeEvents.itemUse.subscribe((event) => {
      this.onItemUse(event);
    });

    console.warn('[INFECTION] Event listeners registered');
  }

  /**
   * Handle entity damage - check for zombie bites
   */
  onEntityDamaged(event) {
    try {
      const { damageSource, entity } = event;
      
      // Only process player damage
      if (entity.typeId !== 'minecraft:player') return;

      const player = entity;
      const source = damageSource.damagingEntity;

      // Check if damage from zombie
      if (source && this.isZombie(source.typeId)) {
        // Chance to infect (50% per bite)
        if (Math.random() < 0.5) {
          this.infectPlayer(player);
        }
      }
    } catch (error) {
      console.error(`[INFECTION] Damage handler error: ${error.message}`);
    }
  }

  /**
   * Check if entity type is a zombie
   */
  isZombie(typeId) {
    return typeId.includes('zombie');
  }

  /**
   * Infect a player
   */
  infectPlayer(player) {
    try {
      const objective = world.scoreboard.getObjective('infection_timer');
      if (!objective) {
        console.error('[INFECTION] infection_timer objective not found');
        return;
      }

      // Set infection timer to 3600 ticks (1 hour)
      objective.setScore(player, this.CONFIG.INFECTION_DURATION);

      // Mark as infected
      const statusObj = world.scoreboard.getObjective('infection_status');
      if (statusObj) {
        statusObj.setScore(player, 1);
      }

      this.infectedPlayers.set(player.id, {
        timer: this.CONFIG.INFECTION_DURATION,
        isInfected: true,
      });

      console.warn(`[INFECTION] Player ${player.name} infected`);
      this.sendActionbarMessage(player, '§c⚠ YOU ARE INFECTED! Find an antidote!');
    } catch (error) {
      console.error(`[INFECTION] infectPlayer failed: ${error.message}`);
    }
  }

  /**
   * Handle item use (antidote consumption)
   */
  onItemUse(event) {
    try {
      const { itemStack, source } = event;
      
      if (itemStack.typeId === 'mypack:antidote') {
        const player = source;
        this.curePlayer(player);
        event.cancel = true; // Prevent default behavior
      }
    } catch (error) {
      console.error(`[INFECTION] Item use handler error: ${error.message}`);
    }
  }

  /**
   * Cure a player of infection
   */
  curePlayer(player) {
    try {
      const objective = world.scoreboard.getObjective('infection_timer');
      const statusObj = world.scoreboard.getObjective('infection_status');

      if (objective) {
        objective.setScore(player, 0);
      }
      if (statusObj) {
        statusObj.setScore(player, 0);
      }

      this.infectedPlayers.delete(player.id);

      console.warn(`[INFECTION] Player ${player.name} cured`);
      this.sendActionbarMessage(player, '§a✓ Infection cured! You are healthy.', 100);

      // Remove antidote from inventory
      const inventory = player.getComponent('inventory').container;
      for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item && item.typeId === 'mypack:antidote') {
          inventory.setItem(i, undefined);
          break;
        }
      }
    } catch (error) {
      console.error(`[INFECTION] curePlayer failed: ${error.message}`);
    }
  }

  /**
   * Schedule main tick loop for infection updates
   */
  scheduleTickLoop() {
    system.runInterval(() => {
      try {
        this.updateInfections();
      } catch (error) {
        console.error(`[INFECTION] Tick loop error: ${error.message}`);
      }
    }, this.CONFIG.UPDATE_INTERVAL);
  }

  /**
   * Update all active infections
   */
  updateInfections() {
    try {
      const players = world.getAllPlayers();
      const infectionObj = world.scoreboard.getObjective('infection_timer');
      const statusObj = world.scoreboard.getObjective('infection_status');

      if (!infectionObj || !statusObj) return;

      for (const player of players) {
        const currentTimer = infectionObj.getScore(player) || 0;

        if (currentTimer > 0) {
          // Decrement timer
          const newTimer = currentTimer - 1;
          infectionObj.setScore(player, newTimer);

          // Apply visual effects
          this.applyInfectionEffects(player);

          // Check if infection reaches 0
          if (newTimer === 0) {
            this.handleInfectionExpire(player);
          }
        } else {
          // Ensure not marked as infected
          statusObj.setScore(player, 0);
        }
      }
    } catch (error) {
      console.error(`[INFECTION] updateInfections failed: ${error.message}`);
    }
  }

  /**
   * Apply visual effects to infected player
   */
  applyInfectionEffects(player) {
    try {
      // Apply status effects
      player.addEffect('slowness', 60, {
        amplifier: 1,
        showParticles: true,
      });

      // Red tint effect (using blindness as visual indicator)
      const infectionObj = world.scoreboard.getObjective('infection_timer');
      const timer = infectionObj.getScore(player) || 0;

      // Stronger effects as timer runs low
      if (timer < 1800) {
        // Final 30 minutes - nausea effect
        player.addEffect('nausea', 60, {
          amplifier: 0,
          showParticles: false,
        });
      }

      if (timer < 600) {
        // Final 10 minutes - weakness
        player.addEffect('weakness', 60, {
          amplifier: 1,
          showParticles: true,
        });
      }

      // Emit red particles periodically
      if (Math.random() < 0.3) {
        player.dimension.spawnParticle(
          'minecraft:redstone',
          {
            x: player.location.x + (Math.random() - 0.5) * 0.5,
            y: player.location.y + 1,
            z: player.location.z + (Math.random() - 0.5) * 0.5,
          },
          {
            velocity: {
              x: (Math.random() - 0.5) * 0.1,
              y: Math.random() * 0.1,
              z: (Math.random() - 0.5) * 0.1,
            },
          }
        );
      }
    } catch (error) {
      console.error(`[INFECTION] applyInfectionEffects failed: ${error.message}`);
    }
  }

  /**
   * Handle infection timer expiration (0 ticks reached)
   */
  handleInfectionExpire(player) {
    try {
      const health = player.getComponent('health');
      const currentHealth = health?.currentValue || 20;

      console.warn(`[INFECTION] Infection expired for ${player.name} (health: ${currentHealth})`);

      // If player is dead/dying, transform to zombie
      if (currentHealth <= 0) {
        this.transformToZombie(player);
      } else {
        // Player survives but remains scarred
        this.sendActionbarMessage(
          player,
          '§c⚠ Infection has gained control... you are dying!'
        );
        
        // Force death
        player.kill();
      }
    } catch (error) {
      console.error(`[INFECTION] handleInfectionExpire failed: ${error.message}`);
    }
  }

  /**
   * Transform a dead infected player into a zombie
   */
  transformToZombie(player) {
    try {
      const location = player.location;
      const dimension = player.dimension;

      console.warn(`[INFECTION] Transforming ${player.name} to zombie at ${JSON.stringify(location)}`);

      // Summon zombie at player location
      dimension.runCommandAsync(`summon minecraft:zombie ${location.x} ${location.y} ${location.z}`);

      // Message to other players
      world.broadcastMessage(`§c${player.name} has been transformed into a zombie!`);
    } catch (error) {
      console.error(`[INFECTION] transformToZombie failed: ${error.message}`);
    }
  }

  /**
   * Send actionbar message to player
   */
  sendActionbarMessage(player, message, duration = 60) {
    try {
      player.onScreenDisplay.setActionBar(message);
    } catch (error) {
      console.error(`[INFECTION] sendActionbarMessage failed: ${error.message}`);
    }
  }

  /**
   * Get infection status for a player
   */
  getInfectionStatus(player) {
    try {
      const obj = world.scoreboard.getObjective('infection_timer');
      const timeRemaining = obj?.getScore(player) || 0;
      return {
        isInfected: timeRemaining > 0,
        ticksRemaining: timeRemaining,
        minutesRemaining: Math.ceil(timeRemaining / 1200), // 1200 ticks = 1 minute
      };
    } catch (error) {
      console.error(`[INFECTION] getInfectionStatus failed: ${error.message}`);
      return { isInfected: false, ticksRemaining: 0, minutesRemaining: 0 };
    }
  }
}

// Export singleton instance
export const infectionSystem = new InfectionManager();
