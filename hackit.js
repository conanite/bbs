/** @param {NS} ns */
export async function main(ns) {
    function num(n) {
		return ns.nFormat(n, "$0.000a");
	}

    var target = ns.args[0];
    var myThredz = parseInt(ns.args[1]);
    ns.print("hacking ", target, " with ", myThredz, " threads");

    var stealProportion = 0.5;
    var serverMaxMoney = ns.getServerMaxMoney(target);
    var moneyMax = serverMaxMoney * 0.8;
    var securityThresh = ns.getServerMinSecurityLevel(target) + 4;

    function availableMoney() {
        return ns.getServerMoneyAvailable(target);
    }

    function secLevel() {
        return ns.getServerSecurityLevel(target);
    }

    async function enfeeble() {
        while (secLevel() > securityThresh) {
            await ns.weaken(target);
        }
    }

    while(true) {
        await enfeeble();

        for (var m = 10 ; m > 0 ; m--) {
            var avm = availableMoney();
            if (avm < moneyMax) {
                ns.print("grow round ", m, " available ", num(avm), ", target ", num(moneyMax));
                await ns.grow(target);
                await enfeeble();
            }
        }

        if ((availableMoney() > (serverMaxMoney * 0.99)) && (stealProportion < 0.9)) {
            stealProportion = stealProportion * 1.01;            
        }
        var stealme = availableMoney() * stealProportion;
        var hackThredz = Math.floor(ns.hackAnalyzeThreads(target, stealme) - 1);
        hackThredz = Math.min(hackThredz, myThredz);
        if (hackThredz < 1) { hackThredz = myThredz; }

        ns.print("steal ", num(stealme), " (", (stealProportion * 100), "%) using ", hackThredz, " threads");
        await ns.hack(target, { threads: hackThredz });
    }
}