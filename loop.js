import { netTraverse } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
	function num(n) { return ns.nFormat(n, "$0.000a"); }
	function dif(n) { return ns.nFormat(n, "0"); }

	ns.tail();
	ns.disableLog("ALL");

	var crackablePorts = 0;
	var data = {};

	function findServerWithRam(amount) {
		var found = null;
		var f = function (node, ctl) {
			var s = ns.getServer(node.name);
			if (s.maxRam - s.ramUsed > amount) {
				ctl.quit();
				found = s;
			}
		}
		netTraverse(f);
		return found;
	}

	function requiredRamForScript(scriptName, thredz) {
		var base = ns.getScriptRam(scriptName, "home");
		return base * thredz;
	}

	/*
	 * @return {number} - the pid of the process if created
	 *
	 */
	function launch(scriptName, thredz) {
		var ram = requiredRamForScript(scriptName, thredz);
		var s = findServerWithRam(ram);
		if (!ns.fileExists(scriptName, s.name)) {
			ns.scp(scriptName, "home", s.name);
		}

		return ns.exec(scriptName, s.name, thredz);
	}

	function nextStep(server) {
		var s = server;
		if (s.hackDifficulty > (1.1 * s.minDifficulty)) {
			return "weak";
		} else if (s.moneyAvailable < (0.9 * s.moneyMax)) {
			return "grow";
		} else {
			return "hack";
		}
	}

	function serverStatus(server) {
		var check = "  "
		if (server.hasAdminRights) {
			check = "✓ "
		}

		if (server.requiredHackingSkill > ns.getHackingLevel()) {
			check += ("HL:" + server.requiredHackingSkill).padEnd(8, ' ');
		} else {
			check += '        ';
		}

		if (server.numOpenPortsRequired > crackablePorts) {
			check += ("RP:" + server.numOpenPortsRequired).padEnd(5, ' ');
		} else {
			check += '     ';
		}

		check += (num(server.moneyAvailable) + "/" + num(server.moneyMax)).padEnd(21, ' ');
		check += ("D" + dif(server.hackDifficulty) + "/" + dif(server.minDifficulty)).padEnd(8, ' ');
		check += " " + nextStep(server);
		return check;
	}

	class Node {
		constructor(name) {
			this.name = name;
			this.check = "";
		}
	}

	function visitor(srv, ctl) {
		var s = ns.getServer(srv.name);
		if (s.purchasedByPlayer || s.moneyMax <= 0) { return; }
		if (data[srv.name] == null) {
			data[srv.name] = new Node(srv.name);
		}
		var node = data[srv.name];
		node.server = s;
	}

	function rebuildLogs() {
		ns.clearLog();
		for (var name in data) {
			var node = data[name];
			var s = node.server; /* {Server} */
			ns.print("[", name.padStart(20, ' '), " ] ", serverStatus(s));
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

	while (true) {
		checkPrograms();
		netTraverse(ns, visitor);
		rebuildLogs();
		await ns.sleep(100);
	}
}