#!/usr/bin/env python3
"""
PHASE 1 FINAL MERGE - Simplified Executor
Merges all Phase 1 components without external dependencies
"""

import os
import json
import shutil
import uuid
import zipfile
from pathlib import Path

BASE_DIR = "/workspaces/Mcai"
PHASE1_DIR = os.path.join(BASE_DIR, "work_phase1")
WORK_MERGE_DIR = os.path.join(BASE_DIR, "work_merge_phase1")
OUTPUT_ADDON = os.path.join(BASE_DIR, "PostApocalypticSurvival_ULTIMATE_v5.0.0-Phase1.mcaddon")

def log(msg):
    print(f"[✓] {msg}")

def warn(msg):
    print(f"[!] {msg}")

def main():
    """Execute Phase 1 merge"""
    
    print("="*60)
    print("PHASE 1: FINAL MERGE EXECUTION")
    print("="*60 + "\n")
    
    # Step 1: Setup directories
    log("Creating work directory...")
    os.makedirs(WORK_MERGE_DIR, exist_ok=True)
    base_addon = os.path.join(BASE_DIR, "PostApocalypticSurvival_UPGRADED.mcaddon")
    extract_base = os.path.join(WORK_MERGE_DIR, "base_addon")
    output_structure = os.path.join(WORK_MERGE_DIR, "PostApocalypticSurvival_ULTIMATE")
    
    # Step 2: Extract base addon
    log("Extracting base addon v4.0.0...")
    if os.path.exists(extract_base):
        shutil.rmtree(extract_base)
    os.makedirs(extract_base)
    
    with zipfile.ZipFile(base_addon, 'r') as zf:
        zf.extractall(extract_base)
    
    # Step 3: Setup output structure
    log("Setting up output addon structure...")
    if os.path.exists(output_structure):
        shutil.rmtree(output_structure)
    os.makedirs(output_structure)
    
    # Find BP/RP in extracted addon
    bp_source = None
    rp_source = None
    
    for item in os.listdir(extract_base):
        item_path = os.path.join(extract_base, item)
        if os.path.isdir(item_path):
            if 'behavior' in item.lower():
                bp_source = item_path
            elif 'resource' in item.lower():
                rp_source = item_path
    
    if not bp_source or not rp_source:
        warn("Could not find behavior_pack or resource_pack")
        # Try to find in subdirectories
        for root, dirs, files in os.walk(extract_base):
            for d in dirs:
                if d == 'behavior_pack':
                    bp_source = os.path.join(root, d)
                elif d == 'resource_pack':
                    rp_source = os.path.join(root, d)
    
    log(f"Found behavior_pack: {bp_source}")
    log(f"Found resource_pack: {rp_source}")
    
    # Step 4: Copy base packs to output
    bp_dest = os.path.join(output_structure, "behavior_pack")
    rp_dest = os.path.join(output_structure, "resource_pack")
    
    log("Copying base packs...")
    if bp_source:
        shutil.copytree(bp_source, bp_dest)
    if rp_source:
        shutil.copytree(rp_source, rp_dest)
    
    # Step 5: Add Phase 1 structures (NBT files)
    log("Adding Lost Cities structures (10 NBT files)...")
    structures_src = os.path.join(PHASE1_DIR, "structures")
    structures_dest = os.path.join(bp_dest, "structures")
    os.makedirs(structures_dest, exist_ok=True)
    
    if os.path.exists(structures_src):
        for nbt_file in os.listdir(structures_src):
            if nbt_file.endswith('.nbt'):
                src = os.path.join(structures_src, nbt_file)
                dst = os.path.join(structures_dest, nbt_file)
                shutil.copy2(src, dst)
        log(f"  Copied {len([f for f in os.listdir(structures_src) if f.endswith('.nbt')])} NBT structures")
    
    # Step 6: Add magazine items
    log("Adding TACZ magazine items (6 items)...")
    items_dest = os.path.join(bp_dest, "items")
    os.makedirs(items_dest, exist_ok=True)
    
    ammo_src = os.path.join(PHASE1_DIR, "ammo_system")
    if os.path.exists(ammo_src):
        for mag_file in os.listdir(ammo_src):
            if mag_file.startswith('magazine_') and mag_file.endswith('.json'):
                src = os.path.join(ammo_src, mag_file)
                dst = os.path.join(items_dest, mag_file)
                shutil.copy2(src, dst)
        log(f"  Copied magazine items")
    
    # Step 7: Add ammo system script
    log("Adding ammo_system.js...")
    scripts_dest = os.path.join(bp_dest, "scripts")
    os.makedirs(scripts_dest, exist_ok=True)
    
    ammo_js = os.path.join(ammo_src, "ammo_system.js")
    if os.path.exists(ammo_js):
        shutil.copy2(ammo_js, os.path.join(scripts_dest, "ammo_system.js"))
        log("  Copied ammo_system.js")
    
    # Step 8: Add zombie entities + loot tables
    log("Adding TZP zombie mutants (4 entities)...")
    entities_dest = os.path.join(bp_dest, "entities")
    loot_dest = os.path.join(bp_dest, "loot_tables")
    os.makedirs(entities_dest, exist_ok=True)
    os.makedirs(loot_dest, exist_ok=True)
    
    entities_src = os.path.join(PHASE1_DIR, "entities")
    if os.path.exists(entities_src):
        entity_count = 0
        loot_count = 0
        for f in os.listdir(entities_src):
            src = os.path.join(entities_src, f)
            if f.startswith('zombie_') and f.endswith('.json') and '_loot' not in f:
                dst = os.path.join(entities_dest, f)
                shutil.copy2(src, dst)
                entity_count += 1
            elif '_loot.json' in f:
                dst = os.path.join(loot_dest, f)
                shutil.copy2(src, dst)
                loot_count += 1
        log(f"  Copied {entity_count} entity definitions + {loot_count} loot tables")
    
    # Step 9: Update manifests
    log("Updating manifests to v5.0.0 ULTIMATE...")
    
    # Generate UUIDs
    bp_uuid = str(uuid.uuid4())
    rp_uuid = str(uuid.uuid4())
    
    # Update behavior pack manifest
    bp_manifest_path = os.path.join(bp_dest, "manifest.json")
    if os.path.exists(bp_manifest_path):
        with open(bp_manifest_path, 'r', encoding='utf-8') as f:
            bp_manifest = json.load(f)
        
        bp_manifest["version"] = [5, 0, 0]
        bp_manifest["uuid"] = bp_uuid
        bp_manifest["name"] = "Post-Apocalyptic Survival BP - ULTIMATE"
        
        if "header" in bp_manifest:
            bp_manifest["header"]["version"] = [5, 0, 0]
            bp_manifest["header"]["uuid"] = bp_uuid
        
        with open(bp_manifest_path, 'w', encoding='utf-8') as f:
            json.dump(bp_manifest, f, indent=2, ensure_ascii=False)
        
        log("  Updated behavior_pack manifest")
    
    # Update resource pack manifest
    rp_manifest_path = os.path.join(rp_dest, "manifest.json")
    if os.path.exists(rp_manifest_path):
        with open(rp_manifest_path, 'r', encoding='utf-8') as f:
            rp_manifest = json.load(f)
        
        rp_manifest["version"] = [5, 0, 0]
        rp_manifest["uuid"] = rp_uuid
        rp_manifest["name"] = "Post-Apocalyptic Survival RP - ULTIMATE"
        
        if "header" in rp_manifest:
            rp_manifest["header"]["version"] = [5, 0, 0]
            rp_manifest["header"]["uuid"] = rp_uuid
        
        with open(rp_manifest_path, 'w', encoding='utf-8') as f:
            json.dump(rp_manifest, f, indent=2, ensure_ascii=False)
        
        log("  Updated resource_pack manifest")
    
    # Step 10: Package addon
    log("Packaging final .mcaddon file...")
    
    if os.path.exists(OUTPUT_ADDON):
        os.remove(OUTPUT_ADDON)
    
    with zipfile.ZipFile(OUTPUT_ADDON, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(output_structure):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, output_structure)
                zf.write(file_path, arcname)
    
    file_size_mb = os.path.getsize(OUTPUT_ADDON) / (1024 * 1024)
    log(f"Created {OUTPUT_ADDON} ({file_size_mb:.2f} MB)")
    
    # Summary
    print("\n" + "="*60)
    print("✅ PHASE 1 MERGE COMPLETE")
    print("="*60)
    print(f"Output: {OUTPUT_ADDON}")
    print(f"Size: {file_size_mb:.2f} MB")
    print(f"Status: Ready for testing")
    print("="*60 + "\n")
    
    return True

if __name__ == "__main__":
    try:
        main()
        print("✨ SUCCESS!")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
