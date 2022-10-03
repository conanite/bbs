import { GB, prefixServerFilter, getSmallestPurchasedServer, manageAttackServers, isScheduledForDestruction, biggestAffordableServer } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
  function g(n) { return ns.nFormat(n * GB, "0.00ib"); }
  function num(n) { return ns.nFormat(n, "$0.000a"); }

  ns.disableLog("ALL");
  ns.tail();

  var filter = prefixServerFilter("a-");

  if (ns.args[0] == "pool") {
    var poolsize = parseInt(ns.args[1]);
    if (isNaN(poolsize)) {
      ns.tprint("Usage : attack pool <poolsize>");
      ns.exit();
    }

    while (true) {
      ns.clearLog();

      await manageAttackServers(ns, filter, poolsize, "a");

      var biggestAffordable = biggestAffordableServer(ns);
      var ram = Math.pow(2, biggestAffordable);
      var biggestCost = ns.getPurchasedServerCost(ram);
      var smallest = await getSmallestPurchasedServer(ns, filter);
      var nextUp = 2 * smallest.maxRam;
      var nextCost = ns.getPurchasedServerCost(nextUp);

      for (const srv of ns.getPurchasedServers()) {
        var s = ns.getServer(srv);
        var upgrade = "";
        if (isScheduledForDestruction(ns, srv)) {
          upgrade = "*UPGRADING*";
        } else if (srv == smallest.hostname) {
          upgrade = "**";
        }
        ns.print(srv.padStart(8, ' '), " : ", g(s.ramUsed), "/", g(s.maxRam), ", ", ns.ps(srv).length, " processes ", upgrade);
      }
      ns.print("");
      ns.print("biggest affordable : ", g(ram), " for ", num(biggestCost));
      ns.print("next upgrade : ", g(nextUp), " for ", num(nextCost));
      await ns.sleep(2000);
    }
  } else {
    await manageAttackServers(ns, filter, "a");
  }
}