import { inject, injectable } from "tsyringe";

import { BotHelper } from "@spt/helpers/BotHelper";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { BotEquipmentFilterService } from "@spt/services/BotEquipmentFilterService";
import { DatabaseService } from "@spt/services/DatabaseService";
import { ItemFilterService } from "@spt/services/ItemFilterService";
import { HashUtil } from "@spt/utils/HashUtil";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { ICloner } from "@spt/utils/cloners/ICloner";

import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { APBSTierGetter } from "../Utils/APBSTierGetter";
import { BotGenerator } from "@spt/generators/BotGenerator";
import { BotInventoryGenerator } from "@spt/generators/BotInventoryGenerator";
import { BotLevelGenerator } from "@spt/generators/BotLevelGenerator";
import { SeasonalEventService } from "@spt/services/SeasonalEventService";
import { TimeUtil } from "@spt/utils/TimeUtil";
import { IBotBase } from "@spt/models/eft/common/tables/IBotBase";
import { IAppearance, IBotType } from "@spt/models/eft/common/tables/IBotType";
import { IBotGenerationDetails } from "@spt/models/spt/bots/BotGenerationDetails";
import { IWildBody } from "@spt/models/eft/common/IGlobals";
import { BotNameService } from "@spt/services/BotNameService";
import { BotGeneratorHelper } from "@spt/helpers/BotGeneratorHelper";
import { ModConfig } from "../Globals/ModConfig";
import { GameEditions } from "@spt/models/enums/GameEditions";
import { MemberCategory } from "@spt/models/enums/MemberCategory";
import { APBSIBotBase, APBSIBotBaseInfo } from "../Interface/APBSIBotBase";

/** Handle profile related client events */
@injectable()
export class APBSBotGenerator extends BotGenerator
{

    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("TimeUtil") protected timeUtil: TimeUtil,
        @inject("ProfileHelper") protected profileHelper: ProfileHelper,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("BotInventoryGenerator") protected botInventoryGenerator: BotInventoryGenerator,
        @inject("BotLevelGenerator") protected botLevelGenerator: BotLevelGenerator,
        @inject("BotEquipmentFilterService") protected botEquipmentFilterService: BotEquipmentFilterService,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper,
        @inject("BotHelper") protected botHelper: BotHelper,
        @inject("BotGeneratorHelper") protected botGeneratorHelper: BotGeneratorHelper,
        @inject("SeasonalEventService") protected seasonalEventService: SeasonalEventService,
        @inject("ItemFilterService") protected itemFilterService: ItemFilterService,
        @inject("BotNameService") protected botNameService: BotNameService,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("PrimaryCloner") protected cloner: ICloner,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("APBSTierGetter") protected apbsTierGetter: APBSTierGetter
    )
    {
        super(logger, 
            hashUtil, 
            randomUtil, 
            timeUtil, 
            profileHelper, 
            databaseService, 
            botInventoryGenerator, 
            botLevelGenerator, 
            botEquipmentFilterService, 
            weightedRandomHelper, 
            botHelper, 
            botGeneratorHelper,
            seasonalEventService,
            itemFilterService, 
            botNameService,
            configServer, 
            cloner)
    }

    protected override setBotAppearance(bot: IBotBase, appearance: IAppearance, botGenerationDetails: IBotGenerationDetails): void
    {
        if (botGenerationDetails.isPmc)
        {
            const tier = this.apbsTierGetter.getTierByLevel(bot.Info.Level)
            const role = bot.Info.Settings.Role
            const getSeasonalAppearance = ModConfig.config.pmcBots.additionalOptions.seasonalPmcAppearance ? true : false;
            const appearanceJson = this.apbsEquipmentGetter.getPmcAppearance(role, tier, getSeasonalAppearance);

            bot.Customization.Head = this.weightedRandomHelper.getWeightedValue<string>(appearanceJson.head);
            bot.Customization.Hands = this.weightedRandomHelper.getWeightedValue<string>(appearanceJson.hands);
            bot.Customization.Body = this.weightedRandomHelper.getWeightedValue<string>(appearanceJson.body);
            bot.Customization.Feet = this.weightedRandomHelper.getWeightedValue<string>(appearanceJson.feet);

            const bodyGlobalDict = this.databaseService.getGlobals().config.Customization.SavageBody;
            const chosenBodyTemplate = this.databaseService.getCustomization()[bot.Customization.Body];
    
            // Find the body/hands mapping
            const matchingBody: IWildBody = bodyGlobalDict[chosenBodyTemplate?._name];
            if (matchingBody?.isNotRandom) 
            {
                // Has fixed hands for this body, set them
                bot.Customization.Hands = matchingBody.hands;
            }
            return;
        }
        bot.Customization.Head = this.weightedRandomHelper.getWeightedValue<string>(appearance.head);
        bot.Customization.Body = this.weightedRandomHelper.getWeightedValue<string>(appearance.body);
        bot.Customization.Feet = this.weightedRandomHelper.getWeightedValue<string>(appearance.feet);
        bot.Customization.Hands = this.weightedRandomHelper.getWeightedValue<string>(appearance.hands);

        const bodyGlobalDict = this.databaseService.getGlobals().config.Customization.SavageBody;
        const chosenBodyTemplate = this.databaseService.getCustomization()[bot.Customization.Body];

        // Find the body/hands mapping
        const matchingBody: IWildBody = bodyGlobalDict[chosenBodyTemplate?._name];
        if (matchingBody?.isNotRandom) 
        {
            // Has fixed hands for this body, set them
            bot.Customization.Hands = matchingBody.hands;
        }
    }

    protected override setRandomisedGameVersionAndCategory(botInfo: APBSIBotBaseInfo): string 
    {
        // Special case
        if (botInfo.Nickname?.toLowerCase() === "nikita") 
        {
            botInfo.GameVersion = GameEditions.UNHEARD;
            botInfo.MemberCategory = MemberCategory.DEVELOPER;
            botInfo.SelectedMemberCategory = botInfo.MemberCategory;

            return botInfo.GameVersion;
        }
        if (ModConfig.config.pmcBots.secrets.developerSettings.devNames.enable)
        {
            if (ModConfig.config.pmcBots.secrets.developerSettings.devNames.nameList.includes(botInfo.Nickname)) 
            {
                botInfo.GameVersion = GameEditions.UNHEARD;
                botInfo.MemberCategory = MemberCategory.DEVELOPER;

                if (ModConfig.config.pmcBots.secrets.developerSettings.devLevels.enable)
                {
                    const min = ModConfig.config.pmcBots.secrets.developerSettings.devLevels.min;
                    const max = ModConfig.config.pmcBots.secrets.developerSettings.devLevels.max;
                    const level = this.randomUtil.getInt(min, max);
                    const exp = this.profileHelper.getExperience(level);

                    botInfo.Experience = exp;
                    botInfo.Level = level;
                    botInfo.Tier = this.apbsTierGetter.getTierByLevel(level).toString();
                }
                
                botInfo.SelectedMemberCategory = botInfo.MemberCategory;
    
                return botInfo.GameVersion;
            }
        }

        // Choose random weighted game version for bot
        botInfo.GameVersion = this.weightedRandomHelper.getWeightedValue(this.pmcConfig.gameVersionWeight);

        // Choose appropriate member category value
        switch (botInfo.GameVersion) 
        {
            case GameEditions.EDGE_OF_DARKNESS:
                botInfo.MemberCategory = MemberCategory.UNIQUE_ID;
                break;
            case GameEditions.UNHEARD:
                botInfo.MemberCategory = MemberCategory.UNHEARD;
                break;
            default:
                // Everyone else gets a weighted randomised category
                botInfo.MemberCategory = Number.parseInt(
                    this.weightedRandomHelper.getWeightedValue(this.pmcConfig.accountTypeWeight),
                    10
                );
        }

        // Ensure selected category matches
        botInfo.SelectedMemberCategory = botInfo.MemberCategory;

        return botInfo.GameVersion;
    }

    protected override generateBot(
        sessionId: string,
        bot: APBSIBotBase,
        botJsonTemplate: IBotType,
        botGenerationDetails: IBotGenerationDetails
    ): APBSIBotBase 
    {
        const botRoleLowercase = botGenerationDetails.role.toLowerCase();
        const botLevel = this.botLevelGenerator.generateBotLevel(
            botJsonTemplate.experience.level,
            botGenerationDetails,
            bot
        );

        // Only filter bot equipment, never players
        if (!botGenerationDetails.isPlayerScav) 
        {
            this.botEquipmentFilterService.filterBotEquipment(
                sessionId,
                botJsonTemplate,
                botLevel.level,
                botGenerationDetails
            );
        }

        bot.Info.Nickname = this.botNameService.generateUniqueBotNickname(
            botJsonTemplate,
            botGenerationDetails,
            botRoleLowercase,
            this.botConfig.botRolesThatMustHaveUniqueName
        );

        // Only run when generating a 'fake' playerscav, not actual player scav
        if (!botGenerationDetails.isPlayerScav && this.shouldSimulatePlayerScav(botRoleLowercase)) 
        {
            this.botNameService.addRandomPmcNameToBotMainProfileNicknameProperty(bot);
            this.setRandomisedGameVersionAndCategory(bot.Info);
        }

        if (!this.seasonalEventService.christmasEventEnabled()) 
        {
            // Process all bots EXCEPT gifter, he needs christmas items
            if (botGenerationDetails.role !== "gifter") 
            {
                this.seasonalEventService.removeChristmasItemsFromBotInventory(
                    botJsonTemplate.inventory,
                    botGenerationDetails.role
                );
            }
        }

        this.removeBlacklistedLootFromBotTemplate(botJsonTemplate.inventory);

        // Remove hideout data if bot is not a PMC or pscav - match what live sends
        if (!(botGenerationDetails.isPmc || botGenerationDetails.isPlayerScav)) 
        {
            bot.Hideout = undefined;
        }

        bot.Info.Experience = botLevel.exp;
        bot.Info.Level = botLevel.level;
        bot.Info.Settings.Experience = this.getExperienceRewardForKillByDifficulty(
            botJsonTemplate.experience.reward,
            botGenerationDetails.botDifficulty,
            botGenerationDetails.role
        );
        bot.Info.Settings.StandingForKill = this.getStandingChangeForKillByDifficulty(
            botJsonTemplate.experience.standingForKill,
            botGenerationDetails.botDifficulty,
            botGenerationDetails.role
        );
        bot.Info.Settings.AggressorBonus = this.getAgressorBonusByDifficulty(
            botJsonTemplate.experience.standingForKill,
            botGenerationDetails.botDifficulty,
            botGenerationDetails.role
        );
        bot.Info.Settings.UseSimpleAnimator = botJsonTemplate.experience.useSimpleAnimator ?? false;
        bot.Info.Voice = this.weightedRandomHelper.getWeightedValue<string>(botJsonTemplate.appearance.voice);
        bot.Health = this.generateHealth(botJsonTemplate.health, botGenerationDetails.isPlayerScav);
        bot.Skills = this.generateSkills(<any>botJsonTemplate.skills); // TODO: fix bad type, bot jsons store skills in dict, output needs to be array

        if (botGenerationDetails.isPmc) 
        {
            bot.Info.IsStreamerModeAvailable = true; // Set to true so client patches can pick it up later - client sometimes alters botrole to assaultGroup
            this.setRandomisedGameVersionAndCategory(bot.Info);
            if (bot.Info.GameVersion === GameEditions.UNHEARD) 
            {
                this.addAdditionalPocketLootWeightsForUnheardBot(botJsonTemplate);
            }
        }

        // Add drip
        this.setBotAppearance(bot, botJsonTemplate.appearance, botGenerationDetails);

        // Filter out blacklisted gear from the base template
        this.filterBlacklistedGear(botJsonTemplate, botGenerationDetails);

        bot.Inventory = this.botInventoryGenerator.generateInventory(
            sessionId,
            botJsonTemplate,
            botRoleLowercase,
            botGenerationDetails.isPmc,
            bot.Info.Level,
            bot.Info.GameVersion
        );

        if (this.botConfig.botRolesWithDogTags.includes(botRoleLowercase)) 
        {
            this.addDogtagToBot(bot);
        }

        // Generate new bot ID
        this.addIdsToBot(bot);

        // Generate new inventory ID
        this.generateInventoryId(bot);

        // Set role back to originally requested now its been generated
        if (botGenerationDetails.eventRole) 
        {
            bot.Info.Settings.Role = botGenerationDetails.eventRole;
        }

        return bot;
    }
}