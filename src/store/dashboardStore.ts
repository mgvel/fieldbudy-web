import { create } from 'zustand';

interface Project {
  _id: string;
  // Add any other project fields
}

interface AppUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  // Add any other user fields
}

interface DashboardState {
  projects: Project[];
  users: AppUser[];
  setProjects: (projects: Project[]) => void;
  setUsers: (users: AppUser[]) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  projects: [],
  users: [],
  setProjects: (projects) => set({ projects }),
  setUsers: (users) => set({ users }),
}));
