import * as fs from "fs";
import * as path from "path";

import { DependencyContainer } from "tsyringe";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { DatabaseService } from "@spt/services/DatabaseService";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { IPmcConfig } from "@spt/models/spt/config/IPmcConfig";
import { IBotConfig } from "@spt/models/spt/config/IBotConfig";
import { WeatherGenerator } from "@spt/generators/WeatherGenerator";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";

// Custom
import { APBSLogger } from "./Utils/apbsLogger";
import { StaticRouterHooks } from "./RouterHooks/StaticRouterHooks";
import { RaidInformation } from "./Globals/RaidInformation";

export class InstanceManager 
{
    //#region Accessible in or after preAkiLoad
    public modName: string;
    public debug: boolean;
    public modPath: string = path.join(process.cwd(), "\\user\\mods\\acidphantasm-acidsprogressivebotsystem\\");
    public logPath: string = path.join(process.cwd(), "\\user\\mods\\acidphantasm-acidsprogressivebotsystem\\logs");
    public profilePath: string = path.join(process.cwd(), "\\user\\profiles");
    //#endregion

    // Instances
    public container: DependencyContainer;
    public preSptModLoader: PreSptModLoader;
    public configServer: ConfigServer;
    public pmcConfig: IPmcConfig;
    public botConfig: IBotConfig;
    public itemHelper: ItemHelper;
    public logger: ILogger;
    public staticRouter: StaticRouterModService;
    public weatherGenerator: WeatherGenerator;
    public apbsLogger: APBSLogger;
    public raidInformation: RaidInformation;
    public staticRouterHooks: StaticRouterHooks;

    //#endregion

    //#region Acceessible in or after postDBLoad
    public database: IDatabaseTables;
    //#endregion

    // Call at the start of the mods postDBLoad method
    public preSptLoad(container: DependencyContainer, mod: string): void
    {
        this.modName = mod;

        this.container = container;
        this.preSptModLoader = container.resolve<PreSptModLoader>("PreSptModLoader");
        this.configServer = container.resolve<ConfigServer>("ConfigServer");
        this.itemHelper = container.resolve<ItemHelper>("ItemHelper");
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.staticRouter = container.resolve<StaticRouterModService>("StaticRouterModService");
        this.weatherGenerator = container.resolve<WeatherGenerator>("WeatherGenerator");
        this.botConfig = this.configServer.getConfig<IBotConfig>(ConfigTypes.BOT);
        this.pmcConfig = this.configServer.getConfig<IPmcConfig>(ConfigTypes.PMC);

        this.apbsLogger = new APBSLogger(this.logger, this);
        this.raidInformation = new RaidInformation;
        this.staticRouterHooks = new StaticRouterHooks(this.staticRouter, this.itemHelper, this.apbsLogger, this.logger, this.weatherGenerator, this.raidInformation);

        this.getPath();
        this.apbsLogger.createLogFiles();
    }

    public postDBLoad(container: DependencyContainer): void
    {
        this.database = container.resolve<DatabaseService>("DatabaseService").getTables();
    }

    public getPath(): boolean
    {
        const dirPath: string = path.dirname(__filename);
        const modDir: string = path.join(dirPath, "..", "..");
        
        const key = "V2F5ZmFyZXI=";
        const keyDE = Buffer.from(key, "base64")

        const contents = fs.readdirSync(modDir).includes(keyDE.toString());

        if (contents)
        {
            return true;
        }
        return false;   
    }
}