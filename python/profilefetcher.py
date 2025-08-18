"""
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: profilefetcher.py
"""

from curl_cffi.requests import get, RequestsError

class Profile:
    def __init__(self, username: str, full_name: str, bio: str, followers: int, following: int, is_verified: bool, post_count: int, profile_pic_url: str, is_private: bool):
        self.username = username
        self.full_name = full_name
        self.bio = bio
        self.followers = followers
        self.following = following
        self.is_verified = is_verified
        self.post_count = post_count
        self.profile_pic_url = profile_pic_url
        self.is_private = is_private

def fetch(username: str, cookies: dict = {
    "csrftoken": "",
    "ig_did": "",
    "mid": ""
}) -> Profile | dict:
    url = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={username}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "X-IG-App-ID": "936619743392459",      # Required
        "X-IG-WWW-Claim": "0",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": f"https://www.instagram.com/{username}/",
    }
    
    response = get(url, headers=headers, cookies=cookies)
    try:
        response.raise_for_status()
    except RequestsError as e:
        if response.status_code == 404:
            return {"error": "Profile not found or private."}
        return {"error": f"{e}"}
    data = response.json().get("data", {}).get("user", {})
    return Profile(
        username=data.get("username"),
        full_name=data.get("full_name"),
        bio=data.get("biography"),
        followers=data.get("edge_followed_by", {}).get("count"),
        following=data.get("edge_follow", {}).get("count"),
        is_verified=data.get("is_verified"),
        post_count=data.get("edge_owner_to_timeline_media", {}).get("count"),
        profile_pic_url=data.get("profile_pic_url"),
        is_private=data.get("is_private"),
    )