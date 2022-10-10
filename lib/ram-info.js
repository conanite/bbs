import { netTraverse } from "/lib/net-traverse.js";

export const GB = 1024 * 1024 * 1024;

/** @param {NS} ns */
export async function getRamInfo(ns, serverFilter) {
  serverFilter ||= function (s) { return true; };

  var totalRam = 0;
  var usedRam = 0;

  var purchasedRam = 0;
  var purchasedUsed = 0;

  var homeRam = 0;
  var homeUsed = 0;

  var otherRam = 0;
  var otherUsed = 0;

  var unavailable = 0

  var f = function (node, ctl) {
    var s = ns.getServer(node.name);

    if (serverFilter(s)) {
      if (node.name == "home") {
        homeRam += s.maxRam;
        homeUsed += s.ramUsed;
        totalRam += s.maxRam;
        usedRam += s.ramUsed;
      } else if (s.purchasedByPlayer) {
        purchasedRam += s.maxRam;
        purchasedUsed += s.ramUsed;
        totalRam += s.maxRam;
        usedRam += s.ramUsed;
      } else if (s.hasAdminRights) {
        otherRam += s.maxRam;
        otherUsed += s.ramUsed;
        totalRam += s.maxRam;
        usedRam += s.ramUsed;
      } else {
        unavailable += s.maxRam;
      }
    }
  }

  await netTraverse(ns, f);

  return {
    total: { total: totalRam, used: usedRam },
    home: { total: homeRam, used: homeUsed },
    purchased: { total: purchasedRam, used: purchasedUsed },
    pwned: { total: otherRam, used: otherUsed },
    unavailable: unavailable
  }
}