import * as a from "/auglib.js";

/** @param {NS} ns */
export async function main(ns) {
	var sing = ns.singularity;
	
	var fac = ns.args[0];
	var aug = ns.args[1];
	sing.purchaseAugmentation(fac, aug);
}