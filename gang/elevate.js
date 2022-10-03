/** @param {NS} ns */
export async function main(ns) {
	var gang = ns.gang;
	var memb = ns.args[0];

	while(true) {
		await ns.sleep(2000);
		var gm = gang.getMemberInformation(memb);

		var agix = gm.agi_exp;
		var haxx = gm.hack_exp;
		var chax = gm.cha_exp;
		if (agix < 6000) {
			gang.setMemberTask(memb, "Train Combat");
		} else if (haxx < 6000) {
			gang.setMemberTask(memb, "Train Hacking");
		} else if (chax < 6000) {
			gang.setMemberTask(memb, "Train Charisma");
		} else {
			gang.ascendMember(memb);
		}
	}
}