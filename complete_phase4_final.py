#!/usr/bin/env python3
"""
PHASE 4 FINAL: Complete Integration
Merges Phase 3 addon + Phase 4 structures + Phase 4 JSON configs
Creates final PostApocalypticSurvival_ULTIMATE_v5.0.0-Phase4.mcaddon
"""

import json
import zipfile
import shutil
from pathlib import Path

# ============================================================================
# STEP 1: Extract Phase 3
# ============================================================================

def extract_phase3():
    """Extract Phase 3 addon"""
    print("[1/5] Extracting Phase 3 addon...")
    
    phase3_path = Path("/workspaces/Mcai/PostApocalypticSurvival_ULTIMATE_v5.0.0-Phase3.mcaddon")
    temp_dir = Path("/workspaces/Mcai/temp_final_merge")
    
    # Clean if exists
    if temp_dir.exists():
        shutil.rmtree(temp_dir)
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    # Extract
    with zipfile.ZipFile(phase3_path, 'r') as zf:
        zf.extractall(temp_dir)
    
    print(f"✓ Extracted to: {temp_dir}")
    return temp_dir

# ============================================================================
# STEP 2: Add Phase 4 Structures (MCStructure files)
# ============================================================================

def add_phase4_structures(temp_dir):
    """Add MCStructure files to behavior_pack"""
    print("\n[2/5] Adding MCStructure files...")
    
    structures_src = Path("/workspaces/Mcai/work_phase4/structures")
    structures_dst = temp_dir / "behavior_pack" / "structures"
    
    structures_dst.mkdir(parents=True, exist_ok=True)
    
    for mcstructure_file in structures_src.glob("*.mcstructure"):
        dest = structures_dst / mcstructure_file.name
        shutil.copy2(mcstructure_file, dest)
        print(f"  ✓ Added: {mcstructure_file.name}")
    
    return structures_dst

# ============================================================================
# STEP 3: Add Phase 4 JSON Configs (if not already there)
# ============================================================================

def add_phase4_configs(temp_dir):
    """Add loot tables, spawn rules, functions, features"""
    print("\n[3/5] Adding Phase 4 JSON configs...")
    
    behavior_pack = temp_dir / "behavior_pack"
    phase4_src = Path("/workspaces/Mcai/work_phase4")
    
    # Loot tables
    loot_dst = behavior_pack / "loot_tables"
    loot_dst.mkdir(parents=True, exist_ok=True)
    for file in (phase4_src / "loot_tables").glob("*.json"):
        dest = loot_dst / file.name
        if not dest.exists():
            shutil.copy2(file, dest)
            print(f"  ✓ Added loot: {file.name}")
    
    # Spawn rules
    spawn_dst = behavior_pack / "spawn_rules"
    spawn_dst.mkdir(parents=True, exist_ok=True)
    for file in (phase4_src / "spawn_rules").glob("*.json"):
        dest = spawn_dst / file.name
        if not dest.exists():
            shutil.copy2(file, dest)
            print(f"  ✓ Added spawn: {file.name}")
    
    # Functions
    func_dst = behavior_pack / "functions"
    func_dst.mkdir(parents=True, exist_ok=True)
    for file in (phase4_src / "functions").glob("*.mcfunction"):
        dest = func_dst / file.name
        if not dest.exists():
            shutil.copy2(file, dest)
            print(f"  ✓ Added function: {file.name}")
    
    # Features
    feat_dst = behavior_pack / "features"
    feat_dst.mkdir(parents=True, exist_ok=True)
    for file in (phase4_src / "features").glob("*.json"):
        dest = feat_dst / file.name
        if not dest.exists():
            shutil.copy2(file, dest)
            print(f"  ✓ Added feature: {file.name}")

# ============================================================================
# STEP 4: Update Manifest to v5.0.5 (Phase 4 complete)
# ============================================================================

def update_manifest_final(temp_dir):
    """Update manifest version to 5.0.5"""
    print("\n[4/5] Updating manifest...")
    
    manifest_path = temp_dir / "manifest.json"
    
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
    
    # Update versions
    manifest['header']['version'] = [5, 0, 5]
    if 'modules' in manifest and len(manifest['modules']) > 0:
        manifest['modules'][0]['version'] = [5, 0, 5]
    
    # Update description
    manifest['header']['description'] = (
        "Post-Apocalyptic Survival ULTIMATE v5.0.5 - "
        "Phase 4 Complete: World Building with Bunker, Military Bases, "
        "Metro Tunnels, and Laboratories"
    )
    
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print("✓ Updated to v5.0.5")

# ============================================================================
# STEP 5: Repackage Final Addon
# ============================================================================

def repackage_final(temp_dir):
    """Create final .mcaddon file"""
    print("\n[5/5] Repackaging final addon...")
    
    output_path = Path("/workspaces/Mcai/PostApocalypticSurvival_ULTIMATE_v5.0.0-Phase4_COMPLETE.mcaddon")
    
    # Remove if exists
    if output_path.exists():
        output_path.unlink()
    
    # Create zip
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in __import__('os').walk(temp_dir):
            for file in files:
                file_path = Path(root) / file
                arcname = file_path.relative_to(temp_dir)
                zipf.write(file_path, arcname)
    
    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"✓ Created: {output_path.name}")
    print(f"  Size: {size_mb:.2f} MB")
    
    return output_path

# ============================================================================
# VERIFICATION
# ============================================================================

def verify_phase4_complete(addon_path):
    """Verify Phase 4 is complete"""
    print("\n" + "=" * 70)
    print("VERIFICATION")
    print("=" * 70)
    
    with zipfile.ZipFile(addon_path, 'r') as zf:
        files = zf.namelist()
        
        # Check for structures
        structures = [f for f in files if 'structures' in f and f.endswith('.mcstructure')]
        print(f"\n✓ MCStructure files found: {len(structures)}")
        for s in structures:
            print(f"  • {Path(s).name}")
        
        # Check for loot tables
        loots = [f for f in files if 'loot_tables' in f and f.endswith('.json')]
        print(f"\n✓ Loot tables found: {len(loots)}")
        
        # Check for spawn rules
        spawns = [f for f in files if 'spawn_rules' in f and f.endswith('.json')]
        print(f"✓ Spawn rules found: {len(spawns)}")
        
        # Check for functions
        functions = [f for f in files if 'functions' in f and f.endswith('.mcfunction')]
        print(f"✓ MCFunctions found: {len(functions)}")
        
        # Check for features
        features = [f for f in files if 'features' in f and f.endswith('.json')]
        print(f"✓ Feature rules found: {len(features)}")
        
        # Validate manifest
        manifest = json.loads(zf.read('manifest.json'))
        version = manifest['header']['version']
        print(f"\n✓ Manifest version: {version[0]}.{version[1]}.{version[2]}")
        print(f"✓ Name: {manifest['header']['name']}")
        
        total_files = len(files)
        print(f"\n✓ Total files in addon: {total_files}")
    
    return True

# ============================================================================
# CLEANUP
# ============================================================================

def cleanup(temp_dir):
    """Remove temporary directory"""
    if temp_dir.exists():
        shutil.rmtree(temp_dir)
        print("\n✓ Cleaned up temporary files")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("PHASE 4 FINAL COMPLETION")
    print("=" * 70)
    
    try:
        # Extract Phase 3
        temp_dir = extract_phase3()
        
        # Add structures
        add_phase4_structures(temp_dir)
        
        # Add configs
        add_phase4_configs(temp_dir)
        
        # Update manifest
        update_manifest_final(temp_dir)
        
        # Repackage
        final_addon = repackage_final(temp_dir)
        
        # Verify
        verify_phase4_complete(final_addon)
        
        # Cleanup
        cleanup(temp_dir)
        
        print("\n" + "=" * 70)
        print("✅ PHASE 4 COMPLETE - EKSIKSIZ")
        print("=" * 70)
        print(f"\nFinal Addon: {final_addon.name}")
        print("\nWorld Building Features:")
        print("  ✓ Bunker (safe spawn zone)")
        print("  ✓ Military Base (combat arena)")
        print("  ✓ Metro Tunnel (underground network)")
        print("  ✓ Laboratory (rare endgame)")
        print("\nLoot Distribution:")
        print("  ✓ 4 loot tables (bunker, military, metro, lab)")
        print("  ✓ 3 spawn rules (procedural placement)")
        print("  ✓ 5 MCFunctions (initialization & effects)")
        print("  ✓ 3 feature rules (structure generation)")
        print("\nReady for Phase 5: Polish & Optimization")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
