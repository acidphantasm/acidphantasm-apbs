
import { inject, injectable } from "tsyringe";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { RaidInformation } from "../Globals/RaidInformation";
import Tier1 = require("../db/Tier1.json");
import Tier2 = require("../db/Tier2.json");
import Tier3 = require("../db/Tier3.json");
import Tier4 = require("../db/Tier4.json");
import Tier5 = require("../db/Tier5.json");
import Tier6 = require("../db/Tier6.json");
import Tier7 = require("../db/Tier7.json");

@injectable()
export class APBSEquipmentGetter
{
    constructor(
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper

    )
    {}

    public getTierJson(tierInfo: number)
    {
        switch (tierInfo)
        {
            case 1:
                return Tier1
            case 2:
                return Tier2
            case 3:
                return Tier3
            case 4:
                return Tier4
            case 5:
                return Tier5
            case 6:
                return Tier6
            case 7:
                return Tier7
        }

    }

    public getEquipmentByBotRole(botRole: string, tierInfo: number, slot: string, range?: string): any
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
            default:
                tier = tierJson.Ammo
                return tier;
        }
    }
}