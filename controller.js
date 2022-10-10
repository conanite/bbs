/** @param {NS} ns */
export async function main(ns) {
	var logs = [];

	function log(...args) {
		logs.push(args.join(""));
	}

	while(true) {
		await ns.sleep(1000);
		logs = [];

		var controllers = ns.ls("home", "controller/");
		for (var script of controllers) {
			var pid = ns.run(script, 1);
			if (pid == 0) {
				log("failed to run controller ", script);
			} else {
				while(ns.isRunning(pid)) {
					await ns.sleep(10);
				}
			}
		}

		ns.write("/monitor/9999-controller.txt", logs.join("\n"), "w");
	}
}