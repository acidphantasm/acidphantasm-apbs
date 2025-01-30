import { inject, injectable } from "tsyringe";
import { BotEnablementHelper } from "../Helpers/BotEnablementHelper";

@injectable()
export class RaidInformation
{
    constructor(
        @inject("BotEnablementHelper") protected botEnablementHelper: BotEnablementHelper
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
            "LongRange": 10,
            "ShortRange": 90
        },
        "factory4_night":
        {
            "LongRange": 5,
            "ShortRange": 95
        },
        "factory4_day":
        {
            "LongRange": 5,
            "ShortRange": 95
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

    public isBotEnabled(botType: string): boolean
    {
        botType = botType.toLowerCase();
        
        if (this.botEnablementHelper.doesBotExist(botType))
        {
            if (this.botEnablementHelper.botDisabled(botType))
            {
                console.log(`Bot: ${botType} is disabled.`);
                return false
            }
            console.log(`Bot: ${botType} is enabled.`);
            return true;
        }

        console.error(`Bot: ${botType} configuration is missing. Bot is defaulting to vanilla. Report this to acidphantasm.`);
        return false;
    }    
}