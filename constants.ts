import { Connection } from "@solana/web3.js";
import { Pushover } from "pushover-ts";
import type { UptimeConfig } from "uptime-monitor-sdk";

if (
  !process.env["PUSHOVER_API_KEY"] ||
  !process.env["PUSHOVER_GROUP"] ||
  !process.env["RPC"] ||
  !process.env["WALLETS"] ||
  !process.env["UPTIME_SERVICE_URL"]
)
  throw new Error(
    "Missing PUSHOVER_API_KEY or PUSHOVER_GROUP or RPC or UPTIME_SERVICE_URL"
  );

export const conn = new Connection(process.env["RPC"], "confirmed");
export const PUSHOVER_API_KEY = process.env["PUSHOVER_API_KEY"];
export const PUSHOVER_GROUP = process.env["PUSHOVER_GROUP"];
export const WALLETS = process.env["WALLETS"].split(",");

export const UPTIME_SERVICE_URL = process.env["UPTIME_SERVICE_URL"];
export const pushoverClient = new Pushover(PUSHOVER_API_KEY, PUSHOVER_GROUP);

export const uptimeConfig: UptimeConfig = {
  host: new URL(UPTIME_SERVICE_URL),
  serviceName: "KaminoLtvMonitor",
  secondsBetweenHeartbeat: 150, // expected heartbeat. if we miss a heartbeat over 60 seconds, an alert is pushed
  secondsBetweenAlerts: 180, // every 3 minutes
  maxAlertsPerDownTime: 10, // maximum number of times you want to be alerted
  pushoverToken: PUSHOVER_API_KEY,
  pushoverGroup: PUSHOVER_GROUP,
};

export const DISCORD_WEBHOOK = process.env["DISCORD_WEBHOOK"];

if (DISCORD_WEBHOOK) {
  uptimeConfig["discordWebhook"] = DISCORD_WEBHOOK;
}
