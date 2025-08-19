"""
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-19
 * File: main.py
"""

# # NOT USEFULL CURRENTLY
# class c:
#     """Minimal implementation of C-like macros"""

#     _DEFINED_VARS: list = []

#     @classmethod
#     def define(cls, var: str) -> int:
#         """Define variables\n
#         Usage:
#             c.define(VARIABLE: str) -> Literal[0]:
#         """
#         cls._DEFINED_VARS = [*cls._DEFINED_VARS, var]
#         return 0
    
#     @classmethod
#     def defined(cls, var: str) -> int:
#         """Check if a variable is defined previously using c.define()\n
#         Usage:
#             c.defined(VARIABLE: str) -> (returns 1 if defined else 0)
#         """
#         return 1 if var in cls._DEFINED_VARS else 0

_DISABLE_APP_MODE = 0

import threading
from _server import app, init_db
import sys

if "--no-webview" in sys.argv:
    _DISABLE_APP_MODE = 1


if not _DISABLE_APP_MODE:
    import webview
    import ctypes
    from ctypes import wintypes

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
    threading.Thread(target=app.run, kwargs={"host": "127.0.0.1", "port": 18081}, daemon=True).start()
    maximize_and_lock()

def main():
    init_db()
    if not _DISABLE_APP_MODE:
        webview.create_window(
            "Cyren",
            "http://localhost:5000/loading.html",
            resizable=True,
            maximized=True,
        )
        webview.start(on_loaded)
    else:
        app.run("127.0.0.1", 18081)
if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print("Terminating:", e)