import * as fs from "fs";
import * as path from "path";

// SPT
import { DependencyContainer, Lifecycle } from "tsyringe";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { DatabaseService } from "@spt/services/DatabaseService";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { WeatherGenerator } from "@spt/generators/WeatherGenerator";
import { BotLevelGenerator } from "@spt/generators/BotLevelGenerator";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";
import { BotGenerator } from "@spt/generators/BotGenerator";
import { BotWeaponGenerator } from "@spt/generators/BotWeaponGenerator";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { LocalisationService } from "@spt/services/LocalisationService";
import { HashUtil } from "@spt/utils/HashUtil";
import { InventoryMagGen } from "@spt/generators/weapongen/InventoryMagGen";
import { ICloner } from "@spt/utils/cloners/ICloner";
import { BotEquipmentModGenerator } from "@spt/generators/BotEquipmentModGenerator";
import { BotGeneratorHelper } from "@spt/helpers/BotGeneratorHelper";
import { BotWeaponGeneratorHelper } from "@spt/helpers/BotWeaponGeneratorHelper";
import { BotWeaponModLimitService } from "@spt/services/BotWeaponModLimitService";
import { RepairService } from "@spt/services/RepairService";

// Custom
import { APBSLogger } from "./Utils/APBSLogger";
import { APBSStaticRouterHooks } from "./RouterHooks/APBSStaticRouterHooks";
import { RaidInformation } from "./Globals/RaidInformation";
import { ModInformation } from "./Globals/ModInformation";
import { TierInformation } from "./Globals/TierInformation";
import { APBSBotLevelGenerator } from "./Generators/ABPSBotLevelGenerator";
import { BotConfigs } from "./Alterations/BotConfigs";
import { APBSBotWeaponGenerator } from "./Generators/APBSBotWeaponGenerator";
import { APBSTierGetter } from "./Utils/APBSTierGetter";
import { APBSEquipmentGetter } from "./Utils/APBSEquipmentGetter";
import { ModdedWeaponHelper } from "./Helpers/ModdedWeaponHelper";
import { DynamicRouterModService } from "@spt/services/mod/dynamicRouter/DynamicRouterModService";
import { APBSDynamicRouterHooks } from "./RouterHooks/APBSDynamicRouterHooks";

export class InstanceManager 
{
    //#region Accessible in or after preAkiLoad
    public modName: string;
    public debug: boolean;
    public database: DatabaseService;
    public container: DependencyContainer;
    public preSptModLoader: PreSptModLoader;
    public configServer: ConfigServer;
    public itemHelper: ItemHelper;
    public logger: ILogger;
    public staticRouter: StaticRouterModService;
    public dynamicRouter: DynamicRouterModService;
    public weatherGenerator: WeatherGenerator;
    public modInformation: ModInformation;
    public raidInformation: RaidInformation;
    public randUtil: RandomUtil;
    public profileHelper: ProfileHelper;
    public botLevelGenerator: BotLevelGenerator;
    public botGenerator: BotGenerator;
    public tierInformation: TierInformation;
    public botWeaponGenerator: BotWeaponGenerator;
    public weightedRandomHelper: WeightedRandomHelper;
    public localisationService: LocalisationService;
    public hashUtil: HashUtil;
    public inventoryMagGen: InventoryMagGen;
    public cloner: ICloner;
    public botWeaponGeneratorHelper: BotWeaponGeneratorHelper;
    public botWeaponModLimitService: BotWeaponModLimitService;
    public botEquipmentModGenerator: BotEquipmentModGenerator;
    public botGeneratorHelper: BotGeneratorHelper;
    public repairService: RepairService;

    public apbsLogger: APBSLogger;
    public apbsTierGetter: APBSTierGetter;
    public apbsBotLevelGenerator: APBSBotLevelGenerator;
    public apbsBotWeaponGenerator: APBSBotWeaponGenerator;
    public apbsEquipmentGetter: APBSEquipmentGetter;
    public apbsStaticRouterHooks: APBSStaticRouterHooks;
    public apbsDynamicRouterHooks: APBSDynamicRouterHooks;
    //#endregion

    //#region Acceessible in or after postDBLoad
    public tables: IDatabaseTables;
    public botConfigs: BotConfigs;
    public moddedWeaponHelper: ModdedWeaponHelper;
    //#endregion

    // Call at the start of the mods postDBLoad method
    public preSptLoad(container: DependencyContainer, mod: string): void
    {
        this.modName = mod;

        // SPT Classes
        this.container = container;
        this.preSptModLoader = container.resolve<PreSptModLoader>("PreSptModLoader");
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.staticRouter = container.resolve<StaticRouterModService>("StaticRouterModService");
        this.dynamicRouter = container.resolve<DynamicRouterModService>("DynamicRouterModService");
        this.weatherGenerator = container.resolve<WeatherGenerator>("WeatherGenerator");
        this.configServer = container.resolve<ConfigServer>("ConfigServer");
        this.itemHelper = container.resolve<ItemHelper>("ItemHelper");
        this.database = container.resolve<DatabaseService>("DatabaseService");
        this.randUtil = container.resolve<RandomUtil>("RandomUtil");
        this.profileHelper = container.resolve<ProfileHelper>("ProfileHelper");
        this.botLevelGenerator = container.resolve<BotLevelGenerator>("BotLevelGenerator");
        this.botGenerator = container.resolve<BotGenerator>("BotGenerator");
        this.botWeaponGenerator = container.resolve<BotWeaponGenerator>("BotWeaponGenerator");
        this.weightedRandomHelper = container.resolve<WeightedRandomHelper>("WeightedRandomHelper");
        this.localisationService = container.resolve<LocalisationService>("LocalisationService")
        this.hashUtil = container.resolve<HashUtil>("HashUtil");
        this.inventoryMagGen = container.resolve<InventoryMagGen>("InventoryMagGen");
        this.botWeaponGeneratorHelper = container.resolve<BotWeaponGeneratorHelper>("BotWeaponGeneratorHelper");
        this.botWeaponModLimitService = container.resolve<BotWeaponModLimitService>("BotWeaponModLimitService");
        this.botEquipmentModGenerator = container.resolve<BotEquipmentModGenerator>("BotEquipmentModGenerator");
        this.botGeneratorHelper = container.resolve<BotGeneratorHelper>("BotGeneratorHelper");
        this.repairService = container.resolve<RepairService>("RepairService");
        this.cloner = container.resolve<ICloner>("PrimaryCloner");

        // Custom Classes
        this.container.register<ModInformation>("ModInformation", ModInformation, { lifecycle: Lifecycle.Singleton })
        this.modInformation = container.resolve<ModInformation>("ModInformation");
        this.container.register<APBSLogger>("APBSLogger", APBSLogger, { lifecycle: Lifecycle.Singleton });
        this.apbsLogger = container.resolve<APBSLogger>("APBSLogger");
        this.container.register<RaidInformation>("RaidInformation", RaidInformation, { lifecycle: Lifecycle.Singleton });
        this.raidInformation = container.resolve<RaidInformation>("RaidInformation");
        this.container.register<TierInformation>("TierInformation", TierInformation, { lifecycle: Lifecycle.Singleton });
        this.tierInformation = container.resolve<TierInformation>("TierInformation");
        this.container.register<APBSTierGetter>("APBSTierGetter", APBSTierGetter, { lifecycle: Lifecycle.Singleton })
        this.apbsTierGetter = container.resolve<APBSTierGetter>("APBSTierGetter");
        this.container.register<APBSEquipmentGetter>("APBSEquipmentGetter", APBSEquipmentGetter, { lifecycle: Lifecycle.Singleton })
        this.apbsEquipmentGetter = container.resolve<APBSEquipmentGetter>("APBSEquipmentGetter");

        // Custom Special
        this.container.register<APBSDynamicRouterHooks>("APBSDynamicRouterHooks", APBSDynamicRouterHooks, { lifecycle: Lifecycle.Singleton });
        this.apbsDynamicRouterHooks = container.resolve<APBSDynamicRouterHooks>("APBSDynamicRouterHooks");
        this.container.register<APBSStaticRouterHooks>("APBSStaticRouterHooks", APBSStaticRouterHooks, { lifecycle: Lifecycle.Singleton });
        this.apbsStaticRouterHooks = container.resolve<APBSStaticRouterHooks>("APBSStaticRouterHooks");
        this.container.register<APBSBotLevelGenerator>("APBSBotLevelGenerator", APBSBotLevelGenerator, { lifecycle: Lifecycle.Singleton });
        this.apbsBotLevelGenerator = container.resolve<APBSBotLevelGenerator>("APBSBotLevelGenerator");
        this.container.register<APBSBotWeaponGenerator>("APBSBotWeaponGenerator", APBSBotWeaponGenerator, { lifecycle: Lifecycle.Singleton });
        this.apbsBotWeaponGenerator = container.resolve<APBSBotWeaponGenerator>("APBSBotWeaponGenerator");

        this.getPath();
    }

    public postDBLoad(container: DependencyContainer): void
    {
        // SPT Classes
        this.tables = container.resolve<DatabaseService>("DatabaseService").getTables();

        // Custom Classes
        this.botConfigs = new BotConfigs(this.tables);
        this.moddedWeaponHelper = new ModdedWeaponHelper(this.tables, this.database, this.itemHelper, this.tierInformation, this.apbsEquipmentGetter);

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