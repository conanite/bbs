import { netTraverse } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
    var target = ns.args[0];
	var chain = null;

	var f = function(node) {
       if (node.name == target) { chain = node; };
	   return false;
	}

    netTraverse(ns, f);
	
	var connectCommand = "";
	while (chain != null) {
		connectCommand = "connect " + chain.name + " ; " + connectCommand;
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