export interface User {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  phone?: string;
  status?: "online" | "offline" | "away";
  lastSeen?: string;
  bio?: string;
  department?: string;
  role?: string;
}

export interface GroupMember {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  role: "admin" | "member";
  joinedAt: string;
}

export interface Message {
  messageId: string;
  chatType: "normal" | "system";
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  type: string;
  isRead?: boolean;
  readBy?: string[];
  deliveredAt?: string;
  readAt?: string;
  systemAction?: string;
  actionBy?: {
    userId: string;
    userName: string;
    userAvatar: string;
  };
  oldValue?: string;
  newValue?: string;
}

export interface Group {
  groupId: string;
  groupName: string;
  groupDescription?: string;
  groupAvatar?: string;
  createdAt: string;
  members: GroupMember[];
  messages: Message[];
  lastMessage?: {
    messageId: string;
    content: string;
    timestamp: string;
    senderName: string;
  };
  unreadCount: number;
  isMuted: boolean;
}

export interface IndividualChat {
  chatId: string;
  participants: User[];
  messages: Message[];
  lastMessage?: {
    messageId: string;
    content: string;
    timestamp: string;
    senderName: string;
  };
  unreadCount: number;
  createdAt: string;
  isPinned: boolean;
  isMuted: boolean;
}

export interface ChatData {
  groups: Group[];
  individualChats: IndividualChat[];
  users: User[];
  settings?: any;
}

