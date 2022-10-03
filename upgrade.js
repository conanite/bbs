/** @param {NS} ns */
export async function main(ns) {
	var sing = ns.singularity;
	var me = ns.getPlayer();

	var money = me.money;
	var cost = sing.getUpgradeHomeRamCost();

	if (money > cost) {
		sing.upgradeHomeRam();
	}
}