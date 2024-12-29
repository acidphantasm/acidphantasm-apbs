/* eslint-disable @typescript-eslint/naming-convention */
import { injectable, inject } from "tsyringe";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { IBotConfig } from "@spt/models/spt/config/IBotConfig";
import { IPmcConfig } from "@spt/models/spt/config/IPmcConfig";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { DatabaseService } from "@spt/services/DatabaseService";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { ItemHelper } from "@spt/helpers/ItemHelper";

import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { TierInformation } from "../Globals/TierInformation";
import { RaidInformation } from "../Globals/RaidInformation";
import { ModConfig } from "../Globals/ModConfig";
import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";


@injectable()
export class BotConfigs
{
    protected botConfig: IBotConfig;
    protected pmcConfig: IPmcConfig;
    
    constructor(
        @inject("IDatabaseTables") protected tables: IDatabaseTables,
        @inject("DatabaseService") protected database: DatabaseService,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("TierInformation") protected tierInformation: TierInformation,
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("APBSLogger") protected apbsLogger: APBSLogger
    )
    {
        this.botConfig = this.configServer.getConfig(ConfigTypes.BOT);
        this.pmcConfig = this.configServer.getConfig(ConfigTypes.PMC);
    }

    public initialize(): void
    {
        this.clearNoLongerNeededBotDetails();
        this.configureBotExperienceLevels();
        this.configurePlateWeightings();
        this.configureWeaponDurability();
        this.adjustNVG();
        this.setLootItemResourceRandomization();
        this.setPMCItemLimits();
        this.setPMCLoot();
        this.setPMCScopeWhitelist();
        this.setPMCSlotIDsToMakeRequired();
        this.removeThermalGoggles(ModConfig.config.enableT7Thermals);
        if (ModConfig.config.gameVersionWeight) this.setPMCGameVersionWeights();
        if (ModConfig.config.addAllKeysToScavs || ModConfig.config.addOnlyKeyCardsToScavs || ModConfig.config.addOnlyMechanicalKeysToScavs) this.pushScavKeys();
        if (ModConfig.config.enableCustomPlateChances) this.setPlateChances();
        if (ModConfig.config.forceStock) this.setForceStock();
        if (ModConfig.config.forceDustCover) this.setForceDustCover();
        if (ModConfig.config.forceScopeSlot) this.setForceScopes();
        if (ModConfig.config.forceWeaponModLimits) this.setWeaponModLimits();
        if (!ModConfig.config.scavLoot) this.removeScavLoot();
        if (ModConfig.config.enableScavEqualEquipmentTiering) this.setIdenticalScavWeights();
        if (ModConfig.config.enableCustomLevelDeltas) this.setLevelDeltas();
        if (ModConfig.config.enableScavCustomLevelDeltas) this.setScavLevelDeltas();
        if (ModConfig.config.forceMuzzle) this.setMuzzleChances();
    }

    private configureBotExperienceLevels(): void
    {
        const botTypeTable = this.tables.bots.types;

        for (const botType in botTypeTable)
        {
            botTypeTable[botType].experience.level.min = 1;
            botTypeTable[botType].experience.level.max = 79;
        }
    }

    private configurePlateWeightings(): void
    {
        const botConfigEquipment = this.botConfig.equipment
        for (const botType in botConfigEquipment)
        {
            if (botType.includes("assault") || botType.includes("marksman"))
            {
                botConfigEquipment[botType].filterPlatesByLevel = true;
                botConfigEquipment[botType].armorPlateWeighting = this.tierInformation.scavArmorPlateWeights;
                continue;
            }
            botConfigEquipment[botType].filterPlatesByLevel = true;
            botConfigEquipment[botType].armorPlateWeighting = this.tierInformation.armorPlateWeights;
        }
    }

    private clearNoLongerNeededBotDetails(): void
    {
        const botConfigEquipment = this.botConfig.equipment
        for (const botType in botConfigEquipment)
        {
            botConfigEquipment[botType].randomisation = [];
            botConfigEquipment[botType].weightingAdjustmentsByBotLevel = [];
        }
    }

    private configureWeaponDurability(): void
    {
        // Do this better in the future - this looks like shit. Bad Acid. Bad.
        const botConfigDurability = this.botConfig.durability

        for (const botType in botConfigDurability)
        {
            if (botType == "pmc")
            {
                botConfigDurability[botType].weapon.lowestMax = ModConfig.config.pmcWeaponDurability[0]
                botConfigDurability[botType].weapon.highestMax = ModConfig.config.pmcWeaponDurability[1]
                botConfigDurability[botType].weapon.minDelta = ModConfig.config.pmcWeaponDurability[2]
                botConfigDurability[botType].weapon.maxDelta = ModConfig.config.pmcWeaponDurability[3]
                botConfigDurability[botType].weapon.minLimitPercent = 40
            }
            if (botType == "boss" || botType == "arenafighterevent" || botType == "arenafighter" || botType == "sectantpriest" || botType == "sectantwarrior")
            {
                botConfigDurability[botType].weapon.lowestMax = ModConfig.config.bossWeaponDurability[0]
                botConfigDurability[botType].weapon.highestMax = ModConfig.config.bossWeaponDurability[1]
                botConfigDurability[botType].weapon.minDelta = ModConfig.config.bossWeaponDurability[2]
                botConfigDurability[botType].weapon.maxDelta = ModConfig.config.bossWeaponDurability[3]
                botConfigDurability[botType].weapon.minLimitPercent = 40
            }
            if (botType == "assault" || botType == "cursedassault" || botType == "marksman" || botType == "crazyassaultevent" || botType == "default")
            {
                botConfigDurability[botType].weapon.lowestMax = ModConfig.config.scavWeaponDurability[0]
                botConfigDurability[botType].weapon.highestMax = ModConfig.config.scavWeaponDurability[1]
                botConfigDurability[botType].weapon.minDelta = ModConfig.config.scavWeaponDurability[2]
                botConfigDurability[botType].weapon.maxDelta = ModConfig.config.scavWeaponDurability[3]
                botConfigDurability[botType].weapon.minLimitPercent = 40
            }
            if (botType == "follower")
            {
                botConfigDurability[botType].weapon.lowestMax = ModConfig.config.guardWeaponDurability[0]
                botConfigDurability[botType].weapon.highestMax = ModConfig.config.guardWeaponDurability[1]
                botConfigDurability[botType].weapon.minDelta = ModConfig.config.guardWeaponDurability[2]
                botConfigDurability[botType].weapon.maxDelta = ModConfig.config.guardWeaponDurability[3]
                botConfigDurability[botType].weapon.minLimitPercent = 40
            }
            if (botType == "pmcbot" || botType == "exusec")
            {
                botConfigDurability[botType].weapon.lowestMax = ModConfig.config.raiderWeaponDurability[0]
                botConfigDurability[botType].weapon.highestMax = ModConfig.config.raiderWeaponDurability[1]
                botConfigDurability[botType].weapon.minDelta = ModConfig.config.raiderWeaponDurability[2]
                botConfigDurability[botType].weapon.maxDelta = ModConfig.config.raiderWeaponDurability[3]
                botConfigDurability[botType].weapon.minLimitPercent = 40
            }
        }
    }

    private adjustNVG(): void
    {
        const botConfigEquipment = this.botConfig.equipment

        for (const botType in botConfigEquipment)
        {
            botConfigEquipment[botType].faceShieldIsActiveChancePercent = 90;
            botConfigEquipment[botType].lightIsActiveDayChancePercent = 7;
            botConfigEquipment[botType].lightIsActiveNightChancePercent = 25;
            botConfigEquipment[botType].laserIsActiveChancePercent = 50;
            botConfigEquipment[botType].nvgIsActiveChanceDayPercent = 0;
            botConfigEquipment[botType].nvgIsActiveChanceNightPercent = 95;
        }
    }

    private setForceStock(): void
    {
        for (const tierObject in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[tierObject].tier
            const tierJson = this.apbsEquipmentGetter.getTierChancesJson(tierNumber);

            for (const botType in this.tierInformation.tier1chances)
            {
                const chances = tierJson[botType].chances
                for (const weaponType in chances)
                {
                    chances[weaponType]["mod_stock"] = 100;
                    chances[weaponType]["mod_stock_000"] = 100;
                    chances[weaponType]["mod_stock_001"] = 100;
                    chances[weaponType]["mod_stock_akms"] = 100;
                    chances[weaponType]["mod_stock_axis"] = 100;
                }
            }
        }
    }

    private setForceDustCover(): void
    {
        for (const tierObject in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[tierObject].tier
            const tierJson = this.apbsEquipmentGetter.getTierChancesJson(tierNumber);

            for (const botType in this.tierInformation.tier1chances)
            {
                const chances = tierJson[botType].chances
                for (const weaponType in chances)
                {
                    chances[weaponType]["mod_reciever"] = 100;
                }
            }
        }
    }

    private setForceScopes(): void
    {
        for (const tierObject in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[tierObject].tier
            const tierJson = this.apbsEquipmentGetter.getTierChancesJson(tierNumber);

            for (const botType in this.tierInformation.tier1chances)
            {
                const chances = tierJson[botType].chances
                for (const weaponType in chances)
                {
                    chances[weaponType]["mod_scope"] = 100;
                }
            }
        }
    }

    private setPlateChances() 
    {
        for (const tierObject in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[tierObject].tier
            const tierJson = this.apbsEquipmentGetter.getTierChancesJson(tierNumber);

            for (const botType in this.tierInformation.tier1chances)
            {
                if (botType == "pmcUSEC" || botType == "pmcBEAR")
                {
                    tierJson[botType].chances.equipmentMods["back_plate"] = tierJson[botType].chances.equipmentMods["front_plate"] = ModConfig.config.pmcMainPlateChance[tierObject];
                    tierJson[botType].chances.equipmentMods["left_side_plate"] = tierJson[botType].chances.equipmentMods["right_side_plate"] = ModConfig.config.pmcSidePlateChance[tierObject];
                }
                if (botType == "followerbirdeye" || botType == "followerbigpipe" || botType.includes("boss") || botType.includes("sectant"))
                {
                    tierJson[botType].chances.equipmentMods["back_plate"] = tierJson[botType].chances.equipmentMods["front_plate"] = ModConfig.config.bossMainPlateChance[tierObject];
                    tierJson[botType].chances.equipmentMods["left_side_plate"] = tierJson[botType].chances.equipmentMods["right_side_plate"] = ModConfig.config.bossSidePlateChance[tierObject];
                }
                if (botType == "scav")
                {
                    tierJson[botType].chances.equipmentMods["back_plate"] = tierJson[botType].chances.equipmentMods["front_plate"] = ModConfig.config.scavMainPlateChance[tierObject];
                    tierJson[botType].chances.equipmentMods["left_side_plate"] = tierJson[botType].chances.equipmentMods["right_side_plate"] = ModConfig.config.scavSidePlateChance[tierObject];
                }
                if (botType == "exusec" || botType == "pmcbot")
                {
                    tierJson[botType].chances.equipmentMods["back_plate"] = tierJson[botType].chances.equipmentMods["front_plate"] = ModConfig.config.raiderMainPlateChance[tierObject];
                    tierJson[botType].chances.equipmentMods["left_side_plate"] = tierJson[botType].chances.equipmentMods["right_side_plate"] = ModConfig.config.raiderSidePlateChance[tierObject];
                }
                if (botType == "default")
                {
                    tierJson[botType].chances.equipmentMods["back_plate"] = tierJson[botType].chances.equipmentMods["front_plate"] = ModConfig.config.guardMainPlateChance[tierObject];
                    tierJson[botType].chances.equipmentMods["left_side_plate"] = tierJson[botType].chances.equipmentMods["right_side_plate"] = ModConfig.config.guardSidePlateChance[tierObject];
                }
            }
        }
    }

    private setWeaponModLimits(): void
    {
        const botConfigEquipment = this.botConfig.equipment
        for (const botType in botConfigEquipment)
        {
            if (botConfigEquipment[botType].weaponModLimits == undefined) 
            {
                botConfigEquipment[botType].weaponModLimits = 
                {
                    "scopeLimit": 2,
                    "lightLaserLimit": 1
                }
            }
            botConfigEquipment[botType].weaponModLimits.scopeLimit = ModConfig.config.scopeLimit;
            botConfigEquipment[botType].weaponModLimits.lightLaserLimit = ModConfig.config.tacticalLimit;
        }
    }

    private setLootItemResourceRandomization(): void
    {
        // Chance it is 100% full
        let scavFoodMaxChance = 100;
        let scavMedMaxChance = 100;
        let pmcFoodMaxChance = 100;
        let pmcMedMaxChance = 100;

        // Minimum resource amount
        let scavFoodResourcePercent = 60;
        let scavMedResourcePercent = 60;
        let pmcFoodResourcePercent = 60;
        let pmcMedResourcePercent = 60;

        // Check if enabled, if so - change to values in config
        if (ModConfig.config.enableConsumableResourceRandomization)
        {
            scavFoodMaxChance = ModConfig.config.scavFoodRates[0];
            scavMedMaxChance = ModConfig.config.scavMedRates[0];
            pmcFoodMaxChance = ModConfig.config.pmcFoodRates[0];
            pmcMedMaxChance = ModConfig.config.pmcMedRates[0];

            scavFoodResourcePercent = ModConfig.config.scavFoodRates[1];
            scavMedResourcePercent = ModConfig.config.scavMedRates[1];
            pmcFoodResourcePercent = ModConfig.config.pmcFoodRates[1];
            pmcMedResourcePercent = ModConfig.config.pmcMedRates[1];
        }

        // Set values in botConfig
        this.botConfig.lootItemResourceRandomization.assault = {"food": { "chanceMaxResourcePercent": scavFoodMaxChance, "resourcePercent": scavFoodResourcePercent }, "meds": { "chanceMaxResourcePercent": scavMedMaxChance, "resourcePercent": scavMedResourcePercent } }
        this.botConfig.lootItemResourceRandomization.marksman = {"food": { "chanceMaxResourcePercent": scavFoodMaxChance, "resourcePercent": scavFoodResourcePercent }, "meds": { "chanceMaxResourcePercent": scavMedMaxChance, "resourcePercent": scavMedResourcePercent } }
        this.botConfig.lootItemResourceRandomization.pmcusec = {"food": { "chanceMaxResourcePercent": pmcFoodMaxChance, "resourcePercent": pmcFoodResourcePercent }, "meds": { "chanceMaxResourcePercent": pmcMedMaxChance, "resourcePercent": pmcMedResourcePercent } }
        this.botConfig.lootItemResourceRandomization.pmcbear = {"food": { "chanceMaxResourcePercent": pmcFoodMaxChance, "resourcePercent": pmcFoodResourcePercent }, "meds": { "chanceMaxResourcePercent": pmcMedMaxChance, "resourcePercent": pmcMedResourcePercent } }
        this.botConfig.lootItemResourceRandomization.pmc = {"food": { "chanceMaxResourcePercent": pmcFoodMaxChance, "resourcePercent": pmcFoodResourcePercent }, "meds": { "chanceMaxResourcePercent": pmcMedMaxChance, "resourcePercent": pmcMedResourcePercent } }
    }

    private setPMCItemLimits(): void
    {
        this.botConfig.itemSpawnLimits.pmc["60098ad7c2240c0fe85c570a"] = 1;
        this.botConfig.itemSpawnLimits.pmc["590c678286f77426c9660122"] = 1;
        this.botConfig.itemSpawnLimits.pmc["5e831507ea0a7c419c2f9bd9"] = 1;
        this.botConfig.itemSpawnLimits.pmc["590c661e86f7741e566b646a"] = 1;
        this.botConfig.itemSpawnLimits.pmc["544fb45d4bdc2dee738b4568"] = 1;
        this.botConfig.itemSpawnLimits.pmc["5e8488fa988a8701445df1e4"] = 1;
        this.botConfig.itemSpawnLimits.pmc["544fb37f4bdc2dee738b4567"] = 1;
        this.botConfig.itemSpawnLimits.pmc["5448e8d04bdc2ddf718b4569"] = 1;
        this.botConfig.itemSpawnLimits.pmc["5448e8d64bdc2dce718b4568"] = 1;
    }

    private setPMCLoot(): void
    {
        this.pmcConfig.looseWeaponInBackpackLootMinMax.min = 0;
        this.pmcConfig.looseWeaponInBackpackLootMinMax.max = 0;
        if (ModConfig.config.pmcLoot)
        {
            for (const level in this.tierInformation.lootRandomization)
            {
                this.tierInformation.lootRandomization[level].generation.backpackLoot.weights["0"] =  1
                this.tierInformation.lootRandomization[level].generation.backpackLoot.weights["3"] =  2
                this.tierInformation.lootRandomization[level].generation.backpackLoot.weights["5"] =  5
                this.tierInformation.lootRandomization[level].generation.backpackLoot.weights["8"] =  6
                this.tierInformation.lootRandomization[level].generation.backpackLoot.weights["10"] =  5
                this.tierInformation.lootRandomization[level].generation.backpackLoot.weights["12"] =  4
                this.tierInformation.lootRandomization[level].generation.backpackLoot.weights["15"] =  4
                this.tierInformation.lootRandomization[level].generation.backpackLoot.weights["20"] =  3
                this.tierInformation.lootRandomization[level].generation.backpackLoot.weights["23"] =  1
                
                this.tierInformation.lootRandomization[level].generation.pocketLoot.weights["0"] =  1
                this.tierInformation.lootRandomization[level].generation.pocketLoot.weights["1"] =  3
                this.tierInformation.lootRandomization[level].generation.pocketLoot.weights["2"] =  4
                this.tierInformation.lootRandomization[level].generation.pocketLoot.weights["3"] =  2
                this.tierInformation.lootRandomization[level].generation.pocketLoot.weights["4"] =  1
                
                this.tierInformation.lootRandomization[level].generation.vestLoot.weights["0"] =  1
                this.tierInformation.lootRandomization[level].generation.vestLoot.weights["1"] =  2
                this.tierInformation.lootRandomization[level].generation.vestLoot.weights["2"] =  3
                this.tierInformation.lootRandomization[level].generation.vestLoot.weights["3"] =  2
                this.tierInformation.lootRandomization[level].generation.vestLoot.weights["4"] =  1
            }
            for (const tierObject in this.tierInformation.tiers)
            {
                const tierNumber = this.tierInformation.tiers[tierObject].tier
                const tierJson = this.apbsEquipmentGetter.getTierChancesJson(tierNumber);

                tierJson.pmcUSEC.chances.generation.items.backpackLoot.weights["0"] = 4
                tierJson.pmcUSEC.chances.generation.items.backpackLoot.weights["1"] = 15
                tierJson.pmcUSEC.chances.generation.items.backpackLoot.weights["2"] = 40
                tierJson.pmcUSEC.chances.generation.items.backpackLoot.weights["3"] = 10
                tierJson.pmcUSEC.chances.generation.items.backpackLoot.weights["4"] = 8
                tierJson.pmcUSEC.chances.generation.items.backpackLoot.weights["5"] = 2
                tierJson.pmcUSEC.chances.generation.items.backpackLoot.weights["10"] = 1
                tierJson.pmcBEAR.chances.generation.items.backpackLoot.weights["0"] = 4
                tierJson.pmcBEAR.chances.generation.items.backpackLoot.weights["1"] = 15
                tierJson.pmcBEAR.chances.generation.items.backpackLoot.weights["2"] = 40
                tierJson.pmcBEAR.chances.generation.items.backpackLoot.weights["3"] = 10
                tierJson.pmcBEAR.chances.generation.items.backpackLoot.weights["4"] = 8
                tierJson.pmcBEAR.chances.generation.items.backpackLoot.weights["5"] = 2
                tierJson.pmcBEAR.chances.generation.items.backpackLoot.weights["10"] = 1

                tierJson.pmcUSEC.chances.generation.items.pocketLoot.weights["0"] = 4
                tierJson.pmcUSEC.chances.generation.items.pocketLoot.weights["1"] = 9
                tierJson.pmcUSEC.chances.generation.items.pocketLoot.weights["2"] = 1
                tierJson.pmcUSEC.chances.generation.items.pocketLoot.weights["3"] = 1
                tierJson.pmcBEAR.chances.generation.items.pocketLoot.weights["0"] = 4
                tierJson.pmcBEAR.chances.generation.items.pocketLoot.weights["1"] = 9
                tierJson.pmcBEAR.chances.generation.items.pocketLoot.weights["2"] = 1
                tierJson.pmcBEAR.chances.generation.items.pocketLoot.weights["3"] = 1

                tierJson.pmcUSEC.chances.generation.items.vestLoot.weights["0"] = 2
                tierJson.pmcUSEC.chances.generation.items.vestLoot.weights["1"] = 12
                tierJson.pmcUSEC.chances.generation.items.vestLoot.weights["2"] = 1
                tierJson.pmcUSEC.chances.generation.items.vestLoot.weights["3"] = 1
                tierJson.pmcUSEC.chances.generation.items.vestLoot.weights["4"] = 1
                tierJson.pmcBEAR.chances.generation.items.vestLoot.weights["0"] = 2
                tierJson.pmcBEAR.chances.generation.items.vestLoot.weights["1"] = 12
                tierJson.pmcBEAR.chances.generation.items.vestLoot.weights["2"] = 1
                tierJson.pmcBEAR.chances.generation.items.vestLoot.weights["3"] = 1
                tierJson.pmcBEAR.chances.generation.items.vestLoot.weights["4"] = 1
            }            
            this.botConfig.equipment.pmc.randomisation = this.tierInformation.lootRandomization;
        }
        else
        {
            this.botConfig.equipment.pmc.randomisation = this.tierInformation.lootRandomization;
        }

    }

    private setPMCScopeWhitelist(): void
    {
        this.botConfig.equipment.pmc.weaponSightWhitelist = {
            "5447b5fc4bdc2d87278b4567": [
                "55818ad54bdc2ddc698b4569",
                "55818acf4bdc2dde698b456b",
                "55818ae44bdc2dde698b456c",
                "55818ac54bdc2d5b648b456e",
                "55818add4bdc2d5b648b456f",
                "55818aeb4bdc2ddc698b456a"
            ],
            "5447b5f14bdc2d61278b4567": [
                "55818ad54bdc2ddc698b4569",
                "55818acf4bdc2dde698b456b",
                "55818ae44bdc2dde698b456c",
                "55818ac54bdc2d5b648b456e",
                "55818add4bdc2d5b648b456f",
                "55818aeb4bdc2ddc698b456a"
            ],
            "5447bedf4bdc2d87278b4568": [
                "55818ad54bdc2ddc698b4569",
                "55818add4bdc2d5b648b456f",
                "55818ac54bdc2d5b648b456e",
                "55818aeb4bdc2ddc698b456a"
            ],
            "5447bed64bdc2d97278b4568": [
                "55818ad54bdc2ddc698b4569",
                "55818acf4bdc2dde698b456b",
                "55818ac54bdc2d5b648b456e",
                "55818add4bdc2d5b648b456f",
                "55818aeb4bdc2ddc698b456a"
            ],
            "5447b6194bdc2d67278b4567": [
                "55818ad54bdc2ddc698b4569",
                "55818ae44bdc2dde698b456c",
                "55818ac54bdc2d5b648b456e",
                "55818aeb4bdc2ddc698b456a",
                "55818add4bdc2d5b648b456f"
            ],
            "5447b5cf4bdc2d65278b4567": [
                "55818ad54bdc2ddc698b4569",
                "55818acf4bdc2dde698b456b",
                "55818ac54bdc2d5b648b456e"
            ],
            "617f1ef5e8b54b0998387733": [
                "55818ad54bdc2ddc698b4569",
                "55818acf4bdc2dde698b456b",
                "55818ac54bdc2d5b648b456e"
            ],
            "5447b6094bdc2dc3278b4567": [
                "55818ad54bdc2ddc698b4569",
                "55818acf4bdc2dde698b456b",
                "55818ac54bdc2d5b648b456e"
            ],
            "5447b5e04bdc2d62278b4567": [
                "55818ad54bdc2ddc698b4569",
                "55818acf4bdc2dde698b456b",
                "55818ac54bdc2d5b648b456e"
            ],
            "5447b6254bdc2dc3278b4568": [
                "55818ae44bdc2dde698b456c",
                "55818ac54bdc2d5b648b456e",
                "55818aeb4bdc2ddc698b456a",
                "55818add4bdc2d5b648b456f"
            ]
        };
    }

    private pushScavKeys(): void
    {
        const scavBackpack = this.tables.bots.types.assault.inventory.items.Backpack
        const items = Object.values(this.tables.templates.items);
        const baseClass = this.getKeyConfig();
        const allKeys = items.filter(x => this.itemHelper.isOfBaseclass(x._id, baseClass));

        let count = 0;
        for (const key in allKeys)
        {
            if (scavBackpack[allKeys[key]._id] == undefined)
            {
                scavBackpack[allKeys[key]._id] = 1;
                count++
            }
        }
        this.apbsLogger.log(Logging.DEBUG, `Added ${count} keys to Scav Backpacks (Key Class Added: ${baseClass})`)
    }

    private getKeyConfig(): BaseClasses
    {
        if (ModConfig.config.addAllKeysToScavs) return BaseClasses.KEY
        if (ModConfig.config.addOnlyMechanicalKeysToScavs) return BaseClasses.KEY_MECHANICAL
        if (ModConfig.config.addOnlyKeyCardsToScavs) return BaseClasses.KEYCARD
    }

    private removeScavLoot(): void
    {
        this.tables.bots.types.assault.inventory.items.Backpack = {}
        this.tables.bots.types.assault.inventory.items.Pockets = {}
        this.tables.bots.types.assault.inventory.items.TacticalVest = {}
        this.tables.bots.types.marksman.inventory.items.Backpack = {}
        this.tables.bots.types.marksman.inventory.items.Pockets = {}
        this.tables.bots.types.marksman.inventory.items.TacticalVest = {}
    }

    private setIdenticalScavWeights(): void
    {
        for (const tierObject in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[tierObject].tier
            const tierJson = this.apbsEquipmentGetter.getTierJson(tierNumber, true);
            const scav = tierJson.scav.equipment
            for (const slot in scav)
            {
                if (slot == "SecondPrimaryWeapon" || slot == "ArmBand") continue;
                if (slot == "FirstPrimaryWeapon")
                {
                    for (const subSlot in scav[slot])
                    {
                        for (const item in scav[slot][subSlot])
                        {
                            scav[slot][subSlot][item] = 1;
                        }
                    }
                    continue;
                }
                for (const item in scav[slot])
                {
                    scav[slot][item] = 1;
                }
            }
        }
    }

    private removeThermalGoggles(removeSome: boolean): void
    {
        for (const tierObject in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[tierObject].tier
            const tierJson = this.apbsEquipmentGetter.getTierModsJson(tierNumber, true);
            const tatmMods = tierJson["5a16b8a9fcdbcb00165aa6ca"].mod_nvg;
            const index = tatmMods.indexOf("5c11046cd174af02a012e42b");

            if (removeSome && tierNumber >= ModConfig.config.startTier) continue;
            if (index > -1)
            {
                tatmMods.splice(index, 1)
            }
        }
    }

    private setPMCGameVersionWeights(): void
    {
        this.pmcConfig.gameVersionWeight.standard = ModConfig.config.standard;
        this.pmcConfig.gameVersionWeight.left_behind = ModConfig.config.left_behind;
        this.pmcConfig.gameVersionWeight.prepare_for_escape = ModConfig.config.prepare_for_escape;
        this.pmcConfig.gameVersionWeight.edge_of_darkness = ModConfig.config.edge_of_darkness;
        this.pmcConfig.gameVersionWeight.unheard_edition = ModConfig.config.unheard_edition;
    }

    private setLevelDeltas(): void
    {
        this.tierInformation.tiers[0].botMinLevelVariance = ModConfig.config.tier1LevelDelta[0]
        this.tierInformation.tiers[0].botMaxLevelVariance = ModConfig.config.tier1LevelDelta[1]

        this.tierInformation.tiers[1].botMinLevelVariance = ModConfig.config.tier2LevelDelta[0]
        this.tierInformation.tiers[1].botMaxLevelVariance = ModConfig.config.tier2LevelDelta[1]

        this.tierInformation.tiers[2].botMinLevelVariance = ModConfig.config.tier3LevelDelta[0]
        this.tierInformation.tiers[2].botMaxLevelVariance = ModConfig.config.tier3LevelDelta[1]

        this.tierInformation.tiers[3].botMinLevelVariance = ModConfig.config.tier4LevelDelta[0]
        this.tierInformation.tiers[3].botMaxLevelVariance = ModConfig.config.tier4LevelDelta[1]

        this.tierInformation.tiers[4].botMinLevelVariance = ModConfig.config.tier5LevelDelta[0]
        this.tierInformation.tiers[4].botMaxLevelVariance = ModConfig.config.tier5LevelDelta[1]

        this.tierInformation.tiers[5].botMinLevelVariance = ModConfig.config.tier6LevelDelta[0]
        this.tierInformation.tiers[5].botMaxLevelVariance = ModConfig.config.tier6LevelDelta[1]

        this.tierInformation.tiers[6].botMinLevelVariance = ModConfig.config.tier7LevelDelta[0]
        this.tierInformation.tiers[6].botMaxLevelVariance = ModConfig.config.tier7LevelDelta[1]
    }

    private setScavLevelDeltas(): void
    {
        this.tierInformation.tiers[0].scavMinLevelVariance = ModConfig.config.tier1ScavLevelDelta[0]
        this.tierInformation.tiers[0].scavMaxLevelVariance = ModConfig.config.tier1ScavLevelDelta[1]

        this.tierInformation.tiers[1].scavMinLevelVariance = ModConfig.config.tier2ScavLevelDelta[0]
        this.tierInformation.tiers[1].scavMaxLevelVariance = ModConfig.config.tier2ScavLevelDelta[1]

        this.tierInformation.tiers[2].scavMinLevelVariance = ModConfig.config.tier3ScavLevelDelta[0]
        this.tierInformation.tiers[2].scavMaxLevelVariance = ModConfig.config.tier3ScavLevelDelta[1]

        this.tierInformation.tiers[3].scavMinLevelVariance = ModConfig.config.tier4ScavLevelDelta[0]
        this.tierInformation.tiers[3].scavMaxLevelVariance = ModConfig.config.tier4ScavLevelDelta[1]

        this.tierInformation.tiers[4].scavMinLevelVariance = ModConfig.config.tier5ScavLevelDelta[0]
        this.tierInformation.tiers[4].scavMaxLevelVariance = ModConfig.config.tier5ScavLevelDelta[1]

        this.tierInformation.tiers[5].scavMinLevelVariance = ModConfig.config.tier6ScavLevelDelta[0]
        this.tierInformation.tiers[5].scavMaxLevelVariance = ModConfig.config.tier6ScavLevelDelta[1]

        this.tierInformation.tiers[6].scavMinLevelVariance = ModConfig.config.tier7ScavLevelDelta[0]
        this.tierInformation.tiers[6].scavMaxLevelVariance = ModConfig.config.tier7ScavLevelDelta[1]
    }

    private setPMCSlotIDsToMakeRequired(): void
    {
        this.botConfig.equipment.pmc.weaponSlotIdsToMakeRequired = [ "mod_reciever", "mod_stock" ]
    }    

    private setMuzzleChances(): void
    {
        for (const tierObject in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[tierObject].tier
            const tierJson = this.apbsEquipmentGetter.getTierChancesJson(tierNumber);
            const usec = tierJson.pmcUSEC.chances
            const bear = tierJson.pmcBEAR.chances
            for (const type in usec)
            {
                if (type == "equipment" || type == "equipmentMods" || type == "generation") continue;

                const arrayPosition = tierNumber - 1;

                usec[type].mod_muzzle = ModConfig.config.muzzleChance[arrayPosition]
                usec[type].mod_muzzle_000 = ModConfig.config.muzzleChance[arrayPosition]
                usec[type].mod_muzzle_000 = ModConfig.config.muzzleChance[arrayPosition]

                bear[type].mod_muzzle = ModConfig.config.muzzleChance[arrayPosition]
                bear[type].mod_muzzle_000 = ModConfig.config.muzzleChance[arrayPosition]
                bear[type].mod_muzzle_000 = ModConfig.config.muzzleChance[arrayPosition]
            }
        }
    }
}