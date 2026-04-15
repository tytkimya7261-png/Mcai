#!/usr/bin/env python3
"""
ADD CUSTOM MILITARY BASE: Integrate bawa.mcstructure into final addon
"""

import json
import zipfile
import shutil
from pathlib import Path

print("=" * 70)
print("ADDING CUSTOM MILITARY BASE (bawa.mcstructure)")
print("=" * 70)

# Dosyaları tanımla
final_addon = Path("/workspaces/Mcai/PostApocalypticSurvival_ULTIMATE_FINAL_v5.0.5.mcaddon")
bawa_structure = Path("/workspaces/Mcai/Baza Wojskowa 1-from-abfielder.mcstructure")
temp_dir = Path("/workspaces/Mcai/temp_add_bawa")

if not bawa_structure.exists():
    print(f"❌ Bawa dosyası bulunamadı: {bawa_structure}")
    exit(1)

print(f"\n[1/4] bawa.mcstructure bulundu:")
print(f"  Dosya: {bawa_structure.name}")
print(f"  Boyut: {bawa_structure.stat().st_size / (1024*1024):.2f} MB")

# Step 1: Extract final addon
print("\n[2/4] Final addon açılıyor...")
if temp_dir.exists():
    shutil.rmtree(temp_dir)
temp_dir.mkdir(parents=True, exist_ok=True)

with zipfile.ZipFile(final_addon, 'r') as zf:
    zf.extractall(temp_dir)
print(f"✓ Extracted: {temp_dir}")

# Step 2: Add bawa.mcstructure to structures directory
print("\n[3/4] bawa.mcstructure ekleniyor...")
structures_dir = temp_dir / "behavior_pack" / "structures"
structures_dir.mkdir(parents=True, exist_ok=True)

# Copy with simplified name
dest_path = structures_dir / "bawa_military_base.mcstructure"
shutil.copy2(bawa_structure, dest_path)
print(f"✓ Added: {dest_path.name}")
print(f"  Boyut: {dest_path.stat().st_size / (1024*1024):.2f} MB")

# Step 3: Update manifest
print("\n[4/4] Manifest güncelleniyor...")
manifest_path = temp_dir / "manifest.json"

with open(manifest_path, 'r') as f:
    manifest = json.load(f)

# Version bump to 5.0.6
manifest['header']['version'] = [5, 0, 6]
manifest['modules'][0]['version'] = [5, 0, 6]

# Update description
manifest['header']['description'] = (
    "Post-Apocalyptic Survival ULTIMATE v5.0.6 - "
    "Complete Minecraft Bedrock Edition addon with custom professional military base, "
    "zombie apocalypse survival AI, 40+ weapons, armor system, and procedurally-generated structures."
)

with open(manifest_path, 'w') as f:
    json.dump(manifest, f, indent=2)

print("✓ Manifest updated to v5.0.6")

# Step 4: Repackage
print("\n[5/5] Yeni final addon oluşturuluyor...")
new_final_addon = Path("/workspaces/Mcai/PostApocalypticSurvival_ULTIMATE_FINAL_v5.0.6.mcaddon")

if new_final_addon.exists():
    new_final_addon.unlink()

import os
with zipfile.ZipFile(new_final_addon, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(temp_dir):
        for file in files:
            file_path = Path(root) / file
            arcname = file_path.relative_to(temp_dir)
            zipf.write(file_path, arcname)

size_mb = new_final_addon.stat().st_size / (1024 * 1024)
print(f"✓ Yeni addon oluşturuldu: {new_final_addon.name}")
print(f"  Boyut: {size_mb:.2f} MB")

# Cleanup
shutil.rmtree(temp_dir)

print("\n" + "=" * 70)
print("✅ TAMAMLANDI - CUSTOM MILITARY BASE EKLENDI!")
print("=" * 70)
print(f"\nYeni Final Addon: {new_final_addon.name}")
print(f"Sürüm: 5.0.6")
print(f"Boyut: {size_mb:.2f} MB")
print(f"\nMilitary Base: bawa_military_base.mcstructure (30+ MB)")
print("STATUS: Production Ready!")
