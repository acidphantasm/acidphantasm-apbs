import { injectable, inject } from "tsyringe";
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { DatabaseService } from "@spt/services/DatabaseService";
import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";
import { ModConfig } from "../Globals/ModConfig";

@injectable()
export class BlacklistHelper
{
    private blacklist: any[];

    constructor(
        @inject("DatabaseService") protected database: DatabaseService,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("APBSLogger") protected apbsLogger: APBSLogger
    )
    {}

    public initialize(): void
    {
        if (ModConfig.config.tier1AmmoBlacklist.length > 0) this.removeBlacklistedAmmo(ModConfig.config.tier1AmmoBlacklist, 1);
        if (ModConfig.config.tier2AmmoBlacklist.length > 0) this.removeBlacklistedAmmo(ModConfig.config.tier2AmmoBlacklist, 2);
        if (ModConfig.config.tier3AmmoBlacklist.length > 0) this.removeBlacklistedAmmo(ModConfig.config.tier3AmmoBlacklist, 3);
        if (ModConfig.config.tier4AmmoBlacklist.length > 0) this.removeBlacklistedAmmo(ModConfig.config.tier4AmmoBlacklist, 4);
        if (ModConfig.config.tier5AmmoBlacklist.length > 0) this.removeBlacklistedAmmo(ModConfig.config.tier5AmmoBlacklist, 5);
        if (ModConfig.config.tier6AmmoBlacklist.length > 0) this.removeBlacklistedAmmo(ModConfig.config.tier6AmmoBlacklist, 6);
        if (ModConfig.config.tier7AmmoBlacklist.length > 0) this.removeBlacklistedAmmo(ModConfig.config.tier7AmmoBlacklist, 7);
        if (ModConfig.config.tier1EquipmentBlacklist.length > 0) this.removeBlacklistedEquipment(ModConfig.config.tier1EquipmentBlacklist, 1);
        if (ModConfig.config.tier2EquipmentBlacklist.length > 0) this.removeBlacklistedEquipment(ModConfig.config.tier2EquipmentBlacklist, 2);
        if (ModConfig.config.tier3EquipmentBlacklist.length > 0) this.removeBlacklistedEquipment(ModConfig.config.tier3EquipmentBlacklist, 3);
        if (ModConfig.config.tier4EquipmentBlacklist.length > 0) this.removeBlacklistedEquipment(ModConfig.config.tier4EquipmentBlacklist, 4);
        if (ModConfig.config.tier5EquipmentBlacklist.length > 0) this.removeBlacklistedEquipment(ModConfig.config.tier5EquipmentBlacklist, 5);
        if (ModConfig.config.tier6EquipmentBlacklist.length > 0) this.removeBlacklistedEquipment(ModConfig.config.tier6EquipmentBlacklist, 6);
        if (ModConfig.config.tier7EquipmentBlacklist.length > 0) this.removeBlacklistedEquipment(ModConfig.config.tier7EquipmentBlacklist, 7);
    }

    

    private removeBlacklistedAmmo(ammoBlacklist: string[], tier: number): void
    {
        const tierJSON = this.apbsEquipmentGetter.getTierAmmoJson(tier, true);
        for (const item in ammoBlacklist)
        {
            const itemDetails = this.getItem(ammoBlacklist[item])
            if (itemDetails != undefined && itemDetails._parent == "5485a8684bdc2da71d8b4567")
            {
                for (const botType in tierJSON)
                {
                    for (const ammo in tierJSON[botType])
                    {
                        if (Object.keys(tierJSON[botType][ammo]).includes(itemDetails._id))
                        {
                            if (Object.keys(tierJSON[botType][ammo]).length > 1)
                            {
                                delete tierJSON[botType][ammo][itemDetails._id]
                                this.apbsLogger.log(Logging.DEBUG, `Added "${ammoBlacklist[item]}" to blacklist for Tier${tier} ${botType} pool`)
                                continue;
                            }
                            this.apbsLogger.log(Logging.WARN, `Did not blacklist "${ammoBlacklist[item]}" as it would make the Tier${tier} ${botType} pool empty for ${ammo}`)
                            continue;
                        }
                    }
                }
            }
            if (itemDetails == undefined || itemDetails._parent != "5485a8684bdc2da71d8b4567")
            {
                this.apbsLogger.log(Logging.WARN, `"${ammoBlacklist[item]}" in Ammo Blacklist is either an invalid ammunition or item ID.`)
            }
        }
    }

    private removeBlacklistedEquipment(equipmentBlacklist: string[], tier: number): void
    {
        const tierJSON = this.apbsEquipmentGetter.getTierJson(tier, true);
        for (const item in equipmentBlacklist)
        {
            const itemDetails = this.getItem(equipmentBlacklist[item])
            if (itemDetails != undefined)
            {
                for (const botType in tierJSON)
                {
                    for (const equipmentSlot in tierJSON[botType].equipment)
                    {
                        if (Object.keys(tierJSON[botType].equipment[equipmentSlot]).includes(itemDetails._id))
                        {
                            if (Object.keys(tierJSON[botType].equipment[equipmentSlot]).length > 1)
                            {
                                delete tierJSON[botType].equipment[equipmentSlot][itemDetails._id]
                                this.apbsLogger.log(Logging.DEBUG, `Added "${equipmentBlacklist[item]}" to blacklist for Tier${tier} ${botType} equipment pool`)
                                continue;
                            }
                            this.apbsLogger.log(Logging.WARN, `Did not blacklist "${equipmentBlacklist[item]}" as it would make the Tier${tier} ${botType} equipment pool empty for ${equipmentSlot}`)
                            continue;
                        }
                    }
                }
            }
            if (itemDetails == undefined)
            {
                this.apbsLogger.log(Logging.WARN, `"${equipmentBlacklist[item]}" in Equipment Blacklist is an invalid item ID.`)
            }
        }
    }
    
    private getItem(tpl: string): ITemplateItem
    {
        if (tpl in this.database.getItems())
        {
            return this.database.getItems()[tpl];
        }

        return undefined;
    }
}