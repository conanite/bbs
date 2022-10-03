/** @param {NS} ns */
export async function main(ns) {
	var sing = ns.singularity;

	var n = parseInt(ns.args[0]);
	if (isNaN(n)) { n = 10; }

	ns.tprint("rob a store ",n, " times");

	for (var i = 0 ; i < n ; i++) {
		await sing.commitCrime("rob store");
		while (sing.isBusy()) {
			await ns.sleep(200);
		}
	}

}