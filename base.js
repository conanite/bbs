/** @param {NS} ns */
export async function main(ns) {
	var target = ns.args[0];
	var files = ns.ls("home", ".js");
	ns.tprint(files);
	await ns.scp(files, target);
}