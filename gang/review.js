/** @param {NS} ns */
export async function main(ns) {
	function formatNaN(n) { if (isNaN(n)) { return "NaN" } else { return null; } }
	function num(n) { return formatNaN(n) || ns.nFormat(n, "0.000a"); }

	var gang = ns.gang;

	var membs = gang.getMemberNames();
	for (var memb of membs) {

		// gang.ascendMember(memb)
		var gm = gang.getMemberInformation(memb);

		ns.tprint(memb, 
			"    hm ", num(gm.hack_asc_mult),
			",   hp ", num(gm.hack_asc_points),
			" -- strm ", num(gm.str_asc_mult),
			", strp ", num(gm.str_asc_points),
			// ", def ", num(gm.def_asc_mult),
			// ", dex ", num(gm.dex_asc_mult),
			// ", agi ", num(gm.agi_asc_mult),
			" -- cham ", num(gm.cha_asc_mult),
			", chap ", num(gm.cha_asc_points),
			", chax ", num(gm.cha_exp),
			", cha asc mult", num(ns.formulas.gang.ascensionMultiplier(gm.cha_asc_points + gm.cha_exp - 1000))
			);
	}

}