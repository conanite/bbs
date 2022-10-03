/** @param {NS} ns */
export async function main(ns) {
    function num(n) { return ns.nFormat(n, "$0.000a"); }

    var target = ns.args[0];
	var s = ns.getServer(target);
    var moneyMax = ns.getServerMaxMoney(target);
	var money = ns.getServerMoneyAvailable(target);
    var securityMin = ns.getServerMinSecurityLevel(target);
	var sec = ns.getServerSecurityLevel(target);
	var minHack = ns.getServerRequiredHackingLevel(target);
	var minPorts = ns.getServerNumPortsRequired(target);
	var hasRoot = s.hasAdminRights;
	var bd = s.backdoorInstalled;

	// var s = ns.getServer(srv);
	var s = ns.getServer(target);

	ns.tprint(target, " : money : ", num(money), " of max ", num(moneyMax) );
	ns.tprint(target, " : security : ", sec, " of min ", securityMin );
	ns.tprint(target, " : growth param : ", s.serverGrowth, ", cores : ", s.cpuCores, ", ram : ", s.maxRam);
	ns.tprint(target, " : min ports to nuke : ", minPorts, ", min hack level : ", minHack);
	ns.tprint(target, " : has root : ", hasRoot, ", backdoor : ", bd);
}


export function autocomplete(data, args) {
    return data.servers;
}