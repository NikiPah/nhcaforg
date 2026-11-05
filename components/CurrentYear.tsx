import { cacheLife } from "next/cache";

// Cached and revalidated daily, so the static page keeps the copyright
// year current without reading the clock on every request.
export async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
