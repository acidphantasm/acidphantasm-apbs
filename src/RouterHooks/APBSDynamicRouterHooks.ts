import { inject, injectable } from "tsyringe";
import { DynamicRouterModService } from "@spt/services/mod/dynamicRouter/DynamicRouterModService";

import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";
import { BotLogHelper } from "../Helpers/BotLogHelper";

@injectable()
export class APBSDynamicRouterHooks
{
    constructor(
        @inject("DynamicRouterModService") protected dynamicRouterModService: DynamicRouterModService,
        @inject("APBSLogger") protected apbsLogger: APBSLogger,
        @inject("BotLogHelper") protected botLogHelper: BotLogHelper
    )
    {}

    public registerQBRouterHooks(): void
    {
        this.dynamicRouterModService.registerDynamicRouter(
            "APBS-QBBotGenerationRouter",
            [
                {
                    url: "/QuestingBots/GenerateBot/",
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
        this.apbsLogger.log(Logging.DEBUG, "QB Compatibility Router registered");
    }
}