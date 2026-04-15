#!/usr/bin/env python3
"""Analyze mcaddon files and write output to file"""
import zipfile
import os
import json

addon_files = [
    "/workspaces/Mcai/PostApocalypticSurvival_v3.0_COMPLETE.mcaddon",
    "/workspaces/Mcai/True Survival - Zombie Apocalypse.mcaddon"
]

output = []

def analyze_addon(addon_path):
    global output
    
    output.append(f"\n{'='*80}")
    output.append(f"📦 ADDON ANALYSIS: {os.path.basename(addon_path)}")
    output.append(f"{'='*80}\n")
    
    if not os.path.exists(addon_path):
        output.append(f"❌ Dosya bulunamadı: {addon_path}")
        return
    
    try:
        with zipfile.ZipFile(addon_path, 'r') as zip_ref:
            all_files = zip_ref.namelist()
            
            output.append(f"📊 Dosya Sayısı: {len(all_files)}\n")
            output.append("📁 KLASÖR YAPISI:")
            output.append("-" * 80)
            
            # Get top-level structure
            top_level = set()
            for file in all_files:
                parts = file.split('/')
                if len(parts) > 0 and parts[0]:
                    top_level.add(parts[0])
            
            for folder in sorted(top_level):
                output.append(f"  📂 {folder}/")
            
            output.append("\n🔍 RESOURCE TÜRLERİ DETAY:")
            output.append("-" * 80)
            
            # Count resource types
            resources = {
                'Entity Definitions': [],
                'Item Definitions': [],
                'Block Definitions': [],
                'JSON Config Files': [],
                'Texture Files': [],
                'Sound Files': [],
                'Animation Files': [],
                'Model Files': [],
                'Behavior Scripts': [],
                'Language Files': []
            }
            
            for file in sorted(all_files):
                lower_file = file.lower()
                
                if '/entities/' in lower_file and file.endswith('.json'):
                    resources['Entity Definitions'].append(file)
                elif '/items/' in lower_file and file.endswith('.json'):
                    resources['Item Definitions'].append(file)
                elif '/blocks/' in lower_file and file.endswith('.json'):
                    resources['Block Definitions'].append(file)
                elif file.endswith(('.png', '.jpg', '.jpeg', '.tga')):
                    resources['Texture Files'].append(file)
                elif file.endswith(('.ogg', '.wav', '.mp3')):
                    resources['Sound Files'].append(file)
                elif 'animation' in lower_file and file.endswith('.json'):
                    resources['Animation Files'].append(file)
                elif 'model' in lower_file and file.endswith('.json'):
                    resources['Model Files'].append(file)
                elif file.endswith(('.js', '.ts')):
                    resources['Behavior Scripts'].append(file)
                elif file.endswith('.lang'):
                    resources['Language Files'].append(file)
                elif file.endswith('.json'):
                    resources['JSON Config Files'].append(file)
            
            for category, files in resources.items():
                if files:
                    output.append(f"\n  🔹 {category}: {len(files)}")
                    # Show first few examples
                    for file in sorted(files)[:7]:
                        output.append(f"      - {file}")
                    if len(files) > 7:
                        output.append(f"      ... ve {len(files) - 7} daha")
            
            output.append("\n📄 MANIFEST DOSYALARI:")
            output.append("-" * 80)
            
            found_manifest = False
            for file in sorted(all_files):
                if file.endswith('manifest.json'):
                    found_manifest = True
                    try:
                        content = zip_ref.read(file).decode('utf-8')
                        manifest = json.loads(content)
                        output.append(f"\n  📋 {file}")
                        if 'header' in manifest:
                            header = manifest['header']
                            output.append(f"      Name: {header.get('name', 'N/A')}")
                            output.append(f"      Description: {header.get('description', 'N/A')}")
                            output.append(f"      Version: {header.get('version', 'N/A')}")
                            output.append(f"      UUID: {header.get('uuid', 'N/A')}")
                            output.append(f"      Min Engine: {header.get('min_engine_version', 'N/A')}")
                        if 'modules' in manifest:
                            output.append(f"      Modules: {len(manifest['modules'])}")
                            for i, mod in enumerate(manifest['modules'][:3]):
                                output.append(f"        - Module {i+1}: {mod.get('type', 'unknown')}")
                    except Exception as e:
                        output.append(f"  ⚠️  {file} okunamadı: {str(e)}")
            
            if not found_manifest:
                output.append("  ⚠️  manifest.json dosyası bulunamadı")
    
    except zipfile.BadZipFile:
        output.append(f"❌ Geçersiz ZIP dosyası: {addon_path}")
    except Exception as e:
        output.append(f"❌ Hata: {str(e)}")

# Analyze both addons
for addon in addon_files:
    analyze_addon(addon)

output.append(f"\n{'='*80}")
output.append("✅ Analiz Tamamlandı")
output.append(f"{'='*80}\n")

# Write output to file
try:
    with open('/workspaces/Mcai/ADDON_ANALYSIS.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(output))
    
    print("✅ Analysis written to /workspaces/Mcai/ADDON_ANALYSIS.txt")
    print("\n" + '\n'.join(output))
except Exception as e:
    print(f"❌ Could not write output file: {e}")
    print('\n'.join(output))
