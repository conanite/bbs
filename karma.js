/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();

    while (true) {
        ns.clearLog();
        var karma = ns.heart.break();
        ns.print('Current Karma : ',karma);
        await ns.sleep(250);
    }
}