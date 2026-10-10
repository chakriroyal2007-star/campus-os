'use client';

import React, { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch, getStoredUser } from '@/lib/api';
import { formatTime, formatDate } from '@/lib/utils';
import { MessageSquare, Users, Send, Plus, UserPlus, Check, X } from 'lucide-react';

export default function StudentCommunityPage() {
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChatModal, setNewChatModal] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');

  useEffect(() => {
    setUser(getStoredUser());
    loadCommunity();
  }, []);

  const loadCommunity = async () => {
    setLoading(true);
    try {
      const [cData, fData] = await Promise.allSettled([
        apiFetch('/community/conversations'),
        apiFetch('/community/friends'),
      ]);

      if (cData.status === 'fulfilled') {
        const convList: any = cData.value;
        setConversations(convList);
        if (convList.length > 0 && !activeConv) {
          selectConversation(convList[0]);
        }
      }
      if (fData.status === 'fulfilled') setFriends(fData.value as any[]);
    } catch {}
    setLoading(false);
  };

  const selectConversation = async (conv: any) => {
    setActiveConv(conv);
    try {
      const msgs: any = await apiFetch(`/community/conversations/${conv.id}/messages`);
      setMessages(msgs);
    } catch {}
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConv) return;

    try {
      const sent: any = await apiFetch('/community/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: activeConv.id,
          content: messageInput.trim(),
        }),
      });
      setMessages((prev) => [...prev, sent]);
      setMessageInput('');
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    }
  };

  const createGroupChat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newConv: any = await apiFetch('/community/conversations', {
        method: 'POST',
        body: JSON.stringify({
          title: newGroupTitle.trim() || 'Study Group',
          isGroup: true,
          initialMessage: 'Hey everyone! Welcome to the study channel.',
        }),
      });
      setNewChatModal(false);
      setNewGroupTitle('');
      loadCommunity();
      selectConversation(newConv);
    } catch (err: any) {
      alert(err.message || 'Could not create conversation');
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Community & Channels</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Course discussion groups, study circles, peer messaging, and student connections.
            </p>
          </div>
          <Button size="sm" onClick={() => setNewChatModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New Channel
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[650px]">
          {/* Left Sidebar: Conversations & Friends */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Conversations</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {conversations.length > 0 ? (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectConversation(c)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                      activeConv?.id === c.id ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {c.isGroup ? <Users className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{c.title}</h4>
                        {c.lastMessage && (
                          <span className="text-[10px] text-slate-400">
                            {formatTime(c.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {c.lastMessage ? c.lastMessage.content : 'No messages yet'}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">No active conversations</div>
              )}
            </div>
          </div>

          {/* Right Main: Active Chat Window */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {activeConv.isGroup ? <Users className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{activeConv.title}</h3>
                      <p className="text-[10px] text-slate-500">{activeConv.memberNames?.join(', ') || 'Members'}</p>
                    </div>
                  </div>
                  {activeConv.courseName && (
                    <Badge variant="primary">{activeConv.courseName}</Badge>
                  )}
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                  {messages.length > 0 ? (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.userId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          {!isMe && (
                            <span className="text-[10px] font-semibold text-slate-500 mb-1 px-1">
                              {msg.senderName}
                            </span>
                          )}
                          <div
                            className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-blue-600 text-white rounded-br-xs shadow-sm'
                                : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                            }`}
                          >
                            {msg.content}
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 px-1">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400">
                      Be the first to send a message in this channel!
                    </div>
                  )}
                </div>

                {/* Message Input Box */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button type="submit" size="sm">
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Send
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <EmptyState
                  icon={<MessageSquare className="w-6 h-6" />}
                  title="No conversation selected"
                  description="Choose a conversation on the left or create a new channel."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Channel Modal */}
      <Modal isOpen={newChatModal} onClose={() => setNewChatModal(false)} title="Create Study Channel">
        <form onSubmit={createGroupChat} className="space-y-4">
          <Input
            label="Channel Title"
            placeholder="e.g. CS301 Study Circle"
            value={newGroupTitle}
            onChange={(e) => setNewGroupTitle(e.target.value)}
            required
          />
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setNewChatModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Channel</Button>
          </div>
        </form>
      </Modal>
    </StudentLayout>
  );
}
