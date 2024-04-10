import { Connection } from "@solana/web3.js";
import { Pushover } from "pushover-ts";

if (
  !process.env["PUSHOVER_API_KEY"] ||
  !process.env["PUSHOVER_GROUP"] ||
  !process.env["RPC"] ||
  !process.env["WALLETS"]
)
  throw new Error("Missing PUSHOVER_API_KEY or PUSHOVER_GROUP or RPC");

export const conn = new Connection(process.env["RPC"], "confirmed");
export const PUSHOVER_API_KEY = process.env["PUSHOVER_API_KEY"];
export const PUSHOVER_GROUP = process.env["PUSHOVER_GROUP"];
export const WALLETS = process.env["WALLETS"].split(",");

export const pushoverClient = new Pushover(PUSHOVER_API_KEY, PUSHOVER_GROUP);
