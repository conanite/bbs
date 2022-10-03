import { maybeInstallBackdoor } from "/sing.js"

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	// ns.tail();
	if (ns.args.length > 0) {
		var target = ns.args[0];
		await maybeInstallBackdoor(ns, target);
	} else {
		ns.tprint("Usage: run bd.js target");
		ns.tprint("  where «target» is the name of the server on which to install a backdoor");
		ns.tprint("  without arguments, waits in a loop to backdoor the usual servers (faction servers and w0r1d_d43m0n)")
	}
}

export function autocomplete(data, args) {
	return data.servers;
}