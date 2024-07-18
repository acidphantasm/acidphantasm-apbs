import { DependencyContainer } from "tsyringe";

// SPT
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";

// Custom
import { Logging } from "./Enums/Logging";
import { InstanceManager } from "./InstanceManager";

class APBS implements IPreSptLoadMod, IPostDBLoadMod
{
    private instance: InstanceManager = new InstanceManager();

    public preSptLoad(container: DependencyContainer): void 
    {
        const start = performance.now()
        this.instance.preSptLoad(container, "APBS");

        //Do preSptLoad stuff
        this.instance.apbsLogger.createLogFiles();
        this.instance.apbsStaticRouterHooks.registerRouterHook();
        this.instance.apbsBotLevelGenerator.registerBotLevelGenerator(container);
        this.instance.apbsBotWeaponGenerator.registerBotWeaponGenerator(container);

        const timeTaken = performance.now() - start;
        this.instance.apbsLogger.log(Logging.DEBUG, `${timeTaken.toFixed(2)}ms for APBS.preSptLoad`);
    }

    public postDBLoad(container: DependencyContainer): void
    {
        const start = performance.now()
        this.instance.postDBLoad(container);
        
        //Do postDBLoad stuff
        this.instance.botConfigs.configureBotExperienceLevels();

        const timeTaken = performance.now() - start;
        this.instance.apbsLogger.log(Logging.DEBUG, `${timeTaken.toFixed(2)}ms for APBS.postDBLoad to load`);
    }
}
export const mod = new APBS();
