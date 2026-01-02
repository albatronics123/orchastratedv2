
import { Conversation, Message, PlatformType } from './types';

export const PLATFORMS: { type: any; name: string; color: string; icon: string }[] = [
  { type: 'whatsapp', name: 'WhatsApp', color: '#25D366', icon: 'chat' },
  { type: 'linkedin', name: 'LinkedIn', color: '#0077b5', icon: 'work' },
  { type: 'gmail', name: 'Gmail', color: '#EA4335', icon: 'mail' },
  { type: 'instagram', name: 'Instagram', color: '#E4405F', icon: 'camera_alt' },
  { type: 'telegram', name: 'Telegram', color: '#0088cc', icon: 'send' },
  { type: 'google_calendar', name: 'Google Calendar', color: '#4285F4', icon: 'calendar_today' },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    platform: 'linkedin',
    contactName: 'Sarah Jenkins',
    contactAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU6k016TxDafd-9bRzabTi5KEzmOHEjUHqPuD7KEQrhnc9V-HpXj3t0lfsNnAZIMgsrwTCVhXWqEak_O48TEdIzofUKlu3m_urxcS492uDoar4ysmxYr9wJqET92Z0-sl928MXZMDm4koawH5FfNY24VtxOhMOAK8lWK0DUjEokn4pcj2yUsG8y9o_D8RckfiCRtdyy2pafzPj4O2WevMydeo-DrADfdBvihuBytnX_1XdbboSm4hfIq1Yi0YrSMJ8Wty4rM0QRD3n',
    lastMessage: 'Muted new visuals, Flexstra for Watch statistics...',
    lastMessageTime: '1 minute ago',
    unreadCount: 1,
  }
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', conversationId: '1', sender: 'contact', content: 'Hello, thanks for much reasonting...', timestamp: '8:30 am' },
  ]
};
