/** @param {NS} ns */
export async function main(ns) {
	var target = ns.args[0] || "n00dles"
	while (true) {
		await ns.grow(target);
		await ns.weaken(target);
		await ns.grow(target);
		await ns.weaken(target);
		await ns.hack(target);
		await ns.weaken(target);
	}
}