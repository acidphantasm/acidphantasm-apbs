
import { inject, injectable } from "tsyringe";
import Tier1 = require("../db/Tier1.json");
import Tier2 = require("../db/Tier2.json");
import Tier3 = require("../db/Tier3.json");
import Tier4 = require("../db/Tier4.json");
import Tier5 = require("../db/Tier5.json");
import Tier6 = require("../db/Tier6.json");
import Tier7 = require("../db/Tier7.json");
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { RaidInformation } from "../Globals/RaidInformation";
import { readFile } from "fs/promises";

@injectable()
export class APBSEquipmentGetter
{
    constructor(
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper

    )
    {}

    public getEquipmentByBotRole(botRole: string, tierInfo: number, slot: string, range?: string): any
    {
        let tier;
        switch (tierInfo) 
        {
            case 1:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = range == undefined ? Tier1.pmcBEAR.equipment[slot] : Tier1.pmcBEAR.equipment[slot][range]
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = range == undefined ? Tier1.pmcUSEC.equipment[slot] : Tier1.pmcUSEC.equipment[slot][range]
                        return tier;
                    case "marksman":
                        tier = range == undefined ? Tier1.marksman.equipment[slot] : Tier1.marksman.equipment[slot][range]
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = range == undefined ? Tier1.scav.equipment[slot] : Tier1.scav.equipment[slot][range]
                        return tier;
                    default:
                        tier = range == undefined ? Tier1.boss.equipment[slot] : Tier1.boss.equipment[slot][range]
                        return tier;
                }
            case 2:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = range == undefined ? Tier2.pmcBEAR.equipment[slot] : Tier2.pmcBEAR.equipment[slot][range]
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = range == undefined ? Tier2.pmcUSEC.equipment[slot] : Tier2.pmcUSEC.equipment[slot][range]
                        return tier;
                    case "marksman":
                        tier = range == undefined ? Tier2.marksman.equipment[slot] : Tier2.marksman.equipment[slot][range]
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = range == undefined ? Tier2.scav.equipment[slot] : Tier2.scav.equipment[slot][range]
                        return tier;
                    default:
                        tier = range == undefined ? Tier2.boss.equipment[slot] : Tier2.boss.equipment[slot][range]
                        return tier;
                }
            case 3:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = range == undefined ? Tier3.pmcBEAR.equipment[slot] : Tier3.pmcBEAR.equipment[slot][range]
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = range == undefined ? Tier3.pmcUSEC.equipment[slot] : Tier3.pmcUSEC.equipment[slot][range]
                        return tier;
                    case "marksman":
                        tier = range == undefined ? Tier3.marksman.equipment[slot] : Tier3.marksman.equipment[slot][range]
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = range == undefined ? Tier3.scav.equipment[slot] : Tier3.scav.equipment[slot][range]
                        return tier;
                    default:
                        tier = range == undefined ? Tier3.boss.equipment[slot] : Tier3.boss.equipment[slot][range]
                        return tier;
                }
            case 4:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = range == undefined ? Tier4.pmcBEAR.equipment[slot] : Tier4.pmcBEAR.equipment[slot][range]
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = range == undefined ? Tier4.pmcUSEC.equipment[slot] : Tier4.pmcUSEC.equipment[slot][range]
                        return tier;
                    case "marksman":
                        tier = range == undefined ? Tier4.marksman.equipment[slot] : Tier4.marksman.equipment[slot][range]
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = range == undefined ? Tier4.scav.equipment[slot] : Tier4.scav.equipment[slot][range]
                        return tier;
                    default:
                        tier = range == undefined ? Tier4.boss.equipment[slot] : Tier4.boss.equipment[slot][range]
                        return tier;
                }
            case 5:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = range == undefined ? Tier5.pmcBEAR.equipment[slot] : Tier5.pmcBEAR.equipment[slot][range]
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = range == undefined ? Tier5.pmcUSEC.equipment[slot] : Tier5.pmcUSEC.equipment[slot][range]
                        return tier;
                    case "marksman":
                        tier = range == undefined ? Tier5.marksman.equipment[slot] : Tier5.marksman.equipment[slot][range]
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = range == undefined ? Tier5.scav.equipment[slot] : Tier5.scav.equipment[slot][range]
                        return tier;
                    default:
                        tier = range == undefined ? Tier5.boss.equipment[slot] : Tier5.boss.equipment[slot][range]
                        return tier;
                }
            case 6:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = range == undefined ? Tier6.pmcBEAR.equipment[slot] : Tier6.pmcBEAR.equipment[slot][range]
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = range == undefined ? Tier6.pmcUSEC.equipment[slot] : Tier6.pmcUSEC.equipment[slot][range]
                        return tier;
                    case "marksman":
                        tier = range == undefined ? Tier6.marksman.equipment[slot] : Tier6.marksman.equipment[slot][range]
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = range == undefined ? Tier6.scav.equipment[slot] : Tier6.scav.equipment[slot][range]
                        return tier;
                    default:
                        tier = range == undefined ? Tier6.boss.equipment[slot] : Tier6.boss.equipment[slot][range]
                        return tier;
                }
            case 7:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = range == undefined ? Tier7.pmcBEAR.equipment[slot] : Tier7.pmcBEAR.equipment[slot][range]
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = range == undefined ? Tier7.pmcUSEC.equipment[slot] : Tier7.pmcUSEC.equipment[slot][range]
                        return tier;
                    case "marksman":
                        tier = range == undefined ? Tier7.marksman.equipment[slot] : Tier7.marksman.equipment[slot][range]
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = range == undefined ? Tier7.scav.equipment[slot] : Tier7.scav.equipment[slot][range]
                        return tier;
                    default:
                        tier = range == undefined ? Tier7.boss.equipment[slot] : Tier7.boss.equipment[slot][range]
                        return tier;
                }
            default:
                break;
        }
    }
    
    public getAmmoByBotRole(botRole: string, tierInfo: number): Record<string, Record<string, number>>
    {
        let tier;
        switch (tierInfo) 
        {
            case 1:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = Tier1.pmcBEAR.Ammo
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = Tier1.pmcUSEC.Ammo
                        return tier;
                    case "marksman":
                        tier = Tier1.marksman.Ammo
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = Tier1.scav.Ammo
                        return tier;
                    default:
                        tier = Tier1.boss.Ammo
                        return tier;
                }
            case 2:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = Tier2.pmcBEAR.Ammo
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = Tier2.pmcUSEC.Ammo
                        return tier;
                    case "marksman":
                        tier = Tier2.marksman.Ammo
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = Tier2.scav.Ammo
                        return tier;
                    default:
                        tier = Tier2.boss.Ammo
                        return tier;
                }
            case 3:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = Tier3.pmcBEAR.Ammo
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = Tier3.pmcUSEC.Ammo
                        return tier;
                    case "marksman":
                        tier = Tier3.marksman.Ammo
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = Tier3.scav.Ammo
                        return tier;
                    default:
                        tier = Tier3.boss.Ammo
                        return tier;
                }
            case 4:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = Tier4.pmcBEAR.Ammo
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = Tier4.pmcUSEC.Ammo
                        return tier;
                    case "marksman":
                        tier = Tier4.marksman.Ammo
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = Tier4.scav.Ammo
                        return tier;
                    default:
                        tier = Tier4.boss.Ammo
                        return tier;
                }
            case 5:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = Tier5.pmcBEAR.Ammo
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = Tier5.pmcUSEC.Ammo
                        return tier;
                    case "marksman":
                        tier = Tier5.marksman.Ammo
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = Tier5.scav.Ammo
                        return tier;
                    default:
                        tier = Tier5.boss.Ammo
                        return tier;
                }
            case 6:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = Tier6.pmcBEAR.Ammo
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = Tier6.pmcUSEC.Ammo
                        return tier;
                    case "marksman":
                        tier = Tier6.marksman.Ammo
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = Tier6.scav.Ammo
                        return tier;
                    default:
                        tier = Tier6.boss.Ammo
                        return tier;
                }
            case 7:
                switch (botRole)
                {
                    case "pmcbear":
                        tier = Tier7.pmcBEAR.Ammo
                        return tier;
                    case "arenaFighterEvent":
                    case "exusec":
                    case "pmcusec":
                        tier = Tier7.pmcUSEC.Ammo
                        return tier;
                    case "marksman":
                        tier = Tier7.marksman.Ammo
                        return tier;
                    case "cursedassault":
                    case "assault":
                        tier = Tier7.scav.Ammo
                        return tier;
                    default:
                        tier = Tier7.boss.Ammo
                        return tier;
                }
            default:
                break;
        }
    }
}