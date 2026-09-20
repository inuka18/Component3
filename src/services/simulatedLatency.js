// Small helper shared by every service module to simulate real network
// latency for mock data. Swap a service's internals for real `fetch` calls
// later and every hook/component that consumes it keeps working unchanged.
export function delay(ms = 450) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
