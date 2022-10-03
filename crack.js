import { crack } from 'lib.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    for (let target of ns.args) {
        await crack(ns, target);
    }
}


export function autocomplete(data, args) {
    return data.servers;
}