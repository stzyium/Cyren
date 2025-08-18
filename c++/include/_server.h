/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: _server.h
 */

// Auto-extracted header from _server.cc
#pragma once
#ifndef CURL_STATICLIB
#define CURL_STATICLIB
#endif

#include <crow.h>
#include <sqlite3.h>
#include <json/json.h>
#include <curl/curl.h>
#include <openssl/sha.h>
#include <iostream>
#include <string>
#include <vector>
#include <fstream>
#include <regex>
#include <random>
#include <sstream>
#include <iomanip>
#include <chrono>
#include <map>
#include <cmath>
#include <filesystem>
#include "embedded_files_map.h"
#include "analyzer.hh"
#include "profile.hh"
#include "_server.h"
#include <unordered_map>


class CyrenApp {
private:
    std::string DB_PATH;
    sqlite3* db;
    struct HTTPResponse {
        std::string data;
    };
public:
    CyrenApp() ;
    ~CyrenApp() ;
    void initDB() ;
    std::string generateUUID() ; 
    std::string getCurrentTimestamp() ;
    static size_t WriteCallback(void* contents, size_t size, size_t nmemb, HTTPResponse* response);
    Json::Value execSQL(const std::string& sql, const std::vector<std::string>& params) ;
    Json::Value execSQL(const std::string& sql);
    std::string httpGet(const std::string& url, const std::vector<std::pair<std::string, std::string>>& headers = {}) ;
    std::string genAIResponse(const std::string& message, const std::string& chat_id) ;
    void setupRoutes(crow::SimpleApp& app) ;
};
void run();