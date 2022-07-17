import { deployScripts, waitForProcess, getMinThreadsToWeaken } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
    function num(n) { return ns.nFormat(n, "$0.000a"); }

	ns.disableLog("sleep");

	var params = ns.flags([["target", "n00dles"], ["maxram", "max"], ["attackfrom", ""]])
	ns.tprint("monitor params are ", params);
	ns.print("monitor params are ", params);

	var target = params.target;
	var attackServer = ns.getHostname();
	if (params.attackfrom != "" && params.attackfrom != null) {
	   attackServer = params.attackfrom;
       await deployScripts(ns, attackServer);
	}

	ns.print("Running monitor with target ", target, " on ", attackServer);

	var hackScript = "hack-target.js"
	var weakScript = "weak-target.js"
	var growScript = "grow-target.js"

	var minSec = ns.getServerMinSecurityLevel(target) + 4;
	var maxMon = ns.getServerMaxMoney(target);
	var minMon = maxMon * 0.8;

	var maxRam = ns.getServerMaxRam(attackServer);
	var usedRam = ns.getServerUsedRam(attackServer);
	var availableRam = (maxRam - usedRam);
	if (params.maxram != "max") {
		var ramlimit = parseInt(params.maxram);
	    ns.tprint("ramlimit is ", ramlimit);
		if (ramlimit < availableRam) { availableRam = ramlimit; }
	}
	ns.tprint("availableRam is ", availableRam);

	var hackRam = ns.getScriptRam(hackScript);
	var weakRam = ns.getScriptRam(weakScript);
	var growRam = ns.getScriptRam(growScript);

	var hackThredzMax = Math.floor(availableRam / hackRam);
	var weakThredz = Math.floor(availableRam / weakRam);
	var growThredz = Math.floor(availableRam / growRam);

	async function weakify() {
		while (ns.getServerSecurityLevel(target) > minSec) {
            var secWas     = ns.getServerSecurityLevel(target);
			var wait       = ns.getWeakenTime(target);
			var minWeakThredz = getMinThreadsToWeaken(ns, target); 
			ns.print("need only ", minWeakThredz, " to weaken ", target);
			var pid = ns.exec(weakScript, attackServer, weakThredz, target, ns.tFormat(wait));
			await waitForProcess(ns, wait, pid);
			ns.print("security on ", target, " weakened from ", secWas, " to ", ns.getServerSecurityLevel(target));
		}
	}

	while (true) {
		await weakify();

		while (ns.getServerMoneyAvailable(target) < minMon) {
			// growthAnalyze(host: string, growthAmount: number, cores?: number): number;
			var maxMultiply = maxMon / ns.getServerMoneyAvailable(target);
            var needThredz  = ns.growthAnalyze(target, maxMultiply, 1); // assuming 1 core for now?
			ns.print("we need ", needThredz, " to grow ", target);
			ns.print(" from ", num(ns.getServerMoneyAvailable(target)), " to ", num(maxMon));

			var wait = ns.getGrowTime(target);
			var pid = ns.exec(growScript, attackServer, growThredz, target, ns.tFormat(wait));
			await waitForProcess(ns, wait, pid);
			ns.print("money on ", target, " grown to ", num(ns.getServerMoneyAvailable(target)));
			await weakify();
		}

		var hackThredz = ns.hackAnalyzeThreads(target, ns.getServerMoneyAvailable(target) * 0.5);
		if (hackThredz > hackThredzMax || hackThredz < 1) {
			hackThredz = hackThredzMax;
		}

		var wait = ns.getHackTime(target);
		var pid = ns.exec(hackScript, attackServer, hackThredz, target, ns.tFormat(wait));
		await waitForProcess(ns, wait, pid);
		ns.print("money on ", target, " hacked to ", num(ns.getServerMoneyAvailable(target)));
	}
}

export function autocomplete(data, args) {
    return data.servers;
}