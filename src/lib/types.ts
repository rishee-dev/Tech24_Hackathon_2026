export type IssueStatus = 'reported' | 'accepted' | 'in-progress' | 'resolved';

export type IssuePriority = 'low' | 'medium' | 'high';

export type IssueCategory = 
  | 'roads' 
  | 'sanitation' 
  | 'utilities' 
  | 'public-safety' 
  | 'parks' 
  | 'other';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  imageUrl?: string;
  reportedBy: string;
  reportedAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  roads: 'Roads & Infrastructure',
  sanitation: 'Sanitation & Waste',
  utilities: 'Utilities & Lighting',
  'public-safety': 'Public Safety',
  parks: 'Parks & Recreation',
  other: 'Other',
};

export const STATUS_LABELS: Record<IssueStatus, string> = {
  reported: 'Reported',
  accepted: 'Accepted',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
};

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
