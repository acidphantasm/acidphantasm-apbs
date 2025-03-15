import { inject, injectable } from "tsyringe";
import { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";

import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";
import { RaidInformation } from "../Globals/RaidInformation";
import { ModInformation } from "../Globals/ModInformation";
import { APBSTester } from "../Utils/APBSTester";
import { DatabaseService } from "@spt/services/DatabaseService";
import { BotLogHelper } from "../Helpers/BotLogHelper";

@injectable()
export class APBSStaticRouterHooks
{
    constructor(
        @inject("StaticRouterModService") protected staticRouterService: StaticRouterModService,
        @inject("APBSLogger") protected apbsLogger: APBSLogger,
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("ModInformation") protected modInformation: ModInformation,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("APBSTester") protected apbsTester: APBSTester,
        @inject("ProfileHelper") protected profileHelper: ProfileHelper,
        @inject("BotLogHelper") protected botLogHelper: BotLogHelper
    )
    {}

    public registerRouterHooks(): void
    {
        this.staticRouterService.registerStaticRouter(
            "APBS-BotGenerationRouter",
            [
                {
                    url: "/client/game/bot/generate",
                    action: async (url, info, sessionId, output) => 
                    {
                        try 
                        {
                            const outputJSON = JSON.parse(output);

                            if (outputJSON.data?.length)
                            {
                                this.botLogHelper.logBotGeneration(outputJSON);
                            }
                        }
                        catch (err) 
                        {
                            this.apbsLogger.log(Logging.ERR, "Bot Router hook failed.\n", `${err.stack}`);
                        }
                        return output;
                    }
                }
            ],
            "APBS"
        );
        this.apbsLogger.log(Logging.DEBUG, "Bot Generation Router registered");
        this.staticRouterService.registerStaticRouter(
            "APBS-StartMatchRouter",
            [
                {
                    url: "/client/match/local/start",
                    action: async (url, info, sessionId, output) => 
                    {
                        this.raidInformation.sessionId = sessionId;
                        try 
                        {
                            this.botLogHelper.logLocation(info);
                            if (this.modInformation.testMode && this.modInformation.clearAssortPreRaid)
                            {
                                const tables = this.databaseService.getTables();
                                this.apbsTester.clearAssort(tables.traders[this.modInformation.testTrader]);
                            }
                        }
                        catch (err) 
                        {
                            this.apbsLogger.log(Logging.ERR, "Match Start Router hook failed.\n", `${err.stack}`);
                        }
                        return output;
                    }
                }
            ],
            "APBS"
        );
        this.apbsLogger.log(Logging.DEBUG, "Match Start Router registered");
        this.staticRouterService.registerStaticRouter(
            "APBS-GameStartRouter",
            [
                {
                    url: "/client/game/start",
                    action: async (url, info, sessionId, output) => 
                    {
                        try 
                        {
                            const fullProfile = this.profileHelper.getFullProfile(sessionId);
                            this.raidInformation.freshProfile = (fullProfile.info.wipe === true) ? true : false;
                        }
                        catch (err) 
                        {
                            this.apbsLogger.log(Logging.ERR, "Game Start Router hook failed.\n", `${err.stack}`);
                        }
                        return output;
                    }
                }
            ],
            "APBS"
        );
        this.apbsLogger.log(Logging.DEBUG, "Game Start Router registered");
        this.staticRouterService.registerStaticRouter(
            "APBS-ProfileStatusChecker",
            [
                {
                    url: "/client/profile/status",
                    action: async (url, info, sessionId, output) => 
                    {
                        try 
                        {
                            const fullProfile = this.profileHelper.getFullProfile(sessionId);
                            this.raidInformation.freshProfile = (fullProfile.info.wipe === true) ? true : false;
                        }
                        catch (err) 
                        {
                            this.apbsLogger.log(Logging.ERR, "Profile Status Router hook failed.\n", `${err.stack}`);
                        }
                        return output;
                    }
                }
            ],
            "APBS"
        );
        this.apbsLogger.log(Logging.DEBUG, "Profile Status Router registered");
    }
}