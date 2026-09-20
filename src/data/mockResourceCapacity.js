// Per-sprint resource capacity snapshot for Component 2: Gap Detection's
// resource-gap analysis. `memberId` cross-references mockTeam.js so a row
// here always corresponds to a real team roster entry; `plannedHours` vs
// `availableHours` is what drives a Resource gap, and `loggedHours` is
// what's actually been logged so far this sprint (see LogTimeDialog in the
// Schedule feature, same underlying idea, viewed from a capacity angle).
// `offToday`/`returnDate` are optional, set only on the handful of rows
// that are on PTO on the fixed TODAY date, read by Component 3's Day View
// "Off Today" panel.

export const CAPACITY_STATUSES = ["Over-allocated", "Near Capacity", "Balanced", "Under-utilized"];

export const mockResourceCapacity = [
  // ---- NovaCart ----
  {
    id: "cap-nc-01",
    projectId: "proj-novacart",
    memberId: "tm-09",
    name: "Amaya Wijesinghe",
    role: "Backend Developer",
    plannedHours: 88,
    availableHours: 80,
    loggedHours: 52,
    status: "Over-allocated",
  },
  {
    id: "cap-nc-02",
    projectId: "proj-novacart",
    memberId: "tm-04",
    name: "Kavindu Silva",
    role: "Frontend Developer",
    plannedHours: 76,
    availableHours: 80,
    loggedHours: 48,
    status: "Near Capacity",
  },
  {
    id: "cap-nc-03",
    projectId: "proj-novacart",
    memberId: "tm-03",
    name: "Ruwan Jayasuriya",
    role: "Security Engineer",
    plannedHours: 70,
    availableHours: 80,
    loggedHours: 44,
    status: "Near Capacity",
  },
  {
    id: "cap-nc-04",
    projectId: "proj-novacart",
    memberId: "tm-05",
    name: "Dinithi Perera",
    role: "Backend Developer",
    plannedHours: 64,
    availableHours: 80,
    loggedHours: 40,
    status: "Balanced",
  },
  {
    id: "cap-nc-05",
    projectId: "proj-novacart",
    memberId: "tm-10",
    name: "Nimali Ratnayake",
    role: "Security Engineer",
    plannedHours: 54,
    availableHours: 80,
    loggedHours: 34,
    status: "Balanced",
  },
  {
    id: "cap-nc-06",
    projectId: "proj-novacart",
    memberId: "tm-08",
    name: "Hansini Gunawardena",
    role: "Data Analyst",
    plannedHours: 44,
    availableHours: 80,
    loggedHours: 20,
    status: "Under-utilized",
    offToday: true,
    returnDate: "2026-09-02T09:00:00+05:30",
  },

  // ---- Meridian Pay ----
  {
    id: "cap-mp-01",
    projectId: "proj-meridianpay",
    memberId: "tm-12",
    name: "Chamika Rathnayake",
    role: "Backend Developer",
    plannedHours: 72,
    availableHours: 80,
    loggedHours: 46,
    status: "Near Capacity",
  },
  {
    id: "cap-mp-02",
    projectId: "proj-meridianpay",
    memberId: "tm-14",
    name: "Malith Perera",
    role: "Frontend Developer",
    plannedHours: 66,
    availableHours: 80,
    loggedHours: 40,
    status: "Balanced",
  },
  {
    id: "cap-mp-03",
    projectId: "proj-meridianpay",
    memberId: "tm-13",
    name: "Yasodha Wijeratne",
    role: "Backend Developer",
    plannedHours: 60,
    availableHours: 80,
    loggedHours: 36,
    status: "Balanced",
  },
  {
    id: "cap-mp-04",
    projectId: "proj-meridianpay",
    memberId: "tm-17",
    name: "Chathurika Abeywardena",
    role: "Security Engineer",
    plannedHours: 56,
    availableHours: 80,
    loggedHours: 34,
    status: "Balanced",
  },
  {
    id: "cap-mp-05",
    projectId: "proj-meridianpay",
    memberId: "tm-16",
    name: "Buddhika Senanayake",
    role: "DevOps Engineer",
    plannedHours: 51,
    availableHours: 80,
    loggedHours: 30,
    status: "Balanced",
    offToday: true,
    returnDate: "2026-08-31T09:00:00+05:30",
  },
  {
    id: "cap-mp-06",
    projectId: "proj-meridianpay",
    memberId: "tm-18",
    name: "Nuwan Karunaratne",
    role: "Data Analyst",
    plannedHours: 40,
    availableHours: 80,
    loggedHours: 18,
    status: "Under-utilized",
  },
];

export function getResourceCapacityForProject(projectId) {
  return mockResourceCapacity.filter((c) => c.projectId === projectId);
}

export function getResourceCapacityByMemberId(memberId, projectId) {
  return mockResourceCapacity.find((c) => c.memberId === memberId && c.projectId === projectId);
}
