/** @param {NS} ns */
export async function main(ns) {
	var target = ns.args[0];
	if (target == null || target == '') { ns.exit(); }
	await ns.weaken(target);
}