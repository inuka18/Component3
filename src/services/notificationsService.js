import { mockNotifications } from "../data/mockNotifications";
import { delay } from "./simulatedLatency";

export async function fetchNotifications() {
  await delay(300);
  return mockNotifications;
}
