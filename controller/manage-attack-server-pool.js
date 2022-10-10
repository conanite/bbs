import { GB, prefixServerFilter, getSmallestPurchasedServer, manageAttackServers, isScheduledForDestruction, biggestAffordableServer } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
	function g(n) { return ns.nFormat(n * GB, "0.00ib"); }
	function num(n) { return ns.nFormat(n, "$0.000a"); }

	var logs = [];

	function log(...args) {
		logs.push(args.join(""));
	}

	var filter = prefixServerFilter("a-");
	var poolsize = 10;

	ns.clearLog();

	await manageAttackServers(ns, filter, poolsize, "a", logs);

	var biggestAffordable = biggestAffordableServer(ns);
	var ram = Math.pow(2, biggestAffordable);
	var biggestCost = ns.getPurchasedServerCost(ram);
	var smallest = await getSmallestPurchasedServer(ns, filter);

	if (smallest) {
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
			log(srv.padStart(8, ' '), " : ", g(s.ramUsed), "/", g(s.maxRam), ", ", ns.ps(srv).length, " processes ", upgrade);
		}
		log("biggest affordable : ", g(ram), " for ", num(biggestCost));
		log("next upgrade : ", g(nextUp), " for ", num(nextCost));
	}

	ns.write("/monitor/400-attack-server-pool.txt", logs.join("\n"), "w");

}