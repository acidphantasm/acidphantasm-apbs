/* eslint-disable @typescript-eslint/naming-convention */
import { inject, injectable } from "tsyringe";
import { BotEnablementHelper } from "../Helpers/BotEnablementHelper";
import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";
import { DatabaseService } from "@spt/services/DatabaseService";

@injectable()
export class RaidInformation
{
    constructor(
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("BotEnablementHelper") protected botEnablementHelper: BotEnablementHelper,
        @inject("APBSLogger") protected apbsLogger: APBSLogger
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

    public checkAllBotsInDB(): void
    {
        const botTable = this.databaseService.getTables().bots.types;
        for (const botType in botTable)
        {
            if (this.botEnablementHelper.doesBotExist(botType.toLowerCase()))
            {
                if (this.botEnablementHelper.botDisabled(botType.toLowerCase()))
                {
                    this.apbsLogger.log(Logging.DEBUG, `Bot: ${botType.toLowerCase()} is disabled.`);
                    continue;
                }
                continue;
            }
            this.apbsLogger.log(Logging.ERR, `Bot: ${botType.toLowerCase()} configuration is missing. Bot is defaulting to vanilla. Report this to acidphantasm.`);
        }
    }
    public isBotEnabled(botType: string): boolean
    {
        botType = botType.toLowerCase();
        
        if (["usec", "bear", "pmc"].includes(botType)) botType = "pmcusec";

        if (this.botEnablementHelper.doesBotExist(botType) && !this.botEnablementHelper.botDisabled(botType))
        {
            return true;
        }
        return false;
    }    
}