/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: profile.cc
 */

#ifndef CURL_STATICLIB
#define CURL_STATICLIB
#endif

#include "profile.hh"
#include <curl/curl.h>
#include <vector>
#include <sstream>
#include <iostream>

InstagramFetcher::InstagramFetcher() {
    default_cookies = {
        {"csrftoken", ""},
        {"ig_did", ""},
        {"mid", ""}
    };
    curl_global_init(CURL_GLOBAL_DEFAULT);
}
static size_t WriteCallback(void* contents, size_t size, size_t nmemb, std::string* data) {
    size_t totalSize = size * nmemb;
    data->append(static_cast<char*>(contents), totalSize);
    return totalSize;
}
std::string InstagramFetcher::buildCookieString(const std::map<std::string, std::string>& cookies) {
    std::string cookieStr;
    for (const auto& cookie : cookies) {
        if (!cookieStr.empty()) {
            cookieStr += "; ";
        }
        cookieStr += cookie.first + "=" + cookie.second;
    }
    return cookieStr;
}
InstagramProfile InstagramFetcher::fetch(const std::string& username, 
                                        const std::map<std::string, std::string>& cookies) {
    InstagramProfile profile;
    profile.username = username;
    std::map<std::string, std::string> useCookies = cookies.empty() ? default_cookies : cookies;
    std::string url = "https://www.instagram.com/api/v1/users/web_profile_info/?username=" + username;
    CURL* curl = curl_easy_init();
    if (!curl) {
        profile.error = "Failed to initialize curl";
        return profile;
    }
    std::string response_data;
    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, 
        "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36");
    headers = curl_slist_append(headers, "Accept: */*");
    headers = curl_slist_append(headers, "X-IG-App-ID: 936619743392459");
    headers = curl_slist_append(headers, "X-IG-WWW-Claim: 0");
    std::string csrf_header = "X-CSRFToken: " + useCookies["csrftoken"];
    //headers = curl_slist_append(headers, csrf_header.c_str());
    headers = curl_slist_append(headers, "X-Requested-With: XMLHttpRequest");
    std::string referer = "Referer: https://www.instagram.com/" + username + "/";
    headers = curl_slist_append(headers, referer.c_str());
    std::string cookieString = buildCookieString(useCookies);
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    //curl_easy_setopt(curl, CURLOPT_COOKIE, cookieString.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response_data);
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30L);
    CURLcode res = curl_easy_perform(curl);
    if (res != CURLE_OK) {
        profile.error = "Curl error: " + std::string(curl_easy_strerror(res));
        curl_slist_free_all(headers);
        curl_easy_cleanup(curl);
        return profile;
    }
    long response_code;
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &response_code);
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
    if (response_code == 404) {
        profile.error = "404";
        return profile;
    } else if (response_code != 200) {
        profile.error = std::to_string(response_code);
        return profile;
    }
    try {
        Json::Value jsonResponse;
        Json::Reader reader;
        
        if (!reader.parse(response_data, jsonResponse)) {
            profile.error = "JSON parsing error: " + reader.getFormattedErrorMessages();
            return profile;
        }
        if (jsonResponse.isMember("data") && jsonResponse["data"].isMember("user")) {
            Json::Value userData = jsonResponse["data"]["user"];
            
            profile.username = userData.get("username", "").asString();
            profile.full_name = userData.get("full_name", "").asString();
            profile.bio = userData.get("biography", "").asString();
            profile.is_verified = userData.get("is_verified", false).asBool();
            profile.is_private = userData.get("is_private", false).asBool();
            profile.profile_pic_url = userData.get("profile_pic_url", "").asString();
            if (userData.isMember("edge_followed_by") && userData["edge_followed_by"].isMember("count")) {
                profile.followers = userData["edge_followed_by"]["count"].asInt();
            }
            if (userData.isMember("edge_follow") && userData["edge_follow"].isMember("count")) {
                profile.following = userData["edge_follow"]["count"].asInt();
            }
            if (userData.isMember("edge_owner_to_timeline_media") && 
                userData["edge_owner_to_timeline_media"].isMember("count")) {
                profile.post_count = userData["edge_owner_to_timeline_media"]["count"].asInt();
            }
        } else {
            profile.error = "Invalid JSON response structure";
        }
        
    } catch (const Json::Exception& e) {
        profile.error = "JSON parsing error: " + std::string(e.what());
    }
    
    return profile;
}

void InstagramFetcher::setDefaultCookies(const std::map<std::string, std::string>& cookies) {
    default_cookies = cookies;
}
const std::map<std::string, std::string>& InstagramFetcher::getDefaultCookies() const {
    return default_cookies;
}
Json::Value profileToJson(const InstagramProfile& profile) {
    Json::Value j;
    
    if (!profile.error.empty()) {
        j["error"] = profile.error;
    } else {
        img::download(profile.profile_pic_url);
        j["username"] = profile.username;
        j["full_name"] = profile.full_name;
        j["bio"] = profile.bio;
        j["followers"] = profile.followers;
        j["following"] = profile.following;
        j["is_verified"] = profile.is_verified;
        j["post_count"] = profile.post_count;
        j["profile_pic_url"] = "/pfp.jpg";
        j["is_private"] = profile.is_private;
    }
    
    return j;
}