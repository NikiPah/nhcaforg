import { json } from "@/lib/portal/server";

function retiredPortal() { return json({ error: "The assistance process has changed. Please use the inquiry form at /apply." }, 410); }
export { retiredPortal as GET, retiredPortal as POST, retiredPortal as DELETE };
