"""
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: main.py
"""

import webview
import ctypes
from ctypes import wintypes
from _server import app, init_db
import threading

SW_MAXIMIZE = 3
GWL_STYLE = -16
WS_THICKFRAME = 0x00040000
WS_MAXIMIZEBOX = 0x00010000
user32 = ctypes.WinDLL('user32', use_last_error=True)
GetForegroundWindow = user32.GetForegroundWindow
ShowWindow = user32.ShowWindow
GetWindowLong = user32.GetWindowLongW
SetWindowLong = user32.SetWindowLongW

def maximize_and_lock():
    hwnd = GetForegroundWindow()
    ShowWindow(hwnd, SW_MAXIMIZE)
    style = GetWindowLong(hwnd, GWL_STYLE)
    style &= ~WS_THICKFRAME
    style &= ~WS_MAXIMIZEBOX
    SetWindowLong(hwnd, GWL_STYLE, style)

def on_loaded():
    threading.Thread(target=app.run, kwargs={"port": 18081}, daemon=True).start()
    maximize_and_lock()

def main():
    init_db()
    webview.create_window(
        "Cyren",
        "http://localhost:5000/loading.html",
        resizable=True,
        maximized=True,
    )
    webview.start(on_loaded)
if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print("Terminating:", e)