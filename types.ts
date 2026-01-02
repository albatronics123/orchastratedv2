
export type UserStatus = 'waitlist' | 'active';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  status: UserStatus;
  security_phrase?: string;
  theme_mode?: 'light' | 'dark';
  theme_primary?: string;
  theme_accent?: string;
}

export type PlatformType = 'whatsapp' | 'linkedin' | 'gmail' | 'instagram' | 'telegram';

export interface Conversation {
  id: string;
  platform: PlatformType;
  contactName: string;
  contactAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'contact';
  content: string;
  timestamp: string;
}

export interface LLMKey {
  id: string;
  provider: 'gemini' | 'openai' | 'claude';
  apiKey: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Suggestion {
  tone: 'Professional' | 'Friendly' | 'Casual';
  text: string;
}
