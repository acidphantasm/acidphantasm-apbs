/* eslint-disable @typescript-eslint/quotes */
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { TierInformation } from "../Globals/TierInformation";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { injectable, inject } from "tsyringe";
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { ITemplateItem, ItemType } from "@spt/models/eft/common/tables/ITemplateItem";
import { DatabaseService } from "@spt/services/DatabaseService";
import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";

import { ModConfig } from "../Globals/ModConfig";

@injectable()
export class ModdedImportHelper
{
    private blacklist: any[];
    private attachmentBlacklist: any[];

    constructor(
        @inject("IDatabaseTables") protected tables: IDatabaseTables,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("TierInformation") protected tierInformation: TierInformation,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("APBSLogger") protected apbsLogger: APBSLogger
    )
    {
        this.blacklist = [
            "5ae083b25acfc4001a5fc702", //weapons
            "5e81ebcd8e146c7080625e15",
            "6217726288ed9f0845317459",
            "5d52cc5ba4b9367408500062",
            "620109578d82e67e7911abf2",
            "639af924d0446708ee62294e",
            "657857faeff4c850222dff1b",
            "639c3fbbd0446708ee622ee9",
            "62178be9d0050232da3485d9",
            "62178c4d4ecf221597654e3d",
            "624c0b3340357b5f566e8766",
            "5cdeb229d7f00c000e7ce174",
            "579204f224597773d619e051",
            "6275303a9f372d6ea97f9ec7",
            "66015072e9f84d5680039678",
            "59f9cabd86f7743a10721f46",
            "5abccb7dd8ce87001773e277",
            "56e33634d2720bd8058b456b", //backpacks
            "5e4abc6786f77406812bd572",
            "5e997f0b86f7741ac73993e2",
            "61b9e1aaef9a1b5d6a79899a",
            "61c18db6dfd64163ea78fbb4", //headwear
            "65749cb8e0423b9ebe0c79c9",
            "60a7acf20c5cb24b01346648",
            "636270263f2495c26f00b007",
            "5a43943586f77416ad2f06e2",
            "5a43957686f7742a2c2f11b0",
            "65749ccf33fdc9c0cf06d3ca",
            "5a16bb52fcdbcb001a3b00dc",
            "628e4dd1f477aa12234918aa",
            "5c066ef40db834001966a595",
            "59ef13ca86f77445fd0e2483",
            "6531119b9afebff7ff0a1769"
        ]

        this.attachmentBlacklist = [
            "5c110624d174af029e69734c",
            "5d1b5e94d7ad1a2b865a96b0",
            "6478641c19d732620e045e17",
            "5a1eaa87fcdbcb001865f75e",
            "609bab8b455afd752b2e6138",
            "63fc44e2429a8a166c7f61e6",
            "5a1ead28fcdbcb001912fa9f",
            "63fc449f5bd61c6cf3784a88",
            "5b3b6dc75acfc47a8773fb1e",
            "5c11046cd174af02a012e42b",
            "544a3f024bdc2d1d388b4568",
            "544a3d0a4bdc2d1b388b4567"
        ]
    }

    public tiersTable = [];

    public initialize():void
    {
        if (ModConfig.config.initalTierAppearance < 1 || ModConfig.config.initalTierAppearance > 7)
        {
            this.apbsLogger.log(Logging.WARN, `Config value for "initialTierAppearance" is invalid. Must be 1-7. Currently configured for ${ModConfig.config.initalTierAppearance}`)
            return;
        }
        if (ModConfig.config.enableModdedWeapons) this.buildVanillaWeaponList();
        if (ModConfig.config.enableModdedEquipment) this.buildVanillaEquipmentList();
        
    }

    private buildVanillaWeaponList(): void
    {
        this.apbsLogger.log(Logging.WARN, "Checking for Modded Weapons...Support not granted for this feature...")
        const tier7JSON = this.tierInformation.tier7
        
        const weapons: ITemplateItem = {};
        Object.keys(tier7JSON.scav.equipment.FirstPrimaryWeapon.LongRange).forEach(element => 
        {
            weapons[element] = this.getItem(element)
        })
        
        Object.keys(tier7JSON.scav.equipment.FirstPrimaryWeapon.ShortRange).forEach(element => 
        {
            weapons[element] = this.getItem(element);
        })

        Object.keys(tier7JSON.scav.equipment.Holster).forEach(element => 
        {
            weapons[element] = this.getItem(element);
        })

        Object.keys(tier7JSON.scav.equipment.Scabbard).forEach(element => 
        {
            weapons[element] = this.getItem(element);
        })

        this.getModdedItems(weapons, BaseClasses.WEAPON, "Weapons");
    }

    private buildVanillaEquipmentList(): void
    {
        this.apbsLogger.log(Logging.WARN, "Checking for Modded Equipment...Support not granted for this feature...")
        const tier7JSON = this.tierInformation.tier7

        const armours: ITemplateItem = {};
        Object.keys(tier7JSON.scav.equipment.ArmorVest).forEach(element => 
        {
            armours[element] = this.getItem(element);
        })
        this.getModdedItems(armours, BaseClasses.ARMOR, "Armours");

        const headwear: ITemplateItem = {};
        Object.keys(tier7JSON.scav.equipment.Headwear).forEach(element => 
        {
            headwear[element] = this.getItem(element);
        })
        this.getModdedItems(headwear, BaseClasses.HEADWEAR, "Helmets");

        const tacticalVests: ITemplateItem = {};
        const combinedTacticalVests = { ...tier7JSON.scav.equipment.TacticalVest, ...tier7JSON.scav.equipment.ArmouredRig }
        Object.keys(combinedTacticalVests).forEach(element => 
        {
            tacticalVests[element] = this.getItem(element);
        })
        this.getModdedItems(tacticalVests, BaseClasses.VEST, "Vests");
    }

    private getModdedItems(equipmentList: ITemplateItem, baseClass: BaseClasses, className: string): void
    {
        const items = Object.values(this.tables.templates.items);
        const allItems = items.filter(x => this.itemHelper.isOfBaseclass(x._id, baseClass));
        
        const tieredItems = Object.values(equipmentList);
        const allTieredItems = tieredItems.filter(x => this.itemHelper.isOfBaseclass(x._id, baseClass));
        const difference:any = allItems.filter(x => !allTieredItems.includes(x));

        let moddedItems = difference;
        
        const blacklist = this.blacklist
        for (const item of difference)
        {
            for (const blacklistedItem of blacklist)
            {
                if (item._id == blacklistedItem)
                {
                    //console.log(`Blacklisted Item: ${item._id}`)
                    moddedItems = moddedItems.filter(id => id._id != blacklistedItem)
                }
            }
        }

        //console.log(`${JSON.stringify(moddedItems)}`)
        if (moddedItems.length > 0)
        {
            this.apbsLogger.log(Logging.WARN, `Importing Modded ${className}...`)
            if (baseClass == BaseClasses.WEAPON) this.getSetModdedWeaponDetails(moddedItems);
            if (baseClass != BaseClasses.WEAPON) this.getSetModdedEquipmentDetails(moddedItems);
        }
        if (moddedItems.length == 0)
        {
            this.apbsLogger.log(Logging.WARN, `No Modded ${className} found...`)
        }
    }

    private getSetModdedWeaponDetails(modWeaponPool): void
    {
        for (const weapon in modWeaponPool)
        {
            const weaponParent = modWeaponPool[weapon]._parent;
            const weaponId = modWeaponPool[weapon]._id;
            const weaponSlots = modWeaponPool[weapon]?._props?.Slots;
            const weaponChamber = modWeaponPool[weapon]?._props?.Chambers;
            const weaponType = modWeaponPool[weapon]?._props?.weapUseType;

            this.pushWeaponToTiers(weaponId, weaponType);
            this.pushItemAndPrimaryMods(weaponId, weaponSlots);

            //console.log(JSON.stringify(modWeaponPool[weapon]))            
            //console.log(`Weapon Parent: ${weaponParent} | Weapon ID: ${weaponId} | WeaponSlots: ${JSON.stringify(weaponSlots)} | WeaponChamber: ${JSON.stringify(weaponChamber)} | WeaponType: ${weaponType}`)
        }
    }

    private getSetModdedEquipmentDetails(modEquipmentPool): void
    {
        for (const equipment in modEquipmentPool)
        {
            const equipmentParent = modEquipmentPool[equipment]._parent;
            const equipmentId = modEquipmentPool[equipment]._id;
            const equipmentSlots = modEquipmentPool[equipment]?._props?.Slots;
            const equipmentSlotsLength = modEquipmentPool[equipment]?._props?.Slots.length;
            const gridLength = modEquipmentPool[equipment]?._props?.Grids.length;
            let equipmentSlot;

            if (equipmentParent == "5448e5284bdc2dcb718b4567" && (equipmentSlots.length == 0 || equipmentSlots == undefined))
            {
                equipmentSlot = "TacticalVest"
            }
            if (equipmentParent == "5448e5284bdc2dcb718b4567" && equipmentSlots.length >= 1)
            {
                equipmentSlot = "ArmouredRig"
            }
            if (equipmentParent == "5448e54d4bdc2dcc718b4568")
            {
                equipmentSlot = "ArmorVest"
            }
            if (equipmentParent == "5a341c4086f77401f2541505")
            {
                equipmentSlot = "Headwear"
            }

            this.pushEquipmentToTiers(equipmentId, equipmentSlot, gridLength, equipmentSlotsLength);
            this.pushItemAndPrimaryMods(equipmentId, equipmentSlots);

            //console.log(JSON.stringify(modEquipmentPool[equipment]))
            //console.log(`Equipment Parent: ${equipmentParent} | Equipment ID: ${equipmentId} | Equipment Slot Length: ${equipmentSlots.length} | Equipment Type: ${equipmentSlot}`)
        }
    }

    private pushWeaponToTiers(weaponId: string, weaponType: string): void
    {
        for (const object in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[object].tier
            const tierJson = this.apbsEquipmentGetter.getTierJson(tierNumber, true);

            if (tierNumber < ModConfig.config.initalTierAppearance)
            {
                continue;
            }
            if (weaponType == "primary")
            {
                tierJson.pmcUSEC.equipment.FirstPrimaryWeapon.LongRange[weaponId] = 10
                tierJson.pmcUSEC.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = 10
                tierJson.pmcBEAR.equipment.FirstPrimaryWeapon.LongRange[weaponId] = 10
                tierJson.pmcBEAR.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = 10
                tierJson.scav.equipment.FirstPrimaryWeapon.LongRange[weaponId] = 0
                tierJson.scav.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = 1
                tierJson.default.equipment.FirstPrimaryWeapon.LongRange[weaponId] = 7
                tierJson.default.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = 7
                
                tierJson.pmcUSEC.equipment.SecondPrimaryWeapon.LongRange[weaponId] = 10
                tierJson.pmcUSEC.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = 10
                tierJson.pmcBEAR.equipment.SecondPrimaryWeapon.LongRange[weaponId] = 10
                tierJson.pmcBEAR.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = 10
                tierJson.scav.equipment.SecondPrimaryWeapon.LongRange[weaponId] = 0
                tierJson.scav.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = 1
                tierJson.default.equipment.SecondPrimaryWeapon.LongRange[weaponId] = 7
                tierJson.default.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = 7

                this.apbsLogger.log(Logging.DEBUG, `Added ${weaponId} to Primary/Secondary Weapons - Tier ${tierNumber} - Weight: 10.`)
            }
            if (weaponType == "secondary")
            {
                tierJson.pmcUSEC.equipment.Holster[weaponId] = 4
                tierJson.pmcBEAR.equipment.Holster[weaponId] = 4
                tierJson.scav.equipment.Holster[weaponId] = 4
                tierJson.default.equipment.Holster[weaponId] = 4

                this.apbsLogger.log(Logging.DEBUG, `Added ${weaponId} to Holster Weapons - Tier ${tierNumber} - Weight: 4.`)
            }
        }
    }

    private pushEquipmentToTiers(itemID: string, equipmentSlot: string, gridLength: number, equipmentSlotsLength: number): void
    {
        for (const object in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[object].tier
            const tierJson = this.apbsEquipmentGetter.getTierJson(tierNumber, true);

            if (tierNumber < ModConfig.config.initalTierAppearance)
            {
                continue;
            }
            let weight;
            if (equipmentSlot == "TacticalVest" && gridLength > 10) weight = 10;
            if (equipmentSlot == "TacticalVest" && gridLength <= 10) weight = 1;
            if (equipmentSlot == "ArmouredRig") weight = 7;
            if (equipmentSlot == "ArmorVest") weight = 10;
            if (equipmentSlot == "Headwear" && equipmentSlotsLength > 0) weight = 6;
            if (equipmentSlot == "Headwear" && equipmentSlotsLength == 0) weight = 1;

            tierJson.pmcUSEC.equipment[equipmentSlot][itemID] = weight
            tierJson.pmcBEAR.equipment[equipmentSlot][itemID] = weight
            tierJson.scav.equipment[equipmentSlot][itemID] = 1
            tierJson.default.equipment[equipmentSlot][itemID] = weight

            this.apbsLogger.log(Logging.DEBUG, `Added ${itemID} to ${equipmentSlot} - Tier ${tierNumber} - Weight: ${weight}.`)
        }
    }

    private pushItemAndPrimaryMods(itemID, itemSlots): void
    {
        for (const slot in itemSlots)
        {
            const slotName = itemSlots[slot]?._name;
            for (const item in itemSlots[slot]?._props?.filters[0]?.Filter)
            {
                const slotFilterItem = itemSlots[slot]?._props?.filters[0]?.Filter[item];

                if (this.attachmentBlacklist.includes(slotFilterItem)) 
                {
                    this.apbsLogger.log(Logging.DEBUG, `Skipping ${slotFilterItem} due to internal blacklist`)
                    continue;
                }
                if (this.tierInformation.tier1mods[itemID] == undefined)
                {
                    this.tierInformation.tier1mods[itemID] = {};
                    this.tierInformation.tier2mods[itemID] = {};
                    this.tierInformation.tier3mods[itemID] = {};
                    this.tierInformation.tier4mods[itemID] = {};
                    this.tierInformation.tier5mods[itemID] = {};
                    this.tierInformation.tier6mods[itemID] = {};
                    this.tierInformation.tier7mods[itemID] = {};
                }
                if (this.tierInformation.tier1mods[itemID][slotName] == undefined)
                {
                    this.tierInformation.tier1mods[itemID][slotName] = [];
                    this.tierInformation.tier2mods[itemID][slotName] = [];
                    this.tierInformation.tier3mods[itemID][slotName] = [];
                    this.tierInformation.tier4mods[itemID][slotName] = [];
                    this.tierInformation.tier5mods[itemID][slotName] = [];
                    this.tierInformation.tier6mods[itemID][slotName] = [];
                    this.tierInformation.tier7mods[itemID][slotName] = [];
                }
                if (!this.tierInformation.tier1mods[itemID][slotName].includes(slotFilterItem))
                {
                    this.tierInformation.tier1mods[itemID][slotName].push(slotFilterItem);
                    this.tierInformation.tier2mods[itemID][slotName].push(slotFilterItem);
                    this.tierInformation.tier3mods[itemID][slotName].push(slotFilterItem);
                    this.tierInformation.tier4mods[itemID][slotName].push(slotFilterItem);
                    this.tierInformation.tier5mods[itemID][slotName].push(slotFilterItem);
                    this.tierInformation.tier6mods[itemID][slotName].push(slotFilterItem);
                    this.tierInformation.tier7mods[itemID][slotName].push(slotFilterItem);
                    this.recursivePushChildrenMods(slotFilterItem);
                }
            }
        }
    }

    private recursivePushChildrenMods(parentSlotFilterItem)
    {
        const parentSlotItemData = this.getItem(parentSlotFilterItem);
        const parentSlotItemID = parentSlotItemData?._id;
        const parentSlotSlots = parentSlotItemData?._props?.Slots;

        for (const slot in parentSlotSlots)
        {
            const slotName = parentSlotSlots[slot]?._name;
            for (const item in parentSlotSlots[slot]?._props?.filters[0]?.Filter)
            {
                const slotFilterItem = parentSlotSlots[slot]?._props?.filters[0]?.Filter[item];
                
                if (this.attachmentBlacklist.includes(slotFilterItem)) 
                {
                    this.apbsLogger.log(Logging.DEBUG, `Skipping ${slotFilterItem} due to internal blacklist`)
                    continue;
                }
                if (this.tierInformation.tier1mods[parentSlotItemID] == undefined)
                {
                    this.tierInformation.tier1mods[parentSlotItemID] = {};
                    this.tierInformation.tier2mods[parentSlotItemID] = {};
                    this.tierInformation.tier3mods[parentSlotItemID] = {};
                    this.tierInformation.tier4mods[parentSlotItemID] = {};
                    this.tierInformation.tier5mods[parentSlotItemID] = {};
                    this.tierInformation.tier6mods[parentSlotItemID] = {};
                    this.tierInformation.tier7mods[parentSlotItemID] = {};
                }
                if (this.tierInformation.tier1mods[parentSlotItemID][slotName] == undefined)
                {
                    this.tierInformation.tier1mods[parentSlotItemID][slotName] = [];
                    this.tierInformation.tier2mods[parentSlotItemID][slotName] = [];
                    this.tierInformation.tier3mods[parentSlotItemID][slotName] = [];
                    this.tierInformation.tier4mods[parentSlotItemID][slotName] = [];
                    this.tierInformation.tier5mods[parentSlotItemID][slotName] = [];
                    this.tierInformation.tier6mods[parentSlotItemID][slotName] = [];
                    this.tierInformation.tier7mods[parentSlotItemID][slotName] = [];
                }
                if (!this.tierInformation.tier1mods[parentSlotItemID][slotName].includes(slotFilterItem))
                {
                    this.tierInformation.tier1mods[parentSlotItemID][slotName].push(slotFilterItem)
                    this.tierInformation.tier2mods[parentSlotItemID][slotName].push(slotFilterItem)
                    this.tierInformation.tier3mods[parentSlotItemID][slotName].push(slotFilterItem)
                    this.tierInformation.tier4mods[parentSlotItemID][slotName].push(slotFilterItem)
                    this.tierInformation.tier5mods[parentSlotItemID][slotName].push(slotFilterItem)
                    this.tierInformation.tier6mods[parentSlotItemID][slotName].push(slotFilterItem)
                    this.tierInformation.tier7mods[parentSlotItemID][slotName].push(slotFilterItem)
                    this.recursivePushChildrenMods(slotFilterItem);
                }
            }
        }
    }

    private getItem(tpl: string): ITemplateItem
    {
        if (tpl in this.databaseService.getItems())
        {
            return this.databaseService.getItems()[tpl];
        }

        return undefined;
    }
}