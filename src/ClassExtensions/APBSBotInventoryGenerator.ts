import { inject, injectable } from "tsyringe";

import { BotEquipmentModGenerator } from "@spt/generators/BotEquipmentModGenerator";
import { BotLootGenerator } from "@spt/generators/BotLootGenerator";
import { BotWeaponGenerator } from "@spt/generators/BotWeaponGenerator";
import { BotGeneratorHelper } from "@spt/helpers/BotGeneratorHelper";
import { BotHelper } from "@spt/helpers/BotHelper";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { ContextVariableType } from "@spt/context/ContextVariableType";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { IInventory as PmcInventory } from "@spt/models/eft/common/tables/IBotBase";
import { IChances, IGeneration, IBotType, IInventory } from "@spt/models/eft/common/tables/IBotType";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { EquipmentSlots } from "@spt/models/enums/EquipmentSlots";
import { IGenerateEquipmentProperties } from "@spt/models/spt/bots/IGenerateEquipmentProperties";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { BotEquipmentModPoolService } from "@spt/services/BotEquipmentModPoolService";
import { DatabaseService } from "@spt/services/DatabaseService";
import { LocalisationService } from "@spt/services/LocalisationService";
import { HashUtil } from "@spt/utils/HashUtil";
import { RandomUtil } from "@spt/utils/RandomUtil";


import { BotInventoryGenerator } from "@spt/generators/BotInventoryGenerator";
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { APBSTierGetter } from "../Utils/APBSTierGetter";
import { ModConfig } from "../Globals/ModConfig";
import { APBSBotWeaponGenerator } from "../ClassExtensions/APBSBotWeaponGenerator";
import { ApplicationContext } from "@spt/context/ApplicationContext";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";
import { WeatherHelper } from "@spt/helpers/WeatherHelper";
import { BotEquipmentFilterService } from "@spt/services/BotEquipmentFilterService";
import { IGetRaidConfigurationRequestData } from "@spt/models/eft/match/IGetRaidConfigurationRequestData";

/** Handle profile related client events */
@injectable()
export class APBSBotInventoryGenerator extends BotInventoryGenerator
{
    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("ApplicationContext") protected applicationContext: ApplicationContext,
        @inject("BotWeaponGenerator") protected botWeaponGenerator: BotWeaponGenerator,
        @inject("BotLootGenerator") protected botLootGenerator: BotLootGenerator,
        @inject("BotGeneratorHelper") protected botGeneratorHelper: BotGeneratorHelper,
        @inject("ProfileHelper") protected profileHelper: ProfileHelper,
        @inject("BotHelper") protected botHelper: BotHelper,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("WeatherHelper") protected weatherHelper: WeatherHelper,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("BotEquipmentFilterService") protected botEquipmentFilterService: BotEquipmentFilterService,
        @inject("BotEquipmentModPoolService") protected botEquipmentModPoolService: BotEquipmentModPoolService,
        @inject("BotEquipmentModGenerator") protected botEquipmentModGenerator: BotEquipmentModGenerator,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("APBSTierGetter") protected apbsTierGetter: APBSTierGetter,
        @inject("APBSBotWeaponGenerator") protected apbsBotWeaponGenerator: APBSBotWeaponGenerator
    )
    {
        super(logger, 
            hashUtil, 
            randomUtil, 
            databaseService, 
            applicationContext,
            botWeaponGenerator, 
            botLootGenerator, 
            botGeneratorHelper, 
            profileHelper,
            botHelper, 
            weightedRandomHelper, 
            itemHelper,
            weatherHelper,
            localisationService, 
            botEquipmentFilterService,
            botEquipmentModPoolService, 
            botEquipmentModGenerator, 
            configServer)
    }

    public override generateInventory(
        sessionId: string,
        botJsonTemplate: IBotType,
        botRole: string,
        isPmc: boolean,
        botLevel: number,
        chosenGameVersion: string
    ): PmcInventory 
    {
        const templateInventory = botJsonTemplate.inventory;
        let wornItemChances = botJsonTemplate.chances;
        const itemGenerationLimitsMinMax = botJsonTemplate.generation;

        // Generate base inventory with no items
        const botInventory = this.generateInventoryBase();
        
        const raidConfig = this.applicationContext
            .getLatestValue(ContextVariableType.RAID_CONFIGURATION)
            ?.getValue<IGetRaidConfigurationRequestData>();

        this.generateAndAddEquipmentToBot(
            sessionId,
            templateInventory,
            wornItemChances,
            botRole,
            botInventory,
            botLevel,
            chosenGameVersion,
            raidConfig
        );
        // Roll weapon spawns (primary/secondary/holster) and generate a weapon for each roll that passed
        if (((botRole.includes("boss") || botRole.includes("sectant") || botRole.includes("arena")) && ModConfig.config.disableBossTierGeneration) || botRole == "bosslegion" || botRole == "bosspunisher")
        {
            this.generateAndAddWeaponsToBot(templateInventory, wornItemChances, sessionId, botInventory, botRole, isPmc, itemGenerationLimitsMinMax, botLevel);
            this.botLootGenerator.generateLoot(sessionId, botJsonTemplate, isPmc, botRole, botInventory, botLevel);
    
            return botInventory;
        }
        if (botRole.includes("follower") && ModConfig.config.disableBossFollowerTierGeneration)
        {
            this.generateAndAddWeaponsToBot(templateInventory, wornItemChances, sessionId, botInventory, botRole, isPmc, itemGenerationLimitsMinMax, botLevel);
            this.botLootGenerator.generateLoot(sessionId, botJsonTemplate, isPmc, botRole, botInventory, botLevel);
    
            return botInventory;
        }
        if ((botRole.includes("exusec") || botRole.includes("pmcbot")) && !ModConfig.config.disableRaiderRogueTierGeneration)
        {
            this.generateAndAddWeaponsToBot(templateInventory, wornItemChances, sessionId, botInventory, botRole, isPmc, itemGenerationLimitsMinMax, botLevel);
            this.botLootGenerator.generateLoot(sessionId, botJsonTemplate, isPmc, botRole, botInventory, botLevel);
    
            return botInventory;
        }
        if (botRole.includes("pmc") && ModConfig.config.disablePMCTierGeneration)
        {
            this.generateAndAddWeaponsToBot(templateInventory, wornItemChances, sessionId, botInventory, botRole, isPmc, itemGenerationLimitsMinMax, botLevel);
            this.botLootGenerator.generateLoot(sessionId, botJsonTemplate, isPmc, botRole, botInventory, botLevel);
    
            return botInventory;
        }
        if ((botRole.includes("assault") || botRole.includes("marksman")) && ModConfig.config.disableScavTierGeneration)
        {
            this.generateAndAddWeaponsToBot(templateInventory, wornItemChances, sessionId, botInventory, botRole, isPmc, itemGenerationLimitsMinMax, botLevel);
            this.botLootGenerator.generateLoot(sessionId, botJsonTemplate, isPmc, botRole, botInventory, botLevel);
    
            return botInventory;
        }
        
        if (botRole.includes("infected") || botRole.includes("spirit") || botRole.includes("skier") || botRole.includes("peacemaker") || botRole.includes("gifter"))
        {
            this.generateAndAddWeaponsToBot(templateInventory, wornItemChances, sessionId, botInventory, botRole, isPmc, itemGenerationLimitsMinMax, botLevel);
            this.botLootGenerator.generateLoot(sessionId, botJsonTemplate, isPmc, botRole, botInventory, botLevel);
    
            return botInventory;
        }

        // APBS generation chances instead
        const tierInfo = this.apbsTierGetter.getTierByLevel(botLevel);
        wornItemChances = this.apbsEquipmentGetter.getSpawnChancesByBotRole(botRole, tierInfo);
        this.generateAndAddWeaponsToBot(templateInventory, wornItemChances, sessionId, botInventory, botRole, isPmc, itemGenerationLimitsMinMax, botLevel);
        this.botLootGenerator.generateLoot(sessionId, botJsonTemplate, isPmc, botRole, botInventory, botLevel);

        return botInventory;
        
    }

    protected override generateEquipment = (settings: IGenerateEquipmentProperties): boolean => 
    {
        const equipmentSlot = settings.rootEquipmentSlot as string;
        const botRole = settings.botData.role;
        const botLevel = settings.botData.level;
        const tierInfo = this.apbsTierGetter.getTierByLevel(botLevel);
        
        let equipmentPool = this.apbsEquipmentGetter.getEquipmentByBotRole(botRole, tierInfo, equipmentSlot);
        let randomisationDetails = this.apbsEquipmentGetter.getSpawnChancesByBotRole(botRole, tierInfo);
        let wornItemChances = this.apbsEquipmentGetter.getSpawnChancesByBotRole(botRole, tierInfo);
        let modPool = this.apbsEquipmentGetter.getModsByBotRole(botRole, tierInfo);
        let apbsBot = true;

        if ((ModConfig.config.disableBossTierGeneration && (botRole.includes("boss") || botRole.includes("sectant") || botRole.includes("arena"))) || botRole == "bosslegion" || botRole == "bosspunisher")
        {
            equipmentPool = settings.rootEquipmentPool;
            randomisationDetails = settings.randomisationDetails;
            wornItemChances = settings.spawnChances;
            modPool = settings.modPool;
            apbsBot = false;
        }
        if (ModConfig.config.disableBossFollowerTierGeneration && botRole.includes("follower"))
        {
            equipmentPool = settings.rootEquipmentPool;
            randomisationDetails = settings.randomisationDetails;
            wornItemChances = settings.spawnChances;
            modPool = settings.modPool;
            apbsBot = false;
        }
        if (ModConfig.config.disableRaiderRogueTierGeneration && (botRole.includes("exusec") || botRole.includes("pmcbot")))
        {
            equipmentPool = settings.rootEquipmentPool;
            randomisationDetails = settings.randomisationDetails;
            wornItemChances = settings.spawnChances;
            modPool = settings.modPool;
            apbsBot = false;
        }
        if (ModConfig.config.disablePMCTierGeneration && (botRole.includes("pmcusec") || botRole.includes("pmcbear")))
        {
            equipmentPool = settings.rootEquipmentPool;
            randomisationDetails = settings.randomisationDetails;
            wornItemChances = settings.spawnChances;
            modPool = settings.modPool;
            apbsBot = false;
        }
        if (ModConfig.config.disableScavTierGeneration && (botRole.includes("assault") || botRole.includes("marksman")))
        {
            equipmentPool = settings.rootEquipmentPool;
            randomisationDetails = settings.randomisationDetails;
            wornItemChances = settings.spawnChances;
            modPool = settings.modPool;
            apbsBot = false;
        }
        if (botRole.includes("infected") || botRole.includes("spirit") || botRole.includes("skier") || botRole.includes("peacemaker") || botRole.includes("gifter"))
        {
            equipmentPool = settings.rootEquipmentPool;
            randomisationDetails = settings.randomisationDetails;
            wornItemChances = settings.spawnChances;
            modPool = settings.modPool;
            apbsBot = false;
        }
        
        if (apbsBot && equipmentSlot == EquipmentSlots.TACTICAL_VEST && !settings.inventory.items.find(e => e.slotId === "ArmorVest"))
        {
            equipmentPool = this.apbsEquipmentGetter.getEquipmentByBotRole(botRole, tierInfo, "ArmouredRig");
        }
        
        if (equipmentSlot == EquipmentSlots.POCKETS && Object.keys(settings.rootEquipmentPool).includes("65e080be269cbd5c5005e529"))
        {
            equipmentPool = settings.rootEquipmentPool;
        }

        const spawnChance = ([EquipmentSlots.POCKETS, EquipmentSlots.SECURED_CONTAINER] as string[]).includes(
            settings.rootEquipmentSlot
        )
            ? 100
            : wornItemChances.equipment[settings.rootEquipmentSlot];

        if (typeof spawnChance === "undefined") 
        {
            this.logger.warning(
                this.localisationService.getText(
                    "bot-no_spawn_chance_defined_for_equipment_slot",
                    settings.rootEquipmentSlot
                )
            );

            return false;
        }

        const shouldSpawn = this.randomUtil.getChance100(spawnChance);
        if (shouldSpawn && Object.keys(equipmentPool).length) 
        {
            let pickedItemDb: ITemplateItem;
            let found = false;

            const maxAttempts = Math.round(Object.keys(equipmentPool).length * 0.75); // Roughly 75% of pool size
            let attempts = 0;
            while (!found) 
            {
                if (Object.values(equipmentPool).length === 0) 
                {
                    return false;
                }

                const chosenItemTpl = this.weightedRandomHelper.getWeightedValue<string>(equipmentPool);
                const dbResult = this.itemHelper.getItem(chosenItemTpl);

                if (!dbResult[0]) 
                {
                    this.logger.error(this.localisationService.getText("bot-missing_item_template", chosenItemTpl));
                    this.logger.info(`EquipmentSlot -> ${settings.rootEquipmentSlot}`);


                    attempts++;

                    continue;
                }

                const compatabilityResult = this.botGeneratorHelper.isItemIncompatibleWithCurrentItems(
                    settings.inventory.items,
                    chosenItemTpl,
                    settings.rootEquipmentSlot
                );
                if (compatabilityResult.incompatible) 
                {
                    // Tried x different items that failed, stop
                    if (attempts > maxAttempts) 
                    {
                        return false;
                    }
                    attempts++;
                }
                else 
                {
                    // Success
                    found = true;
                    pickedItemDb = dbResult[1];
                }
            }

            // Create root item
            const id = this.hashUtil.generate();
            const item = {
                _id: id,
                _tpl: pickedItemDb._id,
                parentId: settings.inventory.equipment,
                slotId: settings.rootEquipmentSlot,
                ...this.botGeneratorHelper.generateExtraPropertiesForItem(pickedItemDb, settings.botData.role)
            };

            const botEquipBlacklist = this.botEquipmentFilterService.getBotEquipmentBlacklist(
                settings.botData.equipmentRole,
                settings.generatingPlayerLevel
            );

            // Edge case: Filter the armor items mod pool if bot exists in config dict + config has armor slot
            if (
                this.botConfig.equipment[settings.botData.equipmentRole] &&
                randomisationDetails?.randomisedArmorSlots?.includes(settings.rootEquipmentSlot)
            ) 
            {
                // Filter out mods from relevant blacklist
                modPool[pickedItemDb._id] = this.getFilteredDynamicModsForItem(
                    pickedItemDb._id,
                    botEquipBlacklist.equipment
                );
            }

            // Does item have slots for sub-mods to be inserted into
            if (pickedItemDb._props.Slots?.length > 0 && !settings.generateModsBlacklist?.includes(pickedItemDb._id)) 
            {
                const childItemsToAdd = this.botEquipmentModGenerator.generateModsForEquipment(
                    [item],
                    id,
                    pickedItemDb,
                    settings,
                    botEquipBlacklist
                );
                settings.inventory.items.push(...childItemsToAdd);
            } 
            else 
            {
                // No slots, add root item only
                settings.inventory.items.push(item);
            }

            return true;
        }

        return false;
    }

    protected override generateAndAddWeaponsToBot(
        templateInventory: IInventory, 
        equipmentChances: IChances, 
        sessionId: string, 
        botInventory: PmcInventory, 
        botRole: string, 
        isPmc: boolean, 
        itemGenerationLimitsMinMax: IGeneration, 
        botLevel: number
    ): void 
    {
        const weaponSlotsToFill = this.getDesiredWeaponsForBot(equipmentChances);
        let hasBothPrimary = false;
        if (weaponSlotsToFill[0].shouldSpawn && weaponSlotsToFill[1].shouldSpawn)
        {
            hasBothPrimary = true;
        }
        for (const weaponSlot of weaponSlotsToFill) 
        {
            // Add weapon to bot if true and bot json has something to put into the slot
            if (weaponSlot.shouldSpawn && Object.keys(templateInventory.equipment[weaponSlot.slot]).length) 
            {
                this.apbsAddWeaponAndMagazinesToInventory(
                    sessionId,
                    weaponSlot,
                    templateInventory,
                    botInventory,
                    equipmentChances,
                    botRole,
                    isPmc,
                    itemGenerationLimitsMinMax,
                    botLevel,
                    hasBothPrimary
                );
            }
        }
    }

    private apbsAddWeaponAndMagazinesToInventory(
        sessionId: string,
        weaponSlot: { slot: EquipmentSlots; shouldSpawn: boolean },
        templateInventory: IInventory,
        botInventory: PmcInventory,
        equipmentChances: IChances,
        botRole: string,
        isPmc: boolean,
        itemGenerationWeights: IGeneration,
        botLevel: number,
        hasBothPrimary: boolean
    ): void 
    {
        const generatedWeapon = this.apbsBotWeaponGenerator.apbsGenerateRandomWeapon(
            sessionId,
            weaponSlot.slot,
            templateInventory,
            botInventory.equipment,
            equipmentChances.weaponMods,
            botRole,
            isPmc,
            botLevel,
            hasBothPrimary
        );

        botInventory.items.push(...generatedWeapon.weapon);

        this.botWeaponGenerator.addExtraMagazinesToInventory(
            generatedWeapon,
            itemGenerationWeights.items.magazines,
            botInventory,
            botRole
        );
    }
}