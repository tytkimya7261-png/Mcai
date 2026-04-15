#!/usr/bin/env python3
import zipfile
import os
import json
from pathlib import Path
from collections import defaultdict

def analyze_addon(addon_path, output_folder):
    """Addon'ı çıkart ve yapısını analiz et"""
    addon_name = Path(addon_path).stem
    extract_dir = os.path.join(output_folder, addon_name)
    
    print(f"\n📦 {addon_name} analiz ediliyor...")
    print(f"   Çıkartma: {addon_path}")
    
    # Çıkart
    with zipfile.ZipFile(addon_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)
    
    # Yapı analizi
    print(f"\n📂 DİZİN YAPISI:")
    structure = scan_directory(extract_dir)
    print_structure(structure)
    
    # Resource türleri
    print(f"\n📊 RESOURCE TIPLERI:")
    resources = collect_resources(extract_dir)
    print_resources(resources)
    
    return extract_dir, resources

def scan_directory(path, prefix="", max_depth=4, current_depth=0):
    """Dizin yapısını tarayıp yapıyı döndür"""
    if current_depth >= max_depth:
        return {}
    
    structure = {}
    try:
        items = sorted(os.listdir(path))
        for item in items:
            item_path = os.path.join(path, item)
            if os.path.isdir(item_path):
                structure[item] = scan_directory(item_path, prefix + "  ", max_depth, current_depth + 1)
            else:
                structure[item] = "file"
    except PermissionError:
        pass
    
    return structure

def print_structure(structure, prefix=""):
    """Yapıyı pprint et"""
    items = list(structure.items())
    for i, (key, value) in enumerate(items):
        is_last = i == len(items) - 1
        current_prefix = "└──" if is_last else "├──"
        print(f"{prefix}{current_prefix} {key}{'/' if isinstance(value, dict) else ''}")
        if isinstance(value, dict):
            next_prefix = prefix + ("   " if is_last else "│  ")
            print_structure(value, next_prefix)

def collect_resources(extract_dir):
    """Tüm resource'ları tiplere göre topla"""
    resources = defaultdict(list)
    
    for root, dirs, files in os.walk(extract_dir):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, extract_dir)
            ext = os.path.splitext(file)[1].lower()
            
            # Entity, Item, Block JSON'ları
            if ext == ".json":
                if "entity" in file_path.lower():
                    resources["Entity (JSON)"].append(rel_path)
                elif "item" in file_path.lower():
                    resources["Item (JSON)"].append(rel_path)
                elif "block" in file_path.lower():
                    resources["Block (JSON)"].append(rel_path)
                elif "loot" in file_path.lower():
                    resources["Loot Table (JSON)"].append(rel_path)
                elif "animation" in file_path.lower():
                    resources["Animation (JSON)"].append(rel_path)
                elif "manifest" in file_path.lower():
                    resources["Manifest (JSON)"].append(rel_path)
                else:
                    resources["Other JSON"].append(rel_path)
            
            elif ext in [".png", ".jpg", ".jpeg"]:
                resources["Texture (Image)"].append(rel_path)
            
            elif ext in [".ogg", ".wav", ".mp3"]:
                resources["Sound (Audio)"].append(rel_path)
            
            elif ext == ".mcfunction":
                resources["Function (.mcfunction)"].append(rel_path)
            
            elif ext == ".lang":
                resources["Language (.lang)"].append(rel_path)
            
            else:
                resources["Other files"].append(rel_path)
    
    return resources

def print_resources(resources):
    """Resource'ları tiplere göre göster"""
    for res_type in sorted(resources.keys()):
        files = resources[res_type]
        if files:
            print(f"\n  📄 {res_type}: {len(files)} dosya")
            for file in sorted(files)[:10]:  # İlk 10'u göster
                print(f"     - {file}")
            if len(files) > 10:
                print(f"     ... ve {len(files)-10} daha")

# ANA İŞLER
if __name__ == "__main__":
    addon_pa = "/workspaces/Mcai/PostApocalypticSurvival_v3.0_COMPLETE.mcaddon"
    addon_tz = "/workspaces/Mcai/True Survival - Zombie Apocalypse.mcaddon"
    output = "/workspaces/Mcai/extracted"
    
    os.makedirs(output, exist_ok=True)
    
    print("=" * 60)
    print("MINECRAFT ADDON ANALIZ SİSTEMİ")
    print("=" * 60)
    
    # Her addon'u analiz et
    dirs = {}
    for addon_file in [addon_pa, addon_tz]:
        if os.path.exists(addon_file):
            extract_dir, resources = analyze_addon(addon_file, output)
            dirs[Path(addon_file).stem] = (extract_dir, resources)
    
    # Özet
    print("\n" + "=" * 60)
    print("✅ ÖZET")
    print("=" * 60)
    for addon_name, (extract_dir, resources) in dirs.items():
        total = sum(len(files) for files in resources.values())
        print(f"\n📦 {addon_name}")
        print(f"   Çıkartıldı: {extract_dir}")
        print(f"   Toplam dosya: {total}")
        print(f"   Resource tipleri: {len(resources)}")

print("\n✨ Analiz tamamlandı!")
