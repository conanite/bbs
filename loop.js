import { netTraverse, getMinThreadsToWeaken } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
	function num(n) { return ns.nFormat(n, "$0.000a"); }
	function dif(n) { return ns.nFormat(n, "0"); }
	function sec(n) { return ns.nFormat(n, "0.000"); }

	const hackScript = "hack-target.js";
	const weakScript = "weak-target.js";
	const growScript = "grow-target.js";

	ns.tail();
	ns.disableLog("ALL");

	var crackablePorts = 0;
	var data = {};

	async function findServerWithRam(amount) {
		var found = null;
		var f = function (node, ctl) {
			var s = ns.getServer(node.name);
			if (s.hasAdminRights && (s.maxRam - s.ramUsed > amount)) {
				ctl.quit();
				found = s;
			}
		}
		await netTraverse(ns, f);
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
	async function launch(node, scriptName, thredz, ...args) {
		var ram = requiredRamForScript(scriptName, thredz);
		var s = await findServerWithRam(ram);
		if (s == null) {
			if (thredz > 2) {
				return await launch(node, scriptName, Math.floor(thredz / 2), ...args);
			}
		} else if (thredz >= 1) {
			if (!ns.fileExists(scriptName, s.hostname)) {
				await ns.scp(scriptName, "home", s.hostname);
			}
			node.launchThredz = thredz;
			node.launchServer = s.hostname;
			return ns.exec(scriptName,s.hostname,thredz,...args);
		}
	}

	/* @param {Server} server */
	function nextStep(server) {
		var s = server;
		if (s.hasAdminRights) {
			if (s.hackDifficulty > (1.1 * s.minDifficulty)) {
				return "weak";
			} else if (s.moneyAvailable < (0.9 * s.moneyMax)) {
				return "grow";
			} else {
				return "hack";
			}
		}
	}

	/* @param {Server} server 
	 * @param {Node} node
	 */
	function serverStatus(node, server) {
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
		if (node.step != null) {
			check += " " + node.step + " ";
			if (node.launchServer != null) {
				check += (node.launchServer + ":" + node.launchThredz + "T").padEnd(20, ' ')
			} else {
				check += '                    ';
			}
			if (node.stepStarted != null && node.stepWait != null) {
				var elapsed = new Date() - node.stepStarted;
				var remaining = node.stepWait - elapsed;
				check += ("" + Math.floor(remaining / 1000)).padStart(5, ' ');
				check += ("thr:" + node.stepThredz).padStart(12, ' ');
			}
		}
		check += " LGR";
		if (node.lastGrow != null) {
			check += num(node.lastGrow).padStart(10, ' ');
		} else {
			check += '          ';
		}
		check += " LHK";
		if (node.lastHack != null) {
			check += num(node.lastHack).padStart(10, ' ');
		} else {
			check += '          ';
		}
		check += node.hackmsg;
		return check;
	}

	class Node {
		constructor(name) {
			this.name = name;
			this.check = "";
		}
	}

	function thr(n) {
		if (n < 1) {
			return 1;
		} else {
			return Math.floor(n);
		}
	}

	async function weakStep(node) {
		var s = node.server;
		var needThredz = thr(getMinThreadsToWeaken(ns, node.name));
		node.stepStarted = new Date();
		node.stepWait = ns.getWeakenTime(node.name);
		node.stepThredz = needThredz;
		node.weakWas = s.hackDifficulty;
		node.waitingForPid = await launch(node, weakScript, needThredz, node.name);
	}

	async function growStep(node) {
		var s = node.server;
		var moneyNow = s.moneyAvailable;
		var maxMultiply = s.moneyMax / moneyNow;
		var needThredz = ns.growthAnalyze(node.name, maxMultiply, ns.getServer("home").cpuCores); // assuming we're running on home?
		needThredz = thr(needThredz);

		node.moneyWas = moneyNow;
		node.stepStarted = new Date();
		node.stepWait = ns.getGrowTime(node.name);
		node.stepThredz = needThredz;
		node.waitingForPid = await launch(node, growScript, needThredz, node.name);
	}

	async function hackStep(node) {
		var s = node.server;

		var moneyNow = ns.getServerMoneyAvailable(node.name);

		if (node.lastGrow != null) {
			var hackAmount = 1.1 * (moneyNow / s.moneyMax) * node.lastGrow;
			node.hackmsg = " hack%=" + Math.floor(100 * (1.1 * (moneyNow / s.moneyMax)));
			if (hackAmount > moneyNow) {
				hackAmount = (moneyNow / s.moneyMax) * node.lastGrow;
				node.hackmsg = " 1.1 too much, hack%=" + Math.floor(100 * (moneyNow / s.moneyMax));
			}
			if (hackAmount > moneyNow) { 
				node.hackmsg = " still too much, hack%=" + Math.floor(100 * 0.5);
				hackAmount = moneyNow * 0.5; 
			}
		} else {
			node.hackmsg = " ?? last grow, hack%=" + Math.floor(100 * 0.5);
			var hackAmount = moneyNow * 0.5;
		}

		node.hackmsg += (" " + num(hackAmount));
		var needThredz = thr(ns.hackAnalyzeThreads(node.name, hackAmount));
		node.hackmsg += (" T" + needThredz);

		node.moneyWas = moneyNow;
		node.stepStarted = new Date;
		node.stepWait = ns.getHackTime(node.name);
		node.stepThredz = needThredz;
		node.waitingForPid = await launch(node, hackScript, needThredz, node.name);
	}

	async function runNextStep(node) {
		var s = node.server;
		if (!s.hasAdminRights) { return; }
		var nx = nextStep(s);
		if (node.step == "grow" && nx != "grow") {
			node.lastGrow = s.moneyAvailable - node.moneyWas;
		} else if (node.step == "hack" && nx != "hack") {
			node.lastHack = node.moneyWas - s.moneyAvailable;
		}
		node.step = nx;
		if (nx == "weak") {
			await weakStep(node);

		} else if (nx == "grow") {
			await growStep(node);

		} else if (nx == "hack") {
			await hackStep(node);
		}
	}

	/* @param {Node} node
		   */
	async function step(node) {
		var pid = node.waitingForPid;
		if (pid == null || !ns.isRunning(pid)) {
			node.waitingForPid = null;
			await runNextStep(node);
		}
	}

	async function visitor(srv, ctl) {
		var s = ns.getServer(srv.name);
		if (s.purchasedByPlayer || s.moneyMax <= 0) { return; }
		if (data[srv.name] == null) {
			data[srv.name] = new Node(srv.name);
		}
		var node = data[srv.name];
		node.server = s;
		await step(node);
	}

	function rebuildLogs() {
		ns.clearLog();
		for (var name in data) {
			var node = data[name];
			var s = node.server; /* {Server} */
			ns.print("[", name.padStart(20, ' '), " ] ", serverStatus(node, s));
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
		await netTraverse(ns, visitor);
		rebuildLogs();
		await ns.sleep(200);
	}
}