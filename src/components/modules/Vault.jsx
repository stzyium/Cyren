/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: Vault.jsx
 */

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus, Edit, Trash2, Settings, Lock, Search, Copy, Check, Shield, Key, Database, Mail, Github, Cloud, Server } from 'lucide-react';

const PasswordVault = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [passwords, setPasswords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [newPassword, setNewPassword] = useState({ key: '', password: '', description: '' });
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [confirmMasterPassword, setConfirmMasterPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const getServiceIcon = (key) => {
    const keyLower = key.toLowerCase();
    if (keyLower.includes('gmail') || keyLower.includes('email') || keyLower.includes('mail')) return Mail;
    if (keyLower.includes('github') || keyLower.includes('git')) return Github;
    if (keyLower.includes('aws') || keyLower.includes('cloud')) return Cloud;
    if (keyLower.includes('database') || keyLower.includes('db')) return Database;
    if (keyLower.includes('server')) return Server;
    return Key;
  };
  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/vault")
        .then(res => res.json())
        .then(data => setPasswords(data))
        .catch(err => console.error("Error fetching vault:", err));
    }
  }, [isAuthenticated]);

  // Authenticate
  const handleLogin = () => {
    fetch("/api/vault/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: masterPassword }),
    })
      .then(async res => {
        if (res.ok) {
          setIsAuthenticated(true);
          setAuthError("");
        } else {
          const errData = await res.json();
          setAuthError(errData.error || "Login failed");
        }
      })
      .catch(err => {
        console.error(err);
        setAuthError("Network error");
      });
  };

  // Add new password
  const handleAddPassword = () => {
    if (newPassword.key && newPassword.password) {
      fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPassword.key,
          password: newPassword.password,
          description: newPassword.description,
        }),
      })
        .then(res => res.json())
        .then(added => {
          setPasswords(prev => [added, ...prev]);
          setNewPassword({ key: "", password: "", description: "" });
          setShowAddModal(false);
        })
        .catch(err => console.error("Error adding password:", err));
    }
  };

  // Edit existing password
  const handleEditPassword = () => {
    if (editingPassword && editingPassword.key && editingPassword.password) {
      fetch(`/api/vault/${editingPassword.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingPassword.key,
          password: editingPassword.password,
          description: editingPassword.description,
        }),
      })
        .then(res => res.json())
        .then(updated => {
          setPasswords(prev =>
            prev.map(p => (p.id === updated.id ? updated : p))
          );
          setShowEditModal(false);
          setEditingPassword(null);
        })
        .catch(err => console.error("Error editing password:", err));
    }
  };

  // Delete password
  const handleDeletePassword = (id) => {
    fetch(`/api/vault/${id}`, {
      method: "DELETE",
    })
      .then(res => {
        if (res.ok) {
          setPasswords(prev => prev.filter(p => p.id !== id));
        }
      })
      .catch(err => console.error("Error deleting password:", err));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredPasswords = passwords.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangeMasterPassword = () => {
    if (newMasterPassword === confirmMasterPassword && newMasterPassword.length > 0) {
      fetch("/api/vault/auth", {method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: newMasterPassword
        }),
      })
      .then(rs => {
        if (rs.ok) {
          alert("Password updated successfully");
          setNewMasterPassword('');
          setConfirmMasterPassword('');
          setShowSettingsModal(false);
        } else {
          alert("Unable to set new password")
        }
      })
      .catch(err=> {alert(err)})
    } else {
      alert('Passwords do not match or are empty!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex p-4 items-center justify-center">
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-light text-slate-900 mb-2">Vault</h1>
            <p className="text-slate-600 text-sm">Secure password manager</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-3">Master Password</label>
              <div className="relative">
                <input
                  type={showMasterPassword ? 'text' : 'password'}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-4 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all duration-200"
                  placeholder="Enter your master password"
                />
                <button
                  type="button"
                  onClick={() => setShowMasterPassword(!showMasterPassword)}
                  className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showMasterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {authError && <p className="text-red-500 text-sm mt-2 ml-1">{authError}</p>}
            </div>

            <button
              onClick={handleLogin}
              className="cursor-pointer w-full bg-slate-900 text-white py-4 px-4 rounded-xl font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all duration-200 shadow-lg"
            >
              Unlock Vault
            </button>
          </div>

          <div className="mt-8 text-center text-slate-500 text-sm">
            The default password is <span className="font-mono text-slate-700">admin123</span> (if you haven't chnaged it in settings)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="backdrop-blur-xl border-b border-white/20top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-light text-accent-foreground">Vault</h1>
                <p className="text-xs text-slate">{passwords.length} entries stored</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="cursor-pointer bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all duration-200 shadow-sm flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="cursor-pointer bg-white/80 backdrop-blur-sm text-slate-700 p-3 rounded-full hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all duration-200 border border-slate-200/50"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="cursor-pointer bg-red-50 text-red-600 p-3 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              >
                <Lock className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your vault..."
              className="w-full pl-12 pr-4 py-4 bg-accent/80 backdrop-blur-sm border border-slate-200/50 rounded-xl text-accent-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all duration-200"
            />
          </div>
        </div>

        {/* Password List */}
        <div className="space-y-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPasswords.map((password) => (
            <div key={password.id} className="bg-accent/60 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg hover:bg-y/70 hover:shadow-xl transition-all duration-300 group overflow-hidden">
              {/* Header Section */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-accent-foreground mb-2 truncate">{password.name}</h3>
                    {password.description && (
                      <p className="text-slate-500 text-sm leading-relaxed">{password.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => {
                        setEditingPassword(password);
                        setShowEditModal(true);
                      }}
                      className="cursor-pointer bg-white/80 backdrop-blur-sm text-slate-600 hover:text-slate-900 hover:bg-white p-2 rounded-lg transition-all duration-200 border border-slate-200/50"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePassword(password.id)}
                      className="cursor-pointer bg-red-50/80 backdrop-blur-sm text-red-500 hover:text-red-700 hover:bg-red-100/80 p-2 rounded-lg transition-all duration-200 border border-red-200/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="px-6 pb-6">
                <div className="bg-slate-50/70 backdrop-blur-sm rounded-xl border border-slate-200/40 overflow-hidden">
                  <div className="flex items-center">
                    <div className="flex-1 px-4 py-4 min-w-0">
                      <div className="font-mono text-slate-900 text-sm break-all">
                        {showPassword[password.id] ? (
                          <span className="select-all">{password.password}</span>
                        ) : (
                          <span className="tracking-wider">
                            {'•'.repeat(Math.min(password.password.length, 20))}
                            {password.password.length > 20 && '...'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {password.password.length} characters
                      </div>
                    </div>
                    <div className="flex items-center border-l border-slate-200/50">
                      <button
                        onClick={() => togglePasswordVisibility(password.id)}
                        className="cursor-pointer px-4 py-4 text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 transition-all duration-200 rounded-4xl"
                        title={showPassword[password.id] ? 'Hide password' : 'Show password'}
                      >
                        {showPassword[password.id] ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(password.password, password.id)}
                        className="cursor-pointer px-4 py-4 text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 transition-all rounded-4xl duration-200 border-l border-slate-200/50"
                        title="Copy to clipboard"
                      >
                        {copiedId === password.id ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPasswords.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200/50">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">No entries found</h3>
            <p className="text-slate-500">Try adjusting your search or add a new entry.</p>
          </div>
        )}
      </div>

      {/* Add Password Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
            <h2 className="text-2xl font-light text-slate-900 mb-6">Add New Entry</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">Service Name</label>
                <input
                  type="text"
                  value={newPassword.key}
                  onChange={(e) => setNewPassword({...newPassword, key: e.target.value})}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
                  placeholder="e.g., Gmail, GitHub, Netflix"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={newPassword.password}
                  onChange={(e) => setNewPassword({...newPassword, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newPassword.description}
                  onChange={(e) => setNewPassword({...newPassword, description: e.target.value})}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all resize-none"
                  placeholder="Optional description"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleAddPassword}
                  className="cursor-pointer flex-1 bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all duration-200"
                >
                  Add Entry
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewPassword({ key: '', password: '', description: '' });
                  }}
                  className="cursor-pointer flex-1 bg-white/80 backdrop-blur-sm text-slate-700 py-3 rounded-xl font-medium hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all duration-200 border border-slate-200/50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Password Modal */}
      {showEditModal && editingPassword && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
            <h2 className="text-2xl font-light text-slate-900 mb-6">Edit Entry</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">Service Name</label>
                <input
                  type="text"
                  value={editingPassword.key}
                  onChange={(e) => setEditingPassword({...editingPassword, key: e.target.value})}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={editingPassword.password}
                  onChange={(e) => setEditingPassword({...editingPassword, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editingPassword.description}
                  onChange={(e) => setEditingPassword({...editingPassword, description: e.target.value})}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all resize-none"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleEditPassword}
                  className="cursor-pointer flex-1 bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all duration-200"
                >
                  Update Entry
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPassword(null);
                  }}
                  className="cursor-pointer flex-1 bg-white/80 backdrop-blur-sm text-slate-700 py-3 rounded-xl font-medium hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all duration-200 border border-slate-200/50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
            <h2 className="text-2xl font-light text-slate-900 mb-6">Settings</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">New Master Password</label>
                <input
                  type="password"
                  value={newMasterPassword}
                  onChange={(e) => setNewMasterPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
                  placeholder="Enter new master password"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">Confirm Master Password</label>
                <input
                  type="password"
                  value={confirmMasterPassword}
                  onChange={(e) => setConfirmMasterPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
                  placeholder="Confirm new master password"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleChangeMasterPassword}
                  className="cursor-pointer flex-1 bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all duration-200"
                >
                  Change Password
                </button>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    setNewMasterPassword('');
                    setConfirmMasterPassword('');
                  }}
                  className="cursor-pointer flex-1 bg-white/80 backdrop-blur-sm text-slate-700 py-3 rounded-xl font-medium hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all duration-200 border border-slate-200/50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordVault;