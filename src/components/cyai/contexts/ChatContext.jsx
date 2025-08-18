/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: ChatContext.jsx
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { chatApi } from '../data/chatApi.js';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CHATS_HISTORY':
      return {
        ...state,
        chats: action.payload,
      };
    case 'SET_ACTIVE_CHAT':
      return {
        ...state,
        activeChatId: action.payload.id,
        // Achats: action.payload.history.map(chat =>
        //   chat.id === action.payload.id
        //     ? { ...chat, messages: action.payload.history || chat.messages }
        //     : chat
        // ),
      };
    case 'CREATE_CHAT':
      return {
        ...state,
        chats: [action.payload, ...state.chats],
        activeChatId: action.payload.id,
      };
    case 'DELETE_CHAT': {
      const filteredChats = state.chats.filter(chat => chat.id !== action.payload);
      const newActiveChatId = state.activeChatId === action.payload
        ? (filteredChats.length > 0 ? filteredChats[0].id : null)
        : state.activeChatId;
      return {
        ...state,
        chats: filteredChats,
        activeChatId: newActiveChatId,
      };
    }
    case 'DELETE_ALL_CHATS':
      return {
        ...state,
        chats: [],
        activeChatId: null,
      };
    case 'RENAME_CHAT':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.id
            ? { ...chat, title: action.payload.title }
            : chat
        ),
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.chatId
            ? {
                ...chat,
                messages: [...chat.messages, action.payload.message],
                timestamp: new Date(),
              }
            : chat
        ),
      };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.chatId
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === action.payload.messageId
                    ? { ...msg, ...action.payload.updates }
                    : msg
                ),
              }
            : chat
        ),
      };
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, {
    chats: [],
    activeChatId: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const loadedChats = await chatApi.fetchChats();
        dispatch({ type: 'LOAD_CHATS_HISTORY', payload: loadedChats });
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    })();
  }, []);

  const originalDispatch = dispatch;

  const enhancedDispatch = async (action) => {
    try {
      switch (action.type) {
        case 'CREATE_CHAT': {
          const newChat = await chatApi.createChat(action.payload?.title);
          originalDispatch({ type: 'CREATE_CHAT', payload: newChat });
          return newChat;
        }
        case 'DELETE_CHAT': {
          await chatApi.deleteChat(action.payload);
          return originalDispatch(action);
        }
        case 'DELETE_ALL_CHATS': {
          await chatApi.deleteAllChats();
          return originalDispatch(action);
        }
        case 'RENAME_CHAT': {
          await chatApi.renameChat(action.payload.id, action.payload.title);
          return originalDispatch(action);
        }
        case 'ADD_MESSAGE': {
          if (action.payload.message.role === 'user') {
            return null; // Prevent adding user messages through this dispatch
          }
          const newMessage = await chatApi.addMessage(action.payload.chatId, action.payload.prompt.content, action.payload.message.content);
          return newMessage;
        }
        case 'UPDATE_MESSAGE': {
          await chatApi.updateMessage(action.payload.chatId, action.payload.messageId, action.payload.updates);
          return originalDispatch(action);
        }
        default:
          return originalDispatch(action);
      }
    } catch (error) {
      console.error('Error in enhanced dispatch:', error);
      return originalDispatch(action);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats: state.chats,
        activeChatId: state.activeChatId,
        dispatch: enhancedDispatch,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
