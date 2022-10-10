import { netTraverse } from "/lib/net-traverse.js";
import { getMaxRamDemand, scriptRams } from "/lib/attack.js";
import { GB, getRamInfo } from "/lib/ram-info.js";
import { usableAttackServers } from "/lib/attack.js";

/** @param {NS} ns */
export async function main(ns) {
	function formatNaN(n) { if (isNaN(n)) { return "NaN" } else { return null; } }
	function g(n) { return formatNaN(n) || ns.nFormat(n * GB, "0ib"); }
	function sec(n) { return formatNaN(n) || ns.nFormat(n / 1000, "0.0"); }

	var logs = [];

	function log(...args) {
		logs.push(args.join(""));
	}

	function getMMData() {
      var peek3 = ns.peek(3);
	  if (peek3 == "NULL PORT DATA") { return {}; }
      return JSON.parse(peek3);
	}

	var allProcesses = ns.ps();
	var spinners = allProcesses.filter(function(pi) {
		return pi.filename == "spin.js" && pi.args.length == 1;
	});

	var spinning = spinners.map(function(pi) {
		return pi.args[0];
	});

	var targets = [];
	var skipping = [];
	const rams = scriptRams(ns);
	const ri = await getRamInfo(ns, usableAttackServers);
	
	async function visitor(srv, ctl) {
		var name = srv.name;
		var server = ns.getServer(name);
		var wt = ns.getWeakenTime(name);
		var n00dles = name == "n00dles";
		if (server.purchasedByPlayer) { 
			skipping.push([name, "purchasedByPlayer"]);
			return;
		}
		if (server.moneyMax == 0) { 
			skipping.push([name, "no money"]);
			return;
		}
		if (spinning.indexOf(srv.name) >= 0) {
			skipping.push([name, "already spinning"]);
			return;
		}
		if (!server.hasAdminRights) {
			skipping.push([name, "not admin"]);
			return;
		}
		if (wt > (300 * 1000)) {
			skipping.push([name, "too slow"]);
			return;
		}
		if (wt < 900) {
			skipping.push([name, "too fast"]);
			return;
		}
		var ramWanted = getMaxRamDemand(ns, name, wt, rams)
		if (!n00dles && ramWanted > ri.total.total) {
			skipping.push([name, "too hungry: " + g(ramWanted)]);
			return; 
		}

		targets.push(server);
	}

	var appeals = {};

	/**
	 * @param {Server} server
	 */
	function calculateAppeal(server) {
		const me = ns.getPlayer();

		// hack power: related to percent of money stolen
		const difficultyMult = (100 - server.minDifficulty) / 100; // using minDifficulty not current difficulty
  		const skillMult = (me.skills.hacking - server.requiredHackingSkill) / me.skills.hacking; // always positive because we only consider servers that have already been pwned
  		const hackability = difficultyMult * skillMult;

		// hack time: related to time to execute a hack
		const hackTime = server.requiredHackingSkill * server.minDifficulty;

		// hack chance : related to chance of successfully hacking
		const chance = difficultyMult * skillMult;

		// threads: related to number of threads required and also to security growth
		const hackThreads = 1 / hackability;

		var good = hackability * chance * server.moneyMax;
		var bad = hackTime * hackThreads * hackThreads;

		return Math.pow(good / bad, server.serverGrowth / 100);

		// var wt = ns.getWeakenTime(server.hostname);
		// var sg = server.serverGrowth / 100;
		// var diff = server.minDifficulty;
		// var good = server.serverGrowth * server.serverGrowth * server.moneyMax;
		// // var good = server.moneyMax;
		// var hl = ns.getServerRequiredHackingLevel(server.hostname);
		// var bad = diff * getMaxRamDemand(ns, server.hostname, wt, rams);
		// // return good / (bad * bad * hl);
		// return Math.pow((server.moneyMax / bad), sg);
	}

	function appeal(server) {
		return (appeals[server.hostname] ||= calculateAppeal(server));
	}

	await netTraverse(ns, visitor);

	targets = targets.sort(function (s0, s1) { return appeal(s1) - appeal(s0) })

	targets.forEach(function(s) { 
		var ram = getMaxRamDemand(ns, s.hostname, ns.getWeakenTime(s.hostname), rams);
		var wt = ns.getWeakenTime(s.hostname);
		log("appeal: ", s.hostname, " ", appeal(s), " ram: ", g(ram), " wt: ", sec(wt)); 
	});

	var mmd = getMMData();
	var spinprocs = mmd.processes;
	var inprogress = Object.keys(spinprocs).filter(x => spinprocs[x].income > 0);
	var warming = spinning.filter(x => !inprogress.includes(x));
	// log("mmd: ", JSON.stringify(mmd));
	log("scripts: ", JSON.stringify(rams));
	log("hacking in progress: ", inprogress);
	log("spin.js processes: ", spinning.join(","));
	log("still warming: ", warming);

	if (warming.length == 0 && mmd.scale > 1 && targets.length > 0) {
		log("ready to spin ", targets[0].hostname);
		ns.run("spin.js", 1, targets[0].hostname);
	}

	// useful for debugging missing servers
	// skipping.forEach(function (sk) {
	// 	log("skipping: ", sk.join(" : "));
	// })

	ns.write("/monitor/300-hack-next-victim.txt", logs.join("\n"), "w");	
}