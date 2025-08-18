/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: profile.hh
 */

#ifndef INSTAGRAM_FETCHER_H
#define INSTAGRAM_FETCHER_H
#ifndef CURL_STATICLIB
#define CURL_STATICLIB
#endif

#include <string>
#include <map>
#include <json/json.h>
#include <curl/curl.h>
#include <vector>
#include <iostream>
#include <sstream>
#include <unordered_map>

namespace img {
    inline std::vector<unsigned char> imageData;
    inline size_t WriteToVector(void* ptr, size_t size, size_t nmemb, void* userdata) {
        std::vector<unsigned char>* buffer = reinterpret_cast<std::vector<unsigned char>*>(userdata);
        size_t totalSize = size * nmemb;
        buffer->insert(buffer->end(), (unsigned char*)ptr, (unsigned char*)ptr + totalSize);
        return totalSize;
    }
    inline void download(const std::string& url) {
        imageData.clear();
        CURL* curl = curl_easy_init();
        if (!curl) {
            std::cerr << "Failed to initialize curl\n";
            return;
        }

        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteToVector);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &imageData);
        curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L);

        CURLcode res = curl_easy_perform(curl);
        if (res != CURLE_OK) {
            std::cerr << "Curl error: " << curl_easy_strerror(res) << std::endl;
            imageData.clear();
        }

        curl_easy_cleanup(curl);
    }
    inline const std::vector<unsigned char>& get() {
        return imageData;
    }

}
struct InstagramProfile {
    std::string username;
    std::string full_name;
    std::string bio;
    int followers;
    int following;
    bool is_verified;
    int post_count;
    std::string profile_pic_url;
    bool is_private;
    std::string error;
    InstagramProfile() : followers(0), following(0), is_verified(false), 
                        post_count(0), is_private(false) {}
};
class InstagramFetcher {
private:
    std::map<std::string, std::string> default_cookies;
    std::string buildCookieString(const std::map<std::string, std::string>& cookies);

public:
    InstagramFetcher();
    InstagramProfile fetch(const std::string& username, 
                          const std::map<std::string, std::string>& cookies = {});
    void setDefaultCookies(const std::map<std::string, std::string>& cookies);
    const std::map<std::string, std::string>& getDefaultCookies() const;
};
Json::Value profileToJson(const InstagramProfile& profile);


#endif