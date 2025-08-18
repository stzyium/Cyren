/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: analyzer.hh
 */

#ifndef SOCIAL_MEDIA_ANALYZER_HH
#define SOCIAL_MEDIA_ANALYZER_HH

#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <algorithm>
#include <cmath>
#include <random>
#include <regex>
#include <unordered_map>
#include <set>
#include <numeric>
#include <sstream>
#include <memory>

namespace SocialMediaAnalysis {
    class ProfileValue {
    public:
        enum Type { STRING, INTEGER, DOUBLE, BOOLEAN };
        
    private:
        Type type_;
        std::string str_val_;
        int int_val_;
        double double_val_;
        bool bool_val_;
        
    public:
        // Constructors
        ProfileValue();
        ProfileValue(const std::string& val);
        ProfileValue(int val);
        ProfileValue(double val);
        ProfileValue(bool val);
        
        // Type conversion methods
        std::string asString() const;
        int asInt() const;
        double asDouble() const;
        bool asBool() const;
        
        // Type checking
        Type getType() const { return type_; }
    };

    using ProfileData = std::map<std::string, ProfileValue>;
    class StandardScaler {
    private:
        std::vector<double> mean_;
        std::vector<double> scale_;
        bool fitted_;
        
    public:
        StandardScaler();
        void fit(const std::vector<std::vector<double>>& X);
        std::vector<std::vector<double>> transform(const std::vector<std::vector<double>>& X);
        std::vector<std::vector<double>> fitTransform(const std::vector<std::vector<double>>& X);
        
        bool isFitted() const { return fitted_; }
    };
    struct IsolationTree {
        enum NodeType { LEAF, NODE };
        
        NodeType type;
        size_t feature;
        double split;
        size_t size;
        std::unique_ptr<IsolationTree> left;
        std::unique_ptr<IsolationTree> right;
        
        IsolationTree() : type(LEAF), feature(0), split(0.0), size(0) {}
    };
    class IsolationForest {
    private:
        int n_estimators_;
        double contamination_;
        int random_state_;
        std::vector<std::unique_ptr<IsolationTree>> trees_;
        double score_threshold_;
        std::mt19937 rng_;
        
        std::unique_ptr<IsolationTree> buildIsolationTree(
            const std::vector<std::vector<double>>& X,
            size_t height = 0,
            size_t max_height = 0);
        
        double pathLength(const std::vector<double>& x, const IsolationTree* tree, size_t current_height = 0) const;
    public:
        IsolationForest(int n_estimators = 100, double contamination = 0.1, int random_state = -1);
        void fit(const std::vector<std::vector<double>>& X);
        std::vector<double> decisionFunction(const std::vector<std::vector<double>>& X) const;
        std::vector<int> predict(const std::vector<std::vector<double>>& X) const;
    };
    class DBSCAN {
    private:
        double eps_;
        size_t min_samples_;
        std::vector<int> labels_;
        double euclideanDistance(const std::vector<double>& p1, const std::vector<double>& p2) const;
        std::vector<size_t> getNeighbors(const std::vector<std::vector<double>>& X, size_t point_idx) const;
        
    public:
        DBSCAN(double eps = 0.5, size_t min_samples = 5);
        void fit(const std::vector<std::vector<double>>& X);
        const std::vector<int>& getLabels() const;
    };
    struct SuspiciousPatterns {
        std::vector<std::regex> bot_usernames;
        std::vector<std::string> spam_keywords;
        std::vector<std::string> fake_profile_indicators;
        
        SuspiciousPatterns();
    };
    class SocialMediaAnalyzer {
    public:
        struct AnalysisResult {
            bool is_fake;                                           ///< Final fake account determination
            double fake_probability;                                ///< Probability of being fake (0-1)
            double authenticity_score;                             ///< Overall authenticity score (0-1)
            double confidence;                                      ///< Confidence in the prediction (0-1)
            std::map<std::string, double> features_map;          ///< Individual feature 
            std::map<std::string, std::string> analysis_details;   ///< Detailed analysis explanations
            std::string risk_level;                                ///< Risk level: "LOW", "MEDIUM", "HIGH"
        };

    private:
        StandardScaler scaler_;
        std::unique_ptr<IsolationForest> isolation_forest_;
        std::unique_ptr<DBSCAN> dbscan_;
        SuspiciousPatterns suspicious_patterns_;
        std::vector<std::string> features_;
        std::string toLowerCase(const std::string& str) const;
        std::vector<std::string> split(const std::string& str, char delimiter = ' ') const;
        double calculateAccountAgeScore(const ProfileData& profile_data) const;
        double calculateActivityConsistencyScore(const ProfileData& profile_data) const;
        double calculateNetworkAuthenticityScore(const ProfileData& profile_data) const;
        double calculateContentQualityScore(const ProfileData& profile_data) const;
        double calculateBehavioralAnomalyScore(const ProfileData& profile_data) const;
        double calculateUsernameEntropyScore(const ProfileData& profile_data) const;
        double calculateBioAuthenticityScore(const ProfileData& profile_data) const;
        double calculateEngagementPatternScore(const ProfileData& profile_data) const;
        std::map<std::string, double> extractFeatures(const ProfileData& profile_data) const;
        void trainModels();
        
    public:
        SocialMediaAnalyzer();
        ~SocialMediaAnalyzer() = default;
        SocialMediaAnalyzer(const SocialMediaAnalyzer&) = delete;
        SocialMediaAnalyzer& operator=(const SocialMediaAnalyzer&) = delete;
        SocialMediaAnalyzer(SocialMediaAnalyzer&&) = default;
        SocialMediaAnalyzer& operator=(SocialMediaAnalyzer&&) = default;
        AnalysisResult analyzeProfile(const ProfileData& profile_data);
        std::vector<AnalysisResult> batchAnalyze(const std::vector<ProfileData>& profiles_list);
        const std::vector<std::string>& getFeatureNames() const { return features_; }
        bool isReady() const { return isolation_forest_ != nullptr && scaler_.isFitted(); }
    };
    ProfileData createProfile(
        const std::string& profile_name,
        const std::string& username,
        const std::string& bio,
        int followers_count,
        int following_count,
        int posts_count,
        bool is_verified = false,
        int account_age_months = 12
    );
    void printAnalysisResult(const SocialMediaAnalyzer::AnalysisResult& result, bool show_details = true);
    std::string getRiskLevelColor(const std::string& risk_level);

} // namespace SocialMediaAnalysis

#endif // SOCIAL_MEDIA_ANALYZER_HH