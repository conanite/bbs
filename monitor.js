/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	while (true) {
		await ns.sleep(1000);
		ns.clearLog();

		var files = ns.ls("home", "monitor/").sort();

		for (var f of files) {
			ns.print(f);
			ns.print("");
			ns.print(ns.read(f));
			ns.print("");
			ns.print("=================================");
			ns.print("");
		}
	}
}