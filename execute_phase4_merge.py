#!/usr/bin/env python3
"""
Phase 4 Merge: Integrate Phase 4 World Building into Phase 3 addon
Creates PostApocalypticSurvival_ULTIMATE_v5.0.0-Phase4.mcaddon
"""

import json
import os
import zipfile
import shutil
from pathlib import Path

# ============================================================================
# LOCATE AND VERIFY PHASE 3 ADDON
# ============================================================================

def find_phase3_addon():
    """Find Phase 3 addon file"""
    addon_files = list(Path("/workspaces/Mcai").glob("*Phase3*.mcaddon"))
    
    if not addon_files:
        # Look in current directory
        addon_files = list(Path(".").glob("*Phase3*.mcaddon"))
    
    if addon_files:
        return str(addon_files[0])
    
    raise FileNotFoundError("Phase 3 addon (.mcaddon) not found")

# ============================================================================
# EXTRACT PHASE 3
# ============================================================================

def extract_addon(addon_path):
    """Extract Phase 3 addon to temporary directory"""
    temp_dir = Path("/workspaces/Mcai/temp_merge")
    
    if temp_dir.exists():
        shutil.rmtree(temp_dir)
    
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    with zipfile.ZipFile(addon_path, 'r') as zip_ref:
        zip_ref.extractall(temp_dir)
    
    print(f"✓ Extracted Phase 3 addon to: {temp_dir}")
    return temp_dir

# ============================================================================
# INTEGRATE PHASE 4 FILES
# ============================================================================

def integrate_phase4_files(temp_dir):
    """Add Phase 4 files to behavior_pack"""
    
    phase4_dir = Path("/workspaces/Mcai/work_phase4")
    behavior_pack = temp_dir / "behavior_pack"
    
    # Ensure directories exist
    (behavior_pack / "loot_tables").mkdir(parents=True, exist_ok=True)
    (behavior_pack / "spawn_rules").mkdir(parents=True, exist_ok=True)
    (behavior_pack / "functions").mkdir(parents=True, exist_ok=True)
    (behavior_pack / "features").mkdir(parents=True, exist_ok=True)
    
    # Copy loot tables
    for file in (phase4_dir / "loot_tables").glob("*.json"):
        dest = behavior_pack / "loot_tables" / file.name
        shutil.copy2(file, dest)
        print(f"  ✓ Added: loot_tables/{file.name}")
    
    # Copy spawn rules
    for file in (phase4_dir / "spawn_rules").glob("*.json"):
        dest = behavior_pack / "spawn_rules" / file.name
        shutil.copy2(file, dest)
        print(f"  ✓ Added: spawn_rules/{file.name}")
    
    # Copy MCFunctions
    for file in (phase4_dir / "functions").glob("*.mcfunction"):
        dest = behavior_pack / "functions" / file.name
        shutil.copy2(file, dest)
        print(f"  ✓ Added: functions/{file.name}")
    
    # Copy feature rules
    for file in (phase4_dir / "features").glob("*.json"):
        dest = behavior_pack / "features" / file.name
        shutil.copy2(file, dest)
        print(f"  ✓ Added: features/{file.name}")

# ============================================================================
# UPDATE MANIFEST
# ============================================================================

def update_manifest(temp_dir):
    """Update manifest version to 5.0.4"""
    
    manifest_path = temp_dir / "manifest.json"
    
    if not manifest_path.exists():
        print(f"⚠ Warning: manifest.json not found at {manifest_path}")
        return
    
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
    
    # Update version
    manifest['header']['version'] = [5, 0, 4]
    if 'modules' in manifest and len(manifest['modules']) > 0:
        manifest['modules'][0]['version'] = [5, 0, 4]
    
    # Update description
    manifest['header']['description'] = "Post-Apocalyptic Survival ULTIMATE v5.0.4 - Phase 4: World Building Complete"
    
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print("✓ Updated manifest to v5.0.4")

# ============================================================================
# REPACKAGE ADDON
# ============================================================================

def repackage_addon(temp_dir, output_path):
    """Create new .mcaddon file from merged content"""
    
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    # If file exists, remove it
    if output_file.exists():
        output_file.unlink()
    
    # Create zip file
    with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(temp_dir):
            for file in files:
                file_path = Path(root) / file
                arcname = file_path.relative_to(temp_dir)
                zipf.write(file_path, arcname)
    
    print(f"✓ Created new addon: {output_file}")
    
    # Print file size
    size_mb = output_file.stat().st_size / (1024 * 1024)
    print(f"  Size: {size_mb:.2f} MB")
    
    return output_file

# ============================================================================
# CLEANUP
# ============================================================================

def cleanup(temp_dir):
    """Remove temporary directory"""
    if Path(temp_dir).exists():
        shutil.rmtree(temp_dir)
        print("✓ Cleaned up temporary files")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("PHASE 4 MERGE: Integrating World Building into Phase 3")
    print("=" * 70)
    
    try:
        # Find Phase 3 addon
        print("\n[1/5] Locating Phase 3 addon...")
        phase3_path = find_phase3_addon()
        print(f"✓ Found: {phase3_path}")
        
        # Extract
        print("\n[2/5] Extracting Phase 3...")
        temp_dir = extract_addon(phase3_path)
        
        # Integrate Phase 4 files
        print("\n[3/5] Integrating Phase 4 files...")
        integrate_phase4_files(temp_dir)
        
        # Update manifest
        print("\n[4/5] Updating manifest...")
        update_manifest(temp_dir)
        
        # Repackage
        print("\n[5/5] Repackaging addon...")
        output_path = "/workspaces/Mcai/PostApocalypticSurvival_ULTIMATE_v5.0.0-Phase4.mcaddon"
        final_file = repackage_addon(temp_dir, output_path)
        
        # Cleanup
        cleanup(temp_dir)
        
        print("\n" + "=" * 70)
        print("PHASE 4 MERGE COMPLETE")
        print("=" * 70)
        print(f"\nOutput: {final_file}")
        print("\nWorld Building Features Added:")
        print("  • Bunker (safe zone at spawn, starter loot)")
        print("  • Military Bases (surface, high-value weapons)")
        print("  • Metro Tunnels (underground Y=30-45)")
        print("  • Laboratories (rare, endgame antidote source)")
        print("\nPhase 4 Complete! Ready for Phase 5: Polish & Optimization")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\nTroubleshooting:")
        print("  • Ensure Phase 3 addon exists in workspace")
        print("  • Verify /work_phase4 directory has all Phase 4 files")
        print("  • Check disk space for temporary and output files")
