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

import Tier1 = require("../db/Tier1.json");
import Tier2 = require("../db/Tier2.json");
import Tier3 = require("../db/Tier3.json");
import Tier4 = require("../db/Tier4.json");
import Tier5 = require("../db/Tier5.json");
import Tier6 = require("../db/Tier6.json");
import Tier7 = require("../db/Tier7.json");
import mods = require("../db/mods.json");
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
        this.buildTierJson();
        if (ModConfig.config.enableModdedWeapons)
            this.buildVanillaWeaponList();
    }

    private buildTierJson(): void
    {
        this.tierInformation.tier1 = Tier1;
        this.tierInformation.tier2 = Tier2;
        this.tierInformation.tier3 = Tier3;
        this.tierInformation.tier4 = Tier4;
        this.tierInformation.tier5 = Tier5;
        this.tierInformation.tier6 = Tier6;
        this.tierInformation.tier7 = Tier7;
    }

    private buildVanillaWeaponList(): void
    {
        const tier7JSON = this.apbsEquipmentGetter.getTierJson(7)
        
        Object.keys(tier7JSON.scav.equipment.FirstPrimaryWeapon.LongRange).forEach(element => {
            const data = this.getItem(element)
            this.tieredWeaponList[element] = data
        })
        
        Object.keys(tier7JSON.scav.equipment.FirstPrimaryWeapon.ShortRange).forEach(element => {
            const data = this.getItem(element)
            this.tieredWeaponList[element] = data;
        })

        Object.keys(tier7JSON.scav.equipment.Holster).forEach(element => {
            const data = this.getItem(element)
            this.tieredWeaponList[element] = data;
        })

        Object.keys(tier7JSON.scav.equipment.Scabbard).forEach(element => {
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
                tierJson.boss.equipment.FirstPrimaryWeapon.LongRange[weaponId] = 15
                tierJson.boss.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = 15
                
                tierJson.pmcUSEC.equipment.SecondPrimaryWeapon.LongRange[weaponId] = 15
                tierJson.pmcUSEC.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = 15
                tierJson.pmcBEAR.equipment.SecondPrimaryWeapon.LongRange[weaponId] = 15
                tierJson.pmcBEAR.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = 15
                tierJson.scav.equipment.SecondPrimaryWeapon.LongRange[weaponId] = 0
                tierJson.scav.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = 1
                tierJson.boss.equipment.SecondPrimaryWeapon.LongRange[weaponId] = 15
                tierJson.boss.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = 15

                this.apbsLogger.log(Logging.DEBUG, `Added ${weaponId} to Primary/Secondary Weapons - Tier ${tierNumber} - Weight: 15.`)
            }
            if (weaponType == "secondary")
            {
                tierJson.pmcUSEC.equipment.Holster[weaponId] = 5
                tierJson.pmcBEAR.equipment.Holster[weaponId] = 5
                tierJson.scav.equipment.Holster[weaponId] = 5
                tierJson.boss.equipment.Holster[weaponId] = 5

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

                if (mods.mods[weaponId] == undefined)
                {
                    mods.mods[weaponId] = {};
                }
                if (mods.mods[weaponId][slotName] == undefined)
                {
                    mods.mods[weaponId][slotName] = [];
                }
                if (!mods.mods[weaponId][slotName].includes(slotFilterItem))
                {
                    mods.mods[weaponId][slotName].push(slotFilterItem);
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
                
                if (mods.mods[parentSlotItemID] == undefined)
                {
                    mods.mods[parentSlotItemID] = {};
                }
                if (mods.mods[parentSlotItemID][slotName] == undefined)
                {
                    mods.mods[parentSlotItemID][slotName] = [];
                }
                if (!mods.mods[parentSlotItemID][slotName].includes(slotFilterItem))
                {
                    mods.mods[parentSlotItemID][slotName].push(slotFilterItem)
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