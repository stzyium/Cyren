"""
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: _server.py
"""

from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os
from typing import Self
import uuid
from uuid import uuid4
from re import findall
from curl_cffi.requests import get, RequestsError
from contextlib import redirect_stderr as nostderr
import hashlib
from AccountAnalyzer import SocialMediaAnalyzer
import profilefetcher

__app__ = "Cyren"
__version__ = "0.1a"

app = Flask(__app__, static_folder='{}/../static'.format(os.path.dirname(os.path.abspath(__file__))))
CORS(app)

DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'CyrensDatabase.db')

class SilentError(Exception):
    pass
class Completion:
    history: list[dict]
    def __class_getitem__(cls, *values) -> Self:
        cls.history = [*values]
        return cls
    def create(cls, prompt, chatid):
        try:
            resp = get(
                "https://you.com/api/streamingSearch",
                headers={
                    "cache-control": "no-cache",
                    "referer": "https://you.com/search?q=gpt4&tbm=youchat",
                    "cookie": f"safesearch_guest=Off; uuid_guest={str(uuid4())}",
                },
                params={
                    "q": prompt,
                    "page": 1,
                    "count": 10,
                    "safeSearch": "On",
                    "chatId": chatid,
                    "onShoppingPage": False,
                    "pastChatLength": len(cls.history) if cls.history else 0,
                    "mkt": "",
                    "responseFilter": "WebPages,Translations,TimeZone,Computation,RelatedSearches",
                    "domain": "youchat",
                    "queryTraceId": str(uuid4()),
                    "chat": cls.history,
                },
                impersonate="chrome107",
            )
            if "youChatToken" not in resp.text:
                return ("Unable to fetch the response.")
            return (
                "".join(
                    findall(
                        r"{\"youChatToken\": \"(.*?)\"}",
                        resp.content.decode(),
                    )
                )
                .replace("\\n", "\n")
                .replace("\\\\", "\\")
                .replace('\\"', '"')
            )
        except:
            return 0

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn
def execdb(*cmd):
    db = get_db()
    if (attr:=(lambda c: c if c.startswith("fetch") else False)([*cmd][0].lower())): cur = getattr(db.cursor().execute(*(cmd[1:])), attr)()
    else: cur = db.cursor().execute(*cmd)
    db.commit()
    db.close()
    return cur
def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS chats (
            id TEXT PRIMARY KEY,
            title TEXT,
            timestamp TEXT
        );''')
    cur.execute(
        '''
        CREATE TABLE IF NOT EXISTS messages (
            chat_id TEXT,
            prompt TEXT,
            response TEXT,
            timestamp TEXT,
            FOREIGN KEY(chat_id) REFERENCES chats(id)
        );''')
    cur.execute('''
        CREATE TABLE IF NOT EXISTS vault (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            password TEXT,
            description TEXT,
            timestamp TEXT
        );''')
    cur.execute('''
        CREATE TABLE IF NOT EXISTS localstorage (
            key TEXT,
            value TEXT
        );''')
    cur.execute('''
        INSERT OR IGNORE INTO localstorage (key, value) VALUES (?, ?);
    ''', ("vault_password", "admin123"))
    conn.commit()
    conn.close()
    
def GenAiResponse(message, id):
    prompt = """
You are Cyren, a friendly, knowledgeable AI trained in cybersecurity and digital safety.

Your job is to:
produce output in formatted text, use markdown
Help users understand suspicious messages, emails, websites, or apps.
Warn about common scams, phishing, and unsafe links.
Provide safe online habits, password tips, and privacy recommendations.
NEVER assist with hacking, bypassing security, or anything unethical or illegal.
Stay up-to-date with cyber threats and explain them in simple terms.
Format responses clearly and with practical steps. If unsure about something, encourage users to stay cautious and report it to a professional.

user: {}"""
    
    if (response:=Completion[*(lambda *args:[{"question": k["prompt"], "answer": k["response"]} for k in [dict(i) for i in execdb(*args)]])("fetchall", "SELECT prompt, response FROM messages WHERE chat_id = ? LIMIT 4", (id,))]().create(prompt.strip().format(message), chatid=id)):return response.encode('utf-8', errors="ignore").decode('unicode_escape')
    return 0
    
def _getFormedMsgs(d):
    return [
        {
            "role": "user",
            "content": d["prompt"],
            "timestamp": d["timestamp"]
        },
        {
            "role": "assistant",
            "content": d["response"],
            "timestamp": d["timestamp"]
        }
    ]

### Vault Endpoints ###

@app.route('/api/vault', methods=['GET'])
def get_vault_items():
    items = execdb('fetchall', 'SELECT * FROM vault ORDER BY timestamp DESC')
    return jsonify([dict(item) for item in items])

@app.route('/api/vault', methods=['POST'])
def add_vault_item():
    data = request.get_json()
    name = data.get('name')
    password = data.get('password')
    description = data.get('description')
    timestamp = datetime.now().isoformat()
    execdb('INSERT INTO vault (name, password, description, timestamp) VALUES (?, ?, ?, ?)',
                 (name, password, description, timestamp))
    return jsonify({'name': name, 'password': password, 'description': description, 'timestamp': timestamp}), 201

@app.route('/api/vault/<item_id>', methods=['DELETE'])
def delete_vault_item(item_id):
    execdb('DELETE FROM vault WHERE id = ?', (item_id,))    
    return '', 204
# modify
@app.route('/api/vault/<item_id>', methods=['PUT'])
def update_vault_item(item_id):
    data = request.get_json()
    name = data.get('name')
    password = data.get('password')
    description = data.get('description')
    timestamp = datetime.now().isoformat()
    execdb('UPDATE vault SET name = ?, password = ?, description = ?, timestamp = ? WHERE id = ?',
                 (name, password, description, timestamp, item_id))
    
    
    return jsonify({'id': item_id, 'name': name, 'password': password, 'description': description, 'timestamp': timestamp})
# password auth
@app.route('/api/vault/auth', methods=['POST'])
def authenticate_vault():
    dt = request.get_json()
    password = dt.get('password')
    if not password:
        return jsonify({'error': 'Password is required'}), 400
    item = execdb('fetchone', 'SELECT value FROM localstorage WHERE key = ?', ("vault_password",))   
    if not item or item['value'] != password:
        return jsonify({'error': 'Invalid password'}), 401
    return jsonify({'message': 'Authenticated successfully'}), 200
@app.route('/api/vault/auth', methods=['PUT'])
def update_vault_auth():
    dt = request.get_json()
    password = dt.get('password')
    if not password:
        return jsonify({'error': 'Password is required'}), 400
    execdb('UPDATE localstorage SET value = ? WHERE key = ?', (password, "vault_password"))
    return jsonify({'message': 'Password updated successfully'}), 200

### Vault/ Endpoints ###

@app.route('/api/chats/history', methods=['GET'])
def get_chat_history():
    chats = execdb('fetchall', 'SELECT * FROM chats ORDER BY timestamp DESC')
    return jsonify([
        {"id": chat['id'],
         "title": chat['title'],
         "timestamp": chat['timestamp']}
        for chat in chats])
@app.route('/api/chats/<chat_id>', methods=['GET'])
def get_chats(chat_id):
    messages = execdb('fetchall', 'SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC', (chat_id,))
    if not execdb('fetchone', 'SELECT * FROM chats WHERE id = ?', (chat_id,)):
        return jsonify({'error': 'Chat not found'}), 404
    result = {
        'id': chat_id,
        'messages': [d for m in messages for d in _getFormedMsgs(dict(m))]
    }
    return jsonify(result)
@app.route('/api/chats', methods=['POST'])
def create_chat():
    data = request.get_json()
    chat_id = str(uuid.uuid4())
    title = data.get('title', 'New Conversation')
    timestamp = datetime.now().isoformat()
    execdb('INSERT INTO chats (id, title, timestamp) VALUES (?, ?, ?)', (chat_id, title, timestamp))
    return jsonify({ 'id': chat_id, 'title': title, 'timestamp': timestamp, 'messages': [] })

@app.route('/api/chats/<chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    execdb('DELETE FROM messages WHERE chat_id = ?', (chat_id,))
    execdb('DELETE FROM chats WHERE id = ?', (chat_id,))
    return '', 204

@app.route('/api/chats', methods=['DELETE'])
def delete_all_chats():
    conn = get_db()
    execdb('DELETE FROM messages')
    execdb('DELETE FROM chats')
    return '', 204

@app.route('/api/chats/<chat_id>/rename', methods=['PUT'])
def rename_chat(chat_id):
    data = request.get_json()
    title = data['title']
    conn = get_db()
    execdb('UPDATE chats SET title = ? WHERE id = ?', (title, chat_id))
    return jsonify({ 'id': chat_id, 'title': title })

@app.route('/api/chats/<chat_id>/message', methods=['POST'])
def add_message(chat_id):
    data = request.get_json()
    msg_id = str(uuid.uuid4())
    prompt = data['prompt']
    text = data['text']
    timestamp = datetime.now().isoformat()
    conn = get_db()
    execdb('INSERT INTO messages (chat_id, prompt, response, timestamp) VALUES (?, ?, ?, ?)', (chat_id, prompt, text, timestamp))
    execdb('UPDATE chats SET timestamp = ? WHERE id = ?', (timestamp, chat_id))
    return jsonify({ 'id': msg_id, 'user': prompt, 'content': text, 'timestamp': timestamp })
@app.route('/api/chats/<chat_id>/response', methods=['POST'])
def get_ai_response(chat_id):
    data = request.get_json()
    message = data['text']
    ai_response = GenAiResponse(message, chat_id)
    if ai_response == 0:
        return '', 500
    return jsonify({ 'text': ai_response })

@app.route('/api/chats/<chat_id>/msg/<msg_id>', methods=['PUT'])
def update_message(chat_id, msg_id):
    data = request.get_json()
    text = data.get('text')
    execdb('UPDATE messages SET text = ? WHERE id = ? AND chat_id = ?', (text, msg_id, chat_id))
    return jsonify({ 'id': msg_id, 'text': text })
def getnews():
    API_KEY = "d12fc25b5cfb471e8eaa432333c2eb4c"
    URL = "https://newsapi.org/v2/everything"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.111 Safari/537.36"
    }

    params = {
        "q": "data breach",
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 1,
        "apiKey": API_KEY
    }
    response = get(URL, headers=headers, params=params)
    return response.json()
@app.route('/api/news', methods=['GET'])
def fetch_cyber_news():
    data = getnews()
    articles = data.get("articles", [])
    title = articles[0].get("title", "No title found")
    description = articles[0].get("description", "No description found")
    url = articles[0].get("url", "No URL found")
    published_at = articles[0].get("publishedAt", "No date found")
    img = articles[0].get("urlToImage", "No image found")
    source = articles[0].get("source", {}).get("name", "No source found")
    news = {
        "title": title,
        "description": description,
        "link": url,
        "publishedAt": published_at,
        "imageUrl": img,
        "source": source
    }
    return jsonify(news), 200

def format_number(n):
    def clean(x):
        return int(x) if x == int(x) else round(x, 1)

    if n >= 1_000_000_000:
        return f"{clean(n / 1_000_000_000)}B"
    elif n >= 1_000_000:
        return f"{clean(n / 1_000_000)}M"
    elif n >= 1_000:
        return f"{clean(n / 1_000)}K"
    else:
        return str(n)
def internet():
    try:
        response = get("https://www.google.com/generate_204", timeout=3)
        return response.status_code == 204
    except RequestsError:
        return False
@app.route('/profile/<username>', methods=['POST'])
def fetch_profile(username):
    profile = profilefetcher.fetch(username)
    if isinstance(profile, dict) and "error" in profile:
        return jsonify(profile), 404
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pfp.jpg'), "wb") as f:
        f.write(get(profile.profile_pic_url).content)
    return {
        "username": profile.username,
        "full_name": profile.full_name,
        "bio": profile.bio,
        "followers": format_number(profile.followers),
        "following": format_number(profile.following),
        "is_verified": profile.is_verified,
        "post_count": format_number(profile.post_count),
        "profile_pic_url": "/pfp.jpg",
        "is_private": profile.is_private,
    }
def unformat_number(s):
    s = s.lower().strip()
    if s.endswith('b'):
        return int(float(s[:-1]) * 1_000_000_000)
    elif s.endswith('m'):
        return int(float(s[:-1]) * 1_000_000)
    elif s.endswith('k'):
        return int(float(s[:-1]) * 1_000)
    else:
        return int(s)
@app.route('/api/analyze', methods=['POST'])
def analyze_profile():
    analyzer = SocialMediaAnalyzer()
    try:
        profile_data = request.json
        profile_data['followers_count'] = (unformat_number(profile_data['followers_count']))
        profile_data['following_count'] = (unformat_number(profile_data['following_count']))
        profile_data['posts_count'] = (unformat_number(profile_data['posts_count']))
        result = analyzer.analyze_profile(profile_data)
        return jsonify(result)
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500
@app.route('/api/db/passwd/<password>', methods=["POST"])
def check_password(password):
    if not password:
        return jsonify({'error': 'Password is required'}), 400
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400
    sha1 = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
    prefix, suffix = sha1[:5], sha1[5:]
    response = get(f'https://api.pwnedpasswords.com/range/{prefix}')
    hashes = (line.split(':') for line in response.text.splitlines())
    breach_count = 0
    for h, count in hashes:
        if h == suffix:
            breach_count = int(count)
    return jsonify({'breach_count': breach_count})

##mains
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def index(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")
if __name__ == '__main__':
    init_db()
    app.run(debug=True)