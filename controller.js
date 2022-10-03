/** @param {NS} ns */
export async function main(ns) {
	while(true) {
		await ns.sleep(1000);

		var controllers = ns.ls("home", "controller/");
		for (var script of controllers) {
			var pid = ns.run(script, 1);
			if (pid == 0) {
				ns.tprint("failed to run controller ", script);
			} else {
				while(ns.isRunning(pid)) {
					await ns.sleep(10);
				}
			}
		}
	}
}