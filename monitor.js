import { deployScripts, waitForProcess, getMinThreadsToWeaken, getAttackers, netTraverse } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
	function num(n) { return ns.nFormat(n, "$0.000a"); }

	ns.disableLog("sleep");

	var params = ns.flags([
		["target", "n00dles"],
		["maxram", "max"],
		["attackfrom", "home"],
		["minmon", 0.8],
		["all", false]])

	ns.print("monitor params are ", params);

	if (params.all) {
		var attackers = getAttackers(ns);
		var f = function(node, ctl) {
			if (ns.hasRootAccess(node.name)) {
				var maxMon = ns.getServerMaxMoney(node.name);
				var hackers = attackers[node.name] || [];
				if (maxMon > 0 && hackers.length == 0) {
					ns.tprint("attacking ", node.name,
						" from ", params.attackfrom,
						" with ", params.maxram, "G ram");

					ns.exec(ns.getScriptName(), ns.getHostname(), 1,
						"--attackfrom", params.attackfrom,
						"--maxram", params.maxram,
						"--target", node.name);
				}
			} else {
				ctl.prune();
			}
		}
		netTraverse(ns, f);
		ns.exit();
	}

	var target = params.target;
	if (params.attackfrom != "" && params.attackfrom != null) {
		var attackServer = params.attackfrom;
		await deployScripts(ns, attackServer);
	} else {
		ns.tprint("please provide attack server name");
		ns.exit();
	}

	ns.print("Running monitor with target ", target, " on ", attackServer);

	var hackScript = "hack-target.js"
	var weakScript = "weak-target.js"
	var growScript = "grow-target.js"

	var minSec = ns.getServerMinSecurityLevel(target) + 4;
	var maxMon = ns.getServerMaxMoney(target);
	var minMon = maxMon * params.minmon;

	var maxRam = ns.getServerMaxRam(attackServer);
	var usedRam = ns.getServerUsedRam(attackServer);
	var availableRam = (maxRam - usedRam);
	if (params.maxram != "max") {
		var ramlimit = parseInt(params.maxram);
		if (ramlimit < availableRam) { availableRam = ramlimit; }
	}

	var hackRam = ns.getScriptRam(hackScript);
	var weakRam = ns.getScriptRam(weakScript);
	var growRam = ns.getScriptRam(growScript);

	var hackThredzMax = Math.floor(availableRam / hackRam);
	var weakThredz = Math.floor(availableRam / weakRam);
	var growThredz = Math.floor(availableRam / growRam);

	async function weakify() {
		while (ns.getServerSecurityLevel(target) > minSec) {
			var secWas = ns.getServerSecurityLevel(target);
			var wait = ns.getWeakenTime(target);
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
			var moneyNow = ns.getServerMoneyAvailable(target);
			var maxMultiply = maxMon / moneyNow;
			var needThredz = ns.growthAnalyze(target, maxMultiply, 1); // assuming 1 core for now?
			ns.print("we need ", needThredz, " to grow ", target, " from ", num(moneyNow), " to ", num(maxMon));

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