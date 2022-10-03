import { crack, isCracked, isCrackable } from 'lib.js'
import { netTraverse } from 'net-traverse.js'

/** @param {NS} ns */
export async function main(ns) {
	var f = async function (node) {
		var target = node.name;
		if (!isCracked(ns, target) && isCrackable(ns, target)) {
			await crack(ns, target);
		}
	}

	await netTraverse(ns, f);
}