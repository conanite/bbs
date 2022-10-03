import { netTraverse } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {

	var f = function(node, ctl) {
		var files = ns.ls(node.name, ".cct");
		if (files.length > 0) {
			ns.tprint("Server ", node.name, " has contracts ", files);
		}
	}

	await netTraverse(ns, f);

}