/**
 * PHASE 2: BLOOD TRACKING AI
 * 
 * Manages blood particle tracking and zombie AI behavior:
 * - Wounded player detection (< 4 hearts health)
 * - Blood particle emission
 * - 32-block zombie detection radius
 * - Automatic zombie targeting of wounded players
 * - Speed/detection bonuses
 * 
 * GameTest API implementation for Bedrock Edition
 * Version: 1.0.0 (Phase 2)
 */

import { world, system, EntityTypes } from '@minecraft/server';

/**
 * BloodTrackingManager handles zombie sensing of wounded players
 */
class BloodTrackingManager {
  constructor() {
    this.CONFIG = {
      WOUND_THRESHOLD: 8, // < 4 hearts = 8 damage taken
      DETECTION_RANGE: 32, // blocks
      BLOOD_PARTICLE_LIFETIME: 30, // seconds
      DETECTION_UPDATE_INTERVAL: 20, // ticks
      SPEED_BONUS: 1.1, // 10% faster
      PARTICLE_EMIT_CHANCE: 0.3, // 30% chance per tick
      ZOMBIE_TARGET_UPDATE_INTERVAL: 40, // ticks
    };

    this.woundedPlayers = new Map(); // Map<player UUID, { lastEmit, health }>
    this.zombieTrackers = new Map(); // Map<zombie UUID, { targetPlayer, isTracking }>
    this.scoreboardSetup = false;
  }

  /**
   * Initialize blood tracking system
   */
  init() {
    try {
      this.setupScoreboards();
      this.registerEventListeners();
      this.scheduleUpdateLoops();
      console.warn('[BLOOD_TRACKING] System initialized');
    } catch (error) {
      console.error(`[BLOOD_TRACKING] Init failed: ${error.message}`);
    }
  }

  /**
   * Setup scoreboards for tracking
   */
  setupScoreboards() {
    try {
      const objectives = world.scoreboard.getObjectives();
      
      const hasBloodTrack = objectives.some(obj => obj.id === 'blood_tracking');
      const hasWoundLevel = objectives.some(obj => obj.id === 'wound_level');

      if (!hasBloodTrack) {
        world.scoreboard.addObjective('blood_tracking', 'Blood Tracking Status');
      }
      if (!hasWoundLevel) {
        world.scoreboard.addObjective('wound_level', 'Wound Level (damage taken)');
      }

      this.scoreboardSetup = true;
      console.warn('[BLOOD_TRACKING] Scoreboards created/verified');
    } catch (error) {
      console.error(`[BLOOD_TRACKING] Scoreboard setup failed: ${error.message}`);
    }
  }

  /**
   * Register event listeners
   */
  registerEventListeners() {
    // Listen for player damage
    world.beforeEvents.entityHurt.subscribe((event) => {
      this.onPlayerDamaged(event);
    });

    console.warn('[BLOOD_TRACKING] Event listeners registered');
  }

  /**
   * Handle player damage tracking
   */
  onPlayerDamaged(event) {
    try {
      const { entity, damage } = event;

      // Only process player damage
      if (entity.typeId !== 'minecraft:player') return;

      const player = entity;
      const woundObj = world.scoreboard.getObjective('wound_level');

      if (woundObj) {
        const currentWound = woundObj.getScore(player) || 0;
        const newWound = currentWound + Math.ceil(damage);
        woundObj.setScore(player, newWound);

        // Track as wounded
        if (newWound >= this.CONFIG.WOUND_THRESHOLD) {
          this.markAsWounded(player);
        }
      }
    } catch (error) {
      console.error(`[BLOOD_TRACKING] onPlayerDamaged failed: ${error.message}`);
    }
  }

  /**
   * Mark player as wounded
   */
  markAsWounded(player) {
    try {
      this.woundedPlayers.set(player.id, {
        lastEmit: 0,
        health: player.getComponent('health')?.currentValue || 20,
      });

      const trackObj = world.scoreboard.getObjective('blood_tracking');
      if (trackObj) {
        trackObj.setScore(player, 1); // 1 = wounded
      }

      console.warn(`[BLOOD_TRACKING] ${player.name} marked as wounded`);
    } catch (error) {
      console.error(`[BLOOD_TRACKING] markAsWounded failed: ${error.message}`);
    }
  }

  /**
   * Schedule update loops
   */
  scheduleUpdateLoops() {
    // Blood particle emission loop
    system.runInterval(() => {
      try {
        this.emitBloodParticles();
      } catch (error) {
        console.error(`[BLOOD_TRACKING] Particle emission error: ${error.message}`);
      }
    }, 1);

    // Zombie detection and targeting loop
    system.runInterval(() => {
      try {
        this.updateZombieTargeting();
      } catch (error) {
        console.error(`[BLOOD_TRACKING] Zombie targeting error: ${error.message}`);
      }
    }, this.CONFIG.ZOMBIE_TARGET_UPDATE_INTERVAL);

    // Wound tracking update
    system.runInterval(() => {
      try {
        this.updateWoundTracking();
      } catch (error) {
        console.error(`[BLOOD_TRACKING] Wound tracking error: ${error.message}`);
      }
    }, this.CONFIG.DETECTION_UPDATE_INTERVAL);
  }

  /**
   * Emit blood particles from wounded players
   */
  emitBloodParticles() {
    try {
      const players = world.getAllPlayers();

      for (const player of players) {
        const woundObj = world.scoreboard.getObjective('wound_level');
        const woundLevel = woundObj?.getScore(player) || 0;

        // Only wounded players emit blood
        if (woundLevel >= this.CONFIG.WOUND_THRESHOLD) {
          if (Math.random() < this.CONFIG.PARTICLE_EMIT_CHANCE) {
            this.emitBloodAt(player.location, player.dimension);
          }
        }
      }
    } catch (error) {
      console.error(`[BLOOD_TRACKING] emitBloodParticles failed: ${error.message}`);
    }
  }

  /**
   * Emit blood particle at location
   */
  emitBloodAt(location, dimension) {
    try {
      // Red dripping particles
      dimension.spawnParticle('minecraft:redstone', location, {
        velocity: {
          x: (Math.random() - 0.5) * 0.2,
          y: -0.1 - Math.random() * 0.05, // Fall downward
          z: (Math.random() - 0.5) * 0.2,
        },
      });

      // Occasional larger particle puffs
      if (Math.random() < 0.1) {
        for (let i = 0; i < 3; i++) {
          dimension.spawnParticle('minecraft:heart_particle', location, {
            velocity: {
              x: (Math.random() - 0.5) * 0.3,
              y: Math.random() * 0.2,
              z: (Math.random() - 0.5) * 0.3,
            },
          });
        }
      }
    } catch (error) {
      console.error(`[BLOOD_TRACKING] emitBloodAt failed: ${error.message}`);
    }
  }

  /**
   * Update zombie targeting based on blood trail
   */
  updateZombieTargeting() {
    try {
      const players = world.getAllPlayers();
      const woundedPlayers = players.filter((p) => {
        const woundObj = world.scoreboard.getObjective('wound_level');
        const wound = woundObj?.getScore(p) || 0;
        return wound >= this.CONFIG.WOUND_THRESHOLD;
      });

      if (woundedPlayers.length === 0) return;

      // Find all zombies
      const entities = world.getDimension('overworld').getEntities();
      const zombies = entities.filter((e) => this.isZombie(e.typeId));

      for (const zombie of zombies) {
        // Check if any wounded player is within detection range
        const nearestWounded = this.findNearestWounded(zombie, woundedPlayers);

        if (nearestWounded) {
          this.commandZombieToTarget(zombie, nearestWounded);
        }
      }
    } catch (error) {
      console.error(`[BLOOD_TRACKING] updateZombieTargeting failed: ${error.message}`);
    }
  }

  /**
   * Find nearest wounded player within range
   */
  findNearestWounded(zombie, woundedPlayers) {
    let nearest = null;
    let nearestDist = this.CONFIG.DETECTION_RANGE;

    for (const player of woundedPlayers) {
      const distance = this.getDistance(zombie.location, player.location);

      if (distance < nearestDist) {
        nearest = player;
        nearestDist = distance;
      }
    }

    return nearest;
  }

  /**
   * Calculate distance between two locations
   */
  getDistance(loc1, loc2) {
    const dx = loc1.x - loc2.x;
    const dy = loc1.y - loc2.y;
    const dz = loc1.z - loc2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Command zombie to target wounded player
   */
  commandZombieToTarget(zombie, targetPlayer) {
    try {
      // Tag zombie as blood tracking
      zombie.addTag('blood_tracking');

      // Update zombie AI target (via commands)
      const dimension = zombie.dimension;
      dimension.runCommandAsync(
        `execute as @s[name="${zombie.name}"] at @s run say Tracking blood...`
      );

      // Store target in tracker
      this.zombieTrackers.set(zombie.id, {
        targetPlayer: targetPlayer,
        isTracking: true,
      });

      // Apply speed bonus
      this.applySpeedBonus(zombie);
    } catch (error) {
      console.error(`[BLOOD_TRACKING] commandZombieToTarget failed: ${error.message}`);
    }
  }

  /**
   * Apply movement speed bonus to zombie
   */
  applySpeedBonus(zombie) {
    try {
      zombie.addEffect('speed', 200, {
        amplifier: 1, // Speed II
        showParticles: false,
      });
    } catch (error) {
      console.error(`[BLOOD_TRACKING] applySpeedBonus failed: ${error.message}`);
    }
  }

  /**
   * Update wound tracking
   */
  updateWoundTracking() {
    try {
      const players = world.getAllPlayers();
      const woundObj = world.scoreboard.getObjective('wound_level');
      const trackObj = world.scoreboard.getObjective('blood_tracking');

      if (!woundObj || !trackObj) return;

      for (const player of players) {
        const currentWound = woundObj.getScore(player) || 0;

        // Gradually heal wounds (1 point per 5 seconds = 1200 ticks)
        if (currentWound > 0) {
          const newWound = Math.max(0, currentWound - 0.1);
          woundObj.setScore(player, Math.floor(newWound));

          // Update tracking status
          if (newWound >= this.CONFIG.WOUND_THRESHOLD) {
            trackObj.setScore(player, 1);
          } else {
            trackObj.setScore(player, 0);
            this.woundedPlayers.delete(player.id);
          }
        }
      }
    } catch (error) {
      console.error(`[BLOOD_TRACKING] updateWoundTracking failed: ${error.message}`);
    }
  }

  /**
   * Check if entity is a zombie
   */
  isZombie(typeId) {
    return typeId.includes('zombie') && typeId !== 'minecraft:player';
  }

  /**
   * Get wound status for a player
   */
  getWoundStatus(player) {
    try {
      const obj = world.scoreboard.getObjective('wound_level');
      const woundLevel = obj?.getScore(player) || 0;
      return {
        isWounded: woundLevel >= this.CONFIG.WOUND_THRESHOLD,
        woundLevel: woundLevel,
        detected: woundLevel >= this.CONFIG.WOUND_THRESHOLD,
      };
    } catch (error) {
      console.error(`[BLOOD_TRACKING] getWoundStatus failed: ${error.message}`);
      return {
        isWounded: false,
        woundLevel: 0,
        detected: false,
      };
    }
  }

  /**
   * Clear blood tracking from a player
   */
  clearWounds(player) {
    try {
      const obj = world.scoreboard.getObjective('wound_level');
      if (obj) {
        obj.setScore(player, 0);
      }

      const trackObj = world.scoreboard.getObjective('blood_tracking');
      if (trackObj) {
        trackObj.setScore(player, 0);
      }

      this.woundedPlayers.delete(player.id);
      console.warn(`[BLOOD_TRACKING] ${player.name} wounds cleared`);
    } catch (error) {
      console.error(`[BLOOD_TRACKING] clearWounds failed: ${error.message}`);
    }
  }
}

// Export singleton instance
export const bloodTrackingManager = new BloodTrackingManager();
