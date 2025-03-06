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
import { RaidInformation } from "../Globals/RaidInformation";
import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";
import { BotQuestHelper } from "../Helpers/BotQuestHelper";
import { GameEditions } from "@spt/models/enums/GameEditions";
import { ItemTpl } from "@spt/models/enums/ItemTpl";
import { APBSBotEquipmentModGenerator } from "./APBSBotEquipmentModGenerator";
import { APBSIGenerateEquipmentProperties } from "../Interface/APBSIGenerateEquipmentProperties";
import { APBSIChances } from "../Interface/APBSIChances";
import { APBSIQuestBotGenerationDetails } from "../Interface/APBSIQuestBotGear";
import { APBSBotLootGenerator } from "./APBSBotLootGenerator";

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
        @inject("APBSBotWeaponGenerator") protected apbsBotWeaponGenerator: APBSBotWeaponGenerator,
        @inject("APBSBotEquipmentModGenerator") protected apbsBotEquipmentModGenerator: APBSBotEquipmentModGenerator,
        @inject("APBSBotLootGenerator") protected apbsBotLootGenerator: APBSBotLootGenerator,
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("APBSLogger") protected apbsLogger: APBSLogger,
        @inject("BotQuestHelper") protected botQuestHelper: BotQuestHelper
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
        const wornItemChances = botJsonTemplate.chances;
        const itemGenerationLimitsMinMax: IGeneration = botJsonTemplate.generation;

        // Generate base inventory with no items
        const botInventory = this.generateInventoryBase();
        
        const raidConfig = this.applicationContext
            .getLatestValue(ContextVariableType.RAID_CONFIGURATION)
            ?.getValue<IGetRaidConfigurationRequestData>();

        // Vanilla generation
        if (!this.raidInformation.isBotEnabled(botRole) || this.raidInformation.freshProfile)
        {
            this.generateAndAddEquipmentToBot(
                sessionId,
                templateInventory,
                wornItemChances,
                botRole,
                botInventory,
                botLevel,
                chosenGameVersion,
                isPmc,
                raidConfig
            );
        
            this.generateAndAddWeaponsToBot(templateInventory, wornItemChances, sessionId, botInventory, botRole, isPmc, itemGenerationLimitsMinMax, botLevel);
            this.botLootGenerator.generateLoot(sessionId, botJsonTemplate, isPmc, botRole, botInventory, botLevel);

            return botInventory;
        }

        // APBS generation instead
        let tierNumber = this.apbsTierGetter.getTierByLevel(botLevel);

        // Check if this bot shouuld get quests, and assign one if so
        const shouldCheckForQuests = this.botQuestHelper.shouldBotHaveQuest(isPmc);
        let isQuesting = false;
        let questData;
        if (shouldCheckForQuests)
        {
            const questRequirements = this.botQuestHelper.getQuestFromInternalDatabase(botLevel, this.raidInformation.location);
            if (questRequirements != null)
            {
                isQuesting = true;
                questData = questRequirements;
                this.apbsLogger.log(Logging.DEBUG, `[QUEST] Level${botLevel} PMC was assigned the quest ${questRequirements.questName}`)
            }
        }

        if (isPmc && !isQuesting && ModConfig.config.pmcBots.povertyConfig.enable && tierNumber > 1)
        {
            if (this.randomUtil.getChance100(ModConfig.config.pmcBots.povertyConfig.chance))
            {
                const minTier = Math.max(1, tierNumber - 3);
                const maxTier = Math.max(1, tierNumber - 1);
                const newTierNumber = this.randomUtil.getInt(minTier, maxTier);
                this.apbsLogger.log(Logging.DEBUG, `[POVERTY] Level${botLevel} PMC was flagged to be 'poor' | Old Tier: ${tierNumber} | New Tier: ${newTierNumber}`);
                tierNumber = newTierNumber;
            }
        }

        const chances = this.apbsEquipmentGetter.getSpawnChancesByBotRole(botRole, tierNumber);
        const generation = chances.generation;

        
        if (isQuesting && questData.questName == "Fishing Gear")
        {
            chances.equipment.SecondPrimaryWeapon = 100;
        }

        this.apbsGenerateAndAddEquipmentToBot(sessionId, chances, botRole, botInventory, botLevel, chosenGameVersion, isPmc, raidConfig, tierNumber, {isQuesting, questData});
        
        this.apbsGenerateAndAddWeaponsToBot(templateInventory, chances, sessionId, botInventory, botRole, isPmc, generation, botLevel, tierNumber, {isQuesting, questData});
        this.apbsBotLootGenerator.apbsGenerateLoot(sessionId, botJsonTemplate, isPmc, botRole, botInventory, botLevel, tierNumber);

        return botInventory;
        
    }

    private apbsGenerateAndAddEquipmentToBot(
        sessionId: string,
        wornItemChances: IChances,
        botRole: string,
        botInventory: PmcInventory,
        botLevel: number,
        chosenGameVersion: string,
        isPmc: boolean,
        raidConfig: IGetRaidConfigurationRequestData,
        tierInfo: number,
        questInformation: APBSIQuestBotGenerationDetails
    ): void 
    {
        // These will be handled later
        const excludedSlots: string[] = [
            EquipmentSlots.POCKETS,
            EquipmentSlots.FIRST_PRIMARY_WEAPON,
            EquipmentSlots.SECOND_PRIMARY_WEAPON,
            EquipmentSlots.HOLSTER,
            EquipmentSlots.ARMOR_VEST,
            EquipmentSlots.TACTICAL_VEST,
            EquipmentSlots.FACE_COVER,
            EquipmentSlots.HEADWEAR,
            EquipmentSlots.EARPIECE,
            "ArmouredRig"
        ];

        const botEquipConfig = this.botConfig.equipment[this.botGeneratorHelper.getBotEquipmentRole(botRole)];
        const randomistionDetails = this.botHelper.getBotRandomizationDetails(botLevel, botEquipConfig);

        // Get profile of player generating bots, we use their level later on
        const pmcProfile = this.profileHelper.getPmcProfile(sessionId);
        const botEquipmentRole = this.botGeneratorHelper.getBotEquipmentRole(botRole);

        const equipmentPool = this.apbsEquipmentGetter.getEquipmentByBotRole(botRole, tierInfo);
        const modPool = this.apbsEquipmentGetter.getModsByBotRole(botRole, tierInfo);
        // Iterate over all equipment slots of bot, do it in specifc order to reduce conflicts
        // e.g. ArmorVest should be generated after TactivalVest
        // or FACE_COVER before HEADWEAR
        for (const equipmentSlot in equipmentPool) 
        {
            // Skip some slots as they need to be done in a specific order + with specific parameter values
            // e.g. Weapons
            if (excludedSlots.includes(equipmentSlot)) 
            {
                continue;
            }

            this.apbsGenerateEquipment({
                rootEquipmentSlot: equipmentSlot,
                rootEquipmentPool: equipmentPool[equipmentSlot],
                modPool: modPool,
                spawnChances: wornItemChances,
                botData: { role: botRole, level: botLevel, equipmentRole: botEquipmentRole, tier: tierInfo },
                inventory: botInventory,
                botEquipmentConfig: botEquipConfig,
                randomisationDetails: randomistionDetails,
                generatingPlayerLevel: pmcProfile.Info.Level
            },
            questInformation);
        }

        // Generate below in specific order
        this.apbsGenerateEquipment({
            rootEquipmentSlot: EquipmentSlots.POCKETS,
            // Unheard profiles have unique sized pockets, TODO - handle this somewhere else in a better way
            rootEquipmentPool:
                chosenGameVersion === GameEditions.UNHEARD && isPmc
                    ? { [ItemTpl.POCKETS_1X4_TUE]: 1 }
                    : equipmentPool.Pockets,
            modPool: modPool,
            spawnChances: wornItemChances,
            botData: { role: botRole, level: botLevel, equipmentRole: botEquipmentRole, tier: tierInfo },
            inventory: botInventory,
            botEquipmentConfig: botEquipConfig,
            randomisationDetails: randomistionDetails,
            generateModsBlacklist: [ItemTpl.POCKETS_1X4_TUE],
            generatingPlayerLevel: pmcProfile.Info.Level
        },
        questInformation);
        this.apbsGenerateEquipment({
            rootEquipmentSlot: EquipmentSlots.FACE_COVER,
            rootEquipmentPool: equipmentPool.FaceCover,
            modPool: modPool,
            spawnChances: wornItemChances,
            botData: { role: botRole, level: botLevel, equipmentRole: botEquipmentRole, tier: tierInfo },
            inventory: botInventory,
            botEquipmentConfig: botEquipConfig,
            randomisationDetails: randomistionDetails,
            generatingPlayerLevel: pmcProfile.Info.Level
        },
        questInformation);
        this.apbsGenerateEquipment({
            rootEquipmentSlot: EquipmentSlots.HEADWEAR,
            rootEquipmentPool: equipmentPool.Headwear,
            modPool: modPool,
            spawnChances: wornItemChances,
            botData: { role: botRole, level: botLevel, equipmentRole: botEquipmentRole, tier: tierInfo },
            inventory: botInventory,
            botEquipmentConfig: botEquipConfig,
            randomisationDetails: randomistionDetails,
            generatingPlayerLevel: pmcProfile.Info.Level
        },
        questInformation);
        this.apbsGenerateEquipment({
            rootEquipmentSlot: EquipmentSlots.EARPIECE,
            rootEquipmentPool: equipmentPool.Earpiece,
            modPool: modPool,
            spawnChances: wornItemChances,
            botData: { role: botRole, level: botLevel, equipmentRole: botEquipmentRole, tier: tierInfo },
            inventory: botInventory,
            botEquipmentConfig: botEquipConfig,
            randomisationDetails: randomistionDetails,
            generatingPlayerLevel: pmcProfile.Info.Level
        },
        questInformation);

        // If bot is questing & requires a Tactical Vest, ensure the armour spawns.
        if (questInformation.isQuesting)
        {
            if (questInformation.questData.requiredEquipmentSlots.includes(EquipmentSlots.TACTICAL_VEST))
            {
                wornItemChances.equipment.ArmorVest = 100;
            }
        }

        const hasArmorVest = this.apbsGenerateEquipment({
            rootEquipmentSlot: EquipmentSlots.ARMOR_VEST,
            rootEquipmentPool: equipmentPool.ArmorVest,
            modPool: modPool,
            spawnChances: wornItemChances,
            botData: { role: botRole, level: botLevel, equipmentRole: botEquipmentRole, tier: tierInfo },
            inventory: botInventory,
            botEquipmentConfig: botEquipConfig,
            randomisationDetails: randomistionDetails,
            generatingPlayerLevel: pmcProfile.Info.Level
        },
        questInformation);

        // Bot is flagged as always needing a vest
        if (!hasArmorVest) 
        {
            wornItemChances.equipment.TacticalVest = 100;
        }

        this.apbsGenerateEquipment({
            rootEquipmentSlot: EquipmentSlots.TACTICAL_VEST,
            rootEquipmentPool: equipmentPool.TacticalVest,
            modPool: modPool,
            spawnChances: wornItemChances,
            botData: { role: botRole, level: botLevel, equipmentRole: botEquipmentRole, tier: tierInfo},
            inventory: botInventory,
            botEquipmentConfig: botEquipConfig,
            randomisationDetails: randomistionDetails,
            generatingPlayerLevel: pmcProfile.Info.Level
        },
        questInformation);
    }

    private apbsGenerateEquipment = (settings: APBSIGenerateEquipmentProperties, questInformation: APBSIQuestBotGenerationDetails): boolean => 
    {
        if (questInformation.isQuesting)
        {
            if (questInformation.questData.requiredEquipmentSlots.includes(settings.rootEquipmentSlot))
            {
                const newEquipmentPool = {};
                for (const item in questInformation.questData[settings.rootEquipmentSlot])
                {
                    const itemTPL = questInformation.questData[settings.rootEquipmentSlot][item];

                    settings.spawnChances.equipment[settings.rootEquipmentSlot] = 100;
                    newEquipmentPool[itemTPL] = 1;
                }
                settings.rootEquipmentPool = newEquipmentPool;
            }
        }

        // Get Armoured Rig if they didn't get an ArmorVest
        if (settings.rootEquipmentSlot == EquipmentSlots.TACTICAL_VEST && !settings.inventory.items.find(e => e.slotId === "ArmorVest"))
        {
            settings.rootEquipmentPool = this.apbsEquipmentGetter.getEquipmentByBotRoleAndSlot(settings.botData.role, settings.botData.tier, "ArmouredRig");
        }

        const spawnChance = ([EquipmentSlots.POCKETS, EquipmentSlots.SECURED_CONTAINER] as string[]).includes(
            settings.rootEquipmentSlot
        )
            ? 100
            : settings.spawnChances.equipment[settings.rootEquipmentSlot];

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
        if (shouldSpawn && Object.keys(settings.rootEquipmentPool).length) 
        {
            let pickedItemDb: ITemplateItem;
            let found = false;

            const maxAttempts = Math.round(Object.keys(settings.rootEquipmentPool).length * 0.75); // Roughly 75% of pool size
            let attempts = 0;
            while (!found) 
            {
                if (Object.values(settings.rootEquipmentPool).length === 0) 
                {
                    return false;
                }

                const chosenItemTpl = this.weightedRandomHelper.getWeightedValue<string>(settings.rootEquipmentPool);
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

            // Does item have slots for sub-mods to be inserted into
            if (pickedItemDb._props.Slots?.length > 0 && !settings.generateModsBlacklist?.includes(pickedItemDb._id)) 
            {
                const childItemsToAdd = this.apbsBotEquipmentModGenerator.apbsGenerateModsForEquipment(
                    [item],
                    id,
                    pickedItemDb,
                    settings
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

    public apbsGenerateAndAddWeaponsToBot(
        templateInventory: IInventory, 
        equipmentChances: APBSIChances, 
        sessionId: string, 
        botInventory: PmcInventory, 
        botRole: string, 
        isPmc: boolean, 
        itemGenerationLimitsMinMax: IGeneration, 
        botLevel: number,
        tierNumber: number,
        questInformation: APBSIQuestBotGenerationDetails
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
                    tierNumber,
                    hasBothPrimary,
                    questInformation
                );
            }
        }
    }

    private apbsAddWeaponAndMagazinesToInventory(
        sessionId: string,
        weaponSlot: { slot: EquipmentSlots; shouldSpawn: boolean },
        templateInventory: IInventory,
        botInventory: PmcInventory,
        equipmentChances: APBSIChances,
        botRole: string,
        isPmc: boolean,
        itemGenerationWeights: IGeneration,
        botLevel: number,
        tierNumber: number,
        hasBothPrimary: boolean,
        questInformation: APBSIQuestBotGenerationDetails
    ): void 
    {
        const generatedWeapon = this.apbsBotWeaponGenerator.apbsGenerateRandomWeapon(
            sessionId,
            weaponSlot.slot,
            templateInventory,
            botInventory.equipment,
            equipmentChances,
            botRole,
            isPmc,
            botLevel,
            tierNumber,
            hasBothPrimary,
            questInformation
        );

        botInventory.items.push(...generatedWeapon.weapon);

        if (questInformation.isQuesting && questInformation.questData.questName == "Fishing Gear" && weaponSlot.slot == "SecondPrimaryWeapon") return;
        
        this.apbsBotWeaponGenerator.apbsAddExtraMagazinesToInventory(
            generatedWeapon,
            itemGenerationWeights.items.magazines,
            botInventory,
            botRole,
            botLevel,
            tierNumber
        );
    }
}