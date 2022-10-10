import { netTraverse } from "/lib/net-traverse.js";

export const GB = 1024 * 1024 * 1024;

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

	ns.disableLog("ALL");
	var crackablePorts = 0;
	var data = {};
	var spinners = {};
	var log = [];

	/* @param {Server} server
	 */
	function serverStatus(name) {
		var server = ns.getServer(name);
		var spindata = spinners[name];
		var check = ""

		var ur = server.ramUsed;
		var mr = server.maxRam;
		check += g(ur).padStart(6, ' ') + "/" + g(mr).padEnd(6, ' ');

		var hasMoney = server.moneyMax > 0;
		var goodMoney = server.moneyAvailable >= (0.95 * server.moneyMax);
		var goodDiff = (server.minDifficulty * 1.05) >= server.hackDifficulty;

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
		check += sec(ns.getWeakenTime(name)).padStart(8) + "W";
		check += sec(ns.getGrowTime(name)).padStart(8) + "G";
		check += sec(ns.getHackTime(name)).padStart(8) + "H";
		check += server.serverGrowth.toString().padStart(5) + "SG";

		if (spindata) {
			check += " spin ";
			var sd = spindata;
			check += g(sd.ram).padStart(8) + '/' + g(sd.wantsRam).padEnd(8);
			check += ("PID:" + sd.pid + " ").padStart(9, ' ') + ' ';
			check += ("Q:" + sd.queue.length).padStart(6, ' ') + "  ";
			check += "" + num(sd.income).padStart(9, ' ') + "  ";
			// check += "SC:" + dec(sd.scaling).padStart(6, ' ') + "  ";
			check += "$/R:" + num(sd.income / sd.wantsRam).padStart(9, ' ') + "  ";
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

	async function visitor(srv, ctl) {
		var server = ns.getServer(srv.name);
		if (server.purchasedByPlayer) { return; }
		data[srv.name] = true;

		// if (s.moneyMax > 0 && s.hasAdminRights && s.serverGrowth > 10 && visited < maxTargets) {
	}

	function sortValue(srv) {
		if (srv.moneyMax == 0) { return 1000000000; }
		return srv.minDifficulty;
	}

	function rebuildLogs() {
		var servers = Object.keys(data).map(function (n) { return ns.getServer(n); });
		servers = servers.sort(function (s0, s1) { return sortValue(s0) - sortValue(s1) })
		for (var srv of servers) {
			var name = srv.hostname;
			if (name) {
				// var srv = data[name];
				var spindata = spinners[name];
				log.push("" + name.padStart(19, ' ') + " " + serverStatus(name, srv, spindata));
			} else {
				log.push("** NO NAME FOR ", srv.toString());
			}
		}

		var spinlist = Object.values(spinners).sort(function(s0, s1) { 
			return (s0.income / s0.wantsRam) - (s1.income / s1.wantsRam);
		});

		log.push("------")
		for (var spinner of spinlist) {
			log.push(spinner.target.padStart(19, ' ') + " " +
					num(spinner.income).padStart(9, ' ') + " " +
					g(spinner.wantsRam).padStart(8) + " " +
					num(spinner.income / spinner.wantsRam).padStart(9, ' '));
		}
	}

	async function checkReadPort() {
		var portData = ns.readPort(1);
		while (portData != "NULL PORT DATA") {
			portData = JSON.parse(portData);

			var spinner = portData.spinner;
			if (spinner != null) {
				var target = spinner.target;
				spinners[target] = spinner;
			}

			portData = ns.readPort(1);
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

	checkPrograms();
	await checkReadPort();
	await netTraverse(ns, visitor);
	rebuildLogs();
	ns.write("/monitor/100-hack-monitor.txt", log.join("\n"), "w");
}