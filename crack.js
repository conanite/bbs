import { crack, isCracked, isCrackable, netTraverse } from 'lib.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    if (ns.args[0] == 'crackable') {
        var f = function (node) {
            var target = node.name;
            if (!isCracked(ns, target) && isCrackable(ns, target)) {
                crack(ns, target);
            }
        }

        while (true) {
            netTraverse(ns, f);
            await ns.sleep(1000);
        }
    } else {
        for (let target of ns.args) {
            crack(ns, target);
        }
    }
}


export function autocomplete(data, args) {
    return data.servers;
}