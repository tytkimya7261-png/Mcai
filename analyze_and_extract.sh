#!/bin/bash
# Extract and analyze mcaddon files
cd /workspaces/Mcai

# Create extraction directories
mkdir -p extracted/PA_base extracted/TZ_addon

# Extract first addon
echo "Extracting PostApocalypticSurvival..."
unzip -q "PostApocalypticSurvival_v3.0_COMPLETE.mcaddon" -d extracted/PA_base 2>/dev/null

# Extract second addon  
echo "Extracting True Survival - Zombie Apocalypse..."
unzip -q "True Survival - Zombie Apocalypse.mcaddon" -d extracted/TZ_addon 2>/dev/null

# Run Python analysis
python3 << 'EOF'
import os
import json
from pathlib import Path

report = []
report.append("="*120)
report.append("🎮 MINECRAFT ADDON ANALYSIS REPORT")
report.append("="*120)

# Analyze PA_base
pa_base = Path("/workspaces/Mcai/extracted/PA_base")
tz_addon = Path("/workspaces/Mcai/extracted/TZ_addon")

for addon_path, addon_name in [(pa_base, "PostApocalyptic Survival"), (tz_addon, "True Survival - Zombie Apocalypse")]:
    report.append(f"\n{'='*120}")
    report.append(f"📦 {addon_name}")
    report.append(f"{'='*120}\n")
    
    if not addon_path.exists():
        report.append(f"❌ Directory not found: {addon_path}")
        continue
    
    # Find and parse manifest.json
    manifest_files = list(addon_path.glob('**/manifest.json'))
    report.append(f"Found {len(manifest_files)} manifest.json files:\n")
    
    for manifest_path in manifest_files:
        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)
            
            relative_path = manifest_path.relative_to(addon_path)
            report.append(f"\n📄 {relative_path}")
            report.append(f"Full manifest.json content:\n")
            report.append(json.dumps(manifest, ensure_ascii=False, indent=2))
        except Exception as e:
            report.append(f"❌ Error reading {manifest_path}: {e}")
    
    # Count resources
    report.append(f"\n\n📊 RESOURCE COUNTS")
    report.append("-"*120)
    
    entity_files = list(addon_path.glob('**/entities/*.json'))
    item_files = list(addon_path.glob('**/items/*.json'))
    texture_files = list(addon_path.glob('**/textures/**/*.png'))
    sound_files = list(addon_path.glob('**/sounds/**/*.ogg')) + list(addon_path.glob('**/sounds/**/*.wav'))
    
    report.append(f"Entities: {len(entity_files)}")
    if entity_files:
        for f in entity_files[:5]:
            report.append(f"  - {f.relative_to(addon_path)}")
        if len(entity_files) > 5:
            report.append(f"  ... and {len(entity_files)-5} more")
    
    report.append(f"\nItems: {len(item_files)}")
    if item_files:
        for f in item_files[:5]:
            report.append(f"  - {f.relative_to(addon_path)}")
        if len(item_files) > 5:
            report.append(f"  ... and {len(item_files)-5} more")
    
    report.append(f"\nTextures: {len(texture_files)}")
    report.append(f"Sounds: {len(sound_files)}")
    
    # Directory structure
    report.append(f"\n\n📁 DIRECTORY STRUCTURE")
    report.append("-"*120)
    
    for root, dirs, files in os.walk(addon_path):
        level = root.replace(str(addon_path), '').count(os.sep)
        indent = ' ' * 2 * level
        rel_path = os.path.relpath(root, addon_path)
        if rel_path != '.':
            report.append(f"{indent}📂 {os.path.basename(root)}/")
        
        subindent = ' ' * 2 * (level + 1)
        for file in sorted(files)[:10]:
            report.append(f"{subindent}📄 {file}")
        if len(files) > 10:
            report.append(f"{subindent}... and {len(files)-10} more files")

# Write report
report_text = "\n".join(report)
with open("/workspaces/Mcai/ADDON_ANALYSIS_REPORT.txt", "w", encoding="utf-8") as f:
    f.write(report_text)

print(report_text)
EOF

echo "✅ Analysis complete! Report saved to ADDON_ANALYSIS_REPORT.txt"
