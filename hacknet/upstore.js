/** @param {NS} ns */
export async function main(ns) {
	var hn = ns.hacknet;
	for (var i = 0; i < hn.numNodes(); i++) {
		hn.upgradeCache(i, 1);			
	}
}