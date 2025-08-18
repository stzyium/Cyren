/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: _server.cc
 */


#include "_server.h"

template <typename T>
static Json::Value mapToJson(const std::map<std::string, T>& m) {
    Json::Value json;
    for (const auto& [key, value] : m) {
        json[key] = value;
    }
    return json;
}

CyrenApp::CyrenApp() {
    DB_PATH = "./CyrensDatabase.db";
    curl_global_init(CURL_GLOBAL_DEFAULT);
}

CyrenApp::~CyrenApp() {
    if (db) {
        sqlite3_close(db);
        db = nullptr;
    }
    curl_global_cleanup();
}

size_t CyrenApp::WriteCallback(void* contents, size_t size, size_t nmemb, CyrenApp::HTTPResponse* response) {
    size_t total_size = size * nmemb;
    response->data.append((char*)contents, total_size);
    return total_size;
}

void CyrenApp::initDB() {
    int rc = sqlite3_open(DB_PATH.c_str(), &db);
    if (rc != SQLITE_OK) {
        std::cerr << "Can't open database: " << sqlite3_errmsg(db) << std::endl;
        sqlite3_close(db);
        db = nullptr;
        return;
    }
    
    const char* create_chats = R"(
        CREATE TABLE IF NOT EXISTS chats (
            id TEXT PRIMARY KEY,
            title TEXT,
            timestamp TEXT
        );
    )";
    
    const char* create_messages = R"(
        CREATE TABLE IF NOT EXISTS messages (
            chat_id TEXT,
            prompt TEXT,
            response TEXT,
            timestamp TEXT,
            FOREIGN KEY(chat_id) REFERENCES chats(id)
        );
    )";
    
    const char* create_vault = R"(
        CREATE TABLE IF NOT EXISTS vault (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            password TEXT,
            description TEXT,
            timestamp TEXT
        );
    )";
    
    const char* create_localstorage = R"(
        CREATE TABLE IF NOT EXISTS localstorage (
            key TEXT PRIMARY KEY,
            value TEXT
        );
    )";
    
    char* errMsg = 0;
    
    if (sqlite3_exec(db, create_chats, 0, 0, &errMsg) != SQLITE_OK) {
        std::cerr << "SQL error: " << errMsg << std::endl;
        sqlite3_free(errMsg);
    }
    if (sqlite3_exec(db, create_messages, 0, 0, &errMsg) != SQLITE_OK) {
        std::cerr << "SQL error: " << errMsg << std::endl;
        sqlite3_free(errMsg);
    }
    if (sqlite3_exec(db, create_vault, 0, 0, &errMsg) != SQLITE_OK) {
        std::cerr << "SQL error: " << errMsg << std::endl;
        sqlite3_free(errMsg);
    }
    if (sqlite3_exec(db, create_localstorage, 0, 0, &errMsg) != SQLITE_OK) {
        std::cerr << "SQL error: " << errMsg << std::endl;
        sqlite3_free(errMsg);
    }
    
    const char* insert_default_pass = "INSERT OR IGNORE INTO localstorage (key, value) VALUES ('vault_password', 'admin123');";
    if (sqlite3_exec(db, insert_default_pass, 0, 0, &errMsg) != SQLITE_OK) {
        std::cerr << "SQL error: " << errMsg << std::endl;
        sqlite3_free(errMsg);
    }
}

std::string CyrenApp::generateUUID() {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(0, 15);
    
    const char* chars = "0123456789abcdef";
    std::string uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    
    for (auto& c : uuid) {
        if (c == 'x') {
            c = chars[dis(gen)];
        } else if (c == 'y') {
            c = chars[(dis(gen) & 0x3) | 0x8];
        }
    }
    return uuid;
}

std::string CyrenApp::getCurrentTimestamp() {
    auto now = std::chrono::system_clock::now();
    auto time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::gmtime(&time_t), "%Y-%m-%dT%H:%M:%SZ");
    return ss.str();
}

Json::Value CyrenApp::execSQL(const std::string& sql, const std::vector<std::string>& params) {
    Json::Value result(Json::arrayValue);
    sqlite3_stmt* stmt = nullptr;
    sqlite3_stmt* t = nullptr;
    int rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::cerr << "SQL prepare error: " << sqlite3_errmsg(db) << " - SQL: " << sql << std::endl;
        return result;
    }
    
    if (!stmt) {
        std::cerr << "Failed to prepare statement" << std::endl;
        return result;
    }
    
    for (size_t i = 0; i < params.size(); ++i) {
        rc = sqlite3_bind_text(stmt, static_cast<int>(i + 1), params[i].c_str(), -1, SQLITE_TRANSIENT);
        if (rc != SQLITE_OK) {
            std::cerr << "SQL bind error: " << sqlite3_errmsg(db) << " - Param " << i << ": " << params[i] << std::endl;
            sqlite3_finalize(stmt);
            return result;
        }
    }
    
    while ((rc = sqlite3_step(stmt)) == SQLITE_ROW) {
        Json::Value row;
        int cols = sqlite3_column_count(stmt);
        
        for (int i = 0; i < cols; ++i) {
            const char* col_name = sqlite3_column_name(stmt, i);
            const unsigned char* col_value = sqlite3_column_text(stmt, i);
            row[col_name] = col_value ? reinterpret_cast<const char*>(col_value) : "";
        }
        result.append(row);
    }
    
    if (rc != SQLITE_DONE && rc != SQLITE_ROW) {
        std::cerr << "SQL step error: " << sqlite3_errmsg(db) << std::endl;
    }
    
    sqlite3_finalize(stmt);
    return result;
}

Json::Value CyrenApp::execSQL(const std::string& sql) {
    return execSQL(sql, std::vector<std::string>());
}

std::string CyrenApp::httpGet(const std::string& url, const std::vector<std::pair<std::string, std::string>>& headers) {
    CURL* curl;
    CURLcode res;
    HTTPResponse response;
    
    curl = curl_easy_init();
    if (!curl) {
        std::cerr << "Failed to initialize curl" << std::endl;
        return "";
    }
    
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30L);
    curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 10L);
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L);
    curl_easy_setopt(curl, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
    
    struct curl_slist* header_list = nullptr;
    for (const auto& header : headers) {
        std::string header_str = header.first + ": " + header.second;
        header_list = curl_slist_append(header_list, header_str.c_str());
    }
    if (header_list) {
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, header_list);
    }
    
    res = curl_easy_perform(curl);
    
    long response_code = 0;
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &response_code);
    
    if (res != CURLE_OK) {
        std::cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << std::endl;
    }
    
    if (header_list) curl_slist_free_all(header_list);
    curl_easy_cleanup(curl);
    
    return response.data;
}

std::string CyrenApp::genAIResponse(const std::string& message, const std::string& chat_id) {
    std::string prompt = R"(
You are Cyren, a friendly, knowledgeable AI trained in cybersecurity and digital safety.

Your job is to:
produce output in formatted text, use markdown
Help users understand suspicious messages, emails, websites, or apps.
Warn about common scams, phishing, and unsafe links.
Provide safe online habits, password tips, and privacy recommendations.
NEVER assist with hacking, bypassing security, or anything unethical or illegal.
Stay up-to-date with cyber threats and explain them in simple terms.
Format responses clearly and with practical steps. If unsure about something, encourage users to stay cautious and report it to a professional.

user: )" + message;
    Json::Value history = execSQL("SELECT prompt, response FROM messages WHERE chat_id = ? LIMIT 4", {chat_id});
    std::string uuid = generateUUID();
    std::string chat_uuid = generateUUID();
    
    std::string url = "https://you.com/api/streamingSearch?";
    url += std::string("q=") + curl_easy_escape(nullptr, prompt.c_str(), 0);
    url += "&page=1&count=10&safeSearch=On";
    url += "&chatId=" + chat_uuid;
    url += "&onShoppingPage=false";
    url += "&pastChatLength=" + std::to_string(history.size());
    url += "&mkt=&responseFilter=WebPages,Translations,TimeZone,Computation,RelatedSearches";
    url += "&domain=youchat";
    url += "&queryTraceId=" + uuid;
    
    std::vector<std::pair<std::string, std::string>> headers = {
        {"cache-control", "no-cache"},
        {"referer", "https://you.com/search?q=gpt4&tbm=youchat"},
        {"cookie", "safesearch_guest=Off; uuid_guest=" + generateUUID()}
    };
    
    std::string response = httpGet(url, headers);
    std::regex token_regex("\\{\"youChatToken\": \"(.*?)\"\\}");

    std::smatch matches;
    std::string result;
    
    std::string::const_iterator searchStart(response.cbegin());
    while (std::regex_search(searchStart, response.cend(), matches, token_regex)) {
        result += matches[1];
        searchStart = matches.suffix().first;
    }
    result = std::regex_replace(result, std::regex("\\\\n"), "\n");
    result = std::regex_replace(result, std::regex("\\\\\\\\"), "\\");
    result = std::regex_replace(result, std::regex("\\\\\""), "\"");
    return "C++ implementation of this application is unable to fetch the response from the AI service. Please try again with the python implementation.";
    return result.empty() ? "Unable to fetch response." : result;
}

static std::string formatNumber(long long n) {
    if (n >= 1000000000) {
        return std::to_string(n / 1000000000) + "B";
    } else if (n >= 1000000) {
        return std::to_string(n / 1000000) + "M";
    } else if (n >= 1000) {
        return std::to_string(n / 1000) + "K";
    }
    return std::to_string(n);
}

static long long unformatNumber(const std::string& s) {
    std::string lower_s = s;
    std::transform(lower_s.begin(), lower_s.end(), lower_s.begin(), ::tolower);
    
    if (lower_s.back() == 'b') {
        return static_cast<long long>(std::stod(lower_s.substr(0, lower_s.length()-1)) * 1000000000);
    } else if (lower_s.back() == 'm') {
        return static_cast<long long>(std::stod(lower_s.substr(0, lower_s.length()-1)) * 1000000);
    } else if (lower_s.back() == 'k') {
        return static_cast<long long>(std::stod(lower_s.substr(0, lower_s.length()-1)) * 1000);
    }
    return std::stoll(lower_s);
}

static std::string __sha1(const std::string& input) {
    unsigned char hash[SHA_DIGEST_LENGTH];
    SHA1(reinterpret_cast<const unsigned char*>(input.c_str()), input.size(), hash);
    std::stringstream ss;
    ss << std::uppercase << std::hex << std::setfill('0');
    for (int i = 0; i < SHA_DIGEST_LENGTH; ++i) {
        ss << std::setw(2) << (int)hash[i];
    }
    return ss.str();
}
void CyrenApp::setupRoutes(crow::SimpleApp& app) {
    CROW_ROUTE(app, "/api/<path>").methods("OPTIONS"_method)
    ([](const crow::request& req, const std::string& path) {
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return res;
    });
    
    CROW_ROUTE(app, "/api/vault").methods("GET"_method)
    ([this](const crow::request& req) {
        Json::Value items = execSQL("SELECT * FROM vault ORDER BY timestamp DESC");
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        Json::StreamWriterBuilder builder;
        res.body = Json::writeString(builder, items);
        return res;
    });
    
    CROW_ROUTE(app, "/api/vault").methods("POST"_method)
    ([this](const crow::request& req) {
        Json::Value json_data;
        Json::CharReaderBuilder builder;
        std::string errors;
        std::istringstream stream(req.body);
        
        if (!Json::parseFromStream(builder, stream, &json_data, &errors)) {
            crow::response res(400);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Invalid JSON\"}";
            return res;
        }
        
        std::string name = json_data.get("name", "").asString();
        std::string password = json_data.get("password", "").asString();
        std::string description = json_data.get("description", "").asString();
        std::string timestamp = getCurrentTimestamp();
        
        execSQL("INSERT INTO vault (name, password, description, timestamp) VALUES (?, ?, ?, ?)",
                {name, password, description, timestamp});
        
        Json::Value response_data;
        response_data["name"] = name;
        response_data["password"] = password;
        response_data["description"] = description;
        response_data["timestamp"] = timestamp;
        
        crow::response res(201);
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        Json::StreamWriterBuilder response_builder;
        res.body = Json::writeString(response_builder, response_data);
        return res;
    });
    
    CROW_ROUTE(app, "/api/vault/<string>").methods("DELETE"_method)
    ([this](const crow::request& req, const std::string& item_id) {
        execSQL("DELETE FROM vault WHERE id = ?", {item_id});
        crow::response res(204);
        res.add_header("Access-Control-Allow-Origin", "*");
        return res;
    });
    
    CROW_ROUTE(app, "/api/vault/<string>").methods("PUT"_method)
    ([this](const crow::request& req, const std::string& item_id) {
        Json::Value json_data;
        Json::CharReaderBuilder builder;
        std::string errors;
        std::istringstream stream(req.body);
        
        if (!Json::parseFromStream(builder, stream, &json_data, &errors)) {
            crow::response res(400);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Invalid JSON\"}";
            return res;
        }
        
        std::string name = json_data.get("name", "").asString();
        std::string password = json_data.get("password", "").asString();
        std::string description = json_data.get("description", "").asString();
        std::string timestamp = getCurrentTimestamp();
        
        execSQL("UPDATE vault SET name = ?, password = ?, description = ?, timestamp = ? WHERE id = ?",
                {name, password, description, timestamp, item_id});
        
        Json::Value response_data;
        response_data["id"] = item_id;
        response_data["name"] = name;
        response_data["password"] = password;
        response_data["description"] = description;
        response_data["timestamp"] = timestamp;
        
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        Json::StreamWriterBuilder response_builder;
        res.body = Json::writeString(response_builder, response_data);
        return res;
    });
    
    CROW_ROUTE(app, "/api/vault/auth").methods("POST"_method)
    ([this](const crow::request& req) {
        Json::Value json_data;
        Json::CharReaderBuilder builder;
        std::string errors;
        std::istringstream stream(req.body);
        
        if (!Json::parseFromStream(builder, stream, &json_data, &errors)) {
            crow::response res(400);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Invalid JSON\"}";
            return res;
        }
        
        std::string password = json_data.get("password", "").asString();
        if (password.empty()) {
            crow::response res(400);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Password is required\"}";
            return res;
        }
        
        Json::Value stored_pass = execSQL("SELECT value FROM localstorage WHERE key = ?", {"vault_password"});
        
        if (stored_pass.empty() || stored_pass[0]["value"].asString() != password) {
            crow::response res(401);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Invalid password\"}";
            return res;
        }
        
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        res.body = "{\"message\": \"Authenticated successfully\"}";
        return res;
    });
    
    CROW_ROUTE(app, "/api/vault/auth").methods("PUT"_method)
    ([this](const crow::request& req) {
        Json::Value json_data;
        Json::CharReaderBuilder builder;
        std::string errors;
        std::istringstream stream(req.body);
        
        if (!Json::parseFromStream(builder, stream, &json_data, &errors)) {
            crow::response res(400);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Invalid JSON\"}";
            return res;
        }
        
        std::string password = json_data.get("password", "").asString();
        if (password.empty()) {
            crow::response res(400);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Password is required\"}";
            return res;
        }
        
        execSQL("UPDATE localstorage SET value = ? WHERE key = ?", {password, "vault_password"});
        
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        res.body = "{\"message\": \"Password updated successfully\"}";
        return res;
    });
    
    CROW_ROUTE(app, "/api/chats/history").methods("GET"_method)
    ([this](const crow::request& req) {
        Json::Value chats = execSQL("SELECT * FROM chats ORDER BY timestamp DESC");
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        Json::StreamWriterBuilder builder;
        res.body = Json::writeString(builder, chats);
        return res;
    });
    
    CROW_ROUTE(app, "/api/chats/<string>").methods("GET"_method)
    ([this](const crow::request& req, const std::string& chat_id) {
        Json::Value messages = execSQL("SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC", {chat_id});
        Json::Value chat_exists = execSQL("SELECT * FROM chats WHERE id = ?", {chat_id});
        
        if (chat_exists.empty()) {
            crow::response res(404);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Chat not found\"}";
            return res;
        }
        
        Json::Value result;
        result["id"] = chat_id;
        result["messages"] = Json::Value(Json::arrayValue);
        
        for (const auto& msg : messages) {
            Json::Value user_msg;
            user_msg["role"] = "user";
            user_msg["content"] = msg["prompt"];
            user_msg["timestamp"] = msg["timestamp"];
            result["messages"].append(user_msg);
            
            Json::Value assistant_msg;
            assistant_msg["role"] = "assistant";
            assistant_msg["content"] = msg["response"];
            assistant_msg["timestamp"] = msg["timestamp"];
            result["messages"].append(assistant_msg);
        }
        
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        Json::StreamWriterBuilder builder;
        res.body = Json::writeString(builder, result);
        return res;
    });
    
    CROW_ROUTE(app, "/api/chats").methods("POST"_method)
    ([this](const crow::request& req) {
        Json::Value json_data;
        Json::CharReaderBuilder builder;
        std::string errors;
        std::istringstream stream(req.body);
        
        if (!Json::parseFromStream(builder, stream, &json_data, &errors)) {
            crow::response res(400);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Invalid JSON\"}";
            return res;
        }
        
        std::string chat_id = generateUUID();
        std::string title = json_data.get("title", "New Conversation").asString();
        std::string timestamp = getCurrentTimestamp();
        
        execSQL("INSERT INTO chats (id, title, timestamp) VALUES (?, ?, ?)",
                {chat_id, title, timestamp});
                
        Json::Value response_data;
        response_data["id"] = chat_id;
        response_data["title"] = title;
        response_data["timestamp"] = timestamp;
        response_data["messages"] = Json::Value(Json::arrayValue);
        
        crow::response res(201);
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        Json::StreamWriterBuilder response_builder;
        res.body = Json::writeString(response_builder, response_data);
        return res;
    });
    
    CROW_ROUTE(app, "/api/chats/<string>").methods("DELETE"_method)
    ([this](const crow::request& req, const std::string& chat_id) {
        execSQL("DELETE FROM messages WHERE chat_id = ?", {chat_id});
        execSQL("DELETE FROM chats WHERE id = ?", {chat_id});
        crow::response res(204);
        res.add_header("Access-Control-Allow-Origin", "*");
        return res;
    });
    
    CROW_ROUTE(app, "/api/chats").methods("DELETE"_method)
    ([this](const crow::request& req) {
        execSQL("DELETE FROM messages");
        execSQL("DELETE FROM chats");
        crow::response res(204);
        res.add_header("Access-Control-Allow-Origin", "*");
        return res;
    });
    
    CROW_ROUTE(app, "/api/chats/<string>/rename").methods("PUT"_method)
    ([this](const crow::request& req, const std::string& chat_id) {
        Json::Value json_data;
        Json::CharReaderBuilder builder;
        std::string errors;
        std::istringstream stream(req.body);
        
        if (!Json::parseFromStream(builder, stream, &json_data, &errors)) {
            crow::response res(400);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Invalid JSON\"}";
            return res;
        }
        
        std::string title = json_data.get("title", "").asString();
        execSQL("UPDATE chats SET title = ? WHERE id = ?", {title, chat_id});
        
        Json::Value response_data;
        response_data["id"] = chat_id;
        response_data["title"] = title;
        
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        Json::StreamWriterBuilder response_builder;
        res.body = Json::writeString(response_builder, response_data);
        return res;
    });
    
    CROW_ROUTE(app, "/api/chats/<string>/message").methods("POST"_method)
    ([this](const crow::request& req, const std::string& chat_id) {
        Json::Value json_data;
        Json::CharReaderBuilder builder;
        std::string errors;
        std::istringstream stream(req.body);
        
        if (!Json::parseFromStream(builder, stream, &json_data, &errors)) {
            crow::response res(400);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Invalid JSON\"}";
            return res;
        }
        
        std::string msg_id = generateUUID();
        std::string prompt = json_data.get("prompt", "").asString();
        std::string text = json_data.get("text", "").asString();
        std::string timestamp = getCurrentTimestamp();
        
        execSQL("INSERT INTO messages (chat_id, prompt, response, timestamp) VALUES (?, ?, ?, ?)",
                {chat_id, prompt, text, timestamp});
        execSQL("UPDATE chats SET timestamp = ? WHERE id = ?", {timestamp, chat_id});
        
        Json::Value response_data;
        response_data["id"] = msg_id;
        response_data["user"] = prompt;
        response_data["content"] = text;
        response_data["timestamp"] = timestamp;
        
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        Json::StreamWriterBuilder response_builder;
        res.body = Json::writeString(response_builder, response_data);
        return res;
    });
    
    CROW_ROUTE(app, "/api/chats/<string>/response").methods("POST"_method)
    ([this](const crow::request& req, const std::string& chat_id) {
        Json::Value json_data;
        Json::CharReaderBuilder builder;
        std::string errors;
        std::istringstream stream(req.body);
        
        if (!Json::parseFromStream(builder, stream, &json_data, &errors)) {
            crow::response res(400);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Invalid JSON\"}";
            return res;
        }
        
        std::string message = json_data.get("text", "").asString();
        std::string ai_response = genAIResponse(message, chat_id);
        
        if (ai_response.empty()) {
            crow::response res(500);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Failed to generate response\"}";
            return res;
        }
        
        Json::Value response_data;
        response_data["text"] = ai_response;
        
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        Json::StreamWriterBuilder response_builder;
        res.body = Json::writeString(response_builder, response_data);
        return res;
    });
    
    CROW_ROUTE(app, "/pfp.jpg").methods("GET"_method)
    ([this](const crow::request& req) {
        const std::vector<unsigned char>& data = img::get();
        if (!data.empty()) {
            crow::response res;
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "image/jpeg");
            res.body = std::string(reinterpret_cast<const char*>(data.data()), data.size());
            return res;
        }
        return crow::response(404, "Profile picture not found");
    });

    CROW_ROUTE(app, "/profile/<string>").methods("POST"_method)
    ([&](const crow::request& req, const std::string& username) {
        InstagramFetcher fetcher;
        InstagramProfile profile = fetcher.fetch(username);
        Json::Value profile_json = profileToJson(profile);
        
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        Json::StreamWriterBuilder response_builder;
        res.body = Json::writeString(response_builder, profile_json);
        return res;
    });
    
    CROW_ROUTE(app, "/api/analyze").methods("POST"_method)
    ([&](const crow::request& req) {
        using namespace SocialMediaAnalysis;
        Json::Value json_data;
        Json::CharReaderBuilder builder;
        std::string errors;
        std::istringstream stream(req.body);
        
        if (!Json::parseFromStream(builder, stream, &json_data, &errors)) {
            crow::response res(400);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Invalid JSON\"}";
            return res;
        }
        SocialMediaAnalyzer analyzer;
        ProfileData data = {
            {"profile_name", ProfileValue(json_data.get("profile_name", "").asString())},
            {"username", ProfileValue(json_data.get("username", "").asString())},
            {"bio", ProfileValue(json_data.get("bio", "").asString())},
            {"followers_count", ProfileValue(std::stoi(json_data.get("followers_count", "0").asString()))},
            {"following_count", ProfileValue(std::stoi(json_data.get("following_count", "0").asString()))},
            {"posts_count", ProfileValue(std::stoi(json_data.get("posts_count", "0").asString()))},
            {"avg_likes_per_post", ProfileValue(0)},
            {"avg_comments_per_post", ProfileValue(0)},
            {"post_frequency_days", ProfileValue(30)},
            {"is_verified", ProfileValue(json_data.get("is_verified", false).asBool())},
            {"account_age", ProfileValue(18)}
        };
        
        auto result = analyzer.analyzeProfile(data);
        Json::Value json;
        json["is_fake"] = result.is_fake;
        json["fake_probability"] = result.fake_probability;
        json["authenticity_score"] = result.authenticity_score;
        json["confidence"] = result.confidence;
        json["features_score"] = mapToJson(result.features_map);
        json["analysis_details"] = mapToJson(result.analysis_details);
        json["risk_level"] = result.risk_level;
        
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        Json::StreamWriterBuilder response_builder;
        res.body = Json::writeString(response_builder, json);
        return res;
    });

    CROW_ROUTE(app, "/api/news").methods("GET"_method)
    ([this](const crow::request& req) {
        std::string api_key = "d12fc25b5cfb471e8eaa432333c2eb4c";
        std::string url = "https://newsapi.org/v2/everything?q=cybersecurity%20data%20breach&language=en&sortBy=publishedAt&pageSize=1&apiKey=" + api_key;
        
        std::vector<std::pair<std::string, std::string>> headers = {
            {"User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        };
        
        std::string response_str = httpGet(url, headers);
        
        if (response_str.empty()) {
            Json::Value fallback_news;
            fallback_news["title"] = "Cybersecurity Alert: Stay Updated";
            fallback_news["description"] = "Keep your systems updated and be aware of the latest security threats. Check official cybersecurity sources for current information.";
            fallback_news["link"] = "https://www.cisa.gov";
            fallback_news["publishedAt"] = getCurrentTimestamp();
            fallback_news["imageUrl"] = "";
            fallback_news["source"] = "Cyren Security";
            
            crow::response res;
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            Json::StreamWriterBuilder response_builder;
            res.body = Json::writeString(response_builder, fallback_news);
            return res;
        }
        
        Json::Value json_response;
        Json::CharReaderBuilder builder;
        std::string errors;
        std::istringstream stream(response_str);
        
        if (Json::parseFromStream(builder, stream, &json_response, &errors) && 
            json_response["articles"].isArray() && !json_response["articles"].empty()) {
            
            Json::Value article = json_response["articles"][0];
            Json::Value news;
            news["title"] = article.get("title", "No title found").asString();
            news["description"] = article.get("description", "No description found").asString();
            news["link"] = article.get("url", "No URL found").asString();
            news["publishedAt"] = article.get("publishedAt", getCurrentTimestamp()).asString();
            news["imageUrl"] = article.get("urlToImage", "").asString();
            news["source"] = article["source"].get("name", "Unknown Source").asString();
            
            crow::response res;
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            Json::StreamWriterBuilder response_builder;
            res.body = Json::writeString(response_builder, news);
            return res;
        }
        
        crow::response res(500);
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        res.body = "{\"error\": \"Failed to fetch news\"}";
        return res;
    });
    
    CROW_ROUTE(app, "/api/db/passwd/<string>").methods("POST"_method)
    ([this](const crow::request& req, const std::string& password) {
        if (password.empty()) {
            crow::response res(400);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Password is required\"}";
            return res;
        }
        
        if (password.length() < 8) {
            crow::response res(400);
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "application/json");
            res.body = "{\"error\": \"Password must be at least 8 characters long\"}";
            return res;
        }
        
        std::string hash = __sha1(password);
        std::string prefix = hash.substr(0, 5);
        std::string url = "https://api.pwnedpasswords.com/range/" + prefix;
        std::string response_str = httpGet(url);
        
        int breach_count = 0;
        if (!response_str.empty()) {
            std::string suffix = hash.substr(5);
            std::transform(suffix.begin(), suffix.end(), suffix.begin(), ::toupper);
            
            std::istringstream iss(response_str);
            std::string line;
            while (std::getline(iss, line)) {
                if (line.find(suffix) == 0) {
                    size_t colon_pos = line.find(':');
                    if (colon_pos != std::string::npos) {
                        breach_count = std::stoi(line.substr(colon_pos + 1));
                        break;
                    }
                }
            }
        }
        
        Json::Value response_data;
        response_data["breach_count"] = breach_count;
        response_data["is_breached"] = breach_count > 0;
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        Json::StreamWriterBuilder response_builder;
        res.body = Json::writeString(response_builder, response_data);
        return res;
    });
    
    CROW_ROUTE(app, "/") ([&]() {
        auto it = eFiles.find("index.html");
        if (it != eFiles.end()) {
            crow::response res(
                    std::string(reinterpret_cast<const char*>(it->second.first), it->second.second)
            );
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "text/html");
            return res;
        }
        return crow::response(404, "Index file not found");
    });
    
    CROW_ROUTE(app, "/<path>")([&](const std::string& path) {
        std::string file_path = path.empty() ? "index.html" : path;
        auto it = eFiles.find(file_path);
        
        if (it != eFiles.end()) {
            crow::response res(
                std::string(reinterpret_cast<const char*>(it->second.first), it->second.second)
            );
            res.add_header("Access-Control-Allow-Origin", "*");
            
            if (file_path.ends_with(".css")) res.add_header("Content-Type", "text/css");
            else if (file_path.ends_with(".js")) res.add_header("Content-Type", "application/javascript");
            else if (file_path.ends_with(".html")) res.add_header("Content-Type", "text/html");
            else if (file_path.ends_with(".png")) res.add_header("Content-Type", "image/png");
            else if (file_path.ends_with(".svg")) res.add_header("Content-Type", "image/svg+xml");
            else if (file_path.ends_with(".json")) res.add_header("Content-Type", "application/json");
            else if (file_path.ends_with(".woff") || file_path.ends_with(".woff2")) res.add_header("Content-Type", "font/woff2");
            else if (file_path.ends_with(".ttf")) res.add_header("Content-Type", "font/ttf");
            else if (file_path.ends_with(".ico")) res.add_header("Content-Type", "image/x-icon");
            else if (file_path.ends_with(".webp")) res.add_header("Content-Type", "image/webp");
            else if (file_path.ends_with(".jpg") || file_path.ends_with(".jpeg")) res.add_header("Content-Type", "image/jpeg");
            else if (file_path.ends_with(".gif")) res.add_header("Content-Type", "image/gif");
            else if (file_path.ends_with(".mp4")) res.add_header("Content-Type", "video/mp4");
            else if (file_path.ends_with(".ogg")) res.add_header("Content-Type", "audio/ogg");
            else if (file_path.ends_with(".wav")) res.add_header("Content-Type", "audio/wav");
            else if (file_path.ends_with(".mp3")) res.add_header("Content-Type", "audio/mpeg");
            else if (file_path.ends_with(".webm")) res.add_header("Content-Type", "video/webm");
            else if (file_path.ends_with(".xml")) res.add_header("Content-Type", "application/xml");
            else if (file_path.ends_with(".pdf")) res.add_header("Content-Type", "application/pdf");
            else if (file_path.ends_with(".csv")) res.add_header("Content-Type", "text/csv");
            else if (file_path.ends_with(".txt")) res.add_header("Content-Type", "text/plain");
            else res.add_header("Content-Type", "application/octet-stream");
            
            return res;
        }
        
        auto index_it = eFiles.find("index.html");
        if (index_it != eFiles.end()) {
            crow::response res(
                std::string(reinterpret_cast<const char*>(index_it->second.first), index_it->second.second)
            );
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Content-Type", "text/html");
            return res;
        }
        
        return crow::response(404, "File not found: " + path);
    });
}

void run() {
    crow::SimpleApp app;
    CyrenApp cyren_app;
    cyren_app.initDB();
    cyren_app.setupRoutes(app);
    app.bindaddr("127.0.0.1").port(18080).run();
}