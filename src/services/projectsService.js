import { mockProjects, getProjectById } from "../data/mockProjects";
import { delay } from "./simulatedLatency";

export async function fetchProjects() {
  await delay(400);
  return mockProjects;
}

export async function fetchProjectById(id) {
  await delay(200);
  return getProjectById(id) ?? null;
}
