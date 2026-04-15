import zipfile
import os
import json

# Directly execute analysis
addon_files = {
    "PostApocalypticSurvival_v3.0_COMPLETE": "/workspaces/Mcai/PostApocalypticSurvival_v3.0_COMPLETE.mcaddon",
    "True_Survival_Zombie_Apocalypse": "/workspaces/Mcai/True Survival - Zombie Apocalypse.mcaddon"
}

print("\n" + "="*80)
print("🔍 MCADDON DOSYALARI ANALİZİ")
print("="*80 + "\n")

for addon_name, addon_path in addon_files.items():
    print("\n" + "="*80)
    print(f"📦 {addon_name}")
    print("="*80)
    
    if not os.path.exists(addon_path):
        print(f"❌ Dosya bulunamadı: {addon_path}")
        continue
    
    file_size_mb = os.path.getsize(addon_path) / (1024*1024)
    print(f"📏 Dosya Boyutu: {file_size_mb:.2f} MB\n")
    
    try:
        with zipfile.ZipFile(addon_path, 'r') as zip_ref:
            all_files = zip_ref.namelist()
            print(f"📊 Toplam Dosya Sayısı: {len(all_files)}\n")
            
            # Top-level directories
            top_level = set()
            for file in all_files:
                parts = file.split('/')
                if len(parts) > 0 and parts[0]:
                    top_level.add(parts[0])
            
            print("📁 ANA KLASÖRLER:")
            for folder in sorted(top_level):
                print(f"   📂 {folder}/")
            
            # Detailed resource analysis
            print("\n🔍 RESOURCE TÜRLERİ:")
            print("-" * 80)
            
            resources = {}
            
            for file in sorted(all_files):
                lower_file = file.lower()
                
                # JSON Files Analysis
                if file.endswith('.json'):
                    if '/entities/' in lower_file:
                        resources.setdefault('Entity Definitions (JSON)', []).append(file)
                    elif '/items/' in lower_file:
                        resources.setdefault('Item Definitions (JSON)', []).append(file)
                    elif '/blocks/' in lower_file:
                        resources.setdefault('Block Definitions (JSON)', []).append(file)
                    elif 'animation' in lower_file:
                        resources.setdefault('Animation Definitions (JSON)', []).append(file)
                    elif 'model' in lower_file:
                        resources.setdefault('Model Definitions (JSON)', []).append(file)
                    elif 'manifest' in lower_file or 'pack' in lower_file:
                        resources.setdefault('Manifest/Config (JSON)', []).append(file)
                    else:
                        resources.setdefault('Other JSON Configs', []).append(file)
                
                # Media Files
                elif file.endswith(('.png', '.jpg', '.jpeg', '.tga')):
                    resources.setdefault('Texture/Image Files', []).append(file)
                elif file.endswith(('.ogg', '.wav', '.mp3')):
                    resources.setdefault('Audio/Sound Files', []).append(file)
                
                # Scripts
                elif file.endswith(('.js', '.ts')):
                    resources.setdefault('Behavior Scripts', []).append(file)
                
                # Text/Language
                elif file.endswith(('.lang', '.txt')):
                    resources.setdefault('Language/Text Files', []).append(file)
            
            # Print resources
            total_resources = sum(len(v) for v in resources.values())
            print(f"\n📦 Toplam Resource Dosyaları: {total_resources}\n")
            
            for category, files in sorted(resources.items()):
                print(f"🔹 {category}: {len(files)}")
                for file in sorted(files)[:5]:
                    filename = file.split('/')[-1]
                    subpath = "/".join(file.split('/')[:3])
                    print(f"     • {subpath}/")
                if len(files) > 5:
                    print(f"     ... ve {len(files) - 5} daha")
                print()
            
            # Manifest details
            print("📋 MANIFEST VE HEADER BİLGİLERİ:")
            print("-" * 80)
            
            for file in sorted(all_files):
                if file.lower().endswith('manifest.json'):
                    try:
                        content = zip_ref.read(file).decode('utf-8')
                        manifest = json.loads(content)
                        print(f"\n📄 {file}")
                        
                        if 'header' in manifest:
                            header = manifest['header']
                            print(f"   Addon Adı: {header.get('name', 'N/A')}")
                            print(f"   Açıklama: {header.get('description', 'N/A')[:80]}...")
                            print(f"   Versiyon: {header.get('version', 'N/A')}")
                            print(f"   UUID: {header.get('uuid', 'N/A')[:20]}...")
                            print(f"   Min Engine Sürümü: {header.get('min_engine_version', 'N/A')}")
                        
                        if 'modules' in manifest and manifest['modules']:
                            print(f"   Modüller: {len(manifest['modules'])} adet")
                            for i, mod in enumerate(manifest['modules']):
                                print(f"      - Modül {i+1}: {mod.get('type', 'unknown').upper()} (UUID: {mod.get('uuid', 'N/A')[:20]}...)")
                    except Exception as e:
                        print(f"   ⚠️ Manifest okunamadı: {str(e)}")
    
    except zipfile.BadZipFile:
        print(f"❌ Geçersiz ZIP dosyası!")
    except Exception as e:
        print(f"❌ Hata: {str(e)}")

print("\n" + "="*80)
print("✅ ANALIZ TAMAMLANDI")
print("="*80 + "\n")
