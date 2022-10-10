/** @param {NS} ns */
export async function main(ns) {
	function formatNaN(n) { if (isNaN(n)) { return "NaN" } else { return null; } }
	function g(n) { return formatNaN(n) || ns.nFormat(n * GB, "0ib"); }
	function g00(n) { return formatNaN(n) || ns.nFormat(n * GB, "0.00ib"); }
	function num(n) { return formatNaN(n) || ns.nFormat(n, "$0.000a"); }
	function dec(n) { return formatNaN(n) || ns.nFormat(n, "0.000"); }
	function sec(n) { return formatNaN(n) || ns.nFormat(n / 1000, "0.0"); }

	var sing = ns.singularity;

	var crimes = [
		"SHOPLIFT",
		"ROB STORE",
		"MUG",
		"LARCENY",
		"DEAL DRUGS",
		"BOND FORGERY",
		"TRAFFICK ARMS",
		"HOMICIDE",
		"GRAND THEFT AUTO",
		"KIDNAP",
		"ASSASSINATE",
		"HEIST",
	];

	for (var c of crimes) {
		var cs = sing.getCrimeStats(c);
		var prob = sing.getCrimeChance(c);
		ns.tprint(c.padStart(17, ' '), 
			" INT ", dec(cs.intelligence_exp), 
			", ", num(cs.money).padStart(10, ' '), 
			", time ", sec(cs.time).padStart(7, ' '), "s", 
			", P ", dec(prob).padStart(6, ' '),
			", value $*P/time=", num(cs.money * prob / (cs.time / 1000)).padStart(10, ' '),
			", karma ", dec(cs.karma).padStart(6, ' '),
			"*P/time=", dec(cs.karma * prob / (cs.time / 1000)),
			", kills ", cs.kills);
	}
}