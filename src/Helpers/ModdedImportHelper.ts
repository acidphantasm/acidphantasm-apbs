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
    private invalidModAttachments: string[] = [];
    private invalidModEquipment: string[] = [];
    private tier4Optics: string[];
    private foldingModSights: string[];
    private allImportedAttachments: string[];
    private numberOfAttachments: number;

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
            "675ea3d6312c0a5c4e04e317",
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
            "6531119b9afebff7ff0a1769",
            "66c765dac66697e20a35a411" // Armband from guiding light for some reason
        ];

        this.attachmentBlacklist = [ 
            "b098f4d751ddc6246acdf160", // B-22 Attachment from EpicRangeTime-Weapons
            "b2d57758abe9bb9345c58e4a", // 34mm gieselle mount from EpicRangeTime-Weapons
            "67ea8b32e0d7701fc6bfc5bf", // 34mm gieselle mount from EpicRangeTime-Weapons
            "6cec33dd595d9c2d4e531eb7", // Weird split handguard from EpicRangeTime-Weapons
            "7422ca92107da0fc0e26f7d9", // Weird split handguard from EpicRangeTime-Weapons
            "cbba369e0fbb09a1eda36c83", // Weird split handguard from EpicRangeTime-Weapons
            "672e2e75c7c7c5232e513062", // Transparent dust cover from MoxoPixel-TGC
            "672e37d178e24689d6ff50ce", // Range finder from Black-Core
            "5c110624d174af029e69734c", // NVG/Thermals
            "5d1b5e94d7ad1a2b865a96b0",
            "6478641c19d732620e045e17",
            "5a1eaa87fcdbcb001865f75e",
            "609bab8b455afd752b2e6138",
            "63fc44e2429a8a166c7f61e6",
            "5a1ead28fcdbcb001912fa9f",
            "5ae30e795acfc408fb139a0b",
            "63fc449f5bd61c6cf3784a88",
            "5b3b6dc75acfc47a8773fb1e",
            "5c11046cd174af02a012e42b",
            "5a7c74b3e899ef0014332c29",
            "544a3f024bdc2d1d388b4568", // Bugged optics
            "544a3d0a4bdc2d1b388b4567",
            "5cf638cbd7f00c06595bc936",
            "576fd4ec2459777f0b518431",
            "5c82343a2e221644f31c0611",
            "5d0a29ead7ad1a0026013f27",
            "5dfe6104585a0c3e995c7b82",
            "618b9643526131765025ab35",
            "618bab21526131765025ab3f",
            "6171407e50224f204c1da3c5",
            "5aa66a9be5b5b0214e506e89", // 34mm optic mounts
            "5aa66be6e5b5b0214e506e97",
            "5aa66c72e5b5b00016327c93",
            "5c86592b2e2216000e69e77c",
            "61713cc4d8e3106d9806c109",
            "62811f461d5df4475f46a332",
            "6761759e7ee06333f108bf86",
            "676175789dcee773150c6925",
            "5648b62b4bdc2d9d488b4585", // General Attachments
            "5c0e2ff6d174af02a1659d4a",
            "5c0e2f5cd174af02a012cfc9",
            "5c6592372e221600133e47d7",
            "544a378f4bdc2d30388b4567",
            "5d1340bdd7ad1a0e8d245aab",
            "6764139c44b3c96e7b0e2f7b",
            "67641a851b2899700609901a",
            "67641b461c2eb66ade05dba6",
            "676176a162e0497044079f46",
            "67641bec4ad898aa100c1079",
            "628120f210e26c1f344e6558", // AXMC .308 conversion part
            "62811d61578c54356d6d67ea", // AXMC .308 conversion part
            "628120415631d45211793c99", // AXMC .308 conversion part
            "6281214c1d5df4475f46a33a", // AXMC .308 conversion part
            "6281215b4fa03b6b6c35dc6c", // AXMC .308 conversion part
            "628121651d5df4475f46a33c", // AXMC .308 conversion part
            "6761765f1f08ed5e8800b7a6",
            "671d85439ae8365d69117ba6",
            "6241c2c2117ad530666a5108", // airsoft mag
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
            "618a75c9a3884f56c957ca1b",
            "59e5f5a486f7746c530b3ce2",
            "55d481904bdc2d8c2f8b456a",
            "5b1fb3e15acfc4001637f068",
            "564ca9df4bdc2d35148b4569",
            "61a4cda622af7f4f6a3ce617" // Rhino speedloader
        ];

        this.modScope000Whitelist = [
            "5b2388675acfc4771e1be0be",
            "5b3b99475acfc432ff4dcbee",
            "5a37cb10c4a282329a73b4e7",
            "617151c1d92c473c770214ab",
            "57c5ac0824597754771e88a9",
            "6567e7681265c8a131069b0f",
            "67617ec9ea1e82ea5e103054",
            "672e37d19f3e60fb0cbbe568"
        ];

        this.itemShouldNotGetModdedChildrenAttachments = [
            "5a33a8ebc4a282000c5a950d",
            "57adff4f24597737f373b6e6"
        ];

        // Tier4+ Vanilla Optics
        this.tier4Optics = [            
            "5c0517910db83400232ffee5",
            "558022b54bdc2dac148b458d",
            "58491f3324597764bc48fa02",
            "584924ec24597768f12ae244",
            "60a23797a37c940de7062d02",
            "59f9d81586f7744c7506ee62",
            "5b2389515acfc4771e1be0c0",
            "5b3b99265acfc4704b4a1afb",
            "5b31163c5acfc400153b71cb",
            "64785e7c19d732620e045e15",
            "655f13e0a246670fb0373245",
            "6567e751a715f85433025998",
            "67617ec9ea1e82ea5e103054",
            "672e37d19f3e60fb0cbbe568",
            "5649a2464bdc2d91118b45a8"
        ];

        this.foldingModSights = [
            "5caf16a2ae92152ac412efbc",
            "61816fcad92c473c770215cc",
            "61817865d3a39d50044c13a4",
            "5bb20e49d4351e3bac1212de",
            "5ba26b01d4351e0085325a51",
            "5ba26b17d4351e00367f9bdd",
            "5c1780312e221602b66cc189",
            "5c17804b2e2216152006c02f",
            "5dfa3d7ac41b2312ea33362a",
            "5dfa3d950dee1b22f862eae0",
            "5fb6564947ce63734e3fa1da",
            "5fb6567747ce63734e3fa1dc",
            "5bc09a18d4351e003562b68e",
            "5bc09a30d4351e00367fb7c8",
            "5c18b90d2e2216152142466b",
            "5c18b9192e2216398b5a8104",
            "5fc0fa362770a0045c59c677",
            "5fc0fa957283c4046c58147e",
            "5894a73486f77426d259076c",
            "5894a81786f77427140b8347"
        ];

        // Empty array to hold invalid attachmentIDs for logging
        this.invalidModAttachments = [];
        
        // Empty array to hold invalid attachmentIDs for logging
        this.invalidModEquipment = [];

        // Empty array to hold all attachments that get imported
        this.allImportedAttachments = [];

        // Counter for number of imported attachments
        this.numberOfAttachments = 0;

        // This is empty now because Crackbone fixed Artem - but I'm leaving this here for future use
        this.clothingBlacklist = [];
    }

    public tiersTable = [];

    public initialize():void
    {
        if (ModConfig.config.compatibilityConfig.initalTierAppearance < 1 || ModConfig.config.compatibilityConfig.initalTierAppearance > 7)
        {
            this.apbsLogger.log(Logging.WARN, `Config value for "initialTierAppearance" is invalid. Must be 1-7. Currently configured for ${ModConfig.config.compatibilityConfig.initalTierAppearance}`)
            return;
        }
        if (ModConfig.config.compatibilityConfig.enableModdedWeapons) this.buildVanillaWeaponList();
        if (ModConfig.config.compatibilityConfig.enableModdedEquipment) this.buildVanillaEquipmentList();
        if (ModConfig.config.compatibilityConfig.enableModdedClothing && !ModConfig.config.pmcBots.additionalOptions.seasonalPmcAppearance) this.buildVanillaClothingList();
        
        if (ModConfig.config.compatibilityConfig.enableModdedAttachments) 
        {
            this.buildModAttachments();
            if (this.invalidModAttachments.length > 0 ) this.apbsLogger.log(Logging.DEBUG, `${this.invalidModAttachments.length} Invalid Attachment ItemIDs found in mods: ${JSON.stringify(this.invalidModAttachments)}`)
            if (this.invalidModEquipment.length > 0 ) this.apbsLogger.log(Logging.DEBUG, `${this.invalidModEquipment.length} Invalid Weapon/Equipment ItemIDs found in mods: ${JSON.stringify(this.invalidModEquipment)}`)
            if (this.allImportedAttachments.length > 0) this.apbsLogger.log(Logging.WARN, `     Importing ${this.allImportedAttachments.length} Modded Attachments to ${this.numberOfAttachments} mount points on vanilla weapons...`)
        }
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
        
        const armbands = {};        
        vanillaItemList.equipment.ArmBand.forEach(element => armbands[element] = this.getItem(element))
        
        // Push these lists to the function to filter and import
        this.getModdedItems(armours as ITemplateItem, BaseClasses.ARMOR, "Armours");
        this.getModdedItems(headwear as ITemplateItem, BaseClasses.HEADWEAR, "Helmets");
        this.getModdedItems(tacticalVests as ITemplateItem, BaseClasses.VEST, "Vests");
        this.getModdedItems(armbands as ITemplateItem, BaseClasses.ARMBAND, "ArmBands");
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
            this.apbsLogger.log(Logging.WARN, `     Importing ${clothingToBeImported.length} Modded ${className}...`)
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

            // Add each item from the clothing list to each tier JSON - this completes the import
            for (const item in clothingList)
            {
                if (clothingList[item]._props.Side.includes("Bear"))
                {
                    if (clothingList[item]._props.BodyPart == "Feet") tierJson.pmcBEAR.appearance.feet[clothingList[item]._id] = 1
                    if (clothingList[item]._props.BodyPart == "Body") tierJson.pmcBEAR.appearance.body[clothingList[item]._id] = 1
                    this.apbsLogger.log(Logging.DEBUG, `[Clothing Tier ${tierNumber}] Added ${clothingList[item]._id} to ${clothingList[item]._props.BodyPart} BEAR.`)
                }
                if (clothingList[item]._props.Side.includes("Usec"))
                {
                    if (clothingList[item]._props.BodyPart == "Feet") tierJson.pmcUSEC.appearance.feet[clothingList[item]._id] = 1
                    if (clothingList[item]._props.BodyPart == "Body") tierJson.pmcUSEC.appearance.body[clothingList[item]._id] = 1
                    this.apbsLogger.log(Logging.DEBUG, `[Clothing Tier ${tierNumber}] Added ${clothingList[item]._id} to ${clothingList[item]._props.BodyPart} USEC.`)
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
            this.apbsLogger.log(Logging.WARN, `     Importing ${itemsToBeImported.length} Modded ${className}...`)
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

            // Check if item is actually valid and in the database, skip if it isn't
            if (!this.doesItemExist(weaponId, true)) continue;

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
            const equipmentInfo = equipmentPool[equipment];
            const equipmentParent = equipmentInfo._parent;
            const equipmentId = equipmentInfo._id;
            const equipmentSlots = equipmentInfo?._props?.Slots;
            const equipmentSlotsLength = equipmentInfo?._props?.Slots.length;
            const gridLength = equipmentInfo?._props?.Grids.length;
            let equipmentSlot: string;

            // Check if item is actually valid and in the database, skip if it isn't
            if (!this.doesItemExist(equipmentId, true)) continue;

            // Set equipmentSlot string to the proper value - this is only done to separate TacticalVests & ArmouredRigs
            if (equipmentParent == "5448e54d4bdc2dcc718b4568") equipmentSlot = "ArmorVest"
            if (equipmentParent == "5a341c4086f77401f2541505") equipmentSlot = "Headwear"
            if (equipmentParent == "5448e5284bdc2dcb718b4567")
            {
                // No additional slots, probably tactical vest
                if ((equipmentSlots.length == 0 || equipmentSlots == undefined)) equipmentSlot = "TacticalVest";

                // Additional slots, likely armoured rig
                if (equipmentSlots.length >= 1) equipmentSlot = "ArmouredRig";

                // Might be a Pack N Strap belt, check that.
                const defaultInventorySlots = this.databaseService.getTables().templates.items["55d7217a4bdc2d86028b456d"]?._props?.Slots;
                for (const slot in defaultInventorySlots)
                {
                    const slotName = defaultInventorySlots[slot]?._name;
                    if (slotName != "ArmBand") continue;

                    const slotFilter = defaultInventorySlots[slot]?._props?.filters[0]?.Filter;
                    if (slotFilter.includes(equipmentId)) equipmentSlot = "ArmBand"
                    if (ModConfig.config.compatibilityConfig.PackNStrap_UnlootablePMCArmbandBelts)
                    {
                        equipmentInfo._props.Unlootable = true;
                        equipmentInfo._props.UnlootableFromSide.push("Bear", "Usec", "Savage");
                        equipmentInfo._props.UnlootableFromSlot = "ArmBand";
                    }
                }
            }
            
            if (this.itemHelper.isOfBaseclass(equipmentId, BaseClasses.ARMBAND)) equipmentSlot = "ArmBand";

            // Push Equipment details to relevant pools
            this.pushEquipmentToTiers(equipmentId, equipmentSlot, gridLength, equipmentSlotsLength);
            this.pushItemAndPrimaryMods(equipmentId, equipmentSlots);
        }
    }

    private pushWeaponToTiers(weaponId: string, weaponType: string, parentClass: string): void
    {
        // Define weights to use, and which range they go to (for logging).
        let range = "";
        const pmcWeight = ModConfig.config.compatibilityConfig.pmcWeaponWeights <= 0 ? 1 : ModConfig.config.compatibilityConfig.pmcWeaponWeights;
        const scavWeight = ModConfig.config.compatibilityConfig.scavWeaponWeights <= 0 ? 1 : ModConfig.config.compatibilityConfig.scavWeaponWeights;
        const defaultWeight = ModConfig.config.compatibilityConfig.followerWeaponWeights <= 0 ? 1 : ModConfig.config.compatibilityConfig.followerWeaponWeights;

        // Loop over each tier to easily use the proper tierJSON
        for (const object in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[object].tier
            const tierJson = this.apbsEquipmentGetter.getTierJson(tierNumber, true);

            // Skip tiers based on configuration
            if (tierNumber < ModConfig.config.compatibilityConfig.initalTierAppearance) continue;

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
        this.apbsLogger.log(Logging.DEBUG, `[Tier${ModConfig.config.compatibilityConfig.initalTierAppearance}+] Added ${weaponId} to ${range} weapons.`)
    }

    private pushEquipmentToTiers(itemID: string, equipmentSlot: string, gridLength: number, equipmentSlotsLength: number): void
    {
        // Loop over each tier to easily use the proper tierJSON
        for (const object in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[object].tier
            const tierJson = this.apbsEquipmentGetter.getTierJson(tierNumber, true);

            // Skip tiers based on configuration
            if (tierNumber < ModConfig.config.compatibilityConfig.initalTierAppearance) continue;

            // Set weights based on witch slot they are in. Check TacticalVests for belts (low grid count) and check Helmets to see if armoured or decorative
            let weight;
            if (equipmentSlot == "TacticalVest" && gridLength > 10) weight = 10;
            if (equipmentSlot == "TacticalVest" && gridLength <= 10) weight = 1;
            if (equipmentSlot == "ArmBand") weight = 3;
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
        this.apbsLogger.log(Logging.DEBUG, `[Tier${ModConfig.config.compatibilityConfig.initalTierAppearance}+] Added ${itemID} to ${equipmentSlot}.`)
    }

    private pushItemAndPrimaryMods(itemID: string, itemSlots: ISlot[]): void
    {
        // Loop over all slots of the item
        for (const slot in itemSlots)
        {
            const slotName = itemSlots[slot]?._name;
            let slotFilter = itemSlots[slot]?._props?.filters[0]?.Filter

            // If a slot's filters contain the canted sight mount, check config and take action based on config         
            if (slotFilter.includes("5649a2464bdc2d91118b45a8"))
            {
                if (ModConfig.config.compatibilityConfig.enableMPRSafeGuard)
                {
                    slotFilter = ["5649a2464bdc2d91118b45a8"]
                }
                else
                {
                    const baseClassArrayToFilterOut = [
                        BaseClasses.COLLIMATOR, BaseClasses.OPTIC_SCOPE, BaseClasses.ASSAULT_SCOPE, BaseClasses.COMPACT_COLLIMATOR, BaseClasses.MOUNT, BaseClasses.SPECIAL_SCOPE
                    ]
                    slotFilter = slotFilter.filter(item => !this.itemHelper.isOfBaseclasses(item, baseClassArrayToFilterOut))
    
                    // Add MPR back
                    slotFilter.push("5649a2464bdc2d91118b45a8");
                }
            }

            // Loop over all items in the filter for the slot
            for (const item in slotFilter)
            {
                const slotFilterItem = slotFilter[item];

                if (this.shouldItemBeSkipped(itemID, slotFilterItem, slotName)) continue;

                const highTierItem = this.tier4PlusOnly(itemID, slotName, slotFilterItem);
                const lowTierItem = this.tier4MinusOnly(itemID, slotName, slotFilterItem);

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
                    if (!highTierItem || lowTierItem) this.tierInformation.tier1mods[itemID][slotName].push(slotFilterItem);
                    if (!highTierItem || lowTierItem) this.tierInformation.tier2mods[itemID][slotName].push(slotFilterItem);
                    if (!highTierItem || lowTierItem) this.tierInformation.tier3mods[itemID][slotName].push(slotFilterItem);
                    if (!lowTierItem || highTierItem) this.tierInformation.tier4mods[itemID][slotName].push(slotFilterItem);
                    if (!lowTierItem || highTierItem) this.tierInformation.tier5mods[itemID][slotName].push(slotFilterItem);
                    if (!lowTierItem || highTierItem) this.tierInformation.tier6mods[itemID][slotName].push(slotFilterItem);
                    if (!lowTierItem || highTierItem) this.tierInformation.tier7mods[itemID][slotName].push(slotFilterItem);

                    /*
                    // Uncomment this to check a specific items slot
                    if (itemID == "67a01e4ea2b82626b73d10a3" && slotName == "mod_magazine")
                    {
                        this.apbsLogger.log(Logging.WARN, `PARENT: attempting to add ${slotFilterItem} to parent item ${itemID} in slot ${slotName}`)
                        this.apbsLogger.log(Logging.WARN, `high: ${highTierItem} | low: ${lowTierItem}`)
                        this.apbsLogger.log(Logging.WARN, `Does have MPR?: ${slotFilter.includes("5649a2464bdc2d91118b45a8")}`)
                        this.apbsLogger.log(Logging.WARN, `Does have more than one item in slot filter?: ${slotFilter.length > 1}`)
                        this.apbsLogger.log(Logging.WARN, `Slot Filter: ${JSON.stringify(slotFilter)}`)
                        this.apbsLogger.log(Logging.WARN, `ACR Pool: ${JSON.stringify(this.tierInformation.tier3mods[itemID][slotName])}`)
                        this.apbsLogger.log(Logging.WARN, `ACR Pool: ${JSON.stringify(this.tierInformation.tier4mods[itemID][slotName])}`)
                        this.apbsLogger.log(Logging.WARN, `----------------------------------------`)
                    }

                    
                    if (itemID == "93bcdfda236122e67c098847" && slotName == "mod_magazine")
                    {
                        this.apbsLogger.log(Logging.WARN, `PARENT: attempting to add ${slotFilterItem} to parent item ${itemID} in slot ${slotName}`)
                        this.apbsLogger.log(Logging.WARN, `high: ${highTierItem} | low: ${lowTierItem}`)
                        this.apbsLogger.log(Logging.WARN, `Does have MPR?: ${slotFilter.includes("5649a2464bdc2d91118b45a8")}`)
                        this.apbsLogger.log(Logging.WARN, `Does have more than one item in slot filter?: ${slotFilter.length > 1}`)
                        this.apbsLogger.log(Logging.WARN, `Slot Filter: ${JSON.stringify(slotFilter)}`)
                        this.apbsLogger.log(Logging.WARN, `DRACO T3: ${JSON.stringify(this.tierInformation.tier3mods[itemID][slotName])}`)
                        this.apbsLogger.log(Logging.WARN, `DRACO RAIL T4: ${JSON.stringify(this.tierInformation.tier4mods[itemID][slotName])}`)
                        this.apbsLogger.log(Logging.WARN, `----------------------------------------`)
                    }
                    */
                    

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

            // If a slot's filters contain the canted sight mount, check config and take action based on config         
            if (slotFilter.includes("5649a2464bdc2d91118b45a8"))
            {
                if (ModConfig.config.compatibilityConfig.enableMPRSafeGuard)
                {
                    slotFilter = ["5649a2464bdc2d91118b45a8"]
                }
                else
                {
                    const baseClassArrayToFilterOut = [
                        BaseClasses.COLLIMATOR, BaseClasses.OPTIC_SCOPE, BaseClasses.ASSAULT_SCOPE, BaseClasses.COMPACT_COLLIMATOR, BaseClasses.MOUNT, BaseClasses.SPECIAL_SCOPE
                    ]
                    slotFilter = slotFilter.filter(item => !this.itemHelper.isOfBaseclasses(item, baseClassArrayToFilterOut))
    
                    // Add MPR back
                    slotFilter.push("5649a2464bdc2d91118b45a8");
                }
            }

            // Loop over each item in the slot's filters
            for (const item in slotFilter)
            {
                const slotFilterItem = slotFilter[item]; 

                if (this.shouldItemBeSkipped(parentSlotItemID, slotFilterItem, slotName, standaloneAttachment)) continue;

                const highTierItem = this.tier4PlusOnly(parentSlotItemID, slotName, slotFilterItem);
                const lowTierItem = this.tier4MinusOnly(parentSlotItemID, slotName, slotFilterItem);

                /*
                if (parentSlotFilterItem == "660b566e010010f3889ce04d" && slotName == "mod_reciever")
                {
                    this.apbsLogger.log(Logging.WARN, `CHILD: attempting to add ${slotFilterItem} to parent item ${parentSlotFilterItem} in slot ${slotName}`)
                    this.apbsLogger.log(Logging.WARN, `high: ${highTierItem} | low: ${lowTierItem}`)
                    this.apbsLogger.log(Logging.WARN, `Does have MPR?: ${slotFilter.includes("5649a2464bdc2d91118b45a8")}`)
                    this.apbsLogger.log(Logging.WARN, `Does have more than one item in slot filter?: ${slotFilter.length > 1}`)
                    this.apbsLogger.log(Logging.WARN, `Slot Filter: ${JSON.stringify(slotFilter)}`)
                    this.apbsLogger.log(Logging.WARN, `DRACO T3: ${JSON.stringify(this.tierInformation.tier3mods[parentSlotFilterItem][slotName])}`)
                    this.apbsLogger.log(Logging.WARN, `DRACO RAIL T4: ${JSON.stringify(this.tierInformation.tier4mods[parentSlotFilterItem][slotName])}`)
                    this.apbsLogger.log(Logging.WARN, `----------------------------------------`)
                }
                    */
                
                

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
                    // Finally push the child mod to the proper tierJSONs
                    if (!highTierItem || lowTierItem) this.tierInformation.tier1mods[parentSlotItemID][slotName].push(slotFilterItem);
                    if (!highTierItem || lowTierItem) this.tierInformation.tier2mods[parentSlotItemID][slotName].push(slotFilterItem);
                    if (!highTierItem || lowTierItem) this.tierInformation.tier3mods[parentSlotItemID][slotName].push(slotFilterItem);
                    if (!lowTierItem || highTierItem) this.tierInformation.tier4mods[parentSlotItemID][slotName].push(slotFilterItem);
                    if (!lowTierItem || highTierItem) this.tierInformation.tier5mods[parentSlotItemID][slotName].push(slotFilterItem);
                    if (!lowTierItem || highTierItem) this.tierInformation.tier6mods[parentSlotItemID][slotName].push(slotFilterItem);
                    if (!lowTierItem || highTierItem) this.tierInformation.tier7mods[parentSlotItemID][slotName].push(slotFilterItem);

                    if (ModConfig.config.compatibilityConfig.enableModdedAttachments && standaloneAttachment)
                    {
                        this.apbsLogger.log(Logging.DEBUG, `Found mod attachment to import. ParentSlotItem: ${parentSlotItemID} | Slot: ${slotName} | Attachment: ${slotFilterItem}`);
                        if (!this.allImportedAttachments.includes(slotFilterItem)) this.allImportedAttachments.push(slotFilterItem);
                        this.numberOfAttachments++
                    } 
                    
                    // Push any children mods
                    if (this.allowedToBeRecursive(slotFilterItem)) this.recursivePushChildrenMods(slotFilterItem, standaloneAttachment);
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
            const chamberFilter = itemDetails[1]?._props?.Chambers[0]?._props?.filters[0]?.Filter ?? [];

            // Probably a revolver or something, check the magazines instead
            if (chamberFilter.length === 0)
            {
                const cartridges = this.getCompatibleCartridgesFromMagazineTemplate(itemDetails[1]);
                if (cartridges.length)
                {
                    for (const cartridge in cartridges)
                    {
                        // Validate the cartridge caliber matches the weapon, if it does then push to the proper caliber (prevents multi caliber rifles from changing weights that already exist)
                        const cartridgeID = cartridges[cartridge];
                        const cartridgeDetails = this.itemHelper.getItem(cartridgeID)
                        if (!cartridgeDetails[0]) continue;
                        if (itemCaliber == cartridgeDetails[1]._props.Caliber)
                        {
                            this.pushAmmoToTier(itemCaliber, cartridgeID);
                        }
                    }
                    return;
                }
            }
            // If the chamber is valid and has items, add them to the tierJSONs
            if (chamberFilter.length)
            {
                for (const round in chamberFilter)
                {
                    // Validate the cartridge caliber matches the weapon, if it does then push to the proper caliber (prevents multi caliber rifles from changing weights that already exist)
                    const roundID = chamberFilter[round];
                    const roundDetails = this.itemHelper.getItem(roundID)
                    if (!roundDetails[0]) continue;
                    if (itemCaliber == roundDetails[1]._props.Caliber)
                    {
                        this.pushAmmoToTier(itemCaliber, roundID);
                    }
                }
                return;
            }

            this.apbsLogger.log(Logging.WARN, `[CALIBER] New caliber found in weapon, but could not find details. Item: ${itemID} | Caliber: ${itemCaliber}`)
        }
    }

    private pushAmmoToTier(caliber: string, itemID: string): void
    {
        for (const botPool in this.tierInformation.tier1ammo)
        {
            this.tierInformation.tier1ammo[botPool][caliber] = {};
            this.tierInformation.tier2ammo[botPool][caliber] = {};
            this.tierInformation.tier3ammo[botPool][caliber] = {};
            this.tierInformation.tier4ammo[botPool][caliber] = {};
            this.tierInformation.tier5ammo[botPool][caliber] = {};
            this.tierInformation.tier6ammo[botPool][caliber] = {};
            this.tierInformation.tier7ammo[botPool][caliber] = {};

            this.tierInformation.tier1ammo[botPool][caliber][itemID] = 1;
            this.tierInformation.tier2ammo[botPool][caliber][itemID] = 1;
            this.tierInformation.tier3ammo[botPool][caliber][itemID] = 1;
            this.tierInformation.tier4ammo[botPool][caliber][itemID] = 1;
            this.tierInformation.tier5ammo[botPool][caliber][itemID] = 1;
            this.tierInformation.tier6ammo[botPool][caliber][itemID] = 1;
            this.tierInformation.tier7ammo[botPool][caliber][itemID] = 1;
        }
    }

    private getCompatibleCartridgesFromMagazineTemplate(weaponTemplate: ITemplateItem): string[] 
    {
        const magazineSlot = weaponTemplate._props.Slots?.find((slot) => slot._name === "mod_magazine");
        if (!magazineSlot) 
        {
            return [];
        }
        const magazineTemplate = this.itemHelper.getItem(magazineSlot._props.filters[0].Filter[0]);
        if (!magazineTemplate[0]) 
        {
            return [];
        }

        let cartridges = magazineTemplate[1]._props.Slots[0]?._props?.filters[0].Filter;
        if (!cartridges) 
        {
            cartridges = magazineTemplate[1]._props.Cartridges[0]?._props?.filters[0].Filter;
        }

        return cartridges ?? [];
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

    private pushStandaloneAttachmentsToWeapons(weaponID: string, slotName: string, slotItem: string): void
    {
        // Default to adding the item, change this value during checks
        const highTierItem = this.tier4PlusOnly(weaponID, slotName, slotItem);
        const lowTierItem = this.tier4MinusOnly(weaponID, slotName, slotItem);

        // Check if the itemID's slot doesn't already contain the item to import, if it doesn't - add it
        if (!this.tierInformation.tier4mods[weaponID][slotName].includes(slotItem))
        {
            if (!highTierItem || lowTierItem) this.tierInformation.tier1mods[weaponID][slotName].push(slotItem);
            if (!highTierItem || lowTierItem) this.tierInformation.tier2mods[weaponID][slotName].push(slotItem);
            if (!highTierItem || lowTierItem) this.tierInformation.tier3mods[weaponID][slotName].push(slotItem);
            if (!lowTierItem || highTierItem) this.tierInformation.tier4mods[weaponID][slotName].push(slotItem);
            if (!lowTierItem || highTierItem) this.tierInformation.tier5mods[weaponID][slotName].push(slotItem);
            if (!lowTierItem || highTierItem) this.tierInformation.tier6mods[weaponID][slotName].push(slotItem);
            if (!lowTierItem || highTierItem) this.tierInformation.tier7mods[weaponID][slotName].push(slotItem);

            // Push any children mods
            this.recursivePushChildrenMods(slotItem, true);
        }
    }

    public buildModAttachments(): void
    {
        this.apbsLogger.log(Logging.WARN, `Checking & importing Modded Weapon Attachments...Support not granted for this feature...`)

        const items = this.databaseService.getTables().templates.items;
        const itemValues = Object.values(items);
        const weapons = itemValues.filter(x => this.itemHelper.isOfBaseclass(x._id, BaseClasses.WEAPON));

        for (const weapon in weapons)
        {
            const weaponID = weapons[weapon]._id;
            const weaponSlots = weapons[weapon]?._props?.Slots;

            // Exit early if the weaponID is blacklisted or is modded - if it's modded, let the other import code handle it
            if (this.shouldWeaponBeSkipped(weaponID)) continue;

            for (const slot in weaponSlots)
            {
                const slotName = weaponSlots[slot]?._name;
                const slotFilter = weaponSlots[slot]?._props?.filters[0]?.Filter
                
                // Check if we should skip slot
                if (this.shouldSlotBeSkipped(slotName)) continue;

                // If filter has items
                if (slotFilter.length > 0)
                {
                    // Loop over all items in the filter for the slot
                    for (const item in slotFilter)
                    {
                        const slotFilterItem = slotFilter[item];

                        // Check if we should skip item
                        if (this.shouldItemBeSkipped(weaponID, slotFilterItem, slotName, true)) continue;

                        // Slot is missing from weapon, add it
                        if (this.tierInformation.tier1mods[weaponID][slotName] == undefined)
                        {
                            this.apbsLogger.log(Logging.DEBUG, `New Slot Found! Weapon: ${weaponID} | Slot: ${slotName} | Item: ${slotFilterItem}`)
                            this.tierInformation.tier1mods[weaponID][slotName] = [];
                            this.tierInformation.tier2mods[weaponID][slotName] = [];
                            this.tierInformation.tier3mods[weaponID][slotName] = [];
                            this.tierInformation.tier4mods[weaponID][slotName] = [];
                            this.tierInformation.tier5mods[weaponID][slotName] = [];
                            this.tierInformation.tier6mods[weaponID][slotName] = [];
                            this.tierInformation.tier7mods[weaponID][slotName] = [];
                        }

                        // Push modded attachments that aren't already in the
                        if (!this.tierInformation.tier1mods[weaponID][slotName].includes(slotFilterItem))
                        {
                            this.apbsLogger.log(Logging.DEBUG, `Found mod attachment to import. WeaponID: ${weaponID} | Slot: ${slotName} | Attachment: ${slotFilterItem}`);
                            if (!this.allImportedAttachments.includes(slotFilterItem)) this.allImportedAttachments.push(slotFilterItem);
                            this.numberOfAttachments++

                            this.pushStandaloneAttachmentsToWeapons(weaponID, slotName, slotFilterItem);
                        }
                    }
                }
            }
        }
    }

    private doesItemExist(itemID: string, isEquipmentOrWeapon: boolean = false): boolean
    {
        const itemExists = this.itemHelper.getItem(itemID)[0];
        if (!itemExists && !isEquipmentOrWeapon)
        {
            if (!this.invalidModAttachments.includes(itemID)) this.invalidModAttachments.push(itemID);
        }
        if (!itemExists && isEquipmentOrWeapon)
        {
            if (!this.invalidModEquipment.includes(itemID)) this.invalidModEquipment.push(itemID);
        }
        return itemExists;
    }

    private tier4PlusOnly(parentID: string, slotName: string, itemID: string): boolean
    {
        // Get Item Data for checks
        const itemData = this.itemHelper.getItem(itemID)[1]

        // Mod_Magazine check
        if (slotName == "mod_magazine") 
        {
            if (!this.hasLowerAndUpperOptionsAvailable(parentID, slotName, 30)) return false;
            if (itemData?._props?.Cartridges[0]?._max_count >= 30) return true;
        }

        if (slotName.includes("mod_stock") || slotName.includes("mod_handguard") || slotName.includes("mod_reciever"))
        {
            if (!this.hasLowerAndUpperOptionsAvailable(parentID, slotName, 8)) return false;
            if (itemData?._props?.Ergonomics >= 8) return true;
        }

        if (slotName.includes("mod_scope") && this.tier4Optics.includes(itemID)) return true;

        return false;
    }

    private tier4MinusOnly(parentID: string, slotName: string, itemID: string): boolean
    {
        // Get Item Data for checks
        const itemData = this.itemHelper.getItem(itemID)[1]

        // Mod_Magazine check
        if (slotName == "mod_magazine") 
        {
            if (!this.hasLowerAndUpperOptionsAvailable(parentID, slotName, 30)) return false;
            if (itemData?._props?.Cartridges[0]?._max_count <= 30) return true;
        }

        if (slotName.includes("mod_stock") || slotName.includes("mod_handguard") || slotName.includes("mod_reciever"))
        {
            if (!this.hasLowerAndUpperOptionsAvailable(parentID, slotName, 8)) return false;
            if (itemData?._props?.Ergonomics <= 8) return true;
        }

        if (slotName.includes("mod_scope") && !this.tier4Optics.includes(itemID)) return true;

        return false;
    }

    private shouldWeaponBeSkipped(itemID: string): boolean
    {
        // Weapon is blacklisted, skip
        if (this.blacklist.includes(itemID)) return true;

        if (!this.apbsAttachmentChecker.isVanillaItem(itemID)) return true;

        return false;
    }

    private shouldSlotBeSkipped(slotName: string): boolean
    {
        if (slotName == "mod_sight_front" || slotName == "mod_sight_rear") return true;

        return false;
    }

    private shouldItemBeSkipped(parentID:string, itemID: string, slotName: string, standaloneAttachment: boolean = false): boolean
    {
        // If item doesn't exist in the database, skip
        if (!this.doesItemExist(itemID)) return true;

        // Attachment blacklist contains item
        if (this.attachmentBlacklist.includes(itemID)) return true; 

        // Get Item Data now that we know it exists
        const itemData = this.itemHelper.getItem(itemID)[1]
        const isVanillaParent = this.apbsAttachmentChecker.isVanillaItem(parentID);
        const isVanillaItem = this.apbsAttachmentChecker.isVanillaItem(itemID);

        // Are both items vanilla?
        if (isVanillaParent && isVanillaItem && ModConfig.config.compatibilityConfig.enableSafeGuard) return true;

        slotName = slotName.toLowerCase();

        // is MP7 and slot block optics
        if (parentID == "5ba26383d4351e00334c93d9" || parentID == "5bd70322209c4d00d7167b8f")
        {
            if (slotName == "mod_tactical_000" || slotName == "mod_tactical_001") return true;
        }
        
        // is VSS/VAL and slot block optics
        if (parentID == "57838ad32459774a17445cd2" || parentID == "57c44b372459772d2b39b8ce")
        {
            if (slotName == "mod_mount_000") return true;
        }

        // Handguard with mod_scope slot for tacticals..lol
        if (parentID == "647de824196bf69818044c93")
        {
            if (slotName == "mod_scope") return true;
        }

        // Check is slot is a magazine
        if (slotName == "mod_magazine")
        {
            // Validate _max_count exists. If it doesn't - skip
            if (itemData?._props?.Cartridges[0]?._max_count == undefined) return true;
        }
        
        if (slotName == "mod_sight_front" || slotName == "mod_sight_rear")
        {
            if (isVanillaParent) return true;
        }

        if (slotName == "mod_scope_000")
        {
            if (!this.modScope000Whitelist.includes(itemID)) return true;
        }        

        // Last checks only if it's standalone
        if (standaloneAttachment) return this.standaloneAttachmentShouldBeSkipped(itemID, slotName);

        return false;
    }

    private standaloneAttachmentShouldBeSkipped(itemID: string, slotName: string): boolean
    {
        slotName = slotName.toLowerCase();

        if (slotName == "mod_sight_front" || slotName == "mod_sight_rear")
        {
            if (!this.foldingModSights.includes(itemID)) return true;
            return false;
        }

        return false;
    }

    private allowedToBeRecursive(itemID: string): boolean
    {
        return !this.itemShouldNotGetModdedChildrenAttachments.includes(itemID)
    }

    private hasLowerAndUpperOptionsAvailable(parentID: string, slotName: string, threshholdValue: number): boolean
    {
        // Check related items for this slot, to ensure it does have one that meets high threshhold requirements
        const parentSlot = this.itemHelper.getItem(parentID)[1]._props.Slots?.find(
            (slot: { _name: string }) => slot._name.toLowerCase() === slotName
        );

        const itemFilters = parentSlot?._props?.filters[0]?.Filter;

        let hasHighRequirements = false;
        let hasLowRequirements = false;
        let checkedValue = 0;

        for (const item in itemFilters)
        {
            const itemExists = this.itemHelper.getItem(itemFilters[item])[0];
            if (!itemExists) continue;
            
            switch (slotName)
            {
                case "mod_magazine":
                    checkedValue = this.itemHelper.getItem(itemFilters[item])[1]?._props?.Cartridges[0]?._max_count;
                    break;
                case "mod_handguard":
                case "mod_reciever":
                case "mod_stock":
                case "mod_stock_000":
                case "mod_stock_001":
                case "mod_stock_002":
                case "mod_stock_akms":
                case "mod_stock_axis":
                    checkedValue = this.itemHelper.getItem(itemFilters[item])[1]?._props?.Ergonomics;
                    break;
                default:
                    break;
            }

            if (checkedValue)
            {
                if (checkedValue >= threshholdValue && !this.attachmentBlacklist.includes(itemFilters[item]))
                {
                    hasHighRequirements = true;
                    continue;
                }
                if (checkedValue <= threshholdValue && !this.attachmentBlacklist.includes(itemFilters[item]))
                {
                    hasLowRequirements = true;
                    continue;
                } 
            }
        }

        if (hasHighRequirements && hasLowRequirements) return true;

        return false;
    }
}