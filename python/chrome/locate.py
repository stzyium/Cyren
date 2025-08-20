import os
import platform
import subprocess

def locate_chrome():
    # Check environment variable first
    lorca_chrome = os.getenv("LORCACHROME")
    if lorca_chrome and os.path.exists(lorca_chrome):
        return lorca_chrome

    paths = []
    system = platform.system().lower()

    if system == "darwin":
        paths = [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
            "/Applications/Chromium.app/Contents/MacOS/Chromium",
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/google-chrome",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser",
        ]
    elif system == "windows":
        paths = [
            os.path.join(os.getenv("LocalAppData", ""), "Google/Chrome/Application/chrome.exe"),
            os.path.join(os.getenv("ProgramFiles", ""), "Google/Chrome/Application/chrome.exe"),
            os.path.join(os.getenv("ProgramFiles(x86)", ""), "Google/Chrome/Application/chrome.exe"),
            os.path.join(os.getenv("LocalAppData", ""), "Chromium/Application/chrome.exe"),
            os.path.join(os.getenv("ProgramFiles", ""), "Chromium/Application/chrome.exe"),
            os.path.join(os.getenv("ProgramFiles(x86)", ""), "Chromium/Application/chrome.exe"),
            os.path.join(os.getenv("ProgramFiles(x86)", ""), "Microsoft/Edge/Application/msedge.exe"),
            os.path.join(os.getenv("ProgramFiles", ""), "Microsoft/Edge/Application/msedge.exe"),
        ]
    else:  # Linux / other
        paths = [
            "/usr/bin/google-chrome-stable",
            "/usr/bin/google-chrome",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser",
            "/snap/bin/chromium",
        ]

    for path in paths:
        if os.path.exists(path):
            return path
    return ""