
const UNIPILE_TOKEN = 'H4wFcjeb.2Nt3r5+j+QI9l5JyWgtUxEj5ly+dsCOEBwmmZlmzwvc=';
const UNIPILE_BASE_URL = 'https://api15.unipile.com:14585/api/v1';

const headers = {
  'X-API-KEY': UNIPILE_TOKEN,
  'accept': 'application/json',
  'content-type': 'application/json'
};

export const unipileService = {
  /**
   * Fetch all connected accounts
   */
  async getAccounts() {
    try {
      const response = await fetch(`${UNIPILE_BASE_URL}/accounts`, { headers });
      if (!response.ok) throw new Error('Failed to fetch Unipile accounts');
      return await response.json();
    } catch (error) {
      console.error('Unipile Error:', error);
      return { items: [] };
    }
  },

  /**
   * Create a hosted connection link
   */
  async createHostedConnection(type: string) {
    try {
      // Unipile uses specific codes for providers
      const typeMap: Record<string, string> = {
        'GOOGLE_CALENDAR': 'GOOGLE',
        'GMAIL': 'GMAIL',
        'INSTAGRAM': 'INSTAGRAM',
        'TELEGRAM': 'TELEGRAM',
        'WHATSAPP': 'WHATSAPP',
        'LINKEDIN': 'LINKEDIN'
      };

      const response = await fetch(`${UNIPILE_BASE_URL}/hosted/accounts/link`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: typeMap[type.toUpperCase()] || type.toUpperCase(),
          success_url: window.location.origin + '?status=success',
          failure_url: window.location.origin + '?status=error',
          providers: type.toUpperCase() === 'GOOGLE_CALENDAR' ? ['calendar'] : undefined
        })
      });
      if (!response.ok) throw new Error('Failed to create connection link');
      return await response.json();
    } catch (error) {
      console.error('Unipile Connection Error:', error);
      throw error;
    }
  },

  /**
   * Fetch chats/conversations
   */
  async getChats() {
    try {
      const response = await fetch(`${UNIPILE_BASE_URL}/chats`, { headers });
      if (!response.ok) throw new Error('Failed to fetch Unipile chats');
      return await response.json();
    } catch (error) {
      console.error('Unipile Error:', error);
      return { items: [] };
    }
  },

  /**
   * Fetch messages
   */
  async getMessages(chatId: string) {
    try {
      const response = await fetch(`${UNIPILE_BASE_URL}/chats/${chatId}/messages`, { headers });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return await response.json();
    } catch (error) {
      console.error('Unipile Error:', error);
      return { items: [] };
    }
  },

  /**
   * Send a message
   */
  async sendMessage(chatId: string, text: string) {
    try {
      const response = await fetch(`${UNIPILE_BASE_URL}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          chat_id: chatId,
          text: text
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Unipile Send Error:', error);
      throw error;
    }
  },

  /**
   * Fetch Calendar Events
   */
  async getEvents() {
    try {
      const response = await fetch(`${UNIPILE_BASE_URL}/events`, { headers });
      if (!response.ok) throw new Error('Failed to fetch events');
      return await response.json();
    } catch (error) {
      console.error('Unipile Calendar Error:', error);
      return { items: [] };
    }
  }
};
