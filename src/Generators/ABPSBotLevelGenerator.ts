import { DependencyContainer, inject, injectable } from "tsyringe";

import { DatabaseService } from "@spt/services/DatabaseService";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { BotLevelGenerator } from "@spt/generators/BotLevelGenerator";
import { MinMax } from "@spt/models/common/MinMax";
import { IRandomisedBotLevelResult } from "@spt/models/eft/bot/IRandomisedBotLevelResult";
import { IBotGenerationDetails } from "@spt/models/spt/bots/BotGenerationDetails";
import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";
import { APBSIBotBase } from "../Interface/APBSIBotBase";
import { RaidInformation } from "../Globals/RaidInformation";
import { APBSTierGetter } from "../Utils/APBSTierGetter";
import { ModConfig } from "../Globals/ModConfig";
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { ModInformation } from "../Globals/ModInformation";

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
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("ModInformation") protected modInformation: ModInformation,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter
    )
    {}

    public registerBotLevelGenerator(container: DependencyContainer): void 
    {    
        container.afterResolution("BotLevelGenerator", (_t, result: BotLevelGenerator) => 
        {
            result.generateBotLevel = (levelDetails: MinMax, botGenerationDetails: IBotGenerationDetails, bot: APBSIBotBase): IRandomisedBotLevelResult => 
            {                
                if (this.modInformation.testMode && (this.modInformation.testLevelLock || this.modInformation.testLevelLockToPlayer) && this.modInformation.testBotRole.includes(botGenerationDetails.role.toLowerCase()))
                {
                    let level = this.profileHelper.getPmcProfile(this.raidInformation.sessionId)?.Info?.Level;
                    if (this.modInformation.testLevelLock) level = this.modInformation.levelLockLevel;
                    const exp = this.profileHelper.getExperience(level);
                    const tier = this.apbsTierGetter.getTierByLevel(level);
                    bot.Info.Tier = this.chadOrChill(tier.toString());
                    bot.Info.PrestigeLevel = this.setBotPrestigeInfo(level, botGenerationDetails);
                    
                    const result: IRandomisedBotLevelResult = {
                        level,
                        exp 
                    };
                    return result;
                }

                if (botGenerationDetails.isPlayerScav)
                {
                    let level = this.raidInformation.freshProfile == true ? 1 : this.profileHelper.getPmcProfile(this.raidInformation.sessionId)?.Info?.Level;

                    // Level only stays undefined when a Fika dedicated profile is created due to this.raidInformation.freshProfile never being set.
                    // As Fika never calls /client/profile/status
                    if (level === undefined)
                    {
                        this.raidInformation.freshProfile = true;
                        level = 1;
                    }
                    
                    const exp = this.profileHelper.getExperience(level);
                    const tier = this.apbsTierGetter.getTierByLevel(level);
                    bot.Info.Tier = this.chadOrChill(tier.toString());
                    const result: IRandomisedBotLevelResult = {
                        level,
                        exp 
                    };
                    return result;                    
                }

                const expTable = this.databaseService.getGlobals().config.exp.level.exp_table;
                const botLevelRange = this.apbsGetRelativeBotLevelRange(botGenerationDetails, levelDetails, expTable.length);
                const min = botLevelRange.min <= 0 ? 1 : botLevelRange.min;
                const max = botLevelRange.max >= 79 ? 79 : botLevelRange.max;
                const level = this.randomUtil.getInt(min, max);
                const exp = this.profileHelper.getExperience(level);
                const tier = this.apbsTierGetter.getTierByLevel(level);
                bot.Info.Tier = this.chadOrChill(tier.toString());
                bot.Info.PrestigeLevel = this.setBotPrestigeInfo(level, botGenerationDetails);

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

    private chadOrChill(tierInfo: string): string
    {
        if (ModConfig.config.generalConfig.onlyChads && ModConfig.config.generalConfig.tarkovAndChill)
        {
            return "?";
        }
        if (ModConfig.config.generalConfig.onlyChads) return "7";
        if (ModConfig.config.generalConfig.tarkovAndChill) return "1";
        if (ModConfig.config.generalConfig.blickyMode) return "0";

        return tierInfo;
    }

    private apbsGetRelativeBotLevelRange(
        botGenerationDetails: IBotGenerationDetails,
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

        if (ModConfig.config.customScavLevelDeltas.enable && !botGenerationDetails.isPmc && !botGenerationDetails.isPlayerScav && (botGenerationDetails.role.includes("assault") || botGenerationDetails.role == "marksman"))
        {
            minLevel = botGenerationDetails.playerLevel - this.apbsTierGetter.getScavTierLowerLevelDeviation(botGenerationDetails.playerLevel);
            maxLevel = botGenerationDetails.playerLevel + this.apbsTierGetter.getScavTierUpperLevelDeviation(botGenerationDetails.playerLevel);
        }

        if (ModConfig.config.pmcBots.additionalOptions.enablePrestiging)
        {
            const pmcProfile = this.profileHelper.getPmcProfile(this.raidInformation.sessionId)
            if (pmcProfile.Info.PrestigeLevel > 0)
            {
                maxLevel = 79;
                minLevel = 1;
            }
        }

        // Bound the level to the min/max possible
        maxLevel = Math.min(Math.max(maxLevel, minPossibleLevel), maxPossibleLevel);
        minLevel = Math.min(Math.max(minLevel, minPossibleLevel), maxPossibleLevel);

        return {
            min: minLevel,
            max: maxLevel
        }
    }

    private setBotPrestigeInfo(level: number, botGenerationDetails: IBotGenerationDetails): number
    {
        if (!ModConfig.config.pmcBots.additionalOptions.enablePrestiging) return 0;
        if (!botGenerationDetails.isPmc) return 0;

        const pmcProfile = this.profileHelper.getPmcProfile(this.raidInformation.sessionId)
        const isPlayerPrestiged = pmcProfile.Info.PrestigeLevel > 0 ? true : false;
        const playerPrestigeLevel = pmcProfile.Info.PrestigeLevel;
        const minPlayerLevelForBotsToPrestige = 61;
        const maxPrestige = 2;

        const canBotPrestige = 
            botGenerationDetails.playerLevel >= minPlayerLevelForBotsToPrestige || 
            botGenerationDetails.playerLevel >= (level - 15) && isPlayerPrestiged ||
            isPlayerPrestiged
                ? true : false;

        if (canBotPrestige)
        {
            let botPrestigeLevel = 0;
            let hasBotTriedPrestige = false;
            if (botGenerationDetails.playerLevel >= (level - 15) && isPlayerPrestiged)
            {
                botPrestigeLevel = playerPrestigeLevel >= maxPrestige ? this.randomUtil.getInt(0, maxPrestige) : this.randomUtil.getInt(0, playerPrestigeLevel)
                hasBotTriedPrestige = true;
            }
            if (level <= (20 - Math.abs((botGenerationDetails.playerLevel - 79))))
            {
                botPrestigeLevel = playerPrestigeLevel >= maxPrestige ? this.randomUtil.getInt(0, maxPrestige) : this.randomUtil.getInt(botPrestigeLevel, playerPrestigeLevel + 1)
                hasBotTriedPrestige = true;
            }
            if (isPlayerPrestiged && !hasBotTriedPrestige)
            {
                botPrestigeLevel = this.randomUtil.getInt(0, playerPrestigeLevel - 1);
            }
            return botPrestigeLevel;
        }
        return 0;
    }
}
