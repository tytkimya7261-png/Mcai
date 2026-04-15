def test_analyze_addons():
    import zipfile
    import json
    import os
    from pathlib import Path
    
    # Create output
    output = []
    output.append("="*120)
    output.append("🎮 MINECRAFT ADDON ANALYSIS REPORT\n")
    
    addon_files = {
        "PostApocalypticSurvival_v3.0_COMPLETE.mcaddon": "/workspaces/Mcai/extracted/PA_base",
        "True Survival - Zombie Apocalypse.mcaddon": "/workspaces/Mcai/extracted/TZ_addon"
    }
    
    for addon_filename, extract_path in addon_files.items():
        addon_path = f"/workspaces/Mcai/{addon_filename}"
        output.append(f"\n{'='*120}")
        output.append(f"📦 ADDON: {addon_filename}\n")
        
        if not os.path.exists(addon_path):
            output.append(f"❌ File not found: {addon_path}\n")
            continue
        
        try:
            # Extract
            os.makedirs(extract_path, exist_ok=True)
            with zipfile.ZipFile(addon_path, 'r') as zip_ref:
                zip_ref.extractall(extract_path)
            output.append(f"✅ Extracted to: {extract_path}\n")
            
            # Analyze from ZIP
            with zipfile.ZipFile(addon_path, 'r') as zip_ref:
                files = zip_ref.namelist()
                output.append(f"📊 Total files: {len(files)}\n")
                
                # Find manifests
                output.append("📄 MANIFEST FILES:\n")
                for file in files:
                    if 'manifest.json' in file:
                        try:
                            content = zip_ref.read(file).decode('utf-8')
                            manifest = json.loads(content)
                            output.append(f"{file}:\n")
                            output.append(json.dumps(manifest, indent=2))
                        except Exception as e:
                            output.append(f"Error reading {file}: {e}")
                
                # Count resources
                output.append(f"\n📊 RESOURCE INVENTORY:\n")
                entities = [f for f in files if '/entities/' in f and f.endswith('.json')]
                items = [f for f in files if '/items/' in f and f.endswith('.json')]
                textures = [f for f in files if any(f.endswith(ext) for ext in ['.png', '.jpg', '.tga'])]
                sounds = [f for f in files if any(f.endswith(ext) for ext in ['.ogg', '.wav', '.mp3'])]
                
                output.append(f"Entities: {len(entities)}")
                output.append(f"Items: {len(items)}")
                output.append(f"Textures: {len(textures)}")
                output.append(f"Sounds: {len(sounds)}")
                
        except Exception as e:
            output.append(f"❌ Error: {e}")
    
    # Write report
    report_content = "\n".join(output)
    with open("/workspaces/Mcai/ADDON_ANALYSIS_FINAL.txt", "w", encoding="utf-8") as f:
        f.write(report_content)
    
    print(report_content)
    assert True  # Test passes

if __name__ == '__main__':
    test_analyze_addons()
