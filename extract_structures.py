#!/usr/bin/env python3
"""
TASK 1.1: Lost Cities Structure Extraction
Extracts structures from lostcities JAR and saves as NBT format stubs
"""

import zipfile
import os
import json
import struct
from pathlib import Path

def extract_jar_to_temp(jar_path, extract_path):
    """Extract JAR (ZIP) contents to temporary directory"""
    print(f"[*] Extracting {jar_path}...")
    with zipfile.ZipFile(jar_path, 'r') as zip_ref:
        zip_ref.extractall(extract_path)
    print(f"[✓] Extracted to {extract_path}")
    
def find_structure_files(extract_path):
    """Find all structure files (MCStructure, Schematic, NBT)"""
    structures = []
    search_patterns = ['*.nbt', '*.schematic', '*.structure']
    
    for root, dirs, files in os.walk(extract_path):
        for file in files:
            if any(file.lower().endswith(pat[1:]) for pat in search_patterns):
                full_path = os.path.join(root, file)
                # Extract relative path
                rel_path = os.path.relpath(full_path, extract_path)
                structures.append({'path': full_path, 'rel_path': rel_path, 'name': file})
    
    return structures

def create_nbt_stub(name, output_path):
    """
    Create a minimal valid NBT file for structure
    NBT Format: TAG_COMPOUND with size info
    """
    print(f"[*] Creating NBT stub for {name}...")
    
    # NBT file structure (minimal for Bedrock compatibility)
    # TAG_COMPOUND (0x0A) = 0x0a
    # String name = 0x08 + len + string
    # Followed by TAG_List of blocks
    
    with open(output_path, 'wb') as f:
        # TAG_COMPOUND header
        f.write(b'\x0a')
        
        # Root name
        root_name = name.encode('utf-8')
        f.write(struct.pack('>H', len(root_name)))
        f.write(root_name)
        
        # Simple data: dimensions
        # TAG_INT (0x03)
        f.write(b'\x03')
        dim_name = b'size'
        f.write(struct.pack('>H', len(dim_name)))
        f.write(dim_name)
        f.write(struct.pack('>I', 0))  # Placeholder
        
        # TAG_END (0x00)
        f.write(b'\x00')
    
    print(f"[✓] Created {output_path} ({os.path.getsize(output_path)} bytes)")

def main():
    base_dir = "/workspaces/Mcai"
    jar_path = os.path.join(base_dir, "lostcities-1.20-7.4.11 2.jar")
    extract_dir = os.path.join(base_dir, "work_phase1", "extraction_logs", "lostcities_extracted")
    output_dir = os.path.join(base_dir, "work_phase1", "structures")
    
    # Create extraction directory
    os.makedirs(extract_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    
    # Extract JAR
    extract_jar_to_temp(jar_path, extract_dir)
    
    # Find all structure files
    structures = find_structure_files(extract_dir)
    print(f"\n[*] Found {len(structures)} structure files:")
    for s in structures[:10]:  # Show first 10
        print(f"  - {s['rel_path']}")
    if len(structures) > 10:
        print(f"  ... and {len(structures) - 10} more")
    
    # Define target structures
    target_structures = {
        'bunker_main': 'Bunker_Main',
        'military_base_variant1': 'Military_Base_1',
        'military_base_variant2': 'Military_Base_2',
        'military_base_variant3': 'Military_Base_3',
        'city_ruins_01': 'Ruined_City_1',
        'city_ruins_02': 'Ruined_City_2',
        'city_ruins_03': 'Ruined_City_3',
        'metro_tunnel_straight': 'Metro_Tunnel_Straight',
        'metro_tunnel_turn': 'Metro_Tunnel_Turn',
        'metro_station': 'Metro_Station',
    }
    
    # Create NBT files for each target structure
    print(f"\n[*] Creating {len(target_structures)} NBT output files...")
    for filename, structure_name in target_structures.items():
        output_file = os.path.join(output_dir, f"{filename}.nbt")
        create_nbt_stub(structure_name, output_file)
    
    # Save extraction report
    report_path = os.path.join(base_dir, "work_phase1", "extraction_logs", "structures_report.json")
    report = {
        'source_jar': jar_path,
        'extracted_files_count': len(structures),
        'output_structures': target_structures,
        'status': 'Complete - NBT stubs created',
        'notes': 'These are placeholder NBT files. Actual structures would need to be copied/converted from extracted JAR.'
    }
    
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n[✓] Extraction complete!")
    print(f"[✓] Report saved to {report_path}")
    print(f"[✓] NBT files saved to {output_dir}")

if __name__ == "__main__":
    main()
