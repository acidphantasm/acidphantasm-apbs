/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { inject, injectable } from "tsyringe";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { RaidInformation } from "../Globals/RaidInformation";
import { Logging } from "../Enums/Logging";
import { APBSLogger } from "./APBSLogger";
import { TierInformation } from "../Globals/TierInformation";
import { ModConfig } from "../Globals/ModConfig";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { Season } from "@spt/models/enums/Season";
import { SeasonalEventService } from "@spt/services/SeasonalEventService";

@injectable()
export class APBSEquipmentGetter
{

    constructor(
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("TierInformation") protected tierInformation: TierInformation,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper,
        @inject("APBSLogger") protected apbsLogger: APBSLogger,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("SeasonalEventService") protected seasonalEventService: SeasonalEventService
    )
    {}

    private chadOrChill(tierInfo: number): number
    {
        if (ModConfig.config.onlyChads && ModConfig.config.tarkovAndChill)
        {
            return this.randomUtil.getInt(1, 7);
        }
        if (ModConfig.config.onlyChads) return 7;
        if (ModConfig.config.tarkovAndChill) return 1;
        if (ModConfig.config.blickyMode) return 0;

        return tierInfo;
    }

    public getTierJson(tierInfo: number, ignoreCheck?: boolean)
    {
        if (!ignoreCheck) tierInfo = this.chadOrChill(tierInfo);
        switch (tierInfo)
        {
            case 0:
                return this.tierInformation.tier0
            case 1:
                return this.tierInformation.tier1
            case 2:
                return this.tierInformation.tier2
            case 3:
                return this.tierInformation.tier3
            case 4:
                return this.tierInformation.tier4
            case 5:
                return this.tierInformation.tier5
            case 6:
                return this.tierInformation.tier6
            case 7:
                return this.tierInformation.tier7
            default:
                this.apbsLogger.log(Logging.WARN, "Bot Level and Tier Information missing, your load order is probably incorrect. Defaulting to Tier1 loadout.");
                return this.tierInformation.tier1
        }
    }

    public getTierModsJson(tierInfo: number, ignoreCheck?: boolean)
    {
        if (!ignoreCheck) tierInfo = this.chadOrChill(tierInfo);
        switch (tierInfo)
        {
            case 0:
                return this.tierInformation.tier0mods
            case 1:
                return this.tierInformation.tier1mods
            case 2:
                return this.tierInformation.tier2mods
            case 3:
                return this.tierInformation.tier3mods
            case 4:
                return this.tierInformation.tier4mods
            case 5:
                return this.tierInformation.tier5mods
            case 6:
                return this.tierInformation.tier6mods
            case 7:
                return this.tierInformation.tier7mods
            default:
                this.apbsLogger.log(Logging.WARN, "Bot Level and Tier Information missing, your load order is probably incorrect. Defaulting to Tier1 mods.");
                return this.tierInformation.tier1mods
        }
    }

    public getTierChancesJson(tierInfo: number)
    {
        tierInfo = this.chadOrChill(tierInfo);
        switch (tierInfo)
        {
            case 0:
                return this.tierInformation.tier0chances
            case 1:
                return this.tierInformation.tier1chances
            case 2:
                return this.tierInformation.tier2chances
            case 3:
                return this.tierInformation.tier3chances
            case 4:
                return this.tierInformation.tier4chances
            case 5:
                return this.tierInformation.tier5chances
            case 6:
                return this.tierInformation.tier6chances
            case 7:
                return this.tierInformation.tier7chances
            default:
                this.apbsLogger.log(Logging.WARN, "Bot Level and Tier Information missing, your load order is probably incorrect. Defaulting to Tier1 chances.");
                return this.tierInformation.tier1chances
        }
    }

    public getTierAmmoJson(tierInfo: number, ignoreCheck?: boolean)
    {
        if (!ignoreCheck) tierInfo = this.chadOrChill(tierInfo);
        switch (tierInfo)
        {
            case 0:
                return this.tierInformation.tier0ammo
            case 1:
                return this.tierInformation.tier1ammo
            case 2:
                return this.tierInformation.tier2ammo
            case 3:
                return this.tierInformation.tier3ammo
            case 4:
                return this.tierInformation.tier4ammo
            case 5:
                return this.tierInformation.tier5ammo
            case 6:
                return this.tierInformation.tier6ammo
            case 7:
                return this.tierInformation.tier7ammo
            default:
                this.apbsLogger.log(Logging.WARN, "Bot Level and Tier Information missing, your load order is probably incorrect. Defaulting to Tier1 ammo.");
                return this.tierInformation.tier1ammo
        }
    }

    public getAppearanceJson(tierInfo: number, ignoreCheck?: boolean)
    {
        if (!ignoreCheck) tierInfo = this.chadOrChill(tierInfo);
        switch (tierInfo)
        {
            case 0:
                return this.tierInformation.tier0appearance
            case 1:
                return this.tierInformation.tier1appearance
            case 2:
                return this.tierInformation.tier2appearance
            case 3:
                return this.tierInformation.tier3appearance
            case 4:
                return this.tierInformation.tier4appearance
            case 5:
                return this.tierInformation.tier5appearance
            case 6:
                return this.tierInformation.tier6appearance
            case 7:
                return this.tierInformation.tier7appearance
            default:
                this.apbsLogger.log(Logging.WARN, "Bot Level and Tier Information missing, your load order is probably incorrect. Defaulting to Tier1 appearance.");
                return this.tierInformation.tier1appearance
        }
    }

    public getModsByBotRole(botRole: string, tierInfo: number): any
    {
        const tierJson = this.getTierModsJson(tierInfo)
        switch (botRole)
        {
            case "marksman":
            case "cursedassault":
            case "assault":
                if (ModConfig.config.blickyMode || ModConfig.config.onlyChads || ModConfig.config.enableScavAttachmentTiering) return tierJson;
                else return this.tierInformation.tier1mods;
            default:
                return tierJson;
        }
    }

    public getEquipmentByBotRole(botRole: string, tierInfo: number, slot: string, range?: string): Record<string, number>
    {
        const tierJson = this.getTierJson(tierInfo)
        switch (botRole)
        {
            case "pmcusec":
                return (range == undefined) ? tierJson.pmcUSEC.equipment[slot] : tierJson.pmcUSEC.equipment[slot][range];
            case "pmcbear":
                return (range == undefined) ? tierJson.pmcBEAR.equipment[slot] : tierJson.pmcBEAR.equipment[slot][range];
            case "marksman":
                return (range == undefined) ? tierJson.scav.equipment[slot] : tierJson.scav.equipment[slot].LongRange;
            case "cursedassault":
            case "assault":
                return (range == undefined) ? tierJson.scav.equipment[slot] : tierJson.scav.equipment[slot].ShortRange;
            case "bossboar":
                return (range == undefined) ? tierJson.bossboar.equipment[slot] : tierJson.bossboar.equipment[slot][range];
            case "bossboarsniper":
                return (range == undefined) ? tierJson.bossboarsniper.equipment[slot] : tierJson.bossboarsniper.equipment[slot][range];
            case "bossbully":
                return (range == undefined) ? tierJson.bossbully.equipment[slot] : tierJson.bossbully.equipment[slot][range];
            case "bossgluhar":
                return (range == undefined) ? tierJson.bossgluhar.equipment[slot] : tierJson.bossgluhar.equipment[slot][range];
            case "bosskilla":
                return (range == undefined) ? tierJson.bosskilla.equipment[slot] : tierJson.bosskilla.equipment[slot][range];
            case "bosskojaniy":
                return (range == undefined) ? tierJson.bosskojaniy.equipment[slot] : tierJson.bosskojaniy.equipment[slot][range];
            case "bosskolontay":
                return (range == undefined) ? tierJson.bosskolontay.equipment[slot] : tierJson.bosskolontay.equipment[slot][range];
            case "bosssanitar":
                return (range == undefined) ? tierJson.bosssanitar.equipment[slot] : tierJson.bosssanitar.equipment[slot][range];
            case "bosstagilla":
                return (range == undefined) ? tierJson.bosstagilla.equipment[slot] : tierJson.bosstagilla.equipment[slot][range];
            case "bosspartisan":
                return (range == undefined) ? tierJson.bosspartisan.equipment[slot] : tierJson.bosspartisan.equipment[slot][range];
            case "bossknight":
                return (range == undefined) ? tierJson.bossknight.equipment[slot] : tierJson.bossknight.equipment[slot][range];
            case "followerbigpipe":
                return (range == undefined) ? tierJson.followerbigpipe.equipment[slot] : tierJson.followerbigpipe.equipment[slot][range];
            case "followerbirdeye":
                return (range == undefined) ? tierJson.followerbirdeye.equipment[slot] : tierJson.followerbirdeye.equipment[slot][range];
            case "sectantpriest":
                return (range == undefined) ? tierJson.sectantpriest.equipment[slot] : tierJson.sectantpriest.equipment[slot][range];
            case "sectantwarrior":
                return (range == undefined) ? tierJson.sectantwarrior.equipment[slot] : tierJson.sectantwarrior.equipment[slot][range];
            case "exusec":
            case "arenafighterevent":
            case "arenafighter":
                return (range == undefined) ? tierJson.exUSEC.equipment[slot] : tierJson.exUSEC.equipment[slot][range];
            case "pmcbot":
                return (range == undefined) ? tierJson.pmcbot.equipment[slot] : tierJson.pmcbot.equipment[slot][range];
            default:
                return (range == undefined) ? tierJson.default.equipment[slot] : tierJson.default.equipment[slot][range];
        }
    }

    public getSpawnChancesByBotRole(botRole: string, tierInfo: number): any
    {
        const tierJson = this.getTierChancesJson(tierInfo)
        switch (botRole)
        {
            case "pmcbear":
                return tierJson.pmcBEAR.chances;
            case "pmcusec":
                return tierJson.pmcUSEC.chances;
            case "marksman":
            case "cursedassault":
            case "assault":
                return tierJson.scav.chances;
            case "bossboar":
                return tierJson.bossboar.chances;
            case "bossboarsniper":
                return tierJson.bossboarsniper.chances;
            case "bossbully":
                return tierJson.bossbully.chances;
            case "bossgluhar":
                return tierJson.bossgluhar.chances;
            case "bosskilla":
                return tierJson.bosskilla.chances;
            case "bossknight":
                return tierJson.bossknight.chances;
            case "bosskojaniy":
                return tierJson.bosskojaniy.chances;
            case "bosskolontay":
                return tierJson.bosskolontay.chances;
            case "bosssanitar":
                return tierJson.bosssanitar.chances;
            case "bosstagilla":
                return tierJson.bosstagilla.chances;
            case "bosspartisan":
                return tierJson.bosspartisan.chances;
            case "bosszryachiy":
                return tierJson.bosszryachiy.chances;
            case "followerbigpipe":
                return tierJson.followerbigpipe.chances;
            case "followerbirdeye":
                return tierJson.followerbirdeye.chances;
            case "sectantpriest":
                return tierJson.sectantpriest.chances;
            case "sectantwarrior":
                return tierJson.sectantwarrior.chances;
            case "exusec":
                return tierJson.exusec.chances;
            case "pmcbot":
                return tierJson.pmcbot.chances;
            default:
                return tierJson.default.chances;
        }
    }

    public getAmmoByBotRole(botRole: string, tierInfo: number): Record<string, Record<string, number>>
    {
        if ((botRole == "pmcusec" || botRole == "pmcbear") && ModConfig.config.enablePMCAmmoTierSliding)
        {
            if (this.randomUtil.getChance100(ModConfig.config.slideChance))
            {
                const slideAmount = ModConfig.config.slideAmount;
                const minTier = (tierInfo - slideAmount) <= 0 ? 1 : tierInfo - slideAmount
                const maxTier = tierInfo - 1
                tierInfo = this.newTierCalc(tierInfo, minTier, maxTier);
            }
        }
        const tierJson = this.getTierAmmoJson(tierInfo)
        switch (botRole)
        {
            case "marksman":
            case "cursedassault":
            case "assault":
                return tierJson.scavAmmo;
            case "pmcusec":
            case "pmcbear":
                return tierJson.pmcAmmo;
            default:
                return tierJson.bossAmmo;
        }
    }

    public getPmcAppearance(botRole: string, tierInfo: number, getSeason?: boolean): Record<string, Record<string, number>>
    {
        const tierJson = this.getAppearanceJson(tierInfo)
        switch (botRole)
        {
            case "pmcUSEC":
                if (getSeason && tierInfo != 0)
                {
                    const activeSeason: Season = this.seasonalEventService.getActiveWeatherSeason();
                    switch (activeSeason)
                    {
                        case Season.SPRING_EARLY:
                            return tierJson.earlySpring.pmcUSEC.appearance;
                        case Season.SPRING:
                            return tierJson.spring.pmcUSEC.appearance;
                        case Season.SUMMER:
                        case Season.STORM:
                            return tierJson.summer.pmcUSEC.appearance;
                        case Season.AUTUMN:
                        case Season.AUTUMN_LATE:
                            return tierJson.autumn.pmcUSEC.appearance;
                        case Season.WINTER:
                            return tierJson.winter.pmcUSEC.appearance;
                        default:
                            return tierJson.summer.pmcUSEC.appearance;
                    }
                }
                return tierJson.pmcUSEC.appearance;
            case "pmcBEAR":
                if (getSeason && tierInfo != 0)
                {
                    const activeSeason: Season = this.seasonalEventService.getActiveWeatherSeason();
                    switch (activeSeason)
                    {
                        case Season.SPRING_EARLY:
                            return tierJson.earlySpring.pmcBEAR.appearance;
                        case Season.SPRING:
                            return tierJson.spring.pmcBEAR.appearance;
                        case Season.SUMMER:
                        case Season.STORM:
                            return tierJson.summer.pmcBEAR.appearance;
                        case Season.AUTUMN:
                        case Season.AUTUMN_LATE:
                            return tierJson.autumn.pmcBEAR.appearance;
                        case Season.WINTER:
                            return tierJson.winter.pmcBEAR.appearance;
                        default:
                            return tierJson.summer.pmcBEAR.appearance;
                    }
                }
                return tierJson.pmcBEAR.appearance;
        }
    }

    private newTierCalc(tierInfo: number, minTier: number, maxTier: number): number
    {
        const newTier = (Math.floor(Math.random() * (maxTier - minTier + 1) + minTier)) >= tierInfo  ? (tierInfo - 1) : (Math.floor(Math.random() * (maxTier - minTier + 1) + minTier))
        return newTier;
    }
}