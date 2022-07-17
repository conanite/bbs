/** @param {NS} ns */
export async function main(ns) {
    function num(n) { return ns.nFormat(n, "$0.000a"); }

	var whoami  = ns.getHostname();
	var attackers = {};
	var targets   = {};

	for (let s of ns.getPurchasedServers()) {
		attackers[s] = {
            ram:     ns.getServerMaxRam(s),
			targets: []
		}
	}

    for (let process of ns.ps()) {
		if (process.filename == "monitor.js") {
			var tf     = process.args.indexOf("--target");
			var target = process.args[tf + 1];

            var af       = process.args.indexOf("--attackfrom");
			var attacker = process.args[af + 1];
			// var as       = ns.getServer(attacker);

            var rf       = process.args.indexOf("--maxram");
			var maxram   = process.args[rf + 1];
			if (rf < 0 || maxram == null || maxram == '' || maxram == 'max') {
				maxram = ns.getServerMaxRam(attacker);
			}

            var info = {
				attacker: attacker,
				target:   target,
				ram:      maxram,
				income:   ns.getScriptIncome(process.filename, whoami, ...process.args) 

			}
			attackers[attacker] ||= {
                ram:     ns.getServerMaxRam(attacker),
			    targets: []
			};
			attackers[attacker].targets.push(info);

			targets[target] ||= [];
            targets[target].push(info);
		}
	}

	if (ns.args[0] == 'attackers') {
		for (let [a, data] of Object.entries(attackers)) {
            ns.tprint("Attacker: ", a, " RAM ", data.ram, " is attacking :");
			var income = 0;
			var ram = 0;
			for (let tg of data.targets) {
				income += tg.income;
				ram    += tg.ram;
                ns.tprint("  ", tg.target, " with ", tg.ram, " RAM for ", num(tg.income), " income");
			}
			var remainingram = data.ram - ram;
            ns.tprint("used ", ram, "/", data.ram, " RAM (remaining ", remainingram, "), total income: ", num(income));
			ns.tprint("");
		}
	} else if (ns.args[0] == "targets") {
		for (let [tg, atts] of Object.entries(targets)) {
            ns.tprint("Target: ", tg, " is being attacked from :");
			var income = 0;
			var ram = 0;
			for (let att of atts) {
				income += att.income;
				ram    += att.ram;
                ns.tprint("  ", att.attacker, " with ", att.ram, " RAM for ", num(att.income), " income");
			}
            ns.tprint("used ", ram, " RAM, total income: ", num(income));
			ns.tprint("");
		}
	} else {
		throw new Error("arg should be attackers or targets, got ", ns.args);
	}
}