import * as lib from 'lib.js'

/** @param {NS} ns */
export async function main(ns) {
	var target = ns.args[0];
	var size = parseInt(ns.args[1]);

	var s = ns.getServer(target);
	if (s == null) {
        ns.tprint("unknown server : ", target);
		ns.exit();
	}

    if (size < 1 || size > 20) {
        ns.tprint("size must be an integer between 1 and 20 inclusive, got : ", size);
		ns.exit();
	}

	lib.crack(ns, target);

	var attacker = lib.buyServer(ns, "a", size);

    if (attacker.name == null || attacker.name == '') {
	    ns.tprint("failed to purchase new server");
 	} else {
        await lib.deployAttack(ns, attacker.name, target);
	}
}