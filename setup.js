// import * as lib from "/lib.js"

/** @param {NS} ns */
export async function main(ns) {
    ns.run("mm.js");
    ns.run("monitor.js");
    ns.run("controller.js");
}