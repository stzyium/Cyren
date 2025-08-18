/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: ChatInterface.jsx
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUp as Send, Menu } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useChat } from '../contexts/ChatContext';
import MessageRenderer from './MessageRenderer';
import MessageActions from './MessageActions';
import TextareaAutosize from 'react-textarea-autosize';
import { chatApi } from '../data/chatApi';

const ChatInterface = ({ isOpen, onToggleSidebar }) => {
  const { chats, dispatch } = useChat();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();
  const { chat_Id } = useParams();

  const isNotLg = window.matchMedia("(max-width: 1023.98px)").matches;

  useEffect(() => {
    if (error || message.trim()) {
      setError(null);
    }
  }, [message, error]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const chatsHistory = async () => {
      if (!chat_Id) return;
      try {
        const chatData = await chatApi.fetchChatHistory(chat_Id);
        setMessages(chatData.messages || []);
      } catch (error) {
        console.error('Error loading chat history:', error);
        navigate(`/cyren`, { replace: false });
      }
    };
    chatsHistory();
  }, [chat_Id, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !chats || isTyping) return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };
    await dispatch({
      type: 'ADD_MESSAGE',
      payload: { chatId: chat_Id, message: userMessage },
    });
    setMessages(prevMessages => [...prevMessages, userMessage]);


    const messageToSend = message.trim();
    setMessage('');
    setError(null);

    setIsTyping(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/chats/${chat_Id}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: userMessage.content }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.text && !data.content) {
        throw new Error('Empty response from server');
      }
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || data.content,
        timestamp: new Date()
      };

      await dispatch({
        type: 'ADD_MESSAGE',
        payload: { chatId: chat_Id, prompt: userMessage, message: aiMessage },
      });
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }

      console.error('Error getting AI response:', error);
      setError('Failed to get response. Please try again.');
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your connection and try again.',
        timestamp: new Date(),
      };

      try {
        await dispatch({
          type: 'ADD_MESSAGE',
          payload: { chatId: chat_Id, prompt: userMessage, message: errorMessage },
        });
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } catch (dispatchError) {
        console.error('Error dispatching error message:', dispatchError);
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  });

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const regenerateMessage = async (messageId) => {
    if (!chats || isTyping) return;
    const messageIndex = chats.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex <= 0) return;
    const userMessage = chats.messages[messageIndex - 1];
    if (userMessage.role !== 'user') return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const updatedMessages = chats.messages.filter(msg => msg.id !== messageId);
    const updatedChat = { ...chats, messages: updatedMessages };
    
    try {
      dispatch({
        type: 'LOAD_CHATS',
        payload: chats.chats?.map(chat => 
          chat.id === chat_Id ? updatedChat : chat
        ) || [updatedChat],
      });
    } catch (error) {
      console.error('Error updating chat for regeneration:', error);
      return;
    }

    setIsTyping(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/chats/${chat_Id}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: userMessage.content }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const newAiMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        prompt: userMessage.content,
        content: data.text || data.content || 'Here\'s a regenerated response about cyber safety...',
        timestamp: new Date(),
      };

      await dispatch({
        type: 'ADD_MESSAGE',
        payload: { chatId: chat_Id, message: newAiMessage },
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Regeneration request aborted');
        return;
      }

      console.error('Error regenerating message:', error);
      setError('Failed to regenerate message. Please try again.');
      
      const fallbackResponses = [
        "Let me provide a different perspective on cyber safety...",
        "Here's another approach to staying safe online...",
        "I'd like to offer some additional insights about digital security..."
      ];
      
      const newAiMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        timestamp: new Date(),
      };

      try {
        await dispatch({
          type: 'ADD_MESSAGE',
          payload: { chatId: chat_Id, message: newAiMessage },
        });
      } catch (dispatchError) {
        console.error('Error dispatching fallback message:', dispatchError);
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  // Loading state
  if (!chat_Id) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
          <div className="relative">
                <img className="w-60 h-60 rounded-full mx-auto flex items-center justify-center" src='/160423230.png' />
              </div>
          </div>
          <h2 className="text-4xl font-bold text-black mb-4 tracking-tight">
            Yo yo honey singh
          </h2>
          <p className="text-black/60 text-lg max-w-md mx-auto leading-relaxed">
            Select a conversation or start a new one to begin exploring cyber security together
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col relative">
      <div className="flex-1 overflow-y-auto px-4 relative z-10">
        {/* Welcome message for empty chat */}
        {!isOpen && (
          <div className="fixed top-0 left-0 p-3 lg:hidden">
            <button
              onClick={onToggleSidebar}
              className="cursor-pointer p-3 backdrop-blur-sm border border-white/10 rounded-4xl hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-sm"
              aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" fill="currentcolor" xmlns="http://www.w3.org/2000/svg" data-rtl-flip="" className="icon group-hover/tiny-bar:block group-focus-visible:block">
                  <path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"></path></svg>
          </button>
        </div>
        )}
        
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-8 max-w-2xl mx-auto">
              <div className="relative">
                <img className="w-60 h-60 rounded-full mx-auto flex items-center justify-center" src='/160423230.png' />
              </div>
              <div>
                <h2 className="text-5xl mb-4 tracking-tight">
                  Introducing CyrenGPT
                </h2>
                <p className="text-gray-800 text-xl leading-relaxed">
                  I'm Cyren, your cyber safety assistant. Ask me anything related to cyber safety!
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                <div className="bg-black/20 backdrop-blur-sm border border-black/10 hover:text-black rounded-2xl p-4 hover:bg-white transition-all duration-300 cursor-pointer"
                  onClick={()=>{
                    setMessage("How do I create strong passwords?");
                    handleSendMessage();
                  }}
                >
                  <p className="text-sm">💡 "How do I create strong passwords?"</p>
                </div>
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
                  onClick={()=>{
                    setMessage("What is teo-factor authentication?");
                    handleSendMessage();
                  }}
                >
                  <p className="text-sm">🛡️ "What is two-factor authentication?"</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 text-red-200 shadow-lg shadow-red-500/10">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0"></div>
                {error}
              </div>
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-8 pb-16 pt-8 scroll-smooth">
            {messages.map((msg, index) => (
              <div
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  style={{ borderRadius: '24px' }}
                  className={`
                    group transition-all duration-300 hover:scale-[1.02]
                    ${msg.role === 'user'
                      ? 'bg-white/90 text-black max-w-md px-4 py-2 shadow-2xl shadow-blue-500/20'
                      : 'black'
                    }
                  `}
                >
                  <MessageRenderer content={msg.content} role={msg.role} />
                  
                  {/* Message actions for AI */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-start mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <MessageActions 
                        message={msg} 
                        onRegenerate={regenerateMessage}
                        disabled={isTyping}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-300 pb-32">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-black">Cyren is thinking...</span>
                </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Section */}
      <div className="relative z-20">

        {/* Input container */}
        <div className="px-4">
          <div className="flex max-w-3xl mx-auto justify-center items-end gap-0.5">
            {/* Container for textarea - flex-grow to take max width */}
            <div 
            style={{ borderRadius: '24px' }}
            className="flex flex-grow bg-white border border-black/20 shadow-md transition-all p-3 items-center justify-center">
              {/* Text input */}
              <TextareaAutosize
                ref={textareaRef}
                minRows={1}
                maxRows={10}
                value={message}
                onKeyDown={handleKeyDown}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask cyren"
                className="flex-grow w-full resize-none bg-transparent border-none outline-none text-black placeholder:text-slate-400 leading-relaxed px-2"
                disabled={isTyping}
              />
            </div>

            {/* Send button */}
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isTyping}
              className="cursor-pointer flex-shrink-0 p-3 shadow-black/10 border rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:bg-black/10 bg-black text-white"
              aria-label="Send message"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>

          {/* Keyboard shortcuts */}
          <div className="text-center mt-1 mb-1 space-x-2">
            <span className="text-black/70 text-xs">
              <kbd className="px-2 py-0.5 bg-black/50 border border-white/20 rounded text-xs font-mono text-white">Enter</kbd> to send
            </span>
            <span className="text-black/70 text-xs">
              <kbd className="px-2 py-0.5 bg-black/50 border border-white/20 rounded text-xs font-mono text-white">Shift+Enter</kbd> for new line
            </span>
          </div>
        </div>
      </div>
      {(isOpen && (
        <div
          onClick={onToggleSidebar}
          className="fixed inset-0 bg-white/20 z-40">
        </div>
        ))}
    </div>
  );
};

export default ChatInterface;