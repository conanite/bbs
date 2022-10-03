/** @param {NS} ns */
export async function main(ns) {
	var sing = ns.singularity;

	var level = parseInt(ns.args[0]);

	sing.universityCourse("Rothman university", "Algorithms", false);
	
	while(ns.getHackingLevel() < level) {
		await ns.sleep(1000);
	}

	sing.stopAction();
}