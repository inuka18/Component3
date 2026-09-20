// The two demo projects switching between which visibly changes every
// other screen in the app (requirements, schedule, team, meetings,
// retrospectives). Health/sprint fields are illustrative, a real backend
// would compute these from live schedule + gap-detection data.

export const HEALTH_STATUS = {
  "on-track": { label: "On Track", dotClass: "bg-status-confirmed-fg" },
  "at-risk": { label: "At Risk", dotClass: "bg-status-atrisk-fg" },
  delayed: { label: "Delayed", dotClass: "bg-status-dropped-fg" },
};

export const mockProjects = [
  {
    id: "proj-novacart",
    name: "NovaCart",
    colorTag: "#6366f1",
    shortDescription: "E-commerce platform with an embedded NovaPay wallet.",
    description:
      "A consumer e-commerce platform combining catalog, checkout, and fulfillment with an embedded NovaPay digital wallet, built to reduce checkout friction while meeting fintech-grade compliance and fraud requirements.",
    startDate: "2026-06-01T09:00:00+05:30",
    activeSprint: {
      name: "Sprint 6: Wallet & Fraud Hardening",
      number: 6,
      startDate: "2026-08-17T09:00:00+05:30",
      endDate: "2026-08-30T18:00:00+05:30",
    },
    health: "at-risk",
  },
  {
    id: "proj-meridianpay",
    name: "Meridian Pay",
    colorTag: "#0ea5e9",
    shortDescription: "Digital banking app for savings, transfers, and budgeting.",
    description:
      "A consumer digital banking application covering account onboarding, peer-to-peer transfers, savings goals, and spend-tracking, built to a full regulatory compliance and fraud-monitoring bar from day one.",
    startDate: "2026-07-06T09:00:00+05:30",
    activeSprint: {
      name: "Sprint 3: Onboarding & Compliance",
      number: 3,
      startDate: "2026-08-19T09:00:00+05:30",
      endDate: "2026-09-01T18:00:00+05:30",
    },
    health: "on-track",
  },
];

export function getProjectById(id) {
  return mockProjects.find((p) => p.id === id);
}
