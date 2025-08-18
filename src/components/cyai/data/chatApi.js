/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: chatApi.js
 */

const BASE = "/api";

export const chatApi = {
  async fetchChats() {
    try {
      const res = await fetch(`${BASE}/chats/history`);
      if (!res.ok) throw new Error('Failed to fetch chats');
      return res.json();
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  },
  async fetchChatHistory(chatId) {
    try {
      const res = await fetch(`${BASE}/chats/${chatId}`);
      if (!res.ok) throw new Error('Failed to fetch chat');
      return res.json();
    } catch (error) {
      console.error('Error fetching chat:', error);
      return null;
    }
  },
  async createChat(title) {
    try {
      const res = await fetch(`${BASE}/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('Failed to create chat');
      return res.json();
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },
  
  async deleteChat(chatId) {
    try {
      const res = await fetch(`${BASE}/chats/${chatId}`, { method: "DELETE" });
      if (!res.ok) throw new Error('Failed to delete chat');
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  },
  
  async deleteAllChats() {
    try {
      const res = await fetch(`${BASE}/chats`, { method: "DELETE" });
      if (!res.ok) throw new Error('Failed to delete all chats');
    } catch (error) {
      console.error('Error deleting all chats:', error);
      throw error;
    }
  },
  
  async renameChat(chatId, title) {
    try {
      const res = await fetch(`${BASE}/chats/${chatId}/rename`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('Failed to rename chat');
    } catch (error) {
      console.error('Error renaming chat:', error);
      throw error;
    }
  },
  
  async addMessage(chatId, prompt, messageText) {
    try {
      const res = await fetch(`${BASE}/chats/${chatId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt, text: messageText }),
      });
      if (!res.ok) throw new Error('Failed to add message');
      return res.json();
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  },
  
  async updateMessage(chatId, messageId, updates) {
    try {
      const res = await fetch(`${BASE}/chats/${chatId}/msg/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update message');
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  },
  
  async getAiResponse(chatId, messageText) {
    try {
      const res = await fetch(`${BASE}/chats/${chatId}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: messageText }),
      });
      if (!res.ok) throw new Error('Failed to get AI response');
      return res.json();
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw error;
    }
  },
};
