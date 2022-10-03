/** @param {NS} ns */
export async function main(ns) {
	function formatNaN(n) { if (isNaN(n)) { return "NaN" } else { return null; } }
	function num(n) { return formatNaN(n) || ns.nFormat(n, "0.000a"); }

	var gang = ns.gang;
	var equips = gang.getEquipmentNames();

	function showMember(memb, time) {
		var gm = gang.getMemberInformation(memb);
		ns.tprint(memb, time,
			"    h ", num(gm.hack_asc_mult),
			", str ", num(gm.str_asc_mult),
			", def ", num(gm.def_asc_mult),
			", dex ", num(gm.dex_asc_mult),
			", agi ", num(gm.agi_asc_mult),
			", cha ", num(gm.cha_asc_mult)
		);
	}

	function equip(memb) {
		var gm = gang.getMemberInformation(memb);
		var gm_eqs = gm.upgrades + gm.augmentations;
		for (var e of equips) {
			if (!gm_eqs.includes(e)) {
				var price = gang.getEquipmentCost(e);
				if (price < ns.getPlayer().money) {
					ns.tprint("Purchasing equipment : ", e, ", with price : ", num(price), " for ", gm.name);
					gang.purchaseEquipment(gm.name, e);
				}
			}
		}
	}

	var memb = ns.args[0];

	showMember(memb, "before");

	gang.setMemberTask(memb, "Train Combat");

	gang.ascendMember(memb);

	equip(memb);

	showMember(memb, "after");

	ns.sleep(60 * 1000);
	gang.setMemberTask(memb, "Train Charisma");

	ns.sleep(60 * 1000);
	gang.setMemberTask(memb, "Terrorism");

	ns.sleep(60 * 1000);
	gang.setMemberTask(memb, "Vigilante Justice");

	ns.sleep(60 * 1000);
	gang.setMemberTask(memb, "Human Trafficking");
}