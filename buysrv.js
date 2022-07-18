/** @param {NS} ns */
export async function main(ns) {
	var sname = ns.args[0];
	var ram   = parseInt(ns.args[1]);
	ns.tprint("new server with ", ram, " RAM costs ", ns.nFormat(ns.getPurchasedServerCost(ram), "$0.000a"));
	if (sname != "cost") {
		var newname = ns.purchaseServer(sname, ram);
		ns.tprint("purchased server ", newname, " for ", ns.nFormat(ns.getPurchasedServerCost(ram), "$0.000a"));
	}
}