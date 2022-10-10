/** @param {NS} ns */
export async function main(ns) {
	function formatNaN(n) { if (isNaN(n)) { return "NaN" } else { return null; } }
	function mon(n) { return formatNaN(n) || ns.nFormat(n, "$0.000a"); }
	function num(n) { return formatNaN(n) || ns.nFormat(n, "0.000a"); }
	function n0(n) { return formatNaN(n) || ns.nFormat(n, "0.0a"); }
	function n00(n) { return formatNaN(n) || ns.nFormat(n, "0.00000a"); }

	var logs = [];
	var memberLogs = {};
	var multGrow = {};

	var gang = ns.gang;

	if (!gang.inGang()) {
		log("not in a gang, karma is ", ns.heart.break());
		ns.write("/monitor/200-gang.txt", logs.join("\n"), "w");
		return;
	}

	var gf = ns.formulas.gang;
	var gi = gang.getGangInformation();
	var tasks = gang.getTaskNames();
	var focus = ns.read("gang-focus.txt");

	function log(...args) { logs.push(args.join("")); }

	function logMemb(memb, ...args) { 
		memberLogs[memb] ||= ""; 
		memberLogs[memb] += args.join(""); 
	}

	function equip(memb) {
		var spending = 0;
		var itemCount = 0;
		var equips = gang.getEquipmentNames();
		var gm = gang.getMemberInformation(memb);
		var gm_eqs = gm.upgrades + gm.augmentations;
		for (var e of equips) {
			if (!gm_eqs.includes(e)) {
				var price = gang.getEquipmentCost(e);
				if (price < ns.getPlayer().money) {
					// ns.tprint("Purchasing equipment : ", e, ", with price : ", num(price), " for ", gm.name);
					var bought = gang.purchaseEquipment(gm.name, e);
					if (bought) { 
						spending += price;
						itemCount++;
					}
				}			
			}
		}	
		log("spent ", num(spending), " on ", itemCount, " items for ", memb);
	}



	function ascInfo(exp, pts, mult) {
		var asc_pts_gain = gf.ascensionPointsGain(exp);
		var asc_pts_after = pts + asc_pts_gain;
		var newMult = gf.ascensionMultiplier(asc_pts_after);

		return { abs: (newMult - mult), prop: ((newMult / mult) - 1), newM: newMult, oldM: mult };
	}

	function mults(gm) {
		return {
			hack: ascInfo(gm.hack_exp, gm.hack_asc_points, gm.hack_asc_mult),
			str: ascInfo(gm.str_exp, gm.str_asc_points, gm.str_asc_mult),
			def: ascInfo(gm.def_exp, gm.def_asc_points, gm.def_asc_mult),
			dex: ascInfo(gm.dex_exp, gm.dex_asc_points, gm.dex_asc_mult),
			agi: ascInfo(gm.agi_exp, gm.agi_asc_points, gm.agi_asc_mult),
			cha: ascInfo(gm.cha_exp, gm.cha_asc_points, gm.cha_asc_mult)
		}
	}

	function ascValue(gm) {
		var mm = mults(gm);
		var props = mm.hack.prop + mm.str.prop + mm.def.prop + mm.dex.prop + mm.agi.prop + mm.cha.prop;
		return props / 6;
	}

	function setToBestTask(memb) {
		var gm = gang.getMemberInformation(memb);

		var bestTask = null;
		var bestMoney = 0;
		var bestRespect = 0;
		var bestWanted = 0;

		for (var task of tasks) {
			var gt = gang.getTaskStats(task);
			var money = gf.moneyGain(gi, gm, gt);
			var respect = gf.respectGain(gi, gm, gt);
			var wanted = gf.wantedLevelGain(gi, gm, gt);
			if (respect / wanted > 100) {
				if (money > bestMoney) {
					bestTask = task;
					bestMoney = money;
					bestRespect = respect;
					bestWanted = wanted;
				}
			}

		}
		
		if (bestTask != null) {
			gang.setMemberTask(memb, bestTask);
			logMemb(memb, " has task ", bestTask.padStart(24, ' '),
				mon(bestMoney).padStart(10, ' '),
				", R ", n00(bestRespect).padStart(12, ' '),
				", W ", n00(bestWanted).padStart(12, ' '));
		} else {
			logMemb(memb, " doesn't know what to do...");
		}
	}

	var now = Math.floor(new Date().getTime() / 5000); // 5-second ticks

	if (now % 3 != 0) { return; } // every 15 seconds

	if (ns.read("gang-controller.txt") == now.toString()) { return; }

	ns.write("gang-controller.txt", now.toString(), "w");

	var timeToAsc = (now % 12 == 0); // every 1 minute

	log("now is ", now, " time to asc is ", timeToAsc);
	if (focus) { log("focus is ", focus); }
	
	var members = gang.getMemberNames();

	var newName = "g" + members.length.toString().padStart(2, '0');
	var newMember = gang.recruitMember(newName);

	if (newMember) {
		members = gang.getMemberNames();
		log("recruited new member, member count is now ", members.length);
		equip(newName);
	} else {
		log("didn't recruit anybody, member count is ", members.length);
	}

	var bestAscGrowth = 0;
	var bestAscMember = null;

	for (var memb of members) {
		var gm = gang.getMemberInformation(memb);
		var av = ascValue(gm);
		if (gm.agi_exp > 4000 && gm.dex_exp > 4000 && gm.cha_exp > 4000 && av > bestAscGrowth) {
			bestAscGrowth = av;
			bestAscMember = memb;
		}

		multGrow[memb] = av;
	}


	for (var memb of members) {
		if (memb == bestAscMember) { logMemb(memb, " *ASC* "); }
		
		var gm = gang.getMemberInformation(memb);
		if (gm.agi_exp < 4000 || gm.dex_exp < 4000) {
			logMemb(memb, " needs to work on combat a little");
			gang.setMemberTask(memb, "Train Combat");
		} else if (gm.cha_exp < 4000) {
			logMemb(memb, " needs to work a bit on charisma");
			gang.setMemberTask(memb, "Train Charisma");
		} else if (timeToAsc && memb == bestAscMember && bestAscGrowth > 0.08) {
			logMemb(memb, " ascends to a higher plane of existence");
			gang.ascendMember(memb);
			equip(memb);
			gang.setMemberTask(memb, "Train Charisma");
		} else if (focus == "rep") {
			logMemb(memb, " is a terror to all");
			gang.setMemberTask(memb, "Terrorism");
		} else {
			setToBestTask(memb);
		}

		logMemb(memb, " ASC: ", n00(multGrow[memb]));
	}

	ns.write("/monitor/200-gang.txt", logs.join("\n"), "w");
	ns.write("/monitor/200-gang.txt", "\n", "a");
	for (var [memb, logs] of Object.entries(memberLogs)) {
		ns.write("/monitor/200-gang.txt", [memb, logs, "\n"].join(" "), "a");
	}
}