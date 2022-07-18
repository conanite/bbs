import * as lib from 'lib.js'

/** @param {NS} ns */
export async function main(ns) {
	var params = ns.flags([["target", "n00dles"], ["maxram", 16384], ["attackfrom", ""], ["help", false]])

	await lib.deployAttack(ns, ns.getHostname(), param.target, params.maxram, params.attackfrom);
}