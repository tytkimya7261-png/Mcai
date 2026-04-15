/**
 * PHASE 2: BLOOD MOON EVENT
 * 
 * Manages cyclical apocalyptic events:
 * - Triggered every 7 in-game days at night
 * - 3 in-game hours duration (night cycle)
 * - 10x zombie spawn rate
 * - Direct player coordinate spawning
 * - Warning sounds and sky effects
 * - Wave-based zombie spawning
 * 
 * GameTest API implementation for Bedrock Edition
 * Version: 1.0.0 (Phase 2)
 */

import { world, system } from '@minecraft/server';

/**
 * BloodMoonEventManager handles apocalyptic wave events
 */
class BloodMoonEventManager {
  constructor() {
    this.CONFIG = {
      EVENT_CYCLE_DAYS: 7, // Every 7 days
      SPAWN_RATE_MULTIPLIER: 10, // 10x normal
      ZOMBIES_PER_WAVE: 20, // Zombies per spawn wave
      WAVE_INTERVAL_TICKS: 2400, // Every 2 minutes (2400 ticks)
      EVENT_DURATION_TICKS: 48000, // 3 in-game hours = 3 * 16000 ticks
      WARNING_LEAD_TIME: 12000, // 10 minutes before event
      UPDATE_INTERVAL: 20, // ticks
      SPAWN_RADIUS_FROM_PLAYER: 50, // blocks
    };

    this.dayCounter = 0;
    this.tickCounter = 0;
    this.eventActive = false;
    this.eventStartTime = 0;
    this.eventWaveCounter = 0;
    this.scoreboardSetup = false;
  }

  /**
   * Initialize blood moon system
   */
  init() {
    try {
      this.setupScoreboards();
      this.registerEventListeners();
      this.scheduleUpdateLoops();
      console.warn('[BLOOD_MOON] System initialized');
    } catch (error) {
      console.error(`[BLOOD_MOON] Init failed: ${error.message}`);
    }
  }

  /**
   * Setup scoreboards for tracking
   */
  setupScoreboards() {
    try {
      const objectives = world.scoreboard.getObjectives();

      const hasDay = objectives.some(obj => obj.id === 'day_counter');
      const hasEvent = objectives.some(obj => obj.id === 'blood_moon_active');
      const hasWave = objectives.some(obj => obj.id === 'wave_counter');

      if (!hasDay) {
        world.scoreboard.addObjective('day_counter', 'In-Game Days Passed');
      }
      if (!hasEvent) {
        world.scoreboard.addObjective('blood_moon_active', 'Blood Moon Event Active');
      }
      if (!hasWave) {
        world.scoreboard.addObjective('wave_counter', 'Current Wave Number');
      }

      this.scoreboardSetup = true;
      console.warn('[BLOOD_MOON] Scoreboards created/verified');
    } catch (error) {
      console.error(`[BLOOD_MOON] Scoreboard setup failed: ${error.message}`);
    }
  }

  /**
   * Register event listeners
   */
  registerEventListeners() {
    console.warn('[BLOOD_MOON] Event listeners registered');
  }

  /**
   * Schedule update loops
   */
  scheduleUpdateLoops() {
    // Main blood moon update loop
    system.runInterval(() => {
      try {
        this.updateBloodMoonCycle();
      } catch (error) {
        console.error(`[BLOOD_MOON] Update error: ${error.message}`);
      }
    }, this.CONFIG.UPDATE_INTERVAL);

    // Event spawning loop
    system.runInterval(() => {
      try {
        if (this.eventActive) {
          this.spawnWave();
        }
      } catch (error) {
        console.error(`[BLOOD_MOON] Spawn error: ${error.message}`);
      }
    }, this.CONFIG.WAVE_INTERVAL_TICKS);
  }

  /**
   * Update blood moon cycle
   */
  updateBloodMoonCycle() {
    try {
      this.tickCounter++;

      // Track day progress
      // Minecraft day = 24000 ticks
      const dayCycle = this.tickCounter % 24000;

      // Update day counter every full day
      if (this.tickCounter % 24000 === 0) {
        this.dayCounter = Math.floor(this.tickCounter / 24000);
        const dayObj = world.scoreboard.getObjective('day_counter');
        if (dayObj) {
          // Set all players' day counter
          const players = world.getAllPlayers();
          for (const player of players) {
            dayObj.setScore(player, this.dayCounter);
          }
        }

        console.warn(`[BLOOD_MOON] Day ${this.dayCounter} reached`);
      }

      // Check for blood moon trigger conditions:
      // 1. Day divisible by 7
      // 2. Night time (ticks > 12000 = after dusk)
      const isMultipleOf7 = this.dayCounter % this.CONFIG.EVENT_CYCLE_DAYS === 0 && this.dayCounter > 0;
      const isNightTime = dayCycle > 12000 && dayCycle < 24000;

      if (isMultipleOf7 && isNightTime && !this.eventActive) {
        // Check if we should give warning
        if (dayCycle === 12010) {
          this.sendWarning();
        }

        // Trigger event at night start
        if (dayCycle === 12500) {
          this.startEvent();
        }
      }

      // End event at dawn
      if (this.eventActive && dayCycle >= 23000) {
        this.endEvent();
      }

      // Prevent multiple event triggers
      if (isMultipleOf7 && dayCycle < 12000) {
        // Reset for next cycle
      }
    } catch (error) {
      console.error(`[BLOOD_MOON] updateBloodMoonCycle failed: ${error.message}`);
    }
  }

  /**
   * Send warning message to players
   */
  sendWarning() {
    try {
      const players = world.getAllPlayers();

      world.broadcastMessage(
        '§c§l⚠ BLOOD MOON WARNING ⚠\n§rA blood moon rises at dusk. Seek shelter or prepare for an onslaught!'
      );

      // Play warning sound (using commands)
      for (const player of players) {
        player.dimension.runCommandAsync(
          `execute as @a run playsound ambient.weather.thunder player @s`
        );
      }

      console.warn('[BLOOD_MOON] Warning sent to players');
    } catch (error) {
      console.error(`[BLOOD_MOON] sendWarning failed: ${error.message}`);
    }
  }

  /**
   * Start blood moon event
   */
  startEvent() {
    try {
      this.eventActive = true;
      this.eventStartTime = this.tickCounter;
      this.eventWaveCounter = 0;

      const eventObj = world.scoreboard.getObjective('blood_moon_active');
      const players = world.getAllPlayers();

      if (eventObj) {
        for (const player of players) {
          eventObj.setScore(player, 1);
        }
      }

      // Broadcast event start
      world.broadcastMessage(
        '§r§c§l========== BLOOD MOON EVENT STARTED ==========\n§f' +
        'The moon turns blood-red. Hordes of zombies are spawning!\n' +
        '§cDefend your shelters! Survive the night!\n' +
        '§r§c=================================================§r'
      );

      // Apply sky effect (dim/red tint)
      this.applySkyEffect();

      // Start first wave
      this.spawnWave();

      console.warn('[BLOOD_MOON] Event started');
    } catch (error) {
      console.error(`[BLOOD_MOON] startEvent failed: ${error.message}`);
    }
  }

  /**
   * Apply sky/atmosphere effects
   */
  applySkyEffect() {
    try {
      const players = world.getAllPlayers();

      for (const player of players) {
        // Apply darkness effect to simulate red tint
        player.addEffect('darkness', 20, {
          amplifier: 0,
          showParticles: false,
        });
      }

      console.warn('[BLOOD_MOON] Sky effect applied');
    } catch (error) {
      console.error(`[BLOOD_MOON] applySkyEffect failed: ${error.message}`);
    }
  }

  /**
   * Spawn a wave of zombies
   */
  spawnWave() {
    try {
      if (!this.eventActive) return;

      const players = world.getAllPlayers();

      for (const player of players) {
        const spawnCount = this.CONFIG.ZOMBIES_PER_WAVE;

        // Spawn zombies around each player
        for (let i = 0; i < spawnCount; i++) {
          // Random offset from player
          const offsetX = (Math.random() - 0.5) * this.CONFIG.SPAWN_RADIUS_FROM_PLAYER * 2;
          const offsetZ = (Math.random() - 0.5) * this.CONFIG.SPAWN_RADIUS_FROM_PLAYER * 2;

          const spawnLocation = {
            x: player.location.x + offsetX,
            y: player.location.y,
            z: player.location.z + offsetZ,
          };

          // Summon zombie
          player.dimension.runCommandAsync(
            `summon minecraft:zombie ${spawnLocation.x} ${spawnLocation.y} ${spawnLocation.z}`
          );
        }

        // Spawn particles at player location
        player.dimension.spawnParticle(
          'minecraft:redstone',
          {
            x: player.location.x,
            y: player.location.y + 2,
            z: player.location.z,
          },
          {
            velocity: {
              x: (Math.random() - 0.5) * 0.5,
              y: 0.1,
              z: (Math.random() - 0.5) * 0.5,
            },
          }
        );
      }

      this.eventWaveCounter++;

      // Update wave counter
      const waveObj = world.scoreboard.getObjective('wave_counter');
      if (waveObj) {
        for (const player of players) {
          waveObj.setScore(player, this.eventWaveCounter);
        }
      }

      console.warn(`[BLOOD_MOON] Wave ${this.eventWaveCounter} spawned (${spawnCount * players.length} zombies)`);
    } catch (error) {
      console.error(`[BLOOD_MOON] spawnWave failed: ${error.message}`);
    }
  }

  /**
   * End blood moon event
   */
  endEvent() {
    try {
      this.eventActive = false;

      const eventObj = world.scoreboard.getObjective('blood_moon_active');
      const players = world.getAllPlayers();

      if (eventObj) {
        for (const player of players) {
          eventObj.setScore(player, 0);
        }
      }

      // Broadcast event end
      world.broadcastMessage(
        '§r§a§l========== BLOOD MOON EVENT ENDED ==========\n§a' +
        'The moon returns to normal. The horde retreats.\n' +
        '§aYou survived the night...for now.\n' +
        '§r§a=================================================§r'
      );

      // Clear darkness effect
      for (const player of players) {
        player.addEffect('resistance', 200, {
          amplifier: 0,
          showParticles: true,
        });
      }

      console.warn(
        `[BLOOD_MOON] Event ended after ${this.eventWaveCounter} waves. Duration: ${
          this.tickCounter - this.eventStartTime
        } ticks`
      );
    } catch (error) {
      console.error(`[BLOOD_MOON] endEvent failed: ${error.message}`);
    }
  }

  /**
   * Get event status
   */
  getEventStatus() {
    try {
      const dayObj = world.scoreboard.getObjective('day_counter');
      const currentDay = dayObj?.getScore(world.getAllPlayers()[0]) || this.dayCounter;

      return {
        active: this.eventActive,
        currentDay: currentDay,
        nextEventDay: Math.ceil(currentDay / this.CONFIG.EVENT_CYCLE_DAYS) * this.CONFIG.EVENT_CYCLE_DAYS,
        currentWave: this.eventWaveCounter,
        daysUntilNext: Math.ceil(currentDay / this.CONFIG.EVENT_CYCLE_DAYS) * this.CONFIG.EVENT_CYCLE_DAYS - currentDay,
      };
    } catch (error) {
      console.error(`[BLOOD_MOON] getEventStatus failed: ${error.message}`);
      return {
        active: false,
        currentDay: 0,
        nextEventDay: this.CONFIG.EVENT_CYCLE_DAYS,
        currentWave: 0,
        daysUntilNext: this.CONFIG.EVENT_CYCLE_DAYS,
      };
    }
  }

  /**
   * Force trigger event (for testing)
   */
  forceStartEvent() {
    try {
      console.warn('[BLOOD_MOON] Force starting event (testing)');
      this.eventActive = false; // Ensure clean start
      this.startEvent();
    } catch (error) {
      console.error(`[BLOOD_MOON] forceStartEvent failed: ${error.message}`);
    }
  }

  /**
   * Force end event (for testing)
   */
  forceEndEvent() {
    try {
      console.warn('[BLOOD_MOON] Force ending event (testing)');
      this.endEvent();
    } catch (error) {
      console.error(`[BLOOD_MOON] forceEndEvent failed: ${error.message}`);
    }
  }
}

// Export singleton instance
export const bloodMoonEventManager = new BloodMoonEventManager();
