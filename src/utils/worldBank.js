export async function fetchWorldBank(url, signal) {
  return fetch(url, { signal });
}
