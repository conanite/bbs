import * as lib from 'lib.js'

/** @param {NS} ns */
export async function main(ns) {
	if (ns.args[0] == 'sweep') {
		lib.deleteUnusedServers(ns);
		ns.exit();
	} else if (ns.args[0] == "work") {
		lib.showPurchasedServerWork(ns);
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
    	lib.buyServer(ns, name, size);
	}

}