/** @param {NS} ns */
export async function main(ns) {
	function num(n) { return ns.nFormat(n, "$0.000a"); }


	var sl = ns.sleeve;
	var sc = sl.getNumSleeves();
	ns.tprint(sc, " sleeves");

	function setCrime(crimeName) {
		for (var i = 0; i < sc; i++) {
			sl.setToCommitCrime(i, crimeName);
		}		
	}

	function shockRecovery(crimeName) {
		for (var i = 0; i < sc; i++) {
			sl.setToShockRecovery(i);
		}		
	}

	if (ns.args[0] == "shopping") {
		for (var i = 0; i < sc; i++) {
			var augs = sl.getSleevePurchasableAugs(i);
			for (const ap of augs) {
				var cash = ns.getPlayer().money;
				if (cash > ap.cost) {
					var ok = sl.purchaseSleeveAug(i, ap.name);
					if (ok) {
						ns.tprint("purchased ", ap.name, " for sleeve ", i, " for ", num(ap.cost));
					} else {
						ns.tprint("FAILED to purchase ", ap.name, " for sleeve ", i, " for ", num(ap.cost));
					}
				}
			}
		}
	} else if (ns.args[0] == "drugs") {
		setCrime("DRUGS");
	} else if (ns.args[0] == "shoplift") {
		setCrime("SHOPLIFT");
	} else if (ns.args[0] == "mug") {
		setCrime("MUG");
	} else if (ns.args[0] == "homicide") {
		setCrime("HOMICIDE");
	} else if (ns.args[0] == "heist") {
		setCrime("HEIST");
	} else if (ns.args[0] == "shock") {
		shockRecovery();
	}

	for (var i = 0; i < sc; i++) {
		var task = sl.getTask(i)
		ns.tprint("Sleeve ", i, " has task ", task);
	}


}