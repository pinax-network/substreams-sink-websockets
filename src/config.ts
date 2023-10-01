import "dotenv/config";

if (!process.env.PUBLIC_KEY) throw new Error("PUBLIC_KEY is required");
export const PUBLIC_KEY = process.env.PUBLIC_KEY;
export const PORT = parseInt(process.env.PORT || "3000");
export const HOSTNAME = process.env.HOSTNAME || "";