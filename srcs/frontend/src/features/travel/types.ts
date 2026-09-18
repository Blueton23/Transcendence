export interface Travel {
  id: number;
  travelers: { id: number; initials: string; name: string }[];
  title: string;
  startDate: string;
  endDate: string;
  nights: number;
  inviteToken: string;
  status: "current" | "finished";
  createdAt: string;
  updatedAt: string;
}
