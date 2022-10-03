import * as a from "/auglib.js";

/** @param {NS} ns */
export async function main(ns) {
	function num(n) { return ns.nFormat(n, "$0.000a"); }

	var sing = ns.singularity;

	async function goShopping(myfax) {
		var shopMore = true;

		while (shopMore) {
			var ownedAugs = a.myAugs(sing, true);
			shopMore = false;

			var maxPrice = 0;
			var maxAug = null;
			var maxFac = null;

			for (var i = 0; i < myfax.length; i++) {
				var fac = myfax[i];
				var availAugs = sing.getAugmentationsFromFaction(fac);
				for (var j = 0; j < availAugs.length; j++) {
					var aug = availAugs[j];

					if (a.canBuyAug(ns, aug, fac, ownedAugs)) {
						shopMore = true;
						var price = sing.getAugmentationPrice(aug);
						if (price > maxPrice) {
							maxPrice = price;
							maxAug = aug;
							maxFac = fac;
						}
					}
				}
			}

			if (maxAug != null) {
				ns.tprint("purchasing ", maxAug, " from ", maxFac, " for ", num(maxPrice));
				sing.purchaseAugmentation(maxFac, maxAug);
			}
		}
	}

	await goShopping(ns.getPlayer().factions);
}