/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: AccountAnalyzer.cc
 */

// #include <iostream>
// #include <vector>
// #include <map>
// #include <string>
// #include <algorithm>
// #include <cmath>
// #include <random>
// #include <regex>
// #include <unordered_map>
// #include <set>
// #include <numeric>
// #include <sstream>
// #include <memory>
#include "analyzer.hh"

using namespace SocialMediaAnalysis;

ProfileValue::ProfileValue() : type_(STRING), str_val_(""), int_val_(0), double_val_(0.0), bool_val_(false) {}
ProfileValue::ProfileValue(const std::string& val) : type_(STRING), str_val_(val), int_val_(0), double_val_(0.0), bool_val_(false) {}
ProfileValue::ProfileValue(int val) : type_(INTEGER), str_val_(""), int_val_(val), double_val_(0.0), bool_val_(false) {}
ProfileValue::ProfileValue(double val) : type_(DOUBLE), str_val_(""), int_val_(0), double_val_(val), bool_val_(false) {}
ProfileValue::ProfileValue(bool val) : type_(BOOLEAN), str_val_(""), int_val_(0), double_val_(0.0), bool_val_(val) {}

std::string ProfileValue::asString() const { 
    if (type_ == STRING) return str_val_;
    if (type_ == INTEGER) return std::to_string(int_val_);
    if (type_ == DOUBLE) return std::to_string(double_val_);
    if (type_ == BOOLEAN) return bool_val_ ? "true" : "false";
    return "";
}

int ProfileValue::asInt() const {
    if (type_ == INTEGER) return int_val_;
    if (type_ == STRING) return std::stoi(str_val_);
    if (type_ == DOUBLE) return static_cast<int>(double_val_);
    if (type_ == BOOLEAN) return bool_val_ ? 1 : 0;
    return 0;
}

double ProfileValue::asDouble() const {
    if (type_ == DOUBLE) return double_val_;
    if (type_ == INTEGER) return static_cast<double>(int_val_);
    if (type_ == STRING) return std::stod(str_val_);
    if (type_ == BOOLEAN) return bool_val_ ? 1.0 : 0.0;
    return 0.0;
}

bool ProfileValue::asBool() const {
    if (type_ == BOOLEAN) return bool_val_;
    if (type_ == INTEGER) return int_val_ != 0;
    if (type_ == DOUBLE) return double_val_ != 0.0;
    if (type_ == STRING) return !str_val_.empty();
    return false;
}
using ProfileData = std::map<std::string, ProfileValue>;

StandardScaler::StandardScaler() : fitted_(false) {}

void StandardScaler::fit(const std::vector<std::vector<double>>& X) {
    if (X.empty() || X[0].empty()) return;
    size_t n_samples = X.size();
        size_t n_features = X[0].size();        
        mean_.resize(n_features, 0.0);
        scale_.resize(n_features, 0.0);
        for (size_t j = 0; j < n_features; ++j) {
            double sum = 0.0;
            for (size_t i = 0; i < n_samples; ++i) {
                sum += X[i][j];
            }
            mean_[j] = sum / n_samples;
        }
        for (size_t j = 0; j < n_features; ++j) {
            double sum_sq = 0.0;
            for (size_t i = 0; i < n_samples; ++i) {
                double diff = X[i][j] - mean_[j];
                sum_sq += diff * diff;
            }
            scale_[j] = std::sqrt(sum_sq / n_samples);
            if (scale_[j] == 0.0) scale_[j] = 1.0;  // Prevent division by zero
        }
        
        fitted_ = true;
    }

std::vector<std::vector<double>> StandardScaler::transform(const std::vector<std::vector<double>>& X) {
    if (!fitted_) {
        throw std::runtime_error("Scaler must be fitted before transform");
    }
    
    std::vector<std::vector<double>> result;
    result.reserve(X.size());
    
    for (const auto& row : X) {
        std::vector<double> transformed_row;
        transformed_row.reserve(row.size());
        
        for (size_t j = 0; j < row.size(); ++j) {
            transformed_row.push_back((row[j] - mean_[j]) / scale_[j]);
        }
        result.push_back(transformed_row);
    }
    
    return result;
}

std::vector<std::vector<double>> StandardScaler::fitTransform(const std::vector<std::vector<double>>& X) {
    fit(X);
    return transform(X);
}
std::unique_ptr<IsolationTree> IsolationForest::buildIsolationTree(
    const std::vector<std::vector<double>>& X,
    size_t height,
    size_t max_height) {
    if (max_height == 0) {
        max_height = static_cast<size_t>(std::ceil(std::log2(X.size())));
    }
    
    auto tree = std::make_unique<IsolationTree>();
    
    if (height >= max_height || X.size() <= 1) {
        tree->type = IsolationTree::LEAF;
        tree->size = X.size();
        return tree;
    }
    
    // Random feature and split point
    size_t n_features = X[0].size();
    std::uniform_int_distribution<size_t> feature_dist(0, n_features - 1);
    size_t feature_idx = feature_dist(rng_);
    
    std::vector<double> feature_values;
    for (const auto& sample : X) {
        feature_values.push_back(sample[feature_idx]);
    }
    
    auto [min_val, max_val] = std::minmax_element(feature_values.begin(), feature_values.end());
    if (*min_val == *max_val) {
        tree->type = IsolationTree::LEAF;
        tree->size = X.size();
        return tree;
    }
    
    std::uniform_real_distribution<double> split_dist(*min_val, *max_val);
    double split_point = split_dist(rng_);
    
    std::vector<std::vector<double>> left_data, right_data;
    for (const auto& sample : X) {
        if (sample[feature_idx] < split_point) {
            left_data.push_back(sample);
        } else {
            right_data.push_back(sample);
        }
    }
    
    tree->type = IsolationTree::NODE;
    tree->feature = feature_idx;
    tree->split = split_point;
    tree->left = buildIsolationTree(left_data, height + 1, max_height);
    tree->right = buildIsolationTree(right_data, height + 1, max_height);
    
    return tree;
}

double IsolationForest::pathLength(const std::vector<double>& x, const IsolationTree* tree, size_t current_height) const {
    if (tree->type == IsolationTree::LEAF) {
        if (tree->size <= 1) {
            return static_cast<double>(current_height);
        }
        return current_height + 2.0 * (std::log(tree->size - 1) + 0.5772156649) - (2.0 * (tree->size - 1) / tree->size);
        }
        
        if (x[tree->feature] < tree->split) {
            return pathLength(x, tree->left.get(), current_height + 1);
        } else {
            return pathLength(x, tree->right.get(), current_height + 1);
        }
    }

IsolationForest::IsolationForest(int n_estimators, double contamination, int random_state)
    : n_estimators_(n_estimators), contamination_(contamination), random_state_(random_state),
        score_threshold_(0.0), rng_(random_state >= 0 ? random_state : std::random_device{}()) {}

void IsolationForest::fit(const std::vector<std::vector<double>>& X) {
    size_t n_samples = X.size();
    
    trees_.clear();
    trees_.reserve(n_estimators_);
    
    for (int i = 0; i < n_estimators_; ++i) {
        size_t sample_size = std::min(static_cast<size_t>(256), n_samples);
        std::vector<std::vector<double>> sample_data;
        sample_data.reserve(sample_size);
        
        std::uniform_int_distribution<size_t> sample_dist(0, n_samples - 1);
        std::set<size_t> used_indices;
        
        while (sample_data.size() < sample_size && used_indices.size() < n_samples) {
            size_t idx = sample_dist(rng_);
            if (used_indices.find(idx) == used_indices.end()) {
                used_indices.insert(idx);
                sample_data.push_back(X[idx]);
            }
        }
        
        trees_.push_back(buildIsolationTree(sample_data));
    }
    
    // Calculate threshold
    std::vector<double> scores = decisionFunction(X);
    std::sort(scores.begin(), scores.end());
    size_t threshold_idx = static_cast<size_t>((1.0 - contamination_) * scores.size());
    score_threshold_ = scores[std::min(threshold_idx, scores.size() - 1)];
}

std::vector<double> IsolationForest::decisionFunction(const std::vector<std::vector<double>>& X) const {
    std::vector<double> scores;
    scores.reserve(X.size());
    
    for (const auto& x : X) {
        std::vector<double> path_lengths;
        path_lengths.reserve(trees_.size());
        
        for (const auto& tree : trees_) {
            path_lengths.push_back(pathLength(x, tree.get()));
        }
        
        double avg_path_length = std::accumulate(path_lengths.begin(), path_lengths.end(), 0.0) / path_lengths.size();
        
        // Normalize score
        double n = 256.0;  // Sample size used in training
        double c = 2.0 * (std::log(n - 1) + 0.5772156649) - (2.0 * (n - 1) / n);
        double score = std::pow(2.0, -avg_path_length / c);
        scores.push_back(-score);  // Negative because higher path length = more normal
    }
    
    return scores;
}

std::vector<int> IsolationForest::predict(const std::vector<std::vector<double>>& X) const {
    std::vector<double> scores = decisionFunction(X);
    std::vector<int> predictions;
    predictions.reserve(scores.size());
    
    for (double score : scores) {
        predictions.push_back(score < score_threshold_ ? -1 : 1);
    }
    
    return predictions;
}
double DBSCAN::euclideanDistance(const std::vector<double>& p1, const std::vector<double>& p2) const {
    double sum = 0.0;
    for (size_t i = 0; i < p1.size(); ++i) {
        double diff = p1[i] - p2[i];
        sum += diff * diff;
    }
    return std::sqrt(sum);
}

std::vector<size_t> DBSCAN::getNeighbors(const std::vector<std::vector<double>>& X, size_t point_idx) const {
    std::vector<size_t> neighbors;
    for (size_t i = 0; i < X.size(); ++i) {
        if (euclideanDistance(X[point_idx], X[i]) <= eps_) {
            neighbors.push_back(i);
        }
    }
    return neighbors;
}
DBSCAN::DBSCAN(double eps, size_t min_samples) : eps_(eps), min_samples_(min_samples) {}

void DBSCAN::fit(const std::vector<std::vector<double>>& X) {
    size_t n_points = X.size();
    labels_.assign(n_points, -1);  // -1 means noise
    int cluster_id = 0;
    
    for (size_t point_idx = 0; point_idx < n_points; ++point_idx) {
        if (labels_[point_idx] != -1) continue;  // Already processed
        
        std::vector<size_t> neighbors = getNeighbors(X, point_idx);
        
        if (neighbors.size() < min_samples_) {
            labels_[point_idx] = -1;  // Mark as noise
        } else {
            labels_[point_idx] = cluster_id;
            
            std::vector<size_t> seed_set = neighbors;
            for (size_t i = 0; i < seed_set.size(); ++i) {
                size_t neighbor_idx = seed_set[i];
                
                if (labels_[neighbor_idx] == -1) {  // Was noise
                    labels_[neighbor_idx] = cluster_id;
                } else if (labels_[neighbor_idx] == -1) {  // Unprocessed
                    labels_[neighbor_idx] = cluster_id;
                    std::vector<size_t> new_neighbors = getNeighbors(X, neighbor_idx);
                    if (new_neighbors.size() >= min_samples_) {
                        seed_set.insert(seed_set.end(), new_neighbors.begin(), new_neighbors.end());
                    }
                }
            }
            
            cluster_id++;
        }
    }
}

const std::vector<int>& DBSCAN::getLabels() const { return labels_; }
SuspiciousPatterns::SuspiciousPatterns() {
    bot_usernames.emplace_back(R"(.*\d{4,}$)");
    bot_usernames.emplace_back(R"(^[a-z]+\d+[a-z]*\d+$)");
    bot_usernames.emplace_back(R"(.*bot.*)");
    bot_usernames.emplace_back(R"(.*fake.*)");
    bot_usernames.emplace_back(R"(^user\d+$)");
    spam_keywords = {
        "free money", "click here", "guaranteed", "limited time", "buy now",
        "follow back", "f4f", "l4l", "follow for follow", "instant followers",
        "get rich", "earn money", "work from home", "make money fast",
        "cryptocurrency", "bitcoin investment", "trading signals"
    };
    fake_profile_indicators = {
        "official fan", "fan page", "unofficial", "parody account",
        "not affiliated", "fake account", "test account"
    };
}


std::string SocialMediaAnalyzer::toLowerCase(const std::string& str) const {
    std::string result = str;
    std::transform(result.begin(), result.end(), result.begin(), ::tolower);
    return result;
}

std::vector<std::string> SocialMediaAnalyzer::split(const std::string& str, char delimiter) const {
    std::vector<std::string> tokens;
    std::stringstream ss(str);
    std::string token;
    while (std::getline(ss, token, delimiter)) {
        if (!token.empty()) {
            tokens.push_back(token);
        }
    }
    return tokens;
}

double SocialMediaAnalyzer::calculateAccountAgeScore(const ProfileData& profile_data) const {
    int followers = profile_data.count("followers_count") ? profile_data.at("followers_count").asInt() : 0;
    int estimated_age_months = profile_data.count("account_age") ? profile_data.at("account_age").asInt() : 12;
    
    if (estimated_age_months < 3 && followers > 1000) {
        return 0.2;
    } else if (estimated_age_months < 6 && followers > 5000) {
        return 0.3;
    } else {
        return std::min(1.0, static_cast<double>(estimated_age_months) / 12.0);
    }
}

double SocialMediaAnalyzer::calculateActivityConsistencyScore(const ProfileData& profile_data) const {
    int posts_count = profile_data.count("posts_count") ? profile_data.at("posts_count").asInt() : 0;
    int followers = profile_data.count("followers_count") ? profile_data.at("followers_count").asInt() : 0;
    int following = profile_data.count("following_count") ? profile_data.at("following_count").asInt() : 0;
    
    double activity_ratio = static_cast<double>(posts_count) / std::max(1, followers + following);
    if (activity_ratio >= 0.01 && activity_ratio <= 0.1) {
        return 0.9;
    } else if (activity_ratio > 1) {
        return 0.3;
    } else {
        return 0.6;
    }
}

double SocialMediaAnalyzer::calculateNetworkAuthenticityScore(const ProfileData& profile_data) const {
    int followers = profile_data.count("followers_count") ? profile_data.at("followers_count").asInt() : 0;
    int following = profile_data.count("following_count") ? profile_data.at("following_count").asInt() : 0;
    
    double ratio = following == 0 ? static_cast<double>(followers) : static_cast<double>(followers) / following;
    
    double base_score;
    if (ratio >= 0.1 && ratio <= 10) {
        base_score = 0.8;
    } else if (ratio > 10 && ratio <= 100) {
        base_score = 0.6;
    } else if (ratio > 1000 || ratio < 0.01) {
        base_score = 0.2;
    } else {
        base_score = 0.4;
    }
    
    if (followers < 10 && following > 1000) {
        return 0.1;
    } else if (followers > 100000 && following < 100) {
        bool is_verified = profile_data.count("is_verified") ? profile_data.at("is_verified").asBool() : false;
        return is_verified ? 0.9 : 0.4;
    }
    
    return base_score;
}

double SocialMediaAnalyzer::calculateContentQualityScore(const ProfileData& profile_data) const {
    std::string bio = profile_data.count("bio") ? profile_data.at("bio").asString() : "";
    std::string profile_name = profile_data.count("profile_name") ? profile_data.at("profile_name").asString() : "";
    
    double score = 0.5;
    if (bio.length() > 50) {
        score += 0.2;
    } else if (bio.length() < 10) {
        score -= 0.3;
    }
    std::string bio_lower = toLowerCase(bio);
    int spam_count = 0;
    for (const auto& keyword : suspicious_patterns_.spam_keywords) {
        if (bio_lower.find(keyword) != std::string::npos) {
            spam_count++;
        }
    }
    score -= spam_count * 0.15;
    bool is_all_upper = std::all_of(profile_name.begin(), profile_name.end(), ::isupper);
    if (is_all_upper && profile_name.length() > 5) {
        score -= 0.2;
    }
    std::regex url_regex(R"(http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+)");
    auto urls_begin = std::sregex_iterator(bio.begin(), bio.end(), url_regex);
    auto urls_end = std::sregex_iterator();
    int url_count = std::distance(urls_begin, urls_end);
    
    if (url_count > 2) {
        score -= 0.2;
    } else if (url_count == 1) {
        score += 0.1;
    }
    
    return std::max(0.0, std::min(1.0, score));
}

double SocialMediaAnalyzer::calculateBehavioralAnomalyScore(const ProfileData& profile_data) const {
    int posts_count = profile_data.count("posts_count") ? profile_data.at("posts_count").asInt() : 0;
    
    double score = 0.5;
    
    int post_freq_days = profile_data.count("post_frequency_days") ? profile_data.at("post_frequency_days").asInt() : 365;
    if (post_freq_days < 7 && posts_count > 100) {
        score -= 0.3;
    } else if (post_freq_days >= 30 && post_freq_days <= 180) {
        score += 0.2;
    }
    
    return std::max(0.0, std::min(1.0, score));
}

double SocialMediaAnalyzer::calculateUsernameEntropyScore(const ProfileData& profile_data) const {
    std::string username = profile_data.count("username") ? profile_data.at("username").asString() : "";
    if (username.empty()) return 0.0;
    std::unordered_map<char, int> char_counts;
    std::string username_lower = toLowerCase(username);
    
    for (char c : username_lower) {
        char_counts[c]++;
    }
    
    double entropy = 0.0;
    for (const auto& pair : char_counts) {
        double prob = static_cast<double>(pair.second) / username.length();
        if (prob > 0) {
            entropy -= prob * std::log2(prob);
        }
    }
    double max_entropy = std::log2(std::min(static_cast<size_t>(username.length()), static_cast<size_t>(26)));
    double normalized_entropy = max_entropy > 0 ? entropy / max_entropy : 0.0;
    double pattern_score = 1.0;
    for (const auto& pattern : suspicious_patterns_.bot_usernames) {
        if (std::regex_match(username_lower, pattern)) {
            pattern_score -= 0.3;
        }
    }
    
    return std::max(0.0, std::min(1.0, normalized_entropy * pattern_score));
}

double SocialMediaAnalyzer::calculateBioAuthenticityScore(const ProfileData& profile_data) const {
    std::string bio = profile_data.count("bio") ? profile_data.at("bio").asString() : "";
    if (bio.empty()) return 0.3;
    
    double score = 0.5;
    if (bio.length() >= 20 && bio.length() <= 150) {
        score += 0.2;
    } else if (bio.length() > 150) {
        score += 0.1;
    } else {
        score -= 0.2;
    }
    std::vector<std::string> words = split(bio);
    if (words.size() > 5) {
        double total_length = 0.0;
        for (const auto& word : words) {
            total_length += word.length();
        }
        double avg_word_length = total_length / words.size();
        if (avg_word_length >= 4 && avg_word_length <= 7) {
            score += 0.2;
        }
    }
    std::string bio_lower = toLowerCase(bio);
    int fake_indicators = 0;
    for (const auto& indicator : suspicious_patterns_.fake_profile_indicators) {
        if (bio_lower.find(indicator) != std::string::npos) {
            fake_indicators++;
        }
    }
    score -= fake_indicators * 0.3;
    std::regex emoji_regex(R"([\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF])");
    auto emojis_begin = std::sregex_iterator(bio.begin(), bio.end(), emoji_regex);
    auto emojis_end = std::sregex_iterator();
    int emoji_count = std::distance(emojis_begin, emojis_end);
    
    if (emoji_count >= 1 && emoji_count <= 5) {
        score += 0.1;
    } else if (emoji_count > 10) {
        score -= 0.2;
    }
    
    return std::max(0.0, std::min(1.0, score));
}

double SocialMediaAnalyzer::calculateEngagementPatternScore(const ProfileData& profile_data) const {
    int followers = profile_data.count("followers_count") ? profile_data.at("followers_count").asInt() : 0;
    int posts_count = profile_data.count("posts_count") ? profile_data.at("posts_count").asInt() : 0;
    
    double score;
    if (followers == 0) {
        score = 0.2;
    } else {
        double ratio = static_cast<double>(posts_count) / std::max(1, followers);
        if (ratio >= 0.01 && ratio <= 0.1) {
            score = 0.8;
        } else if (ratio > 1) {
            score = 0.3;
        } else {
            score = 0.5;
        }
    }
    
    return std::max(0.0, std::min(1.0, score));
}

std::map<std::string, double> SocialMediaAnalyzer::extractFeatures(const ProfileData& profile_data) const {
    std::map<std::string, double> features;
    
    features["account_age_score"] = calculateAccountAgeScore(profile_data);
    features["activity_consistency_score"] = calculateActivityConsistencyScore(profile_data);
    features["network_authenticity_score"] = calculateNetworkAuthenticityScore(profile_data);
    features["content_quality_score"] = calculateContentQualityScore(profile_data);
    features["behavioral_anomaly_score"] = calculateBehavioralAnomalyScore(profile_data);
    features["username_entropy_score"] = calculateUsernameEntropyScore(profile_data);
    features["bio_authenticity_score"] = calculateBioAuthenticityScore(profile_data);
    features["engagement_pattern_score"] = calculateEngagementPatternScore(profile_data);
    
    return features;
}

void SocialMediaAnalyzer::trainModels() {
    // Training data
    std::vector<ProfileData> training_data = {
        // Authentic accounts
        {
            {"profile_name", ProfileValue("John Smith")},
            {"username", ProfileValue("johnsmith")},
            {"bio", ProfileValue("Software developer at Google. Love hiking and photography.")},
            {"followers_count", ProfileValue(850)},
            {"following_count", ProfileValue(420)},
            {"posts_count", ProfileValue(120)},
            {"avg_likes_per_post", ProfileValue(25)},
            {"avg_comments_per_post", ProfileValue(3)},
            {"post_frequency_days", ProfileValue(180)},
            {"is_verified", ProfileValue(false)},
            {"is_fake", ProfileValue(0)}
        },
        {
            {"profile_name", ProfileValue("Sarah Wilson")},
            {"username", ProfileValue("sarah_wilson_art")},
            {"bio", ProfileValue("Artist & designer 🎨 Check out my portfolio: https://sarahwilson.com")},
            {"followers_count", ProfileValue(2100)},
            {"following_count", ProfileValue(650)},
            {"posts_count", ProfileValue(180)},
            {"avg_likes_per_post", ProfileValue(45)},
            {"avg_comments_per_post", ProfileValue(8)},
            {"post_frequency_days", ProfileValue(120)},
            {"is_verified", ProfileValue(true)},
            {"is_fake", ProfileValue(0)}
        },
        // Bot/Fake accounts
        {
            {"profile_name", ProfileValue("USER12345")},
            {"username", ProfileValue("user_bot_12345")},
            {"bio", ProfileValue("Follow for follow! Get free followers now!")},
            {"followers_count", ProfileValue(50)},
            {"following_count", ProfileValue(3000)},
            {"posts_count", ProfileValue(500)},
            {"avg_likes_per_post", ProfileValue(2)},
            {"avg_comments_per_post", ProfileValue(0)},
            {"post_frequency_days", ProfileValue(5)},
            {"is_verified", ProfileValue(false)},
            {"is_fake", ProfileValue(1)}
        },
        {
            {"profile_name", ProfileValue("CRYPTO SIGNALS")},
            {"username", ProfileValue("crypto_signals_777")},
            {"bio", ProfileValue("Guaranteed 100% profit! Click here: http://scam.com 💰💰💰")},
            {"followers_count", ProfileValue(5000)},
            {"following_count", ProfileValue(10)},
            {"posts_count", ProfileValue(1000)},
            {"avg_likes_per_post", ProfileValue(1000)},
            {"avg_comments_per_post", ProfileValue(0)},
            {"post_frequency_days", ProfileValue(1)},
            {"is_verified", ProfileValue(false)},
            {"is_fake", ProfileValue(1)}
        },
        {
            {"profile_name", ProfileValue("Mike Johnson")},
            {"username", ProfileValue("mike_j_photo")},
            {"bio", ProfileValue("Wedding photographer based in NYC 📸 DM for bookings")},
            {"followers_count", ProfileValue(1200)},
            {"following_count", ProfileValue(800)},
            {"posts_count", ProfileValue(95)},
            {"avg_likes_per_post", ProfileValue(35)},
            {"avg_comments_per_post", ProfileValue(5)},
            {"post_frequency_days", ProfileValue(200)},
            {"is_verified", ProfileValue(false)},
            {"is_fake", ProfileValue(0)}
        },
        {
            {"profile_name", ProfileValue("botuser999")},
            {"username", ProfileValue("auto_follow_bot_999")},
            {"bio", ProfileValue("I follow back everyone! F4F L4L")},
            {"followers_count", ProfileValue(100)},
            {"following_count", ProfileValue(5000)},
            {"posts_count", ProfileValue(10)},
            {"avg_likes_per_post", ProfileValue(0)},
            {"avg_comments_per_post", ProfileValue(0)},
            {"post_frequency_days", ProfileValue(1)},
            {"is_verified", ProfileValue(false)},
            {"is_fake", ProfileValue(1)}
        }
    };
    std::vector<std::vector<double>> X;
    std::vector<int> y;
    
    for (const auto& profile : training_data) {
        auto features_map = extractFeatures(profile);
        std::vector<double> feature_vector;
        
        for (const auto& feature_name : features_) {
            feature_vector.push_back(features_map[feature_name]);
        }
        
        X.push_back(feature_vector);
        y.push_back(profile.at("is_fake").asInt());
    }
    auto X_scaled = scaler_.fitTransform(X);
    isolation_forest_ = std::make_unique<IsolationForest>(100, 0.3, 42);
    isolation_forest_->fit(X_scaled);
    dbscan_ = std::make_unique<DBSCAN>(0.5, 2);
    dbscan_->fit(X_scaled);
}

SocialMediaAnalyzer::SocialMediaAnalyzer() {
    features_ = {
        "account_age_score",
        "activity_consistency_score",
        "network_authenticity_score",
        "content_quality_score",
        "behavioral_anomaly_score",
        "username_entropy_score",
        "bio_authenticity_score",
        "engagement_pattern_score"
    };
    
    trainModels();
}

SocialMediaAnalyzer::AnalysisResult SocialMediaAnalyzer::analyzeProfile(const ProfileData& profile_data) {
    auto features_map = extractFeatures(profile_data);
    std::vector<std::vector<double>> features_matrix;
    std::vector<double> feature_vector;
    
    for (const auto& feature_name : features_) {
        feature_vector.push_back(features_map[feature_name]);
    }
    features_matrix.push_back(feature_vector);
    auto X_scaled = scaler_.transform(features_matrix);
    auto isolation_scores = isolation_forest_->decisionFunction(X_scaled);
    auto anomaly_predictions = isolation_forest_->predict(X_scaled);
    
    double isolation_score = isolation_scores[0];
    bool is_anomaly = anomaly_predictions[0] == -1;
    double sum = 0.0;
    for (const auto& feature_name : features_) {
        sum += features_map[feature_name];
    }
    double authenticity_score = sum / features_.size();
    double fake_probability = 1.0 - authenticity_score;
    if (is_anomaly) {
        fake_probability = std::min(1.0, fake_probability + 0.2);
    }
    std::map<std::string, std::string> analysis_details;
    
    if (features_map["account_age_score"] < 0.3) {
        analysis_details["account_age"] = "Potentially new account with suspicious activity patterns";
    }
    
    if (features_map["network_authenticity_score"] < 0.4) {
        analysis_details["network"] = "Unusual follower/following ratio indicates potential bot behavior";
    }
    
    if (features_map["content_quality_score"] < 0.3) {
        analysis_details["content"] = "Poor content quality with spam indicators";
    }
    
    if (features_map["behavioral_anomaly_score"] < 0.3) {
        analysis_details["behavior"] = "Anomalous behavioral patterns detected";
    }
    
    if (features_map["username_entropy_score"] < 0.4) {
        analysis_details["username"] = "Username follows bot-like patterns";
    }
    
    if (features_map["engagement_pattern_score"] < 0.3) {
        analysis_details["engagement"] = "Suspicious engagement patterns";
    }
    
    if (is_anomaly) {
        analysis_details["anomaly"] = "Profile characteristics are anomalous compared to typical accounts";
    }
    
    std::string risk_level;
    if (fake_probability > 0.8) {
        risk_level = "HIGH";
    } else if (fake_probability > 0.4) {
        risk_level = "MEDIUM";
    } else {
        risk_level = "LOW";
    }
    
    return AnalysisResult{
        fake_probability > 0.6,
        fake_probability,
        authenticity_score,
        std::abs(fake_probability - 0.5) * 2.0, 
        features_map,
        analysis_details,
        risk_level
    };
}

std::vector<SocialMediaAnalyzer::AnalysisResult> SocialMediaAnalyzer::batchAnalyze(const std::vector<ProfileData>& profiles_list) {
    std::vector<SocialMediaAnalyzer::AnalysisResult> results;
    results.reserve(profiles_list.size());
    
    for (const auto& profile : profiles_list) {
        results.push_back(analyzeProfile(profile));
    }
    
    return results;
}