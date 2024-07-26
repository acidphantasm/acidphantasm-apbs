
import { inject, injectable } from "tsyringe";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { RaidInformation } from "../Globals/RaidInformation";
import { Logging } from "../Enums/Logging";
import { APBSLogger } from "./APBSLogger";
import { TierInformation } from "../Globals/TierInformation";

@injectable()
export class APBSEquipmentGetter
{

    constructor(
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("TierInformation") protected tierInformation: TierInformation,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper,
        @inject("APBSLogger") protected apbsLogger: APBSLogger
    )
    {}

    public getTierJson(tierInfo: number)
    {
        switch (tierInfo)
        {
            case 1:
                return this.tierInformation.tier1
            case 2:
                return this.tierInformation.tier2
            case 3:
                return this.tierInformation.tier3
            case 4:
                return this.tierInformation.tier4
            case 5:
                return this.tierInformation.tier5
            case 6:
                return this.tierInformation.tier6
            case 7:
                return this.tierInformation.tier7
            default:
                this.apbsLogger.log(Logging.WARN, "Bot Level and Tier Information missing, your load order is probably incorrect. Defaulting to Tier3 loadout.");
                return this.tierInformation.tier3
        }

    }

    public getWeaponByBotRole(botRole: string, tierInfo: number, slot: string, range?: string): any
    {
        let tier;
        const tierJson = this.getTierJson(tierInfo)
        switch (botRole)
        {
            case "pmcbear":
                tier = range == undefined ? tierJson.pmcBEAR.equipment[slot] : tierJson.pmcBEAR.equipment[slot][range]
                return tier;
            case "arenaFighterEvent":
            case "exusec":
            case "pmcusec":
                tier = range == undefined ? tierJson.pmcUSEC.equipment[slot] : tierJson.pmcUSEC.equipment[slot][range]
                return tier;
            case "marksman":
                tier = range == undefined ? tierJson.scav.equipment[slot] : tierJson.scav.equipment[slot].LongRange
                return tier;
            case "cursedassault":
            case "assault":
                tier = range == undefined ? tierJson.scav.equipment[slot] : tierJson.scav.equipment[slot].ShortRange
                return tier;
            default:
                tier = range == undefined ? tierJson.boss.equipment[slot] : tierJson.boss.equipment[slot][range]
                return tier;
        }
    }

    public getEquipmentByBotRole(botRole: string, tierInfo: number, slot: string): Record<string, number>
    {
        const tierJson = this.getTierJson(tierInfo)
        switch (botRole)
        {
            case "pmcbear":
                return tierJson.pmcBEAR.equipment[slot];
            case "arenaFighterEvent":
            case "exusec":
            case "pmcusec":
                return tierJson.pmcUSEC.equipment[slot];
            case "marksman":
            case "cursedassault":
            case "assault":
                return tierJson.scav.equipment[slot];
            default:
                return tierJson.boss.equipment[slot];
        }
    }

    public getEquipmentPoolJSON(botRole: string, tierInfo: number): any
    {
        const tierJson = this.getTierJson(tierInfo)
        switch (botRole)
        {
            case "pmcbear":
                return tierJson.pmcBEAR;
            case "arenaFighterEvent":
            case "exusec":
            case "pmcusec":
                return tierJson.pmcUSEC;
            case "marksman":
            case "cursedassault":
            case "assault":
                return tierJson.scav;
            default:
                return tierJson.boss;
        }
    }

    public getSpawnChancesByBotRole(botRole: string, tierInfo: number): any
    {
        const tierJson = this.getTierJson(tierInfo)
        switch (botRole)
        {
            case "pmcbear":
                return tierJson.pmcBEAR.chances;
            case "arenaFighterEvent":
            case "exusec":
            case "pmcusec":
                return tierJson.pmcUSEC.chances;
            case "marksman":
            case "cursedassault":
            case "assault":
                return tierJson.scav.chances;
            default:
                return tierJson.boss.chances;
        }
    }

    public getItemGenerationByBotRole(botRole: string, tierInfo: number): any
    {
        const tierJson = this.getTierJson(tierInfo)
        switch (botRole)
        {
            case "pmcbear":
                return tierJson.pmcBEAR.chances;
            case "pmcusec":
                return tierJson.pmcUSEC.chances;
            case "marksman":
            case "cursedassault":
            case "assault":
                return tierJson.scav.chances;
            default:
                return tierJson.boss.chances;
        }
    }
    
    public getAmmoByBotRole(botRole: string, tierInfo: number): Record<string, Record<string, number>>
    {
        let tier;
        const tierJson = this.getTierJson(tierInfo)
        switch (botRole)
        {
            case "marksman":
            case "cursedassault":
            case "assault":
                tier = tierJson.scav.Ammo
                return tier;
            case "bossBully":
            case "bossTagilla":
            case "bossGluhar":
            case "bossKilla":
            case "bossKojaniy":
            case "bossSanitar":
            case "bossKnight":
            case "bossZryachiy":
            case "bossTest":
            case "bossKolontay":
            case "followerBully":
            case "followerGluharAssault":
            case "followerGluharScout":
            case "followerGluharSecurity":
            case "followerGluharSnipe":
            case "followerKojaniy":
            case "followerSanitar":
            case "followerTagilla":
            case "followerBirdEye":
            case "followerBigPipe":
            case "followerZryachiy":
            case "followerTest":
            case "followerBoar":
            case "sectantPriest":
            case "sectantWarrior":
            case "bossBoar":
            case "bossBoarSniper":
            case "followerBoarClose1":
            case "followerBoarClose2":
            case "followerKolontayAssault":
            case "followerKolontaySecurity":
                tier = tierJson.boss.Ammo
                return tier;
            default:
                tier = tierJson.Ammo
                return tier;
        }
    }
}