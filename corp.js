/** @param {NS} ns */
export async function main(ns) {
	var corpns = ns.corporation;

	var corp = corpns.getCorporation();

	function info() {
		var divs = corp.divisions;
		for (var div of divs) {
			ns.tprint("  Division : ", div.name, " (", div.type, ")");
			ns.tprint("    Research : ", div.research);
			for (var city of div.cities) {
				ns.tprint("    City: ", city);
				// try {
				var office = corpns.getOffice(div.name, city);
				ns.tprint(office);
				for (var empl of office.employees) {

					ns.tprint("      Employee : ", empl);
				}
				// } catch (e) {
				// 	ns.tprint("error getting office")
				// }
			}
		}
	}

	function hireEmployees(div, city, job, amount) {
		var office = corpns.getOffice(div.name, city);
		var hired = office.employees.length;
		var capacity = office.size;
		var availableSpace = capacity - hired;
		if (amount > availableSpace) {
			corpns.upgradeOfficeSize(div.name, city, amount - availableSpace);
		}

		for (var i = 0 ; i < amount ; i++) {
			corpns.hireEmployee(div.name, city);
		}

		corpns.setAutoJobAssignment(div.name, city, job, amount);
	}

	function hire() {
		var div = corpns.getDivision(ns.args[1]);
		var amount = parseInt(ns.args[2]);
		var job = ns.args[3];
		for (var city of div.cities) {
			var office = corpns.getOffice(div.name, city);
			var jobs = office.employeeJobs;
			var now = jobs[job];
			if (now < amount) {
				ns.tprint("hiring ", (amount - now), " new employees for ", job, "in office ", div.name, "/", city);
				hireEmployees(div, city, job, (amount - now))
			} else {
				ns.tprint("office ", div.name, "/", city, " already has ", now, " employees doing ", job);
			}
		}
	}

	function assign() {
		var div = corpns.getDivision(ns.args[1]);
		var job = ns.args[2];
		for (var city of div.cities) {
			var office = corpns.getOffice(div.name, city);
			var jobs = office.employeeJobs;
			var alreadyPosted = jobs[job];
			var available = jobs.Unassigned;
			if (available > 0) {
				ns.tprint("assigning ", available, " employees to ", job, "in office ", div.name, "/", city);
				corpns.setAutoJobAssignment(div.name, city, job, available + alreadyPosted);
			} else {
				ns.tprint("no unassigned employees in office ", div.name, "/", city);
			}
		}
	}

	function upsize() {
		var div = corpns.getDivision(ns.args[1]);
		var amount = parseInt(ns.args[2]);
		for (var city of div.cities) {
			var office = corpns.getOffice(div.name, city);
			var alreadySize = office.size;
			if (amount > alreadySize) {
				ns.tprint("upsizing ", div.name, "/", city);
				corpns.upgradeOfficeSize(div.name, city, amount - alreadySize);
			} else {
				ns.tprint("already at size : ", div.name, "/", city);
			}

			var hired = office.employees.length;
			if (amount > hired) {
				var toHire = amount - hired;
				ns.tprint("hiring ", toHire, " new employees in ", div.name, "/", city);
				for (var i = 0 ; i < toHire ; i++) {
					corpns.hireEmployee(div.name, city);
				}
			} else {
				ns.tprint("already at capacity : ", div.name, "/", city);
			}
		}
	}

	if (ns.args[0] == "hire") {
		hire();
	} else if (ns.args[0] == "assign") {
		assign();	
	} else if (ns.args[0] == "upsize") {
		upsize();	
	} else {
		info();
	}

}