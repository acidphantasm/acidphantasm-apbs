/* eslint-disable @typescript-eslint/naming-convention */
import { injectable, inject } from "tsyringe";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { IBotConfig } from "@spt/models/spt/config/IBotConfig";
import { IPmcConfig } from "@spt/models/spt/config/IPmcConfig";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { TierInformation } from "../Globals/TierInformation";
import { ModConfig } from "../Globals/ModConfig";


@injectable()
export class BotConfigs
{
    protected botConfig: IBotConfig;
    protected pmcConfig: IPmcConfig;
    
    constructor(
        @inject("IDatabaseTables") protected tables: IDatabaseTables,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("TierInformation") protected tierInformation: TierInformation
    )
    {
        this.botConfig = this.configServer.getConfig(ConfigTypes.BOT);
        this.pmcConfig = this.configServer.getConfig(ConfigTypes.PMC);
    }

    public initialize(): void
    {
        this.configureBotExperienceLevels();
        this.configurePlateWeightings();
        this.clearNoLongerNeededBotDetails();
        this.configureScavWeaponDurability();
        this.adjustNVG();
        this.setLootItemResourceRandomization();
        if (ModConfig.config.forceStock)
        {
            this.setForceStock();
        }
        if (ModConfig.config.forceWeaponModLimits)
        {
            this.setWeaponModLimits();
        }
        if (!ModConfig.config.disablePMCTierGeneration)
        {
            this.setPMCItemLimits()
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

    private configureScavWeaponDurability(): void
    {
        // Do this better in the future
        const botConfigDurability = this.botConfig.durability

        botConfigDurability.assault.weapon.lowestMax = 50
        botConfigDurability.assault.weapon.highestMax = 90
        botConfigDurability.assault.weapon.maxDelta = 25
        botConfigDurability.assault.weapon.minDelta = 0
        botConfigDurability.assault.weapon.minLimitPercent = 15

        botConfigDurability.marksman.weapon.lowestMax = 50
        botConfigDurability.marksman.weapon.highestMax = 90
        botConfigDurability.marksman.weapon.maxDelta = 25
        botConfigDurability.marksman.weapon.minDelta = 0
        botConfigDurability.marksman.weapon.minLimitPercent = 15
    }

    private adjustNVG(): void
    {
        const botConfigEquipment = this.botConfig.equipment

        for (const botType in botConfigEquipment)
        {
            botConfigEquipment[botType].nvgIsActiveChanceDayPercent = 0;
            botConfigEquipment[botType].nvgIsActiveChanceNightPercent = 95;
            botConfigEquipment[botType].faceShieldIsActiveChancePercent = 100;
        }
    }

    private setForceStock(): void
    {
        const botConfigEquipment = this.botConfig.equipment
        for (const botType in botConfigEquipment)
        {
            botConfigEquipment[botType].forceStock = true;
        }
    }
    private setWeaponModLimits(): void
    {
        const botConfigEquipment = this.botConfig.equipment
        for (const botType in botConfigEquipment)
        {
            botConfigEquipment[botType].weaponModLimits = {                
                "scopeLimit": 2,
                "lightLaserLimit": 2
            };
        }
    }

    private setLootItemResourceRandomization(): void
    {        
        this.botConfig.lootItemResourceRandomization.assault = {"food": { "chanceMaxResourcePercent": 50, "resourcePercent": 65 }, "meds": { "chanceMaxResourcePercent": 50, "resourcePercent": 65 } }
        this.botConfig.lootItemResourceRandomization.marksman = {"food": { "chanceMaxResourcePercent": 50, "resourcePercent": 65 }, "meds": { "chanceMaxResourcePercent": 50, "resourcePercent": 65 } }
        this.botConfig.lootItemResourceRandomization.pmcUSEC = {"food": { "chanceMaxResourcePercent": 50, "resourcePercent": 65 }, "meds": { "chanceMaxResourcePercent": 50, "resourcePercent": 65 } }
        this.botConfig.lootItemResourceRandomization.pmcBEAR = {"food": { "chanceMaxResourcePercent": 50, "resourcePercent": 65 }, "meds": { "chanceMaxResourcePercent": 50, "resourcePercent": 65 } }
        this.botConfig.lootItemResourceRandomization.pmc = {"food": { "chanceMaxResourcePercent": 50, "resourcePercent": 65 }, "meds": { "chanceMaxResourcePercent": 50, "resourcePercent": 65 } }
    }

    private setPMCItemLimits(): void
    {
        this.pmcConfig.looseWeaponInBackpackLootMinMax.min = 0;
        this.pmcConfig.looseWeaponInBackpackLootMinMax.max = 0;
        this.botConfig.equipment.pmc.randomisation = this.tierInformation.lootRandomization;
        this.botConfig.itemSpawnLimits.pmc["60098ad7c2240c0fe85c570a"] = 1
        this.botConfig.itemSpawnLimits.pmc["590c678286f77426c9660122"] = 1
        this.botConfig.itemSpawnLimits.pmc["5e831507ea0a7c419c2f9bd9"] = 1
        this.botConfig.itemSpawnLimits.pmc["590c661e86f7741e566b646a"] = 1
        this.botConfig.itemSpawnLimits.pmc["544fb45d4bdc2dee738b4568"] = 1
        this.botConfig.itemSpawnLimits.pmc["5e8488fa988a8701445df1e4"] = 1
        this.botConfig.itemSpawnLimits.pmc["544fb37f4bdc2dee738b4567"] = 1
        this.botConfig.itemSpawnLimits.pmc["5448e8d04bdc2ddf718b4569"] = 1
        this.botConfig.itemSpawnLimits.pmc["5448e8d64bdc2dce718b4568"] = 1
    }
}