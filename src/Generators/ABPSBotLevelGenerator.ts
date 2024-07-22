import { DependencyContainer, inject, injectable } from "tsyringe";

import { DatabaseService } from "@spt/services/DatabaseService";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { BotLevelGenerator } from "@spt/generators/BotLevelGenerator";
import { MinMax } from "@spt/models/common/MinMax";
import { IRandomisedBotLevelResult } from "@spt/models/eft/bot/IRandomisedBotLevelResult";
import { BotGenerationDetails } from "@spt/models/spt/bots/BotGenerationDetails";
import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";
import { APBSIBotBase } from "../Interface/APBSIBotBase";
import { APBSTierGetter } from "../Utils/APBSTierGetter";
import { RaidInformation } from "../Globals/RaidInformation";

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
        @inject("APBSTierGetter") protected apbsTierGetter: APBSTierGetter,
        @inject("RaidInformation") protected raidInformation: RaidInformation
    )
    {}

    public registerBotLevelGenerator(container: DependencyContainer): void 
    {    
        container.afterResolution("BotLevelGenerator", (_t, result: BotLevelGenerator) => 
        {
            result.generateBotLevel = (levelDetails: MinMax, botGenerationDetails: BotGenerationDetails, bot: APBSIBotBase): IRandomisedBotLevelResult => 
            {
                const expTable = this.databaseService.getGlobals().config.exp.level.exp_table;
                const highestLevel = this.getHighestRelativeLevel(botGenerationDetails, levelDetails, expTable.length);
                const lowestLevel = this.getLowestRelativeLevel(botGenerationDetails, levelDetails, expTable.length);
                const min = lowestLevel <= 0 ? 1 : lowestLevel;
                const max = highestLevel >= 78 ? 78 : highestLevel;
                const level = this.randomUtil.getInt(min, max);
                const exp = this.profileHelper.getExperience(level);

                bot.Info.Tier = this.apbsTierGetter.getTierByLevel(level)
                
                if (botGenerationDetails.isPlayerScav)
                {
                    const level = this.profileHelper.getScavProfile(this.raidInformation.sessionId).Info.Level;
                    const exp = this.profileHelper.getExperience(level);
                    
                    bot.Info.Tier = this.apbsTierGetter.getTierByLevel(level)
                    const result: IRandomisedBotLevelResult = {
                        level,
                        exp 
                    };
                    return result;                    
                }
                const result: IRandomisedBotLevelResult = {
                    level,
                    exp 
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

        let level = botGenerationDetails.playerLevel + this.apbsTierGetter.getTierUpperLevelDeviation(botGenerationDetails.playerLevel);
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
        let level = botGenerationDetails.playerLevel - this.apbsTierGetter.getTierLowerLevelDeviation(botGenerationDetails.playerLevel);
        if (level < minPossibleLevel)
        {
            level = minPossibleLevel;
        }

        return level;
    }
}
