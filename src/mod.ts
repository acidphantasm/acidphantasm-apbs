import { DependencyContainer } from "tsyringe";

// SPT
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { ILogger } from "@spt/models/spt/utils/ILogger";

// Custom
import { APBSLogger } from "./Utils/apbsLogger";
import { Logging } from "./Enums/Logging";
import { BotStaticRouterHook } from "./RouterHooks/BotStaticRouterHook";

class APBS implements IPreSptLoadMod, IPostDBLoadMod
{
    private logger: ILogger
    private apbsLogger: APBSLogger
    private staticRouter: StaticRouterModService
    private itemHelper: ItemHelper

    public preSptLoad(container: DependencyContainer): void 
    {
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.staticRouter = container.resolve<StaticRouterModService>("StaticRouterModService");
        this.itemHelper = container.resolve<ItemHelper>("ItemHelper")
        this.apbsLogger = new APBSLogger();
        this.apbsLogger.createLogFiles();

        const botStaticRouterHook = new BotStaticRouterHook(this.staticRouter, this.itemHelper, this.apbsLogger, this.logger);

        botStaticRouterHook.registerRouterHook();
    }

    public postDBLoad(container: DependencyContainer): void
    {
        const start = performance.now()
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.apbsLogger = new APBSLogger();
        

        // code is here reee
        
        const timeTaken = performance.now() - start;
        this.apbsLogger.log(this.logger, Logging.DEBUG, `Time Taken: ${timeTaken}`);
    }
}

export const mod = new APBS();
