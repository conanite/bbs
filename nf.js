/** @param {NS} ns */
export async function main(ns) {
  var inf = ns.infiltration;
  var lox = inf.getPossibleLocations();
  lox.forEach(function(loc) { 
    ns.tprint(loc);
    var infdata = inf.getInfiltration(loc);
    ns.tprint("  difficulty  : ", infdata.difficulty);
    ns.tprint("  cash        : ", infdata.reward.sellCash);
    ns.tprint("  tradeRep    : ", infdata.reward.tradeRep);
    ns.tprint("  SoARep      : ", infdata.reward.SoARep);
    ns.tprint("");
  });
}