/** @param {NS} ns */
export async function main(ns) {
	var spent = true;
	var hn = ns.hacknet;
	while (spent) {
		spent = hn.spendHashes("Sell for Money", "", 1);
		await ns.sleep(10);
	}

}