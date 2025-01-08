import { injectable } from "tsyringe";
import { ModConfig } from "./ModConfig";

@injectable()
export class RaidInformation
{
    constructor(

    )
    {}

    public freshProfile: boolean;

    public location: string;
    public currentTime: string;
    public timeVariant: string;
    public nightTime: boolean;

    public sessionId: string;

    public usingDefaultDB: boolean;

    public mapWeights = {
        "bigmap":
        {
            "LongRange": 20,
            "ShortRange": 80
        },
        "RezervBase":
        {
            "LongRange": 20,
            "ShortRange": 80
        },
        "laboratory":
        {
            "LongRange": 5,
            "ShortRange": 95
        },
        "factory4_night":
        {
            "LongRange": 1,
            "ShortRange": 99
        },
        "factory4_day":
        {
            "LongRange": 1,
            "ShortRange": 99
        },
        "Interchange":
        {
            "LongRange": 20,
            "ShortRange": 80
        },
        "Sandbox":
        {
            "LongRange": 15,
            "ShortRange": 85
        },
        "Sandbox_high":
        {
            "LongRange": 15,
            "ShortRange": 85
        },
        "Woods":
        {
            "LongRange": 60,
            "ShortRange": 40
        },
        "Shoreline":
        {
            "LongRange": 50,
            "ShortRange": 50
        },
        "Lighthouse":
        {
            "LongRange": 30,
            "ShortRange": 70
        },
        "TarkovStreets":
        {
            "LongRange": 20,
            "ShortRange": 80
        }
    }

    public alwaysDisabledBots = [
        "shooterbtr",
        "skier",
        "peacemaker",
        "gifter",
        "infectedassault",
        "infectedcivil",
        "infectedlaborant",
        "infectedpmc",
        "infectedtagilla",
        "bosslegion",
        "bosspunisher"
    ]
    public isBotEnabled(botType: string): boolean
    {
        botType = botType.toLowerCase();
        switch (botType) 
        {
            case "pmcbear":
            case "pmcusec":
                if (ModConfig.config.disablePMCTierGeneration) return false;
                return true;
            case "cursedassault":
            case "marksman":
            case "assault":
                if (ModConfig.config.disableScavTierGeneration) return false;
                return true;
            case "arenafighterevent":
            case "exusec":
                if (ModConfig.config.disableRaiderRogueTierGeneration) return false;
                return true;
            case "bossbully":
            case "bosstagilla":
            case "bosspartisan":
            case "bossgluhar":
            case "bosskilla":
            case "bosskojaniy":
            case "bosssanitar":
            case "bossknight":
            case "bosszryachiy":
            case "bosstest":
            case "bosskolontay":
            case "bossboar":
            case "bossboarSniper":
            case "sectantpriest":
                if (ModConfig.config.disableBossTierGeneration) return false;
                return true;
            case "sectantwarrior":
            case "followerboarblose1":
            case "followerboarclose2":
            case "followerkolontayassault":
            case "followerkolontaysecurity":
            case "followerbully":
            case "followergluharassault":
            case "followergluharscout":
            case "followergluharsecurity":
            case "followergluharsnipe":
            case "followerkojaniy":
            case "followersanitar":
            case "followertagilla":
            case "followerbirdeye":
            case "followerbigpipe":
            case "followerzryachiy":
            case "followertest":
            case "followerboar":
                if (ModConfig.config.disableBossFollowerTierGeneration) return false;
                return true;
            case "shooterbtr":
            case "skier":
            case "peacemaker":
            case "gifter":
            case "infectedassault":
            case "infectedcivil":
            case "infectedlaborant":
            case "infectedpmc":
            case "infectedtagilla":
            case "bosslegion":
            case "bosspunisher":
                return false;
            default:
                return false;
        }
    }
}