/**
 * PHASE 2: MASTER INITIALIZATION
 * 
 * Imports and initializes all 4 advanced zombie AI systems:
 * 1. Infection System (1-hour timer)
 * 2. Blood Tracking AI (32-block detection)
 * 3. Horde/Sürü Clustering (group formation)
 * 4. Blood Moon Event (cyclical apocalypse)
 * 
 * Main entry point for GameTest API scripts
 * Version: 1.0.0 (Phase 2)
 */

import { infectionSystem } from './infection_system';
import { bloodTrackingManager } from './blood_tracking';
import { hordeAIManager } from './horde_ai';
import { bloodMoonEventManager } from './blood_moon_event';

/**
 * Phase 2 System Manager
 * Orchestrates all advanced zombie mechanics
 */
class Phase2SystemManager {
  constructor() {
    this.systems = {
      infection: infectionSystem,
      bloodTracking: bloodTrackingManager,
      hordeAI: hordeAIManager,
      bloodMoon: bloodMoonEventManager,
    };
    this.initialized = false;
  }

  /**
   * Initialize all Phase 2 systems
   * Called once on addon load
   */
  initializeAll() {
    console.warn('=== PHASE 2 SYSTEM INITIALIZATION ===');
    console.warn('Starting Post-Apocalyptic Survival ULTIMATE v5.0.0-Phase2');
    console.warn('Advanced Zombie AI Systems');
    console.warn('=====================================');

    try {
      // Initialize infection system
      console.warn('[PHASE2] Initializing Infection System...');
      this.systems.infection.init();
      console.warn('[PHASE2] ✓ Infection System ready');

      // Initialize blood tracking
      console.warn('[PHASE2] Initializing Blood Tracking AI...');
      this.systems.bloodTracking.init();
      console.warn('[PHASE2] ✓ Blood Tracking AI ready');

      // Initialize horde AI
      console.warn('[PHASE2] Initializing Horde/Sürü AI...');
      this.systems.hordeAI.init();
      console.warn('[PHASE2] ✓ Horde AI ready');

      // Initialize blood moon
      console.warn('[PHASE2] Initializing Blood Moon Event System...');
      this.systems.bloodMoon.init();
      console.warn('[PHASE2] ✓ Blood Moon Event System ready');

      this.initialized = true;

      console.warn('=====================================');
      console.warn('[PHASE2] ✅ ALL SYSTEMS INITIALIZED');
      console.warn('=====================================');
    } catch (error) {
      console.error(`[PHASE2] Initialization failed: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
    }
  }

  /**
   * Get system status report
   */
  getStatusReport() {
    try {
      return {
        phase: '2.0.0',
        initialized: this.initialized,
        systems: {
          infection: {
            active: true,
            objective: 'Track and manage player infections',
          },
          bloodTracking: {
            active: true,
            objective: 'Enable zombie detection of wounded players',
          },
          hordeAI: {
            active: true,
            objective: 'Coordinate zombie group attacks',
          },
          bloodMoon: {
            active: true,
            objective: 'Trigger cyclical apocalyptic events',
          },
        },
        totalSystems: 4,
        readyToPlay: this.initialized,
      };
    } catch (error) {
      console.error(`[PHASE2] getStatusReport failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Get detailed system information
   */
  getDetailedInfo() {
    return {
      phase: 'Phase 2: Infection & AI Systems',
      version: '5.0.0-Phase2',
      baseAddon: 'PostApocalypticSurvival_ULTIMATE_v5.0.0-Phase1.mcaddon',
      systems: [
        {
          id: 'infection',
          name: 'Infection System',
          duration: '1 hour (3600 ticks)',
          features: [
            'Zombie bite infection trigger',
            'Visual effects (slowness, nausea, weakness)',
            'Antidote cure mechanic',
            'Player transformation to zombie on death',
          ],
        },
        {
          id: 'bloodTracking',
          name: 'Blood Tracking AI',
          range: '32 blocks',
          features: [
            'Wounded player detection (< 4 hearts)',
            'Blood particle emission',
            'Automatic zombie targeting',
            '10% speed bonus while tracking',
          ],
        },
        {
          id: 'hordeAI',
          name: 'Horde/Sürü Clustering',
          maxSize: '12 zombies per cluster',
          features: [
            '16-block alert radius',
            'Coordinated group movement',
            '30% movement speed bonus',
            'Faster attack cooldown',
          ],
        },
        {
          id: 'bloodMoon',
          name: 'Blood Moon Event',
          trigger: 'Every 7 days at night',
          features: [
            '10x zombie spawn rate',
            'Wave-based spawning (20 per wave)',
            'Sky/atmosphere effects',
            'Warning system',
            'Auto-cleanup at dawn',
          ],
        },
      ],
    };
  }
}

// Create singleton instance
const phase2Manager = new Phase2SystemManager();

// Initialize on addon load
if (typeof globalThis !== 'undefined') {
  globalThis.phase2Manager = phase2Manager;

  // Auto-initialize on first opportunity
  import { world } from '@minecraft/server';

  world.afterEvents.worldInitialize.subscribe(() => {
    phase2Manager.initializeAll();
  });
}

export { phase2Manager };
