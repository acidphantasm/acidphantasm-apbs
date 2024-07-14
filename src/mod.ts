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
        this.instance.preSptLoad(container, "APBS");
        this.instance.staticRouterHooks.registerRouterHook();
    }

    public postDBLoad(container: DependencyContainer): void
    {
        const start = performance.now()

        this.instance.postDBLoad(container);
                
        const timeTaken = performance.now() - start;
        this.instance.apbsLogger.log(Logging.DEBUG, `Mod Load Time: ${timeTaken}`);
    }
}

export const mod = new APBS();
