#!/usr/bin/env python3
"""Direct addon fixer - runs the upgrade immediately"""
import subprocess
import sys

result = subprocess.run([
    sys.executable, 
    '/workspaces/Mcai/upgrade_addon.py'
], capture_output=False, text=True)

sys.exit(result.returncode)
