
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

@injectable()
export class APBSEquipmentGetter
{
    constructor(
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper

    )
    {}

    private getTierJSON(tierInfo: number)
    {
        switch (tierInfo.toString())
        {
            case "1":
                return Tier1;
            case "2":
                return Tier2;
            case "3":
                return Tier3;
            case "4":
                return Tier4;
            case "5":
                return Tier5;
            case "6":
                return Tier6;
            case "7":
                return Tier7;
        }
    }

    public getEquipmentByBotRole(botRole: string, tierInfo: number, equipmentSlot: string): any
    {
        const ranged = equipmentSlot == ("FirstPrimaryWeapon" || "SecondPrimaryWeapon") ? this.weightedRandomHelper.getWeightedValue<string>(this.raidInformation.mapWeights[this.raidInformation.location]) : false;
        const tierJson = this.getTierJSON(tierInfo);
        switch (botRole)
        {
            case "pmcbear":
                return !ranged ? tierJson.pmcBEAR.equipment[equipmentSlot] : tierJson.pmcBEAR.equipment[equipmentSlot][ranged];
            case "arenaFighterEvent":
            case "exusec":
            case "pmcusec":
                return !ranged ? tierJson.pmcUSEC.equipment[equipmentSlot] : tierJson.pmcUSEC.equipment[equipmentSlot][ranged];
            case "marksman":
                return !ranged ? tierJson.marksman.equipment[equipmentSlot] : tierJson.marksman.equipment[equipmentSlot][ranged];
            case "cursedassault":
            case "assault":
                return !ranged ? tierJson.scav.equipment[equipmentSlot] : tierJson.scav.equipment[equipmentSlot][ranged];
            default:
                return !ranged ? tierJson.boss.equipment[equipmentSlot] : tierJson.boss.equipment[equipmentSlot][ranged];
        }
    }
    
    public getAmmoByBotRole(botRole: string, tierInfo: number): any
    {
        const tierJson = this.getTierJSON(tierInfo);
        switch (botRole)
        {
            case "pmcbear":
                return tierJson.pmcBEAR.Ammo
            case "arenaFighterEvent":
            case "exusec":
            case "pmcusec":
                return tierJson.pmcUSEC.Ammo
            case "marksman":
                return tierJson.marksman.Ammo
            case "cursedassault":
            case "assault":
                return tierJson.scav.Ammo
            default:
                return tierJson.boss.Ammo
        }
    }
}