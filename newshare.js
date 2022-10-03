import { buyBiggestAffordableServer } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
	const script = "share.js";

	var purchased = ns.args[0];
	if (purchased == null) {
		purchased = buyBiggestAffordableServer(ns, "sh");
	}
	if (purchased != null) {
		await ns.scp(script, purchased);
		var mem = ns.getScriptRam(script, purchased);
		var thredz = ns.getServerMaxRam(purchased) / mem;

		ns.tprint("mem for script is ", mem, " and on server is ", ns.getServerMaxRam(purchased));
		ns.tprint(script, purchased, " threads : ", Math.floor(thredz), " target : foodnstuff");
		ns.exec(script, purchased, Math.floor(thredz));
	} else {
		ns.tprint("can't buy any servers right now");
	}
}