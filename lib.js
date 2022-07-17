/*
 * @param {NS} ns
 * @param {number} millis - time to wait initally
 * @param {number} pid - after waiting millis ms, wait until this pid is no longer running
 */
export async function waitForProcess(ns, millis, pid) {
	ns.print(new Date(), " waiting for ", ns.tFormat(millis))
	await ns.sleep(millis);
	while (ns.isRunning(pid)) { await ns.sleep(20); } // wait a bit extra in case we woke up just before target script finished
}

/** @param {NS} ns 
 *  @param {string} monserver - the name of the server to run the HGW monitor script
 *  @param {string} target - the name of the server to hack/grow/weaken
 *  @param {number} maxram - maximum RAM in GB to use for HGW scripts
 *  @param {string} hgwserver - the server which will run the HGW scripts
*/
export async function deployAttack(ns, monserver, target, maxram, hgwserver) {
	// ns.killall(attacker);
    await deployScripts(ns, monserver);
	var script = "monitor.js"

	var maxram = (maxram == null) ? "max" : maxram;
	var hgwserver = (hgwserver == null) ? "" : hgwserver

	ns.exec(script, monserver, 1, "--target", target, "--maxram", maxram, "--attackfrom", hgwserver);

	ns.tprint("running '", script, " ", target, "' on ", monserver);
}

/** @param {NS} ns 
 *  @param {string} dest - the name of the destination server to receive the default scripts
 * 
 * copies a standard set of scripts from "home" to the given destination server
*/
export async function deployScripts(ns, dest) {
	var scripts = ["monitor.js", "lib.js", "hack-target.js", "weak-target.js", "grow-target.js"];
	await ns.scp(scripts, "home", dest);
}

/** @param {NS} ns 
 *  @param {string} target - the name of the server to crack
*/
export function crack(ns, target) {
	var s = ns.getServer(target);
	if (s.hasAdminRights) { return; }	
    ns.print("crack target is ", target);

    if (ns.fileExists("BruteSSH.exe" , "home")) { ns.brutessh(target);  }
    if (ns.fileExists("FTPCrack.exe" , "home")) { ns.ftpcrack(target);  }
    if (ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(target); }
    if (ns.fileExists("HTTPWorm.exe" , "home")) { ns.httpworm(target);  }
    if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(target); }

    ns.nuke(target);

	s = ns.getServer(target); // need to update it
	if (s.hasAdminRights) { 
		ns.toast("cracked " + target);
	} else {
		ns.toast("failed to crack " + target);
	}
}

/** @param {NS} ns 
 *  @param {string} target - the name of the server to crack
*/
export function isCrackable(ns, target) {
	var s = ns.getServer(target);
	if (s.hasAdminRights) { return false; }	

    var crackablePorts = 0;
    if (ns.fileExists("BruteSSH.exe" , "home")) { crackablePorts++; }
    if (ns.fileExists("FTPCrack.exe" , "home")) { crackablePorts++; }
    if (ns.fileExists("relaySMTP.exe", "home")) { crackablePorts++; }
    if (ns.fileExists("HTTPWorm.exe" , "home")) { crackablePorts++; }
    if (ns.fileExists("SQLInject.exe", "home")) { crackablePorts++; }

	var s = ns.getServer(target);
	var hackable = s.requiredHackingSkill <= ns.getHackingLevel();
	var portable = s.numOpenPortsRequired <= crackablePorts;
	return (hackable && portable)
}

/** @param {NS} ns 
 *  @param {string} target - the name of the server to crack
*/
export function isCracked(ns, target) {
	return ns.getServer(target).hasAdminRights;	
}

/** @param {NS} ns 
 *  @param {string} name - the base name of the server. Size and index will be appended
 *  @param {number} size - the size exponent. RAM of new server will be 2^size
*/
export function buyServer(ns, name, size) {
	var ram = Math.pow(2, size);
	var cost = ns.nFormat(ns.getPurchasedServerCost(ram), "$0.000a");


	if (name == 'cost') {
		ns.tprint("cost of server size ", size, " (", ram, "G RAM) is ", cost);
		return { cost: cost }
	} else {
	    ns.tprint("purchasing server with base name ", name, " for ", cost);
		if (name == null || name == '') { throw new Error("missing name for new server"); }
		var s = ns.purchaseServer(name + "-" + size, ram);
		ns.tprint("purchased ", s, " for ", cost);
		return { name: s, cost: cost }
	}
}

/** @param {NS} ns 
*/
export function deleteUnusedServers(ns) {
	var bought = ns.getPurchasedServers();

    var deleted = [];

	for (let s of bought) {
		if (ns.ps(s).length == 0) {
		    ns.tprint("Deleting server : ", s);
            ns.deleteServer(s)
			deleted.push(s);
		}
	}

	if (deleted.length == 0) {
		ns.tprint("no servers found to delete");
	}
}

/** @param {NS} ns 
 * 
 *  estimates the minimum number of threads required to weaken a target to minimum difficulty
 */
export function getMinThreadsToWeaken(ns, target) {
	var s = ns.getServer(target);

    var max    = 1000000;
	var thredz = max / 2;
	var min    = 0;

    var currentDifficulty = s.hackDifficulty;
	var minDifficulty     = s.minDifficulty;
	var diff              = currentDifficulty - minDifficulty;

    while (max - min > 1) {
    	var decrease = ns.weakenAnalyze(thredz);
	    if (decrease > diff) { // too many threads
		    max    = thredz;
	        thredz = thredz - ((thredz - min) / 2);
    	} else { // too few threads
            min    = thredz;
			thredz = thredz + ((max - thredz) / 2);
		}
	}

    return Math.floor(thredz);
}

/*
 * @param {NS} ns 
 */
export async function showPurchasedServerWork(ns, serverName) {

} 

/** @param {NS} ns */
export function getAttackers(ns) {
	var attackers = { };

	var f = function(node) {
		var s = node.name;
		for(let process of ns.ps(s)) {
			if (process.filename == "monitor.js") {
				var flagi = process.args.indexOf("--target");
				var target = process.args[flagi + 1];
				if (target != "" && target != null) {
				    var already = attackers[target] || [];
				    already.push(s);
				    attackers[target] = already;
				}
			}
		}
	}

	netTraverse(ns, f);

	return attackers;
}

/**
 *  @param {NS} ns
 *  @param {function} f - a function to call with each discovered server name
 */
export function netTraverse(ns, f) {
	var queue = [{ name: "home" }];
	var visited = { };
	while(queue.length > 0) {
		var s = queue.shift();
		f(s);
		for(let neighbour of ns.scan(s.name)) {
			if (visited[neighbour] == null) {
				visited[neighbour] = true;
				queue.push({ name: neighbour, parent: s });
			}
		}
	}
}