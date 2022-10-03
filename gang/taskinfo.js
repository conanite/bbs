/** @param {NS} ns */
export async function main(ns) {
	function formatNaN(n) { if (isNaN(n)) { return "NaN" } else { return null; } }
	function mon(n) { return formatNaN(n) || ns.nFormat(n, "$0.000a"); }
	function num(n) { return formatNaN(n) || ns.nFormat(n, "0.000a"); }
	function n0(n) { return formatNaN(n) || ns.nFormat(n, "0.0a"); }
	function n00(n) { return formatNaN(n) || ns.nFormat(n, "0.00000a"); }

	var gang = ns.gang;
	var gf = ns.formulas.gang;
	var gi = gang.getGangInformation();

	var tasks = gang.getTaskNames();

	ns.tprint("name".padStart(22, ' '),
		"agiW".padStart(5, ' '),
		"Money".padStart(6, ' '),
		"Resp".padStart(12, ' '),
		"Want".padStart(12, ' '),
		"chaW".padStart(6, ' '),
		"defW".padStart(6, ' '),
		"dexW".padStart(6, ' '),
		"diff".padStart(6, ' '),
		"hackW".padStart(6, ' '),
		"Combat".padStart(6, ' '),
		"Hack".padStart(6, ' '),
		"strW".padStart(6, ' '),
		"territory");

	for (var task of tasks) {
		var info = gang.getTaskStats(task);

		ns.tprint(task.padStart(22, ' '),
			info.agiWeight.toString().padStart(5, ' '),
			n0(info.baseMoney).padStart(6, ' '),
			n00(info.baseRespect).padStart(12, ' '),
			n00(info.baseWanted).padStart(12, ' '),
			n0(info.chaWeight).padStart(6, ' '),
			n0(info.defWeight).padStart(6, ' '),
			n0(info.dexWeight).padStart(6, ' '),
			n0(info.difficulty).padStart(6, ' '),
			n0(info.hackWeight).padStart(6, ' '),
			info.isCombat.toString().padStart(6, ' '),
			info.isHacking.toString().padStart(6, ' '),
			n0(info.strWeight).padStart(6, ' '),
			info.territory);
	}

	var membs = gang.getMemberNames();
	for (var memb of membs) {
		var gm = gang.getMemberInformation(memb);
		ns.tprint(memb);
		for (var task of tasks) {
			var gt = gang.getTaskStats(task);
			var money = gf.moneyGain(gi, gm, gt);
			var respect = gf.respectGain(gi, gm, gt);
			var wanted = gf.wantedLevelGain(gi, gm, gt);
			ns.tprint("  ", task.padStart(24, ' '),
						mon(money).padStart(10, ' '),
						", R ", n00(respect).padStart(12, ' '), 
						", W ", n00(wanted).padStart(12, ' '));
		}
	}
}