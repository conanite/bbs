/** @param {NS} ns */
export async function main(ns) {
    function num(n) { return ns.nFormat(n, "$0.000a"); }

	let hn = ns.hacknet;

	var nn = hn.numNodes();
	ns.tprint(nn);

	var myMoney = ns.getPlayer().money;
	var nodePrice = hn.getPurchaseNodeCost();

	if (nodePrice * 4 < myMoney) {
		ns.tprint("mymoney is " + num(myMoney));
		ns.tprint("servercost is " + num(nodePrice));
		ns.tprint("we're gonna buy a new node!!");

		var newNode = hn.purchaseNode();
		hn.upgradeRam(newNode, 6);
		hn.upgradeLevel(newNode, 199);
		hn.upgradeCore(newNode, 15);
	}

	var newMoney = ns.getPlayer().money
	ns.tprint("my money is now " + num(newMoney));
	ns.tprint("total cost was " + num(myMoney - newMoney));
}