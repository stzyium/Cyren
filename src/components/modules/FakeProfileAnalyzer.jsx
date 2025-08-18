/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: FakeProfileAnalyzer.jsx
 */

import React, { useState } from 'react'
import { Search, Shield, UserX, Users, Eye, AlertTriangle, CheckCircle, XCircle, Globe, Instagram, Twitter, Music, TriangleAlert } from 'lucide-react'
import pfp from '@/assets/logo.png'

const FakeProfileAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('fetch')
  const [fetchData, setFetchData] = useState({
    username: '',
    platform: 'instagram'
  })
  const [profileData, setProfileData] = useState({
    profile_name: '',
    username: '',
    profile_picture_url: '',
    bio: '',
    followers_count: '',
    following_count: '',
    posts_count: '',
    post_frequency_days: '365',
    avg_likes_per_post: '',
    avg_comments_per_post: '',
    is_verified: false
  })
  const [fetchedProfile, setFetchedProfile] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram},
  ]

  const updateFetchData = (field, value) => {
    setFetchData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateProfileData = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const fetchProfile = async () => {
    setIsFetching(true)
    
    try {
      const response = await fetch(`/profile/${fetchData.username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 404 || response.status === 500) {
          setFetchedProfile({ error: data.error || "Unexpected error" });
          return;
        }
        throw new Error(`Unexpected error ${response.status}`);
      }
      const userData = {
        profile_name: `${data.full_name}`,
        username: data.username,
        bio: `${data.bio}`,
        followers_count: `${data.followers}`,
        following_count: `${data.following}`,
        posts_count: `${data.post_count}`,
        profile_pic_url: data.profile_pic_url || pfp,
        is_private: data.is_private,
        is_verified: data.is_verified
      }

      setFetchedProfile(userData)
      setProfileData(prev => ({
        ...prev,
        ...userData
      }))
      
    } catch (error) {
      console.error('Fetch error:', error)
      setFetchedProfile({error: error.message});
    } finally {
      setIsFetching(false)
    }
  }

  const analyzeProfile = async () => {
    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      })
      
      if (!response.ok) {
        throw new Error('Analysis failed')
      }
      
      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      console.error('Analysis error:', error)
      setAnalysisResult({
        error: 'Analysis failed. Please try again later or check your network connection.'
      })
    } finally {
      setIsAnalyzing(false)
      setActiveTab('results')
    }
  }

  const resetForm = () => {
    setProfileData({
      profile_name: '',
      username: '',
      profile_picture_url: '',
      bio: '',
      followers_count: '',
      following_count: '',
      posts_count: '',
      post_frequency_days: '365',
      avg_likes_per_post: '',
      avg_comments_per_post: '',
      is_verified: false
    })
    setFetchedProfile(null)
    setAnalysisResult(null)
  }

  function unformatNumber(str) {
  const s = str.toLowerCase().trim();
  const num = parseFloat(s);

  if (s.endsWith('b')) return num * 1_000_000_000;
  if (s.endsWith('m')) return num * 1_000_000;
  if (s.endsWith('k')) return num * 1_000;
  return num;
  }

  return (
    <div className="min-h-screen">
        <div className="flex max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center glow">
              <UserX className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Social Media Profile Analyzer</h1>
              <p className="text-sm text-gray-500">Advanced AI-powered profile authenticity detection</p>
            </div>
          </div>
        </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6">
        <div className="bg-card border border-border rounded-xl p-6 glass">
          <div className="border-b">
            <nav className="flex space-x-8 px-6 overflow-x-auto scrollbar-hide [::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[
                { id: 'fetch', label: 'Fetch Profile', icon: Search },
                { id: 'analyze', label: 'Manual Analysis', icon: Eye },
                { id: 'results', label: 'Results', icon: analysisResult?.is_fake ? XCircle : CheckCircle },
                { id: 'about', label: 'About', icon: Shield }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`cursor-pointer flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Fetch Profile Tab */}
            {activeTab === 'fetch' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Fetch Profile Information</h2>
                  <p className="text-gray-500">Enter a username to automatically fetch profile data from social media platforms</p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Platform</label>
                    <div className="grid grid-cols-1 gap-1 justify-center items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {platforms.map((platform) => {
                        const Icon = platform.icon
                        return (
                          <button
                            key={platform.id}
                            onClick={() => updateFetchData('platform', platform.id)}
                            className={`cursor-pointer relative items-center justify-center rounded-xl border transition-all ${
                              fetchData.platform === platform.id
                                ? ''
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img src="/instagram.png" alt={platform.name} className="" />
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fetchData.username}
                        onChange={(e) => updateFetchData('username', e.target.value)}
                        placeholder="e.g., instagram"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-400">@</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={fetchProfile}
                    disabled={!fetchData.username || isFetching}
                    className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isFetching ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Fetching Profile...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Search className="h-4 w-4" />
                        <span>Fetch Profile</span>
                      </div>
                    )}
                  </button>
                </div>

                {fetchedProfile && (
                  fetchedProfile.error ? (
                  <div className="flex items-center space-x-3 mb-4" role="alert">
                      <TriangleAlert className="h-6 w-6 text-red-600" />
                      <span className="block sm:inline"> {fetchedProfile.error}</span>
                    </div>
                  ) : (
                  <div className="max-w-2xl mx-auto mt-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <h3 className="text-lg font-semibold">Profile Fetched Successfully</h3>
                    </div>
                    <div className= "text-accent-foreground flex justify-center items-center p-6">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <img
                          src={`${fetchedProfile.profile_pic_url}`}
                          alt="Profile"
                          className="w-32 h-32 rounded-full border-2 border-neutral-800 object-cover"
                        />
                        <div className="flex-1">
                          <h2 className="text-2xl font-semibold mb-2">{fetchedProfile.username}</h2>
                          <div className="flex gap-6 text-sm mb-4">
                            <span><strong>{fetchedProfile.posts_count}</strong> posts</span>
                            <span><strong>{fetchedProfile.followers_count}</strong> followers</span>
                            <span><strong>{fetchedProfile.following_count}</strong> following</span>
                          </div>
                          <div className="text-sm leading-relaxed whitespace-pre-line">
                            <p>{fetchedProfile.bio}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => setActiveTab('analyze')}
                        className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Review & Analyze
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Manual Analysis Tab */}
            {activeTab === 'analyze' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Profile Analysis</h2>
                  <p className="text-gray-300">Enter profile details manually or review fetched data before analysis</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Profile Name</label>
                      <input
                        type="text"
                        value={profileData.profile_name}
                        onChange={(e) => updateProfileData('profile_name', e.target.value)}
                        placeholder="e.g., John Doe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => updateProfileData('username', e.target.value)}
                        placeholder="e.g., @johndoe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={profileData.is_verified}
                          onChange={(e) => updateProfileData('is_verified', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-400">Verified Account</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Profile Picture URL</label>
                      <input
                        type="url"
                        value={profileData.profile_pic_url}
                        onChange={(e) => updateProfileData('profile_pic_url', e.target.value)}
                        placeholder="https://example.com/profile.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Bio/Description</label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => updateProfileData('bio', e.target.value)}
                        placeholder="Profile bio or description..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Followers</label>
                        <input
                          type="number"
                          value={unformatNumber(profileData.followers_count)}
                          onChange={(e) => updateProfileData('followers_count', (e.target.value))}
                          placeholder="1000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Following</label>
                        <input
                          type="number"
                          value={unformatNumber(profileData.following_count)}
                          onChange={(e) => updateProfileData('following_count', (e.target.value))}
                          placeholder="500"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Posts</label>
                        <input
                          type="number"
                          value={unformatNumber(profileData.posts_count)}
                          onChange={(e) => updateProfileData('posts_count', (e.target.value))}
                          placeholder="150"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Account Age (in months)</label>
                        <input
                          type="number"
                          onChange={(e) => updateProfileData('account_age', (e.target.value))}
                          placeholder="12"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={analyzeProfile}
                    disabled={
                      isAnalyzing ||
                      !profileData.profile_name ||
                      !profileData.username ||
                      !profileData.profile_pic_url ||
                      !profileData.bio ||
                      !profileData.followers_count ||
                      !profileData.following_count ||
                      !profileData.posts_count ||
                      !profileData.account_age
                    }
                    className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Analyze Profile</span>
                      </div>
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    className="cursor-pointer bg-gray-500 text-white py-3 px-8 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Analysis Results</h2>
                  <p className="text-gray-300">Detailed authenticity analysis of the profile</p>
                </div>

                {analysisResult ? (
                  analysisResult.error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative" role="alert">
                      <strong className="font-bold">Error:</strong>
                      <span className="block sm:inline"> {analysisResult.error}</span>
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-center mb-6">
                        {analysisResult.is_fake ? (
                          <XCircle className="h-12 w-12 text-red-500 mr-3" />
                        ) : (
                          <CheckCircle className="h-12 w-12 text-green-500 mr-3" />
                        )}
                        <h3 className={`text-3xl font-bold ${analysisResult.is_fake ? 'text-red-600' : 'text-green-600'}`}>
                          {analysisResult.is_fake ? 'Fake Profile Detected' : 'Authentic Profile'}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">Fake Probability</p>
                          <p className="text-2xl font-bold text-gray-900">{(analysisResult.fake_probability * 100).toFixed(2)}%</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">Authenticity Score</p>
                          <p className="text-2xl font-bold text-gray-900">{(analysisResult.authenticity_score * 100).toFixed(2)}%</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">Confidence</p>
                          <p className="text-2xl font-bold text-gray-900">{(analysisResult.confidence * 100).toFixed(2)}%</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">Risk Level</p>
                          <p className={`text-2xl font-bold ${analysisResult.risk_level === 'LOW' ? 'text-green-600' : analysisResult.risk_level === 'MEDIUM' ? 'text-orange-600' : 'text-red-600'}`}>
                            {analysisResult.risk_level}
                          </p>
                        </div>
                      </div>

                      <h4 className="text-xl font-bold mb-4">Detailed Feature Analysis</h4>
                      <div className="space-y-4">
                        {Object.entries(analysisResult.feature_scores).map(([feature, score]) => {
                          const percentage = (score * 100).toFixed(1);
                          const getScoreColor = (score) => {
                            if (score >= 0.8) return 'text-green-600 bg-green-100';
                            if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
                            return 'text-red-600 bg-red-100';
                          };
                          const getProgressColor = (score) => {
                            if (score >= 0.8) return 'bg-green-500';
                            if (score >= 0.6) return 'bg-yellow-500';
                            return 'bg-red-500';
                          };
                          const formatFeatureName = (name) => {
                            return name
                              .replace(/_/g, ' ')
                              .replace(/score/g, '')
                              .trim()
                              .split(' ')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ');
                          };
                          
                          return (
                            <div key={feature} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="text-sm font-semibold text-gray-800">{formatFeatureName(feature)}</h5>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(score)}`}>
                                  {percentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(score)}`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center text-gray-500">
                    Run an analysis to see results here.
                  </div>
                )}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-3">
                <div className="text-xl font-bold">About This Tool</div>
                <h2 className="text-lg font-semibold text-gray-400">
                  Learn how the Social Media Profile Analyzer works
                </h2>

              <div className="space-y-4">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li>Profile picture analysis and verification</li>
                    <li>Username and display name pattern recognition</li>
                    <li>Bio content analysis for spam indicators</li>
                    <li>Network analysis (followers/following ratios)</li>
                    <li>Activity pattern detection</li>
                    <li>Machine learning-based classification</li>
                  </ul>

                  <h3 className="text-lg font-semibold mb-2 mt-6">Detection Indicators</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li>Missing or generic profile pictures</li>
                    <li>Suspicious usernames with high numeric ratios</li>
                    <li>Empty or spam-filled bios</li>
                    <li>Unusual follower/following ratios</li>
                    <li>Excessive posting frequency</li>
                    <li>Profile names with suspicious keywords</li>
                  </ul>

                  <h3 className="text-lg font-semibold mb-2 mt-6">Technology</h3>
                  <p className="text-gray-400">
                    This tool uses a Random Forest machine learning model trained on various profile characteristics 
                    to identify patterns associated with fake or suspicious accounts. The analysis considers multiple 
                    factors simultaneously to provide a comprehensive assessment.
                  </p>
                </div>
              </div>
                <div className="text-sm text-gray-500 mt-6">
                  <p>
                    Note: This tool is for educational purposes only and does not guarantee 100% accuracy in detecting fake profiles.
                    Always use caution when interacting with unknown accounts on social media.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FakeProfileAnalyzer;

