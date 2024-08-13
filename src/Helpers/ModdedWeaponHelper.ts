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
export class ModdedWeaponHelper
{
    private tieredWeaponList: ITemplateItem;
    private blacklist: any[];

    constructor(
        @inject("IDatabaseTables") protected tables: IDatabaseTables,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("TierInformation") protected tierInformation: TierInformation,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("APBSLogger") protected apbsLogger: APBSLogger
    )
    {
        this.tieredWeaponList = {}
        this.blacklist = [
            "5ae083b25acfc4001a5fc702",
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
            "5abccb7dd8ce87001773e277"
        ]
    }

    public tiersTable = [];

    public initialize():void
    {
        if (ModConfig.config.enableModdedWeapons)
            this.buildVanillaWeaponList();
    }

    private buildVanillaWeaponList(): void
    {
        const tier7JSON = this.apbsEquipmentGetter.getTierJson(7)
        
        Object.keys(tier7JSON.scav.equipment.FirstPrimaryWeapon.LongRange).forEach(element => 
        {
            const data = this.getItem(element)
            this.tieredWeaponList[element] = data
        })
        
        Object.keys(tier7JSON.scav.equipment.FirstPrimaryWeapon.ShortRange).forEach(element => 
        {
            const data = this.getItem(element)
            this.tieredWeaponList[element] = data;
        })

        Object.keys(tier7JSON.scav.equipment.Holster).forEach(element => 
        {
            const data = this.getItem(element)
            this.tieredWeaponList[element] = data;
        })

        Object.keys(tier7JSON.scav.equipment.Scabbard).forEach(element => 
        {
            const data = this.getItem(element)
            this.tieredWeaponList[element] = data;
        })

        this.getModdedWeapons();
    }

    private getModdedWeapons(): void
    {
        this.apbsLogger.log(Logging.WARN, "Checking for Modded Weapons...")
        const items = Object.values(this.tables.templates.items);
        const allWeapons = items.filter(x => this.itemHelper.isOfBaseclass(x._id, BaseClasses.WEAPON));

        const tieredItems = Object.values(this.tieredWeaponList);
        const allTieredItems = tieredItems.filter(x => this.itemHelper.isOfBaseclass(x._id, BaseClasses.WEAPON));
        const difference:any = allWeapons.filter(x => !allTieredItems.includes(x));

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
            this.apbsLogger.log(Logging.WARN, "Importing Modded Weapons...")
            this.getSetModdedWeaponDetails(moddedItems);
        }
        if (moddedItems.length == 0)
        {
            this.apbsLogger.log(Logging.WARN, "No Modded Weapons found...")
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
            this.pushWeaponAndPrimaryMods(weaponId, weaponSlots);

            //console.log(JSON.stringify(modWeaponPool[weapon]))            
            //console.log(`Weapon Parent: ${weaponParent} | Weapon ID: ${weaponId} | WeaponSlots: ${JSON.stringify(weaponSlots)} | WeaponChamber: ${JSON.stringify(weaponChamber)} | WeaponType: ${weaponType}`)
        }
    }

    private pushWeaponToTiers(weaponId: string, weaponType: string): void
    {
        for (const object in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[object].tier
            const tierJson = this.apbsEquipmentGetter.getTierJson(tierNumber);

            if (weaponType == "primary")
            {
                tierJson.pmcUSEC.equipment.FirstPrimaryWeapon.LongRange[weaponId] = 15
                tierJson.pmcUSEC.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = 15
                tierJson.pmcBEAR.equipment.FirstPrimaryWeapon.LongRange[weaponId] = 15
                tierJson.pmcBEAR.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = 15
                tierJson.scav.equipment.FirstPrimaryWeapon.LongRange[weaponId] = 0
                tierJson.scav.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = 1
                tierJson.default.equipment.FirstPrimaryWeapon.LongRange[weaponId] = 15
                tierJson.default.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = 15
                
                tierJson.pmcUSEC.equipment.SecondPrimaryWeapon.LongRange[weaponId] = 15
                tierJson.pmcUSEC.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = 15
                tierJson.pmcBEAR.equipment.SecondPrimaryWeapon.LongRange[weaponId] = 15
                tierJson.pmcBEAR.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = 15
                tierJson.scav.equipment.SecondPrimaryWeapon.LongRange[weaponId] = 0
                tierJson.scav.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = 1
                tierJson.default.equipment.SecondPrimaryWeapon.LongRange[weaponId] = 15
                tierJson.default.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = 15

                this.apbsLogger.log(Logging.DEBUG, `Added ${weaponId} to Primary/Secondary Weapons - Tier ${tierNumber} - Weight: 15.`)
            }
            if (weaponType == "secondary")
            {
                tierJson.pmcUSEC.equipment.Holster[weaponId] = 5
                tierJson.pmcBEAR.equipment.Holster[weaponId] = 5
                tierJson.scav.equipment.Holster[weaponId] = 5
                tierJson.default.equipment.Holster[weaponId] = 5

                this.apbsLogger.log(Logging.DEBUG, `Added ${weaponId} to Holster Weapons - Tier ${tierNumber} - Weight: 5.`)
            }
        }
    }

    private pushWeaponAndPrimaryMods(weaponId, weaponSlots): void
    {
        for (const slot in weaponSlots)
        {
            const slotName = weaponSlots[slot]?._name;
            for (const item in weaponSlots[slot]?._props?.filters[0]?.Filter)
            {
                const slotFilterItem = weaponSlots[slot]?._props?.filters[0]?.Filter[item];

                if (this.tierInformation.tier1mods[weaponId] == undefined)
                {
                    this.tierInformation.tier1mods[weaponId] = {};
                    this.tierInformation.tier2mods[weaponId] = {};
                    this.tierInformation.tier3mods[weaponId] = {};
                    this.tierInformation.tier4mods[weaponId] = {};
                    this.tierInformation.tier5mods[weaponId] = {};
                    this.tierInformation.tier6mods[weaponId] = {};
                    this.tierInformation.tier7mods[weaponId] = {};
                }
                if (this.tierInformation.tier1mods[weaponId][slotName] == undefined)
                {
                    this.tierInformation.tier1mods[weaponId][slotName] = [];
                    this.tierInformation.tier2mods[weaponId][slotName] = [];
                    this.tierInformation.tier3mods[weaponId][slotName] = [];
                    this.tierInformation.tier4mods[weaponId][slotName] = [];
                    this.tierInformation.tier5mods[weaponId][slotName] = [];
                    this.tierInformation.tier6mods[weaponId][slotName] = [];
                    this.tierInformation.tier7mods[weaponId][slotName] = [];
                }
                if (!this.tierInformation.tier1mods[weaponId][slotName].includes(slotFilterItem))
                {
                    this.tierInformation.tier1mods[weaponId][slotName].push(slotFilterItem);
                    this.tierInformation.tier2mods[weaponId][slotName].push(slotFilterItem);
                    this.tierInformation.tier3mods[weaponId][slotName].push(slotFilterItem);
                    this.tierInformation.tier4mods[weaponId][slotName].push(slotFilterItem);
                    this.tierInformation.tier5mods[weaponId][slotName].push(slotFilterItem);
                    this.tierInformation.tier6mods[weaponId][slotName].push(slotFilterItem);
                    this.tierInformation.tier7mods[weaponId][slotName].push(slotFilterItem);
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