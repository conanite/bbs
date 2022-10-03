import { Node, launch, getMinThreadsToWeaken } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
	var target = ns.args[0];

	ns.tprint("Run « spin warm ", target, " » instead!");
	ns.exit();

	var wnode = new Node(target);
	var s = ns.getServer(target);
	var wthredz = getMinThreadsToWeaken(ns, target);

	ns.tprint(target, " about to launch ", wthredz, " weaken threads");
	await launch(ns, wnode, "weak-target.js", 2 * wthredz, target);
	ns.tprint(target, " launched ", wnode.launchThredz, " weaken threads : ", wnode.waitingForPids);

	var moneyMax = s.moneyMax;
	var maxMultiply = moneyMax / s.moneyAvailable;

	var gthredz = ns.growthAnalyze(target, maxMultiply, 1);

	var gnode = new Node(target);
	ns.tprint(target, " about to launch ", gthredz, " grow threads");
	await launch(ns, gnode, "grow-target.js", 2 * gthredz, target);
	ns.tprint(target, " launched ", gnode.launchThredz, " grow threads : ", gnode.waitingForPids);

	var done = false;

	function check() {
		var wdone = wnode.finished(ns);
		var gdone = gnode.finished(ns);
		done = wdone && gdone;
	}

	while(!done) {
		await ns.sleep(4000); // we're not in a hurry here, this usually takes a long time anyway
		check();
	}

	ns.toast("Finished warming up " + target, "info", 4000);
	ns.tprint("Finished warming up ", target);
}

export function autocomplete(data, args) {
    return data.servers;
}