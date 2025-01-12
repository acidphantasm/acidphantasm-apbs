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
        if (ModConfig.config.tier1WeaponBlacklist.length > 0) this.removeBlacklistedWeapons(ModConfig.config.tier1WeaponBlacklist, 1);
        if (ModConfig.config.tier2WeaponBlacklist.length > 0) this.removeBlacklistedWeapons(ModConfig.config.tier2WeaponBlacklist, 2);
        if (ModConfig.config.tier3WeaponBlacklist.length > 0) this.removeBlacklistedWeapons(ModConfig.config.tier3WeaponBlacklist, 3);
        if (ModConfig.config.tier4WeaponBlacklist.length > 0) this.removeBlacklistedWeapons(ModConfig.config.tier4WeaponBlacklist, 4);
        if (ModConfig.config.tier5WeaponBlacklist.length > 0) this.removeBlacklistedWeapons(ModConfig.config.tier5WeaponBlacklist, 5);
        if (ModConfig.config.tier6WeaponBlacklist.length > 0) this.removeBlacklistedWeapons(ModConfig.config.tier6WeaponBlacklist, 6);
        if (ModConfig.config.tier7WeaponBlacklist.length > 0) this.removeBlacklistedWeapons(ModConfig.config.tier7WeaponBlacklist, 7);
        if (ModConfig.config.tier1AttachmentBlacklist.length > 0) this.removeBlacklistedAttachments(ModConfig.config.tier1AttachmentBlacklist, 1);
        if (ModConfig.config.tier2AttachmentBlacklist.length > 0) this.removeBlacklistedAttachments(ModConfig.config.tier2AttachmentBlacklist, 2);
        if (ModConfig.config.tier3AttachmentBlacklist.length > 0) this.removeBlacklistedAttachments(ModConfig.config.tier3AttachmentBlacklist, 3);
        if (ModConfig.config.tier4AttachmentBlacklist.length > 0) this.removeBlacklistedAttachments(ModConfig.config.tier4AttachmentBlacklist, 4);
        if (ModConfig.config.tier5AttachmentBlacklist.length > 0) this.removeBlacklistedAttachments(ModConfig.config.tier5AttachmentBlacklist, 5);
        if (ModConfig.config.tier6AttachmentBlacklist.length > 0) this.removeBlacklistedAttachments(ModConfig.config.tier6AttachmentBlacklist, 6);
        if (ModConfig.config.tier7AttachmentBlacklist.length > 0) this.removeBlacklistedAttachments(ModConfig.config.tier7AttachmentBlacklist, 7);

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
                            this.apbsLogger.log(Logging.WARN, `Did not blacklist "${itemDetails._id}" as it would make the Tier${tier} "${botType}" ${ammo} pool empty`)
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
                            this.apbsLogger.log(Logging.WARN, `Did not blacklist "${itemDetails._id}" as it would make the Tier${tier} "${botType}" ${equipmentSlot} pool empty.`)
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
                            this.apbsLogger.log(Logging.WARN, `Did not blacklist "${itemDetails._id}" as it would make the Tier${tier} "${botType}" ${equipmentSlot} pool empty.`)
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
                            this.apbsLogger.log(Logging.WARN, `Did not blacklist "${itemDetails._id}" as it would make the Tier${tier} "${botType}" ${equipmentSlot} pool empty.`)
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
                        this.apbsLogger.log(Logging.WARN, `Did not blacklist "${itemDetails._id}" as it would make the Tier${tier} "${botType}" Holster pool empty.`)
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
                        this.apbsLogger.log(Logging.WARN, `Did not blacklist "${itemDetails._id}" as it would make the Tier${tier} "${botType}" Scabbard pool empty.`)
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
    
    private getItem(tpl: string): ITemplateItem
    {
        if (tpl in this.database.getItems())
        {
            return this.database.getItems()[tpl];
        }

        return undefined;
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