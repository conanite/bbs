/** @param {NS} ns */
export async function main(ns) {
	function formatNaN(n) { if (isNaN(n)) { return "NaN" } else { return null; } }
	function num(n) { return formatNaN(n) || ns.nFormat(n, "$0.000a"); }
	
	var gang = ns.gang;
	var equips = gang.getEquipmentNames();
	// for (var e of equips) {
	// 	var price = gang.getEquipmentCost(e);
	// 	ns.tprint("Equipment : ", e, ", price : ", num(price));
	// }

	var spending = 0;
	var itemCount = 0;

	var membs = gang.getMemberNames();
	for (var memb of membs) {
		var gm = gang.getMemberInformation(memb);
		var gm_eqs = gm.upgrades + gm.augmentations;
		for (var e of equips) {
			if (!gm_eqs.includes(e)) {
				var price = gang.getEquipmentCost(e);
				if (price < ns.getPlayer().money) {
					ns.tprint("Purchasing equipment : ", e, ", with price : ", num(price), " for ", gm.name);
					var bought = gang.purchaseEquipment(gm.name, e);
					if (bought) { 
						spending += price;
						itemCount++;
					}
				}			
			}
		}	
	}

	ns.tprint("spent ", num(spending), " on ", itemCount, " items");
}