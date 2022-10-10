import { bdIsPossible, backdoorAlready, maybeInstallBackdoor } from "/sing.js"

/** @param {NS} ns */
export async function main(ns) {
	var sing = ns.singularity;

	const progs = [
		"BruteSSH.exe",
		"FTPCrack.exe",
		"relaySMTP.exe",
		"HTTPWorm.exe",
		"SQLInject.exe"
	];

	const bdtargets = [
		"CSEC",
		"avmnite-02h",
		"I.I.I.I",
		"run4theh111z",
		"4sigma",
		"megacorp",
		"ecorp",
		"fulcrumassets",
		"fulcrumtech",
		"b-and-a",
		// "w0r1d_d43m0n"
	];

	var crackablePorts = 0;

	function checkTorAndPrograms() {
		if (crackablePorts < progs.length) {
			crackablePorts = 0;
			var weHaveTheTorRouter = sing.purchaseTor();
			if (weHaveTheTorRouter) {
				for (var i = 0; i < progs.length; i++) {
					if (ns.fileExists(progs[i], "home")) {
						crackablePorts++;
					} else {
						sing.purchaseProgram(progs[i]);
					}
				}
			}
		}
	}

	async function checkBackdoorTargets() {
		for (var target of bdtargets) {
			if (!backdoorAlready(ns, target) && await bdIsPossible(ns, target)) {
				await maybeInstallBackdoor(ns, target)
			}
		}
	}

	await checkBackdoorTargets()
	checkTorAndPrograms();
}