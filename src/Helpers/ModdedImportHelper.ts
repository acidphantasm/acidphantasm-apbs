/* eslint-disable @typescript-eslint/quotes */
import { injectable, inject } from "tsyringe";

import { ItemHelper } from "@spt/helpers/ItemHelper";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ITemplateItem, ItemType } from "@spt/models/eft/common/tables/ITemplateItem";
import { DatabaseService } from "@spt/services/DatabaseService";
import { ICustomizationItem } from "@spt/models/eft/common/tables/ICustomizationItem";

import { ModConfig } from "../Globals/ModConfig";
import { vanillaItemList, vanillaClothingList } from "../Globals/VanillaItemLists";
import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { TierInformation } from "../Globals/TierInformation";

@injectable()
export class ModdedImportHelper
{
    private blacklist: any[];
    private attachmentBlacklist: any[];
    private clothingBlacklist: any[];

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
            "5b3b713c5acfc4330140bd8d",
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
            "544a3d0a4bdc2d1b388b4567",
            "5648b62b4bdc2d9d488b4585",
            "5c0e2ff6d174af02a1659d4a",
            "5c0e2f5cd174af02a012cfc9"
        ]

        this.clothingBlacklist = [
            "668bc5cd834c88e06b08b645", // All of this is Artem hands, because they are being configured as Body instead...Crackboooonnneee!!
            "668bc5cd834c88e06b08b64a",
            "668bc5cd834c88e06b08b64d",
            "668bc5cd834c88e06b08b650",
            "668bc5cd834c88e06b08b652",
            "668bc5cd834c88e06b08b655",
            "668bc5cd834c88e06b08b658",
            "668bc5cd834c88e06b08b65b",
            "668bc5cd834c88e06b08b65e",
            "668bc5cd834c88e06b08b662",
            "668bc5cd834c88e06b08b665",
            "668bc5cd834c88e06b08b668",
            "668bc5cd834c88e06b08b66b",
            "668bc5cd834c88e06b08b66e",
            "668bc5cd834c88e06b08b671",
            "668bc5cd834c88e06b08b674",
            "668bc5cd834c88e06b08b677",
            "668bc5cd834c88e06b08b67a",
            "668bc5cd834c88e06b08b67d"
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
        if (ModConfig.config.enableModdedClothing) this.buildVanillaClothingList();
    }

    private buildVanillaWeaponList(): void
    {
        this.apbsLogger.log(Logging.WARN, "Checking & importing Modded Weapons...Support not granted for this feature...")
        
        const weapons: ITemplateItem = {};
        vanillaItemList.equipment.LongRange.forEach(element => 
        {
            weapons[element] = this.getItem(element)
        })
        
        vanillaItemList.equipment.ShortRange.forEach(element => 
        {
            weapons[element] = this.getItem(element);
        })

        vanillaItemList.equipment.Holster.forEach(element => 
        {
            weapons[element] = this.getItem(element);
        })

        vanillaItemList.equipment.Scabbard.forEach(element => 
        {
            weapons[element] = this.getItem(element);
        })

        this.getModdedItems(weapons, BaseClasses.WEAPON, "Weapons");
    }

    private buildVanillaEquipmentList(): void
    {
        this.apbsLogger.log(Logging.WARN, "Checking & importing Modded Equipment...Support not granted for this feature...")

        const armours: ITemplateItem = {};
        vanillaItemList.equipment.ArmorVest.forEach(element => 
        {
            armours[element] = this.getItem(element);
        })
        this.getModdedItems(armours, BaseClasses.ARMOR, "Armours");

        const headwear: ITemplateItem = {};
        vanillaItemList.equipment.Headwear.forEach(element => 
        {
            headwear[element] = this.getItem(element);
        })
        this.getModdedItems(headwear, BaseClasses.HEADWEAR, "Helmets");

        const tacticalVests: ITemplateItem = {};
        
        vanillaItemList.equipment.TacticalVest.forEach(element => 
        {
            tacticalVests[element] = this.getItem(element);
        })
        this.getModdedItems(tacticalVests, BaseClasses.VEST, "Vests");
    }

    private buildVanillaClothingList(): void
    {
        this.apbsLogger.log(Logging.WARN, "Checking & importing Modded Clothing...Support not granted for this feature...")

        const body: ICustomizationItem = {};
        vanillaClothingList.appearance.body.forEach(element => 
        {
            body[element] = this.getCustomization(element);
        })
        this.getModdedClothing(body, "Body");

        const feet: ICustomizationItem = {};
        vanillaClothingList.appearance.feet.forEach(element => 
        {
            feet[element] = this.getCustomization(element);
        })
        this.getModdedClothing(feet, "Feet");
    }

    private getModdedClothing(clothingList: ICustomizationItem, className: string): void
    {
        const clothing = Object.values(this.databaseService.getTables().templates.customization);
        const allItems = clothing.filter(x => this.isCustomization(x._id, className));
        
        const apbsClothing = Object.values(clothingList);
        const allApbsClothing = apbsClothing.filter(x => this.isCustomization(x._id, className));
        const difference:any = allItems.filter(x => !allApbsClothing.includes(x));

        let moddedItems = difference;
        
        const blacklist = this.clothingBlacklist;
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
            this.apbsLogger.log(Logging.WARN, `Importing ${moddedItems.length} Modded ${className}...`)
            this.pushClothing(moddedItems);
        }
    }

    private pushClothing(clothingList: ICustomizationItem): void
    {
        for (const object in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[object].tier
            const tierJson = this.apbsEquipmentGetter.getAppearanceJson(tierNumber, true);

            if (tierNumber < ModConfig.config.initalTierAppearance)
            {
                continue;
            }
            for (const item in clothingList)
            {
                if (clothingList[item]._props.Side.includes("Bear"))
                {
                    if (clothingList[item]._props.BodyPart == "Feet") tierJson.pmcBEAR.appearance.feet[clothingList[item]._id] = 1
                    if (clothingList[item]._props.BodyPart == "Body") tierJson.pmcBEAR.appearance.body[clothingList[item]._id] = 1
                }
                if (clothingList[item]._props.Side.includes("Usec"))
                {
                    if (clothingList[item]._props.BodyPart == "Feet") tierJson.pmcUSEC.appearance.feet[clothingList[item]._id] = 1
                    if (clothingList[item]._props.BodyPart == "Body") tierJson.pmcUSEC.appearance.body[clothingList[item]._id] = 1
                }
            }
        }        
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
            this.apbsLogger.log(Logging.WARN, `Importing ${moddedItems.length} Modded ${className}...`)
            if (baseClass == BaseClasses.WEAPON) this.getSetModdedWeaponDetails(moddedItems);
            if (baseClass != BaseClasses.WEAPON) this.getSetModdedEquipmentDetails(moddedItems);
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

            this.pushWeaponToTiers(weaponId, weaponType, weaponParent);
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

    private pushWeaponToTiers(weaponId: string, weaponType: string, parentClass: string): void
    {
        let range = "";
        const pmcWeight = ModConfig.config.pmcWeaponWeights <= 0 ? 1 : ModConfig.config.pmcWeaponWeights;
        const scavWeight = ModConfig.config.scavWeaponWeights <= 0 ? 1 : ModConfig.config.scavWeaponWeights;
        const defaultWeight = ModConfig.config.followerWeaponWeights <= 0 ? 1 : ModConfig.config.followerWeaponWeights;

        for (const object in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[object].tier
            const tierJson = this.apbsEquipmentGetter.getTierJson(tierNumber, true);

            if (tierNumber < ModConfig.config.initalTierAppearance)
            {
                continue;
            }
            switch (true) 
            {
                case parentClass == "5447b5fc4bdc2d87278b4567" && weaponType == "primary":
                    tierJson.pmcUSEC.equipment.FirstPrimaryWeapon.LongRange[weaponId] = pmcWeight
                    tierJson.pmcUSEC.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                    tierJson.pmcUSEC.equipment.SecondPrimaryWeapon.LongRange[weaponId] = pmcWeight
                    tierJson.pmcUSEC.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                    tierJson.pmcBEAR.equipment.FirstPrimaryWeapon.LongRange[weaponId] = pmcWeight
                    tierJson.pmcBEAR.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                    tierJson.pmcBEAR.equipment.SecondPrimaryWeapon.LongRange[weaponId] = pmcWeight
                    tierJson.pmcBEAR.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                    tierJson.scav.equipment.FirstPrimaryWeapon.LongRange[weaponId] = scavWeight
                    tierJson.scav.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = scavWeight
                    tierJson.scav.equipment.SecondPrimaryWeapon.LongRange[weaponId] = scavWeight
                    tierJson.scav.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = scavWeight
                    tierJson.default.equipment.FirstPrimaryWeapon.LongRange[weaponId] = defaultWeight
                    tierJson.default.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = defaultWeight
                    tierJson.default.equipment.SecondPrimaryWeapon.LongRange[weaponId] = defaultWeight
                    tierJson.default.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = defaultWeight
                    range = "Long & Short range";
                    continue;
                case parentClass == "5447b6254bdc2dc3278b4568" && weaponType == "primary":
                case parentClass == "5447b6194bdc2d67278b4567" && weaponType == "primary":
                    tierJson.pmcUSEC.equipment.FirstPrimaryWeapon.LongRange[weaponId] = pmcWeight
                    tierJson.pmcUSEC.equipment.SecondPrimaryWeapon.LongRange[weaponId] = pmcWeight
                    tierJson.pmcBEAR.equipment.FirstPrimaryWeapon.LongRange[weaponId] = pmcWeight
                    tierJson.pmcBEAR.equipment.SecondPrimaryWeapon.LongRange[weaponId] = pmcWeight
                    tierJson.scav.equipment.FirstPrimaryWeapon.LongRange[weaponId] = scavWeight
                    tierJson.scav.equipment.SecondPrimaryWeapon.LongRange[weaponId] = scavWeight
                    tierJson.default.equipment.FirstPrimaryWeapon.LongRange[weaponId] = defaultWeight
                    tierJson.default.equipment.SecondPrimaryWeapon.LongRange[weaponId] = defaultWeight
                    range = "Long range"
                    continue;                
                case parentClass == "5447b5f14bdc2d61278b4567" && weaponType == "primary":
                case parentClass == "5447bed64bdc2d97278b4568" && weaponType == "primary":
                case parentClass == "5447b5e04bdc2d62278b4567" && weaponType == "primary":
                case parentClass == "5447b5cf4bdc2d65278b4567" && weaponType == "primary":
                case parentClass == "617f1ef5e8b54b0998387733" && weaponType == "primary":
                case parentClass == "5447b6094bdc2dc3278b4567" && weaponType == "primary":
                    if (weaponType == "primary")
                    {
                        tierJson.pmcUSEC.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                        tierJson.pmcUSEC.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                        tierJson.pmcBEAR.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                        tierJson.pmcBEAR.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                        tierJson.scav.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = scavWeight
                        tierJson.scav.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = scavWeight
                        tierJson.default.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = defaultWeight
                        tierJson.default.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = defaultWeight
                        range = "Short range"
                    }
                    continue;
                case parentClass == "5447b5cf4bdc2d65278b4567" && weaponType == "secondary":
                case parentClass == "617f1ef5e8b54b0998387733" && weaponType == "secondary":
                case parentClass == "5447b6094bdc2dc3278b4567" && weaponType == "secondary":
                    tierJson.pmcUSEC.equipment.Holster[weaponId] = 5
                    tierJson.pmcBEAR.equipment.Holster[weaponId] = 5
                    tierJson.scav.equipment.Holster[weaponId] = 1
                    tierJson.default.equipment.Holster[weaponId] = 3
                    range = "Holster"
                    continue;
                default:
                    if (weaponType == "primary")
                    {
                        tierJson.pmcUSEC.equipment.FirstPrimaryWeapon.LongRange[weaponId] = pmcWeight
                        tierJson.pmcUSEC.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                        tierJson.pmcUSEC.equipment.SecondPrimaryWeapon.LongRange[weaponId] = pmcWeight
                        tierJson.pmcUSEC.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                        tierJson.pmcBEAR.equipment.FirstPrimaryWeapon.LongRange[weaponId] = pmcWeight
                        tierJson.pmcBEAR.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                        tierJson.pmcBEAR.equipment.SecondPrimaryWeapon.LongRange[weaponId] = pmcWeight
                        tierJson.pmcBEAR.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                        tierJson.scav.equipment.FirstPrimaryWeapon.LongRange[weaponId] = scavWeight
                        tierJson.scav.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = scavWeight
                        tierJson.scav.equipment.SecondPrimaryWeapon.LongRange[weaponId] = scavWeight
                        tierJson.scav.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = scavWeight
                        tierJson.default.equipment.SecondPrimaryWeapon.LongRange[weaponId] = defaultWeight
                        tierJson.default.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = defaultWeight
                        tierJson.default.equipment.FirstPrimaryWeapon.LongRange[weaponId] = defaultWeight
                        tierJson.default.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = defaultWeight
                        range = "Long & Short range"
                    }
                    if (weaponType == "secondary")
                    {
                        tierJson.pmcUSEC.equipment.Holster[weaponId] = 5
                        tierJson.pmcBEAR.equipment.Holster[weaponId] = 5
                        tierJson.scav.equipment.Holster[weaponId] = 1
                        tierJson.default.equipment.Holster[weaponId] = 3
                        range = "Holster"
                    }
                    continue;
            }
        }
        this.apbsLogger.log(Logging.DEBUG, `[Tier${ModConfig.config.initalTierAppearance}+] Added ${weaponId} to ${range} weapons.`)
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
        }
        this.apbsLogger.log(Logging.DEBUG, `[Tier${ModConfig.config.initalTierAppearance}+] Added ${itemID} to ${equipmentSlot}.`)
    }

    private pushItemAndPrimaryMods(itemID, itemSlots): void
    {
        this.pushCalibersToAmmoPools(itemID);

        for (const slot in itemSlots)
        {
            const slotName = itemSlots[slot]?._name;
            for (const item in itemSlots[slot]?._props?.filters[0]?.Filter)
            {
                const slotFilterItem = itemSlots[slot]?._props?.filters[0]?.Filter[item];

                const itemExistsCheck = this.itemHelper.getItem(slotFilterItem)
                if (this.attachmentBlacklist.includes(slotFilterItem) || !itemExistsCheck[0]) 
                {
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

        if (parentSlotSlots == undefined || parentSlotSlots.length == 0) return;

        for (const slot in parentSlotSlots)
        {
            const slotName = parentSlotSlots[slot]?._name;

            if (parentSlotSlots[slot]?._props?.filters[0]?.Filter.includes("5649a2464bdc2d91118b45a8"))
            {
                parentSlotSlots[slot]._props.filters[0].Filter = [ "5649a2464bdc2d91118b45a8" ];
            }

            for (const item in parentSlotSlots[slot]?._props?.filters[0]?.Filter)
            {
                const slotFilterItem = parentSlotSlots[slot]?._props?.filters[0]?.Filter[item];
                let slotExists = true;
                const itemExistsCheck = this.itemHelper.getItem(slotFilterItem)
                if (this.attachmentBlacklist.includes(slotFilterItem) || !itemExistsCheck[0]) 
                {
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
                    slotExists = false;
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
                    if (slotExists) continue;
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

    private pushCalibersToAmmoPools(itemID: string): void
    {
        const itemDetails = this.itemHelper.getItem(itemID)
        const itemCaliber = itemDetails[1]?._props?.ammoCaliber

        if (!Object.keys(this.tierInformation.tier1ammo.scavAmmo).includes(itemCaliber) && itemCaliber != undefined)
        {
            const chamberFilter = itemDetails[1]?._props?.Chambers[0]?._props?.filters[0]?.Filter
            if (chamberFilter && chamberFilter.length > 0)
            {
                for (const botPool in this.tierInformation.tier1ammo)
                {
                    this.tierInformation.tier1ammo[botPool][itemCaliber] = {};
                    this.tierInformation.tier2ammo[botPool][itemCaliber] = {};
                    this.tierInformation.tier3ammo[botPool][itemCaliber] = {};
                    this.tierInformation.tier4ammo[botPool][itemCaliber] = {};
                    this.tierInformation.tier5ammo[botPool][itemCaliber] = {};
                    this.tierInformation.tier6ammo[botPool][itemCaliber] = {};
                    this.tierInformation.tier7ammo[botPool][itemCaliber] = {};
                    for (const item in chamberFilter)
                    {
                        const ammo = chamberFilter[item]
                        this.tierInformation.tier1ammo[botPool][itemCaliber][ammo] = 1;
                        this.tierInformation.tier2ammo[botPool][itemCaliber][ammo] = 1;
                        this.tierInformation.tier3ammo[botPool][itemCaliber][ammo] = 1;
                        this.tierInformation.tier4ammo[botPool][itemCaliber][ammo] = 1;
                        this.tierInformation.tier5ammo[botPool][itemCaliber][ammo] = 1;
                        this.tierInformation.tier6ammo[botPool][itemCaliber][ammo] = 1;
                        this.tierInformation.tier7ammo[botPool][itemCaliber][ammo] = 1;
                    }
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

    private getCustomization(tpl: string): ICustomizationItem
    {
        if (tpl in this.databaseService.getCustomization())
        {
            return this.databaseService.getCustomization()[tpl];
        }

        return undefined;
    }

    private isCustomization(tpl: string, type: string): boolean
    {
        if (tpl in this.databaseService.getCustomization())
        {
            const item = this.databaseService.getCustomization()[tpl];
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
}