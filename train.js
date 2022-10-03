/** @param {NS} ns */
export async function main(ns) {
	if (ns.args.length < 1) {
		ns.tprint("usage: train 75");
		ns.tprint("trains all combat skills up to 75, in powerhouse gym in sector 12");
		ns.exit();
	}

	var sing = ns.singularity;
	var level = parseInt(ns.args[0]);

	async function train(skillname) {
		var skill = ns.getPlayer().skills[skillname];
		sing.travelToCity("Sector-12");
		if (skill < level) {
			await sing.gymWorkout("Powerhouse Gym", skillname, false);
		}

		while (skill < level) {
			await ns.sleep(400);

			var pl = ns.getPlayer();

			if (pl.city != "Sector-12") {
				ns.tprint("exit training, not in right city");
				ns.exit();
			}

			skill = pl.skills[skillname];
		}
		ns.tprint(skillname, " is now ", skill);
	}

	await train("strength");
	await train("defense");
	await train("dexterity");
	await train("agility");
}