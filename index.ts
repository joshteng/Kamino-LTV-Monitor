import { KaminoMarket } from "@hubbleprotocol/kamino-lending-sdk";
import { PublicKey } from "@solana/web3.js";
import { sleep } from "bun";
import { WALLETS, conn, pushoverClient } from "./constants";
import { timeOutPromise } from "./utilities";

console.log("Starting Kamino LTV monitor...");

async function getMainMarket() {
  try {
    return await Promise.race([
      await KaminoMarket.load(
        conn,
        new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF")
      ),
      timeOutPromise<KaminoMarket | null>(2000),
    ]);
  } catch (err) {
    return getMainMarket();
  }
}

const market = await getMainMarket();
console.log("Ready...");

while (true) {
  try {
    await market?.refreshAll();
    WALLETS.forEach(async (wallet) => {
      try {
        console.log(`Getting LTV for ${wallet}...`);
        const res = await market?.getAllUserObligations(new PublicKey(wallet));

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
