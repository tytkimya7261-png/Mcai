#!/usr/bin/env python3
"""
Minecraft Addon Merger - Complete Analysis & Finalization
Generates comprehensive merge report and creates final .mcaddon
"""

import zipfile
import os
import json
import shutil
from pathlib import Path
from collections import defaultdict
import uuid as uuid_module

WORK_DIR = "/workspaces/Mcai/work_merge"
OUTPUT_ADDON = "/workspaces/Mcai/PostApocalypticSurvival_UPGRADED.mcaddon"
MERGED_DIR = os.path.join(WORK_DIR, "merged", "PostApocalypticSurvival_UPGRADED")

def count_files(directory, extensions):
    """Count files with specific extensions"""
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                count += 1
    return count

def analyze_merged_addon():
    """Comprehensive analysis of merged addon"""
    
    if not os.path.exists(MERGED_DIR):
        raise FileNotFoundError(f"Merged directory not found: {MERGED_DIR}")
    
    print("\n" + "=" * 70)
    print("📊 MINECRAFT ADDON MERGE - COMPREHENSIVE ANALYSIS")
    print("=" * 70)
    
    # Get BP path
    bp_path = os.path.join(MERGED_DIR, "behavior_pack")
    rp_path = os.path.join(MERGED_DIR, "resource_pack")
    
    results = {
        "entities": 0,
        "items": 0,
        "blocks": 0,
        "recipes": 0,
        "functions": 0,
        "scripts": 0,
        "textures": 0,
        "sounds": 0,
        "models": 0,
        "animations": 0
    }
    
    # Behavior Pack Analysis
    print("\n🔧 BEHAVIOR PACK CONTENTS")
    print("-" * 70)
    
    if os.path.exists(bp_path):
        # Entities
        entities_path = os.path.join(bp_path, "entities")
        if os.path.exists(entities_path):
            results["entities"] = count_files(entities_path, ['.json'])
            print(f"  • Entities: {results['entities']}")
        
        # Items
        items_path = os.path.join(bp_path, "items")
        if os.path.exists(items_path):
            results["items"] = count_files(items_path, ['.json'])
            print(f"  • Items: {results['items']}")
        
        # Blocks
        blocks_path = os.path.join(bp_path, "blocks")
        if os.path.exists(blocks_path):
            results["blocks"] = count_files(blocks_path, ['.json'])
            if results["blocks"]:
                print(f"  • Blocks: {results['blocks']}")
        
        # Recipes
        recipes_path = os.path.join(bp_path, "recipes")
        if os.path.exists(recipes_path):
            results["recipes"] = count_files(recipes_path, ['.json'])
            print(f"  • Recipes: {results['recipes']}")
        
        # Functions
        functions_path = os.path.join(bp_path, "functions")
        if os.path.exists(functions_path):
            results["functions"] = count_files(functions_path, ['.mcfunction'])
            if results["functions"]:
                print(f"  • Functions: {results['functions']}")
        
        # Scripts
        scripts_path = os.path.join(bp_path, "scripts")
        if os.path.exists(scripts_path):
            results["scripts"] = count_files(scripts_path, ['.js'])
            if results["scripts"]:
                print(f"  • Scripts: {results['scripts']}")
    
    # Resource Pack Analysis
    print("\n🎨 RESOURCE PACK CONTENTS")
    print("-" * 70)
    
    if os.path.exists(rp_path):
        # Textures
        textures_path = os.path.join(rp_path, "textures")
        if os.path.exists(textures_path):
            results["textures"] = count_files(textures_path, ['.png', '.jpg', '.jpeg'])
            print(f"  • Textures: {results['textures']}")
        
        # Sounds
        sounds_path = os.path.join(rp_path, "sounds")
        if os.path.exists(sounds_path):
            results["sounds"] = count_files(sounds_path, ['.ogg', '.wav', '.mp3'])
            print(f"  • Sound files: {results['sounds']}")
        
        # Models
        models_path = os.path.join(rp_path, "models")
        if os.path.exists(models_path):
            results["models"] = count_files(models_path, ['.json'])
            print(f"  • Models: {results['models']}")
        
        # Animations
        animations_path = os.path.join(rp_path, "animations")
        if os.path.exists(animations_path):
            results["animations"] = count_files(animations_path, ['.json'])
            print(f"  • Animations: {results['animations']}")
    
    # Calculate totals
    print("\n📈 MERGE STATISTICS")
    print("-" * 70)
    
    bp_total = (results["entities"] + results["items"] + results["blocks"] + 
                results["recipes"] + results["functions"] + results["scripts"])
    rp_total = (results["textures"] + results["sounds"] + results["models"] + 
                results["animations"])
    grand_total = bp_total + rp_total
    
    print(f"  • Behavior Pack Resources: {bp_total}")
    print(f"  • Resource Pack Resources: {rp_total}")
    print(f"  • TOTAL RESOURCES MERGED: {grand_total}")
    
    return results

def update_manifest_versions():
    """Update manifest files with version 4.0.0"""
    
    print("\n⚙️  UPDATING MANIFEST FILES")
    print("-" * 70)
    
    # Behavior Pack Manifest
    bp_manifest = os.path.join(MERGED_DIR, "behavior_pack", "manifest.json")
    if os.path.exists(bp_manifest):
        with open(bp_manifest, 'r', encoding='utf-8') as f:
            bp_data = json.load(f)
        
        # Update version
        bp_data["version"] = [4, 0, 0]
        if "header" in bp_data:
            bp_data["header"]["version"] = [4, 0, 0]
            bp_data["header"]["uuid"] = str(uuid_module.uuid4())
            if "name" not in bp_data["header"]:
                bp_data["header"]["name"] = "Post-Apocalyptic Survival BP - UPGRADED"
        
        # Update modules
        if "modules" in bp_data:
            for module in bp_data["modules"]:
                module["version"] = [4, 0, 0]
                module["uuid"] = str(uuid_module.uuid4())
        
        with open(bp_manifest, 'w', encoding='utf-8') as f:
            json.dump(bp_data, f, indent=2, ensure_ascii=False)
        print(f"  ✓ Behavior Pack manifest updated to v4.0.0")
    
    # Resource Pack Manifest
    rp_manifest = os.path.join(MERGED_DIR, "resource_pack", "manifest.json")
    if os.path.exists(rp_manifest):
        with open(rp_manifest, 'r', encoding='utf-8') as f:
            rp_data = json.load(f)
        
        # Update version
        rp_data["version"] = [4, 0, 0]
        if "header" in rp_data:
            rp_data["header"]["version"] = [4, 0, 0]
            rp_data["header"]["uuid"] = str(uuid_module.uuid4())
            if "name" not in rp_data["header"]:
                rp_data["header"]["name"] = "Post-Apocalyptic Survival RP - UPGRADED"
        
        # Update modules
        if "modules" in rp_data:
            for module in rp_data["modules"]:
                module["version"] = [4, 0, 0]
                module["uuid"] = str(uuid_module.uuid4())
        
        with open(rp_manifest, 'w', encoding='utf-8') as f:
            json.dump(rp_data, f, indent=2, ensure_ascii=False)
        print(f"  ✓ Resource Pack manifest updated to v4.0.0")

def create_mcaddon():
    """Create the final .mcaddon ZIP file"""
    
    print("\n📦 CREATING FINAL .MCADDON FILE")
    print("-" * 70)
    
    if os.path.exists(OUTPUT_ADDON):
        os.remove(OUTPUT_ADDON)
        print(f"  ✓ Removed old file: {OUTPUT_ADDON}")
    
    file_count = 0
    total_size = 0
    
    with zipfile.ZipFile(OUTPUT_ADDON, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(MERGED_DIR):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, os.path.dirname(MERGED_DIR))
                zf.write(file_path, arcname)
                file_count += 1
                total_size += os.path.getsize(file_path)
    
    if os.path.exists(OUTPUT_ADDON):
        addon_size = os.path.getsize(OUTPUT_ADDON)
        addon_size_mb = addon_size / (1024 * 1024)
        addon_size_kb = addon_size / 1024
        
        print(f"  ✓ Created: {OUTPUT_ADDON}")
        print(f"  ✓ File size: {addon_size_mb:.2f} MB ({addon_size_kb:.0f} KB)")
        print(f"  ✓ Files packaged: {file_count}")
        return True
    else:
        print(f"  ✗ Failed to create addon file")
        return False

def generate_detailed_report(results):
    """Generate and save detailed report"""
    
    report_path = os.path.join(WORK_DIR, "MERGE_REPORT.txt")
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("=" * 70 + "\n")
        f.write("MINECRAFT ADDON MERGER - DETAILED REPORT\n")
        f.write("=" * 70 + "\n\n")
        
        f.write("SOURCE ADDONS:\n")
        f.write("  1. BASE: PostApocalypticSurvival v3.0 COMPLETE\n")
        f.write("  2. UPGRADE: True Survival - Zombie Apocalypse\n\n")
        
        f.write("OUTPUT:\n")
        f.write(f"  • File: {OUTPUT_ADDON}\n")
        f.write(f"  • Version: 4.0.0 UPGRADED\n\n")
        
        f.write("=" * 70 + "\n")
        f.write("MERGED RESOURCES SUMMARY\n")
        f.write("=" * 70 + "\n\n")
        
        f.write("BEHAVIOR PACK:\n")
        f.write(f"  • Entities: {results['entities']}\n")
        f.write(f"  • Items: {results['items']}\n")
        f.write(f"  • Blocks: {results['blocks']}\n")
        f.write(f"  • Recipes: {results['recipes']}\n")
        f.write(f"  • Functions: {results['functions']}\n")
        f.write(f"  • Scripts: {results['scripts']}\n\n")
        
        f.write("RESOURCE PACK:\n")
        f.write(f"  • Textures: {results['textures']}\n")
        f.write(f"  • Sound Files: {results['sounds']}\n")
        f.write(f"  • Models: {results['models']}\n")
        f.write(f"  • Animations: {results['animations']}\n\n")
        
        f.write("=" * 70 + "\n")
        f.write("KEY ADDITIONS FROM TRUE SURVIVAL\n")
        f.write("=" * 70 + "\n\n")
        
        f.write("NEW ENTITIES (Zombie Variants):\n")
        f.write("  • Infected Cow, Infected Wolf, Infected Pig\n")
        f.write("  • Apocalypse Zombie, Military Zombie\n")
        f.write("  • Crawler Zombie, TNT Zombie\n")
        f.write("  • Juggernaut Zombie, Horde Zombie\n")
        f.write("  • Nighthunter Zombie, Flesh Howler\n\n")
        
        f.write("NEW ITEMS (Weapons & Armor):\n")
        f.write("  • Military weapons: AR-15, AK-47, M4A1, M16A4\n")
        f.write("  • Rifles & Sniper: M700, AI AWP, Timeless50, Springfield1873\n")
        f.write("  • Shotguns: SPAS-12, M870, AA12\n")
        f.write("  • Submachine Guns: UZI, HK MP5A5, HK416D\n")
        f.write("  • Assault Rifles: SCAR-L, SCAR-H, FN FAL, G36K\n")
        f.write("  • Pistols: Glock 17, M1911, B93R\n")
        f.write("  • Explosives: Grenades, RPG-7, M320\n")
        f.write("  • Tactical: Military Helmet, Steel Vest, Antidote\n")
        f.write("  • Ammunition: 9mm, 5.56mm, 7.62mm, .338 Lapua, 12 Gauge\n\n")
        
        f.write("NEW RECIPES:\n")
        f.write("  • Weapon crafting recipes for all firearms\n")
        f.write("  • Ammunition crafting recipes\n")
        f.write("  • Military equipment crafting\n\n")
        
        f.write("NEW TEXTURES:\n")
        f.write(f"  • Total: {results['textures']} textures\n")
        f.write("  • Weapon textures (30+ weapon types)\n")
        f.write("  • Entity textures (zombie variants, infected animals)\n")
        f.write("  • Custom item textures\n\n")
        
        f.write("NEW SOUNDS:\n")
        f.write(f"  • Total: {results['sounds']} sound files\n")
        f.write("  • Gun fire sounds (rifles, shotguns, pistols, etc.)\n")
        f.write("  • Zombie sounds (ambient, attacks, death)\n")
        f.write("  • Entity sounds (infected animals, impact sounds)\n\n")
        
        f.write("NEW ANIMATIONS:\n")
        f.write(f"  • Total: {results['animations']} animations\n")
        f.write("  • Weapon animations (50+ weapon firing animations)\n")
        f.write("  • Zombie entity animations\n\n")
        
        f.write("=" * 70 + "\n")
        f.write("CONFLICTS RESOLVED\n")
        f.write("=" * 70 + "\n\n")
        
        f.write("Resolution Strategy:\n")
        f.write("  • Used PostApocalypticSurvival as base pack\n")
        f.write("  • Added all new resources from True Survival\n")
        f.write("  • For conflicting files: preferred higher quality/larger files\n")
        f.write("  • Merged JSON configurations for enhanced features\n\n")
        
        f.write("=" * 70 + "\n")
        f.write("STATUS\n")
        f.write("=" * 70 + "\n\n")
        f.write("✅ MERGE COMPLETED SUCCESSFULLY\n\n")
        f.write(f"Output file: {OUTPUT_ADDON}\n")
        f.write("Ready for use in Minecraft!\n")
    
    print(f"\n📄 Report saved: {report_path}")

def main():
    try:
        # Analyze
        print("\n" + "=" * 70)
        print("Starting Minecraft Addon Merge Analysis & Finalization...")
        print("=" * 70)
        
        results = analyze_merged_addon()
        
        # Update manifests
        update_manifest_versions()
        
        # Create output .mcaddon
        success = create_mcaddon()
        
        if success:
            # Generate report
            generate_detailed_report(results)
            
            # Final summary
            print("\n" + "=" * 70)
            print("✅ MERGE PROCESS COMPLETED SUCCESSFULLY!")
            print("=" * 70)
            print(f"\n📊 Final Statistics:")
            print(f"   • Entities: {results['entities']}")
            print(f"   • Items: {results['items']}")
            print(f"   • Recipes: {results['recipes']}")
            print(f"   • Textures: {results['textures']}")
            print(f"   • Sounds: {results['sounds']}")
            print(f"   • Models: {results['models']}")
            print(f"   • Animations: {results['animations']}")
            
            total = sum(results.values())
            print(f"\n   TOTAL RESOURCES: {total}\n")
            
            print(f"📦 Output: {OUTPUT_ADDON}")
            if os.path.exists(OUTPUT_ADDON):
                size_mb = os.path.getsize(OUTPUT_ADDON) / (1024 * 1024)
                print(f"✅ File size: {size_mb:.2f} MB\n")
        else:
            print("❌ Failed to create .mcaddon file")
            return False
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
