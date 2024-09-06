/* eslint-disable @typescript-eslint/quotes */
import { injectable, inject } from "tsyringe";

import { APBSLogger } from "../Utils/APBSLogger";
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { TierInformation } from "../Globals/TierInformation";

@injectable()
export class RealismHelper
{
    constructor(
        @inject("TierInformation") protected tierInformation: TierInformation,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("APBSLogger") protected apbsLogger: APBSLogger
    )
    {}

    public gasMasks = [
        "5b432c305acfc40019478128",
        "60363c0c92ec1c31037959f5"
    ];

    public initialize():void
    {
        this.addGasMasksToBots();
    }

    private addGasMasksToBots() 
    {
        for (const tierObject in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[tierObject].tier
            const tierJson = this.apbsEquipmentGetter.getTierJson(tierNumber, true);
            for (const botType in tierJson)
            {
                let weight = 22;
                if (botType == "bossTagilla" || botType == "bossKilla") continue;
                if (botType == "pmcUSEC" || botType == "pmcUSEC" ) weight = 40;
                if (botType == "scav") weight = 26;
                tierJson[botType].equipment.FaceCover["5b432c305acfc40019478128"] = weight;
                tierJson[botType].equipment.FaceCover["60363c0c92ec1c31037959f5"] = weight;
            }
        }
        this.addGasMasksFiltersToMasks();
    }

    private addGasMasksFiltersToMasks() 
    {
        for (const tierObject in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[tierObject].tier
            const tierJson = this.apbsEquipmentGetter.getTierModsJson(tierNumber, true);

            tierJson["5b432c305acfc40019478128"] = {
                "mod_equipment": [
                    "590c595c86f7747884343ad7"
                ]
            }

            tierJson["60363c0c92ec1c31037959f5"] = {
                "mod_equipment": [
                    "590c595c86f7747884343ad7"
                ]
            }
        }
    }
}