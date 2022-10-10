export const MIN_INTERVAL = 2000;
export const hackScript = "hack-target.js";
export const weakScript = "weak-target.js";
export const growScript = "grow-target.js";

var cacheScriptRams = null;

export function scriptRams(ns) {
	cacheScriptRams ||= {
		hack: ns.getScriptRam(hackScript),
		weak: ns.getScriptRam(weakScript),
		grow: ns.getScriptRam(growScript)
	}
	return cacheScriptRams;
}

export function thr(n) {
	if (n < 1) {
		return 1;
	} else {
		return Math.round(n);
	}
}

/**
 *  @param {NS} ns
 *  @param {Server} s
 * 
 *  scaled by 2.0 for BN3.1 
 */
export function threadsToWeaken(ns, s) {
	var minDiff = s.minDifficulty;
	return thr(2 * getThreadsToWeakenByAmount(ns, minDiff));
}

/**
 *  @param {Server} s
 */
export function threadsToHack(ns, s) {
	var hackPower = ns.hackAnalyze(s.hostname); // proportion of money stolen by one thread
	return thr(0.92 / hackPower); // aim for 92% of available so #grow can bring us easily back to 100%
}

/**
 *  @param {Server} s
 */
export function threadsToGrow(ns, s) {
	return thr(ns.growthAnalyze(s.hostname, 50, 1)); // assume there's only 2% of max present
}

export function isAttackServer(s) {
	return s.purchasedByPlayer && (s.hostname.substring(0, 2) === "a-");
}

export function isHacknetServer(s) {
	return s.hostname.startsWith("hacknet");
}

export function usableAttackServers(s) {
	// return isAttackServer(s) || isHacknetServer(s) || s.hostname == 'home' || s.hasAdminRights;
	return isAttackServer(s) || s.hostname == 'home' || (!isHacknetServer(s) && s.hasAdminRights);
}

/** @param {NS} ns
 *
 *  estimates the minimum number of threads required to weaken a target to minimum difficulty
 */
export function getThreadsToWeakenByAmount(ns, amount) {
	var max = 1000000;
	var thredz = max / 2;
	var min = 0;

	while (max - min > 2) {
		var decrease = ns.weakenAnalyze(thredz);
		if (decrease > amount) { // too many threads
			max = thredz;
			thredz = thredz - ((thredz - min) / 2);
		} else { // too few threads
			min = thredz;
			thredz = thredz + ((max - thredz) / 2);
		}
	}

	return Math.floor(thredz);
}

/** @param {NS} ns
 *
 *  estimates the minimum number of threads required to weaken a target to minimum difficulty
 */
export function getMinThreadsToWeaken(ns, target) {
	var s = ns.getServer(target);

	var currentDifficulty = s.hackDifficulty;
	var minDifficulty = s.minDifficulty;
	var diff = currentDifficulty - minDifficulty;

	return getThreadsToWeakenByAmount(ns, diff);
}

export function getMaxRamDemand(ns, target, weakenTime, rams) {
	var s = ns.getServer(target);
	// var gt = ns.getGrowTime(target);
	// var ht = ns.getHackTime(target);

	// based on constants in https://github.com/danielyxie/bitburner/blob/be553f3548b0082794f7aa12c594d6dad8b91336/src/Hacking.ts
	// change here if they change there!
	var gt = weakenTime / 4;
	var ht = weakenTime * 4 / 5;

	var thrw = threadsToWeaken(ns, s);
	var thrh = threadsToHack(ns, s);
	var thrg = threadsToGrow(ns, s);
	
	if (thrh == Infinity) { thrh = thrw; }

	var ramW0 = rams.weak * thrw * weakenTime;
	var ramH1 = rams.hack * thrh * ht;
	var ramW2 = ramW0;
	var ramG3 = rams.grow * thrg * gt;
	var ramW4 = ramW0;
	var demand = (ramW0 + ramH1 + ramW2 + ramG3 + ramW4) / MIN_INTERVAL;
	// if (demand == Infinity) {
	// 	ns.tprint("infinite RAM demand for ", target, 
	// 					", thrw ", thrw,
	// 					", thrh ", thrh, 
	// 					", thrg ", thrg, 
	// 					", MIN_INTERVAL ", MIN_INTERVAL);
	// }
	return demand;
}