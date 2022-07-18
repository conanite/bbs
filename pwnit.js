/** @param {NS} ns */
export async function main(ns) {
    var target = ns.args[0];
    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(target);
    }
    if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(target);
    }
    ns.nuke(target);

    await ns.scp("hackit.js", target);
    await ns.scp("pwnit.js", target);

    ns.exec("hackit.js", target, 1, target);
    ns.exec("hackit.js", target, 1, "n00dles");
    ns.exec("hackit.js", target, 1, "foodnstuff");
    ns.exec("hackit.js", target, 1, "sigma-cosmetics");
    ns.exec("hackit.js", target, 1, "joesguns");
    ns.exec("hackit.js", target, 1, "hong-fang-tea");
    ns.exec("hackit.js", target, 1, "harakiri-sushi");
    ns.exec("hackit.js", target, 1, "nectar-net");
    ns.exec("hackit.js", target, 1, "neo-net");
    ns.exec("hackit.js", target, 1, "iron-gym");
    ns.exec("hackit.js", target, 1, "nectar-net");
    ns.exec("hackit.js", target, 1, "max-hardware");
    ns.exec("hackit.js", target, 1, "silver-helix");
}