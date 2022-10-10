/** @param {NS} ns */
export async function main(ns) {
	var focus = ns.args[0];
	ns.write("gang-focus.txt", focus, "w");
}