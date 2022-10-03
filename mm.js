import { GB } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
	function g(n) { return ns.nFormat(n * GB, "0.00ib"); }
	
	ns.disableLog("ALL");
	ns.tail();
	
	var processes = {};
	var nextprocesses = {};

	while(true) {
		await ns.sleep(512);

		var portData = ns.readPort(2);
		while (portData != "NULL PORT DATA") {
			portData = JSON.parse(portData);
			ns.print(portData);
			processes[portData.target] = portData;
			nextprocesses[portData.target] = portData;
			portData = ns.readPort(2);
		}

		var totalWants = 0;
		ns.print(Object.entries(processes));
		for (const [target, data] of Object.entries(processes)) {
			ns.print(target, data);
			totalWants += data.wants;
		}
	
	    ns.clearLog();
		ns.print("Total RAM demand is ", g(totalWants));
		
		var outData = ns.readPort(3);
		while (outData != "NULL PORT DATA") {
			outData = ns.readPort(3);
		}

	    await ns.writePort(3, JSON.stringify({ totalDemand: totalWants }));

		// flush old entries every 10s in case processes have died in the meantime
		var now = new Date().getTime() % 1000;
		if (now % 10 == 0) {
			processes = nextprocesses;
			nextprocesses = {};
		}
	} 
}