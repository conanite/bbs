import { getAttackers } from "/lib.js"
// import * as lib from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
    function num(n) { return ns.nFormat(n, "$0.000a"); }

    var frm = ns.formulas;
	var hf  = frm.hacking;

	var workOnly  = (ns.args[0] == "work"     );
	var nameOnly  = (ns.args[0] == "names"    );
	var nesting   = (ns.args[0] == "nesting"  );
	var attacks   = (ns.args[0] == "attacks"  );
	var noattacks = (ns.args[0] == "noattacks");
	var mem       = (ns.args[0] == "mem"      );
	var visited = { };
	var attackers = getAttackers(ns);

	var portCount = 0;

    if (ns.fileExists("BruteSSH.exe" , "home")) { portCount++; }
    if (ns.fileExists("FTPCrack.exe" , "home")) { portCount++; }
    if (ns.fileExists("relaySMTP.exe", "home")) { portCount++; }
    if (ns.fileExists("HTTPWorm.exe" , "home")) { portCount++; }
    if (ns.fileExists("SQLInject.exe", "home")) { portCount++; }
    if (!ns.fileExists("Formulas.exe" , "home")) { hf = { hackChance: function(a, b) { return null; }}; }

    function num(n) {
		return ns.nFormat(n, "$0.000a");
	}

	function doScan(initial, path) {
		for (let srv of ns.scan(initial)) {
			var s = ns.getServer(srv);
			if (!s.purchasedByPlayer && !visited[srv]) {
				var money       = ns.getServerMoneyAvailable(srv);
	    		var securityMin = ns.getServerMinSecurityLevel(srv);
				var sec         = ns.getServerSecurityLevel(srv);
				var usedRam     = ns.getServerUsedRam(srv);

				var interesting = (!s.hasAdminRights) && // i haven't hacked it yet
					 (s.serverGrowth > 20) &&  // money grows on trees
					 (s.moneyMax > 1000000000) &&  // lotsa money
					 (s.requiredHackingSkill < ns.getHackingLevel()) && // we can hack it
					 (s.numOpenPortsRequired <= portCount); // we can nuke it

				var interestingMsg = (interesting ? "** INTERESTING! ** --> " : "")


				if (workOnly) {
					ns.tprint(interestingMsg, "Server ", srv, (s.hasAdminRights ? " ✓" : ""));
					for (let process of ns.ps(srv)) {
						var income = ns.getScriptIncome(process.filename, srv, ...process.args);
						ns.tprint("  process: ", process.filename, " args ", process.args, " threads ", process.threads, ", income : ", num(income));
					}
					ns.tprint("")

				} else if (attacks) {
					var hackers = attackers[srv];
					if (hackers != null) {
						ns.tprint(interestingMsg, "Server ", srv, (s.hasAdminRights ? " ✓" : ""));
						ns.tprint("  Under attack from ", hackers);
						ns.tprint("")
					}

				} else if (noattacks) {
					var chance  = hf.hackChance(s, ns.getPlayer());
					var hackers = attackers[srv];
					if (hackers == null && s.moneyMax > 0 && s.serverGrowth > 10 && s.hasAdminRights) {
						var m0 = "Server " + srv + (s.hasAdminRights ? " ✓" : "");
						var m1 = "money : " + num(money) + " of max " + num(s.moneyMax);
						var m2 = "security : " + sec + " of min " + securityMin;
						var m3 = "growth param : " + s.serverGrowth + ", H%=" + chance;

						ns.tprint(m0, " | ", m1, " | ",  m2, " | ",  m3);
					}

				} else if (mem) {
					if (s.hasAdminRights) {
    					ns.tprint(srv, " : used ", usedRam, "G of max ", s.maxRam, "G (available ", (s.maxRam - usedRam), "G)");
					}

				} else if (nameOnly) {
					ns.tprint(interestingMsg, "Server ", srv, (s.hasAdminRights ? " ✓" : ""));

				} else if (nesting) {
					ns.tprint(interestingMsg, "Server ", path, "/", srv, (s.hasAdminRights ? " ✓" : ""));

				} else {
					ns.tprint(interestingMsg, "Server ", srv, (s.hasAdminRights ? " ✓" : ""));
					ns.tprint("  money : ", num(money), " of max ", num(s.moneyMax) );
					ns.tprint("  security : ", sec, " of min ", securityMin );
					ns.tprint("  growth param : ", s.serverGrowth, " hacking prob", "??", ", cores : ", s.cpuCores, ", ram : used ", usedRam, "G of max ", s.maxRam, "G (available ", (s.maxRam - usedRam), "G)");
					ns.tprint("  Min hacking skill ", s.requiredHackingSkill, " root: ", s.hasAdminRights, " backdoor: ", s.backdoorInstalled, " open ports for nuke: ", s.numOpenPortsRequired);
					for (let process of ns.ps(srv)) {
						ns.tprint("  process: ", process.filename, " args ", process.args, " threads ", process.threads);
					}
					var hackers = attackers[srv];
					if (hackers != null) {
						ns.tprint("  Under attack from ", hackers);
					}
					ns.tprint("")

				}

				if (s.hasAdminRights) {
					netscan(srv, path + "/" + srv);
				}
			}
		}
	}

	function netscan(initial, path) {
		if (visited[initial] == null) {
			visited[initial] = true;
			doScan(initial, path);
		}
	}

	netscan("home", "");
}



export function autocomplete(data, args) {
	return ["attacks", "noattacks", "mem", "work", "names", "nesting"];
}