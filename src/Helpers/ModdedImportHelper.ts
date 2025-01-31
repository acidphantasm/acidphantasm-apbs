/* eslint-disable @typescript-eslint/quotes */
import { injectable, inject } from "tsyringe";

import { ItemHelper } from "@spt/helpers/ItemHelper";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ISlot, ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { DatabaseService } from "@spt/services/DatabaseService";
import { ICustomizationItem } from "@spt/models/eft/common/tables/ICustomizationItem";

import { ModConfig } from "../Globals/ModConfig";
import { vanillaItemList, vanillaClothingList } from "../Globals/VanillaItemLists";
import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { TierInformation } from "../Globals/TierInformation";
import { APBSAttachmentChecker } from "../Utils/APBSAttachmentChecker";

@injectable()
export class ModdedImportHelper
{
    private blacklist: any[];
    private attachmentBlacklist: any[];
    private clothingBlacklist: any[];
    private modScope000Whitelist: string[] = [];
    private itemShouldNotGetModdedChildrenAttachments: string[] = [];

    constructor(
        @inject("IDatabaseTables") protected tables: IDatabaseTables,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("TierInformation") protected tierInformation: TierInformation,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("APBSAttachmentChecker") protected apbsAttachmentChecker: APBSAttachmentChecker,
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
            "66d98233302686954b0c6f81",
            "66d9f1abb16d9aacf5068468",
            "56e33634d2720bd8058b456b", //backpacks
            "5e4abc6786f77406812bd572",
            "5e997f0b86f7741ac73993e2",
            "61b9e1aaef9a1b5d6a79899a",
            "61c18db6dfd64163ea78fbb4", //headwear
            "66bdc28a0b603c26902b2011",
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
            "5c110624d174af029e69734c", // NVG/Thermals
            "5d1b5e94d7ad1a2b865a96b0",
            "6478641c19d732620e045e17",
            "5a1eaa87fcdbcb001865f75e",
            "609bab8b455afd752b2e6138",
            "63fc44e2429a8a166c7f61e6",
            "5a1ead28fcdbcb001912fa9f",
            "63fc449f5bd61c6cf3784a88",
            "5b3b6dc75acfc47a8773fb1e",
            "5c11046cd174af02a012e42b",
            "5a7c74b3e899ef0014332c29",
            "544a3f024bdc2d1d388b4568", // Bugged optics
            "544a3d0a4bdc2d1b388b4567",
            "5aa66a9be5b5b0214e506e89", // 34mm optic mounts
            "5aa66be6e5b5b0214e506e97",
            "5aa66c72e5b5b00016327c93",
            "5c86592b2e2216000e69e77c",
            "61713cc4d8e3106d9806c109",
            "62811f461d5df4475f46a332",
            "b098f4d751ddc6246acdf160", // B-22 Attachment from EpicRangeTime-Weapons
            "6cec33dd595d9c2d4e531eb7", // Weird split handguard from EpicRangeTime-Weapons
            "7422ca92107da0fc0e26f7d9", // Weird split handguard from EpicRangeTime-Weapons
            "cbba369e0fbb09a1eda36c83", // Weird split handguard from EpicRangeTime-Weapons
            "5648b62b4bdc2d9d488b4585", // General Attachments
            "5c0e2ff6d174af02a1659d4a",
            "5c0e2f5cd174af02a012cfc9",
            "5c6592372e221600133e47d7",
            "544a378f4bdc2d30388b4567",
            "5d1340bdd7ad1a0e8d245aab",
            "671d85439ae8365d69117ba6",
            "670e8eab8c1bb0e5a7075acf",
            "671d8617a3e45c1f5908278c",
            "671d8ac8a3e45c1f59082799",
            "671d8b38b769f0d88c0950f8",
            "671d8b8c0959c721a50ca838",
            "55d5f46a4bdc2d1b198b4567",
            "57ffb0062459777a045af529",
            "5926d2be86f774134d668e4e",
            "5a37cb10c4a282329a73b4e7",
            "5d0a29fed7ad1a002769ad08",
            "57dc334d245977597164366f",
            "618a75c9a3884f56c957ca1b"
        ]

        this.modScope000Whitelist = [
            "5b2388675acfc4771e1be0be",
            "5b3b99475acfc432ff4dcbee",
            "5a37cb10c4a282329a73b4e7",
            "617151c1d92c473c770214ab",
            "57c5ac0824597754771e88a9",
            "6567e7681265c8a131069b0f",
            "67617ec9ea1e82ea5e103054",
            "672e37d19f3e60fb0cbbe568"
        ]

        this.itemShouldNotGetModdedChildrenAttachments = [
            "5a33a8ebc4a282000c5a950d",
            "57adff4f24597737f373b6e6"
        ]
        // This is empty now because Crackbone fixed Artem - but I'm leaving this here for future use
        this.clothingBlacklist = []
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
        if (ModConfig.config.enableModdedClothing && !ModConfig.config.seasonalPmcAppearance) this.buildVanillaClothingList();
        if (ModConfig.config.enableAddingModdedAttachmentsToVanillaWeapons) this.buildModAttachments();
    }

    private buildVanillaWeaponList(): void
    {
        this.apbsLogger.log(Logging.WARN, "Checking & importing Modded Weapons...Support not granted for this feature...")
        
        // Build the joined list for every weapon used in APBS
        const weapons = {};
        vanillaItemList.equipment.LongRange.forEach(element => weapons[element] = this.getItem(element))        
        vanillaItemList.equipment.ShortRange.forEach(element => weapons[element] = this.getItem(element))
        vanillaItemList.equipment.Holster.forEach(element => weapons[element] = this.getItem(element))
        vanillaItemList.equipment.Scabbard.forEach(element => weapons[element] = this.getItem(element))

        // Push this list to the function to filter and import
        this.getModdedItems(weapons as ITemplateItem, BaseClasses.WEAPON, "Weapons");
    }

    private buildVanillaEquipmentList(): void
    {
        this.apbsLogger.log(Logging.WARN, "Checking & importing Modded Equipment...Support not granted for this feature...")
        
        // Build the joined list for every armour type used in APBS
        const armours = {};
        vanillaItemList.equipment.ArmorVest.forEach(element => armours[element] = this.getItem(element))

        const headwear = {};
        vanillaItemList.equipment.Headwear.forEach(element => headwear[element] = this.getItem(element))

        const tacticalVests = {};        
        vanillaItemList.equipment.TacticalVest.forEach(element => tacticalVests[element] = this.getItem(element))
        
        // Push these lists to the function to filter and import
        this.getModdedItems(armours as ITemplateItem, BaseClasses.ARMOR, "Armours");
        this.getModdedItems(headwear as ITemplateItem, BaseClasses.HEADWEAR, "Helmets");
        this.getModdedItems(tacticalVests as ITemplateItem, BaseClasses.VEST, "Vests");
    }

    private buildVanillaClothingList(): void
    {
        this.apbsLogger.log(Logging.WARN, "Checking & importing Modded Clothing...Support not granted for this feature...")

        // Build the joined list for every body & feet type used in APBS
        const body = {};
        vanillaClothingList.appearance.body.forEach(element => body[element] = this.getCustomization(element))

        const feet = {};
        vanillaClothingList.appearance.feet.forEach(element => feet[element] = this.getCustomization(element))

        // Push these lists to the function to filter and import
        this.getModdedClothing(body as ICustomizationItem, "Body");
        this.getModdedClothing(feet as ICustomizationItem, "Feet");
    }

    private getModdedClothing(clothingList: ICustomizationItem, className: string): void
    {
        // Compare SPT database values to APBS values, filter down to the difference (assuming they are either modded, or not in the APBS database).
        const databaseClothing = Object.values(this.databaseService.getTables().templates.customization);
        const allClothing = databaseClothing.filter(x => this.isCustomization(x._id, className));
        const moddedClothing = Object.values(clothingList);
        const allApbsClothing = moddedClothing.filter(x => this.isCustomization(x._id, className));

        let clothingToBeImported = allClothing.filter(x => !allApbsClothing.includes(x));

        // Filter out blacklisted items
        for (const item of clothingToBeImported)
        {
            if (this.clothingBlacklist.includes(item._id)) clothingToBeImported = clothingToBeImported.filter(id => id._id != item._id)
        }

        // Push clothing to APBS database
        if (clothingToBeImported.length > 0)
        {
            this.apbsLogger.log(Logging.WARN, `Imported ${clothingToBeImported.length} Modded ${className}...`)
            this.pushClothing(clothingToBeImported);
        }
    }

    private pushClothing(clothingList: ICustomizationItem[]): void
    {
        // Loop each tier to add clothing to every tier
        for (const object in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[object].tier
            const tierJson = this.apbsEquipmentGetter.getAppearanceJson(tierNumber, true);

            // Skip tiers based on configuration
            if (tierNumber < ModConfig.config.initalTierAppearance) continue;

            // Add each item from the clothing list to each tier JSON - this completes the import
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
        // Compare SPT database values to APBS values, filter down to the difference (assuming they are either modded, or not in the APBS database).
        const items = Object.values(this.tables.templates.items);
        const allItems = items.filter(x => this.itemHelper.isOfBaseclass(x._id, baseClass));
        const tieredItems = Object.values(equipmentList);
        const allTieredItems = tieredItems.filter(x => this.itemHelper.isOfBaseclass(x._id, baseClass));

        let itemsToBeImported = allItems.filter(x => !allTieredItems.includes(x));
        
        // Filter out blacklisted items
        for (const item of itemsToBeImported)
        {
            if (this.blacklist.includes(item._id)) itemsToBeImported = itemsToBeImported.filter(id => id._id != item._id)
        }

        // Push items to APBS database depending on if they are weapons or equipment
        if (itemsToBeImported.length > 0)
        {
            this.apbsLogger.log(Logging.WARN, `Imported ${itemsToBeImported.length} Modded ${className}...`)
            if (baseClass == BaseClasses.WEAPON) this.getSetModdedWeaponDetails(itemsToBeImported);
            if (baseClass != BaseClasses.WEAPON) this.getSetModdedEquipmentDetails(itemsToBeImported);
        }
    }

    private getSetModdedWeaponDetails(weaponPool: ITemplateItem[]): void
    {
        // Loop each weapon in the pool of weapons to be imported - push them individually
        for (const weapon in weaponPool)
        {
            const weaponParent = weaponPool[weapon]._parent;
            const weaponId = weaponPool[weapon]._id;
            const weaponSlots = weaponPool[weapon]?._props?.Slots;
            const weaponType = weaponPool[weapon]?._props?.weapUseType;

            // Push Weapon details to relevant pools
            this.pushCalibersToAmmoPools(weaponId)
            this.pushWeaponToTiers(weaponId, weaponType, weaponParent);
            this.pushItemAndPrimaryMods(weaponId, weaponSlots);
        }
    }

    private getSetModdedEquipmentDetails(equipmentPool: ITemplateItem[]): void
    {
        // Loop each equipment in the pool of equipment to be imported - push them individually
        for (const equipment in equipmentPool)
        {
            const equipmentParent = equipmentPool[equipment]._parent;
            const equipmentId = equipmentPool[equipment]._id;
            const equipmentSlots = equipmentPool[equipment]?._props?.Slots;
            const equipmentSlotsLength = equipmentPool[equipment]?._props?.Slots.length;
            const gridLength = equipmentPool[equipment]?._props?.Grids.length;
            let equipmentSlot: string;

            // Set equipmentSlot string to the proper value - this is only done to separate TacticalVests & ArmouredRigs
            if (equipmentParent == "5448e5284bdc2dcb718b4567" && (equipmentSlots.length == 0 || equipmentSlots == undefined)) equipmentSlot = "TacticalVest"
            if (equipmentParent == "5448e5284bdc2dcb718b4567" && equipmentSlots.length >= 1) equipmentSlot = "ArmouredRig"
            if (equipmentParent == "5448e54d4bdc2dcc718b4568") equipmentSlot = "ArmorVest"
            if (equipmentParent == "5a341c4086f77401f2541505") equipmentSlot = "Headwear"

            // Push Equipment details to relevant pools
            this.pushEquipmentToTiers(equipmentId, equipmentSlot, gridLength, equipmentSlotsLength);
            this.pushItemAndPrimaryMods(equipmentId, equipmentSlots);
        }
    }

    private pushWeaponToTiers(weaponId: string, weaponType: string, parentClass: string): void
    {
        // Define weights to use, and which range they go to (for logging).
        let range = "";
        const pmcWeight = ModConfig.config.pmcWeaponWeights <= 0 ? 1 : ModConfig.config.pmcWeaponWeights;
        const scavWeight = ModConfig.config.scavWeaponWeights <= 0 ? 1 : ModConfig.config.scavWeaponWeights;
        const defaultWeight = ModConfig.config.followerWeaponWeights <= 0 ? 1 : ModConfig.config.followerWeaponWeights;

        // Loop over each tier to easily use the proper tierJSON
        for (const object in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[object].tier
            const tierJson = this.apbsEquipmentGetter.getTierJson(tierNumber, true);

            // Skip tiers based on configuration
            if (tierNumber < ModConfig.config.initalTierAppearance) continue;

            // Use multiple variable switch to set specific weapon "types" to the correct pool
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
                    tierJson.pmcUSEC.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                    tierJson.pmcUSEC.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                    tierJson.pmcBEAR.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                    tierJson.pmcBEAR.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = pmcWeight
                    tierJson.scav.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = scavWeight
                    tierJson.scav.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = scavWeight
                    tierJson.default.equipment.FirstPrimaryWeapon.ShortRange[weaponId] = defaultWeight
                    tierJson.default.equipment.SecondPrimaryWeapon.ShortRange[weaponId] = defaultWeight
                    range = "Short range"
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
        // Loop over each tier to easily use the proper tierJSON
        for (const object in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[object].tier
            const tierJson = this.apbsEquipmentGetter.getTierJson(tierNumber, true);

            // Skip tiers based on configuration
            if (tierNumber < ModConfig.config.initalTierAppearance) continue;

            // Set weights based on witch slot they are in. Check TacticalVests for belts (low grid count) and check Helmets to see if armoured or decorative
            let weight;
            if (equipmentSlot == "TacticalVest" && gridLength > 10) weight = 10;
            if (equipmentSlot == "TacticalVest" && gridLength <= 10) weight = 1;
            if (equipmentSlot == "ArmouredRig") weight = 7;
            if (equipmentSlot == "ArmorVest") weight = 10;
            if (equipmentSlot == "Headwear" && equipmentSlotsLength > 0) weight = 6;
            if (equipmentSlot == "Headwear" && equipmentSlotsLength == 0) weight = 1;

            // Add the equipment to the proper slot and correct weight
            tierJson.pmcUSEC.equipment[equipmentSlot][itemID] = weight
            tierJson.pmcBEAR.equipment[equipmentSlot][itemID] = weight
            tierJson.scav.equipment[equipmentSlot][itemID] = 1
            tierJson.default.equipment[equipmentSlot][itemID] = weight
        }
        this.apbsLogger.log(Logging.DEBUG, `[Tier${ModConfig.config.initalTierAppearance}+] Added ${itemID} to ${equipmentSlot}.`)
    }

    private pushItemAndPrimaryMods(itemID: string, itemSlots: ISlot[]): void
    {
        // Loop over all slots of the item
        for (const slot in itemSlots)
        {
            const slotName = itemSlots[slot]?._name;
            let slotFilter = itemSlots[slot]?._props?.filters[0]?.Filter

            // If a slot's filters contain the canted sight mount, remove all other items from the filter - this ensures ONLY the canted sight is added            
            if (slotFilter.includes("5649a2464bdc2d91118b45a8"))
            {
                slotFilter = [ "5649a2464bdc2d91118b45a8" ];
            }

            // Loop over all items in the filter for the slot
            for (const item in slotFilter)
            {
                const slotFilterItem = slotFilter[item];
                
                // Check if the item is actually a valid item, or is on the blacklist
                // WTT puts itemIDs in their mods that don't exist in the database for some reason (probably unreleased mods)
                const itemExistsCheck = this.itemHelper.getItem(slotFilterItem)
                if (this.attachmentBlacklist.includes(slotFilterItem) || !itemExistsCheck[0]) continue;

                const isVanillaParent = this.apbsAttachmentChecker.isVanillaItem(itemID);
                const isVanillaItem = this.apbsAttachmentChecker.isVanillaItem(slotFilterItem);

                // Check if the itemID already exists in the tierJsons, if not - create it in them all.
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

                // Check if the itemID's slot already exists in the tierJsons, if not - create it in them all.
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

                // Check if the itemID's slot doesn't already contain the item to import, if it doesn't - add it
                if (!this.tierInformation.tier1mods[itemID][slotName].includes(slotFilterItem))
                {
                    // Additionally, check if the parent mod & child mod are vanilla as well as checking the config safeguard
                    if (isVanillaParent && isVanillaItem && ModConfig.config.enableSafeGuard) continue;

                    this.tierInformation.tier1mods[itemID][slotName].push(slotFilterItem);
                    this.tierInformation.tier2mods[itemID][slotName].push(slotFilterItem);
                    this.tierInformation.tier3mods[itemID][slotName].push(slotFilterItem);
                    this.tierInformation.tier4mods[itemID][slotName].push(slotFilterItem);
                    this.tierInformation.tier5mods[itemID][slotName].push(slotFilterItem);
                    this.tierInformation.tier6mods[itemID][slotName].push(slotFilterItem);
                    this.tierInformation.tier7mods[itemID][slotName].push(slotFilterItem);

                    // If the item should not receive additional attachments, skip to the next item
                    if (this.itemShouldNotGetModdedChildrenAttachments.includes(slotFilterItem)) continue;
                    
                    // Push any children mods
                    this.recursivePushChildrenMods(slotFilterItem);
                }
            }
        }
    }

    public recursivePushChildrenMods(parentSlotFilterItem: string, standaloneAttachment: boolean = false): void
    {
        const parentSlotItemData = this.getItem(parentSlotFilterItem);
        const parentSlotItemID = parentSlotItemData?._id;
        const parentSlotSlots = parentSlotItemData?._props?.Slots;

        // Exit if there are no children
        if (parentSlotSlots == undefined || parentSlotSlots.length == 0) return;

        // Loop over all slots of the parent
        for (const slot in parentSlotSlots)
        {
            const slotName = parentSlotSlots[slot]?._name;
            let slotFilter = parentSlotSlots[slot]?._props?.filters[0]?.Filter;

            // If a slot's filters contain the canted sight mount, remove all other items from the filter - this ensures ONLY the canted sight is added            
            if (slotFilter.includes("5649a2464bdc2d91118b45a8")) slotFilter = [ "5649a2464bdc2d91118b45a8" ];

            // If the source of this method call is the Standalone Attachment importer, and the slot is for front or rear sights. Skip that shit.
            if (standaloneAttachment && slotName.includes("mod_sight")) continue;

            // Loop over each item in the slot's filters
            for (const item in slotFilter)
            {
                const slotFilterItem = parentSlotSlots[slot]?._props?.filters[0]?.Filter[item];

                // If the mod_scope_000 slot is looping items, skip any items not on the whitelist because they're dumb as shit and ruin generation
                if (slotName == "mod_scope_000" && !this.modScope000Whitelist.includes(slotFilterItem)) continue;

                // Check if the item is actually a valid item, or is on the blacklist
                // WTT puts itemIDs in their mods that don't exist in the database for some reason (probably unreleased mods)
                const itemExistsCheck = this.itemHelper.getItem(slotFilterItem)
                if (this.attachmentBlacklist.includes(slotFilterItem) || !itemExistsCheck[0]) continue;

                // Check if the parent mod & the child mod are vanilla or modded
                // This allows preventing mods adding vanilla mods to vanilla weapons
                const isVanillaParent = this.apbsAttachmentChecker.isVanillaItem(parentSlotItemID);
                const isVanillaItem = this.apbsAttachmentChecker.isVanillaItem(slotFilterItem);

                // Check if the PARENT itemID already exists in the tierJsons, if not - create it in all tierJSONs.
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

                // Check if the PARENT itemID already exists with the slotName, if not - create it in all tierJSONs
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

                // Check if the PARENT itemID's slot doesn't already contain the item to import
                if (!this.tierInformation.tier1mods[parentSlotItemID][slotName].includes(slotFilterItem))
                {
                    // Additionally, check if the parent mod & child mod are vanilla as well as checking the config safeguard
                    if (isVanillaParent && isVanillaItem && ModConfig.config.enableSafeGuard) continue;

                    // Finally push the child mod to the proper tierJSONs
                    this.tierInformation.tier1mods[parentSlotItemID][slotName].push(slotFilterItem)
                    this.tierInformation.tier2mods[parentSlotItemID][slotName].push(slotFilterItem)
                    this.tierInformation.tier3mods[parentSlotItemID][slotName].push(slotFilterItem)
                    this.tierInformation.tier4mods[parentSlotItemID][slotName].push(slotFilterItem)
                    this.tierInformation.tier5mods[parentSlotItemID][slotName].push(slotFilterItem)
                    this.tierInformation.tier6mods[parentSlotItemID][slotName].push(slotFilterItem)
                    this.tierInformation.tier7mods[parentSlotItemID][slotName].push(slotFilterItem)

                    // Push any children mods
                    this.recursivePushChildrenMods(slotFilterItem);
                }
            }
        }
    }

    private pushCalibersToAmmoPools(itemID: string): void
    {
        const itemDetails = this.itemHelper.getItem(itemID)
        const itemCaliber = itemDetails[1]?._props?.ammoCaliber

        // Check if the Caliber exists on tierJSON or is valid
        if (!Object.keys(this.tierInformation.tier1ammo.scavAmmo).includes(itemCaliber) && itemCaliber != undefined)
        {
            const chamberFilter = itemDetails[1]?._props?.Chambers[0]?._props?.filters[0]?.Filter

            // If the chamber is valid and has items, add them to the tierJSONs
            if (chamberFilter && chamberFilter.length > 0)
            {
                for (const botPool in this.tierInformation.tier1ammo)
                {
                    // Since the Caliber doesn't exist, create them empty to prevent undefined error below
                    this.tierInformation.tier1ammo[botPool][itemCaliber] = {};
                    this.tierInformation.tier2ammo[botPool][itemCaliber] = {};
                    this.tierInformation.tier3ammo[botPool][itemCaliber] = {};
                    this.tierInformation.tier4ammo[botPool][itemCaliber] = {};
                    this.tierInformation.tier5ammo[botPool][itemCaliber] = {};
                    this.tierInformation.tier6ammo[botPool][itemCaliber] = {};
                    this.tierInformation.tier7ammo[botPool][itemCaliber] = {};

                    // Push each item in the filter to the tierJSON
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

    private pushStandaloneAttachmentsToWeapons(itemID: string, slotName: string, slotItem: string): void
    {
        // Check if the item is actually a valid item, or is on the blacklist
        // WTT puts itemIDs in their mods that don't exist in the database for some reason (probably unreleased mods)
        const itemExistsCheck = this.itemHelper.getItem(slotItem)
        if (this.attachmentBlacklist.includes(slotItem) || !itemExistsCheck[0] || !this.apbsAttachmentChecker.modAttachmentList.includes(slotItem)) return;

        // Check if the itemID's slot already exists in the tierJsons, if not - create it in them all.
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

        // Check if the itemID's slot doesn't already contain the item to import, if it doesn't - add it
        if (!this.tierInformation.tier1mods[itemID][slotName].includes(slotItem))
        {
            this.tierInformation.tier1mods[itemID][slotName].push(slotItem);
            this.tierInformation.tier2mods[itemID][slotName].push(slotItem);
            this.tierInformation.tier3mods[itemID][slotName].push(slotItem);
            this.tierInformation.tier4mods[itemID][slotName].push(slotItem);
            this.tierInformation.tier5mods[itemID][slotName].push(slotItem);
            this.tierInformation.tier6mods[itemID][slotName].push(slotItem);
            this.tierInformation.tier7mods[itemID][slotName].push(slotItem);

            // Push any children mods
            this.recursivePushChildrenMods(slotItem, true);
        }
    }

    public buildModAttachments(): void
    {
        this.apbsLogger.log(Logging.WARN, `Checking & importing Modded Attachments...Support not granted for this feature...`)

        const items = this.databaseService.getTables().templates.items;
        const itemValues = Object.values(items);
        const weapons = itemValues.filter(x => this.itemHelper.isOfBaseclass(x._id, BaseClasses.WEAPON))
        const alreadyPushedIDs: string[] = []

        for (const weapon in weapons)
        {
            const weaponID = weapons[weapon]._id;
            const weaponSlots = weapons[weapon]?._props?.Slots;

            // Exit early if the weaponID is blacklisted
            if (this.blacklist.includes(weaponID)) continue;

            for (const slot in weaponSlots)
            {
                const slotName = weaponSlots[slot]?._name;
                const slotFilter = weaponSlots[slot]?._props?.filters[0]?.Filter

                // Skip any front/rear sights cause it'll create shitty generation
                if (slotName.includes("mod_sight")) continue;

                // If filter has items
                if (slotFilter.length > 0)
                {
                    // Loop over all items in the filter for the slot
                    for (const item in slotFilter)
                    {
                        const slotFilterItem = slotFilter[item];
                        const itemExistsCheck = this.itemHelper.getItem(slotFilterItem)

                        // Check is slot is a magazine, if it is, validate _max_count exists. If it doesn't - skip that incorrectly built magazine
                        if (slotName == "mod_magazine" && itemExistsCheck[1]._props.Cartridges[0]._max_count == undefined)
                        {
                            this.apbsLogger.log(Logging.DEBUG, `Invalid mod magazine. Skipping. Weapon: ${weaponID} | Slot: ${slotName} | Attachment: ${slotFilterItem}`)
                            continue;
                        }

                        // Skip item if it is blacklisted, doesn't exist, isn't in the mod list, is already pushed, is or vanilla
                        if (this.attachmentBlacklist.includes(slotFilterItem) || !itemExistsCheck[0] || !this.apbsAttachmentChecker.modAttachmentList.includes(slotFilterItem) || alreadyPushedIDs.includes(slotFilterItem) || this.apbsAttachmentChecker.isVanillaItem(slotFilterItem)) continue;
                        
                        // Weapon is missing, skip it
                        if (this.tierInformation.tier4mods[weaponID] == undefined) continue;

                        // Slot is missing from weapon, add it
                        if (this.tierInformation.tier4mods[weaponID][slotName] == undefined) 
                        {
                            this.tierInformation.tier4mods[weaponID][slotName] = [];
                        }

                        // Push modded attachments that are missing
                        if (!this.tierInformation.tier4mods[weaponID][slotName].includes(slotFilterItem))
                        {
                            this.apbsLogger.log(Logging.DEBUG, `Found mod attachment to import. Weapon: ${weaponID} | Slot: ${slotName} | Attachment: ${slotFilterItem}`)
                            alreadyPushedIDs.push(slotFilterItem)
                            this.pushStandaloneAttachmentsToWeapons(weaponID, slotName, slotFilterItem)
                        }
                    }
                }
            }
        }

        this.apbsLogger.log(Logging.WARN, `Imported ${alreadyPushedIDs.length} Modded Attachments`)
    }
}