/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: main.cc
 */

#include "webview/webview.h"
#ifdef _WIN32
#include <windows.h>
#include "res.h"
#endif
#include "_server.h"
#include <iostream>
#include <thread>
#include <chrono>
#include <fstream>


#ifdef _WIN32
int WINAPI WinMain(HINSTANCE hInst, HINSTANCE /*hPrevInst*/,
                   LPSTR /*lpCmdLine*/, int /*nCmdShow*/) {
#else
int main() {
#endif
    try {
        CyrenApp app;
        std::thread serverThread(run);
        webview::webview w(false, nullptr);
        w.set_title("Cyren");
        w.set_size(1024, 768, WEBVIEW_HINT_NONE);
        w.navigate("http://localhost:18080/loading.html");
#ifdef _WIN32
        auto window_result = w.window();
        if (window_result.has_value()) {
            HWND hwnd = (HWND)window_result.value();
            if (hwnd) {
                HICON hIcon = LoadIcon(hInst, MAKEINTRESOURCE(CYRENS_ICON0));
                if (hIcon) {
                    SendMessage(hwnd, WM_SETICON, ICON_SMALL, (LPARAM)hIcon);
                    SendMessage(hwnd, WM_SETICON, ICON_BIG, (LPARAM)hIcon);
                }
            }
        }
#endif
        w.run();
        serverThread.join();
        
    } catch (const webview::exception &e) {
        std::cerr << "Webview error: " << e.what() << '\n';
        return 1;
    } catch (const std::exception &e) {
        std::cerr << "Error: " << e.what() << '\n';
        return 1;
    }

    return 0;
}