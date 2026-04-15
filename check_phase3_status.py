#!/usr/bin/env python3
"""Quick status check for Phase 3"""
import os
from pathlib import Path

BASE_DIR = Path("/workspaces/Mcai")
PHASE3_ADDON = BASE_DIR / "PostApocalypticSurvival_ULTIMATE_v5.0.0-Phase3.mcaddon"
WORK_PHASE3 = BASE_DIR / "work_phase3"
WORK_MERGE_PHASE3 = BASE_DIR / "work_merge_phase3"

if PHASE3_ADDON.exists():
    size_mb = PHASE3_ADDON.stat().st_size / (1024 * 1024)
    size_bytes = PHASE3_ADDON.stat().st_size
    print(f"Phase 3 Addon File: {PHASE3_ADDON.name}")
    print(f"File Size: {size_mb:.2f} MB ({size_bytes:,} bytes)")
    print(f"✅ PHASE 3 COMPLETE")
else:
    print("❌ Phase 3 addon file not found")

# Count files in work directories
if WORK_PHASE3.exists():
    js_files = list(WORK_PHASE3.glob("**/*.js"))
    json_files = list(WORK_PHASE3.glob("**/*.json"))
    print(f"\nPhase 3 Stage Directory (/work_phase3/):")
    print(f"  - JavaScript files: {len(js_files)}")
    print(f"  - JSON files: {len(json_files)}")

if WORK_MERGE_PHASE3.exists():
    bp = WORK_MERGE_PHASE3 / "behavior_pack"
    if bp.exists():
        bp_items = list(bp.glob("**/*"))
        print(f"\nMerged Behavior Pack (/work_merge_phase3/behavior_pack/):")
        print(f"  - Total items: {len(bp_items)}")
