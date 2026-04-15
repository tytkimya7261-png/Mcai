#!/usr/bin/env python3
"""
Extract and analyze both mcaddon files
This script will create extraction directories and document the structure
"""
import zipfile
import os
import json
import sys

def analyze_and_extract(addon_path, extract_dir):
    """Extract addon and create analysis report"""
    
    if not os.path.exists(addon_path):
        print(f"❌ File not found: {addon_path}", file=sys.stderr)
        return False
    
    addon_name = os.path.basename(addon_path)
    
    try:
        # Create extraction directory
        os.makedirs(extract_dir, exist_ok=True)
        
        # Extract all files
        with zipfile.ZipFile(addon_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        print(f"✅ Extracted: {addon_name}")
        print(f"   Location: {extract_dir}")
        
        return True
    
    except Exception as e:
        print(f"❌ Error: {str(e)}", file=sys.stderr)
        return False

# Main execution
addons = [
    ("/workspaces/Mcai/PostApocalypticSurvival_v3.0_COMPLETE.mcaddon", 
     "/workspaces/Mcai/extracted/PostApocalypticSurvival_v3"),
    ("/workspaces/Mcai/True Survival - Zombie Apocalypse.mcaddon", 
     "/workspaces/Mcai/extracted/TrueZombieSurvival")
]

print("Starting extraction...\n")

for addon_path, extract_dir in addons:
    analyze_and_extract(addon_path, extract_dir)

print("\n✅ Extraction completed!")
print("\nNow analyzing directory structures...\n")

# Now analyze extracted directories
for addon_path, extract_dir in addons:
    addon_name = os.path.basename(addon_path).replace(".mcaddon", "")
    print(f"\n{'='*80}")
    print(f"📦 {addon_name}")
    print('='*80)
    
    if os.path.exists(extract_dir):
        print(f"\n📁 Top-level structure:")
        try:
            items = os.listdir(extract_dir)
            for item in sorted(items):
                item_path = os.path.join(extract_dir, item)
                if os.path.isdir(item_path):
                    file_count = len([f for f in os.walk(item_path)][0][2])
                    sub_dirs = len([f for f in os.walk(item_path)][0][1])
                    print(f"   📂 {item}/ ({file_count} files, {sub_dirs} subdirs)")
                else:
                    print(f"   📄 {item}")
        except Exception as e:
            print(f"   Error reading directory: {e}")
        
        # List resource files
        print(f"\n🔍 Resource file types found:")
        
        json_files = []
        texture_files = []
        sound_files = []
        script_files = []
        
        for root, dirs, files in os.walk(extract_dir):
            for file in files:
                if file.endswith('.json'):
                    json_files.append(os.path.join(root, file).replace(extract_dir, ''))
                elif file.endswith(('.png', '.jpg', '.tga')):
                    texture_files.append(file)
                elif file.endswith(('.ogg', '.wav', '.mp3')):
                    sound_files.append(file)
                elif file.endswith(('.js', '.ts')):
                    script_files.append(file)
        
        if json_files:
            print(f"   ✓ JSON Files: {len(json_files)}")
            for f in json_files[:10]:
                print(f"      - {f}")
            if len(json_files) > 10:
                print(f"      ... and {len(json_files) - 10} more")
        
        if texture_files:
            print(f"   ✓ Textures/Images: {len(texture_files)}")
        
        if sound_files:
            print(f"   ✓ Sounds/Audio: {len(sound_files)}")
        
        if script_files:
            print(f"   ✓ Scripts: {len(script_files)}")

print("\n" + "="*80)
print("Extraction and analysis complete!")
print("="*80)
