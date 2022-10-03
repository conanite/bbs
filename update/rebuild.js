/** @param {NS} ns */
export async function main(ns) {
	var files = ns.ls("home", ".js");

	var wget_str_0 = "    await ns.wget(\"https://raw.githubusercontent.com/conanite/bbs/master/";
	var wget_str_1 = "\", \"";
	var wget_str_2 = "\");"

	var lines = [];

	for (var f of files) {
		if (f.startsWith("/")) {
			f = f.replace("/", "");
		}
		lines.push(wget_str_0 + f + wget_str_1 + f + wget_str_2);
	}

	ns.write("update.js", "/** @param {NS} ns */\nexport async function main(ns) {\n", "w");
	ns.write("update.js", lines.join("\n"), "a");
	ns.write("update.js", "\n}\n", "a");
}