import { netReverseTraverse } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
	function num(n) { return ns.nFormat(n, "$0.000a"); }

	var frm = ns.formulas;
	var hf = frm.hacking;

	var workOnly = (ns.args[0] == "work");
	var nameOnly = (ns.args[0] == "names");
	var nesting = (ns.args[0] == "nesting");
	var mem = (ns.args[0] == "mem");
	var visited = {};

	var portCount = 0;

	if (ns.fileExists("BruteSSH.exe", "home")) { portCount++; }
	if (ns.fileExists("FTPCrack.exe", "home")) { portCount++; }
	if (ns.fileExists("relaySMTP.exe", "home")) { portCount++; }
	if (ns.fileExists("HTTPWorm.exe", "home")) { portCount++; }
	if (ns.fileExists("SQLInject.exe", "home")) { portCount++; }
	if (!ns.fileExists("Formulas.exe", "home")) { hf = { hackChance: function (a, b) { return null; } }; }

	function num(n) {
		return ns.nFormat(n, "$0.000a");
	}

	async function doScan(initial, path) {
		for (let srv of ns.scan(initial)) {
			var s = ns.getServer(srv);
			if (!visited[srv]) {
				var money = ns.getServerMoneyAvailable(srv);
				var securityMin = ns.getServerMinSecurityLevel(srv);
				var sec = ns.getServerSecurityLevel(srv);
				var usedRam = ns.getServerUsedRam(srv);

				var check = ""
				if (s.hasAdminRights) {
					check = "✓"
				} else {
					if (s.requiredHackingSkill > ns.getHackingLevel()) {
						check = "HL:" + s.requiredHackingSkill + " ";
					}
					if (s.numOpenPortsRequired > portCount) {
						check += "RP: " + s.numOpenPortsRequired;
					}
				}

				if (workOnly) {
					ns.tprint("Server ", srv, " ", check);
					for (let process of ns.ps(srv)) {
						var income = ns.getScriptIncome(process.filename, srv, ...process.args);
						ns.tprint("  process: ", process.filename, " args ", process.args, " threads ", process.threads, ", income : ", num(income));
					}
					ns.tprint("")

				} else if (mem) {
					if (s.hasAdminRights) {
						ns.tprint(srv, " : used ", usedRam, "G of max ", s.maxRam, "G (available ", (s.maxRam - usedRam), "G)");
					}

				} else if (nameOnly) {
					ns.tprint("Server ", srv, " ", check);

				} else if (nesting) {
					ns.tprint("Server ", path, "/", srv, " ", check);

				} else {
					ns.tprint("Server ", srv, " ", check);
					ns.tprint("  money : ", num(money), " of max ", num(s.moneyMax));
					ns.tprint("  security : ", sec, " of min ", securityMin);
					ns.tprint("  growth param : ", s.serverGrowth, " hacking prob", "??", ", cores : ", s.cpuCores, ", ram : used ", usedRam, "G of max ", s.maxRam, "G (available ", (s.maxRam - usedRam), "G)");
					ns.tprint("  Min hacking skill ", s.requiredHackingSkill, " root: ", s.hasAdminRights, " backdoor: ", s.backdoorInstalled, " open ports for nuke: ", s.numOpenPortsRequired);
					for (let process of await ns.ps(srv)) {
						ns.tprint("  process: ", process.filename, " args ", process.args, " threads ", process.threads);
					}
					ns.tprint("");
				}

				if (s.hasAdminRights) {
					await netscan(srv, path + "/" + srv);
				}
			}
		}
	}

	async function netscan(initial, path) {
		if (visited[initial] == null) {
			visited[initial] = true;
			await doScan(initial, path);
		}
	}

	if (ns.args[0] == "test") {
		var f = function(name) {
			ns.tprint(name);
		}
		netReverseTraverse(ns, f);
	} else {
		await netscan("home", "");
	}
}



export function autocomplete(data, args) {
	return ["attacks", "noattacks", "mem", "work", "names", "nesting"];
}