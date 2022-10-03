/*
 * @param {NS} ns
 * @param {String} augName : the augmentation name
 * @param {String} faction : the name of the faction we're considering buying the augmentation from
 * @param {Object} owned : object whose keys are augmentations the player already owns
 * @return true if player can buy the given aug from the given faction
 * 
 * checks :
 *  (a) not already owned
 *  (b) price is less than available money
 *  (c) required rep is less than faction rep
 *  (d) all prereqs are owned
 */
export function canBuyAug(ns, augName, faction, owned) {
	var sing = ns.singularity;

	if (owned[augName]) { return false; }

	var price = sing.getAugmentationPrice(augName);
	var myMoney = ns.getPlayer().money;

	if (price > myMoney) { return false; }

	var reqRep = sing.getAugmentationRepReq(augName);
	var facRep = sing.getFactionRep(faction);

	if (reqRep > facRep) { return false; }

	var prereqs = sing.getAugmentationPrereq(augName);

	for (var pr of prereqs) {
		if (!owned[pr]) { return false; }
	}

	return true;
}

export function myAugs(sing, includeUninstalled) {
	var ownedAugs = {};
	for (var i = 0, oa = sing.getOwnedAugmentations(includeUninstalled); i < oa.length; i++) {
		ownedAugs[oa[i]] = true;
	}
	return ownedAugs;
}

export const NeuroFluxGovernor = "NeuroFlux Governor"

export const CyberSec = "CyberSec"
export const TianDiHui = "Tian Di Hui"
export const Netburners = "Netburners"
export const Sector12 = "Sector-12"
export const Chongqing = "Chongqing"
export const NewTokyo = "New Tokyo"
export const Ishima = "Ishima"
export const Aevum = "Aevum"
export const Volhaven = "Volhaven"
export const NiteSec = "NiteSec"
export const BlackHand = "The Black Hand"
export const BitRunners = "BitRunners"
export const MegaCorp = "MegaCorp"
export const BladeIndustries = "Blade Industries"
export const FourSigma = "Four Sigma"
export const KuaiGongInternational = "KuaiGong International"
export const NWO = "NWO"
export const OmniTekIncorporated = "OmniTek Incorporated"
export const ECorp = "ECorp"
export const BachmanAssociates = "Bachman & Associates"
export const ClarkeIncorporated = "Clarke Incorporated"
export const FulcrumSecretTechnologies = "Fulcrum Secret Technologies"
export const SlumSnakes = "Slum Snakes"
export const Tetrads = "Tetrads"
export const Silhouette = "Silhouette"
export const SpeakersDead = "Speakers for the Dead"
export const DarkArmy = "The Dark Army"
export const Syndicate = "The Syndicate"
export const Covenant = "The Covenant"
export const Daedalus = "Daedalus"
export const Illuminati = "Illuminati"

export const knownFactions = [
	CyberSec,
	TianDiHui,
	Netburners,
	Sector12,
	Chongqing,
	NewTokyo,
	Ishima,
	Aevum,
	Volhaven,
	NiteSec,
	BlackHand,
	BitRunners,
	MegaCorp,
	BladeIndustries,
	FourSigma,
	KuaiGongInternational,
	NWO,
	OmniTekIncorporated,
	ECorp,
	BachmanAssociates,
	ClarkeIncorporated,
	FulcrumSecretTechnologies,
	SlumSnakes,
	Tetrads,
	Silhouette,
	SpeakersDead,
	DarkArmy,
	Syndicate,
	Covenant,
	Daedalus,
	Illuminati
]

export const noAutoJoin = {};
noAutoJoin[Sector12] = true;
noAutoJoin[Chongqing] = true;
noAutoJoin[NewTokyo] = true;
noAutoJoin[Ishima] = true;
noAutoJoin[Aevum] = true;
noAutoJoin[Volhaven] = true;