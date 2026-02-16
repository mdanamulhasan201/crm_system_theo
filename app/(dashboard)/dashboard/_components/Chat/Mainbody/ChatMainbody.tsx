'use client';

import React, { useEffect, useRef } from 'react';
import { Group, IndividualChat, Message } from '../types';
import Image from 'next/image';

interface ChatMainbodyProps {
  chat: Group | IndividualChat | null;
  chatType: 'group' | 'individual' | null;
  currentUserId?: string;
}

export default function ChatMainbody({ chat, chatType, currentUserId = 'user-1' }: ChatMainbodyProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Heute';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Gestern';
      } else {
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    } catch {
      return '';
    }
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string') return 'U';
    const parts = name.trim().split(' ').filter(n => n.length > 0);
    if (parts.length === 0) return 'U';
    return parts
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const grouped: { [key: string]: Message[] } = {};
    if (!messages || !Array.isArray(messages)) return grouped;
    messages.forEach((message) => {
      if (!message.timestamp) return;
      try {
        const date = new Date(message.timestamp);
        if (isNaN(date.getTime())) return;
        const dateString = date.toDateString();
        if (!grouped[dateString]) {
          grouped[dateString] = [];
        }
        grouped[dateString].push(message);
      } catch {
        // Skip invalid dates
      }
    });
    return grouped;
  };

  const messages = chat?.messages || [];
  const groupedMessages = groupMessagesByDate(messages);
  const dates = Object.keys(groupedMessages).sort(
    (a, b) => {
      try {
        const dateA = new Date(a);
        const dateB = new Date(b);
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
        return dateA.getTime() - dateB.getTime();
      } catch {
        return 0;
      }
    }
  );

  const isMyMessage = (message: Message) => {
    return message.senderId === currentUserId;
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {dates.map((date) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-xs font-medium text-gray-500 px-3">
                {formatDate(groupedMessages[date][0].timestamp)}
              </span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Messages for this date */}
            <div className="space-y-4">
              {groupedMessages[date].map((message, index) => {
                const isMyMsg = isMyMessage(message);
                const showAvatar = !isMyMsg && message.chatType === 'normal';
                const prevMessage = index > 0 ? groupedMessages[date][index - 1] : null;
                const showSenderName = 
                  !isMyMsg && 
                  message.chatType === 'normal' &&
                  (!prevMessage || prevMessage.senderId !== message.senderId || prevMessage.chatType === 'system');

                // System Message
                if (message.chatType === 'system') {
                  return (
                    <div key={message.messageId} className="flex justify-center my-4">
                      <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full">
                        {message.content}
                      </div>
                    </div>
                  );
                }

                // Normal Message
                return (
                  <div
                    key={message.messageId}
                    className={`flex gap-3 ${isMyMsg ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    {showAvatar && (
                      <div className="shrink-0">
                        {message.senderAvatar ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden relative">
                            <Image

                              src={message.senderAvatar}
                              alt={message.senderName || 'User'}
                              width={32}
                              height={32}
                              className="object-cover"
                              onError={() => {}}
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#61A175] flex items-center justify-center text-white text-xs font-semibold">
                            {getInitials(message.senderName || 'U')}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Content */}
                    <div className={`flex flex-col ${isMyMsg ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      {showSenderName && (
                        <span className="text-xs text-gray-500 mb-1 px-2">
                          {message.senderName}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isMyMsg
                            ? 'bg-[#61A175] text-white'
                            : 'bg-white text-gray-800'
                        } shadow-sm`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <span className="text-xs text-gray-400 mt-1 px-2">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

