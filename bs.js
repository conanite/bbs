import { GB, buyServer } from '/lib.js'

/** @param {NS} ns */
export async function main(ns) {
	function g(n) { return ns.nFormat(n * GB, "0ib"); }
	function num(n) { return ns.nFormat(n, "$0.000a"); }

	if (ns.args[0] == "cost" && ns.args.length == 1) {
		var cash = ns.getPlayer().money;
		var min = cash / 3;
		var max = cash * 3;
		for (var i = 1; i <= 20 ; i += 1) {
			var costInfo = buyServer(ns,"cost", i);
			var cost = costInfo.cost;
			if (cost >= min && cost <= max) {
			    ns.tprint("cost of server size ", i, " (", g(costInfo.ram), ") is ", num(cost));
			}
		}
		ns.exit();
	}

	if (ns.args[0] == "prices") {
		for (var i = 1; i <= 20 ; i += 1) {
			var costInfo = buyServer(ns,"cost", i);
			var cost = costInfo.cost;
		    ns.tprint("cost of server size ", i, " (", g(costInfo.ram), ") is ", num(cost));
		}
		ns.exit();
	}

	if (ns.args.length < 2) {
		ns.tprint("usage: bs name size, where size is an exponent; eg size 4 will create a server with 2 ^ 4 G RAM")
		ns.tprint(" if name is 'cost', will show the cost instead of purchasing the server");
		ns.tprint(" the server name will have the size argument suffixed, followed by an index")
		ns.exit();
	}

	var name = ns.args[0];

    if (name == "kill") {
        var target = ns.args[1];
		ns.killall(target);
		ns.deleteServer(target);
		ns.tprint("killed purchased server ", target);

	} else {
	    var size = parseInt(ns.args[1]);
	   	buyServer(ns, name, size);
	}

}