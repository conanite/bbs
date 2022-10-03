/** @param {NS} ns */
export async function main(ns) {
	function num(n) { return ns.nFormat(n, "$0.000a"); }
	function dec(n) { return ns.nFormat(n, "0.000"); }
	function dec5(n) { return ns.nFormat(n, "0.00000000"); }

	var hn = ns.hacknet;
	var fml = ns.formulas.hacknetServers;
	var hnm = ns.getHacknetMultipliers();

	var bestServer = null;
	var bestUpgrade = null;
	var bestROI = 1024 ** 6; // roi in seconds of best purchase
	var bestPrice = 0;
	var horizon = 4.0; // don't upgrade if roi > horizon hours
	var logs = [];

	function log(...args) {
		logs.push(args.join(""));
	}

	log("server count ", hn.numNodes());

	async function sellHashes() {
		var maxHash = hn.hashCapacity();
		var threshold = maxHash * 0.9
		var nowHash = hn.numHashes();

		var spent = true;
		log("maxHash: ", maxHash);
		log("nowHash: ", Math.floor(nowHash));
		log("threshold: ", Math.floor(threshold));

		var sold = 0;
		while (spent && (threshold < nowHash)) {
			sold++;
			spent = hn.spendHashes("Sell for Money", "", 1);
			maxHash = hn.hashCapacity();
			nowHash = hn.numHashes();
			await ns.sleep(10);
		}

		log("sell hashes for money: ", sold, " times");
	}

	for (var i = 0; i < hn.numNodes(); i++) {
		var nst = hn.getNodeStats(i);
		var luc = hn.getLevelUpgradeCost(i, 1);
		var cuc = hn.getCoreUpgradeCost(i, 1);
		var ruc = hn.getRamUpgradeCost(i, 1);

		var hgr = fml.hashGainRate(nst.level, nst.ramUsed, nst.ram, nst.cores, hnm.production);

		var hgr_lu = fml.hashGainRate(nst.level + 1, nst.ramUsed, nst.ram, nst.cores, hnm.production) - hgr;
		var hgr_cu = fml.hashGainRate(nst.level, nst.ramUsed, nst.ram, nst.cores + 1, hnm.production) - hgr;
		var hgr_ru = fml.hashGainRate(nst.level, nst.ramUsed, nst.ram * 2, nst.cores, hnm.production) - hgr;

		var cash_conv = 1000000 / 4; // can sell 4 hashes for 1 million
		var roil = (luc / (cash_conv * hgr_lu)) / 3600;
		var roic = (cuc / (cash_conv * hgr_cu)) / 3600;
		var roir = (ruc / (cash_conv * hgr_ru)) / 3600;

		if (roil < bestROI) {
			bestROI = roil;
			bestServer = i;
			bestUpgrade = "level";
			bestPrice = luc;
		}

		if (roic < bestROI) {
			bestROI = roic;
			bestServer = i;
			bestUpgrade = "cores";
			bestPrice = cuc;
		}

		if (roir < bestROI) {
			bestROI = roir;
			bestServer = i;
			bestUpgrade = "ram";
			bestPrice = ruc;
		}

		log("HNS ", i, " hgr ", hgr);
		log("  lvl ", nst.level, " hgr +1 lvl  ", dec(hgr_lu), " cost ", num(luc), " roi ", dec(roil), " hours");
		log("  cor ", nst.cores, " hgr +1 core ", dec(hgr_cu), " cost ", num(cuc), " roi ", dec(roic), " hours");
		log("  ram ", nst.ram,   " hgr *2 ram  ", dec(hgr_ru), " cost ", num(ruc), " roi ", dec(roir), " hours");

		log("");
	}

	if (bestUpgrade) {
		log("Best upgrade: ", bestUpgrade, " on ", bestServer, " : ", dec(bestROI), " hours for  ", num(bestPrice));
		var money = ns.getPlayer().money;
		if (bestROI < horizon && money > bestPrice) {
			if (bestUpgrade == "level") {
				hn.upgradeLevel(bestServer, 1);			
			} else if (bestUpgrade == "cores") {
				hn.upgradeCore(bestServer, 1);
			} else if (bestUpgrade == "ram") {
				hn.upgradeRam(bestServer, 1);
			}
		}
	}

	await sellHashes();
	
	ns.write("/monitor/100-hacknet-servers.txt", logs.join("\n"), "w");
}