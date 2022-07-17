import * as lib from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
    lib.crack(ns, "n00dles");
    lib.crack(ns, "foodnstuff"); 
    lib.crack(ns, "sigma-cosmetics"); 
    lib.crack(ns, "joesguns"); 
    lib.crack(ns, "hong-fang-tea"); 
    lib.crack(ns, "harakiri-sushi"); 
    lib.crack(ns, "iron-gym");

 	await lib.deployAttack(ns, "home", "n00dles", "max", "n00dles");
 	await lib.deployAttack(ns, "home", "n00dles", "max", "foodnstuff");
 	await lib.deployAttack(ns, "home", "n00dles", "max", "sigma-cosmetics");
}