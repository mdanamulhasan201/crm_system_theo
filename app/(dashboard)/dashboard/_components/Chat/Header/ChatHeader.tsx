'use client';

import React from 'react';
import Image from 'next/image';
import { HiArrowLeft, HiDotsVertical } from 'react-icons/hi';
import { Group, IndividualChat } from '../types';

interface ChatHeaderProps {
  chat: Group | IndividualChat | null;
  chatType: 'group' | 'individual' | null;
  onBack?: () => void;
}

export default function ChatHeader({ chat, chatType, onBack }: ChatHeaderProps) {
  if (!chat) {
    return (
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Team-Chat</h2>
          <p className="text-sm text-gray-500">Sprechen Sie mit Ihren Kollegen.</p>
        </div>
      </div>
    );
  }

  const getChatTitle = () => {
    if (chatType === 'group') {
      return (chat as Group).groupName || 'Group Chat';
    } else {
      const individualChat = chat as IndividualChat;
      const participant = individualChat?.participants?.[0];
      return participant?.userName || 'Chat';
    }
  };

  const getChatAvatar = () => {
    if (chatType === 'group') {
      const group = chat as Group;
      return group?.groupAvatar;
    } else {
      const individualChat = chat as IndividualChat;
      const participant = individualChat?.participants?.[0];
      return participant?.userAvatar;
    }
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string') return 'C';
    const parts = name.trim().split(' ').filter(n => n.length > 0);
    if (parts.length === 0) return 'C';
    return parts
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back"
          >
            <HiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <div className="flex items-center gap-3">
          {getChatAvatar() ? (
            <div className="w-10 h-10 rounded-full overflow-hidden relative">
              <Image
                src={getChatAvatar() || ''}
                alt={getChatTitle()}
                width={40}
                height={40}
                className="object-cover"
                onError={() => {}}
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#61A175] flex items-center justify-center text-white font-semibold">
              {getInitials(getChatTitle())}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{getChatTitle()}</h2>
            {chatType === 'group' && (chat as Group).groupDescription && (
              <p className="text-xs text-gray-500">{(chat as Group).groupDescription}</p>
            )}
            {chatType === 'individual' && (chat as IndividualChat)?.participants?.[0]?.status && (
              <p className="text-xs text-gray-500 capitalize">
                {(chat as IndividualChat).participants[0].status}
              </p>
            )}
          </div>
        </div>
      </div>
      <button
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="More options"
      >
        <HiDotsVertical className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}

