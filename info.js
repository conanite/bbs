/** @param {NS} ns */
export async function main(ns) {
	function num(n) { return ns.nFormat(n, "$0.000a"); }

	var target = ns.args[0];
	var moneyMax = ns.getServerMaxMoney(target);
	var money = ns.getServerMoneyAvailable(target);
	var securityMin = ns.getServerMinSecurityLevel(target);
	var sec = ns.getServerSecurityLevel(target);

	// var s = ns.getServer(srv);
	var s = ns.getServer(target);
	var admin = (s.hasAdminRights ? " ✓" : "")

    ns.tprint(s.hostname, " ", admin);
	ns.tprint(target, " : money : ", num(money), " of max ", num(moneyMax));
	ns.tprint(target, " : security : ", sec, " of min ", securityMin);
	ns.tprint(target, " : growth param : ", s.serverGrowth, ", cores : ", s.cpuCores, ", ram : ", s.maxRam);
	if (!s.hasAdminRights) {
		ns.tprint(target, " : min hack skill ", s.requiredHackingSkill, ", ports for nuke: ", s.numOpenPortsRequired);
	}
}


export function autocomplete(data, args) {
	return data.servers;
}