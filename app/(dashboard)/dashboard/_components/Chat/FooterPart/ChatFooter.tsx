'use client';

import React, { useState, KeyboardEvent } from 'react';
import { HiPaperClip, HiPaperAirplane } from 'react-icons/hi';

interface ChatFooterProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatFooter({ onSendMessage, disabled = false }: ChatFooterProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-20 bg-white border-t border-gray-200 flex items-center gap-3 px-6">
      <button
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        aria-label="Attach file"
        disabled={disabled}
      >
        <HiPaperClip className="w-5 h-5" />
      </button>
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nachricht schreiben..."
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#61A175] focus:border-transparent resize-none max-h-32"
          rows={1}
          disabled={disabled}
          style={{
            minHeight: '44px',
            maxHeight: '128px',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
          }}
        />
      </div>
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className={`p-3 rounded-lg transition-colors ${
          disabled || !message.trim()
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[#61A175] text-white hover:bg-[#4f8360]'
        }`}
        aria-label="Send message"
      >
        <HiPaperAirplane className="w-5 h-5" />
      </button>
    </div>
  );
}

