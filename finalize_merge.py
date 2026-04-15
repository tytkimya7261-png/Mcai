#!/usr/bin/env python3
"""
Enhanced Minecraft Addon Merger - Analysis & Finalization
Analyzes the merge, counts resources, and creates final .mcaddon
"""

import zipfile
import os
import json
import shutil
from pathlib import Path
from collections import defaultdict

SOURCE_ADDON = "/workspaces/Mcai/PostApocalypticSurvival_v3.0_COMPLETE.mcaddon"
UPGRADE_ADDON = "/workspaces/Mcai/True Survival - Zombie Apocalypse.mcaddon"
WORK_DIR = "/workspaces/Mcai/work_merge"
OUTPUT_ADDON = "/workspaces/Mcai/PostApocalypticSurvival_UPGRADED.mcaddon"

def count_files_by_type(directory, pattern_map):
    """Count files by type in a directory"""
    counts = defaultdict(int)
    for root, dirs, files in os.walk(directory):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            for file_type, extensions in pattern_map.items():
                if ext in extensions:
                    counts[file_type] += 1
                    break
            else:
                counts['other'] += 1
    return counts

def analyze_addon(addon_path, addon_name):
    """Analyze addon structure and contents"""
    extract_dir = os.path.join(WORK_DIR, "analysis", addon_name)
    
    print(f"\n📦 Analyzing: {addon_name}")
    print("=" * 60)
    
    # Extract
    if not os.path.exists(extract_dir):
        os.makedirs(os.path.dirname(extract_dir), exist_ok=True)
        with zipfile.ZipFile(addon_path, 'r') as zf:
            zf.extractall(extract_dir)
    
    # Scan
    resources = {
        'entities': [],
        'items': [],
        'blocks': [],
        'textures': [],
        'sounds': [],
        'models': [],
        'animations': [],
        'recipes': [],
        'functions': [],
        'scripts': []
    }
    
    # Behavior Pack Analysis
    bp_path = os.path.join(extract_dir, "behavior_packs")
    if os.path.exists(bp_path):
        print(f"\n  🔧 Behavior Pack Contents:")
        
        # Entities
        entities_dir = os.path.join(bp_path, "*", "entities")
        for root, dirs, files in os.walk(bp_path):
            if 'entities' in root:
                resources['entities'] = [f for f in files if f.endswith('.json')]
        
        # Items
        for root, dirs, files in os.walk(bp_path):
            if 'items' in root:
                resources['items'] = [f for f in files if f.endswith('.json')]
        
        # Blocks
        for root, dirs, files in os.walk(bp_path):
            if 'blocks' in root:
                resources['blocks'] = [f for f in files if f.endswith('.json')]
        
        # Functions
        for root, dirs, files in os.walk(bp_path):
            if 'functions' in root:
                resources['functions'] += [f for f in files if f.endswith('.mcfunction')]
        
        # Scripts
        for root, dirs, files in os.walk(bp_path):
            if 'scripts' in root:
                resources['scripts'] += [f for f in files if f.endswith('.js')]
        
        # Recipes
        for root, dirs, files in os.walk(bp_path):
            if 'recipes' in root:
                resources['recipes'] += [f for f in files if f.endswith('.json')]
        
        print(f"    • Entities: {len(resources['entities'])}")
        if resources['entities'][:5]:
            for e in resources['entities'][:5]:
                print(f"      - {e}")
            if len(resources['entities']) > 5:
                print(f"      ... and {len(resources['entities']) - 5} more")
        
        print(f"    • Items: {len(resources['items'])}")
        if resources['items'][:5]:
            for i in resources['items'][:5]:
                print(f"      - {i}")
            if len(resources['items']) > 5:
                print(f"      ... and {len(resources['items']) - 5} more")
        
        print(f"    • Blocks: {len(resources['blocks'])}")
        print(f"    • Functions: {len(resources['functions'])}")
        print(f"    • Scripts: {len(resources['scripts'])}")
        print(f"    • Recipes: {len(resources['recipes'])}")
    
    # Resource Pack Analysis
    rp_path = os.path.join(extract_dir, "resource_packs")
    if os.path.exists(rp_path):
        print(f"\n  🎨 Resource Pack Contents:")
        
        # Textures
        for root, dirs, files in os.walk(rp_path):
            if 'textures' in root:
                resources['textures'] = [f for f in files if f.endswith(('.png', '.jpg'))]
        
        # Models
        for root, dirs, files in os.walk(rp_path):
            if 'models' in root:
                resources['models'] = [f for f in files if f.endswith('.json')]
        
        # Animations
        for root, dirs, files in os.walk(rp_path):
            if 'animations' in root:
                resources['animations'] = [f for f in files if f.endswith('.json')]
        
        # Sounds
        for root, dirs, files in os.walk(rp_path):
            if 'sounds' in root:
                resources['sounds'] += [f for f in files if f.endswith(('.ogg', '.wav', '.mp3'))]
        
        print(f"    • Textures: {len(resources['textures'])}")
        if resources['textures'][:5]:
            for t in resources['textures'][:5]:
                print(f"      - {t}")
            if len(resources['textures']) > 5:
                print(f"      ... and {len(resources['textures']) - 5} more")
        
        print(f"    • Models: {len(resources['models'])}")
        print(f"    • Animations: {len(resources['animations'])}")
        print(f"    • Sounds: {len(resources['sounds'])}")
    
    return resources

def finalize_mcaddon():
    """Create final .mcaddon file from merged directory"""
    merged_dir = os.path.join(WORK_DIR, "merged", "PostApocalypticSurvival_UPGRADED")
    
    print(f"\n📦 Creating final .mcaddon file...")
    print("=" * 60)
    
    if not os.path.exists(merged_dir):
        print(f"❌ Merged directory not found: {merged_dir}")
        return False
    
    # Remove old output
    if os.path.exists(OUTPUT_ADDON):
        os.remove(OUTPUT_ADDON)
    
    # Create zip file
    with zipfile.ZipFile(OUTPUT_ADDON, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(merged_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, os.path.dirname(merged_dir))
                zf.write(file_path, arcname)
    
    size_bytes = os.path.getsize(OUTPUT_ADDON)
    size_mb = size_bytes / (1024 * 1024)
    size_kb = size_bytes / 1024
    
    print(f"  ✅ Created: {OUTPUT_ADDON}")
    print(f"  📊 File size: {size_mb:.2f} MB ({size_kb:.0f} KB)")
    
    return True

def count_merged_resources():
    """Count all resources in the merged addon"""
    merged_dir = os.path.join(WORK_DIR, "merged", "PostApocalypticSurvival_UPGRADED")
    
    print(f"\n📊 Resource Count in Merged Addon")
    print("=" * 60)
    
    pattern_map = {
        'entities': ['.json'],
        'textures': ['.png', '.jpg', '.jpeg'],
        'sounds': ['.ogg', '.wav', '.mp3'],
        'models': ['.json'],
        'animations': ['.json'],
        'configs': ['.json'],
        'functions': ['.mcfunction'],
        'scripts': ['.js']
    }
    
    # Count BP resources
    bp_path = os.path.join(merged_dir, "behavior_pack")
    if os.path.exists(bp_path):
        print(f"\n  🔧 Behavior Pack:")
        counts = count_files_by_type(bp_path, pattern_map)
        
        # More specific counts
        entities_count = 0
        for root, dirs, files in os.walk(os.path.join(bp_path, "entities")):
            entities_count += len([f for f in files if f.endswith('.json')])
        
        items_count = 0
        for root, dirs, files in os.walk(os.path.join(bp_path, "items")):
            items_count += len([f for f in files if f.endswith('.json')])
        
        blocks_count = 0
        if os.path.exists(os.path.join(bp_path, "blocks")):
            for root, dirs, files in os.walk(os.path.join(bp_path, "blocks")):
                blocks_count += len([f for f in files if f.endswith('.json')])
        
        functions_count = 0
        if os.path.exists(os.path.join(bp_path, "functions")):
            for root, dirs, files in os.walk(os.path.join(bp_path, "functions")):
                functions_count += len([f for f in files if f.endswith('.mcfunction')])
        
        print(f"    • Total JSON configs: {counts['configs']}")
        print(f"    • Entities: {entities_count}")
        print(f"    • Items: {items_count}")
        print(f"    • Blocks: {blocks_count}")
        print(f"    • Functions: {functions_count}")
    
    # Count RP resources
    rp_path = os.path.join(merged_dir, "resource_pack")
    if os.path.exists(rp_path):
        print(f"\n  🎨 Resource Pack:")
        counts = count_files_by_type(rp_path, pattern_map)
        
        textures_count = 0
        if os.path.exists(os.path.join(rp_path, "textures")):
            for root, dirs, files in os.walk(os.path.join(rp_path, "textures")):
                textures_count += len([f for f in files if f.endswith(('.png', '.jpg', '.jpeg'))])
        
        models_count = 0
        if os.path.exists(os.path.join(rp_path, "models")):
            for root, dirs, files in os.walk(os.path.join(rp_path, "models")):
                models_count += len([f for f in files if f.endswith('.json')])
        
        animations_count = 0
        if os.path.exists(os.path.join(rp_path, "animations")):
            for root, dirs, files in os.walk(os.path.join(rp_path, "animations")):
                animations_count += len([f for f in files if f.endswith('.json')])
        
        sounds_count = 0
        if os.path.exists(os.path.join(rp_path, "sounds")):
            for root, dirs, files in os.walk(os.path.join(rp_path, "sounds")):
                sounds_count += len([f for f in files if f.endswith(('.ogg', '.wav', '.mp3'))])
        
        print(f"    • Textures: {textures_count}")
        print(f"    • Models: {models_count}")
        print(f"    • Animations: {animations_count}")
        print(f"    • Sounds: {sounds_count}")


def main():
    print("\n" + "=" * 60)
    print("🎮 MINECRAFT ADDON MERGER - FINALIZATION & ANALYSIS")
    print("=" * 60)
    
    # Check if merged directory exists
    merged_dir = os.path.join(WORK_DIR, "merged", "PostApocalypticSurvival_UPGRADED")
    if not os.path.exists(merged_dir):
        print(f"\n❌ ERROR: Merged directory not found!")
        print(f"   Expected: {merged_dir}")
        return False
    
    print(f"\n✅ Found merged addon directory")
    
    # Analyze merged addon
    count_merged_resources()
    
    # Create final .mcaddon
    success = finalize_mcaddon()
    
    if success:
        print(f"\n" + "=" * 60)
        print(f"✨ MERGE COMPLETE!")
        print(f"=" * 60)
        print(f"📦 Output: {OUTPUT_ADDON}")
        
        # Verify output
        if os.path.exists(OUTPUT_ADDON):
            size_mb = os.path.getsize(OUTPUT_ADDON) / (1024 * 1024)
            print(f"✅ File created successfully: {size_mb:.2f} MB")
        
        return True
    else:
        print(f"\n❌ Failed to create .mcaddon file")
        return False


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
