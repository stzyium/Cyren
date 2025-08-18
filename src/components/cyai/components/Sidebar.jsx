/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: Sidebar.jsx
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  MessageCirclePlus, 
  Search, 
  MoreHorizontal, 
  ArrowLeftIcon,
  Edit3, 
  Settings2 as Settings,
  Download,
  AlertTriangle,
  Home,
  Trash2
} from 'lucide-react';
import { useChat } from '../contexts/ChatContext';

const Sidebar = ({ isOpen, onToggle }) => {
  const { chats, activeChatId, dispatch } = useChat();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showMenu, setShowMenu] = useState(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const { chat_Id } = useParams();

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const isNotLg = window.matchMedia("(max-width: 1023.98px)").matches;
  const handleCreateChat = async () => {
    const data = await dispatch({ type: 'CREATE_CHAT', payload: { title: 'New Conversation' } });
    navigate(`/cyren/${data.id}`, { replace: false });
    if (isNotLg) {
      onToggle();
    }
  };

  const handleDeleteChat = (chat_Id) => {
    dispatch({ type: 'DELETE_CHAT', payload: chat_Id });
    setShowMenu(null);
  };

  const handleDeleteAll = () => {
    dispatch({ type: 'DELETE_ALL_CHATS' });
    setShowDeleteAllConfirm(false);
    navigate('/cyren', { replace: false });
  };

  const handleRenameChat = (chat_Id, newTitle) => {
    if (newTitle.trim()) {
      dispatch({ type: 'RENAME_CHAT', payload: { id: chat_Id, title: newTitle.trim() } });
    }
    setEditingId(null);
    setEditTitle('');
  };

  const startEditing = (chat) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
    setShowMenu(null);
  };

  const exportChat = (chat) => {
    const markdown = `# ${chat.title}\n\n${chat.messages.map(msg => 
      `**${msg.role === 'user' ? 'You' : 'Assistant'}:** ${msg.content}`
    ).join('\n\n')}`;
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(null);
  };

  const formatDate = (date) => {
    date = new Date(date);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full w-75 border-e border-sidebar-border
        transform transition-all duration-100 ease-out z-50 bg-white/40 backdrop-blur-2xl
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-2 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
              <img className='w-10 h-10' src="/icon.svg"></img>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="cursor-pointer p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
                title="Go back"
              >
                <Home className="w-6 h-6 text-sidebar-foreground" />
              </button>
              <button
                className="cursor-e-resize p-2 rounded-lg hover:bg-sidebar-accent lg:hidden transition-colors"
                onClick={onToggle}
              >
                <svg width="25" height="25" viewBox="0 0 20 20" fill="currentcolor" xmlns="http://www.w3.org/2000/svg" data-rtl-flip="" className="icon group-hover/tiny-bar:block group-focus-visible:block">
                  <path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"></path></svg>
              </button>
            </div>
          </div>
          
          {/* New Chat Button */}
          <button
            onClick={handleCreateChat}
            className="cursor-pointer w-full flex items-center px-2 left-2 space-x-2 p-2 hover:bg-sidebar-accent/50 rounded-xl transition-all duration-200 group hover:border-sidebar-primary/30"
          >
            <div className="transition-colors">
              <MessageCirclePlus className="w-6 h-6" />
            </div>
            <span>New Conversation</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="w-6 h-6 absolute left-2 top-1/2 transform -translate-y-1/2 text-sidebar-foreground/60" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 focus:outline-none text-sidebar-foreground placeholder-sidebar-foreground/60"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-2 space-y-0.5">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`
                  group relative p-2 rounded-xl cursor-pointer transition-all duration-200
                  ${chat_Id === chat.id 
                    ? 'bg-sidebar-primary/10 ' 
                    : 'hover:bg-sidebar-accent/30 border border-transparent'
                  }
                `}
                onClick={() => {navigate(`/cyren/${chat.id}`); if (isNotLg) onToggle();}}
              >
                {editingId === chat.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleRenameChat(chat.id, editTitle)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameChat(chat.id, editTitle);
                      if (e.key === 'Escape') {
                        setEditingId(null);
                        setEditTitle('');
                      }
                    }}
                    className="w-full bg-transparent border-none outline-none font-medium text-sidebar-foreground"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium truncate leading-tight ${
                          chat_Id === chat.id ? 'text-sidebar-primary' : 'text-sidebar-foreground'
                        }`}>
                          {chat.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0">
                          <p className="text-xs text-sidebar-foreground/50">
                            {formatDate(chat.timestamp)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(showMenu === chat.id ? null : chat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-sidebar-accent transition-all duration-200"
                      >
                        <MoreHorizontal className="w-4 h-4 text-sidebar-foreground/60" />
                      </button>
                    </div>
                    
                    {/* Context Menu */}
                    {showMenu === chat.id && (
                      <div className="absolute right-2 top-12 bg-sidebar border border-sidebar-border rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(chat);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-sidebar-accent transition-colors text-left"
                        >
                          <Edit3 className="w-4 h-4" />
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportChat(chat);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-sidebar-accent transition-colors text-left"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChat(chat.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive transition-colors text-left"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            
            {filteredChats.length === 0 && (
              <div className="text-center py-8 text-sidebar-foreground/60">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </div>
            )}
          </div>
        </div>
        <div className="p-1 border-t border-sidebar-border">
          <div className='flex items-center justify-between'>
            <button>
              <Settings className='w-6 h-6'></Settings>
            </button>
            <span className='font-sans'>styzium@github.com</span>
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              className="cursor-pointer p-2 rounded-lg hover:bg-red-500/60 transition-colors"
              title="Delete all chats">
                <Trash2 className='w-6 h-6'></Trash2>
            </button>
          </div>
        </div>
        {/* Delete All Confirmation Modal */}
        {showDeleteAllConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-sidebar border border-sidebar-border rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="font-semibold text-sidebar-foreground text-sm">Delete All Conversations</h3>
              </div>
              <p className="text-sidebar-foreground/80 mb-6 text-sm">
                Are you sure you want to delete all conversations? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className="cursor-pointer flex-1 px-4 py-2 bg-sidebar-accent text-sidebar-foreground rounded-lg hover:bg-sidebar-accent/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="cursor-pointer flex-1 px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;

