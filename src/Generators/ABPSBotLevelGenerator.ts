import { DependencyContainer, inject, injectable } from "tsyringe";

import { DatabaseService } from "@spt/services/DatabaseService";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { BotLevelGenerator } from "@spt/generators/BotLevelGenerator";
import { MinMax } from "@spt/models/common/MinMax";
import { IRandomisedBotLevelResult } from "@spt/models/eft/bot/IRandomisedBotLevelResult";
import { BotGenerationDetails } from "@spt/models/spt/bots/BotGenerationDetails";
import { APBSLogger } from "../Utils/apbsLogger";
import { Logging } from "../Enums/Logging";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";
import { BotLevelInformation } from "../Globals/BotLevelInformation";
import { APBSIBotBase } from "../Interface/APBSIBotBase";
import { APBSTierGetter } from "../Utils/apbsTierGetter";

/** Handle profile related client events */
@injectable()
export class APBSBotLevelGenerator
{
    constructor(
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("BotLevelGenerator") protected botLevelGenerator: BotLevelGenerator,
        @inject("APBSLogger") protected apbsLogger: APBSLogger,
        @inject("ProfileHelper") protected profileHelper: ProfileHelper,
        @inject("BotLevelInformation") protected botLevelInformation: BotLevelInformation,
        @inject("APBSTierGetter") protected apbsTierGetter: APBSTierGetter
    )
    {}

    public registerBotLevelGenerator(container: DependencyContainer): void 
    {    
        container.afterResolution("BotLevelGenerator", (_t, result: BotLevelGenerator) => 
        {
            result.generateBotLevel = (levelDetails: MinMax, botGenerationDetails: BotGenerationDetails, bot: APBSIBotBase): IRandomisedBotLevelResult => 
            {
                const expTable = this.databaseService.getGlobals().config.exp.level.exp_table;

                const lowestPossibleLevel = this.getLowestRelativeLevel(botGenerationDetails, levelDetails, expTable.length);
                const highestPossibleLevel = this.getHighestRelativeLevel(botGenerationDetails, levelDetails, expTable.length);
                const min = lowestPossibleLevel <= 0 ? 1 : lowestPossibleLevel;
                const max = highestPossibleLevel >= 78 ? 78 : highestPossibleLevel;
                const level = this.randomUtil.getInt(min, max);
                
                bot.Info.Tier = this.apbsTierGetter.getTierByLevel(level)
                
                const result: IRandomisedBotLevelResult = {
                    level,
                    exp: this.profileHelper.getExperience(level)
                };
                return result;
            };
        },
        { frequency: "Always" }
        );
        this.apbsLogger.log(Logging.DEBUG, "Bot Level Generator registered");
    }

    private getHighestRelativeLevel(botGenerationDetails: BotGenerationDetails, levelDetails: MinMax, maxLevel: number): number
    {
        const maxPossibleLevel
            = botGenerationDetails.isPmc && botGenerationDetails.locationSpecificPmcLevelOverride
                ? Math.min(botGenerationDetails.locationSpecificPmcLevelOverride.max, maxLevel) // Was a PMC and they have a level override
                : Math.min(levelDetails.max, maxLevel); // Not pmc with override or non-pmc

        let level = botGenerationDetails.playerLevel + this.getMaxLevelVariance(botGenerationDetails.playerLevel);
        if (level > maxPossibleLevel)
        {
            level = maxPossibleLevel;
        }

        return level;
    }

    private getLowestRelativeLevel(botGenerationDetails: BotGenerationDetails, levelDetails: MinMax, maxlevel: number): number
    {
        const minPossibleLevel
            = botGenerationDetails.isPmc && botGenerationDetails.locationSpecificPmcLevelOverride
                ? Math.min(
                    Math.max(levelDetails.min, botGenerationDetails.locationSpecificPmcLevelOverride.min), // Biggest between json min and the botgen min
                    maxlevel) // Fallback if value above is crazy (default is 79)
                
                : Math.min(levelDetails.min, maxlevel); // Not pmc with override or non-pmc
        let level = botGenerationDetails.playerLevel - this.getMinLevelVariance(botGenerationDetails.playerLevel);
        if (level < minPossibleLevel)
        {
            level = minPossibleLevel;
        }

        return level;
    }

    private getMaxLevelVariance(level: number): number
    {
        const tiers = this.botLevelInformation.tiers;
        return tiers.find(({playerMinimumLevel,playerMaximumLevel}) => level>=playerMinimumLevel && level<playerMaximumLevel)?.botMaxLevelVariance
    }

    private getMinLevelVariance(level: number): number
    {
        const tiers = this.botLevelInformation.tiers;
        return tiers.find(({playerMinimumLevel,playerMaximumLevel}) => level>=playerMinimumLevel && level<playerMaximumLevel)?.botMinLevelVariance
    }
}
