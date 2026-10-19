
export interface ApiChatMessage {
    id: number;
    traveler: number | null;
    travelerName: string;
    body: string;
    createdAt: string;
    isSystem: boolean;
  }
  
  export interface ChatMessage extends ApiChatMessage {
    author: string;
    type: "user" | "system";
    isUnread: boolean;
  }
  
  export interface CreateMessageData {
    body: string;
  }
  