#!/usr/bin/env python3
# Direct import and execution of analysis
import sys
import os

# Add workspace to path
sys.path.insert(0, '/workspaces/Mcai')
os.chdir('/workspaces/Mcai')

# Import and execute the analyze_addons_v2 module
try:
    import analyze_addons_v2
    print("\n✅ Analiz başarıyla tamamlandı!")
except Exception as e:
    print(f"❌ Hata: {e}")
    import traceback
    traceback.print_exc()
