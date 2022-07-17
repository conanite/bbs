/** @param {NS} ns */
export async function main(ns) {
    function num(n) { return ns.nFormat(n, "$0.000a"); }

	var bought = ["home", ...ns.getPurchasedServers()];

	for (let s of bought) {
		ns.tprint("Server : ", s);
		for (let process of ns.ps(s)) {
			var income = ns.getScriptIncome(process.filename, s, ...process.args);
			ns.tprint("   script #", process.pid, " ", process.filename, " args ", process.args, " threads ", process.threads, ", income: ", num(income));
		}
		ns.tprint("");
	}
}