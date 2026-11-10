export interface Travel {
  id: number;
  travelers: TravelerSummary[];
  invitations: InvitedTraveler[];
  title: string;
  startDate: string;
  endDate: string;
  nights: number;
  inviteToken: string;
  status: "current" | "finished";
  createdAt: string;
  updatedAt: string;
}

export interface TravelerSummary {
  id: number;
  initials: string;
  name: string;
}

export interface InvitedTraveler extends TravelerSummary {
  status: "invited" | "refused";
}

export interface CreateTravelData {
  startDate: string;
  endDate: string;
  title: string;
}

export interface Invitation extends Travel {
  isMember: boolean;
  isInvited: boolean;
}

export interface TravelNotification {
  travelId: number;
  travelTitle: string;
  unreadMessages: number;
  unseenIdeas: number;
}

export interface InvitationNotification {
  travelId: number;
  travelTitle: string;
  inviteToken: string;
}
