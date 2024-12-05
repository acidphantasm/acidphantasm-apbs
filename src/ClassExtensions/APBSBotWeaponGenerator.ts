import { inject, injectable, injectAll } from "tsyringe";

import { DatabaseService } from "@spt/services/DatabaseService";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { APBSLogger } from "../Utils/APBSLogger";
import { BotWeaponGenerator } from "@spt/generators/BotWeaponGenerator";
import { IInventory, IModsChances } from "@spt/models/eft/common/tables/IBotType";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { APBSTierGetter } from "../Utils/APBSTierGetter";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { LocalisationService } from "@spt/services/LocalisationService";
import { IGenerateWeaponRequest } from "@spt/models/spt/bots/IGenerateWeaponRequest";
import { IGenerateWeaponResult } from "@spt/models/spt/bots/IGenerateWeaponResult";
import { HashUtil } from "@spt/utils/HashUtil";
import { ICloner } from "@spt/utils/cloners/ICloner";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { IInventoryMagGen } from "@spt/generators/weapongen/IInventoryMagGen";
import { RepairService } from "@spt/services/RepairService";
import { BotWeaponModLimitService } from "@spt/services/BotWeaponModLimitService";
import { BotGeneratorHelper } from "@spt/helpers/BotGeneratorHelper";
import { BotEquipmentModGenerator } from "@spt/generators/BotEquipmentModGenerator";
import { BotWeaponGeneratorHelper } from "@spt/helpers/BotWeaponGeneratorHelper";
import { RaidInformation } from "../Globals/RaidInformation";
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { ModConfig } from "../Globals/ModConfig";
import { Logging } from "../Enums/Logging";
import { APBSTester } from "../Utils/APBSTester";
import { ModInformation } from "../Globals/ModInformation";
import { Money } from "@spt/models/enums/Money";
import { APBSBotEquipmentModGenerator } from "./APBSBotEquipmentModGenerator";

/** Handle profile related client events */
@injectable()
export class APBSBotWeaponGenerator extends BotWeaponGenerator
{
    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper,
        @inject("BotGeneratorHelper") protected botGeneratorHelper: BotGeneratorHelper,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("BotWeaponGeneratorHelper") protected botWeaponGeneratorHelper: BotWeaponGeneratorHelper,
        @inject("BotWeaponModLimitService") protected botWeaponModLimitService: BotWeaponModLimitService,
        @inject("BotEquipmentModGenerator") protected botEquipmentModGenerator: BotEquipmentModGenerator,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("RepairService") protected repairService: RepairService,
        @injectAll("InventoryMagGen") protected inventoryMagGenComponents: IInventoryMagGen[],
        @inject("PrimaryCloner") protected cloner: ICloner,
        @inject("APBSLogger") protected apbsLogger: APBSLogger,
        @inject("APBSTierGetter") protected apbsTierGetter: APBSTierGetter,
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("APBSTester") protected apbsTester: APBSTester,
        @inject("APBSBotEquipmentModGenerator") protected apbsBotEquipmentModGenerator: APBSBotEquipmentModGenerator,
        @inject("ModInformation") protected modInformation: ModInformation
    )
    {
        super(logger, 
            hashUtil, 
            databaseService, 
            itemHelper, 
            weightedRandomHelper, 
            botGeneratorHelper, 
            randomUtil, 
            configServer, 
            botWeaponGeneratorHelper, 
            botWeaponModLimitService,
            botEquipmentModGenerator, 
            localisationService, 
            repairService, 
            inventoryMagGenComponents,
            cloner)
    }

    public apbsGenerateRandomWeapon(sessionId: string, equipmentSlot: string, botTemplateInventory: IInventory, weaponParentId: string, modChances: IModsChances, botRole: string, isPmc: boolean, botLevel: number, hasBothPrimary: boolean): IGenerateWeaponResult 
    {
        // If the profile was just created, then use vanilla weapon gen
        if (this.raidInformation.freshProfile)
        {
            const weaponTpl = this.pickWeightedWeaponTplFromPool(equipmentSlot, botTemplateInventory);
            return this.generateWeaponByTpl(sessionId, weaponTpl, equipmentSlot, botTemplateInventory, weaponParentId, modChances, botRole, isPmc, botLevel);
        }

        // Config disable checks to flip to default weapon gen
        if ((ModConfig.config.disableBossTierGeneration && (botRole.includes("boss") || botRole.includes("sectant") || botRole.includes("arena"))) || botRole == "bosslegion" || botRole == "bosspunisher")
        {
            const weaponTpl = this.pickWeightedWeaponTplFromPool(equipmentSlot, botTemplateInventory);
            return this.generateWeaponByTpl(sessionId, weaponTpl, equipmentSlot, botTemplateInventory, weaponParentId, modChances, botRole, isPmc, botLevel);
        }
        if (ModConfig.config.disableBossFollowerTierGeneration && botRole.includes("follower"))
        {
            const weaponTpl = this.pickWeightedWeaponTplFromPool(equipmentSlot, botTemplateInventory);
            return this.generateWeaponByTpl(sessionId, weaponTpl, equipmentSlot, botTemplateInventory, weaponParentId, modChances, botRole, isPmc, botLevel);
        }
        if (ModConfig.config.disableRaiderRogueTierGeneration && (botRole.includes("exusec") || botRole.includes("pmcbot")))
        {
            const weaponTpl = this.pickWeightedWeaponTplFromPool(equipmentSlot, botTemplateInventory);
            return this.generateWeaponByTpl(sessionId, weaponTpl, equipmentSlot, botTemplateInventory, weaponParentId, modChances, botRole, isPmc, botLevel);
        }
        if (ModConfig.config.disablePMCTierGeneration && (botRole.includes("pmcusec") || botRole.includes("pmcbear")))
        {
            const weaponTpl = this.pickWeightedWeaponTplFromPool(equipmentSlot, botTemplateInventory);
            return this.generateWeaponByTpl(sessionId, weaponTpl, equipmentSlot, botTemplateInventory, weaponParentId, modChances, botRole, isPmc, botLevel);
        }
        if (ModConfig.config.disableScavTierGeneration && (botRole.includes("assault") || botRole.includes("marksman")))
        {
            const weaponTpl = this.pickWeightedWeaponTplFromPool(equipmentSlot, botTemplateInventory);
            return this.generateWeaponByTpl(sessionId, weaponTpl, equipmentSlot, botTemplateInventory, weaponParentId, modChances, botRole, isPmc, botLevel);
        }
        if (botRole.includes("infected") || botRole.includes("spirit") || botRole.includes("skier") || botRole.includes("peacemaker") || botRole.includes("gifter"))
        {
            const weaponTpl = this.pickWeightedWeaponTplFromPool(equipmentSlot, botTemplateInventory);
            return this.generateWeaponByTpl(sessionId, weaponTpl, equipmentSlot, botTemplateInventory, weaponParentId, modChances, botRole, isPmc, botLevel);            
        }        

        // If not disabled via config, all bots follow this custom generation
        const tierInfo = this.apbsTierGetter.getTierByLevel(botLevel);
        const weaponTpl = 
            (hasBothPrimary && isPmc)
                ? this.apbsPickWeightedWeaponTplFromPoolHasBothPrimary(equipmentSlot, botLevel, botRole, tierInfo)
                : this.apbsPickWeightedWeaponTplFromPool(equipmentSlot, botLevel, botRole, tierInfo)
        return this.apbsGenerateWeaponByTpl(sessionId, weaponTpl, equipmentSlot, botTemplateInventory, weaponParentId, modChances, botRole, isPmc, botLevel, tierInfo)
    }

    private apbsPickWeightedWeaponTplFromPoolHasBothPrimary(equipmentSlot: string, botLevel: number, botRole: string, tierInfo: number): string
    {
        let rangeType = "ShortRange";
        if (equipmentSlot == "FirstPrimaryWeapon")
        {
            if (this.raidInformation.location == "Woods") rangeType = "LongRange";
            const weaponPool = this.apbsEquipmentGetter.getEquipmentByBotRole(botRole, tierInfo, equipmentSlot, rangeType);
            return this.weightedRandomHelper.getWeightedValue<string>(weaponPool);
        }
        if (equipmentSlot == "SecondPrimaryWeapon")
        {
            if (this.raidInformation.location != "Woods") rangeType = "LongRange";
            const weaponPool = this.apbsEquipmentGetter.getEquipmentByBotRole(botRole, tierInfo, equipmentSlot, rangeType);
            return this.weightedRandomHelper.getWeightedValue<string>(weaponPool);
        }
        
        const weaponPool = this.apbsEquipmentGetter.getEquipmentByBotRole(botRole, tierInfo, equipmentSlot);
        return this.weightedRandomHelper.getWeightedValue<string>(weaponPool);
    }

    private apbsPickWeightedWeaponTplFromPool(equipmentSlot: string, botLevel: number, botRole: string, tierInfo: number): string
    {
        if (equipmentSlot == "FirstPrimaryWeapon" || equipmentSlot == "SecondPrimaryWeapon")
        {
            const rangeType = this.weightedRandomHelper.getWeightedValue<string>(this.raidInformation.mapWeights[this.raidInformation.location]);
            const weaponPool = this.apbsEquipmentGetter.getEquipmentByBotRole(botRole, tierInfo, equipmentSlot, rangeType);
            return this.weightedRandomHelper.getWeightedValue<string>(weaponPool);
        }
        
        const weaponPool = this.apbsEquipmentGetter.getEquipmentByBotRole(botRole, tierInfo, equipmentSlot);
        return this.weightedRandomHelper.getWeightedValue<string>(weaponPool);
    }

    private apbsGenerateWeaponByTpl(
        sessionId: string,
        weaponTpl: string,
        equipmentSlot: string,
        botTemplateInventory: IInventory,
        weaponParentId: string,
        modChances: IModsChances,
        botRole: string,
        isPmc: boolean,
        botLevel: number,
        tierInfo: number
    ): IGenerateWeaponResult
    {
        const modPool = this.apbsEquipmentGetter.getModsByBotRole(botRole, tierInfo);
        const apbsModChances = this.apbsEquipmentGetter.getSpawnChancesByBotRole(botRole, tierInfo);
        let weaponChances = apbsModChances.weaponMods;
        const weaponItemTemplate = this.itemHelper.getItem(weaponTpl)[1];

        if (ModConfig.config.enablePerWeaponTypeAttachmentChances)
        {
            switch (weaponItemTemplate._parent)
            {
                case "5447b5fc4bdc2d87278b4567":
                    weaponChances = apbsModChances.assaultCarbine;
                    break;
                case "5447b6254bdc2dc3278b4568":
                    weaponChances = apbsModChances.sniperRifle;
                    break;
                case "5447b6194bdc2d67278b4567":
                    weaponChances = apbsModChances.marksmanRifle;
                    break;
                case "5447b5f14bdc2d61278b4567":
                    weaponChances = apbsModChances.assaultRifle;
                    break;
                case "5447bed64bdc2d97278b4568":
                    weaponChances = apbsModChances.machinegun;
                    break;
                case "5447b5e04bdc2d62278b4567":
                    weaponChances = apbsModChances.smg;
                    break;
                case "5447b5cf4bdc2d65278b4567":
                    weaponChances = apbsModChances.handgun;
                    break;
                case "617f1ef5e8b54b0998387733":
                    weaponChances = apbsModChances.revolver;
                    break;
                case "5447b6094bdc2dc3278b4567":
                    weaponChances = apbsModChances.shotgun;
                    break;
                case "5447bedf4bdc2d87278b4568":
                    weaponChances = apbsModChances.weaponMods;
                    break;
                default:
                    weaponChances = apbsModChances.weaponMods;
                    this.apbsLogger.log(Logging.WARN, `ItemTemplate._parent is missing classification - Report to acidphantasm - ${weaponItemTemplate._parent}`)
                    break;
            }
        }

        if (!weaponItemTemplate)
        {
            this.logger.error(this.localisationService.getText("bot-missing_item_template", weaponTpl));
            this.logger.error(`WeaponSlot -> ${equipmentSlot}`);

            return;
        }

        // Find ammo to use when filling magazines/chamber
        if (!botTemplateInventory.Ammo)
        {
            this.logger.error(this.localisationService.getText("bot-no_ammo_found_in_bot_json", botRole));

            throw new Error(this.localisationService.getText("bot-generation_failed"));
        }
        const ammoTable = this.apbsEquipmentGetter.getAmmoByBotRole(botRole, tierInfo)
        const ammoTpl = this.getWeightedCompatibleAmmo(ammoTable, weaponItemTemplate);

        // Create with just base weapon item
        let weaponWithModsArray = this.constructWeaponBaseArray(
            weaponTpl,
            weaponParentId,
            equipmentSlot,
            weaponItemTemplate,
            botRole
        );

        // Chance to add randomised weapon enhancement
        if (isPmc && this.randomUtil.getChance100(this.pmcConfig.weaponHasEnhancementChancePercent))
        {
            const weaponConfig = this.repairConfig.repairKit.weapon;
            this.repairService.addBuff(weaponConfig, weaponWithModsArray[0]);
        }

        // Add mods to weapon base
        if (Object.keys(modPool).includes(weaponTpl))
        {
            const botEquipmentRole = this.botGeneratorHelper.getBotEquipmentRole(botRole);
            const modLimits = this.botWeaponModLimitService.getWeaponModLimits(botEquipmentRole);

            const generateWeaponModsRequest: IGenerateWeaponRequest = {
                weapon: weaponWithModsArray, // Will become hydrated array of weapon + mods
                modPool: modPool,
                weaponId: weaponWithModsArray[0]._id, // Weapon root id
                parentTemplate: weaponItemTemplate,
                modSpawnChances: weaponChances,
                ammoTpl: ammoTpl,
                botData: { role: botRole, level: botLevel, equipmentRole: botEquipmentRole },
                modLimits: modLimits,
                weaponStats: {},
                conflictingItemTpls: new Set()
            };
            weaponWithModsArray = this.apbsBotEquipmentModGenerator.apbsGenerateModsForWeapon(
                sessionId,
                generateWeaponModsRequest,
                isPmc
            );
        }

        // Use weapon preset from globals.json if weapon isnt valid
        if (!this.isWeaponValid(weaponWithModsArray, botRole))
        {
            // Weapon is bad, fall back to weapons preset
            weaponWithModsArray = this.getPresetWeaponMods(
                weaponTpl,
                equipmentSlot,
                weaponParentId,
                weaponItemTemplate,
                botRole
            );
        }

        // Fill existing magazines to full and sync ammo type
        for (const magazine of weaponWithModsArray.filter((item) => item.slotId === this.modMagazineSlotId))
        {
            this.fillExistingMagazines(weaponWithModsArray, magazine, ammoTpl);
        }

        // Add cartridge(s) to gun chamber(s)
        if (
            weaponItemTemplate._props.Chambers?.length > 0
            && weaponItemTemplate._props.Chambers[0]?._props?.filters[0]?.Filter?.includes(ammoTpl)
        )
        {
            // Guns have variety of possible Chamber ids, patron_in_weapon/patron_in_weapon_000/patron_in_weapon_001
            const chamberSlotNames = weaponItemTemplate._props.Chambers.map((x) => x._name);
            this.addCartridgeToChamber(weaponWithModsArray, ammoTpl, chamberSlotNames);
        }

        // Fill UBGL if found
        const ubglMod = weaponWithModsArray.find((x) => x.slotId === "mod_launcher");
        let ubglAmmoTpl: string = undefined;
        if (ubglMod)
        {
            const ubglTemplate = this.itemHelper.getItem(ubglMod._tpl)[1];
            ubglAmmoTpl = this.getWeightedCompatibleAmmo(botTemplateInventory.Ammo, ubglTemplate);
            this.fillUbgl(weaponWithModsArray, ubglMod, ubglAmmoTpl);
        }
        
        // This is for testing...
        if (this.modInformation.testMode && this.modInformation.testBotRole.includes(botRole.toLowerCase()))
        {
            const tables = this.databaseService.getTables();
            const assortWeapon = this.cloner.clone(weaponWithModsArray);
            for (const item in assortWeapon)
            {
                const oldID = assortWeapon[item]._id
                const newID = this.hashUtil.generate();
                assortWeapon[item]._id = newID;
                
                // Loop array again to fix parentID
                for (const i in assortWeapon)
                {
                    if (assortWeapon[i].parentId == oldID) 
                    {
                        assortWeapon[i].parentId = newID
                    }
                }
            }
            this.apbsTester.createComplexAssortItem(assortWeapon)
                .addUnlimitedStackCount()
                .addMoneyCost(Money.ROUBLES, 20000)
                .addBuyRestriction(3)
                .addLoyaltyLevel(1)
                .export(tables.traders[this.modInformation.testTrader]);
        }

        return {
            weapon: weaponWithModsArray,
            chosenAmmoTpl: ammoTpl,
            chosenUbglAmmoTpl: ubglAmmoTpl,
            weaponMods: modPool,
            weaponTemplate: weaponItemTemplate
        };
    }
}
