"""
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-19
 * File: setup.py
"""

import subprocess
import os, sys

def INSTALL():
    """Install required dependencies automatically"""

    subprocess.run([
        sys.argv[0],
        "-m", 
        "pip",
        "install",
        "-r",
        os.path.join(
            os.path.abspath(__file__),
            "requirements.txt"
        )
    ])

if __file__ == "__main__":
    INSTALL()