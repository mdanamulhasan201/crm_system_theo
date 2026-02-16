'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { HiHashtag, HiUser, HiChevronDown, HiChevronRight, HiSearch, HiPlus } from 'react-icons/hi';
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import { ChatData, Group, IndividualChat } from '../types';

interface ChatSidebarProps {
  selectedChatId?: string;
  selectedChatType?: 'group' | 'individual';
  onChatSelect: (chatId: string, type: 'group' | 'individual') => void;
}

export default function ChatSidebar({ selectedChatId, selectedChatType, onChatSelect }: ChatSidebarProps) {
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [directMessagesExpanded, setDirectMessagesExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const response = await fetch('/data/chatData.json');
        const data = await response.json();
        setChatData(data);
      } catch (error) {
        console.error('Error fetching chat data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Gestern';
    } else {
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const filteredGroups = chatData?.groups.filter((group) =>
    group.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredIndividualChats = chatData?.individualChats.filter((chat) => {
    const participant = chat.participants?.[0];
    return (
      participant?.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) || [];

  if (loading) {
    return (
      <div className="w-80 bg-[#61A175] h-full flex items-center justify-center shadow-xl">
        <div className="text-white animate-pulse">Lädt...</div>
      </div>
    );
  }

  if (!chatData) {
    return (
      <div className="w-80 bg-[#61A175] h-full flex items-center justify-center shadow-xl">
        <div className="text-white">Keine Chat-Daten verfügbar</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[#61A175] h-full flex flex-col text-white overflow-hidden min-h-0 shadow-2xl">
      {/* Header */}
      <div className="p-5 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg">
              <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Team-Chat</h2>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <HiPlus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
          <input
            type="text"
            placeholder="Chats suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Groups Section */}
        <div className="px-4 py-3">
          <button
            onClick={() => setChannelsExpanded(!channelsExpanded)}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors mb-3 px-2 py-1.5 rounded-md hover:bg-white/5"
          >
            <span className="flex items-center gap-2">
              <HiHashtag className="w-4 h-4" />
              <span>GRUPPEN</span>
              <span className="text-white/50 text-[10px] font-normal">({filteredGroups.length})</span>
            </span>
            {channelsExpanded ? (
              <HiChevronDown className="w-4 h-4 transition-transform" />
            ) : (
              <HiChevronRight className="w-4 h-4 transition-transform" />
            )}
          </button>

          {channelsExpanded && (
            <div className="space-y-1">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-4 text-white/50 text-sm">Keine Gruppen gefunden</div>
              ) : (
                filteredGroups.map((group) => {
                  const isSelected = selectedChatId === group.groupId && selectedChatType === 'group';
                  return (
                    <button
                      key={group.groupId}
                      onClick={() => onChatSelect(group.groupId, 'group')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                        isSelected
                          ? 'bg-white/25 text-white shadow cursor-pointer shadow-black/10'
                          : 'text-white/80 hover:bg-white/15 hover:text-white hover:shadow-md cursor-pointer'
                      }`}
                    >
                      <div className={`shrink-0 p-1.5 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/15'}`}>
                        <HiHashtag className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-semibold text-sm truncate mb-0.5">{group.groupName}</div>
                        {group.lastMessage && (
                          <div className="text-xs text-white/60 truncate">
                            <span className="font-medium text-white/70">{group.lastMessage.senderName}:</span>{' '}
                            {group.lastMessage.content}
                          </div>
                        )}
                      </div>
                      {group.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center shadow-lg">
                          {group.unreadCount > 99 ? '99+' : group.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Direct Messages Section */}
        <div className="px-4 py-3 mt-2 border-t border-white/10">
          <button
            onClick={() => setDirectMessagesExpanded(!directMessagesExpanded)}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors mb-3 px-2 py-1.5 rounded-md hover:bg-white/5"
          >
            <span className="flex items-center gap-2">
              <HiUser className="w-4 h-4" />
              <span>DIREKTNACHRICHTEN</span>
              <span className="text-white/50 text-[10px] font-normal">({filteredIndividualChats.length})</span>
            </span>
            {directMessagesExpanded ? (
              <HiChevronDown className="w-4 h-4 transition-transform" />
            ) : (
              <HiChevronRight className="w-4 h-4 transition-transform" />
            )}
          </button>

          {directMessagesExpanded && (
            <div className="space-y-1">
              {filteredIndividualChats.length === 0 ? (
                <div className="text-center py-4 text-white/50 text-sm">Keine Nachrichten gefunden</div>
              ) : (
                filteredIndividualChats
                  .filter((chat) => chat?.participants && chat.participants.length > 0)
                  .map((chat) => {
                    const isSelected = selectedChatId === chat.chatId && selectedChatType === 'individual';
                    // Get the first participant (assuming current user is not in the list or is second)
                    const otherParticipant = chat.participants?.[0];
                    const status = otherParticipant?.status || 'offline';
                    
                    // Skip if no participant found
                    if (!otherParticipant) return null;
                  
                  return (
                    <button
                      key={chat.chatId}
                      onClick={() => onChatSelect(chat.chatId, 'individual')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                        isSelected
                          ? 'bg-white/25 cursor-pointer text-white shadow shadow-black/10'
                          : 'text-white/80 hover:bg-white/15 hover:text-white hover:shadow-md cursor-pointer'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {otherParticipant?.userAvatar ? (
                          <div className="w-11 h-11 rounded-full overflow-hidden relative ring-2 ring-white/20">
                            <Image
                              src={otherParticipant.userAvatar}
                              alt={otherParticipant.userName}
                              width={44}
                              height={44}
                              className="object-cover"
                              onError={() => {}}
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center text-sm font-bold ring-2 ring-white/20">
                            {getInitials(otherParticipant?.userName || 'U')}
                          </div>
                        )}
                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${getStatusColor(status)} rounded-full border-2 border-[#61A175] shadow-sm`} />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-semibold text-sm truncate mb-0.5">{otherParticipant?.userName}</div>
                        {chat.lastMessage && (
                          <div className="text-xs text-white/60 truncate">
                            {chat.lastMessage.content}
                          </div>
                        )}
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center shadow-lg">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
