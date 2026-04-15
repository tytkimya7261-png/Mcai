#!/usr/bin/env python3
"""
Phase 4: World Building - Loot Tables, Spawn Rules, MCFunctions, Features
Creates bunker, military bases, metro tunnels, and laboratories with complete loot distribution
"""

import json
import os
import shutil
import zipfile
from pathlib import Path

# ============================================================================
# PHASE 4: WORLD BUILDING - LOOT TABLES
# ============================================================================

bunker_loot = {
    "pools": [
        {
            "name": "bunker_weapons",
            "rolls": {"min": 1, "max": 2},
            "entries": [
                {"type": "item", "name": "mcai:glock_40", "weight": 40},
                {"type": "item", "name": "mcai:m9_pistol", "weight": 30},
                {"type": "item", "name": "mcai:shotgun", "weight": 20}
            ]
        },
        {
            "name": "bunker_ammo",
            "rolls": {"min": 3, "max": 5},
            "entries": [
                {"type": "item", "name": "mcai:magazine_9mm", "weight": 80},
                {"type": "item", "name": "mcai:magazine_45acp", "weight": 70},
                {"type": "item", "name": "mcai:shotgun_shell", "weight": 60}
            ]
        },
        {
            "name": "bunker_armor",
            "rolls": {"min": 1, "max": 1},
            "entries": [
                {"type": "item", "name": "mcai:military_helmet_enhanced", "weight": 60},
                {"type": "item", "name": "mcai:steel_vest_enhanced", "weight": 40}
            ]
        },
        {
            "name": "bunker_medical",
            "rolls": {"min": 4, "max": 8},
            "entries": [
                {"type": "item", "name": "minecraft:bread", "weight": 100, "functions": [{"function": "set_count", "count": {"min": 4, "max": 8}}]},
                {"type": "item", "name": "mcai:bandage_item", "weight": 90, "functions": [{"function": "set_count", "count": {"min": 2, "max": 4}}]},
                {"type": "item", "name": "mcai:antidote", "weight": 20, "functions": [{"function": "set_count", "count": {"min": 1, "max": 1}}]}
            ]
        },
        {
            "name": "bunker_utility",
            "rolls": 2,
            "entries": [
                {"type": "item", "name": "minecraft:torch", "weight": 100, "functions": [{"function": "set_count", "count": {"min": 10, "max": 20}}]},
                {"type": "item", "name": "minecraft:crafting_table", "weight": 50}
            ]
        }
    ]
}

military_base_loot = {
    "pools": [
        {
            "name": "military_weapons",
            "rolls": {"min": 2, "max": 3},
            "entries": [
                {"type": "item", "name": "mcai:ar15", "weight": 60},
                {"type": "item", "name": "mcai:m4a1", "weight": 50},
                {"type": "item", "name": "mcai:ak47", "weight": 40},
                {"type": "item", "name": "mcai:minigun", "weight": 5}
            ]
        },
        {
            "name": "military_ammo",
            "rolls": {"min": 4, "max": 7},
            "entries": [
                {"type": "item", "name": "mcai:magazine_556", "weight": 90},
                {"type": "item", "name": "mcai:magazine_762", "weight": 80},
                {"type": "item", "name": "mcai:ammo_556", "weight": 100, "functions": [{"function": "set_count", "count": {"min": 20, "max": 60}}]},
                {"type": "item", "name": "mcai:ammo_762", "weight": 100, "functions": [{"function": "set_count", "count": {"min": 15, "max": 40}}]}
            ]
        },
        {
            "name": "military_armor",
            "rolls": {"min": 1, "max": 2},
            "entries": [
                {"type": "item", "name": "mcai:military_helmet_enhanced", "weight": 80},
                {"type": "item", "name": "mcai:steel_vest_enhanced", "weight": 90},
                {"type": "item", "name": "minecraft:iron_helmet", "weight": 70}
            ]
        },
        {
            "name": "military_medical",
            "rolls": {"min": 2, "max": 4},
            "entries": [
                {"type": "item", "name": "mcai:bandage_item", "weight": 100, "functions": [{"function": "set_count", "count": {"min": 2, "max": 5}}]},
                {"type": "item", "name": "minecraft:redstone", "weight": 70, "functions": [{"function": "set_count", "count": {"min": 5, "max": 15}}]}
            ]
        },
        {
            "name": "military_rare",
            "rolls": 1,
            "entries": [
                {"type": "item", "name": "mcai:antidote", "weight": 30},
                {"type": "item", "name": "minecraft:diamond", "weight": 20, "functions": [{"function": "set_count", "count": {"min": 1, "max": 3}}]}
            ]
        }
    ]
}

metro_loot = {
    "pools": [
        {
            "name": "metro_survival",
            "rolls": {"min": 3, "max": 5},
            "entries": [
                {"type": "item", "name": "minecraft:iron_ore", "weight": 60, "functions": [{"function": "set_count", "count": {"min": 1, "max": 3}}]},
                {"type": "item", "name": "minecraft:coal", "weight": 70, "functions": [{"function": "set_count", "count": {"min": 2, "max": 5}}]},
                {"type": "item", "name": "minecraft:redstone", "weight": 50, "functions": [{"function": "set_count", "count": {"min": 5, "max": 10}}]}
            ]
        },
        {
            "name": "metro_medical",
            "rolls": {"min": 2, "max": 4},
            "entries": [
                {"type": "item", "name": "mcai:bandage_item", "weight": 40, "functions": [{"function": "set_count", "count": {"min": 1, "max": 3}}]},
                {"type": "item", "name": "minecraft:bread", "weight": 50, "functions": [{"function": "set_count", "count": {"min": 2, "max": 4}}]}
            ]
        },
        {
            "name": "metro_tools",
            "rolls": 1,
            "entries": [
                {"type": "item", "name": "minecraft:iron_pickaxe", "weight": 40},
                {"type": "item", "name": "minecraft:iron_axe", "weight": 30}
            ]
        }
    ]
}

laboratory_loot = {
    "pools": [
        {
            "name": "laboratory_antidote",
            "rolls": {"min": 2, "max": 3},
            "entries": [
                {"type": "item", "name": "mcai:antidote", "weight": 100}
            ]
        },
        {
            "name": "laboratory_medical",
            "rolls": {"min": 3, "max": 5},
            "entries": [
                {"type": "item", "name": "mcai:bandage_item", "weight": 80, "functions": [{"function": "set_count", "count": {"min": 3, "max": 8}}]},
                {"type": "item", "name": "minecraft:redstone", "weight": 70, "functions": [{"function": "set_count", "count": {"min": 10, "max": 20}}]},
                {"type": "item", "name": "minecraft:glowstone_dust", "weight": 60, "functions": [{"function": "set_count", "count": {"min": 5, "max": 15}}]}
            ]
        },
        {
            "name": "laboratory_rare",
            "rolls": 1,
            "entries": [
                {"type": "item", "name": "minecraft:diamond", "weight": 50, "functions": [{"function": "set_count", "count": {"min": 2, "max": 4}}]},
                {"type": "item", "name": "minecraft:emerald", "weight": 40, "functions": [{"function": "set_count", "count": {"min": 1, "max": 2}}]}
            ]
        }
    ]
}

# ============================================================================
# PHASE 4: SPAWN RULES
# ============================================================================

military_base_spawn = {
    "format_version": "1.13",
    "weight": 3,
    "biomes": ["minecraft:extreme_hills", "minecraft:plains", "minecraft:forest"],
    "structure": "mcai:military_base",
    "placement": {
        "surface": True,
        "y_offset": 0
    }
}

metro_tunnel_spawn = {
    "format_version": "1.13",
    "weight": 2,
    "biomes": ["minecraft:underground"],
    "structure": "mcai:metro_tunnel",
    "placement": {
        "y_range": [30, 45],
        "underground": True
    }
}

laboratory_spawn = {
    "format_version": "1.13",
    "weight": 1,
    "biomes": ["minecraft:stone_beach", "minecraft:extreme_hills"],
    "structure": "mcai:laboratory",
    "placement": {
        "y_range": [20, 30],
        "rare": True,
        "distance_from_spawn": 500
    }
}

# ============================================================================
# PHASE 4: MCFUNCTIONS
# ============================================================================

init_bunker_mcfunction = """# BUNKER INITIALIZATION - Safe Zone at Spawn
# Runs once at world start, creates 50-block safe zone with spawn protection

# Kill existing bunker entities (if any)
execute @e[name="BunkerController"] ~~~ kill @s

# Spawn bunker controller
summon mcai:bunker_controller 0 65 0

# Create safe zone effect (50-block radius)
execute @a ~~~ effect @a[r=50] regeneration 999999 10 true
execute @a ~~~ effect @a[r=50] resistance 999999 10 true
execute @a ~~~ effect @a[r=50] night_vision 999999 0 true

# Load bunker structure
setblock 0 64 0 structure_block 0
structure load mcai:bunker 0 64 0

# Bunker loot chest setup
setblock 5 65 5 chest
fill 6 65 5 6 65 5 air
loot insert 5 65 5 loot mcai:bunker_loot

# Safe zone notification
title @a actionbar §6§lSAFE ZONE ACTIVATED - You are protected
"""

spawn_military_mcfunction = """# MILITARY BASE SPAWNER
# Triggered when players explore surface world
# Spawns military bases with 3% probability at suitable locations

# Check if player is at surface (y > 62)
execute @a[y=62,dy=200] ~~~ execute if score military_spawn_timer global matches ..0 ~~~ function mcai:spawn_military_structure

# Reset timer
scoreboard players set military_spawn_timer global 100
"""

spawn_metro_mcfunction = """# METRO TUNNEL SPAWNER
# Spawns metro tunnels underground (Y: 30-45)
# 2% spawn rate per chunk, underground_only

execute @a[y=20,dy=25] ~~~ execute if score metro_spawn_timer global matches ..0 ~~~ function mcai:spawn_metro_structure

# Tunnel effects
execute @e[family=metro_tunnel] ~~~ effect @a[r=64] mining_fatigue 10 1 false
execute @e[family=metro_tunnel] ~~~ effect @a[r=64] darkness 20 1 false
"""

spawn_lab_mcfunction = """# LABORATORY SPAWNER (RARE)
# Spawns laboratories deep underground (Y: 20-30)
# 0.5% spawn chance, maximum 3 labs per world

execute @a[y=0,dy=20] ~~~ execute if score laboratory_count global matches ..2 ~~~ function mcai:spawn_lab_structure

# Lab containment effects
execute @e[family=laboratory] ~~~ effect @a[r=64] slowness 15 1 false
execute @e[family=laboratory] ~~~ effect @a[r=64] jump_boost 15 1 false
"""

safe_zone_mcfunction = """# SAFE ZONE MAINTENANCE
# Continuous protection for 50-block bunker area
# Prevents hostile spawns, provides health regen

# Kill hostiles in safe zone
kill @e[type=zombie,r=50,m=!c]
kill @e[type=drowned,r=50,m=!c]
kill @e[type=husk,r=50,m=!c]
kill @e[type=zombie_villager,r=50,m=!c]

# Maintain protection effects
effect @a[r=50] regeneration 60 10 true
effect @a[r=50] resistance 60 10 true

# Environmental safety
weather clear
"""

# ============================================================================
# PHASE 4: FEATURE RULES
# ============================================================================

military_base_feature = {
    "format_version": "1.13.0",
    "minecraft:nether_cave_carver": {
        "description": {
            "identifier": "mcai:military_base_feature",
            "title": "Military Base"
        },
        "terrain_adjustment": "bury",
        "carver_definition": "mcai:military_base",
        "on_print": [
            {
                "coordinate_eval": "query.block_x + random(0,8)",
                "scatter_chance": 0.03,
                "y_adjustment": 0
            }
        ]
    }
}

metro_tunnel_feature = {
    "format_version": "1.13.0",
    "minecraft:cave_carver": {
        "description": {
            "identifier": "mcai:metro_tunnel_feature",
            "title": "Metro Tunnel Network"
        },
        "terrain_adjustment": "bury",
        "carver_definition": "mcai:metro_tunnel",
        "on_print": [
            {
                "coordinate_eval": "query.block_y",
                "y_range": [30, 45],
                "scatter_chance": 0.02
            }
        ]
    }
}

laboratory_feature = {
    "format_version": "1.13.0",
    "minecraft:structure": {
        "description": {
            "identifier": "mcai:laboratory_feature",
            "title": "Secret Laboratory"
        },
        "structure": "mcai:laboratory",
        "placement_rules": [
            {
                "terrain_adjustment": "bury",
                "y_range": [20, 30],
                "scatter_chance": 0.005,
                "surface": False
            }
        ]
    }
}

# ============================================================================
# DIRECTORY SETUP
# ============================================================================

def create_phase4_structure():
    """Create Phase 4 directory structure"""
    base_dir = Path("/workspaces/Mcai/work_phase4")
    
    dirs = [
        base_dir / "loot_tables",
        base_dir / "spawn_rules",
        base_dir / "functions",
        base_dir / "features"
    ]
    
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)
    
    return base_dir

# ============================================================================
# FILE WRITING
# ============================================================================

def write_phase4_files(base_dir):
    """Write all Phase 4 JSON and MCFunction files"""
    
    # Loot Tables
    with open(base_dir / "loot_tables" / "bunker_loot.json", "w") as f:
        json.dump(bunker_loot, f, indent=2)
    print("✓ Created bunker_loot.json")
    
    with open(base_dir / "loot_tables" / "military_base_loot.json", "w") as f:
        json.dump(military_base_loot, f, indent=2)
    print("✓ Created military_base_loot.json")
    
    with open(base_dir / "loot_tables" / "metro_loot.json", "w") as f:
        json.dump(metro_loot, f, indent=2)
    print("✓ Created metro_loot.json")
    
    with open(base_dir / "loot_tables" / "laboratory_loot.json", "w") as f:
        json.dump(laboratory_loot, f, indent=2)
    print("✓ Created laboratory_loot.json")
    
    # Spawn Rules
    with open(base_dir / "spawn_rules" / "military_base_spawn.json", "w") as f:
        json.dump(military_base_spawn, f, indent=2)
    print("✓ Created military_base_spawn.json")
    
    with open(base_dir / "spawn_rules" / "metro_tunnel_spawn.json", "w") as f:
        json.dump(metro_tunnel_spawn, f, indent=2)
    print("✓ Created metro_tunnel_spawn.json")
    
    with open(base_dir / "spawn_rules" / "laboratory_spawn.json", "w") as f:
        json.dump(laboratory_spawn, f, indent=2)
    print("✓ Created laboratory_spawn.json")
    
    # MCFunctions
    (base_dir / "functions").mkdir(exist_ok=True, parents=True)
    with open(base_dir / "functions" / "init_bunker.mcfunction", "w") as f:
        f.write(init_bunker_mcfunction)
    print("✓ Created init_bunker.mcfunction")
    
    with open(base_dir / "functions" / "spawn_military.mcfunction", "w") as f:
        f.write(spawn_military_mcfunction)
    print("✓ Created spawn_military.mcfunction")
    
    with open(base_dir / "functions" / "spawn_metro.mcfunction", "w") as f:
        f.write(spawn_metro_mcfunction)
    print("✓ Created spawn_metro.mcfunction")
    
    with open(base_dir / "functions" / "spawn_lab.mcfunction", "w") as f:
        f.write(spawn_lab_mcfunction)
    print("✓ Created spawn_lab.mcfunction")
    
    with open(base_dir / "functions" / "safe_zone.mcfunction", "w") as f:
        f.write(safe_zone_mcfunction)
    print("✓ Created safe_zone.mcfunction")
    
    # Feature Rules
    with open(base_dir / "features" / "military_base_feature.json", "w") as f:
        json.dump(military_base_feature, f, indent=2)
    print("✓ Created military_base_feature.json")
    
    with open(base_dir / "features" / "metro_tunnel_feature.json", "w") as f:
        json.dump(metro_tunnel_feature, f, indent=2)
    print("✓ Created metro_tunnel_feature.json")
    
    with open(base_dir / "features" / "laboratory_feature.json", "w") as f:
        json.dump(laboratory_feature, f, indent=2)
    print("✓ Created laboratory_feature.json")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("PHASE 4: WORLD BUILDING - Creating Loot Tables, Spawn Rules, Functions")
    print("=" * 70)
    
    base_dir = create_phase4_structure()
    print(f"\n✓ Created directory structure at: {base_dir}\n")
    
    write_phase4_files(base_dir)
    
    print("\n" + "=" * 70)
    print("PHASE 4 WORLD BUILDING FILES CREATED")
    print("=" * 70)
    print("\nFiles created:")
    print("  • 4 Loot Tables (bunker, military, metro, laboratory)")
    print("  • 3 Spawn Rules (military, metro, lab)")
    print("  • 5 MCFunctions (init, spawners, safe zone)")
    print("  • 3 Feature Rules (structure generation)")
    print("\nNext: Merge Phase 4 with Phase 3 addon and create Phase4.mcaddon")
