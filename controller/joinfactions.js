import * as a from "/auglib.js";

/** @param {NS} ns */
export async function main(ns) {
	var sing = ns.singularity;

	var logs = [];

	function log(...args) {
		logs.push(args.join(""));
	}

	var factions = sing.checkFactionInvitations();
	for (var i = 0; i < factions.length; i++) {
		if (!a.noAutoJoin[factions[i]]) {
			sing.joinFaction(factions[i]);
		}
	}


	for (var f of ns.getPlayer().factions) { log(f) }


	ns.write("/monitor/200-factions.txt", logs.join("\n"), "w");
}