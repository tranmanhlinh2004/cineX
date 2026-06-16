import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");
const key = "NEXT_PUBLIC_CINEX_DEV_SESSION_ID";
const value = String(Date.now());
const assignment = `${key}=${value}`;

let envContent = "";

try {
  envContent = readFileSync(envPath, "utf8");
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
}

const keyPattern = new RegExp(`^${key}=.*$`, "m");

if (keyPattern.test(envContent)) {
  envContent = envContent.replace(keyPattern, assignment);
} else {
  envContent = `${envContent.replace(/\s*$/, "")}${envContent.trim() ? "\n" : ""}${assignment}`;
}

writeFileSync(envPath, `${envContent}\n`);
console.log(`Dev auth session: ${value}`);
