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
import { IAppearance } from "@spt/models/eft/common/tables/IBotType";
import { IBotGenerationDetails } from "@spt/models/spt/bots/BotGenerationDetails";
import { IWildBody } from "@spt/models/eft/common/IGlobals";
import { BotNameService } from "@spt/services/BotNameService";
import { BotGeneratorHelper } from "@spt/helpers/BotGeneratorHelper";
import { ModConfig } from "../Globals/ModConfig";
import { GameEditions } from "@spt/models/enums/GameEditions";
import { MemberCategory } from "@spt/models/enums/MemberCategory";
import { APBSIBotBaseInfo } from "../Interface/APBSIBotBase";
import { IItem } from "@spt/models/eft/common/tables/IItem";
import { ItemTpl } from "@spt/models/enums/ItemTpl";

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

    protected override addDogtagToBot(bot: IBotBase): void 
    {
        const inventoryItem: IItem = {
            _id: this.hashUtil.generate(),
            _tpl: this.apbsGetDogtagTplByGameVersionAndSide(bot.Info.Side, bot.Info.GameVersion, bot.Info.PrestigeLevel),
            parentId: bot.Inventory.equipment,
            slotId: "Dogtag",
            upd: {
                SpawnedInSession: true
            }
        };

        bot.Inventory.items.push(inventoryItem);
    }

    private apbsGetDogtagTplByGameVersionAndSide(side: string, gameVersion: string, prestigeLevel: number): string 
    {
        if (side.toLowerCase() === "usec") 
        {
            switch (prestigeLevel)
            {
                case 0:
                    switch (gameVersion) 
                    {
                        case GameEditions.EDGE_OF_DARKNESS:
                            return ItemTpl.BARTER_DOGTAG_USEC_EOD;
                        case GameEditions.UNHEARD:
                            return ItemTpl.BARTER_DOGTAG_USEC_TUE;
                        default:
                            return ItemTpl.BARTER_DOGTAG_USEC;
                    }
                case 1:
                    return ItemTpl.BARTER_DOGTAG_USEC_PRESTIGE_1;
                case 2:
                    return ItemTpl.BARTER_DOGTAG_USEC_PRESTIGE_2;
                default:
                    return ItemTpl.BARTER_DOGTAG_USEC;
            }
        }

        switch (prestigeLevel)
        {
            case 0:
                switch (gameVersion) 
                {
                    case GameEditions.EDGE_OF_DARKNESS:
                        return ItemTpl.BARTER_DOGTAG_BEAR_EOD;
                    case GameEditions.UNHEARD:
                        return ItemTpl.BARTER_DOGTAG_BEAR_TUE;
                    default:
                        return ItemTpl.BARTER_DOGTAG_BEAR;
                }
            case 1:
                return ItemTpl.BARTER_DOGTAG_BEAR_PRESTIGE_1;
            case 2:
                return ItemTpl.BARTER_DOGTAG_BEAR_PRESTIGE_2;
            default:
                return ItemTpl.BARTER_DOGTAG_BEAR;
        }
    }
}