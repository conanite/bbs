/** @param {NS} ns */
export async function main(ns) {
	var gang = ns.gang;

	var membs = gang.getMemberNames();
	for (var memb of membs) {
		gang.setMemberTask(memb, "Terrorism");
	}

	for (var memb of membs) {
		var minfo = gang.getMemberInformation(memb);
		ns.tprint(memb, " task is ", minfo.task);
	}

}