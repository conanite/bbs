/** @param {NS} ns */
export async function main(ns) {
	var args = ns.args;
	var scriptname = "hacknet/" + args.shift() + ".js";
	ns.tprint("Running script ", scriptname);
  	ns.exec(scriptname, ns.getHostname(), 1, ...args);
}