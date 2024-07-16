import { inject, injectable } from "tsyringe";
import { BotLevelInformation } from "../Globals/BotLevelInformation";
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
        @inject("BotLevelInformation") protected botLevelInformation: BotLevelInformation
    )
    {}

    public getTierByLevel(level: number): number
    {
        const tiers = this.botLevelInformation.tiers;
        const actualTier = tiers.find(({playerMinimumLevel,playerMaximumLevel}) => level>=playerMinimumLevel && level<=playerMaximumLevel)?.tier
        return actualTier
    }
    
    public getEquipmentByBotRole(botRole: string, tierInfo: number): any
    {
        let tier;
        switch (tierInfo) 
        {
            case 1:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = Tier1.pmcBEAR;
                        break;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = Tier1.pmcUSEC;
                        break;
                    case "cursedassault":
                    case "marksman":
                    case "assault":
                        tier = Tier1.scav;
                        break;
                    default:
                        tier = Tier1.boss;
                        break;
                }
                break;
            case 2:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = Tier2.pmcBEAR;
                        break;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = Tier2.pmcUSEC;
                        break;
                    case "cursedassault":
                    case "marksman":
                    case "assault":
                        tier = Tier2.scav;
                        break;
                    default:
                        tier = Tier2.boss;
                        break;
                }
                break;
            case 3:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = Tier3.pmcBEAR;
                        break;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = Tier3.pmcUSEC;
                        break;
                    case "cursedassault":
                    case "marksman":
                    case "assault":
                        tier = Tier3.scav;
                        break;
                    default:
                        tier = Tier3.boss;
                        break;
                }
                break;
            case 4:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = Tier4.pmcBEAR;
                        break;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = Tier4.pmcUSEC;
                        break;
                    case "cursedassault":
                    case "marksman":
                    case "assault":
                        tier = Tier4.scav;
                        break;
                    default:
                        tier = Tier4.boss;
                        break;
                }
                break;
            case 5:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = Tier5.pmcBEAR;
                        break;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = Tier5.pmcUSEC;
                        break;
                    case "cursedassault":
                    case "marksman":
                    case "assault":
                        tier = Tier5.scav;
                        break;
                    default:
                        tier = Tier5.boss;
                        break;
                }
                break;
            case 6:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = Tier6.pmcBEAR;
                        break;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = Tier6.pmcUSEC;
                        break;
                    case "cursedassault":
                    case "marksman":
                    case "assault":
                        tier = Tier6.scav;
                        break;
                    default:
                        tier = Tier6.boss;
                        break;
                }
                break;
            case 7:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = Tier7.pmcBEAR;
                        break;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = Tier7.pmcUSEC;
                        break;
                    case "cursedassault":
                    case "marksman":
                    case "assault":
                        tier = Tier7.scav;
                        break;
                    default:
                        tier = Tier7.boss;
                        break;
                }
                break;
            default:
                break;
        }
        return tier;
    }
}