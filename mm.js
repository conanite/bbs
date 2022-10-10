import { GB, getRamInfo } from "/lib/ram-info.js";
import { usableAttackServers } from "/lib/attack.js";

/** @param {NS} ns */
export async function main(ns) {
	function g(n) { return ns.nFormat(n * GB, "0.00ib"); }
	function dec(n) { return ns.nFormat(n, "0.000a"); }
	
	var logs = [];

	function log(...args) {
		logs.push(args.join(""));
	}
	
	var processes = {};
	var nextprocesses = {};

	var publish = {};

	while(true) {
		await ns.sleep(512);

	    var ri = await getRamInfo(ns, usableAttackServers);

		var portData = ns.readPort(2);
		while (portData != "NULL PORT DATA") {
			portData = JSON.parse(portData);
			ns.print(portData);
			if (portData.target) {
				processes[portData.target] = portData;
				nextprocesses[portData.target] = portData;
			} else if (portData.publish) {
				publish[portData.publish.key] = portData.publish; 
			}
			portData = ns.readPort(2);
		}

		var totalWants = 0;
		ns.print(Object.entries(processes));
		for (const [target, data] of Object.entries(processes)) {
			ns.print(target, data);
			totalWants += data.wants;
		}
			
		var outData = ns.readPort(3);
		while (outData != "NULL PORT DATA") {
			outData = ns.readPort(3);
		}

		var publish = { 
			totalDemand: totalWants,
			totalPool: ri.total.total,
			usedPool: ri.total.used,
			unusedPool: (ri.total.total - ri.total.used),
			scale: (ri.total.total / totalWants),
			processes: processes
		}

	    await ns.writePort(3, JSON.stringify(publish));

		// flush old entries every 10s in case processes have died in the meantime
		var now = new Date().getTime() % 1000;
		if (now % 10 == 0) {
			processes = nextprocesses;
			nextprocesses = {};
		}

		log("total demand: ", g(totalWants));
		log("total pool: ", g(publish.totalPool));
		log("used pool: ", g(publish.usedPool));
		log("unused pool: ", g(publish.unusedPool));
		log("scale: ", dec(publish.scale));

		ns.write("/monitor/000-memory-manager.txt", logs.join("\n"), "w");
		logs = [];
	} 
}