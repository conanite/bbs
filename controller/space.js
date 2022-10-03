import { GB, getRamInfo } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {

	function gb(n) { return ns.nFormat(n * GB, "0.0ib"); }

	var logs = [];

	function log(...args) {
		logs.push(args.join(""));
	}

	var r = await getRamInfo(ns);
	var pad = 12;

	log("             Total        Home   Purchased       Pwned    Unavailable");
	log("Used  ",
		gb(r.total.used).padStart(pad, ' '),
		gb(r.home.used).padStart(pad, ' '),
		gb(r.purchased.used).padStart(pad, ' '),
		gb(r.pwned.used).padStart(pad, ' '));

	log("Free  ",
		gb(r.total.total - r.total.used).padStart(pad, ' '),
		gb(r.home.total - r.home.used).padStart(pad, ' '),
		gb(r.purchased.total - r.purchased.used).padStart(pad, ' '),
		gb(r.pwned.total - r.pwned.used).padStart(pad, ' '));

	log("Total ",
		gb(r.total.total).padStart(pad, ' '),
		gb(r.home.total).padStart(pad, ' '),
		gb(r.purchased.total).padStart(pad, ' '),
		gb(r.pwned.total).padStart(pad, ' '),
		gb(r.unavailable).padStart(pad, ' '));

	ns.write("/monitor/000-available-ram.txt", logs.join("\n"), "w");

}