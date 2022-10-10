export function readObj(name) {
	return JSON.parse(ns.read(name));
}

export function writeObj(name, obj) {
	ns.write(name, JSON.stringify(obj));
}