import { GB, Node } from "/lib.js"
import { netTraverse } from "/net-traverse.js"

/** @param {NS} ns */
export async function main(ns) {
	await loop(ns);
}

/** @param {NS} ns */
export async function loop(ns) {
	function g(n) { return ns.nFormat(n * GB, "0ib"); }
	function num(n) { return ns.nFormat(n, "$0.000a"); }
	function dif(n) { return ns.nFormat(n, "0"); }
	function sec(n) { return ns.nFormat(n / 1000, "0.0"); }
	function seci(n) { return ns.nFormat(n / 1000, "0"); }
    function dec(n) { return ns.nFormat(n, "0.000"); }
	// function sec(n) { return "" + Math.floor(n / 1000); }

	var skip = { "foodnstuff": true, 
				 "sigma-cosmetics": true,
				 "hong-fang-tea": true, 
				 "iron-gym": true,
				 "silver-helix": true, 
				 "fulcrumassets": true };

	ns.tail();
	ns.disableLog("ALL");
	var crackablePorts = 0;
	var data = {};
	var visited = 0;

	var currentSpinners = {};
	var nextSpinners = {};

	/* @param {Server} server
	 * @param {Node} node
	 */
	function serverStatus(node, server) {
		var check = ""

		var ur = server.ramUsed;
		var mr = server.maxRam;
		check += g(ur).padStart(6, ' ') + "/" + g(mr).padEnd(6, ' ');

		var hasMoney = server.moneyMax > 0;
		var goodMoney = server.moneyAvailable >= (0.95 * server.moneyMax);
		var goodDiff  = (server.minDifficulty * 1.05) >= server.hackDifficulty;

		if (server.hasAdminRights) {
			check += " ✓ "
		} else {
			check += "   "
		}

		check += (num(server.moneyAvailable) + "/" + num(server.moneyMax)).padEnd(21, ' ');
		if (hasMoney && goodMoney) {
			check += "✓"
		} else {
			check += " "
		}

		if (hasMoney && goodDiff) {
			check += "✓"
		} else {
			check += " "
		}
		check += ("D" + dif(server.hackDifficulty) + "/" + dif(server.minDifficulty)).padEnd(8, ' ') + " ";
		check += sec(ns.getWeakenTime(node.name)).padStart(8) + "W";
		check += sec(ns.getGrowTime(node.name)).padStart(8) + "G";
		check += sec(ns.getHackTime(node.name)).padStart(8) + "H";

		if (node.step == "spin" && currentSpinners[node.name] == true) {
			check += " spin ";
			var sd = node.spinData;
			check += g(sd.ram).padStart(8) + ' ';
			check += ("PID:" + sd.pid + " ").padStart(9, ' ') + ' ';
			check += ("Q:" + sd.queue.length).padStart(6, ' ') + "  ";
			check += "" + num(sd.income).padStart(9, ' ') + "  ";
			check += "SC:" + dec(sd.scaling).padStart(6, ' ') + "  ";

		} else if (node.step == "skip" ) {
			check += " skip ";

		}

		if (server.requiredHackingSkill > ns.getHackingLevel()) {
			check += (" HL:" + server.requiredHackingSkill).padEnd(8, ' ');
		} else {
			check += '         ';
		}

		if (server.numOpenPortsRequired > crackablePorts) {
			check += (" RP:" + server.numOpenPortsRequired).padEnd(5, ' ');
		} else {
			check += '      ';
		}

		return check;
	}

	function getNodeForServer(name) {
		if (data[name] == null) {
			data[name] = new Node(name);
		}
		return data[name];
	}

	async function visitor(srv, ctl) {
		var s = ns.getServer(srv.name);
		if (s.purchasedByPlayer) { return; }
		var node = getNodeForServer(srv.name);
		node.server = s;

		// if (s.moneyMax > 0 && s.hasAdminRights && s.serverGrowth > 10 && visited < maxTargets) {
	}

	function rebuildLogs() {
		ns.clearLog();
		for (var name in data) {
			var node = data[name];
			var s = node.server; /* {Server} */
			ns.print(name.padStart(19, ' '), " ", serverStatus(node, s));
		}
	}

	function checkPrograms() {
		crackablePorts = 0;
		if (ns.fileExists("BruteSSH.exe", "home")) { crackablePorts++; }
		if (ns.fileExists("FTPCrack.exe", "home")) { crackablePorts++; }
		if (ns.fileExists("relaySMTP.exe", "home")) { crackablePorts++; }
		if (ns.fileExists("HTTPWorm.exe", "home")) { crackablePorts++; }
		if (ns.fileExists("SQLInject.exe", "home")) { crackablePorts++; }
	}

	async function checkReadPort() {
		var portData = ns.readPort(1);
		while (portData != "NULL PORT DATA") {
			portData = JSON.parse(portData);

			var newTargets = portData.targets;
			if (newTargets != null) {
				ns.tprint("New max targets : ", newTargets);
				maxTargets = newTargets;
			}

			var newskip = portData.skip;
			if (newskip != null) {
				ns.tprint("skipping ", newskip);
				skip[newskip] = true;
			}

			var newunskip = portData.unskip;
			if (newunskip != null) {
				ns.tprint("unskipping ", newunskip);
				skip[newskip] = false;
			}

			var spinner = portData.spinner;
			if (spinner != null) {
				var target = spinner.target;
				var node = getNodeForServer(target);
				currentSpinners[target] = true;
				nextSpinners[target] = true;
				node.step = "spin"
				node.spinData = spinner;
			}
			
			portData = ns.readPort(1);
		}
	}

	function cycleSpinners() {
		var rightNow = new Date().getTime() % 1000;
		if (rightNow % 10 == 0) {
			currentSpinners = nextSpinners;
			nextSpinners = {};
		}
	}

	while (true) {
		visited = 0;
		checkPrograms();
		await netTraverse(ns, visitor);
		rebuildLogs();
		await checkReadPort();
		cycleSpinners();
		await ns.sleep(400);
	}
}

export function autocomplete(data, args) {
  return ["targets", "skip", "unskip", ...data.servers];
}