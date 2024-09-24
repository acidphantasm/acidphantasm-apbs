import { DependencyContainer } from "tsyringe";

// SPT
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";

// Custom
import { Logging } from "./Enums/Logging";
import { InstanceManager } from "./InstanceManager";
import { ModConfig } from "./Globals/ModConfig";

class APBS implements IPreSptLoadMod, IPostDBLoadMod, IPostSptLoadMod
{
    private instance: InstanceManager = new InstanceManager();

    public preSptLoad(container: DependencyContainer): void 
    {
        const start = performance.now()
        this.instance.preSptLoad(container, "APBS");

        // Set Mod Configuration Settings
        this.instance.modConfig.serverLogDetails()

        // Check and configure for Questing Bots if necessary
        const questingBots = this.instance.preSptModLoader.getImportedModsNames().includes("DanW-SPTQuestingBots");
        this.instance.apbsLogger.createLogFiles();
        if (questingBots)
        {
            this.instance.apbsLogger.log(Logging.WARN, "Questing Bots Detected. Updated bot logging.")
            this.instance.apbsDynamicRouterHooks.registerQBRouterHooks(); 
        }

        // Register necessary routers & SPT method changes
        this.instance.apbsStaticRouterHooks.registerRouterHooks();
        this.instance.apbsBotLevelGenerator.registerBotLevelGenerator(container);

        if (ModConfig.config.usePreset)
        {
            this.instance.raidInformation.usingDefaultDB = false;
            this.instance.jsonHelper.usePreset(ModConfig.config.presetName);
        }
        else 
        {
            this.instance.raidInformation.usingDefaultDB = true;
            this.instance.jsonHelper.buildTierJson();
        }

        const timeTaken = performance.now() - start;
        this.instance.apbsLogger.log(Logging.DEBUG, `${timeTaken.toFixed(2)}ms for APBS.preSptLoad`);
    }

    public postDBLoad(container: DependencyContainer): void
    {
        const start = performance.now()
        this.instance.postDBLoad(container);
        
        //Do postDBLoad stuff
        this.instance.botConfigs.initialize();
        this.instance.moddedImportHelper.initialize();

        // Check and configure for Realism if necessary
        const realism = this.instance.preSptModLoader.getImportedModsNames().includes("SPT-Realism");
        if (realism && !ModConfig.config.disableRealismGasMasks)
        {
            this.instance.apbsLogger.log(Logging.WARN, "Realism Detected. Adding gas masks...")
            this.instance.realismHelper.initialize();
        }
        
        // Only do this if you need to build a new attachment list
        // this.instance.apbsAttachmentChecker.buildAttachmentList();

        const timeTaken = performance.now() - start;
        this.instance.apbsLogger.log(Logging.DEBUG, `${timeTaken.toFixed(2)}ms for APBS.postDBLoad`);
    }

    public postSptLoad(container: DependencyContainer): void 
    {
        const start = performance.now()
        this.instance.postSptLoad(container);

        //Do postSPTLoad stuff
        this.instance.blacklistHelper.initialize();

        if (this.instance.modInformation.versionNumber.includes("alpha"))
        {
            this.instance.apbsLogger.log(Logging.WARN, "!!! THIS IS AN EARLY RELEASE BUILD !!!")
            this.instance.apbsLogger.log(Logging.WARN, "Do not report problems with this anywhere except #acidphantasm-mods in the SPT Discord.")
            this.instance.apbsLogger.log(Logging.WARN, "Thank you for testing!")
        }

        const timeTaken = performance.now() - start;
        this.instance.apbsLogger.log(Logging.DEBUG, `${timeTaken.toFixed(2)}ms for APBS.postSptLoad`);
    }
}

export const mod = new APBS();
