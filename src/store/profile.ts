import { defineStore } from "pinia";
import { getProfile, type ProfileView } from "@/api/profile";

export interface StayDraft {
  homeTypes: string[];
  spaceFeatures: string[];
  livingNeeds: string[];
}

export const useProfileStore = defineStore("profile", {
  state: () => ({
    profile: null as ProfileView | null,
    stayDraft: null as StayDraft | null,
  }),

  getters: {
    isCompleted: (state) => Boolean(state.profile?.profileCompletedAt),
  },

  actions: {
    async load() {
      this.profile = await getProfile();
      return this.profile;
    },

    setStayDraft(draft: StayDraft) {
      this.stayDraft = draft;
    },
  },
});
