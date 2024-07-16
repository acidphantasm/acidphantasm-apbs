import { inject, injectable } from "tsyringe";
import { TierInformation } from "../Globals/TierInformation";
import Tier1 = require("../JSONs/1.json");
import Tier2 = require("../JSONs/2.json");
import Tier3 = require("../JSONs/3.json");
import Tier4 = require("../JSONs/4.json");
import Tier5 = require("../JSONs/5.json");
import Tier6 = require("../JSONs/6.json");
import Tier7 = require("../JSONs/7.json");

@injectable()
export class APBSTierGetter
{
    constructor(
        @inject("TierInformation") protected tierInformation: TierInformation
    )
    {}

    public getTierByLevel(level: number): number
    {
        return this.tierInformation.tiers.find(({playerMinimumLevel,playerMaximumLevel}) => level>=playerMinimumLevel && level<=playerMaximumLevel)?.tier
    }

    public getTierUpperLevelDeviation(level:number): number
    {
        return this.tierInformation.tiers.find(({playerMinimumLevel,playerMaximumLevel}) => level>=playerMinimumLevel && level<playerMaximumLevel)?.botMaxLevelVariance
    }

    public getTierLowerLevelDeviation(level:number): number
    {
        return this.tierInformation.tiers.find(({playerMinimumLevel,playerMaximumLevel}) => level>=playerMinimumLevel && level<playerMaximumLevel)?.botMinLevelVariance
    }
    
    public getEquipmentByBotRole(botRole: string, tierInfo: number, slot: string, range?: string): any
    {
        let tier;
        switch (tierInfo) 
        {
            case 1:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = range == undefined ? Tier1[tierInfo].pmcBEAR.equipment[slot] : Tier1[tierInfo].pmcBEAR.equipment[slot][range]
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = range == undefined ? Tier1[tierInfo].pmcUSEC.equipment[slot] : Tier1[tierInfo].pmcUSEC.equipment[slot][range]
                        return tier;
                    case "marksman":
                        tier = range == undefined ? Tier1[tierInfo].marksman.equipment[slot] : Tier1[tierInfo].marksman.equipment[slot][range]
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = range == undefined ? Tier1[tierInfo].scav.equipment[slot] : Tier1[tierInfo].scav.equipment[slot][range]
                        return tier;
                    default:
                        tier = range == undefined ? Tier1[tierInfo].boss.equipment[slot] : Tier1[tierInfo].boss.equipment[slot][range]
                        return tier;
                }
            case 2:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = range == undefined ? Tier2[tierInfo].pmcBEAR.equipment[slot] : Tier2[tierInfo].pmcBEAR.equipment[slot][range]
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = range == undefined ? Tier2[tierInfo].pmcUSEC.equipment[slot] : Tier2[tierInfo].pmcUSEC.equipment[slot][range]
                        return tier;
                    case "marksman":
                        tier = range == undefined ? Tier2[tierInfo].marksman.equipment[slot] : Tier2[tierInfo].marksman.equipment[slot][range]
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = range == undefined ? Tier2[tierInfo].scav.equipment[slot] : Tier2[tierInfo].scav.equipment[slot][range]
                        return tier;
                    default:
                        tier = range == undefined ? Tier2[tierInfo].boss.equipment[slot] : Tier2[tierInfo].boss.equipment[slot][range]
                        return tier;
                }
            case 3:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = range == undefined ? Tier3[tierInfo].pmcBEAR.equipment[slot] : Tier3[tierInfo].pmcBEAR.equipment[slot][range]
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = range == undefined ? Tier3[tierInfo].pmcUSEC.equipment[slot] : Tier3[tierInfo].pmcUSEC.equipment[slot][range]
                        return tier;
                    case "marksman":
                        tier = range == undefined ? Tier3[tierInfo].marksman.equipment[slot] : Tier3[tierInfo].marksman.equipment[slot][range]
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = range == undefined ? Tier3[tierInfo].scav.equipment[slot] : Tier3[tierInfo].scav.equipment[slot][range]
                        return tier;
                    default:
                        tier = range == undefined ? Tier3[tierInfo].boss.equipment[slot] : Tier3[tierInfo].boss.equipment[slot][range]
                        return tier;
                }
            case 4:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = range == undefined ? Tier4[tierInfo].pmcBEAR.equipment[slot] : Tier4[tierInfo].pmcBEAR.equipment[slot][range]
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = range == undefined ? Tier4[tierInfo].pmcUSEC.equipment[slot] : Tier4[tierInfo].pmcUSEC.equipment[slot][range]
                        return tier;
                    case "marksman":
                        tier = range == undefined ? Tier4[tierInfo].marksman.equipment[slot] : Tier4[tierInfo].marksman.equipment[slot][range]
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = range == undefined ? Tier4[tierInfo].scav.equipment[slot] : Tier4[tierInfo].scav.equipment[slot][range]
                        return tier;
                    default:
                        tier = range == undefined ? Tier4[tierInfo].boss.equipment[slot] : Tier4[tierInfo].boss.equipment[slot][range]
                        return tier;
                }
            case 5:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = range == undefined ? Tier5[tierInfo].pmcBEAR.equipment[slot] : Tier5[tierInfo].pmcBEAR.equipment[slot][range]
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = range == undefined ? Tier5[tierInfo].pmcUSEC.equipment[slot] : Tier5[tierInfo].pmcUSEC.equipment[slot][range]
                        return tier;
                    case "marksman":
                        tier = range == undefined ? Tier5[tierInfo].marksman.equipment[slot] : Tier5[tierInfo].marksman.equipment[slot][range]
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = range == undefined ? Tier5[tierInfo].scav.equipment[slot] : Tier5[tierInfo].scav.equipment[slot][range]
                        return tier;
                    default:
                        tier = range == undefined ? Tier5[tierInfo].boss.equipment[slot] : Tier5[tierInfo].boss.equipment[slot][range]
                        return tier;
                }
            case 6:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = range == undefined ? Tier6[tierInfo].pmcBEAR.equipment[slot] : Tier6[tierInfo].pmcBEAR.equipment[slot][range]
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = range == undefined ? Tier6[tierInfo].pmcUSEC.equipment[slot] : Tier6[tierInfo].pmcUSEC.equipment[slot][range]
                        return tier;
                    case "marksman":
                        tier = range == undefined ? Tier6[tierInfo].marksman.equipment[slot] : Tier6[tierInfo].marksman.equipment[slot][range]
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = range == undefined ? Tier6[tierInfo].scav.equipment[slot] : Tier6[tierInfo].scav.equipment[slot][range]
                        return tier;
                    default:
                        tier = range == undefined ? Tier6[tierInfo].boss.equipment[slot] : Tier6[tierInfo].boss.equipment[slot][range]
                        return tier;
                }
            case 7:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = range == undefined ? Tier7[tierInfo].pmcBEAR.equipment[slot] : Tier7[tierInfo].pmcBEAR.equipment[slot][range]
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = range == undefined ? Tier7[tierInfo].pmcUSEC.equipment[slot] : Tier7[tierInfo].pmcUSEC.equipment[slot][range]
                        return tier;
                    case "marksman":
                        tier = range == undefined ? Tier7[tierInfo].marksman.equipment[slot] : Tier7[tierInfo].marksman.equipment[slot][range]
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = range == undefined ? Tier7[tierInfo].scav.equipment[slot] : Tier7[tierInfo].scav.equipment[slot][range]
                        return tier;
                    default:
                        tier = range == undefined ? Tier7[tierInfo].boss.equipment[slot] : Tier7[tierInfo].boss.equipment[slot][range]
                        return tier;
                }
            default:
                break;
        }
    }
}