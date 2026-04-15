import zipfile
import json
import os
import shutil
import tempfile

addon_src = "/workspaces/Mcai/PostApocalypticSurvival_v3.0_COMPLETE.mcaddon"
addon_dst = "/workspaces/Mcai/PostApocalypticSurvival_UPGRADED_v2.0.mcaddon"
temp_dir = tempfile.mkdtemp(prefix="addon_")

print("MCaddon dosyasını açıyorum...")
with zipfile.ZipFile(addon_src, 'r') as zip_ref:
    zip_ref.extractall(temp_dir)

print("Manifest dosyalarını düzeltiyorum...")
new_manifest = {
    "format_version": 2,
    "header": {
        "name": "PostApocalyptic Survival Upgraded",
        "description": "Enhanced Post-Apocalyptic Survival Addon",
        "version": [2, 0, 0],
        "uuid": "12345678-1234-1234-1234-123456789abc",
        "min_engine_version": [1, 20, 0]
    },
    "modules": [
        {
            "type": "data",
            "uuid": "87654321-4321-4321-4321-cba987654321",
            "version": [2, 0, 0]
        }
    ]
}

for root, dirs, files in os.walk(temp_dir):
    for file in files:
        if file.lower() == 'manifest.json':
            manifest_path = os.path.join(root, file)
            with open(manifest_path, 'w') as f:
                json.dump(new_manifest, f, indent=2)
            print(f"Düzeltildi: {manifest_path}")

print("Yeniden paketliyorum...")
if os.path.exists(addon_dst):
    os.remove(addon_dst)

with zipfile.ZipFile(addon_dst, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(temp_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, temp_dir)
            zipf.write(file_path, arcname)

size = os.path.getsize(addon_dst) / 1024
print(f"✓ Tamamlandı: {addon_dst} ({size:.2f} KB)")
shutil.rmtree(temp_dir)
print("SUCCESS")
