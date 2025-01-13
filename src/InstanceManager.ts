import * as fs from "fs";
import * as path from "path";

// SPT
import { DependencyContainer, Lifecycle } from "tsyringe";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { DynamicRouterModService } from "@spt/services/mod/dynamicRouter/DynamicRouterModService";
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
import { SeasonalEventService } from "@spt/services/SeasonalEventService";
import { VFS } from "@spt/utils/VFS";

// Custom
import { APBSLogger } from "./Utils/APBSLogger";
import { APBSStaticRouterHooks } from "./RouterHooks/APBSStaticRouterHooks";
import { RaidInformation } from "./Globals/RaidInformation";
import { ModInformation } from "./Globals/ModInformation";
import { TierInformation } from "./Globals/TierInformation";
import { APBSBotLevelGenerator } from "./Generators/ABPSBotLevelGenerator";
import { BotConfigs } from "./Alterations/BotConfigs";
import { APBSBotWeaponGenerator } from "./ClassExtensions/APBSBotWeaponGenerator";
import { APBSTierGetter } from "./Utils/APBSTierGetter";
import { APBSEquipmentGetter } from "./Utils/APBSEquipmentGetter";
import { ModdedImportHelper } from "./Helpers/ModdedImportHelper";
import { APBSBotGenerator } from "./ClassExtensions/APBSBotGenerator";
import { APBSDynamicRouterHooks } from "./RouterHooks/APBSDynamicRouterHooks";
import { APBSBotEquipmentModGenerator } from "./ClassExtensions/APBSBotEquipmentModGenerator";
import { APBSBotInventoryGenerator } from "./ClassExtensions/APBSBotInventoryGenerator";
import { APBSBotLootGenerator } from "./ClassExtensions/APBSBotLootGenerator";
import { ModConfig } from "./Globals/ModConfig";
import { JSONHelper } from "./Helpers/JSONHelper";
import { BlacklistHelper } from "./Helpers/BlacklistHelper";
import { RealismHelper } from "./Helpers/RealismHelper";
import { APBSTester } from "./Utils/APBSTester";
import { APBSAttachmentChecker } from "./Utils/APBSAttachmentChecker";
import { APBSBotLootCacheService } from "./ClassExtensions/APBSBotLootCacheService";
import { APBSPlayerScavGenerator } from "./ClassExtensions/APBSPlayerScavGenerator";
import { APBSExternalInventoryMagGen } from "./InventoryMagGen/APBSExternalInventoryMagGen";
import { APBSMethodHolder } from "./InventoryMagGen/APBSMethodHolder";
import { APBSBarrelInventoryMagGen } from "./InventoryMagGen/APBSBarrelInventoryMagGen";
import { APBSInternalMagazineInventoryMagGen } from "./InventoryMagGen/APBSInternalMagazineInventoryMagGen";
import { APBSUbglExternalMagGen } from "./InventoryMagGen/APBSUbglExternalMagGen";
import { APBSBotGeneratorHelper } from "./ClassExtensions/APBSBotGeneratorHelper";

export class InstanceManager 
{
    //#region accessible in or after preAkiLoad
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
    public vfs: VFS;
    public seasonalEventService: SeasonalEventService;

    public apbsLogger: APBSLogger;
    public apbsTierGetter: APBSTierGetter;
    public apbsBotGenerator: APBSBotGenerator;
    public apbsBotLevelGenerator: APBSBotLevelGenerator;
    public apbsEquipmentGetter: APBSEquipmentGetter;
    public apbsStaticRouterHooks: APBSStaticRouterHooks;
    public apbsDynamicRouterHooks: APBSDynamicRouterHooks;
    public apbsBotInventoryGenerator: APBSBotInventoryGenerator;
    public apbsAttachmentChecker: APBSAttachmentChecker;
    public jsonHelper: JSONHelper;
    public modConfig: ModConfig;
    public apbsTester: APBSTester;
    public apbsExternalInventoryMagGen: APBSExternalInventoryMagGen;
    public apbsMethodHolder: APBSMethodHolder;
    //#endregion

    //#region accessible in or after postDBLoad
    public tables: IDatabaseTables;
    public botConfigs: BotConfigs;
    public moddedImportHelper: ModdedImportHelper;
    public realismHelper: RealismHelper;
    //#endregion

    //#region accessible in or after PostSptLoad
    public blacklistHelper: BlacklistHelper;
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
        this.vfs = container.resolve<VFS>("VFS");
        this.seasonalEventService = container.resolve<SeasonalEventService>("SeasonalEventService");

        // Custom Classes
        this.container.register<ModInformation>("ModInformation", ModInformation, { lifecycle: Lifecycle.Singleton })
        this.modInformation = container.resolve<ModInformation>("ModInformation");
        this.container.register<APBSLogger>("APBSLogger", APBSLogger, { lifecycle: Lifecycle.Singleton });
        this.apbsLogger = container.resolve<APBSLogger>("APBSLogger");
        this.container.register<APBSTester>("APBSTester", APBSTester, { lifecycle: Lifecycle.Singleton })
        this.apbsTester = container.resolve<APBSTester>("APBSTester");
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
        this.container.register<JSONHelper>("JSONHelper", JSONHelper, { lifecycle: Lifecycle.Singleton });
        this.jsonHelper = container.resolve<JSONHelper>("JSONHelper");
        this.container.register<APBSAttachmentChecker>("APBSAttachmentChecker", APBSAttachmentChecker, { lifecycle: Lifecycle.Singleton })
        this.apbsAttachmentChecker = container.resolve<APBSAttachmentChecker>("APBSAttachmentChecker");
        this.container.register<APBSMethodHolder>("APBSMethodHolder", APBSMethodHolder, { lifecycle: Lifecycle.Singleton });
        this.apbsMethodHolder = container.resolve<APBSMethodHolder>("APBSMethodHolder");

        
        this.container.register<RealismHelper>("RealismHelper", { useClass: RealismHelper })
        
        this.container.register<APBSBotWeaponGenerator>("APBSBotWeaponGenerator", APBSBotWeaponGenerator);
        this.container.register<APBSBarrelInventoryMagGen>("APBSBarrelInventoryMagGen", { useClass: APBSBarrelInventoryMagGen })
        this.container.register<APBSExternalInventoryMagGen>("APBSExternalInventoryMagGen", { useClass: APBSExternalInventoryMagGen })
        this.container.register<APBSInternalMagazineInventoryMagGen>("APBSInternalMagazineInventoryMagGen", { useClass: APBSInternalMagazineInventoryMagGen })
        this.container.register<APBSUbglExternalMagGen>("APBSUbglExternalMagGen", { useClass: APBSUbglExternalMagGen })
        this.container.registerType("APBSInventoryMagGen", "APBSBarrelInventoryMagGen");
        this.container.registerType("APBSInventoryMagGen", "APBSExternalInventoryMagGen");
        this.container.registerType("APBSInventoryMagGen", "APBSInternalMagazineInventoryMagGen");
        this.container.registerType("APBSInventoryMagGen", "APBSUbglExternalMagGen");


        // Class Extension Override
        this.container.register<APBSBotGenerator>("APBSBotGenerator", APBSBotGenerator);
        this.container.register("BotGenerator", { useToken: "APBSBotGenerator" });
        this.container.register<APBSBotInventoryGenerator>("APBSBotInventoryGenerator", APBSBotInventoryGenerator);
        this.container.register("BotInventoryGenerator", { useToken: "APBSBotInventoryGenerator" });
        this.container.register<APBSBotEquipmentModGenerator>("APBSBotEquipmentModGenerator", APBSBotEquipmentModGenerator);
        this.container.register("BotEquipmentModGenerator", { useToken: "APBSBotEquipmentModGenerator" });
        this.container.register<APBSPlayerScavGenerator>("APBSPlayerScavGenerator", APBSPlayerScavGenerator);
        this.container.register("PlayerScavGenerator", { useToken: "APBSPlayerScavGenerator" });
        this.container.register<APBSBotLootCacheService>("APBSBotLootCacheService", APBSBotLootCacheService);
        this.container.register("BotLootCacheService", { useToken: "APBSBotLootCacheService" });
        this.container.register<APBSBotLootGenerator>("APBSBotLootGenerator", APBSBotLootGenerator);
        this.container.register("BotLootGenerator", { useToken: "APBSBotLootGenerator" });
        this.container.register<APBSBotGeneratorHelper>("APBSBotGeneratorHelper", APBSBotGeneratorHelper);
        this.container.register("BotGeneratorHelper", { useToken: "APBSBotGeneratorHelper" });

        this.container.register("BotWeaponGenerator", { useToken: "APBSBotWeaponGenerator" });

        
        // Resolve this last to set mod configs
        this.container.register<ModConfig>("ModConfig", ModConfig, { lifecycle: Lifecycle.Singleton })
        this.modConfig = container.resolve<ModConfig>("ModConfig");

        this.getPath();
    }

    public postDBLoad(container: DependencyContainer): void
    {
        // SPT Classes
        this.tables = container.resolve<DatabaseService>("DatabaseService").getTables();

        // Custom Classes
        this.botConfigs = new BotConfigs(this.tables, this.database, this.configServer, this.itemHelper, this.apbsEquipmentGetter, this.tierInformation, this.raidInformation, this.apbsLogger);
        this.moddedImportHelper = new ModdedImportHelper(this.tables, this.database, this.itemHelper, this.tierInformation, this.apbsEquipmentGetter, this.apbsAttachmentChecker, this.apbsLogger);
        this.realismHelper = new RealismHelper(this.tierInformation, this.apbsEquipmentGetter, this.apbsLogger);

    }

    public postSptLoad(container: DependencyContainer): void
    {
        // SPT Classes
        this.tables = container.resolve<DatabaseService>("DatabaseService").getTables();

        // Custom Classes
        this.blacklistHelper = new BlacklistHelper(this.database, this.apbsEquipmentGetter, this.apbsLogger);

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