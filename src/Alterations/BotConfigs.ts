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
import { BossBots, EventBots, FollowerBots, PMCBots, ScavBots, SpecialBots } from "../Enums/Bots";


@injectable()
export class BotConfigs
{
    protected botConfig: IBotConfig;
    protected pmcConfig: IPmcConfig;
    
    private pmcLimitedCategories = {
        "5448e8d04bdc2ddf718b4569": 1,
        "5448e8d64bdc2dce718b4568": 1,
        "5448f39d4bdc2d0a728b4568": 1,
        "5448f3a64bdc2d60728b456a": 2,
        "5448f3ac4bdc2dce718b4569": 1,
        "5448f3a14bdc2d27728b4569": 1,        
        "5c99f98d86f7745c314214b3": 1,
        "5c164d2286f774194c5e69fa": 1,
        "550aa4cd4bdc2dd8348b456c": 2,
        "55818add4bdc2d5b648b456f": 1,
        "55818ad54bdc2ddc698b4569": 1,
        "55818aeb4bdc2ddc698b456a": 1,
        "55818ae44bdc2dde698b456c": 1,
        "55818af64bdc2d5b648b4570": 1,
        "5448e54d4bdc2dcc718b4568": 1,
        "5447e1d04bdc2dff2f8b4567": 1,
        "5a341c4686f77469e155819e": 1,
        "55818b164bdc2ddc698b456c": 2,
        "5448bc234bdc2d3c308b4569": 2,
        "543be5dd4bdc2deb348b4569": 1,
        "543be5cb4bdc2deb348b4568": 2,
        "5485a8684bdc2da71d8b4567": 2,
        "5d650c3e815116009f6201d2": 2,
        "543be6564bdc2df4348b4568": 4
    }

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
        // PMC Specific
        this.setPMCItemLimits();
        this.setPMCLoot();
        this.setPMCScopeWhitelist();
        this.setPMCSlotIDsToMakeRequired();
        this.setPMCGameVersionWeights();

        // Scav Specific
        this.pushScavKeys();
        this.setScavLoot();
        this.setIdenticalScavWeights();
        this.setScavLevelDeltas();

        // Boss Specific
        this.setBossLoot();

        // Follower Specific
        this.setFollowerLoot();

        // Special Specific
        this.setSpecialLoot();

        // All bots
        this.setLevelDeltas();
        this.clearNoLongerNeededBotDetails();
        this.configureBotExperienceLevels();
        this.configurePlateWeightings();
        this.configureWeaponDurability();
        this.adjustNVG();
        this.setLootItemResourceRandomization();
        this.setWeaponModLimits();
        this.setCountOfAmmoStacksForSecureContainer();

        // All Bots - Bypasses bot enablement
        this.normalizeHealthPools();
        this.normalizeSkills();

        // Special Handling Needed
        this.removeThermalGoggles(ModConfig.config.generalConfig.enableT7Thermals);
        this.setPlateChances();
        this.setForceStock();
        this.setForceDustCover();
        this.setForceScopes();
        this.setMuzzleChances();
    }

    private normalizeHealthPools(): void
    {
        if (!ModConfig.config.normalizedHealthPool.enable) return;

        const botTable = this.tables.bots.types;
        for (const bot in botTable)
        {
            if (ModConfig.config.normalizedHealthPool.excludedBots.includes(bot.toLowerCase())) continue;
            const bodyParts = botTable[bot].health.BodyParts;
            for (const array in bodyParts)
            {
                bodyParts[array].Head.min = ModConfig.config.normalizedHealthPool.healthHead > 0 ? ModConfig.config.normalizedHealthPool.healthHead : 35;
                bodyParts[array].Head.max = ModConfig.config.normalizedHealthPool.healthHead > 0 ? ModConfig.config.normalizedHealthPool.healthHead : 35;

                bodyParts[array].Chest.min = ModConfig.config.normalizedHealthPool.healthChest > 0 ? ModConfig.config.normalizedHealthPool.healthChest : 85;
                bodyParts[array].Chest.max = ModConfig.config.normalizedHealthPool.healthChest > 0 ? ModConfig.config.normalizedHealthPool.healthChest : 85;

                bodyParts[array].Stomach.min = ModConfig.config.normalizedHealthPool.healthStomach > 0 ? ModConfig.config.normalizedHealthPool.healthStomach : 70;
                bodyParts[array].Stomach.max = ModConfig.config.normalizedHealthPool.healthStomach > 0 ? ModConfig.config.normalizedHealthPool.healthStomach : 70;

                bodyParts[array].LeftArm.min = ModConfig.config.normalizedHealthPool.healthLeftArm > 0 ? ModConfig.config.normalizedHealthPool.healthLeftArm : 60;
                bodyParts[array].LeftArm.max = ModConfig.config.normalizedHealthPool.healthLeftArm > 0 ? ModConfig.config.normalizedHealthPool.healthLeftArm : 60;

                bodyParts[array].RightArm.min = ModConfig.config.normalizedHealthPool.healthRightArm > 0 ? ModConfig.config.normalizedHealthPool.healthRightArm : 60;
                bodyParts[array].RightArm.max = ModConfig.config.normalizedHealthPool.healthRightArm > 0 ? ModConfig.config.normalizedHealthPool.healthRightArm : 60;

                bodyParts[array].LeftLeg.min = ModConfig.config.normalizedHealthPool.healthLeftLeg > 0 ? ModConfig.config.normalizedHealthPool.healthLeftLeg : 65;
                bodyParts[array].LeftLeg.max = ModConfig.config.normalizedHealthPool.healthLeftLeg > 0 ? ModConfig.config.normalizedHealthPool.healthLeftLeg : 65;

                bodyParts[array].RightLeg.min = ModConfig.config.normalizedHealthPool.healthRightLeg > 0 ? ModConfig.config.normalizedHealthPool.healthRightLeg : 65;
                bodyParts[array].RightLeg.max = ModConfig.config.normalizedHealthPool.healthRightLeg > 0 ? ModConfig.config.normalizedHealthPool.healthRightLeg : 65;
            }
        }
    }

    private normalizeSkills(): void
    {
        if (!ModConfig.config.normalizedHealthPool.normalizeSkills) return;

        const botTable = this.tables.bots.types;
        for (const bot in botTable)
        {
            if (bot == "usec" || bot == "bear" || bot == "pmcusec" || bot == "pmcbear") continue;
            for (const skill in botTable[bot].skills.Common)
            {
                if (skill == "Strength") continue;
                const currentSkill = botTable[bot].skills.Common[skill];
                if (currentSkill.max > 100)
                {
                    currentSkill.min = 1;
                    currentSkill.max = 9;
                }
            }
        }
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
            if (!this.raidInformation.isBotEnabled(botType)) continue;
            if (Object.values(EventBots).includes(botType as EventBots)) continue;
            if (Object.values(ScavBots).includes(botType as ScavBots))
            {
                botConfigEquipment[botType].filterPlatesByLevel = true;
                botConfigEquipment[botType].armorPlateWeighting = this.tierInformation.scavArmorPlateWeights;
                continue;
            }
            if (Object.values(PMCBots).includes(botType as PMCBots))
            {
                botConfigEquipment[botType].filterPlatesByLevel = true;
                botConfigEquipment[botType].armorPlateWeighting = this.tierInformation.armorPlateWeights;
                continue;
            }

            botConfigEquipment[botType].filterPlatesByLevel = true;
            botConfigEquipment[botType].armorPlateWeighting = this.tierInformation.nonScavNonPMCArmorPlateWeights;
        }
    }

    private clearNoLongerNeededBotDetails(): void
    {
        const botConfigEquipment = this.botConfig.equipment
        for (const botType in botConfigEquipment)
        {
            if (!this.raidInformation.isBotEnabled(botType)) continue;

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
            if (!this.raidInformation.isBotEnabled(botType)) continue;

            if ((Object.values(PMCBots).includes(botType as PMCBots) || botType == "boss" || botType == "follower") && ModConfig.config.pmcBots.weaponDurability.enable)
            {
                botConfigDurability[botType].weapon.lowestMax = ModConfig.config.pmcBots.weaponDurability.min;
                botConfigDurability[botType].weapon.highestMax = ModConfig.config.pmcBots.weaponDurability.max;
                botConfigDurability[botType].weapon.minDelta = ModConfig.config.pmcBots.weaponDurability.minDelta;
                botConfigDurability[botType].weapon.maxDelta = ModConfig.config.pmcBots.weaponDurability.maxDelta;
                botConfigDurability[botType].weapon.minLimitPercent = ModConfig.config.pmcBots.weaponDurability.minLimitPercent;
            }
            if (Object.values(ScavBots).includes(botType as ScavBots) && ModConfig.config.scavBots.weaponDurability.enable)
            {
                botConfigDurability[botType].weapon.lowestMax = ModConfig.config.scavBots.weaponDurability.min;
                botConfigDurability[botType].weapon.highestMax = ModConfig.config.scavBots.weaponDurability.max;
                botConfigDurability[botType].weapon.minDelta = ModConfig.config.scavBots.weaponDurability.minDelta;
                botConfigDurability[botType].weapon.maxDelta = ModConfig.config.scavBots.weaponDurability.maxDelta;
                botConfigDurability[botType].weapon.minLimitPercent = ModConfig.config.scavBots.weaponDurability.minLimitPercent;
            }
            if (Object.values(BossBots).includes(botType as BossBots) && ModConfig.config.bossBots.weaponDurability.enable)
            {
                botConfigDurability[botType].weapon.lowestMax = ModConfig.config.bossBots.weaponDurability.min;
                botConfigDurability[botType].weapon.highestMax = ModConfig.config.bossBots.weaponDurability.max;
                botConfigDurability[botType].weapon.minDelta = ModConfig.config.bossBots.weaponDurability.minDelta;
                botConfigDurability[botType].weapon.maxDelta = ModConfig.config.bossBots.weaponDurability.maxDelta;
                botConfigDurability[botType].weapon.minLimitPercent = ModConfig.config.bossBots.weaponDurability.minLimitPercent;
            }
            if (Object.values(FollowerBots).includes(botType as FollowerBots) && ModConfig.config.followerBots.weaponDurability.enable)
            {
                botConfigDurability[botType].weapon.lowestMax = ModConfig.config.followerBots.weaponDurability.min;
                botConfigDurability[botType].weapon.highestMax = ModConfig.config.followerBots.weaponDurability.max;
                botConfigDurability[botType].weapon.minDelta = ModConfig.config.followerBots.weaponDurability.minDelta;
                botConfigDurability[botType].weapon.maxDelta = ModConfig.config.followerBots.weaponDurability.maxDelta;
                botConfigDurability[botType].weapon.minLimitPercent = ModConfig.config.followerBots.weaponDurability.minLimitPercent;
            }
            if (Object.values(SpecialBots).includes(botType as SpecialBots) && ModConfig.config.specialBots.weaponDurability.enable)
            {
                botConfigDurability[botType].weapon.lowestMax = ModConfig.config.specialBots.weaponDurability.min;
                botConfigDurability[botType].weapon.highestMax = ModConfig.config.specialBots.weaponDurability.max;
                botConfigDurability[botType].weapon.minDelta = ModConfig.config.specialBots.weaponDurability.minDelta;
                botConfigDurability[botType].weapon.maxDelta = ModConfig.config.specialBots.weaponDurability.maxDelta;
                botConfigDurability[botType].weapon.minLimitPercent = ModConfig.config.specialBots.weaponDurability.minLimitPercent;
            }
        }
    }

    private adjustNVG(): void
    {
        const botConfigEquipment = this.botConfig.equipment

        for (const botType in botConfigEquipment)
        {
            if (!this.raidInformation.isBotEnabled(botType)) continue;

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
        if (!ModConfig.config.generalConfig.forceStock) return;

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
        if (!ModConfig.config.generalConfig.forceDustCover) return;

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
        if (!ModConfig.config.generalConfig.forceScopeSlot) return;

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
        if (!ModConfig.config.generalConfig.plateChances.enable) return;

        for (const tierObject in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[tierObject].tier
            const tierJson = this.apbsEquipmentGetter.getTierChancesJson(tierNumber);

            for (const botType in this.tierInformation.tier1chances)
            {
                if (botType == "pmcUSEC" || botType == "pmcBEAR")
                {
                    tierJson[botType].chances.equipmentMods["back_plate"] = tierJson[botType].chances.equipmentMods["front_plate"] = ModConfig.config.generalConfig.plateChances.pmcMainPlateChance[tierObject];
                    tierJson[botType].chances.equipmentMods["left_side_plate"] = tierJson[botType].chances.equipmentMods["right_side_plate"] = ModConfig.config.generalConfig.plateChances.pmcSidePlateChance[tierObject];
                }
                if (botType == "followerbirdeye" || botType == "followerbigpipe" || botType.includes("boss"))
                {
                    tierJson[botType].chances.equipmentMods["back_plate"] = tierJson[botType].chances.equipmentMods["front_plate"] = ModConfig.config.generalConfig.plateChances.bossMainPlateChance[tierObject];
                    tierJson[botType].chances.equipmentMods["left_side_plate"] = tierJson[botType].chances.equipmentMods["right_side_plate"] = ModConfig.config.generalConfig.plateChances.bossSidePlateChance[tierObject];
                }
                if (botType == "scav")
                {
                    tierJson[botType].chances.equipmentMods["back_plate"] = tierJson[botType].chances.equipmentMods["front_plate"] = ModConfig.config.generalConfig.plateChances.scavMainPlateChance[tierObject];
                    tierJson[botType].chances.equipmentMods["left_side_plate"] = tierJson[botType].chances.equipmentMods["right_side_plate"] = ModConfig.config.generalConfig.plateChances.scavSidePlateChance[tierObject];
                }
                if (botType == "exusec" || botType == "pmcbot" || botType.includes("sectant"))
                {
                    tierJson[botType].chances.equipmentMods["back_plate"] = tierJson[botType].chances.equipmentMods["front_plate"] = ModConfig.config.generalConfig.plateChances.specialMainPlateChance[tierObject];
                    tierJson[botType].chances.equipmentMods["left_side_plate"] = tierJson[botType].chances.equipmentMods["right_side_plate"] = ModConfig.config.generalConfig.plateChances.specialSidePlateChance[tierObject];
                }
                if (botType == "default")
                {
                    tierJson[botType].chances.equipmentMods["back_plate"] = tierJson[botType].chances.equipmentMods["front_plate"] = ModConfig.config.generalConfig.plateChances.followerMainPlateChance[tierObject];
                    tierJson[botType].chances.equipmentMods["left_side_plate"] = tierJson[botType].chances.equipmentMods["right_side_plate"] = ModConfig.config.generalConfig.plateChances.followerSidePlateChance[tierObject];
                }
            }
        }
    }

    private setWeaponModLimits(): void
    {
        if (!ModConfig.config.generalConfig.forceWeaponModLimits) return;

        const botConfigEquipment = this.botConfig.equipment
        for (const botType in botConfigEquipment)
        {
            if (!this.raidInformation.isBotEnabled(botType)) continue;

            if (botConfigEquipment[botType].weaponModLimits == undefined) 
            {
                botConfigEquipment[botType].weaponModLimits = 
                {
                    "scopeLimit": 2,
                    "lightLaserLimit": 1
                }
            }
            botConfigEquipment[botType].weaponModLimits.scopeLimit = ModConfig.config.generalConfig.scopeLimit;
            botConfigEquipment[botType].weaponModLimits.lightLaserLimit = ModConfig.config.generalConfig.tacticalLimit;
        }
    }

    private setLootItemResourceRandomization(): void
    {
        const botTable = this.tables.bots.types
        const botConfig = this.botConfig;

        for (const botType in botTable)
        {
            if (!this.raidInformation.isBotEnabled(botType)) continue;
            
            let setValues = false;
            let foodMaxChance = 100;
            let medMaxChance = 100;
            let foodResourcePercent = 60;
            let medResourcePercent = 60;

            if (Object.values(PMCBots).includes(botType as PMCBots) && ModConfig.config.pmcBots.resourceRandomization.enable)
            {
                setValues = true;
                foodMaxChance = ModConfig.config.pmcBots.resourceRandomization.foodRateMaxChance;
                foodResourcePercent = ModConfig.config.pmcBots.resourceRandomization.foodRateUsagePercent;
                medMaxChance = ModConfig.config.pmcBots.resourceRandomization.medRateMaxChance;
                medResourcePercent = ModConfig.config.pmcBots.resourceRandomization.medRateUsagePercent;
            }
            if (Object.values(ScavBots).includes(botType as ScavBots) && ModConfig.config.scavBots.resourceRandomization.enable)
            {
                setValues = true;
                foodMaxChance = ModConfig.config.scavBots.resourceRandomization.foodRateMaxChance;
                foodResourcePercent = ModConfig.config.scavBots.resourceRandomization.foodRateUsagePercent;
                medMaxChance = ModConfig.config.scavBots.resourceRandomization.medRateMaxChance;
                medResourcePercent = ModConfig.config.scavBots.resourceRandomization.medRateUsagePercent;
            }
            if (Object.values(BossBots).includes(botType as BossBots) && ModConfig.config.bossBots.resourceRandomization.enable)
            {
                setValues = true;
                foodMaxChance = ModConfig.config.bossBots.resourceRandomization.foodRateMaxChance;
                foodResourcePercent = ModConfig.config.bossBots.resourceRandomization.foodRateUsagePercent;
                medMaxChance = ModConfig.config.bossBots.resourceRandomization.medRateMaxChance;
                medResourcePercent = ModConfig.config.bossBots.resourceRandomization.medRateUsagePercent;
            }
            if (Object.values(FollowerBots).includes(botType as FollowerBots) && ModConfig.config.followerBots.resourceRandomization.enable)
            {
                setValues = true;
                foodMaxChance = ModConfig.config.followerBots.resourceRandomization.foodRateMaxChance;
                foodResourcePercent = ModConfig.config.followerBots.resourceRandomization.foodRateUsagePercent;
                medMaxChance = ModConfig.config.followerBots.resourceRandomization.medRateMaxChance;
                medResourcePercent = ModConfig.config.followerBots.resourceRandomization.medRateUsagePercent;
            }
            if (Object.values(SpecialBots).includes(botType as SpecialBots) && ModConfig.config.specialBots.resourceRandomization.enable)
            {
                setValues = true;
                foodMaxChance = ModConfig.config.specialBots.resourceRandomization.foodRateMaxChance;
                foodResourcePercent = ModConfig.config.specialBots.resourceRandomization.foodRateUsagePercent;
                medMaxChance = ModConfig.config.specialBots.resourceRandomization.medRateMaxChance;
                medResourcePercent = ModConfig.config.specialBots.resourceRandomization.medRateUsagePercent;
            }
            if (!setValues) continue;

            botConfig.lootItemResourceRandomization[botType] = 
            {
                "food": 
                { 
                    "chanceMaxResourcePercent": foodMaxChance, 
                    "resourcePercent": foodResourcePercent 
                }, 
                "meds": 
                { 
                    "chanceMaxResourcePercent": medMaxChance, 
                    "resourcePercent": medResourcePercent 
                } 
            }
        }
    }

    private setPMCItemLimits(): void
    {
        if (!ModConfig.config.pmcBots.enable) return;

        // Clear PMC item limits
        this.botConfig.itemSpawnLimits.pmc = {}

        // Go through custom limits and add them
        for (const [item, count] of Object.entries(this.pmcLimitedCategories))
        {
            this.botConfig.itemSpawnLimits.pmc[item] = count;
        }
    }

    private setPMCLoot(): void
    {
        if (!ModConfig.config.pmcBots.enable) return;

        const allBots = this.database.getTables().bots.types;

        this.pmcConfig.looseWeaponInBackpackLootMinMax.min = 0;
        this.pmcConfig.looseWeaponInBackpackLootMinMax.max = 0;
        this.botConfig.equipment.pmc.randomisation = [];

        if (ModConfig.config.pmcBots.lootConfig.enable)
        {
            if (ModConfig.config.pmcBots.lootConfig.blacklist.length > 0)
            {
                for (const item of ModConfig.config.pmcBots.lootConfig.blacklist)
                {
                    this.pmcConfig.backpackLoot.blacklist.push(item);
                    this.pmcConfig.vestLoot.blacklist.push(item);
                    this.pmcConfig.pocketLoot.blacklist.push(item);
                }
            }
        }
        if (!ModConfig.config.pmcBots.lootConfig.enable)
        {            
            this.botConfig.disableLootOnBotTypes.push("pmcusec", "pmcbear")
        }
        
        for (const botType in allBots)
        {
            if (botType == "pmcbear" || botType == "pmcusec")
            {
                allBots[botType].inventory.items.Backpack = {};
                allBots[botType].inventory.items.Pockets = {};
                allBots[botType].inventory.items.TacticalVest = {};
                allBots[botType].inventory.items.SpecialLoot = {};
            }
        }
    }

    private setPMCScopeWhitelist(): void
    {
        if (!ModConfig.config.pmcBots.enable) return;

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
        if (!ModConfig.config.scavBots.enable) return;
        if (!ModConfig.config.scavBots.keyConfig.addAllKeysToScavs && !ModConfig.config.scavBots.keyConfig.addOnlyMechanicalKeysToScavs && !ModConfig.config.scavBots.keyConfig.addOnlyKeyCardsToScavs) return;

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
        if (ModConfig.config.scavBots.keyConfig.addAllKeysToScavs) return BaseClasses.KEY
        if (ModConfig.config.scavBots.keyConfig.addOnlyMechanicalKeysToScavs) return BaseClasses.KEY_MECHANICAL
        if (ModConfig.config.scavBots.keyConfig.addOnlyKeyCardsToScavs) return BaseClasses.KEYCARD
    }

    private setScavLoot(): void
    {
        if (!ModConfig.config.scavBots.enable) return;
        if (!ModConfig.config.scavBots.lootConfig.enable)
        {
            Object.values(ScavBots).forEach((bot) => 
            {
                this.botConfig.disableLootOnBotTypes.push(bot);
            })
            return;
        }

        const botTable = this.database.getTables().bots.types;

        if (ModConfig.config.scavBots.lootConfig.blacklist.length > 0)
        {
            for (const botType in botTable)
            {
                if (Object.values(ScavBots).includes(botType as ScavBots))
                {
                    for (const item of ModConfig.config.scavBots.lootConfig.blacklist)
                    {
                        if (Object.keys(botTable[botType].inventory.items.TacticalVest).includes(item))
                        {
                            const tacticalVestLootTable = Object.keys(botTable[botType].inventory.items.TacticalVest);
                            const index = tacticalVestLootTable.indexOf(item);
                            if (index > -1)
                            {
                                tacticalVestLootTable.splice(index, 1)
                            }
                        }
                        if (Object.keys(botTable[botType].inventory.items.Pockets).includes(item))
                        {
                            const pocketsLootTable = Object.keys(botTable[botType].inventory.items.Pockets);
                            const index = pocketsLootTable.indexOf(item);
                            if (index > -1)
                            {
                                pocketsLootTable.splice(index, 1)
                            }
                        }
                        if (Object.keys(botTable[botType].inventory.items.Backpack).includes(item))
                        {
                            const backpackLootTable = Object.keys(botTable[botType].inventory.items.Backpack);
                            const index = backpackLootTable.indexOf(item);
                            if (index > -1)
                            {
                                backpackLootTable.splice(index, 1)
                            }
                        }
                    }
                }
            }
        }
    }
    
    private setBossLoot(): void
    {
        if (!ModConfig.config.bossBots.enable) return;
        if (!ModConfig.config.bossBots.lootConfig.enable)
        {
            Object.values(BossBots).forEach((bot) => 
            {
                this.botConfig.disableLootOnBotTypes.push(bot);
            })
            return;
        }

        const botTable = this.database.getTables().bots.types;

        if (ModConfig.config.bossBots.lootConfig.blacklist.length > 0)
        {
            for (const botType in botTable)
            {
                if (Object.values(BossBots).includes(botType as BossBots))
                {
                    for (const item of ModConfig.config.bossBots.lootConfig.blacklist)
                    {
                        if (Object.keys(botTable[botType].inventory.items.TacticalVest).includes(item))
                        {
                            const tacticalVestLootTable = Object.keys(botTable[botType].inventory.items.TacticalVest);
                            const index = tacticalVestLootTable.indexOf(item);
                            if (index > -1)
                            {
                                tacticalVestLootTable.splice(index, 1)
                            }
                        }
                        if (Object.keys(botTable[botType].inventory.items.Pockets).includes(item))
                        {
                            const pocketsLootTable = Object.keys(botTable[botType].inventory.items.Pockets);
                            const index = pocketsLootTable.indexOf(item);
                            if (index > -1)
                            {
                                pocketsLootTable.splice(index, 1)
                            }
                        }
                        if (Object.keys(botTable[botType].inventory.items.Backpack).includes(item))
                        {
                            const backpackLootTable = Object.keys(botTable[botType].inventory.items.Backpack);
                            const index = backpackLootTable.indexOf(item);
                            if (index > -1)
                            {
                                backpackLootTable.splice(index, 1)
                            }
                        }
                    }
                }
            }
        }
    }

    private setFollowerLoot(): void
    {
        if (!ModConfig.config.followerBots.enable) return;
        if (!ModConfig.config.followerBots.lootConfig.enable)
        {
            Object.values(FollowerBots).forEach((bot) => 
            {
                this.botConfig.disableLootOnBotTypes.push(bot);
            })
            return;
        }

        const botTable = this.database.getTables().bots.types;

        if (ModConfig.config.followerBots.lootConfig.blacklist.length > 0)
        {
            for (const botType in botTable)
            {
                if (Object.values(FollowerBots).includes(botType as FollowerBots))
                {
                    for (const item of ModConfig.config.followerBots.lootConfig.blacklist)
                    {
                        if (Object.keys(botTable[botType].inventory.items.TacticalVest).includes(item))
                        {
                            const tacticalVestLootTable = Object.keys(botTable[botType].inventory.items.TacticalVest);
                            const index = tacticalVestLootTable.indexOf(item);
                            if (index > -1)
                            {
                                tacticalVestLootTable.splice(index, 1)
                            }
                        }
                        if (Object.keys(botTable[botType].inventory.items.Pockets).includes(item))
                        {
                            const pocketsLootTable = Object.keys(botTable[botType].inventory.items.Pockets);
                            const index = pocketsLootTable.indexOf(item);
                            if (index > -1)
                            {
                                pocketsLootTable.splice(index, 1)
                            }
                        }
                        if (Object.keys(botTable[botType].inventory.items.Backpack).includes(item))
                        {
                            const backpackLootTable = Object.keys(botTable[botType].inventory.items.Backpack);
                            const index = backpackLootTable.indexOf(item);
                            if (index > -1)
                            {
                                backpackLootTable.splice(index, 1)
                            }
                        }
                    }
                }
            }
        }
    }
    
    private setSpecialLoot(): void
    {
        if (!ModConfig.config.specialBots.enable) return;
        if (!ModConfig.config.specialBots.lootConfig.enable)
        {
            Object.values(SpecialBots).forEach((bot) => 
            {
                this.botConfig.disableLootOnBotTypes.push(bot);
            })
            return;
        }

        const botTable = this.database.getTables().bots.types;

        if (ModConfig.config.specialBots.lootConfig.blacklist.length > 0)
        {
            for (const botType in botTable)
            {
                if (Object.values(SpecialBots).includes(botType as SpecialBots))
                {
                    for (const item of ModConfig.config.specialBots.lootConfig.blacklist)
                    {
                        if (Object.keys(botTable[botType].inventory.items.TacticalVest).includes(item))
                        {
                            const tacticalVestLootTable = Object.keys(botTable[botType].inventory.items.TacticalVest);
                            const index = tacticalVestLootTable.indexOf(item);
                            if (index > -1)
                            {
                                tacticalVestLootTable.splice(index, 1)
                            }
                        }
                        if (Object.keys(botTable[botType].inventory.items.Pockets).includes(item))
                        {
                            const pocketsLootTable = Object.keys(botTable[botType].inventory.items.Pockets);
                            const index = pocketsLootTable.indexOf(item);
                            if (index > -1)
                            {
                                pocketsLootTable.splice(index, 1)
                            }
                        }
                        if (Object.keys(botTable[botType].inventory.items.Backpack).includes(item))
                        {
                            const backpackLootTable = Object.keys(botTable[botType].inventory.items.Backpack);
                            const index = backpackLootTable.indexOf(item);
                            if (index > -1)
                            {
                                backpackLootTable.splice(index, 1)
                            }
                        }
                    }
                }
            }
        }
    }

    private setIdenticalScavWeights(): void
    {
        if (!ModConfig.config.scavBots.enable) return;
        if (!ModConfig.config.scavBots.additionalOptions.enableScavEqualEquipmentTiering) return;
        
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

            if (removeSome && tierNumber >= ModConfig.config.generalConfig.startTier) continue;
            if (index > -1)
            {
                tatmMods.splice(index, 1)
            }
        }
    }

    private setPMCGameVersionWeights(): void
    {
        if (!ModConfig.config.pmcBots.enable || !ModConfig.config.pmcBots.additionalOptions.gameVersionWeighting.enable) return;

        this.pmcConfig.gameVersionWeight.standard = ModConfig.config.pmcBots.additionalOptions.gameVersionWeighting.standard;
        this.pmcConfig.gameVersionWeight.left_behind = ModConfig.config.pmcBots.additionalOptions.gameVersionWeighting.leftBehind;
        this.pmcConfig.gameVersionWeight.prepare_for_escape = ModConfig.config.pmcBots.additionalOptions.gameVersionWeighting.prepareForEscape;
        this.pmcConfig.gameVersionWeight.edge_of_darkness = ModConfig.config.pmcBots.additionalOptions.gameVersionWeighting.edgeOfDarkness;
        this.pmcConfig.gameVersionWeight.unheard_edition = ModConfig.config.pmcBots.additionalOptions.gameVersionWeighting.unheardEdition;
    }

    private setLevelDeltas(): void
    {
        if (!ModConfig.config.customLevelDeltas.enable) return;

        this.tierInformation.tiers[0].botMinLevelVariance = ModConfig.config.customLevelDeltas.tier1.min;
        this.tierInformation.tiers[0].botMaxLevelVariance = ModConfig.config.customLevelDeltas.tier1.max;

        this.tierInformation.tiers[1].botMinLevelVariance = ModConfig.config.customLevelDeltas.tier2.min;
        this.tierInformation.tiers[1].botMaxLevelVariance = ModConfig.config.customLevelDeltas.tier2.max;

        this.tierInformation.tiers[2].botMinLevelVariance = ModConfig.config.customLevelDeltas.tier3.min;
        this.tierInformation.tiers[2].botMaxLevelVariance = ModConfig.config.customLevelDeltas.tier3.max;

        this.tierInformation.tiers[3].botMinLevelVariance = ModConfig.config.customLevelDeltas.tier4.min;
        this.tierInformation.tiers[3].botMaxLevelVariance = ModConfig.config.customLevelDeltas.tier4.max;

        this.tierInformation.tiers[4].botMinLevelVariance = ModConfig.config.customLevelDeltas.tier5.min;
        this.tierInformation.tiers[4].botMaxLevelVariance = ModConfig.config.customLevelDeltas.tier5.max;

        this.tierInformation.tiers[5].botMinLevelVariance = ModConfig.config.customLevelDeltas.tier6.min;
        this.tierInformation.tiers[5].botMaxLevelVariance = ModConfig.config.customLevelDeltas.tier6.min;

        this.tierInformation.tiers[6].botMinLevelVariance = ModConfig.config.customLevelDeltas.tier7.min;
        this.tierInformation.tiers[6].botMaxLevelVariance = ModConfig.config.customLevelDeltas.tier7.max;
    }

    private setScavLevelDeltas(): void
    {
        if (!ModConfig.config.customScavLevelDeltas.enable) return;

        this.tierInformation.tiers[0].scavMinLevelVariance = ModConfig.config.customScavLevelDeltas.tier1.min;
        this.tierInformation.tiers[0].scavMaxLevelVariance = ModConfig.config.customScavLevelDeltas.tier1.max;

        this.tierInformation.tiers[1].scavMinLevelVariance = ModConfig.config.customScavLevelDeltas.tier2.min;
        this.tierInformation.tiers[1].scavMaxLevelVariance = ModConfig.config.customScavLevelDeltas.tier2.max;

        this.tierInformation.tiers[2].scavMinLevelVariance = ModConfig.config.customScavLevelDeltas.tier3.min;
        this.tierInformation.tiers[2].scavMaxLevelVariance = ModConfig.config.customScavLevelDeltas.tier3.max;

        this.tierInformation.tiers[3].scavMinLevelVariance = ModConfig.config.customScavLevelDeltas.tier4.min;
        this.tierInformation.tiers[3].scavMaxLevelVariance = ModConfig.config.customScavLevelDeltas.tier4.max;

        this.tierInformation.tiers[4].scavMinLevelVariance = ModConfig.config.customScavLevelDeltas.tier5.min;
        this.tierInformation.tiers[4].scavMaxLevelVariance = ModConfig.config.customScavLevelDeltas.tier5.max;

        this.tierInformation.tiers[5].scavMinLevelVariance = ModConfig.config.customScavLevelDeltas.tier6.min;
        this.tierInformation.tiers[5].scavMaxLevelVariance = ModConfig.config.customScavLevelDeltas.tier6.max;

        this.tierInformation.tiers[6].scavMinLevelVariance = ModConfig.config.customScavLevelDeltas.tier7.min;
        this.tierInformation.tiers[6].scavMaxLevelVariance = ModConfig.config.customScavLevelDeltas.tier7.max;
    }

    private setPMCSlotIDsToMakeRequired(): void
    {
        if (!ModConfig.config.pmcBots.enable) return;

        this.botConfig.equipment.pmc.weaponSlotIdsToMakeRequired = [ "mod_reciever", "mod_stock" ]
    }    

    private setMuzzleChances(): void
    {
        if (!ModConfig.config.generalConfig.forceMuzzle) return;

        for (const tierObject in this.tierInformation.tiers)
        {
            const tierNumber = this.tierInformation.tiers[tierObject].tier
            const tierJson = this.apbsEquipmentGetter.getTierChancesJson(tierNumber);

            for (const botType in tierJson)
            {
                const botChanceJson = tierJson[botType].chances;
                for (const chanceType in botChanceJson)
                {
                    if (chanceType == "equipment" || chanceType == "equipmentMods" || chanceType == "generation") continue;

                    const arrayPosition = tierNumber - 1;
                    tierJson[botType].chances[chanceType].mod_muzzle = ModConfig.config.generalConfig.muzzleChance[arrayPosition];
                    tierJson[botType].chances[chanceType].mod_muzzle_000 = ModConfig.config.generalConfig.muzzleChance[arrayPosition];
                    tierJson[botType].chances[chanceType].mod_muzzle_001 = ModConfig.config.generalConfig.muzzleChance[arrayPosition];
                }
            }
        }
    }

    private setCountOfAmmoStacksForSecureContainer(): void
    {
        this.botConfig.secureContainerAmmoStackCount = ModConfig.config.compatibilityConfig.General_SecureContainerAmmoStacks;
    }
}