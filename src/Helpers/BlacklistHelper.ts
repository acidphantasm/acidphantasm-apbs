import { injectable, inject } from "tsyringe";
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { DatabaseService } from "@spt/services/DatabaseService";
import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";
import { ModConfig } from "../Globals/ModConfig";
import { ICustomizationItem } from "@spt/models/eft/common/tables/ICustomizationItem";

@injectable()
export class BlacklistHelper
{
    constructor(
        @inject("DatabaseService") protected database: DatabaseService,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("APBSLogger") protected apbsLogger: APBSLogger
    )
    {}

    private invalidAmmoIDs: string[] = [];
    private invalidEquipmentIDs: string[] = [];
    private invalidWeaponIDs: string[] = [];
    private invalidAttachmentIDs: string[] = [];
    private invalidClothingIDs: string[] = [];

    public initialize(): void
    {
        if (ModConfig.blacklist.weaponBlacklist.tier1Blacklist.length > 0) this.removeBlacklistedWeapons(ModConfig.blacklist.weaponBlacklist.tier1Blacklist, 1);
        if (ModConfig.blacklist.weaponBlacklist.tier2Blacklist.length > 0) this.removeBlacklistedWeapons(ModConfig.blacklist.weaponBlacklist.tier2Blacklist, 2);
        if (ModConfig.blacklist.weaponBlacklist.tier3Blacklist.length > 0) this.removeBlacklistedWeapons(ModConfig.blacklist.weaponBlacklist.tier3Blacklist, 3);
        if (ModConfig.blacklist.weaponBlacklist.tier4Blacklist.length > 0) this.removeBlacklistedWeapons(ModConfig.blacklist.weaponBlacklist.tier4Blacklist, 4);
        if (ModConfig.blacklist.weaponBlacklist.tier5Blacklist.length > 0) this.removeBlacklistedWeapons(ModConfig.blacklist.weaponBlacklist.tier5Blacklist, 5);
        if (ModConfig.blacklist.weaponBlacklist.tier6Blacklist.length > 0) this.removeBlacklistedWeapons(ModConfig.blacklist.weaponBlacklist.tier6Blacklist, 6);
        if (ModConfig.blacklist.weaponBlacklist.tier7Blacklist.length > 0) this.removeBlacklistedWeapons(ModConfig.blacklist.weaponBlacklist.tier7Blacklist, 7);

        if (ModConfig.blacklist.equipmentBlacklist.tier1Blacklist.length > 0) this.removeBlacklistedEquipment(ModConfig.blacklist.equipmentBlacklist.tier1Blacklist, 1);
        if (ModConfig.blacklist.equipmentBlacklist.tier2Blacklist.length > 0) this.removeBlacklistedEquipment(ModConfig.blacklist.equipmentBlacklist.tier2Blacklist, 2);
        if (ModConfig.blacklist.equipmentBlacklist.tier3Blacklist.length > 0) this.removeBlacklistedEquipment(ModConfig.blacklist.equipmentBlacklist.tier3Blacklist, 3);
        if (ModConfig.blacklist.equipmentBlacklist.tier4Blacklist.length > 0) this.removeBlacklistedEquipment(ModConfig.blacklist.equipmentBlacklist.tier4Blacklist, 4);
        if (ModConfig.blacklist.equipmentBlacklist.tier5Blacklist.length > 0) this.removeBlacklistedEquipment(ModConfig.blacklist.equipmentBlacklist.tier5Blacklist, 5);
        if (ModConfig.blacklist.equipmentBlacklist.tier6Blacklist.length > 0) this.removeBlacklistedEquipment(ModConfig.blacklist.equipmentBlacklist.tier6Blacklist, 6);
        if (ModConfig.blacklist.equipmentBlacklist.tier7Blacklist.length > 0) this.removeBlacklistedEquipment(ModConfig.blacklist.equipmentBlacklist.tier7Blacklist, 7);

        if (ModConfig.blacklist.ammoBlacklist.tier1Blacklist.length > 0) this.removeBlacklistedAmmo(ModConfig.blacklist.ammoBlacklist.tier1Blacklist, 1);
        if (ModConfig.blacklist.ammoBlacklist.tier2Blacklist.length > 0) this.removeBlacklistedAmmo(ModConfig.blacklist.ammoBlacklist.tier2Blacklist, 2);
        if (ModConfig.blacklist.ammoBlacklist.tier3Blacklist.length > 0) this.removeBlacklistedAmmo(ModConfig.blacklist.ammoBlacklist.tier3Blacklist, 3);
        if (ModConfig.blacklist.ammoBlacklist.tier4Blacklist.length > 0) this.removeBlacklistedAmmo(ModConfig.blacklist.ammoBlacklist.tier4Blacklist, 4);
        if (ModConfig.blacklist.ammoBlacklist.tier5Blacklist.length > 0) this.removeBlacklistedAmmo(ModConfig.blacklist.ammoBlacklist.tier5Blacklist, 5);
        if (ModConfig.blacklist.ammoBlacklist.tier6Blacklist.length > 0) this.removeBlacklistedAmmo(ModConfig.blacklist.ammoBlacklist.tier6Blacklist, 6);
        if (ModConfig.blacklist.ammoBlacklist.tier7Blacklist.length > 0) this.removeBlacklistedAmmo(ModConfig.blacklist.ammoBlacklist.tier7Blacklist, 7);

        if (ModConfig.blacklist.attachmentBlacklist.tier1Blacklist.length > 0) this.removeBlacklistedAttachments(ModConfig.blacklist.attachmentBlacklist.tier1Blacklist, 1);
        if (ModConfig.blacklist.attachmentBlacklist.tier2Blacklist.length > 0) this.removeBlacklistedAttachments(ModConfig.blacklist.attachmentBlacklist.tier2Blacklist, 2);
        if (ModConfig.blacklist.attachmentBlacklist.tier3Blacklist.length > 0) this.removeBlacklistedAttachments(ModConfig.blacklist.attachmentBlacklist.tier3Blacklist, 3);
        if (ModConfig.blacklist.attachmentBlacklist.tier4Blacklist.length > 0) this.removeBlacklistedAttachments(ModConfig.blacklist.attachmentBlacklist.tier4Blacklist, 4);
        if (ModConfig.blacklist.attachmentBlacklist.tier5Blacklist.length > 0) this.removeBlacklistedAttachments(ModConfig.blacklist.attachmentBlacklist.tier5Blacklist, 5);
        if (ModConfig.blacklist.attachmentBlacklist.tier6Blacklist.length > 0) this.removeBlacklistedAttachments(ModConfig.blacklist.attachmentBlacklist.tier6Blacklist, 6);
        if (ModConfig.blacklist.attachmentBlacklist.tier7Blacklist.length > 0) this.removeBlacklistedAttachments(ModConfig.blacklist.attachmentBlacklist.tier7Blacklist, 7);

        if (ModConfig.blacklist.clothingBlacklist.tier1Blacklist.length > 0) this.removeBlacklistedClothing(ModConfig.blacklist.clothingBlacklist.tier1Blacklist, 1);
        if (ModConfig.blacklist.clothingBlacklist.tier2Blacklist.length > 0) this.removeBlacklistedClothing(ModConfig.blacklist.clothingBlacklist.tier2Blacklist, 2);
        if (ModConfig.blacklist.clothingBlacklist.tier3Blacklist.length > 0) this.removeBlacklistedClothing(ModConfig.blacklist.clothingBlacklist.tier3Blacklist, 3);
        if (ModConfig.blacklist.clothingBlacklist.tier4Blacklist.length > 0) this.removeBlacklistedClothing(ModConfig.blacklist.clothingBlacklist.tier4Blacklist, 4);
        if (ModConfig.blacklist.clothingBlacklist.tier5Blacklist.length > 0) this.removeBlacklistedClothing(ModConfig.blacklist.clothingBlacklist.tier5Blacklist, 5);
        if (ModConfig.blacklist.clothingBlacklist.tier6Blacklist.length > 0) this.removeBlacklistedClothing(ModConfig.blacklist.clothingBlacklist.tier6Blacklist, 6);
        if (ModConfig.blacklist.clothingBlacklist.tier7Blacklist.length > 0) this.removeBlacklistedClothing(ModConfig.blacklist.clothingBlacklist.tier7Blacklist, 7);

        this.validateBlacklist();
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
                                this.apbsLogger.log(Logging.DEBUG, `[Tier${tier}] Removed "${itemDetails._id}" from "${botType}" ${ammo} pool.`)
                                continue;
                            }
                            this.apbsLogger.log(Logging.WARN, `Did not blacklist "${itemDetails._id}" for "${botType}" as it would make the Tier${tier} ${ammo} pool empty`)
                            continue;
                        }
                    }
                }
            }
            if (itemDetails == undefined || itemDetails._parent != "5485a8684bdc2da71d8b4567")
            {
                if (!this.invalidAmmoIDs.includes(ammoBlacklist[item])) this.invalidAmmoIDs.push(ammoBlacklist[item])
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
                                this.apbsLogger.log(Logging.DEBUG, `[Tier${tier}] Removed "${itemDetails._id}" from "${botType}" ${equipmentSlot} pool.`)
                                continue;
                            }
                            this.apbsLogger.log(Logging.WARN, `Did not blacklist "${itemDetails._id}" for "${botType}" as it would make the Tier${tier} ${equipmentSlot} pool empty.`)
                            continue;
                        }
                    }
                }
            }
            if (itemDetails == undefined)
            {
                if (!this.invalidEquipmentIDs.includes(equipmentBlacklist[item])) this.invalidEquipmentIDs.push(equipmentBlacklist[item])
            }
        }
    }

    private removeBlacklistedWeapons(weaponBlacklist: string[], tier: number): void
    {
        const tierJSON = this.apbsEquipmentGetter.getTierJson(tier, true);
        for (const item in weaponBlacklist)
        {
            const itemDetails = this.getItem(weaponBlacklist[item])
            if (itemDetails != undefined)
            {
                for (const botType in tierJSON)
                {
                    for (const equipmentSlot in tierJSON[botType].equipment.FirstPrimaryWeapon)
                    {
                        if (Object.keys(tierJSON[botType].equipment.FirstPrimaryWeapon[equipmentSlot]).includes(itemDetails._id))
                        {
                            if (Object.keys(tierJSON[botType].equipment.FirstPrimaryWeapon[equipmentSlot]).length > 1)
                            {
                                delete tierJSON[botType].equipment.FirstPrimaryWeapon[equipmentSlot][itemDetails._id]
                                this.apbsLogger.log(Logging.DEBUG, `[Tier${tier}] Removed "${itemDetails._id}" from "${botType}" ${equipmentSlot} pool.`)
                                continue;
                            }
                            this.apbsLogger.log(Logging.WARN, `Did not blacklist "${itemDetails._id}" for "${botType}" as it would make the Tier${tier} ${equipmentSlot} pool empty.`)
                            continue;
                        }
                    }
                    for (const equipmentSlot in tierJSON[botType].equipment.SecondPrimaryWeapon)
                    {
                        if (Object.keys(tierJSON[botType].equipment.SecondPrimaryWeapon[equipmentSlot]).includes(itemDetails._id))
                        {
                            if (Object.keys(tierJSON[botType].equipment.SecondPrimaryWeapon[equipmentSlot]).length > 1)
                            {
                                delete tierJSON[botType].equipment.SecondPrimaryWeapon[equipmentSlot][itemDetails._id]
                                this.apbsLogger.log(Logging.DEBUG, `[Tier${tier}] Removed "${itemDetails._id}" from "${botType}" ${equipmentSlot} pool.`)
                                continue;
                            }
                            this.apbsLogger.log(Logging.WARN, `Did not blacklist "${itemDetails._id}" for "${botType}" as it would make the Tier${tier} ${equipmentSlot} pool empty.`)
                            continue;
                        }
                    }
                    if (Object.keys(tierJSON[botType].equipment.Holster).includes(itemDetails._id))
                    {
                        if (Object.keys(tierJSON[botType].equipment.Holster).length > 1)
                        {
                            delete tierJSON[botType].equipment.Holster[itemDetails._id]
                            this.apbsLogger.log(Logging.DEBUG, `[Tier${tier}] Removed "${itemDetails._id}" from "${botType}" Holster pool.`)
                            continue;
                        }
                        this.apbsLogger.log(Logging.WARN, `Did not blacklist "${itemDetails._id}" for "${botType}" as it would make the Tier${tier} Holster pool empty.`)
                        continue;
                    }
                    if (Object.keys(tierJSON[botType].equipment.Scabbard).includes(itemDetails._id))
                    {
                        if (Object.keys(tierJSON[botType].equipment.Scabbard).length > 1)
                        {
                            delete tierJSON[botType].equipment.Scabbard[itemDetails._id]
                            this.apbsLogger.log(Logging.DEBUG, `[Tier${tier}] Removed "${itemDetails._id}" from "${botType}" Scabbard pool.`)
                            continue;
                        }
                        this.apbsLogger.log(Logging.WARN, `Did not blacklist "${itemDetails._id}" for "${botType}" as it would make the Tier${tier} Scabbard pool empty.`)
                        continue;
                    }
                }
            }
            if (itemDetails == undefined)
            {
                if (!this.invalidWeaponIDs.includes(weaponBlacklist[item])) this.invalidWeaponIDs.push(weaponBlacklist[item])
            }
        }
    }

    private removeBlacklistedAttachments(attachmentBlacklist: string[], tier: number): void
    {
        const tierJSON = this.apbsEquipmentGetter.getTierModsJson(tier, true);
        for (const item in attachmentBlacklist)
        {
            const itemDetails = this.getItem(attachmentBlacklist[item])
            if (itemDetails != undefined)
            {
                for (const parentID in tierJSON)
                {
                    const parentItemName = this.getItem(parentID);
                    const parentItemID = tierJSON[parentID]
                    for (const slotName in parentItemID)
                    {
                        const itemSlotName = tierJSON[parentID][slotName]
                        if (itemSlotName.includes(itemDetails._id))
                        {
                            if (itemSlotName.length == 1)
                            {
                                delete tierJSON[parentID][slotName];
                                this.apbsLogger.log(Logging.DEBUG, `[Tier${tier}] Removed slot "${slotName}" from "${parentItemName._name}" because array is now empty.`);
                                continue;
                            }
                            const index = itemSlotName.indexOf(itemDetails._id);
                            if (index > -1)
                            {
                                itemSlotName.splice(index, 1)
                                this.apbsLogger.log(Logging.DEBUG, `[Tier${tier}] Removed "${itemDetails._id}" from "${parentItemName._name}" slot "${slotName}".`);
                                continue;
                            }
                        }
                    }
                }
            }
            if (itemDetails == undefined)
            {
                if (!this.invalidAttachmentIDs.includes(attachmentBlacklist[item])) this.invalidAttachmentIDs.push(attachmentBlacklist[item])
            }
        }
    }

    private removeBlacklistedClothing(clothingBlacklist: string[], tier: number): void
    {
        const tierJSON = this.apbsEquipmentGetter.getAppearanceJson(tier, true);
        for (const item in clothingBlacklist)
        {
            const itemDetails = this.getCustomization(clothingBlacklist[item])
            if (itemDetails != undefined)
            {
                for (const botType in tierJSON)
                {
                    for (const type in tierJSON[botType].appearance)
                    {
                        if (type == "hands" || type == "head") continue;

                        if (Object.keys(tierJSON[botType].appearance[type]).includes(itemDetails._id))
                        {
                            if (Object.keys(tierJSON[botType].appearance[type]).length > 1)
                            {
                                delete tierJSON[botType].appearance[type][itemDetails._id]
                                this.apbsLogger.log(Logging.DEBUG, `[Tier${tier}] Removed "${itemDetails._id}" from "${botType}" ${type} pool.`)
                                continue;
                            }
                            this.apbsLogger.log(Logging.WARN, `Did not blacklist "${itemDetails._id}" for "${botType}" as it would make the Tier${tier} ${type} pool empty.`)
                            continue;
                        }
                    }
                }
            }
            if (itemDetails == undefined)
            {
                if (!this.invalidClothingIDs.includes(clothingBlacklist[item])) this.invalidClothingIDs.push(clothingBlacklist[item])
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

    private getCustomization(tpl: string): ICustomizationItem
    {
        if (tpl in this.database.getCustomization())
        {
            return this.database.getCustomization()[tpl];
        }

        return undefined;
    }

    private isCustomization(tpl: string, type: string): boolean
    {
        if (tpl in this.database.getCustomization())
        {
            const item = this.database.getCustomization()[tpl];
            if (item._props.Side == undefined)
            {
                return false;
            }
            if (item._props.Side.includes("Bear") || item._props.Side.includes("Usec"))
            {
                if (item._props.BodyPart == type)
                {
                    return true;
                }
                return false;
            }
        }

        return false;
    }
    private validateBlacklist(): void
    {
        if (this.invalidAmmoIDs.length > 0) 
        {
            for (const item in this.invalidAmmoIDs)
            {
                this.apbsLogger.log(Logging.WARN, `"${this.invalidAmmoIDs[item]}" in Ammo Blacklist is an invalid item ID.`)
            }
        }
        if (this.invalidEquipmentIDs.length > 0) 
        {
            for (const item in this.invalidEquipmentIDs)
            {
                this.apbsLogger.log(Logging.WARN, `"${this.invalidEquipmentIDs[item]}" in Equipment Blacklist is an invalid item ID.`)
            }
        }
        if (this.invalidWeaponIDs.length > 0) 
        {
            for (const item in this.invalidWeaponIDs)
            {
                this.apbsLogger.log(Logging.WARN, `"${this.invalidWeaponIDs[item]}" in Weapon Blacklist is an invalid item ID.`)
            }
        }
        if (this.invalidAttachmentIDs.length > 0) 
        {
            for (const item in this.invalidAttachmentIDs)
            {
                this.apbsLogger.log(Logging.WARN, `"${this.invalidAttachmentIDs[item]}" in Attachment Blacklist is an invalid item ID.`)
            }
        }
    }
}