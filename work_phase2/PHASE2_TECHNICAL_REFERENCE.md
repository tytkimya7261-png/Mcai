# PHASE 2 TECHNICAL REFERENCE & QUICK START GUIDE

---

## QUICK START

### Installation (3 Steps)

**Step 1: Execute Merge Script**
```bash
cd /workspaces/Mcai
python3 work_phase2/merge_phase2.py
```

**Step 2: Copy Final Addon**
```bash
cp PostApocalypticSurvival_ULTIMATE_v5.0.0-Phase2.mcaddon 
   ~/.minecraft/behavior_packs/
```

**Step 3: Enable in World**
- Create new world
- Add behavior pack + resource pack
- Start world and play

---

## SYSTEM ARCHITECTURE

### System Initialization Flow
```
World Starts
    ↓
phase2_master.js loads
    ↓
All 4 managers initialize:
    ├─ infectionSystem.init()
    ├─ bloodTrackingManager.init()
    ├─ hordeAIManager.init()
    └─ bloodMoonEventManager.init()
    ↓
Scoreboards created
Event listeners registered
Update loops scheduled
    ↓
Systems ACTIVE
```

### Scoreboard Hierarchy
```
INFECTION SYSTEM
├─ infection_timer (0-3600 ticks)
└─ infection_status (0=healthy, 1=infected)

BLOOD TRACKING
├─ wound_level (0-unlimited, heals)
└─ blood_tracking (0=healthy, 1=wounded)

HORDE AI
├─ horde_id (unique cluster ID)
├─ horde_size (1-12 zombies)
└─ horde_active (0=solo, 1=in_horde)

BLOOD MOON
├─ day_counter (0, 1, 2, ...)
├─ blood_moon_active (0=inactive, 1=event)
└─ wave_counter (wave number during event)
```

---

## DETAILED SYSTEM REFERENCE

### 1. INFECTION SYSTEM

**Purpose:** Add zombie bite consequence to survival gameplay

**Configuration Constants:**
```javascript
CONFIG = {
  INFECTION_DURATION: 3600,      // 1 hour in ticks
  UPDATE_INTERVAL: 1,             // Update every tick
  PARTICLE_EMIT_INTERVAL: 10,     // Every 10 ticks
  EFFECT_STRENGTH: 1,             // Effect amplifier
  PARTICLE_SPAWN_RADIUS: 0.5      // Radius in blocks
}
```

**Infection Timeline:**
```
Minute   | Effect                    | Status
0-60     | Slowness II               | ⚠ INFECTED
30-60    | + Nausea                  | ⚠⚠ CRITICAL
10-60    | + Weakness                | ⚠⚠⚠ DYING
0        | Timer expires             | ☠ TRANSFORM or DIE
```

**Key Methods:**
```javascript
infectPlayer(player)           // Apply infection
curePlayer(player)             // Remove infection with antidote
applyInfectionEffects(player)  // Apply visual effects
handleInfectionExpire(player)  // Timer reached 0
transformToZombie(player)      // Summon zombie copy
getInfectionStatus(player)     // Query status
```

**Error Handling:**
- Try-catch on all public methods
- Validates scoreboard existence
- Checks player validity
- Handles missing components gracefully

**Testing:**
```mcfunction
# Force infect player
scoreboard players set @s infection_timer 3600
scoreboard players set @s infection_status 1

# Test cube
effect @s slowness 60 1
particle minecraft:redstone ~ ~1 ~

# Cure
scoreboard players set @s infection_timer 0
scoreboard players set @s infection_status 0
effect @s slowness 0
```

---

### 2. BLOOD TRACKING AI

**Purpose:** Enable dynamic zombie hunting mechanics

**Configuration Constants:**
```javascript
CONFIG = {
  WOUND_THRESHOLD: 8,                // < 4 hearts = 8 damage
  DETECTION_RANGE: 32,               // blocks
  BLOOD_PARTICLE_LIFETIME: 30,       // seconds
  DETECTION_UPDATE_INTERVAL: 20,     // ticks
  SPEED_BONUS: 1.1,                  // 10% faster
  PARTICLE_EMIT_CHANCE: 0.3,         // 30% per tick
  ZOMBIE_TARGET_UPDATE_INTERVAL: 40  // ticks
}
```

**Damage to Wound Conversion:**
```
Damage Taken | Hearts Lost | Wound Level | Zombie Reaction
4            | 2 hearts    | 4           | No reaction
8            | 4 hearts    | 8           | ✓ BLOOD DETECTED
16           | 8 hearts    | 16          | ✓✓ Strong draw
24           | 12 hearts   | 24          | ✓✓✓ Immediate targeting
```

**Key Methods:**
```javascript
markAsWounded(player)           // Player at < 4 hearts
emitBloodParticles()            // Emit particles from wounded
emitBloodAt(location, dimension)// Spawn particle effect
updateZombieTargeting()         // Find and target wounds
findNearestWounded(zombie, list)// Pathfinding
applySpeedBonus(zombie)         // Effect Speed II
updateWoundTracking()           // Heal wounds over time
getWoundStatus(player)          // Query status
clearWounds(player)             // Reset wounds
```

**Particle System:**
```
Redstone Particle:
  - Spawns per tick if wounded
  - 30% chance each tick
  - Falls downward (gravity)
  - Lifetime: 30 seconds max

Heart Particle (Blood splatter):
  - Every 10th emission
  - Spreads outward
  - Indicates "strong" wound
```

**Zombie Behavior Integration:**
```
Zombie sees blood:
  1. Gain Speed I effect
  2. Update target to nearest wounded
  3. Move toward player
  4. Maintain speed for duration
```

**Testing:**
```mcfunction
# Wound player (deal 8+ damage)
damage @s 12 overdose

# Check wound status
scoreboard players query @s wound_level

# Force high wound
scoreboard players set @s wound_level 20

# Spawn zombie 30 blocks away
summon minecraft:zombie ~ ~1 ~30

# Zombie should target player
# Player should see speed effect
```

---

### 3. HORDE/SÜRÜ CLUSTERING

**Purpose:** Create dynamic group encounters with coordinated attacks

**Configuration Constants:**
```javascript
CONFIG = {
  ALERT_RADIUS: 16,                  // blocks from alert source
  MAX_HORDE_SIZE: 12,                // zombies per cluster
  FORMATION_SPEED_BONUS: 1.3,        // 30% faster
  ATTACK_COOLDOWN_REDUCTION: 2,      // ticks
  HORDE_UPDATE_INTERVAL: 40,         // ticks
  CLUSTER_SEARCH_RADIUS: 16          // blocks for recruitment
}
```

**Horde Formation Process:**
```
Step 1: Single zombie spots player (50-block range)
          └─ playerSpotted = true
Step 2: Tag as horde_lead
          └─ Initiate formation alert
Step 3: Search nearby zombies (16-block radius)
          └─ Found: 5 additional zombies
Step 4: Tag all as horde_member (max 12 total)
          ├─ Set horde_id (unique cluster)
          ├─ Add horde_active = 1
          └─ Apply effects
Step 5: Maintain formation
          ├─ Sync movement
          ├─ Speed III effect
          ├─ Strength I effect
          └─ Coordinated targeting
Step 6: On leader death
          └─ Disband horde (cleanup)
```

**Key Methods:**
```javascript
initiateHordeFormation(leader, target)     // Create cluster
getNearbyZombies(center, range)            // Find recruits
maintainFormations()                       // Sustain effects
commandHordeToAttack(horde)                // Coordinate attack
disbandHorde(hordeId)                      // Cleanup
cleanupDeadHordes()                        // Remove invalid
getHordeStatus()                          // Query all hordes
```

**Effect Progression:**
```
Time  | Speed Effect    | Strength Effect | Result
0s    | Speed I         | Off             | Formation
1s    | Speed II        | Off             | Rushed approach
5s    | Speed III       | Strength I      | Attack mode
10s   | Removed         | Removed         | Disbanded or new AI
```

**Horde Data Structure:**
```javascript
{
  id: 1,                          // Unique cluster ID
  leader: zombieEntity,           // Lead zombie
  members: [z1, z2, z3, ...],    // Up to 12 members
  targetPlayer: player,           // Current target
  score: 0                        // Kill counter
}
```

**Zombie Tagging:**
```
horde_member          - Generic horde member tag
horde_1, horde_2, ... - Specific cluster ID tags
```

**Testing:**
```mcfunction
# Spawn 5+ zombies
summon minecraft:zombie ~ ~ ~ {Tags:["test_zombie"]}
summon minecraft:zombie ~ ~1 ~ {Tags:["test_zombie"]}
summon minecraft:zombie ~1 ~ ~ {Tags:["test_zombie"]}
summon minecraft:zombie ~1 ~1 ~ {Tags:["test_zombie"]}
summon minecraft:zombie ~2 ~ ~ {Tags:["test_zombie"]}

# All within 16-block radius
# Player nearby (< 50 blocks)
# Result: Horde forms automatically

# Check horde status
scoreboard players query @e[type=zombie] horde_id
scoreboard players query @e[type=zombie] horde_size
```

---

### 4. BLOOD MOON EVENT

**Purpose:** Create cyclical apocalyptic encounters for progression pacing

**Configuration Constants:**
```javascript
CONFIG = {
  EVENT_CYCLE_DAYS: 7,               // Trigger frequency
  SPAWN_RATE_MULTIPLIER: 10,         // vs normal rate
  ZOMBIES_PER_WAVE: 20,              // per player per wave
  WAVE_INTERVAL_TICKS: 2400,         // Every 2 minutes
  EVENT_DURATION_TICKS: 48000,       // ~3 hours
  WARNING_LEAD_TIME: 12000,          // 10 min before
  UPDATE_INTERVAL: 20,               // ticks
  SPAWN_RADIUS_FROM_PLAYER: 50       // blocks
}
```

**Calendar System:**
```
Day 0  → Day 1 → ... → Day 6 → Day 7 ⚠
                                ↓
                           Day 7 Night
                                ↓
                         BLOOD MOON STARTS
                                ↓
                    (Spawn waves every 2min)
                                ↓
                           Day 8 Dawn
                                ↓
                       EVENT ENDS/RESET
                                ↓
                    Day 8 → ... → Day 14 ⚠
```

**Day Counter Logic:**
```
In-Game Time | Day Counter | Event Status
0-24000      | Day 1       | Normal
24000-48000  | Day 2       | Normal
...
144000-168000| Day 7       | ⚠ WARNING (10min before)
168000       | Day 7 Night | 🔴 BLOOD MOON ACTIVE
192000       | Day 8       | Event ends, reset
```

**Wave Spawning Mechanics:**
```
Event Start (Night):
  Wave 1: 20 zombies/player @ t=0
  Wave 2: 20 zombies/player @ t=2400 ticks (2 min)
  Wave 3: 20 zombies/player @ t=4800 ticks (4 min)
  ...
  Wave N: Every 2400 ticks until dawn
  
Event Duration: ~12 hours real-time = 48000 ticks
Expected Waves: 12-16 per event
Expected Zombies: 240-320 per player per event
```

**Key Methods:**
```javascript
updateBloodMoonCycle()        // Main update loop (every 20 ticks)
sendWarning()                 // Alert message (10 min before)
startEvent()                  // Initialize event
applySkyEffect()              // Darkness effect + particles
spawnWave()                   // Emit 20 zombies per player
endEvent()                    // Cleanup + victory message
getEventStatus()              // Query current state
forceStartEvent()             // Manual trigger (testing)
forceEndEvent()               // Manual ending (testing)
```

**Event State Machine:**
```
INACTIVE
   ↓
   (day_counter % 7 == 0 AND daytime == night)
   ↓
WARNING (10 min before night)
   ├─ Sound effect: thunder
   ├─ Message: "Blood moon warning"
   └─ Title: Red splash screen
   ↓
ACTIVE (night begins)
   ├─ Spawn waves every 2 min
   ├─ Sky effects (darkness)
   ├─ Continuous spawning
   └─ Tag zombies: blood_moon_zombie
   ↓
END (dawn breaks)
   ├─ Kill all spawned zombies
   ├─ Cleanup tags/scoreboard
   ├─ Victory messages
   └─ Regeneration effect
   ↓
RESET (back to normal)
```

**Spawn Location Algorithm:**
```javascript
For each player:
  radius = SPAWN_RADIUS_FROM_PLAYER (50 blocks)
  for i = 0 to ZOMBIES_PER_WAVE:
    offsetX = random(-radius, +radius)
    offsetZ = random(-radius, +radius)
    spawnLocation = {
      x: player.x + offsetX,
      y: player.y,
      z: player.z + offsetZ
    }
    summon zombie @ spawnLocation
```

**Testing:**
```mcfunction
# Force day to 7
scoreboard players set @s day_counter 7

# Set time to night
time set night  # or time set 14000

# Event should trigger automatically
# Check scoreboard
scoreboard players query @s blood_moon_active

# Manual trigger
execute if score @s day_counter matches 7 if time query daytime matches 12000..24000 run function blood_moon_start

# Check waves
scoreboard players query @s wave_counter

# End event
function blood_moon_end
```

---

## INTEGRATION POINTS

### With Phase 1 Systems

**TACZ Ammo System:**
- Infected zombies still drop ammo
- Blood tracking works with gun wounds
- Hordes can be eliminated with weapons
- Blood moon events valuable for loot grinding

**TZP Zombie Mutants:**
- Infection can target all zombie types (soldier, brute, witch, jockey)
- Blood tracking detects all variant wounds
- Horde clustering includes all mutant types
- Blood moon spawns include mutants

**Structures:**
- Players can take refuge in bunkers during blood moon
- Infected players seek antidote in military bases
- Hordes guard bunker entrances
- Blood moon spawns zombies near structures

---

## PERFORMANCE OPTIMIZATION TIPS

### For Low-End Devices

**Reduce Effect Frequency:**
```javascript
// infection_system.js - Change update interval
this.CONFIG.UPDATE_INTERVAL = 5; // was 1 (slower effects)

// blood_tracking.js - Reduce particle frequency
this.CONFIG.PARTICLE_EMIT_CHANCE = 0.1; // was 0.3

// horde_ai.js - Increase update interval
this.CONFIG.HORDE_UPDATE_INTERVAL = 80; // was 40

// blood_moon_event.js - Reduce spawn rate
this.CONFIG.ZOMBIES_PER_WAVE = 10; // was 20
```

**Disable Particles:**
```javascript
// In infection_system.js - Skip all particle emission
applyInfectionEffects(player) {
  // Skip: // Emit red particles periodically
  // Just apply effects
}
```

**Reduce Event Frequency:**
```javascript
// blood_moon_event.js - Change cycle
this.CONFIG.EVENT_CYCLE_DAYS = 14; // was 7 (every 2 weeks)
```

---

## DEBUGGING & LOGS

### Console Output
```
[INFECTION] System initialized
[BLOOD_TRACKING] System initialized
[HORDE_AI] System initialized
[BLOOD_MOON] System initialized
[PHASE2] ✅ ALL SYSTEMS INITIALIZED
```

### Debug Commands
```mcfunction
# List all scoreboards
scoreboard objectives list

# Get player infection status
scoreboard players query @s infection_timer
scoreboard players query @s infection_status

# Get wound level
scoreboard players query @s wound_level

# Check horde status
scoreboard players query @e[type=zombie] horde_id

# Check blood moon
scoreboard players query @s day_counter
scoreboard players query @s blood_moon_active
```

### Error Handling
All systems include try-catch blocks:
```javascript
} catch (error) {
  console.error(`[SYSTEM] Method failed: ${error.message}`);
  // Graceful degradation - system continues
}
```

---

## TROUBLESHOOTING MATRIX

| Issue | Cause | Fix |
|-------|-------|-----|
| No infection | Zombie not biting | Get bitten multiple times (50% chance) |
| Infection doesn't cure | Antidote not found | Check creative inventory |
| Blood particles invisible | Particle graphics off | Enable in settings |
| Zombies not tracking blood | Wound < 8 | Take 8+ damage first |
| No horde formation | Zombies solo | Need 2+ nearby zombies |
| Blood moon not starting | Day ≠ 7 multiple | Wait for day 7, 14, 21 |
| Event won't end | Stuck active | `/function blood_moon_end` |

---

## COMMANDS REFERENCE

### Scoreboard Management
```mcfunction
# Initialize objectives
scoreboard objectives add infection_timer
scoreboard objectives add blood_tracking "Tracking"
scoreboard objectives add horde_id "Horde ID"
scoreboard objectives add day_counter "Days"

# Query values
scoreboard players query @s objective_name

# Set values (testing)
scoreboard players set @s infection_timer 3600
scoreboard players set @s horde_id 1

# Reset
scoreboard players reset @s
```

### Effect Commands
```mcfunction
# Apply infection effects
effect @s slowness 60 1 true
effect @s nausea 60 0 true

# Horde movement bonus
effect @e[type=zombie,tag=horde_member] speed 200 2 false

# Speed bonus from blood tracking
effect @e[type=zombie] speed 60 1 false

# Victory regeneration (blood moon end)
effect @a regeneration 120 1 false
```

### Particle Commands
```mcfunction
# Infection particles
particle minecraft:redstone ~ ~1 ~ 0.3 0.1 0.3 1 5

# Blood particles
particle minecraft:redstone ~ ~1 ~ 0.1 0.1 0.1 2 3

# Horde alert
particle minecraft:smoke ~ ~1 ~ 0.3 0.3 0.3 1 10

# Blood moon effect
particle minecraft:soul_fire_flame ~ ~ ~ 0.5 0.5 0.5 1 3
```

---

## API & EXPORTS

### Accessing Systems (JavaScript)

```javascript
// In any script after initialization
import { infectionSystem } from './infection_system';
import { bloodTrackingManager } from './blood_tracking';
import { hordeAIManager } from './horde_ai';
import { bloodMoonEventManager } from './blood_moon_event';

// Query status
const status = infectionSystem.getInfectionStatus(player);
const wounds = bloodTrackingManager.getWoundStatus(player);
const hordes = hordeAIManager.getHordeStatus();
const event = bloodMoonEventManager.getEventStatus();
```

### Public Methods

**Infection System:**
```javascript
infectionSystem.infectPlayer(player)
infectionSystem.curePlayer(player)
infectionSystem.getInfectionStatus(player)
infectionSystem.init()
```

**Blood Tracking:**
```javascript
bloodTrackingManager.markAsWounded(player)
bloodTrackingManager.getWoundStatus(player)
bloodTrackingManager.clearWounds(player)
bloodTrackingManager.init()
```

**Horde AI:**
```javascript
hordeAIManager.getHordeStatus()
hordeAIManager.disbandHorde(hordeId)
hordeAIManager.init()
```

**Blood Moon:**
```javascript
bloodMoonEventManager.getEventStatus()
bloodMoonEventManager.forceStartEvent()
bloodMoonEventManager.forceEndEvent()
bloodMoonEventManager.init()
```

---

## CONCLUSION

Phase 2 provides a complete, production-ready implementation of advanced zombie AI systems. All code is well-documented, error-handled, and ready for integration with previous phases.

For detailed information, refer to:
- `PHASE2_IMPLEMENTATION_REPORT.md` - Full technical specifications
- `PHASE2_COMPLETION_REPORT.md` - Checklist & next steps
- Individual system source files - Inline documentation

**Ready for Phase 3: Weapons & Combat Systems**

