import type { User } from "@/features/auth/types";

export interface ApiChatMessage {
  id: number;
  traveler: number | null;
  travelerName: string;
  user: User | null;
  body: string;
  createdAt: string;
  isSystem: boolean;
  isUnread: boolean;
}

export interface ChatMessage extends ApiChatMessage {
  author: string;
  type: "user" | "system";
}

export interface CreateMessageData {
  body: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
