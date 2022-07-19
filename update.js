/** @param {NS} ns */
export async function main(ns) {
	await ns.wget("https://raw.githubusercontent.com/conanite/bbs/master/monitor.js", "monitor.js");
	await ns.wget("https://raw.githubusercontent.com/conanite/bbs/master/lib.js", "lib.js");
	await ns.wget("https://raw.githubusercontent.com/conanite/bbs/master/crack.js", "crack.js");
	await ns.wget("https://raw.githubusercontent.com/conanite/bbs/master/net.js", "net.js");
	await ns.wget("https://raw.githubusercontent.com/conanite/bbs/master/path.js", "path.js");
	await ns.wget("https://raw.githubusercontent.com/conanite/bbs/master/monitor-loads.js", "monitor-loads.js");
	await ns.wget("https://raw.githubusercontent.com/conanite/bbs/master/just-weaken.js", "just-weaken.js");
}