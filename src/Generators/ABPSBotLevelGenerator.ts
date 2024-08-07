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
import { RaidInformation } from "../Globals/RaidInformation";
import { APBSTierGetter } from "../Utils/APBSTierGetter";

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
                const botLevelRange = this.apbsGetRelativeBotLevelRange(botGenerationDetails, levelDetails, expTable.length);
                const min = botLevelRange.min <= 0 ? 1 : botLevelRange.min;
                const max = botLevelRange.max >= 79 ? 79 : botLevelRange.max;
                const level = this.randomUtil.getInt(min, max);
                const exp = this.profileHelper.getExperience(level);
                const tier = this.apbsTierGetter.getTierByLevel(level);

                /* 
                TESTING TIER DEVIATION - Since botGenerationDetails isn't passed to the relevant methods, this is more difficult that anticipated. This logic works for the tier, but since selection is based on level..oof.
                -2 to +1 tier
                
                const lowerDeviation = (Math.floor(Math.random() * 2) - 2);
                const upperDeviation = (Math.floor(Math.random() * 2));
                const minTier = (tier + lowerDeviation) <= 0 ? 1 : tier + lowerDeviation
                const maxTier = (tier + upperDeviation) >= 7 ? 7 : tier + upperDeviation
                const newTier = this.randomUtil.getInt(minTier, maxTier)
                console.log(`Original Tier: ${tier} - New Tier ${newTier}`)
                */
                bot.Info.Tier = tier
                
                if (botGenerationDetails.isPlayerScav)
                {
                    const level = this.raidInformation.freshProfile == true ? 1 : this.profileHelper.getScavProfile(this.raidInformation.sessionId)?.Info?.Level
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

    protected apbsGetRelativeBotLevelRange(
        botGenerationDetails: BotGenerationDetails,
        levelDetails: MinMax,
        maxAvailableLevel: number
    ): MinMax 
    {
        const minPossibleLevel =
            botGenerationDetails.isPmc && botGenerationDetails.locationSpecificPmcLevelOverride
                ? Math.min(
                    Math.max(levelDetails.min, botGenerationDetails.locationSpecificPmcLevelOverride.min), // Biggest between json min and the botgen min
                    maxAvailableLevel // Fallback if value above is crazy (default is 79)
                )
                : Math.min(levelDetails.min, maxAvailableLevel); // Not pmc with override or non-pmc

        const maxPossibleLevel =
            botGenerationDetails.isPmc && botGenerationDetails.locationSpecificPmcLevelOverride
                ? Math.min(botGenerationDetails.locationSpecificPmcLevelOverride.max, maxAvailableLevel) // Was a PMC and they have a level override
                : Math.min(levelDetails.max, maxAvailableLevel); // Not pmc with override or non-pmc

        let minLevel = botGenerationDetails.playerLevel - this.apbsTierGetter.getTierLowerLevelDeviation(botGenerationDetails.playerLevel);
        let maxLevel = botGenerationDetails.playerLevel + this.apbsTierGetter.getTierUpperLevelDeviation(botGenerationDetails.playerLevel);

        // Bound the level to the min/max possible
        maxLevel = Math.min(Math.max(maxLevel, minPossibleLevel), maxPossibleLevel);
        minLevel = Math.min(Math.max(minLevel, minPossibleLevel), maxPossibleLevel);

        return {
            min: minLevel,
            max: maxLevel
        }
    }
}
