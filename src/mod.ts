import { DependencyContainer } from "tsyringe";

// SPT
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";

// Custom
import { Logging } from "./Enums/Logging";
import { InstanceManager } from "./InstanceManager";
import { ModConfig } from "./Globals/ModConfig";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { ICoreConfig } from "@spt/models/spt/config/ICoreConfig";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { minVersion, satisfies, SemVer } from "semver";
import { FileSystemSync } from "@spt/utils/FileSystemSync";
import path from "path";
import { ILogger } from "@spt/models/spt/utils/ILogger";

class APBS implements IPreSptLoadMod, IPostDBLoadMod, IPostSptLoadMod
{
    private instance: InstanceManager = new InstanceManager();

    public preSptLoad(container: DependencyContainer): void 
    {
        const start = performance.now()

        const logger = container.resolve<ILogger>("WinstonLogger");
        if (!this.validSptVersion(container)) 
        {
            logger.error(`[APBS] This version of APBS was not made for your version of SPT. Disabling. Requires ${this.validMinimumSptVersion(container)} or higher.`);
            return;
        }

        this.instance.preSptLoad(container, "APBS");

        // Set Mod Configuration Settings
        this.instance.modConfig.serverLogDetails()

        // Check and configure for Questing Bots if necessary
        const questingBots = this.instance.preSptModLoader.getImportedModsNames().includes("DanW-SPTQuestingBots");
        this.instance.apbsLogger.createLogFiles();
        if (questingBots)
        {
            this.instance.apbsLogger.log(Logging.WARN, "Questing Bots Detected. Hooking into QB Router...")
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
        this.instance.raidInformation.checkAllBotsInDB();
        this.instance.botConfigs.initialize();
        this.instance.moddedImportHelper.initialize();

        // Check and configure for Realism if necessary
        const realism = this.instance.preSptModLoader.getImportedModsNames().includes("SPT-Realism");
        if (realism && ModConfig.config.compatibilityConfig.Realism_AddGasMasksToBots)
        {
            this.instance.apbsLogger.log(Logging.WARN, "Realism Detected. Adding gas masks...")
            this.instance.realismHelper.initialize();
        }
        
        // Only do this if you need to build a new attachment list
        // this.instance.apbsAttachmentChecker.buildVanillaAttachmentList();

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
            this.instance.apbsLogger.log(Logging.ERR, "!!! THIS IS AN EARLY RELEASE BUILD !!!")
            this.instance.apbsLogger.log(Logging.ERR, "Do not report problems with this anywhere except #acidphantasm-mods in the SPT Discord.")
            this.instance.apbsLogger.log(Logging.ERR, "Thank you for testing!")
        }

        const timeTaken = performance.now() - start;
        this.instance.apbsLogger.log(Logging.DEBUG, `${timeTaken.toFixed(2)}ms for APBS.postSptLoad`);
    }
    
    public validSptVersion(container: DependencyContainer): boolean
    {
        const fileSysem = container.resolve<FileSystemSync>("FileSystemSync");
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const sptConfig = configServer.getConfig<ICoreConfig>(ConfigTypes.CORE);
        
        const sptVersion = globalThis.G_SPTVERSION || sptConfig.sptVersion;
        const packageJsonPath: string = path.join(__dirname, "../package.json");
        const modSptVersion = fileSysem.readJson(packageJsonPath).sptVersion;


        return satisfies(sptVersion, modSptVersion);
    }

    public validMinimumSptVersion(container: DependencyContainer): SemVer
    {
        const fileSysem = container.resolve<FileSystemSync>("FileSystemSync");
        const packageJsonPath: string = path.join(__dirname, "../package.json");
        const modSptVersion = fileSysem.readJson(packageJsonPath).sptVersion;

        return minVersion(modSptVersion)
    }
}

export const mod = new APBS();
