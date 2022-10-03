/** @param {NS} ns */
export async function main(ns) {
	if (!ns.fileExists("Formulas.exe", "home")) { 
		ns.tprint("You need to buy Formulas.exe first!"); 
		ns.exit();
	}
  
	var rf = ns.formulas.reputation;

	var rep = parseInt(ns.args[0]);
	var fav = rf.calculateRepToFavor(rep);
	ns.tprint("You get ", fav, " favour for ", rep, " rep");
}