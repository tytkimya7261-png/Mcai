#!/usr/bin/env python3
# Direct analysis - no extraction needed
# This script analyzes mcaddon files from within the ZIP

import zipfile
import os
import json
from pathlib import Path

output_lines = []

def print_line(text=""):
    output_lines.append(text)
    print(text)

addon_files = {
    "PostApocalypticSurvival_v3.0_COMPLETE": "/workspaces/Mcai/PostApocalypticSurvival_v3.0_COMPLETE.mcaddon",
    "TrueZombieSurvival": "/workspaces/Mcai/True Survival - Zombie Apocalypse.mcaddon"
}

print_line("\n" + "="*90)
print_line("🔍 MCADDON İÇ YAPISI VE RESOURCE TÜRLERİ ANALİZİ")
print_line("="*90)

for addon_name, addon_path in addon_files.items():
    print_line("\n" + "="*90)
    print_line(f"📦 ADDON: {addon_name}")
    print_line("="*90)
    
    if not os.path.exists(addon_path):
        print_line(f"❌ Dosya bulunamadı: {addon_path}\n")
        continue
    
    file_size_mb = os.path.getsize(addon_path) / (1024*1024)
    print_line(f"📏 Boyut: {file_size_mb:.2f} MB")
    
    try:
        with zipfile.ZipFile(addon_path, 'r') as zip_ref:
            all_files = zip_ref.namelist()
            
            print_line(f"📊 Toplam Dosya: {len(all_files)}")
            
            # Get directory structure
            print_line("\n📁 ANA KLASÖR YAPISI:")
            print_line("-" * 90)
            
            top_dirs = {}
            for file_path in all_files:
                parts = file_path.split('/')
                if parts[0]:
                    if parts[0] not in top_dirs:
                        top_dirs[parts[0]] = []
                    top_dirs[parts[0]].append(file_path)
            
            for dir_name in sorted(top_dirs.keys()):
                file_count = len(top_dirs[dir_name])
                print_line(f"  📂 {dir_name:30} ({file_count} items)")
            
            # Analyze resource types
            print_line("\n🔍 RESOURCE TÜRLERİ VE DOSYALAR:")
            print_line("-" * 90)
            
            resources = {
                'Entity Definitions': {'exts': ['.json'], 'paths': ['/entities/'], 'files': []},
                'Item Definitions': {'exts': ['.json'], 'paths': ['/items/'], 'files': []},
                'Block Definitions': {'exts': ['.json'], 'paths': ['/blocks/'], 'files': []},
                'Loot Tables': {'exts': ['.json'], 'paths': ['/loot_tables/'], 'files': []},
                'Animation Definitions': {'exts': ['.json'], 'paths': ['/animation'], 'files': []},
                'Model Files': {'exts': ['.json'], 'paths': ['/models/'], 'files': []},
                'Texture Files': {'exts': ['.png', '.jpg', '.tga'], 'paths': ['/textures/'], 'files': []},
                'Sound Files': {'exts': ['.ogg', '.wav', '.mp3'], 'paths': ['/sounds/'], 'files': []},
                'Language Files': {'exts': ['.lang'], 'paths': ['/texts/'], 'files': []},
                'Configuration JSON': {'exts': ['.json'], 'paths': ['manifest', 'pack', 'config'], 'files': []}
            }
            
            for file_path in all_files:
                lower_path = file_path.lower()
                file_ext = os.path.splitext(file_path)[1].lower()
                
                # Categorize files
                if '/entities/' in lower_path and file_ext == '.json':
                    resources['Entity Definitions']['files'].append(file_path)
                elif '/items/' in lower_path and file_ext == '.json':
                    resources['Item Definitions']['files'].append(file_path)
                elif '/blocks/' in lower_path and file_ext == '.json':
                    resources['Block Definitions']['files'].append(file_path)
                elif '/loot_tables/' in lower_path and file_ext == '.json':
                    resources['Loot Tables']['files'].append(file_path)
                elif 'animation' in lower_path and file_ext == '.json':
                    resources['Animation Definitions']['files'].append(file_path)
                elif '/models/' in lower_path and file_ext == '.json':
                    resources['Model Files']['files'].append(file_path)
                elif file_ext in ['.png', '.jpg', '.tga']:
                    resources['Texture Files']['files'].append(file_path)
                elif file_ext in ['.ogg', '.wav', '.mp3']:
                    resources['Sound Files']['files'].append(file_path)
                elif file_ext == '.lang':
                    resources['Language Files']['files'].append(file_path)
                elif any(x in lower_path for x in ['manifest', 'pack', 'config']) and file_ext == '.json':
                    resources['Configuration JSON']['files'].append(file_path)
            
            # Print sorted resources
            for category in sorted(resources.keys()):
                files = resources[category]['files']
                if files:
                    print_line(f"\n🔹 {category}: {len(files)} dosya")
                    # Show first 8 examples
                    for file_path in sorted(files)[:8]:
                        # Shorten path for display
                        short_path = '/'.join(file_path.split('/')[:4]) + ('/' if len(file_path.split('/')) > 4 else '')
                        print_line(f"     • {short_path}")
                    if len(files) > 8:
                        print_line(f"     ... ve {len(files) - 8} daha toplam şekilde")
            
            # Get manifest info
            print_line("\n📋 MANIFEST DOSYASI:")
            print_line("-" * 90)
            
            manifest_found = False
            for file_path in all_files:
                if 'manifest.json' in file_path:
                    manifest_found = True
                    try:
                        content = zip_ref.read(file_path).decode('utf-8')
                        manifest_data = json.loads(content)
                        
                        print_line(f"\n  📄 Path: {file_path}")
                        
                        if 'header' in manifest_data:
                            header = manifest_data['header']
                            print_line(f"     Name: {header.get('name', 'N/A')}")
                            print_line(f"     Description: {header.get('description', 'N/A')[:70]}")
                            print_line(f"     Version: {header.get('version', [0,0,0])}")
                            print_line(f"     UUID: {str(header.get('uuid', 'N/A'))[:30]}...")
                            print_line(f"     Min Engine Version: {header.get('min_engine_version', [1,0,0])}")
                        
                        if 'modules' in manifest_data:
                            modules = manifest_data['modules']
                            print_line(f"     Modules: {len(modules)} adet")
                            for i, mod in enumerate(modules[:3]):
                                print_line(f"       {i+1}. Type: {mod.get('type', 'unknown')}")
                                
                    except Exception as e:
                        print_line(f"  ⚠️ Manifest parse hatası: {str(e)}")
            
            if not manifest_found:
                print_line("  ⚠️ manifest.json dosyası bulunamadı")
                
    except zipfile.BadZipFile:
        print_line(f"❌ Geçersiz ZIP formatı")
    except Exception as e:
        print_line(f"❌ Hata: {str(e)}")

print_line("\n" + "="*90)
print_line("✅ ANALİZ TAMAMLANDI")
print_line("="*90 + "\n")

# Save to file
try:
    output_file = "/workspaces/Mcai/MCADDON_ANALYSIS_REPORT.txt"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(output_lines))
    print(f"\n✅ Report saved to: {output_file}")
except Exception as e:
    print(f"\n⚠️ Could not save report: {e}")

# Exit with success
exit(0)
