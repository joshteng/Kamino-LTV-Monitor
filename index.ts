import {
  KaminoMarket,
  KaminoObligation,
} from "@hubbleprotocol/kamino-lending-sdk";
import { PublicKey } from "@solana/web3.js";
import { sleep } from "bun";
import { WALLETS, conn, pushoverClient } from "./constants";
import { timeOutPromise } from "./utilities";

console.log("Starting Kamino LTV monitor...");

async function getMainMarket() {
  try {
    return await Promise.race([
      KaminoMarket.load(
        conn,
        new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF")
      ),
      timeOutPromise<KaminoMarket | null>(
        10_000,
        "Failed to get Kamino markets"
      ),
    ]);
  } catch (err) {
    console.log("Error getting market");
    return getMainMarket();
  }
}

const market = await getMainMarket();
console.log("Ready...");

while (true) {
  try {
    await Promise.race([
      market?.refreshAll(),
      timeOutPromise<void>(20_000, "Failed to refresh Kamino markets"),
    ]);

    WALLETS.forEach(async (wallet) => {
      try {
        console.log(`Getting LTV for ${wallet}...`);
        const res = await Promise.race([
          market?.getAllUserObligations(new PublicKey(wallet)),
          timeOutPromise<KaminoObligation[]>(
            20_000,
            "Failed to get user obligations"
          ),
        ]);

        if (res) {
          const msg = `Current ${wallet} LTV: ${res[0]
            .loanToValue()
            .mul(100)
            .toFixed(2)}%`;
          console.log(msg);
          if (res[0].loanToValue().gte("0.7"))
            pushoverClient.notify("Liquidation Warning: " + msg, 1);
        }
      } catch (err) {
        console.error(err);
      }
    });
  } catch (err) {
    console.error("Caught Error");
    console.error(err);
  }

  await sleep(60_000); // every min
}
