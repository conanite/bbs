import { getRamInfo, GB, Node, getMyProcess, getThreadsToWeakenByAmount, launch, getMinThreadsToWeaken } from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");

  const MIN_INTERVAL = 4000;
  const STEP_GAP = 400;
  const MAX_BATCHES = 18;

  const hackScript = "hack-target.js";
  const weakScript = "weak-target.js";
  const growScript = "grow-target.js";

  const hackRam = ns.getScriptRam(hackScript);
  const weakRam = ns.getScriptRam(weakScript);
  const growRam = ns.getScriptRam(growScript);

  var lastTargetMoment = 0;
  var scaling = 1;
  var batchCount = 0;
  var bestWeakTime = 1024 * 1024;
  var myProc = await getMyProcess(ns);
  var target = ns.args[0];

  var totalRamDemand = 1024 * 1024 * 1024; // random initial value, should be quickly overwritten by peeking port 3 as writen by mm.js
  var ramForMe = 0;

  var batches = [];
  var lastLaunch = 0;
  var lastNotify = 0;
  const notifyInterval = 1000;
  var notifyRand = Math.random() * notifyInterval; // randomise notify time so notifications don't arrive all at once
  var sinceLastLaunch = 0;
  var approxInterval = 0;
  var noNewBatch = [];


  function formatNaN(n) { if (isNaN(n)) { return "NaN" } else { return null; } }
  function g(n) { return formatNaN(n) || ns.nFormat(n * GB, "0ib"); }
  function g00(n) { return formatNaN(n) || ns.nFormat(n * GB, "0.00ib"); }
  function num(n) { return formatNaN(n) || ns.nFormat(n, "$0.000a"); }
  function dec(n) { return formatNaN(n) || ns.nFormat(n, "0.000"); }
  function sec(n) { return formatNaN(n) || ns.nFormat(n / 1000, "0.0"); }

  function thr(n) {
    if (n < 1) {
      return 1;
    } else {
      return Math.round(n);
    }
  }

  function weakTime() {
    var wt = ns.getWeakenTime(target);
    if (wt < bestWeakTime) { bestWeakTime = wt; }
    return bestWeakTime;
  }
  /**
   *  @param {Server} s
   */
  function threadsToGrow(s) {
    return thr(ns.growthAnalyze(s.hostname, 50, 1)); // assume there's only 2% of max present
  }

  /**
   *  @param {Server} s
   * 
   *  scaled by 2.0 for BN3.1 
   */
  function threadsToWeaken(s) {
    var minDiff = s.minDifficulty;
    return thr(2 * getThreadsToWeakenByAmount(ns, minDiff));
  }

  /**
   *  @param {Server} s
   */
  function threadsToHack(s) {
    var hackPower = ns.hackAnalyze(s.hostname);
    return thr(0.92 / hackPower); // aim for 92% of available so #grow can bring us easily back to 100%
  }


  function getRamRequirement(target) {
    var s = ns.getServer(target);
    var ramW0 = weakRam * threadsToWeaken(s) * weakTime();
    var ramH1 = hackRam * threadsToHack(s) * ns.getHackTime(target);
    var ramW2 = ramW0;
    var ramG3 = growRam * threadsToGrow(s) * ns.getGrowTime(target);
    var ramW4 = ramW0;
    return (ramW0 + ramH1 + ramW2 + ramG3 + ramW4) / MIN_INTERVAL;
  }

  /**
   * @return average RAM usage, based on the idea that hack and grow threads are not active all the time
   */
  function getRamPerBatch(target) {
    var s = ns.getServer(target);
    var ht = ns.getHackTime(target);
    var wt = weakTime();
    var gt = ns.getGrowTime(target);
    var batchLifetime = Math.max(ht, wt, gt);

    var ramW0 = weakRam * threadsToWeaken(s) * wt;
    var ramH1 = hackRam * threadsToHack(s) * ht;
    var ramW2 = ramW0;
    var ramG3 = growRam * threadsToGrow(s) * gt;
    var ramW4 = ramW0;
    return (ramW0 + ramH1 + ramW2 + ramG3 + ramW4) / batchLifetime;
  }

  function newNode(target, requestedThredz, targetMoment, ramPerThread) {
    var n = new Node(target);
    n.launchThredz = 0;
    n.stepThredz = requestedThredz;
    n.targetMoment = targetMoment;
    n.ramRequirement = requestedThredz * ramPerThread;
    return n;
  }

  async function warm(target) {
    var wnode = new Node(target);
    var s = ns.getServer(target);
    var wthredz = getMinThreadsToWeaken(ns, target);
    var wfinishedat = new Date(new Date().getTime() + ns.getWeakenTime(target));

    await launch(ns, wnode, "weak-target.js", 3 * wthredz, target);
    ns.tprint("wanted ", (3 * wthredz), " got ", wnode.launchThredz, " threads for weaken");

    var moneyMax = s.moneyMax;
    var maxMultiply = moneyMax / s.moneyAvailable;

    var gthredz = ns.growthAnalyze(target, maxMultiply, 1);
    var gfinishedat = new Date(new Date().getTime() + ns.getGrowTime(target));

    var gnode = new Node(target);
    await launch(ns, gnode, "grow-target.js", 2 * gthredz, target);
    ns.tprint("wanted ", (2 * gthredz), " got ", gnode.launchThredz, " threads for grow");

    var done = false;
    var wdone = false;
    var gdone = false;

    function check() {
      wdone = wnode.finished(ns);
      gdone = gnode.finished(ns);
      done = wdone && gdone;
    }

    while (!done) {
      await ns.sleep(1000); // we're not in a hurry here, this usually takes a long time anyway
      check();
      ns.clearLog();

      if (wdone) {
        ns.print("finished weaken");
      } else {
        ns.print("waiting for weaken : ", sec(wfinishedat - Date.now()),
          " running with ", wnode.launchThredz, " threads");
      }

      if (gdone) {
        ns.print("finished grow");
      } else {
        ns.print("waiting for grow : ", sec(gfinishedat - Date.now()),
          " running with ", gnode.launchThredz, " threads");
      }
    }

    ns.toast("Finished warming up " + target, "info", 4000);
  }

  class Batch {
    constructor(ns, target, scale) {
      this.ns = ns;
      this.target = target;
      this.scale = scale;
      this.batchNumber = batchCount++;

      this.step0w = null;
      this.step1h = null;
      this.step2w = null;
      this.step3g = null;
      this.step4w = null;

      function deadNode(n) {
        return n == null || n.finished(ns);
      }

      this.ram = function () {
        var steps = [this.step0w, this.step1h, this.step2w, this.step3g, this.step4w];
        var totalRam = 0;
        steps.forEach(function (step) {
          if (step != null && step.waitingForPids.length > 0) {
            totalRam += step.ramRequirement;
          }
        });
        return totalRam;
      }

      this.dead = function () {
        var hasTime = this.destinationTime != null;
        var past = hasTime && (this.destinationTime < new Date());
        var nodesAreDead = deadNode(this.step0w) && deadNode(this.step1h) && deadNode(this.step2w) && deadNode(this.step3g);
        return hasTime && past && nodesAreDead;
      }

      this.visit = async function () {
        var now = new Date();
        var s = ns.getServer(target);
        var rightNow = now.getTime();

        // ns.print("Visit ", target, " 0:", this.step0w, ", 1:", this.step1h, ", 2:", this.step2w, ", 3:", this.step3g)
        if (this.step0w == null) {
          var needThredz = threadsToWeaken(s) * this.scale;
          if (needThredz < 1) { needThredz = 1; }
          var weakTime = ns.getWeakenTime(target);
          var targetMoment = rightNow + weakTime;
          if (targetMoment < (lastTargetMoment + MIN_INTERVAL)) { return }
          lastTargetMoment = targetMoment;
          lastLaunch = now;
          this.destinationTime = new Date(targetMoment);
          this.step0w = newNode(target, needThredz, targetMoment, weakRam);
          await launch(ns, this.step0w, weakScript, needThredz, target, this.batchNumber, "step0w");
        }

        var anchorMoment = null;
        if (this.destinationTime != null) {
          anchorMoment = this.destinationTime.getTime();
        }

        if (this.step1h == null && anchorMoment != null) {
          var hTime = ns.getHackTime(target);
          var targetMoment = anchorMoment + (1.0 * STEP_GAP);
          var tooLate = targetMoment + STEP_GAP; // not launching if end time is after end of next step (weaken)
          var finishTime = rightNow + hTime;

          if (finishTime >= targetMoment && finishTime < tooLate) {
            var needThredz = threadsToHack(s) * this.scale;
            if (needThredz < 1) { needThredz = 1; }
            this.step1h = newNode(target, needThredz, targetMoment, hackRam);
            if (this.step0w.launchThredz > 0) {
              await launch(ns, this.step1h, hackScript, needThredz, target, this.batchNumber, "step1h");
            }
          }
        } else if (this.step1h != null) {
          if (this.step1h.targetMoment - rightNow < 50) {
            var srvMoneyNow = s.moneyAvailable;
            var srvMoneyMax = s.moneyMax;
            if ((srvMoneyNow * 20) < srvMoneyMax) { // cancel hack just before it runs, if money is seriously low
              // ns.tprint("money too low on ", target, ", money is ", num(srvMoneyNow), " of ", num(srvMoneyMax));
              this.step1h.cancel(ns);
            }
          }
        }

        if (this.step2w == null && anchorMoment != null) {
          var wTime = ns.getWeakenTime(target);
          var targetMoment = anchorMoment + (2.0 * STEP_GAP);
          var tooLate = targetMoment + MIN_INTERVAL; // not launching if end time is after end of next step (weaken)
          var finishTime = rightNow + wTime;

          if (finishTime >= targetMoment && finishTime < tooLate) {
            var needThredz = threadsToWeaken(s) * this.scale;
            if (needThredz < 1) { needThredz = 1; }
            this.step2w = newNode(target, needThredz, targetMoment, weakRam);
            await launch(ns, this.step2w, weakScript, needThredz, target, this.batchNumber, "step2w");
          }
        }
        if (this.step3g == null && anchorMoment != null) {
          var gTime = ns.getGrowTime(target);
          var targetMoment = anchorMoment + (3.0 * STEP_GAP);
          var tooLate = targetMoment + STEP_GAP; // not launching if end time is after end of next step (weaken)
          var finishTime = rightNow + gTime;

          if (finishTime >= targetMoment && finishTime < tooLate) {
            var needThredz = threadsToGrow(s) * this.scale;
            if (needThredz < 1) { needThredz = 1; }

            this.step3g = newNode(target, needThredz, targetMoment, growRam);
            if (this.step2w && this.step2w.launchThredz > 0) {
              await launch(ns, this.step3g, growScript, needThredz, target, this.batchNumber, "step3g");
            }
          }
        }
        if (this.step4w == null && anchorMoment != null) {
          var wTime = ns.getWeakenTime(target);
          var targetMoment = anchorMoment + (4.0 * STEP_GAP);
          var tooLate = targetMoment + MIN_INTERVAL; // not launching if end time is after end of next step (weaken)
          var finishTime = rightNow + wTime;

          if (finishTime >= targetMoment && finishTime < tooLate) {
            var needThredz = threadsToWeaken(s) * this.scale;
            if (needThredz < 1) { needThredz = 1; }
            this.step4w = newNode(target, needThredz, targetMoment, weakRam);
            await launch(ns, this.step4w, weakScript, needThredz, target, this.batchNumber, "step4w");
          }
        }
      }
    }
  }

  function logStep(node, name) {
    if (node != null && node.stepThredz != null) {
      var isFinished = node.finished(ns);
      var finished = isFinished ? " xx " : " -- ";
      var lt = ("" + node.launchThredz).padStart(5, ' ');
      var st = ("" + Math.floor(node.stepThredz)).padEnd(5, ' ');
      var due = "";
      var endsIn = node.targetMoment - new Date().getTime();
      if (!isNaN(endsIn)) {
        if (!isFinished) { due = sec(endsIn).padStart(7, ' '); }
      }

      if (endsIn < 0 && !isFinished) {
        ns.print("  Step ", name, " overdue :", finished, node.remainingPids.length, ' ', due);
      } else {
        ns.print("  Step ", name, finished, lt, "-T-", st, due);
      }
    } else {
      ns.print("  Step ", name);
    }
  }


  function getMyUsedRam() {
    return batches.reduce(function (sum, b) { return sum + b.ram(); }, 0);
  }

  function isAttackServer(s) {
    return s.purchasedByPlayer && (s.hostname.substring(0, 2) === "a-");
  }

  function isHacknetServer(s) {
    return s.hostname.startsWith("hacknet");
  }

  function usableAttackServers(s) {
    // return isAttackServer(s) || isHacknetServer(s) || s.hostname == 'home' || s.hasAdminRights;
    return isAttackServer(s) || s.hostname == 'home' || (!isHacknetServer(s) && s.hasAdminRights);
  }

  async function waitForWeakTime(now) {
    var until = now + (2 * MIN_INTERVAL);
    var wt = ns.getWeakenTime(target);
    var better = weakTime();
    while (wt > (better * 1.1) && (new Date().getTime() < until)) {
      await ns.sleep(5);
      wt = ns.getWeakenTime(target);
    }
    return wt;
  }

  async function maybeStartNewBatch(ri) {
    noNewBatch = [];
    var now = new Date().getTime();
    sinceLastLaunch = now - lastLaunch;

    var mem = ri.total.total;
    var used = getMyUsedRam();
    var liveBatches = batches.length;

    var weakTimeNow = ns.getWeakenTime(target);
    var betterWeakTime = weakTime();
    if (weakTimeNow > (betterWeakTime * 1.2) && liveBatches > 5) { return false; }

    var targetMoment = now + weakTimeNow;
    var timingIsRight = (targetMoment > (lastTargetMoment + MIN_INTERVAL));

    var totalMemWanted = getRamRequirement(target);
    var myProportion = totalMemWanted / totalRamDemand;
    ramForMe = mem * myProportion;
    var maxBatches = betterWeakTime / MIN_INTERVAL;
    var allowRamPerBatch = ramForMe / maxBatches;
    var maxRamPerBatch = getRamPerBatch(target);
    var scale = allowRamPerBatch / maxRamPerBatch;
    if (scale > 1) { scale = 1; }

    if (sinceLastLaunch > MIN_INTERVAL && (used < ramForMe) && (liveBatches < MAX_BATCHES) && timingIsRight) {
      scaling = scale;
      batches.push(new Batch(ns, target, scale));
    // } else {
    //   if (sinceLastLaunch <= MIN_INTERVAL) { noNewBatch.push("too soon"); }
    //   if (used >= ramForMe) { noNewBatch.push("using too much mem"); }
    //   if (liveBatches >= MAX_BATCHES) { noNewBatch.push("too many batches"); }
    //   if (!timingIsRight) { noNewBatch.push("too early for previous batch"); }
    }
  }

  async function loop() {
    var ri = await getRamInfo(ns, usableAttackServers);
    await maybeStartNewBatch(ri);

    ns.clearLog();

    var now = new Date();

    for (var i = batches.length; i > 0; i--) {
      var b = batches[i - 1];
      await b.visit();
      if (b.destinationTime != null) {
        ns.print(g(b.ram()), ' ', b.target, "#", b.batchNumber, " due in ", sec(b.destinationTime - now), "s");
        ns.print("  scaling ", b.scale);
        logStep(b.step0w, "0 W");
        logStep(b.step1h, "1 H");
        logStep(b.step2w, "2 W");
        logStep(b.step3g, "3 G");
        logStep(b.step4w, "4 W");
      } else {
        ns.print(g(b.ram()), ' ', b.target, "#", b.batchNumber);
      }
    }

    batches = batches.filter(function (b) { return !b.dead(); });

    var income = ns.getScriptIncome("spin.js", ns.getHostname(), ...ns.args);
    // ns.print("queue length ", batches.length, " of max ", maxBatches);
    ns.print("queue length ", batches.length, " scaling ", dec(scaling));
    ns.print("last launch ", (sinceLastLaunch / 1000), "s ago, ",
      "waiting ", Math.floor(approxInterval), "s");
    ns.print("args", ns.args);
    ns.print("Script income : ", num(income));

    var used = getMyUsedRam();
    var wantsRam = getRamRequirement(target);
    ns.print("me: wants/using/alloc ", g00(wantsRam), "/", g00(used), "/", g00(ramForMe));

    var globalRamDemand = totalRamDemand;
    var globalAvailableRam = ri.total.total;

    ns.print("global: wants/has : ", g00(globalRamDemand), "/", g00(globalAvailableRam));
    ns.print("quickest weaktime is ", sec(bestWeakTime), ", wt now is ", sec(ns.getWeakenTime(target)));

    for (const reason of noNewBatch) {
      ns.print("no new batch: ", reason);
    }

    var newNotify = Math.floor((notifyRand + now.getTime()) / notifyInterval);
    if (newNotify > lastNotify) {
      lastNotify = newNotify;
      var times = batches.map(function (b) { return (b.destinationTime - now); });
      // var ram = batches.reduce(function (sum, b) { return sum + b.ram(); }, 0);
      await ns.writePort(1, JSON.stringify({
        spinner: {
          ram: getMyUsedRam(),
          pid: myProc.pid,
          target: target,
          queue: times,
          income: income,
          scaling: scaling
        }
      }));

      var memNotify = { target: target, wants: (wantsRam / 1.0) };
      await ns.writePort(2, JSON.stringify(memNotify));

      var peek3 = ns.peek(3);
      var mmInfo = JSON.parse(peek3);
      totalRamDemand = mmInfo.totalDemand;
    }
  }

  if (target == "ram") {
    target = ns.args[1];
    var rr = getRamRequirement(target);
    ns.tprint("Spin ", target, " will use ", g(rr), " overall ");

  } else if (target == 'warm') {
    ns.tail();
    target = ns.args[1];
    await warm(target);

  } else {
    ns.tail();
    await warm(target);

    while (true) {
      await loop();
      await ns.sleep(STEP_GAP / 10.0);
    }
  }
}

export function autocomplete(data, args) {
  return ["warm", "ram", ...data.servers];
}