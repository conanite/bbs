/** @param {NS} ns **/
export async function main(ns) {
    var karma = ns.heart.break();
    ns.tprint('Current Karma : ',karma);
    ns.tprint("killed : ", ns.getPlayer().numPeopleKilled);
}