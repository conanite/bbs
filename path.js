import { getPathToServer } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
	var target = ns.args[0];

	var chain = await getPathToServer(ns, target);

	var connectCommand = "";
	while (chain != null) {
		if (chain.name != "home") {
			connectCommand = "connect " + chain.name + " ; " + connectCommand;
		}
		chain = chain.parent;
	}

	if (connectCommand == "") {
		ns.tprint("host not found : ", target);
	} else {
		ns.tprint(connectCommand);
	}
}


export function autocomplete(data, args) {
	return data.servers;
}