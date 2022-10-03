import * as a from "/auglib.js";

/** @param {NS} ns */
export async function main(ns) {
	function num(n) { return ns.nFormat(n, "$0.000a"); }

	var sing = ns.singularity;
	var excludeFaction = null;

	function myFactions() {
		return ns.getPlayer().factions;
	}

	function bestRepFaction() {
		var factions = myFactions();
		var rep = 0;
		var faction = null;
		for (var i = 0; i < factions.length; i++) {
			var thisrep = sing.getFactionRep(factions[i]);
			if (thisrep > rep && factions[i] != excludeFaction) {
				rep = thisrep;
				faction = factions[i];
			}
		}
		return faction;
	}

	var cost = sing.getAugmentationPrice(a.NeuroFluxGovernor);
	var repcost = sing.getAugmentationRepReq(a.NeuroFluxGovernor);
	var myMoney = ns.getPlayer().money;
	var faction = bestRepFaction();
	var factionRep = sing.getFactionRep(faction);

	while (myMoney >= cost && faction != null && factionRep > repcost) {
		ns.tprint("buying neuroflux for ", num(cost), " with rep ", repcost, " from ", faction);
		var purchased = sing.purchaseAugmentation(faction, a.NeuroFluxGovernor);

		if (!purchased) { excludeFaction = faction; }

		myMoney = ns.getPlayer().money;
		cost = sing.getAugmentationPrice(a.NeuroFluxGovernor);
		repcost = sing.getAugmentationRepReq(a.NeuroFluxGovernor);
	}
}


export function autocomplete(data, args) {
	return ["neuro"];
}