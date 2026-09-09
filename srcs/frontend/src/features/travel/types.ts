export interface Travel {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  travelers: { id: number; initials: string; name: string }[];
  inviteToken: string;
  status: "current" | "finished";
  createdAt: string;
  updatedAt: string;
}
