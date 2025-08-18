"""
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: AccountAnalyzer.py
"""

import pandas as pd
import re
import numpy as np
from collections import Counter
import hashlib
from datetime import datetime, timedelta
import math

class StandardScaler:
    """Custom implementation of StandardScaler"""
    def __init__(self):
        self.mean_ = None
        self.scale_ = None
        self.fitted = False
    
    def fit(self, X):
        X = np.array(X)
        self.mean_ = np.mean(X, axis=0)
        self.scale_ = np.std(X, axis=0)
        # Prevent division by zero
        self.scale_ = np.where(self.scale_ == 0, 1, self.scale_)
        self.fitted = True
        return self
    
    def transform(self, X):
        if not self.fitted:
            raise ValueError("Scaler must be fitted before transform")
        X = np.array(X)
        return (X - self.mean_) / self.scale_
    
    def fit_transform(self, X):
        return self.fit(X).transform(X)

class IsolationForest:
    """Custom implementation of Isolation Forest"""
    def __init__(self, n_estimators=100, contamination=0.1, random_state=None):
        self.n_estimators = n_estimators
        self.contamination = contamination
        self.random_state = random_state
        self.trees = []
        self.score_threshold = None
        
    def _isolation_tree(self, X, height=0, max_height=None):
        """Build a single isolation tree"""
        if max_height is None:
            max_height = int(np.ceil(np.log2(len(X))))
        
        if height >= max_height or len(X) <= 1:
            return {'type': 'leaf', 'size': len(X)}
        
        # Random feature and split point
        n_features = X.shape[1]
        feature_idx = np.random.randint(0, n_features)
        feature_values = X[:, feature_idx]
        
        if len(np.unique(feature_values)) == 1:
            return {'type': 'leaf', 'size': len(X)}
        
        min_val, max_val = np.min(feature_values), np.max(feature_values)
        split_point = np.random.uniform(min_val, max_val)
        
        left_mask = feature_values < split_point
        right_mask = ~left_mask
        
        return {
            'type': 'node',
            'feature': feature_idx,
            'split': split_point,
            'left': self._isolation_tree(X[left_mask], height + 1, max_height),
            'right': self._isolation_tree(X[right_mask], height + 1, max_height)
        }
    
    def _path_length(self, x, tree, current_height=0):
        """Calculate path length for a single point"""
        if tree['type'] == 'leaf':
            # Average path length of unsuccessful search in BST
            if tree['size'] <= 1:
                return current_height
            return current_height + 2 * (np.log(tree['size'] - 1) + 0.5772156649) - (2 * (tree['size'] - 1) / tree['size'])
        
        if x[tree['feature']] < tree['split']:
            return self._path_length(x, tree['left'], current_height + 1)
        else:
            return self._path_length(x, tree['right'], current_height + 1)
    
    def fit(self, X):
        """Fit the isolation forest"""
        if self.random_state is not None:
            np.random.seed(self.random_state)
        
        X = np.array(X)
        n_samples = len(X)
        
        # Build trees
        self.trees = []
        for _ in range(self.n_estimators):
            # Sample subset of data
            sample_size = min(256, n_samples)
            sample_indices = np.random.choice(n_samples, sample_size, replace=False)
            sample_data = X[sample_indices]
            
            tree = self._isolation_tree(sample_data)
            self.trees.append(tree)
        
        # Calculate scores for threshold
        scores = self.decision_function(X)
        self.score_threshold = np.percentile(scores, (1 - self.contamination) * 100)
        
        return self
    
    def decision_function(self, X):
        """Calculate anomaly scores"""
        X = np.array(X)
        scores = []
        
        for x in X:
            path_lengths = [self._path_length(x, tree) for tree in self.trees]
            avg_path_length = np.mean(path_lengths)
            
            # Normalize score
            n = 256  # Sample size used in training
            c = 2 * (np.log(n - 1) + 0.5772156649) - (2 * (n - 1) / n)
            score = 2 ** (-avg_path_length / c)
            scores.append(-score)  # Negative because higher path length = more normal
        
        return np.array(scores)
    
    def predict(self, X):
        """Predict anomalies"""
        scores = self.decision_function(X)
        return np.where(scores < self.score_threshold, -1, 1)

class DBSCAN:
    """Custom implementation of DBSCAN clustering"""
    def __init__(self, eps=0.5, min_samples=5):
        self.eps = eps
        self.min_samples = min_samples
        self.labels_ = None
        
    def _euclidean_distance(self, point1, point2):
        """Calculate Euclidean distance between two points"""
        return np.sqrt(np.sum((point1 - point2) ** 2))
    
    def _get_neighbors(self, X, point_idx):
        """Get all neighbors within eps distance"""
        neighbors = []
        for i, point in enumerate(X):
            if self._euclidean_distance(X[point_idx], point) <= self.eps:
                neighbors.append(i)
        return neighbors
    
    def fit(self, X):
        """Fit DBSCAN clustering"""
        X = np.array(X)
        n_points = len(X)
        labels = [-1] * n_points  # -1 means noise
        cluster_id = 0
        
        for point_idx in range(n_points):
            if labels[point_idx] != -1:  # Already processed
                continue
                
            neighbors = self._get_neighbors(X, point_idx)
            
            if len(neighbors) < self.min_samples:
                labels[point_idx] = -1  # Mark as noise
            else:
                # Start new cluster
                labels[point_idx] = cluster_id
                
                # Expand cluster
                seed_set = neighbors[:]
                for neighbor_idx in seed_set:
                    if labels[neighbor_idx] == -1:  # Was noise
                        labels[neighbor_idx] = cluster_id
                    elif labels[neighbor_idx] == -1:  # Unprocessed
                        labels[neighbor_idx] = cluster_id
                        new_neighbors = self._get_neighbors(X, neighbor_idx)
                        if len(new_neighbors) >= self.min_samples:
                            seed_set.extend(new_neighbors)
                
                cluster_id += 1
        
        self.labels_ = np.array(labels)
        return self

class SocialMediaAnalyzer:
    def __init__(self):
        self.scaler = StandardScaler()
        self.isolation_forest = None
        self.dbscan = None
        self.suspicious_patterns = self._load_suspicious_patterns()
        self.features = [
            'account_age_score',
            'activity_consistency_score',
            'network_authenticity_score',
            'content_quality_score',
            'behavioral_anomaly_score',
            'username_entropy_score',
            'bio_authenticity_score',
            'engagement_pattern_score'
        ]
        self._train_models()

    def _load_suspicious_patterns(self):
        return {
            'bot_usernames': [
                r'.*\d{4,}$',  
                r'^[a-z]+\d+[a-z]*\d+$', 
                r'.*bot.*',
                r'.*fake.*',
                r'^user\d+$',  
            ],
            'spam_keywords': [
                'free money', 'click here', 'guaranteed', 'limited time', 'buy now',
                'follow back', 'f4f', 'l4l', 'follow for follow', 'instant followers',
                'get rich', 'earn money', 'work from home', 'make money fast',
                'cryptocurrency', 'bitcoin investment', 'trading signals'
            ],
            'fake_profile_indicators': [
                'official fan', 'fan page', 'unofficial', 'parody account',
                'not affiliated', 'fake account', 'test account'
            ]
        }

    def _calculate_account_age_score(self, profile_data):
        """Score based on account creation date and activity patterns"""
        # Simulated account age (in real implementation, use actual creation date)
        followers = int(profile_data.get('followers_count', 0))
        if 'account_age' in profile_data:
            #Format = month_number/year
            estimated_age_months = int(profile_data['account_age'])
        else:
            estimated_age_months = 12  # Default to 12 months if no creation date is provided
            
        # Newer accounts with high followers are suspicious
        if estimated_age_months < 3 and followers > 1000:
            return 0.2
        elif estimated_age_months < 6 and followers > 5000:
            return 0.3
        else:
            return min(1.0, estimated_age_months / 12)

    def _calculate_activity_consistency_score(self, profile_data):
        """Analyze posting patterns for bot-like behavior"""
        posts_count = int(profile_data.get('posts_count', 0))
        followers = int(profile_data.get('followers_count', 0))
        following = int(profile_data.get('following_count', 0))
        # High posting frequency with low engagement is suspicious
        
        # Balanced activity is more authentic
        activity_ratio = posts_count / max(1, followers + following)
        if 0.01 <= activity_ratio <= 0.1:
            return 0.9
        elif activity_ratio > 1:
            return 0.3
        else:
            return 0.6

    def _calculate_network_authenticity_score(self, profile_data):
        """Advanced network analysis"""
        followers = int(profile_data.get('followers_count', 0))
        following = int(profile_data.get('following_count', 0))
        
        if following == 0:
            ratio = followers
        else:
            ratio = followers / following
        
        # Authentic accounts typically have balanced ratios
        if 0.1 <= ratio <= 10:
            base_score = 0.8
        elif 10 < ratio <= 100:
            base_score = 0.6
        elif ratio > 1000 or ratio < 0.01:
            base_score = 0.2
        else:
            base_score = 0.4
        
        # Adjust based on absolute numbers
        if followers < 10 and following > 1000:
            return 0.1  # Classic bot pattern
        elif followers > 100000 and following < 100:
            return 0.9 if profile_data.get('is_verified') else 0.4
        
        return base_score

    def _calculate_content_quality_score(self, profile_data):
        """Analyze content quality indicators"""
        bio = profile_data.get('bio', '')
        profile_name = profile_data.get('profile_name', '')
        
        score = 0.5  # Base score
        
        # Bio analysis
        if len(bio) > 50:
            score += 0.2
        elif len(bio) < 10:
            score -= 0.3
        
        # Check for spam keywords
        bio_lower = bio.lower()
        spam_count = sum(1 for keyword in self.suspicious_patterns['spam_keywords'] 
                        if keyword in bio_lower)
        score -= spam_count * 0.15
        
        # Profile name analysis
        if profile_name.isupper() and len(profile_name) > 5:
            score -= 0.2
        
        # URL analysis
        urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', bio)
        if len(urls) > 2:
            score -= 0.2
        elif len(urls) == 1:
            score += 0.1
        
        return max(0.0, min(1.0, score))

    def _calculate_behavioral_anomaly_score(self, profile_data):
        """Detect anomalous behavioral patterns"""
        posts_count = int(profile_data.get('posts_count', 0))
        
        score = 0.5
        
        # Post frequency analysis
        post_freq_days = int(profile_data.get('post_frequency_days', 365))
        if post_freq_days < 7 and posts_count > 100:
            score -= 0.3  # Too frequent posting
        elif 30 <= post_freq_days <= 180:
            score += 0.2  # Normal frequency
        
        return max(0.0, min(1.0, score))

    def _calculate_username_entropy_score(self, profile_data):
        """Calculate entropy of username to detect generated names"""
        username = profile_data.get('username', '')
        if not username:
            return 0.0
        
        # Calculate character frequency entropy
        char_counts = Counter(username.lower())
        entropy = 0
        for count in char_counts.values():
            prob = count / len(username)
            if prob > 0:
                entropy -= prob * np.log2(prob)
        
        # Normalize entropy (max entropy for username length)
        max_entropy = np.log2(min(len(username), 26))  # 26 letters max
        normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0
        
        # Check for suspicious patterns
        pattern_score = 1.0
        for pattern in self.suspicious_patterns['bot_usernames']:
            if re.match(pattern, username.lower()):
                pattern_score -= 0.3
        
        return max(0.0, min(1.0, normalized_entropy * pattern_score))

    def _calculate_bio_authenticity_score(self, profile_data):
        """Advanced bio authenticity analysis"""
        bio = profile_data.get('bio', '')
        if not bio:
            return 0.3
        
        score = 0.5
        
        # Length analysis
        if 20 <= len(bio) <= 150:
            score += 0.2
        elif len(bio) > 150:
            score += 0.1
        else:
            score -= 0.2
        
        # Language complexity (simple heuristic)
        words = bio.split()
        if len(words) > 5:
            avg_word_length = np.mean([len(word) for word in words])
            if 4 <= avg_word_length <= 7:
                score += 0.2
        
        # Check for fake profile indicators
        bio_lower = bio.lower()
        fake_indicators = sum(1 for indicator in self.suspicious_patterns['fake_profile_indicators']
                             if indicator in bio_lower)
        score -= fake_indicators * 0.3
        
        # Emoji analysis (moderate use is normal)
        emoji_count = len(re.findall(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]', bio))
        if 1 <= emoji_count <= 5:
            score += 0.1
        elif emoji_count > 10:
            score -= 0.2
        
        return max(0.0, min(1.0, score))

    def _calculate_engagement_pattern_score(self, profile_data):
        """Analyze engagement patterns for authenticity"""
        followers = int(profile_data.get('followers_count', 0))
        posts_count = int(profile_data.get('posts_count', 0))

        if followers == 0:
            score = 0.2
        else:
            # Engagement pattern based only on followers and post count
            ratio = posts_count / max(1, followers)
            if 0.01 <= ratio <= 0.1:
                score = 0.8  # Normal engagement
            elif ratio > 1:
                score = 0.3  # Too many posts for follower count
            else:
                score = 0.5  # Moderate

        # No other metrics used
        
        return max(0.0, min(1.0, score))

    def _extract_features(self, profile_data):
        """Extract all features for analysis"""
        features = {}
        
        features['account_age_score'] = self._calculate_account_age_score(profile_data)
        features['activity_consistency_score'] = self._calculate_activity_consistency_score(profile_data)
        features['network_authenticity_score'] = self._calculate_network_authenticity_score(profile_data)
        features['content_quality_score'] = self._calculate_content_quality_score(profile_data)
        features['behavioral_anomaly_score'] = self._calculate_behavioral_anomaly_score(profile_data)
        features['username_entropy_score'] = self._calculate_username_entropy_score(profile_data)
        features['bio_authenticity_score'] = self._calculate_bio_authenticity_score(profile_data)
        features['engagement_pattern_score'] = self._calculate_engagement_pattern_score(profile_data)
        
        return pd.Series(features)

    def _train_models(self):
        """Train anomaly detection models"""
        # Enhanced training data
        training_data = [
            # Authentic accounts
            {'profile_name': 'John Smith', 'username': 'johnsmith', 'bio': 'Software developer at Google. Love hiking and photography.', 
             'followers_count': 850, 'following_count': 420, 'posts_count': 120, 'avg_likes_per_post': 25, 
             'avg_comments_per_post': 3, 'post_frequency_days': 180, 'is_verified': False, 'is_fake': 0},
            
            {'profile_name': 'Sarah Wilson', 'username': 'sarah_wilson_art', 'bio': 'Artist & designer 🎨 Check out my portfolio: https://sarahwilson.com',
             'followers_count': 2100, 'following_count': 650, 'posts_count': 180, 'avg_likes_per_post': 45,
             'avg_comments_per_post': 8, 'post_frequency_days': 120, 'is_verified': True, 'is_fake': 0},
            
            # Bot/Fake accounts
            {'profile_name': 'USER12345', 'username': 'user_bot_12345', 'bio': 'Follow for follow! Get free followers now!',
             'followers_count': 50, 'following_count': 3000, 'posts_count': 500, 'avg_likes_per_post': 2,
             'avg_comments_per_post': 0, 'post_frequency_days': 5, 'is_verified': False, 'is_fake': 1},
            
            {'profile_name': 'CRYPTO SIGNALS', 'username': 'crypto_signals_777', 'bio': 'Guaranteed 100% profit! Click here: http://scam.com 💰💰💰',
             'followers_count': 5000, 'following_count': 10, 'posts_count': 1000, 'avg_likes_per_post': 1000,
             'avg_comments_per_post': 0, 'post_frequency_days': 1, 'is_verified': False, 'is_fake': 1},
            
            # More realistic examples...
            {'profile_name': 'Mike Johnson', 'username': 'mike_j_photo', 'bio': 'Wedding photographer based in NYC 📸 DM for bookings',
             'followers_count': 1200, 'following_count': 800, 'posts_count': 95, 'avg_likes_per_post': 35,
             'avg_comments_per_post': 5, 'post_frequency_days': 200, 'is_verified': False, 'is_fake': 0},
             
            {'profile_name': 'botuser999', 'username': 'auto_follow_bot_999', 'bio': 'I follow back everyone! F4F L4L',
             'followers_count': 100, 'following_count': 5000, 'posts_count': 10, 'avg_likes_per_post': 0,
             'avg_comments_per_post': 0, 'post_frequency_days': 1, 'is_verified': False, 'is_fake': 1}
        ]
        
        df = pd.DataFrame(training_data)
        X = df.apply(self._extract_features, axis=1)
        y = df['is_fake']
        
        # Normalize features
        X_scaled = self.scaler.fit_transform(X[self.features])
        
        # Train Isolation Forest for anomaly detection
        self.isolation_forest = IsolationForest(contamination=0.3, random_state=42)
        self.isolation_forest.fit(X_scaled)
        
        # Train DBSCAN for clustering
        self.dbscan = DBSCAN(eps=0.5, min_samples=2)
        self.dbscan.fit(X_scaled)

    def analyze_profile(self, profile_data):
        """Main analysis function"""
        # Extract features
        features_series = self._extract_features(profile_data)
        features_df = pd.DataFrame([features_series])
        
        # Scale features
        X_scaled = self.scaler.transform(features_df[self.features])
        
        # Get anomaly scores
        isolation_score = self.isolation_forest.decision_function(X_scaled)[0]
        is_anomaly = self.isolation_forest.predict(X_scaled)[0] == -1
        
        # Calculate composite authenticity score
        feature_scores = features_series[self.features]
        authenticity_score = np.mean(feature_scores)
        
        # Combine scores for final prediction
        fake_probability = 1 - authenticity_score
        
        # Adjust based on isolation forest
        if is_anomaly:
            fake_probability = min(1.0, fake_probability + 0.2)
        
        # Generate detailed analysis
        analysis_details = {}
        
        if feature_scores['account_age_score'] < 0.3:
            analysis_details['account_age'] = 'Potentially new account with suspicious activity patterns'
        
        if feature_scores['network_authenticity_score'] < 0.4:
            analysis_details['network'] = 'Unusual follower/following ratio indicates potential bot behavior'
        
        if feature_scores['content_quality_score'] < 0.3:
            analysis_details['content'] = 'Poor content quality with spam indicators'
        
        if feature_scores['behavioral_anomaly_score'] < 0.3:
            analysis_details['behavior'] = 'Anomalous behavioral patterns detected'
        
        if feature_scores['username_entropy_score'] < 0.4:
            analysis_details['username'] = 'Username follows bot-like patterns'
        
        if feature_scores['engagement_pattern_score'] < 0.3:
            analysis_details['engagement'] = 'Suspicious engagement patterns'
        
        if is_anomaly:
            analysis_details['anomaly'] = 'Profile characteristics are anomalous compared to typical accounts'
        
        return {
            'is_fake': bool(fake_probability > 0.6),
            'fake_probability': float(fake_probability),
            'authenticity_score': float(authenticity_score),
            'confidence': float(abs(fake_probability - 0.5) * 2),  # How confident we are
            'feature_scores': {k: float(v) for k, v in feature_scores.items()},
            'analysis_details': analysis_details,
            'risk_level': 'HIGH' if fake_probability > 0.8 else 'MEDIUM' if fake_probability > 0.4 else 'LOW'
        }

    def batch_analyze(self, profiles_list):
        """Analyze multiple profiles efficiently"""
        results = []
        for profile in profiles_list:
            result = self.analyze_profile(profile)
            results.append(result)
        return results
