#!/usr/bin/env python3
"""
PostApocalypticSurvival Upgrade Tool
- True Survival - Zombie Apocalypse'den resource'ları ekle
- Çakışmaları çöz (kaliteye göre)
- Final .mcaddon oluştur
"""

import zipfile
import os
import json
import shutil
from pathlib import Path
from collections import defaultdict
import uuid

# Konfigürasyon
SOURCE_ADDON = "/workspaces/Mcai/PostApocalypticSurvival_v3.0_COMPLETE.mcaddon"
UPGRADE_ADDON = "/workspaces/Mcai/True Survival - Zombie Apocalypse.mcaddon"
WORK_DIR = "/workspaces/Mcai/work_merge"
OUTPUT_ADDON = "/workspaces/Mcai/PostApocalypticSurvival_UPGRADED.mcaddon"

# Kalite sırası (hangi mod daha kaliteli)
# True Survival normalde daha detaylı zombie mechanics'e sahiptir
QUALITY_ORDER = {
    "True Survival": 2,
    "PostApocalyptic": 1
}

def log(msg):
    print(f"[✓] {msg}")

def warn(msg):
    print(f"[!] {msg}")

def error(msg):
    print(f"[✗] {msg}")

class AddonMerger:
    def __init__(self, source, upgrade, work_dir, output):
        self.source_path = source
        self.upgrade_path = upgrade
        self.work_dir = work_dir
        self.output_path = output
        
        self.source_extract = os.path.join(work_dir, "source")
        self.upgrade_extract = os.path.join(work_dir, "upgrade")
        self.merge_dir = os.path.join(work_dir, "merged")
        
        self.conflicts = defaultdict(list)
        self.stats = {
            "entities_added": 0,
            "items_added": 0,
            "textures_added": 0,
            "sounds_added": 0,
            "json_merged": 0,
            "conflicts_resolved": 0
        }
    
    def setup(self):
        """Çalışma dizinlerini oluştur"""
        log("Çalışma dizinleri oluşturuluyor...")
        
        if os.path.exists(self.work_dir):
            shutil.rmtree(self.work_dir)
        
        os.makedirs(self.source_extract)
        os.makedirs(self.upgrade_extract)
        os.makedirs(self.merge_dir)
        
        log(f"Dizin hazır: {self.work_dir}")
    
    def extract_addons(self):
        """İki addon'u da çıkart"""
        log("Addon'lar çıkartılıyor...")
        
        with zipfile.ZipFile(self.source_path, 'r') as zf:
            zf.extractall(self.source_extract)
            log(f"  PostApocalypticSurvival çıkartıldı")
        
        with zipfile.ZipFile(self.upgrade_path, 'r') as zf:
            zf.extractall(self.upgrade_extract)
            log(f"  True Survival çıkartıldı")
    
    def scan_addon(self, addon_dir):
        """Addon'ın yapısını tarayıp resource'ları topla"""
        resources = {
            "behavior_packs": [],
            "resource_packs": [],
            "manifest": None,
            "other_files": []
        }
        
        for item in os.listdir(addon_dir):
            item_path = os.path.join(addon_dir, item)
            if os.path.isdir(item_path):
                if item == "behavior_packs":
                    resources["behavior_packs"] = self._scan_pack_dir(item_path)
                elif item == "resource_packs":
                    resources["resource_packs"] = self._scan_pack_dir(item_path)
            elif item == "manifest.json":
                resources["manifest"] = item_path
            elif item.endswith(".png"):
                resources["other_files"].append(("image", item_path))
        
        return resources
    
    def _scan_pack_dir(self, pack_dir):
        """Pack dizinini tara"""
        packs = []
        for pack_name in os.listdir(pack_dir):
            pack_path = os.path.join(pack_dir, pack_name)
            if os.path.isdir(pack_path):
                packs.append({
                    "name": pack_name,
                    "path": pack_path
                })
        return packs
    
    def merge(self):
        """İki addon'u birleştir"""
        log("Addon'lar birleştiriliyor...")
        
        # Source'u merge dizinine kopyala (base olarak)
        log("  PostApocalypticSurvival base olarak kopyalanıyor...")
        self._copy_tree(self.source_extract, self.merge_dir)
        
        # Upgrade'den resource'ları ekle
        log("  True Survival resource'ları ekleniyor...")
        self._merge_resources(self.upgrade_extract)
        
        log(f"  Birleştirme tamamlandı")
    
    def _copy_tree(self, src, dst):
        """Dizin ağacını kopyala"""
        if not os.path.exists(dst):
            os.makedirs(dst)
        
        for item in os.listdir(src):
            src_item = os.path.join(src, item)
            dst_item = os.path.join(dst, item)
            
            if os.path.isdir(src_item):
                if not os.path.exists(dst_item):
                    shutil.copytree(src_item, dst_item)
            else:
                shutil.copy2(src_item, dst_item)
    
    def _merge_resources(self, upgrade_dir):
        """True Survival'dan resource'ları merge et"""
        
        # Behavior packs
        upgrade_bp = os.path.join(upgrade_dir, "behavior_packs")
        if os.path.exists(upgrade_bp):
            self._merge_pack_dir(upgrade_bp, "behavior_packs")
        
        # Resource packs
        upgrade_rp = os.path.join(upgrade_dir, "resource_packs")
        if os.path.exists(upgrade_rp):
            self._merge_pack_dir(upgrade_rp, "resource_packs")
    
    def _merge_pack_dir(self, upgrade_pack_dir, pack_type):
        """Pack dizinlerini merge et"""
        for pack_name in os.listdir(upgrade_pack_dir):
            upgrade_pack_path = os.path.join(upgrade_pack_dir, pack_name)
            
            if not os.path.isdir(upgrade_pack_path):
                continue
            
            # Hedef pack dizini
            merge_pack_base = os.path.join(self.merge_dir, pack_type)
            os.makedirs(merge_pack_base, exist_ok=True)
            
            # Pack'ın merge_dir'de olup olmadığını kontrol et
            existing_pack_path = os.path.join(merge_pack_base, pack_name)
            
            if os.path.exists(existing_pack_path):
                # Çakışma - mevcut pack'a ekle
                log(f"    {pack_type}/{pack_name} merge ediliyor...")
                self._merge_pack_contents(upgrade_pack_path, existing_pack_path)
            else:
                # Yeni pack - kopyala
                log(f"    {pack_type}/{pack_name} ekleniyor (yeni)...")
                shutil.copytree(upgrade_pack_path, existing_pack_path)
    
    def _merge_pack_contents(self, upgrade_pack, target_pack):
        """Pack içinde dosyaları merge et"""
        for item in os.listdir(upgrade_pack):
            item_path = os.path.join(upgrade_pack, item)
            target_path = os.path.join(target_pack, item)
            
            if os.path.isdir(item_path):
                # Subdirectory - rekursif merge
                if not os.path.exists(target_path):
                    shutil.copytree(item_path, target_path)
                else:
                    self._merge_pack_contents(item_path, target_path)
            else:
                # Dosya
                if os.path.exists(target_path):
                    # Çakışma
                    self._handle_file_conflict(item_path, target_path, item)
                else:
                    # Yeni dosya
                    shutil.copy2(item_path, target_path)
                    self.stats["textures_added" if item.endswith(('.png', '.jpg')) else 
                              "sounds_added" if item.endswith(('.ogg', '.wav')) else 
                              "json_merged"] += 1
    
    def _handle_file_conflict(self, src_file, dst_file, filename):
        """Dosya çakışmasını çöz"""
        ext = os.path.splitext(filename)[1].lower()
        
        # JSON çakışmaları
        if ext == ".json":
            try:
                with open(src_file, 'r', encoding='utf-8') as f:
                    src_data = json.load(f)
                with open(dst_file, 'r', encoding='utf-8') as f:
                    dst_data = json.load(f)
                
                # Merge logik - True Survival'ı tercih et (daha detaylı)
                merged = self._merge_json(src_data, dst_data)
                
                with open(dst_file, 'w', encoding='utf-8') as f:
                    json.dump(merged, f, indent=2, ensure_ascii=False)
                
                self.stats["conflicts_resolved"] += 1
            except Exception as e:
                warn(f"JSON merge hatası {filename}: {e}")
        
        # Binary dosyalar - True Survival'ı tercih et (daha ünlü)
        else:
            # Dosya boyutlarını karşılaştır - daha büyük olanı al
            src_size = os.path.getsize(src_file)
            dst_size = os.path.getsize(dst_file)
            
            if src_size > dst_size:
                shutil.copy2(src_file, dst_file)
                warn(f"Çakışma: {filename} - True Survival versiyonu kullanıldı (daha büyük)")
            else:
                warn(f"Çakışma: {filename} - PostApocalypticSurvival versiyonu korundu")
            
            self.stats["conflicts_resolved"] += 1
    
    def _merge_json(self, src, dst):
        """İki JSON objesini merge et"""
        if not isinstance(src, dict) or not isinstance(dst, dict):
            # Basit değer - True Survival'ı tercih et
            return src
        
        result = dst.copy()
        
        for key, value in src.items():
            if key not in result:
                result[key] = value
            elif isinstance(value, dict) and isinstance(result[key], dict):
                result[key] = self._merge_json(value, result[key])
            elif isinstance(value, list) and isinstance(result[key], list):
                # Listeleri birleştir (duplikatları kaldır)
                result[key] = list(set(result[key] + value))
        
        return result
    
    def update_manifest(self):
        """Manifest dosyalarını güncelle"""
        log("Manifest'ler güncelleniyor...")
        
        manifest_path = os.path.join(self.merge_dir, "manifest.json")
        
        if os.path.exists(manifest_path):
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)
            
            # Versiyon güncelle
            manifest["version"] = [4, 0, 0]
            
            # Format version kontrol et
            if "format_version" not in manifest:
                manifest["format_version"] = 2
            
            # UUID güncelle
            manifest["uuid"] = str(uuid.uuid4())
            
            # Header güncelle
            if "header" in manifest:
                manifest["header"]["version"] = [4, 0, 0]
                manifest["header"]["uuid"] = str(uuid.uuid4())
            
            # Name güncelle
            if "name" not in manifest or not manifest["name"].endswith("UPGRADED"):
                manifest["name"] = "PostApocalypticSurvival UPGRADED"
            
            # Description ekle
            if "description" not in manifest:
                manifest["description"] = "PostApocalypticSurvival + True Survival - Zombie Apocalypse 리소스 합쳐진 버전"
            
            with open(manifest_path, 'w', encoding='utf-8') as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)
            
            log(f"  Manifest güncellendi (v4.0.0)")
    
    def create_output_addon(self):
        """Final .mcaddon dosyasını oluştur"""
        log("Final .mcaddon dosyası oluşturuluyor...")
        
        if os.path.exists(self.output_path):
            os.remove(self.output_path)
        
        with zipfile.ZipFile(self.output_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for root, dirs, files in os.walk(self.merge_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, self.merge_dir)
                    zf.write(file_path, arcname)
        
        size_mb = os.path.getsize(self.output_path) / (1024 * 1024)
        log(f"  {self.output_path} oluşturuldu ({size_mb:.2f} MB)")
    
    def print_stats(self):
        """İstatistikleri yazdır"""
        print("\n" + "="*50)
        print("✅ MERGE TÜM LANDI - İSTATİSTİKLER")
        print("="*50)
        print(f"  📊 Çakışma çözümlendi: {self.stats['conflicts_resolved']}")
        print(f"  📄 JSON Resource'ları: {self.stats['json_merged']}")
        print(f"  🎨 Textures eklendi: {self.stats['textures_added']}")
        print(f"  🔊 Sounds eklendi: {self.stats['sounds_added']}")
        print(f"\n  📦 Çıktı: {self.output_path}")
        print("="*50 + "\n")
    
    def run(self):
        """Tüm işlemi çalıştır"""
        try:
            self.setup()
            self.extract_addons()
            self.merge()
            self.update_manifest()
            self.create_output_addon()
            self.print_stats()
            return True
        except Exception as e:
            error(f"İşlem sırasında hata: {e}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == "__main__":
    print("\n" + "="*50)
    print("🎮 MINECRAFT ADDON MERGER")
    print("="*50)
    print(f"Source: PostApocalypticSurvival v3.0")
    print(f"Upgrade: True Survival - Zombie Apocalypse")
    print(f"Output: PostApocalypticSurvival_UPGRADED.mcaddon")
    print("="*50 + "\n")
    
    merger = AddonMerger(SOURCE_ADDON, UPGRADE_ADDON, WORK_DIR, OUTPUT_ADDON)
    success = merger.run()
    
    if success:
        print("✨ Başarılı!")
    else:
        print("❌ Başarısız")
