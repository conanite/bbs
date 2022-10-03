/** @param {NS} ns */
export async function main(ns) {
	if (!ns.fileExists("Formulas.exe", "home")) { 
		ns.tprint("You need to buy Formulas.exe first!"); 
		ns.exit();
	}
  
	var rf = ns.formulas.reputation;

	var fav = parseInt(ns.args[0]);
	var rep = Math.floor(rf.calculateFavorToRep(fav));
	var rep150 = Math.floor(rf.calculateFavorToRep(150));
	var repToGo = rep150 - rep;
	ns.tprint("You need ", rep, " rep for ", fav, " fav");
	ns.tprint("You need another ", repToGo, " rep for 150 fav");
}