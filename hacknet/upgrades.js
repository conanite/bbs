/** @param {NS} ns */
export async function main(ns) {
    await ns.write("hacknet-upgrades.txt", ns.args[0], "w");
}