"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CareerOSState, ChatMessage, LLMConfig } from "@/types";
import { createInitialState, todayISO } from "@/data/seed";

export const STORAGE_KEY = "ai-career-os-state";

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export interface CareerOSActions {
  // settings
  setTheme: (theme: "dark" | "light") => void;
  toggleSidebar: () => void;
  // profile / salary / market
  updateProfile: (patch: Partial<CareerOSState["profile"]>) => void;
  updateSalary: (patch: Partial<CareerOSState["salary"]>) => void;
  updateMarketMetric: (id: string, patch: Partial<CareerOSState["marketMetrics"][number]>) => void;
  // skills
  setSkillStatus: (moduleId: string, groupId: string, itemId: string, status: CareerOSState["skills"][number]["groups"][number]["items"][number]["status"]) => void;
  setRagItemStatus: (list: "ragArchitectures" | "ragEvals", id: string, status: "Not Started" | "Learning" | "Practiced" | "Project Applied" | "Interview Ready") => void;
  toggleFailureMode: (id: string) => void;
  updateFailureMode: (id: string, patch: Partial<CareerOSState["ragFailureModes"][number]>) => void;
  // projects
  addProject: (project: Omit<CareerOSState["projects"][number], "id">) => void;
  updateProject: (id: string, patch: Partial<CareerOSState["projects"][number]>) => void;
  deleteProject: (id: string) => void;
  moveProject: (id: string, status: CareerOSState["projects"][number]["status"]) => void;
  // certifications
  addCertification: (cert: Omit<CareerOSState["certifications"][number], "id">) => void;
  updateCertification: (id: string, patch: Partial<CareerOSState["certifications"][number]>) => void;
  deleteCertification: (id: string) => void;
  // applications
  addApplication: (app: Omit<CareerOSState["applications"][number], "id">) => void;
  updateApplication: (id: string, patch: Partial<CareerOSState["applications"][number]>) => void;
  deleteApplication: (id: string) => void;
  // contacts
  addContact: (contact: Omit<CareerOSState["contacts"][number], "id">) => void;
  updateContact: (id: string, patch: Partial<CareerOSState["contacts"][number]>) => void;
  deleteContact: (id: string) => void;
  // stories
  addStory: (story: Omit<CareerOSState["stories"][number], "id">) => void;
  updateStory: (id: string, patch: Partial<CareerOSState["stories"][number]>) => void;
  deleteStory: (id: string) => void;
  // resume
  addBullet: (bullet: Omit<CareerOSState["resumeBullets"][number], "id">) => void;
  updateBullet: (id: string, patch: Partial<CareerOSState["resumeBullets"][number]>) => void;
  deleteBullet: (id: string) => void;
  toggleNarrative: (key: keyof CareerOSState["narrativeChecklist"]) => void;
  // linkedin
  toggleLinkedinChecklist: (key: keyof CareerOSState["linkedinChecklist"]) => void;
  setHeadline: (headline: string) => void;
  toggleKeywordSurface: (keyword: string, surface: CareerOSState["keywords"][number]["surfaces"][number]) => void;
  addKeyword: (keyword: string) => void;
  deleteKeyword: (keyword: string) => void;
  addPost: (post: Omit<CareerOSState["linkedinPosts"][number], "id">) => void;
  updatePost: (id: string, patch: Partial<CareerOSState["linkedinPosts"][number]>) => void;
  deletePost: (id: string) => void;
  // productivity
  setDailyFocus: (items: string[]) => void;
  toggleDailyFocusItem: (itemId: string) => void;
  setWeeklyGoals: (patch: Partial<CareerOSState["weeklyGoals"]>) => void;
  recordStreakActivity: () => void;
  // system
  resetWorkspace: () => void;
  importState: (data: CareerOSState) => void;
  // AI assistant
  setLLM: (patch: Partial<LLMConfig>) => void;
  addChatMessage: (message: Omit<ChatMessage, "id" | "createdAt">) => void;
  updateChatMessage: (id: string, patch: Partial<ChatMessage>) => void;
  clearChat: () => void;
}

export type Store = CareerOSState & CareerOSActions;

export const useStore = create<Store>()(
  persist(
    (set) => ({
      ...createInitialState(),

      setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),
      toggleSidebar: () => set((s) => ({ settings: { ...s.settings, sidebarCollapsed: !s.settings.sidebarCollapsed } })),

      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      updateSalary: (patch) => set((s) => ({ salary: { ...s.salary, ...patch } })),
      updateMarketMetric: (id, patch) =>
        set((s) => ({ marketMetrics: s.marketMetrics.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),

      setSkillStatus: (moduleId, groupId, itemId, status) =>
        set((s) => ({
          skills: s.skills.map((m) =>
            m.id !== moduleId ? m : {
              ...m,
              groups: m.groups.map((g) =>
                g.id !== groupId ? g : {
                  ...g,
                  items: g.items.map((i) => (i.id === itemId ? { ...i, status } : i)),
                },
              ),
            },
          ),
        })),

      setRagItemStatus: (list, id, status) =>
        set((s) => ({ [list]: s[list].map((i) => (i.id === id ? { ...i, status } : i)) })),

      toggleFailureMode: (id) =>
        set((s) => ({ ragFailureModes: s.ragFailureModes.map((f) => (f.id === id ? { ...f, understood: !f.understood } : f)) })),
      updateFailureMode: (id, patch) =>
        set((s) => ({ ragFailureModes: s.ragFailureModes.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),

      addProject: (project) => set((s) => ({ projects: [...s.projects, { ...project, id: uid() }] })),
      updateProject: (id, patch) => set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      moveProject: (id, status) => set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, status } : p)) })),

      addCertification: (cert) => set((s) => ({ certifications: [...s.certifications, { ...cert, id: uid() }] })),
      updateCertification: (id, patch) =>
        set((s) => ({ certifications: s.certifications.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCertification: (id) => set((s) => ({ certifications: s.certifications.filter((c) => c.id !== id) })),

      addApplication: (app) => set((s) => ({ applications: [...s.applications, { ...app, id: uid() }] })),
      updateApplication: (id, patch) =>
        set((s) => ({ applications: s.applications.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      deleteApplication: (id) => set((s) => ({ applications: s.applications.filter((a) => a.id !== id) })),

      addContact: (contact) => set((s) => ({ contacts: [...s.contacts, { ...contact, id: uid() }] })),
      updateContact: (id, patch) => set((s) => ({ contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteContact: (id) => set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),

      addStory: (story) => set((s) => ({ stories: [...s.stories, { ...story, id: uid() }] })),
      updateStory: (id, patch) => set((s) => ({ stories: s.stories.map((st) => (st.id === id ? { ...st, ...patch } : st)) })),
      deleteStory: (id) => set((s) => ({ stories: s.stories.filter((st) => st.id !== id) })),

      addBullet: (bullet) => set((s) => ({ resumeBullets: [...s.resumeBullets, { ...bullet, id: uid() }] })),
      updateBullet: (id, patch) => set((s) => ({ resumeBullets: s.resumeBullets.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
      deleteBullet: (id) => set((s) => ({ resumeBullets: s.resumeBullets.filter((b) => b.id !== id) })),
      toggleNarrative: (key) => set((s) => ({ narrativeChecklist: { ...s.narrativeChecklist, [key]: !s.narrativeChecklist[key] } })),

      toggleLinkedinChecklist: (key) => set((s) => ({ linkedinChecklist: { ...s.linkedinChecklist, [key]: !s.linkedinChecklist[key] } })),
      setHeadline: (headline) => set({ linkedinHeadline: headline }),
      toggleKeywordSurface: (keyword, surface) =>
        set((s) => ({
          keywords: s.keywords.map((k) =>
            k.keyword !== keyword ? k : {
              ...k,
              surfaces: k.surfaces.includes(surface) ? k.surfaces.filter((x) => x !== surface) : [...k.surfaces, surface],
            },
          ),
        })),
      addKeyword: (keyword) =>
        set((s) =>
          s.keywords.some((k) => k.keyword.toLowerCase() === keyword.toLowerCase())
            ? s
            : { keywords: [...s.keywords, { keyword, surfaces: [] }] },
        ),
      deleteKeyword: (keyword) => set((s) => ({ keywords: s.keywords.filter((k) => k.keyword !== keyword) })),

      addPost: (post) => set((s) => ({ linkedinPosts: [...s.linkedinPosts, { ...post, id: uid() }] })),
      updatePost: (id, patch) => set((s) => ({ linkedinPosts: s.linkedinPosts.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      deletePost: (id) => set((s) => ({ linkedinPosts: s.linkedinPosts.filter((p) => p.id !== id) })),

      setDailyFocus: (texts) =>
        set((s) => ({
          dailyFocus: {
            date: todayISO(),
            items: texts.slice(0, 3).map((text, idx) => {
              const existing = s.dailyFocus.date === todayISO() ? s.dailyFocus.items[idx] : undefined;
              return { id: existing?.id ?? uid(), text, done: existing?.done ?? false };
            }),
          },
        })),
      toggleDailyFocusItem: (itemId) =>
        set((s) => ({
          dailyFocus: {
            ...s.dailyFocus,
            items: s.dailyFocus.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)),
          },
        })),
      setWeeklyGoals: (patch) => set((s) => ({ weeklyGoals: { ...s.weeklyGoals, ...patch } })),

      recordStreakActivity: () =>
        set((s) => {
          const today = todayISO();
          if (s.streak.history.includes(today)) return s;
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          const streak = s.streak.history.includes(yesterday) ? s.streak.currentStreak + 1 : 1;
          return { streak: { currentStreak: streak, lastActiveDate: today, history: [...s.streak.history.slice(-365), today] } };
        }),

      resetWorkspace: () => set({ ...createInitialState() }),
      importState: (data) => set({ ...data }),

      setLLM: (patch) => set((s) => ({ llm: { ...s.llm, ...patch } })),
      addChatMessage: (message) =>
        set((s) => ({
          chat: [...s.chat, { ...message, id: uid(), createdAt: Date.now() }],
        })),
      updateChatMessage: (id, patch) =>
        set((s) => ({ chat: s.chat.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      clearChat: () => set({ chat: [] }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<CareerOSState>;
        // Shallow-merge persisted data over defaults so newly added state keys
        // (e.g. llm, chat) exist even in older saved workspaces.
        return { ...current, ...p, settings: { ...current.settings, ...p.settings } };
      },
    },
  ),
);
