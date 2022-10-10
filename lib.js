import { netTraverse } from "/lib/net-traverse.js";

export const GB = 1024 * 1024 * 1024;

function gb(ns, n) { return ns.nFormat(n * GB, "0ib"); }
function num(ns, n) { return ns.nFormat(n, "$0.000a"); }


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

/*
 * @param {NS} ns
 * @return true if the target server is nuked and hackable
 */
export async function ispwned(ns, target) {
  var admin = await ns.hasRootAccess(target);
  var hackable = await ns.getHackingLevel() > await ns.getServerRequiredHackingLevel(target);
  return admin && hackable;
}

/*
 * @param {NS} ns
 * @param {number} millis - time to wait initally
 * @param {number} pid - after waiting millis ms, wait until this pid is no longer running
 */
export async function waitForProcess(ns, millis, pid) {
  ns.print(new Date(), " waiting for ", ns.tFormat(millis))
  await ns.sleep(millis);
  while (ns.isRunning(pid)) { await ns.sleep(20); } // wait a bit extra in case we woke up just before target script finished
}


/** @param {NS} ns
 *  @param {string} dest - the name of the destination server to receive the default scripts
 *
 * copies a standard set of scripts from "home" to the given destination server
*/
export async function deployScripts(ns, dest) {
  var scripts = ["monitor.js", "lib.js", "hack-target.js", "weak-target.js", "grow-target.js"];
  await ns.scp(scripts, dest, "home");
}

/** @param {NS} ns
 *  @param {string} target - the name of the server to crack
*/
export function crack(ns, target) {
  if (ns.hasRootAccess(target)) { return; }
  ns.print("crack target is ", target);

  if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(target); }
  if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(target); }
  if (ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(target); }
  if (ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(target); }
  if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(target); }

  ns.nuke(target);

  if (ns.hasRootAccess(target)) {
    ns.toast("cracked " + target);
  } else {
    ns.toast("failed to crack " + target);
  }
}

/** @param {NS} ns
 *  @param {string} target - the name of the server to crack
*/
export function isCrackable(ns, target) {
  var s = ns.getServer(target);
  if (s.hasAdminRights) { return false; }

  var crackablePorts = 0;
  if (ns.fileExists("BruteSSH.exe", "home")) { crackablePorts++; }
  if (ns.fileExists("FTPCrack.exe", "home")) { crackablePorts++; }
  if (ns.fileExists("relaySMTP.exe", "home")) { crackablePorts++; }
  if (ns.fileExists("HTTPWorm.exe", "home")) { crackablePorts++; }
  if (ns.fileExists("SQLInject.exe", "home")) { crackablePorts++; }

  var s = ns.getServer(target);
  var hackable = s.requiredHackingSkill <= ns.getHackingLevel();
  var portable = s.numOpenPortsRequired <= crackablePorts;
  return (hackable && portable)
}

/** @param {NS} ns
 *  @param {string} target - the name of the server to crack
*/
export function isCracked(ns, target) {
  return ns.getServer(target).hasAdminRights;
}

/* @param {NS} ns
 * @return exponent of size of biggest affordable server, or zero if we can't afford any
 */
export function biggestAffordableServer(ns) {
  var bnm = ns.getBitNodeMultipliers();
  var maxram = Math.floor(20 + Math.log2(bnm.PurchasedServerMaxRam));
  var myMoney = ns.getPlayer().money;
  for (var i = maxram; i > 1; i--) {
    var ram = Math.pow(2, i);
    var cost = ns.getPurchasedServerCost(ram);
    if (!isNaN(cost) && cost < myMoney) { return i; }
  }
  return 0;
}

/** @param {NS} ns */
export function buyBiggestAffordableServer(ns, prefix, logs) {
  var size = biggestAffordableServer(ns);
  if (size > 7) {
    logs.push("buying new server of size " + size);
    var ram = Math.pow(2, size);
    var s = ns.purchaseServer(prefix + "-" + size, ram);
    // var cost = ns.nFormat(ns.getPurchasedServerCost(ram), "$0.000a");
    // ns.tprint("purchased server ", s, " with ", ram, "G RAM for ", cost, " and size ", size);
    return s;
  } else {
    return null;
  }
}

/** @param {NS} ns
*/
export function deleteScheduledServers(ns) {
  var bought = ns.getPurchasedServers();

  for (let s of bought) {
    if (ns.ps(s).length == 0 && isScheduledForDestruction(ns, s)) {
      ns.print("Deleting server : ", s);
      ns.deleteServer(s)
    }
  }
}

/** @param {String} prefix */
export function prefixServerFilter(pfx) {
  return function (s) {
    return s.hostname.startsWith(pfx);
  };
}

/** @param {NS} ns */
export async function getSmallestPurchasedServer(ns, filter) {
  var allPurchasedServers = ns.getPurchasedServers().map(function (s) { return ns.getServer(s); });

  var attackers = allPurchasedServers.filter(filter);

  var smallest = null;
  var smallestSize = 1024 * 1024 * 1024 * 1024;
  attackers.forEach(function (a) {
    if (a.maxRam < smallestSize) {
      smallest = a;
      smallestSize = a.maxRam;
    }
  });

  return smallest;
}

/** @param {NS} ns */
export async function manageAttackServers(ns, filter, poolsize, prefix, logs) {
  var bnm = ns.getBitNodeMultipliers();
  var maxServers = (25 * bnm.PurchasedServerLimit) - 8;
  if (poolsize < maxServers) {
    maxServers = poolsize;
  }

  logs.push("max servers is " + maxServers);

  deleteScheduledServers(ns);

  var allPurchasedServers = ns.getPurchasedServers().map(function (s) { return ns.getServer(s); });


  var attackServers = allPurchasedServers.filter(filter);

  logs.push("found " + attackServers.length + " existing servers");

  if (attackServers.length < maxServers) {
    logs.push("buying a new server now if possible");
    buyBiggestAffordableServer(ns, prefix, logs);

  } else {
    var smallest = await getSmallestPurchasedServer(ns, filter);

    var biggestAffordable = biggestAffordableServer(ns);

    if (smallest && biggestAffordable > Math.log2(smallest.maxRam)) {
      logs.push("scheduling an existing server for deletion: " + smallest.hostname);
      ns.write("scheduled_for_destruction.txt", "true", "w");
      ns.scp("scheduled_for_destruction.txt", smallest.hostname);
    } else {
      logs.push("can't afford a new server just yet...");
    }
  }
}

/** @param {NS} ns
 *  @param {string} name - the base name of the server. Size and index will be appended
 *  @param {number} size - the size exponent. RAM of new server will be 2^size
*/
export function buyServer(ns, name, size) {
  var ram = Math.pow(2, size);
  var cost = ns.getPurchasedServerCost(ram);
  var displayCost = ns.nFormat(cost, "$0.000a");

  if (name == 'cost') {
    return { cost: cost, ram: ram, displayCost: displayCost };
  } else {
    ns.tprint("purchasing server with base name ", name, " for ", num(ns, cost));
    if (name == null || name == '') { throw new Error("missing name for new server"); }
    var s = ns.purchaseServer(name + "-" + size, ram);
    ns.tprint("purchased ", s, " (", gb(ns, ram), " RAM) for ", num(ns, cost));
    return { name: s, cost: cost, ram: ram };
  }
}

/** @param {NS} ns
*/
export function deleteUnusedServers(ns) {
  var bought = ns.getPurchasedServers();

  var deleted = [];

  for (let s of bought) {
    if (ns.ps(s).length == 0) {
      ns.tprint("Deleting server : ", s);
      ns.deleteServer(s)
      deleted.push(s);
    }
  }

  if (deleted.length == 0) {
    ns.tprint("no servers found to delete");
  }
}

/**
 *  @param {NS} ns
 *  @param {function} f - a function to call with each discovered server name
 */
export async function netReverseTraverse(ns, f, srv, seen) {
  if (srv == null) {
    netReverseTraverse(ns, f, "home", {});
  } else {
    for (let neighbour of ns.scan(srv)) {
      if (seen[neighbour] == null) {
        seen[neighbour] = true;
        netReverseTraverse(ns, f, neighbour, seen);
      }
    }
    await f(srv);
  }
}

export async function getPathToServer(ns, target) {
  var chain = null;

  var f = function (node, ctl) {
    if (node.name == target) {
      chain = node;
      ctl.quit();
    };
  }

  await netTraverse(ns, f);

  return chain;
}

export function remainingPids(ns, pids) {
  var remaining = [];
  for (var i = 0; i < pids.length; i++) {
    var pid = pids[i];
    if (ns.isRunning(pid)) { remaining.push(pid); }
  }
  return remaining;
}

export function noneRunning(ns, pids) {
  for (var i = 0; i < pids.length; i++) {
    var pid = pids[i];
    if (ns.isRunning(pid)) { return false; }
  }
  return true;
}

export class Node {
  constructor(name) {
    this.name = name;
    this.check = "";
    this.waitingForPids = [];
    this.launchThredz = 0;
    this.remainingPids = null;

    this.finished = function (ns) {
      this.remainingPids = remainingPids(ns, this.waitingForPids);
      var fin = this.remainingPids.length == 0;
      if (fin) { this.waitingForPids = []; }
      return fin;
    };

    this.cancel = function (ns) {
      for (const pid of this.waitingForPids) {
        ns.kill(pid);
      }
      this.waitingForPids = [];
    }
  }
}

/*
 * @param {NS} ns
 * @param {String} s - the name of the server in question
 * @return true - if a file called "scheduled_for_destruction.txt" exists on the server
 *
 */
export function isScheduledForDestruction(ns, s) {
  if (s == "home") { return false; }
  var files = ns.ls(s, "scheduled_for_destruction.txt");
  return (files.length > 0);
}

/*
 * @param {NS} ns
 * @param {Node} node - encapsulating the state of our attack
 * @param {string} scriptName - the name of the script to launch
 * @param {number} thredz - how mane threads we want to launch
 * @param args - args to pass to the script
 *
 */
async function findServerWithRam(ns, amount) {
  var found = null;
  var f = function (node, ctl) {
    var s = ns.getServer(node.name);
    var used = s.ramUsed;

    if (node.name == 'home') {
      used += 20
      used += Math.sqrt(s.maxRam);
    }

    if (s.hasAdminRights &&
      (s.maxRam - used > amount) &&
      !(s.hostname.startsWith("hacknet-")) &&
      !isScheduledForDestruction(ns, node.name)) {

      // ctl.quit();
      found = s;

    } else if (!s.hasAdminRights) {
      ctl.prune();
    }
  }
  await netTraverse(ns, f);
  return found;
}

/*
 * @param {NS} ns
 * @param {Node} node - encapsulating the state of our attack
 * @param {string} scriptName - the name of the script to launch
 * @param {number} thredz - how mane threads we want to launch
 * @param args - args to pass to the script
 *
 */
async function _launch(ns, node, scriptName, ram, thredz, ...args) {
  if (thredz < 1) { return; }
  var s = await findServerWithRam(ns, ram * thredz);
  if (s == null) {
    if (thredz >= 2) {
      var round = (thredz % 2);
      thredz = Math.floor(thredz / 2);
      await _launch(ns, node, scriptName, ram, thredz + round, ...args);
      await _launch(ns, node, scriptName, ram, thredz, ...args);
    }
  } else if (thredz >= 1) {
    thredz = Math.floor(thredz);
    if (!ns.fileExists(scriptName, s.hostname)) {
      await ns.scp(scriptName, s.hostname, "home");
    }
    var newpid = ns.exec(scriptName, s.hostname, thredz, ...args, thredz);
    if (newpid != 0) {
      node.launchThredz += thredz;
      node.waitingForPids.push(newpid);
    }
  }
}

/*
 * @param {NS} ns
 * @param {Node} node - encapsulating the state of our attack
 * @param {string} scriptName - the name of the script to launch
 * @param {number} thredz - how mane threads we want to launch
 * @param args - args to pass to the script
 *
 */
export async function launch(ns, node, scriptName, thredz, ...args) {
  var ram = ns.getScriptRam(scriptName, "home");
  await _launch(ns, node, scriptName, ram, Math.floor(thredz), ...args);
}