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

        const questingBotsDetected = this.instance.preSptModLoader.getImportedModsNames().includes("DanW-SPTQuestingBots");

        //Do preSptLoad stuff
        this.instance.apbsLogger.createLogFiles();
        if (questingBotsDetected)
        {
            this.instance.apbsLogger.log(Logging.WARN, "Questing Bots Detected. Updated bot logging.")
            this.instance.apbsDynamicRouterHooks.registerQBRouterHooks(); 
        }
        this.instance.apbsStaticRouterHooks.registerRouterHooks();
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
        this.instance.botConfigs.initialize();
        this.instance.moddedWeaponHelper.initialize();

        const timeTaken = performance.now() - start;
        this.instance.apbsLogger.log(Logging.DEBUG, `${timeTaken.toFixed(2)}ms for APBS.postDBLoad`);
    }
}
export const mod = new APBS();
