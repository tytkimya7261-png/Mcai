#!/usr/bin/env python3
"""
Minecraft addon (.mcaddon) extraction and detailed analysis
Creates detailed manifest and structure reports
"""
import zipfile
import os
import json
import sys

def extract_addon(addon_path, extract_dir):
    """Extract mcaddon ZIP file"""
    try:
        os.makedirs(extract_dir, exist_ok=True)
        with zipfile.ZipFile(addon_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        return True
    except Exception as e:
        print(f"❌ Çıkartma hatası: {e}", file=sys.stderr)
        return False

def analyze_addon_full(addon_path, extract_dir, addon_name):
    """Comprehensive addon analysis"""
    
    report = []
    report.append(f"\n{'='*100}")
    report.append(f"📦 MINECRAFT ADDON ANALİZİ: {addon_name}")
    report.append(f"{'='*100}\n")
    
    if not os.path.exists(addon_path):
        report.append(f"❌ Dosya bulunamadı: {addon_path}")
        return report
    
    try:
        # First, extract the addon
        if extract_addon(addon_path, extract_dir):
            report.append(f"✅ Çıkartıldı: {extract_dir}\n")
        else:
            report.append(f"⚠️  Çıkartma başarısız ama devam ediliyor\n")
        
        # Analyze from ZIP directly
        with zipfile.ZipFile(addon_path, 'r') as zip_ref:
            all_files = zip_ref.namelist()
            
            # FILE STRUCTURE
            report.append("📋 DOSYA YAPISI")
            report.append("-" * 100)
            report.append(f"Toplam dosya sayısı: {len(all_files)}\n")
            
            # Get directory structure
            top_level = {}
            for file in all_files:
                parts = file.split('/')
                if parts[0]:
                    if parts[0] not in top_level:
                        top_level[parts[0]] = []
                    if len(parts) > 1:
                        top_level[parts[0]].append(file)
            
            report.append("📁 Ana Klasörler:")
            for folder in sorted(top_level.keys()):
                report.append(f"  📂 {folder}/ ({len(top_level[folder])} dosya)")
            report.append()
            
            # MANIFEST ANALYSIS
            report.append("\n📄 MANIFEST DOSYALARI VE ÖZELLIKLERI")
            report.append("-" * 100)
            
            manifest_files = {}
            for file in all_files:
                if file.endswith('manifest.json'):
                    try:
                        content = zip_ref.read(file).decode('utf-8')
                        manifest_files[file] = json.loads(content)
                    except Exception as e:
                        report.append(f"⚠️  {file} okunamadı: {e}")
            
            if manifest_files:
                for manifest_path, manifest_data in manifest_files.items():
                    report.append(f"\n{manifest_path}:")
                    report.append("─" * 100)
                    report.append(json.dumps(manifest_data, ensure_ascii=False, indent=2))
            else:
                report.append("⚠️  manifest.json dosyası bulunamadı!")
            
            # RESOURCE ANALYSIS
            report.append("\n\n🔍 RESOURCE DETAY ANALİZİ")
            report.append("-" * 100)
            
            resources = {
                'Entity Definitions': [],
                'Item Definitions': [],
                'Block Definitions': [],
                'Texture Files': [],
                'Sound Files': [],
                'Animation Files': [],
                'Model Files': [],
                'Script Files': [],
                'Language Files': [],
                'Other JSON Files': []
            }
            
            for file in all_files:
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
                    resources['Script Files'].append(file)
                elif file.endswith('.lang'):
                    resources['Language Files'].append(file)
            
            for category, files in resources.items():
                if files:
                    report.append(f"\n🔹 {category}: {len(files)}")
                    for file in sorted(files)[:10]:
                        report.append(f"      • {file}")
                    if len(files) > 10:
                        report.append(f"      ... ve {len(files) - 10} daha")
            
            # IMPORTANT FINDINGS
            report.append("\n\n⭐ ÖNEMLI BULGULAR")
            report.append("-" * 100)
            
            for manifest_path, manifest_data in manifest_files.items():
                report.append(f"\n{manifest_path} Özeti:")
                
                pack_name = "Bilinmiyor"
                pack_uuid = "Bilinmiyor"
                min_version = "Bilinmiyor"
                pack_type = "Bilinmiyor"
                format_version = "Bilinmiyor"
                
                if 'header' in manifest_data:
                    header = manifest_data['header']
                    pack_name = header.get('name', pack_name)
                    pack_uuid = header.get('uuid', pack_uuid)
                    min_version = header.get('min_engine_version', min_version)
                    report.append(f"  📌 Pack Adı: {pack_name}")
                    report.append(f"  📌 UUID: {pack_uuid}")
                    report.append(f"  📌 Minimum Minecraft Versiyonu: {min_version}")
                    report.append(f"  📌 Açıklama: {header.get('description', 'N/A')}")
                    report.append(f"  📌 Versyon: {header.get('version', 'N/A')}")
                
                if 'format_version' in manifest_data:
                    format_version = manifest_data['format_version']
                    report.append(f"  📌 Manifest Format Versiyonu: {format_version}")
                
                if 'modules' in manifest_data:
                    report.append(f"  📌 Modüller ({len(manifest_data['modules'])} adet):")
                    for mod in manifest_data['modules']:
                        mod_type = mod.get('type', 'unknown')
                        mod_uuid = mod.get('uuid', 'unknown')
                        mod_version = mod.get('version', 'unknown')
                        report.append(f"      - {mod_type}: UUID={mod_uuid}, Version={mod_version}")
            
    except zipfile.BadZipFile:
        report.append(f"❌ Geçersiz ZIP dosyası: {addon_path}")
    except Exception as e:
        report.append(f"❌ Hata: {str(e)}")
    
    return report

# Main execution
def main():
    addons = [
        ("/workspaces/Mcai/PostApocalypticSurvival_v3.0_COMPLETE.mcaddon", 
         "/workspaces/Mcai/extracted/PA_base",
         "Post Apocalyptic Survival v3.0"),
        ("/workspaces/Mcai/True Survival - Zombie Apocalypse.mcaddon", 
         "/workspaces/Mcai/extracted/TZ_addon",
         "True Survival - Zombie Apocalypse")
    ]
    
    all_reports = []
    all_reports.append("🎮 MINECRAFT ADDON ANALIZ RAPORU")
    all_reports.append(f"{'='*100}\n")
    
    for addon_path, extract_dir, addon_name in addons:
        report = analyze_addon_full(addon_path, extract_dir, addon_name)
        all_reports.extend(report)
    
    all_reports.append(f"\n{'='*100}")
    all_reports.append("✅ Analiz Tamamlandı")
    all_reports.append(f"{'='*100}\n")
    
    # Write to file
    try:
        with open('/workspaces/Mcai/ADDON_ANALYSIS_COMPLETE.txt', 'w', encoding='utf-8') as f:
            f.write('\n'.join(all_reports))
        
        print("✅ Rapor kaydedildi: /workspaces/Mcai/ADDON_ANALYSIS_COMPLETE.txt")
        
    except Exception as e:
        print(f"❌ Dosya yazma hatası: {e}", file=sys.stderr)
    
    # Print to console
    print('\n'.join(all_reports))

if __name__ == '__main__':
    main()
