import { mockSignals } from "../data/mockSignals";
import { delay } from "./simulatedLatency";

export async function fetchSignals(projectId) {
  await delay(550);
  const scoped = projectId ? mockSignals.filter((s) => s.projectId === projectId) : mockSignals;
  // Newest first, like a real live feed.
  return [...scoped].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}
