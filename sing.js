import { ispwned, getPathToServer } from "/lib.js"

export async function recursiveConnectToServer(ns, node) {
	var sing = ns.singularity;
	if (node.parent) {
		await recursiveConnectToServer(ns, node.parent);
	}
	sing.connect(node.name);
}

export function backdoorAlready(ns, target) {
	return ns.getServer(target).backdoorInstalled;
}

export async function bdIsPossible(ns, target) {
	var s = ns.getServer(target);
	var pwned = await ispwned(ns, target);
	var hasBackdoor = backdoorAlready(ns, target);
	var mine = (s.purchasedByPlayer || target == "home");
	return (pwned && !hasBackdoor && !mine)
}

export async function installBackdoor(ns, chain) {
	await recursiveConnectToServer(ns, chain);
	await ns.singularity.installBackdoor();
}

/*
 * @param {NS} ns
 * @param {string} target - the name of the server on which to install the backdoor
 * 
 * Attempts to install a backdoor on the specified target server.
 * Will "connect" the player to the given server in order to install the backdoor ; returns
 * the player "home" after the operation is completed.
 * 
 */
export async function maybeInstallBackdoor(ns, target) {
	var sing = ns.singularity;
	var success = false;
	var canBD = await bdIsPossible(ns, target);
	if (canBD) {
		await installBackdoor(ns, await getPathToServer(ns, target));
		sing.connect("home");
		success = ns.getServer(target).backdoorInstalled;
		if (success) {
			var boundary = "".padEnd(47, "=");
			ns.tprint(boundary);
			ns.tprint("|", ("installed back door on " + target).padEnd(45, ' '), "|");
			ns.tprint(boundary);
		} else {
			ns.tprint("failed to install back door on ", target);
		}
	}
	return success;
}