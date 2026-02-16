'use client';

import React, { useState, useEffect } from 'react';
import ChatMainbody from '../_components/Chat/Mainbody/ChatMainbody';
import ChatSidebar from '../_components/Chat/Sidebar/ChatSidebar';
import ChatHeader from '../_components/Chat/Header/ChatHeader';
import ChatFooter from '../_components/Chat/FooterPart/ChatFooter';
import { ChatData, Group, IndividualChat, Message } from '../_components/Chat/types';

export default function TeamChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatType, setSelectedChatType] = useState<'group' | 'individual' | null>(null);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [selectedChat, setSelectedChat] = useState<Group | IndividualChat | null>(null);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const response = await fetch('/data/chatData.json');
        const data = await response.json();
        setChatData(data);
      } catch (error) {
        console.error('Error fetching chat data:', error);
      }
    };

    fetchChatData();
  }, []);

  useEffect(() => {
    if (!chatData || !selectedChatId || !selectedChatType) {
      setSelectedChat(null);
      return;
    }

    if (selectedChatType === 'group') {
      const group = chatData.groups.find(g => g.groupId === selectedChatId);
      setSelectedChat(group || null);
    } else {
      const individualChat = chatData.individualChats.find(c => c.chatId === selectedChatId);
      setSelectedChat(individualChat || null);
    }
  }, [chatData, selectedChatId, selectedChatType]);

  const handleChatSelect = (chatId: string, type: 'group' | 'individual') => {
    setSelectedChatId(chatId);
    setSelectedChatType(type);
  };

  const handleSendMessage = (messageContent: string) => {
    if (!selectedChat || !chatData || !messageContent.trim()) return;

    const newMessage: Message = {
      messageId: `msg-${Date.now()}`,
      chatType: 'normal',
      senderId: 'user-1',
      senderName: 'John Doe',
      senderAvatar: '/avatars/user-1.png',
      content: messageContent,
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: false,
    };

    // Update the chat data with the new message
    if (selectedChatType === 'group') {
      const updatedGroups = chatData.groups.map((group) => {
        if (group.groupId === selectedChatId) {
          const updatedGroup = {
            ...group,
            messages: [...group.messages, newMessage],
            lastMessage: {
              messageId: newMessage.messageId,
              content: newMessage.content,
              timestamp: newMessage.timestamp,
              senderName: newMessage.senderName || 'You',
            },
          };
          // Update selectedChat immediately
          setSelectedChat(updatedGroup);
          return updatedGroup;
        }
        return group;
      });
      setChatData({ ...chatData, groups: updatedGroups });
    } else {
      const updatedIndividualChats = chatData.individualChats.map((chat) => {
        if (chat.chatId === selectedChatId) {
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: {
              messageId: newMessage.messageId,
              content: newMessage.content,
              timestamp: newMessage.timestamp,
              senderName: newMessage.senderName || 'You',
            },
          };
          // Update selectedChat immediately
          setSelectedChat(updatedChat);
          return updatedChat;
        }
        return chat;
      });
      setChatData({ ...chatData, individualChats: updatedIndividualChats });
    }
  };

  return (
    <div className="absolute inset-0 flex overflow-hidden -m-4">
      {/* Chat Sidebar */}
      <div className="shrink-0">
        <ChatSidebar
          selectedChatId={selectedChatId || undefined}
          selectedChatType={selectedChatType || undefined}
          onChatSelect={handleChatSelect}
        />
      </div>

      {/* Chat Main Body */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          chat={selectedChat}
          chatType={selectedChatType}
        />
        <ChatMainbody
          chat={selectedChat}
          chatType={selectedChatType}
          currentUserId="user-1"
        />
        {selectedChat && (
          <ChatFooter
            onSendMessage={handleSendMessage}
            disabled={!selectedChat}
          />
        )}
      </div>
    </div>
  );
}
