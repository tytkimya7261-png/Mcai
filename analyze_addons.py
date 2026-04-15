#!/usr/bin/env python3
"""Analyze mcaddon files structure"""
import zipfile
import os
import json
from pathlib import Path

addon_files = [
    "/workspaces/Mcai/PostApocalypticSurvival_v3.0_COMPLETE.mcaddon",
    "/workspaces/Mcai/True Survival - Zombie Apocalypse.mcaddon"
]

def analyze_addon(addon_path):
    print(f"\n{'='*70}")
    print(f"📦 ADDON ANALYSIS: {os.path.basename(addon_path)}")
    print(f"{'='*70}\n")
    
    if not os.path.exists(addon_path):
        print(f"❌ Dosya bulunamadı: {addon_path}")
        return
    
    try:
        with zipfile.ZipFile(addon_path, 'r') as zip_ref:
            all_files = zip_ref.namelist()
            
            print(f"📊 Dosya Sayısı: {len(all_files)}\n")
            print("📁 KLASÖR YAPISI:")
            print("-" * 70)
            
            # Get top-level structure
            top_level = set()
            for file in all_files:
                parts = file.split('/')
                if len(parts) > 0 and parts[0]:
                    top_level.add(parts[0])
            
            for folder in sorted(top_level):
                print(f"  📂 {folder}/")
            
            print("\n🔍 RESOURCE TÜRLERİ DETAY:")
            print("-" * 70)
            
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
                'Language Files': [],
                'Other Files': []
            }
            
            for file in sorted(all_files):
                lower_file = file.lower()
                
                if '/entities/' in file and file.endswith('.json'):
                    resources['Entity Definitions'].append(file)
                elif '/items/' in file and file.endswith('.json'):
                    resources['Item Definitions'].append(file)
                elif '/blocks/' in file and file.endswith('.json'):
                    resources['Block Definitions'].append(file)
                elif file.endswith('.json') and (
                    'manifest' in lower_file or 'pack' in lower_file or 
                    'config' in lower_file or 'data' in lower_file
                ):
                    resources['JSON Config Files'].append(file)
                elif file.endswith(('.png', '.jpg', '.jpeg', '.tga')):
                    resources['Texture Files'].append(file)
                elif file.endswith(('.ogg', '.wav', '.mp3')):
                    resources['Sound Files'].append(file)
                elif file.endswith('.json') and ('animation' in lower_file or 'model' in lower_file):
                    resources['Animation Files'].append(file)
                elif file.endswith(('.js', '.ts')):
                    resources['Behavior Scripts'].append(file)
                elif file.endswith('.lang'):
                    resources['Language Files'].append(file)
                elif file.endswith('.json'):
                    resources['JSON Config Files'].append(file)
                else:
                    resources['Other Files'].append(file)
            
            for category, files in resources.items():
                if files:
                    print(f"\n  🔹 {category}: {len(files)}")
                    # Show first few examples
                    for file in sorted(files)[:5]:
                        print(f"      - {file}")
                    if len(files) > 5:
                        print(f"      ... ve {len(files) - 5} daha")
            
            print("\n📄 MANIFEST DOSYALARI:")
            print("-" * 70)
            for file in all_files:
                if file.endswith('manifest.json'):
                    try:
                        content = zip_ref.read(file).decode('utf-8')
                        manifest = json.loads(content)
                        print(f"\n  📋 {file}")
                        if 'header' in manifest:
                            header = manifest['header']
                            print(f"      Name: {header.get('name', 'N/A')}")
                            print(f"      Version: {header.get('version', 'N/A')}")
                            print(f"      UUID: {header.get('uuid', 'N/A')}")
                            print(f"      Min Engine: {header.get('min_engine_version', 'N/A')}")
                    except:
                        print(f"  ⚠️  {file} okunamadı")
    
    except zipfile.BadZipFile:
        print(f"❌ Geçersiz ZIP dosyası: {addon_path}")
    except Exception as e:
        print(f"❌ Hata: {str(e)}")

# Analyze both addons
for addon in addon_files:
    analyze_addon(addon)

print(f"\n{'='*70}")
print("✅ Analiz Tamamlandı")
print(f"{'='*70}\n")
