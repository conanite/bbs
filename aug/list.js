import * as a from "/auglib.js";

/** @param {NS} ns */
export async function main(ns) {
	function num(n) { return ns.nFormat(n, "$0.000a"); }
	function dec(n) { return ns.nFormat(n, "0.000a"); }

	var sing = ns.singularity;

	var onlyAvail = ns.args[0] == "available" || ns.args[0] == "affordable";
	var onlyAfford = ns.args[0] == "affordable";
	var myMoney = ns.getPlayer().money;

	var ownedAugs = a.myAugs(sing);
	var myFax = ns.getPlayer().factions;

	var allAugs = {};

	var facList = onlyAvail ? myFax : a.knownFactions;

	for (var i = 0; i < facList.length; i++) {
		var fac = facList[i];
		var availAugs = sing.getAugmentationsFromFaction(fac);
		for (var j = 0; j < availAugs.length; j++) {
			var aug = availAugs[j]
			if (ownedAugs[aug] == null) {
				var providers = null
				if (allAugs[aug] == null) {
					providers = allAugs[aug] = [];
				} else {
					providers = allAugs[aug];
				}
				providers.push(fac);
			}
		}
	}

	for (const [aug, fax] of Object.entries(allAugs)) {
		var augPrice = sing.getAugmentationPrice(aug);
		var augRep = sing.getAugmentationRepReq(aug);
		ns.tprint("Augmentation ", aug);
		ns.tprint("  ", num(augPrice));
		ns.tprint("  rep ", dec(augRep));
		ns.tprint("  -> ", fax.join(", "));
	}
}