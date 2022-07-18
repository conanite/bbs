/** @param {NS} ns */
export async function main(ns) {
    var target = ns.args[0];
	var ramreq = ns.getScriptRam("hackit.js");

	for (var i = 1; i < ns.args.length; i++) {
	    var executor = ns.args[i];
		ns.tprint("start : resetting executor ", executor, " to hack target server ", target);

		await ns.scp("hackit.js", executor);

		var avlram = ns.getServerMaxRam(executor);

		var threads = Math.floor(avlram / ramreq);

		ns.killall(executor);
    	ns.exec("hackit.js", executor, threads, target, threads); // we pass threads as an argument to the script so it knows what it's working with

		ns.tprint("done : resetting executor ", executor, " to hack target server ", target);
	}

}