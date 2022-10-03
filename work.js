import { GB } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
    function num(n) { return ns.nFormat(n, "$0.000a"); }
    function gb(n)  { return ns.nFormat(n * GB, "0ib"); }

	var bought = ["home", ...ns.getPurchasedServers()];

	for (let s of bought) {
		var server = ns.getServer(s);
		ns.tprint("Server : ", s, " ", gb(server.ramUsed), "/", gb(server.maxRam), " ram, ", ns.ps(s).length, " processes");
		// for (let process of ns.ps(s)) {
		// 	var income = ns.getScriptIncome(process.filename, s, ...process.args);
		// 	ns.tprint("   script #", process.pid, " ", process.filename, " args ", process.args, " threads ", process.threads, ", income: ", num(income));
		// }
		// ns.tprint("");
	}
	ns.tprint("" + (bought.length - 1) + " purchased servers");

	var hn = ns.hacknet;
	for (var i = 0; i < hn.numNodes(); i++) {
		var s = "hacknet-node-" + i;
		var server = ns.getServer(s);
		ns.tprint("Server : ", s, " ", gb(server.ramUsed), "/", gb(server.maxRam), " ram, ", ns.ps(s).length, " processes");
	}
}