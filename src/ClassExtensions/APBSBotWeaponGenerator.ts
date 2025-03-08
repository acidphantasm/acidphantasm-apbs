import { inject, injectable, injectAll } from "tsyringe";

import { DatabaseService } from "@spt/services/DatabaseService";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { APBSLogger } from "../Utils/APBSLogger";
import { BotWeaponGenerator } from "@spt/generators/BotWeaponGenerator";
import { IInventory as PmcInventory } from "@spt/models/eft/common/tables/IBotBase";
import { IGenerationData, IInventory } from "@spt/models/eft/common/tables/IBotType";
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
import { EnableChance, ModConfig, ToploadConfig } from "../Globals/ModConfig";
import { Logging } from "../Enums/Logging";
import { APBSTester } from "../Utils/APBSTester";
import { ModInformation } from "../Globals/ModInformation";
import { Money } from "@spt/models/enums/Money";
import { APBSBotEquipmentModGenerator } from "./APBSBotEquipmentModGenerator";
import { APBSInventoryMagGen } from "../InventoryMagGen/APBSInventoryMagGen";
import { APBSIInventoryMagGen } from "../InventoryMagGen/APBSIInventoryMagGen";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { IItem } from "@spt/models/eft/common/tables/IItem";
import { APBSIChances } from "../Interface/APBSIChances";
import { APBSIQuestBotGenerationDetails } from "../Interface/APBSIQuestBotGear";
import { EquipmentSlots } from "@spt/models/enums/EquipmentSlots";
import { BossBots, FollowerBots, PMCBots, ScavBots, SpecialBots } from "../Enums/Bots";
import { BaseClasses } from "@spt/models/enums/BaseClasses";

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
        @inject("ModInformation") protected modInformation: ModInformation,
        @injectAll("APBSInventoryMagGen") protected apbsInventoryMagGenComponents: APBSIInventoryMagGen[]
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

    public apbsGenerateRandomWeapon(sessionId: string, equipmentSlot: string, botTemplateInventory: IInventory, weaponParentId: string, modChances: APBSIChances, botRole: string, isPmc: boolean, botLevel: number, tierNumber: number, hasBothPrimary: boolean, questInformation: APBSIQuestBotGenerationDetails): IGenerateWeaponResult 
    {
        if (!questInformation.isQuesting || equipmentSlot == EquipmentSlots.HOLSTER || questInformation.questData.PrimaryWeapon.length === 0)
        {
            const weaponTpl = 
                (hasBothPrimary && isPmc)
                    ? this.apbsPickWeightedWeaponTplFromPoolHasBothPrimary(equipmentSlot, botRole, tierNumber)
                    : this.apbsPickWeightedWeaponTplFromPool(equipmentSlot, botRole, tierNumber)
            return this.apbsGenerateWeaponByTpl(sessionId, weaponTpl, equipmentSlot, botTemplateInventory, weaponParentId, modChances, botRole, isPmc, botLevel, tierNumber, questInformation)
        }

        const questWeaponTpl = hasBothPrimary 
            ? this.apbsPickWeightedWeaponTplFromQuestPoolBothPrimary(equipmentSlot, botRole, tierNumber, questInformation)
            : this.apbsPickWeightedWeaponTplFromQuestPool(equipmentSlot, botRole, tierNumber, questInformation)
        return this.apbsGenerateWeaponByTpl(sessionId, questWeaponTpl, equipmentSlot, botTemplateInventory, weaponParentId, modChances, botRole, isPmc, botLevel, tierNumber, questInformation)
    }

    private apbsPickWeightedWeaponTplFromQuestPool(equipmentSlot: string, botRole: string, tierInfo: number, questInformation: APBSIQuestBotGenerationDetails): string
    {
        const newEquipmentPool = {};
        for (const item in questInformation.questData.PrimaryWeapon)
        {
            const itemTPL = questInformation.questData.PrimaryWeapon[item];
            newEquipmentPool[itemTPL] = 1;
        }
        return this.weightedRandomHelper.getWeightedValue<string>(newEquipmentPool);
    }

    private apbsPickWeightedWeaponTplFromQuestPoolBothPrimary(equipmentSlot: string, botRole: string, tierInfo: number, questInformation: APBSIQuestBotGenerationDetails): string
    {
        const newEquipmentPool = {};

        // Specific to Fishing Gear - put the SV-98 in the second primary weapon slot
        if (questInformation.questData.questName == "Fishing Gear")
        {
            if (equipmentSlot == EquipmentSlots.SECOND_PRIMARY_WEAPON)
            {
                for (const item in questInformation.questData.PrimaryWeapon)
                {
                    const itemTPL = questInformation.questData.PrimaryWeapon[item];
                    newEquipmentPool[itemTPL] = 1;
                }
                return this.weightedRandomHelper.getWeightedValue<string>(newEquipmentPool);
            }

            const rangeType = this.weightedRandomHelper.getWeightedValue<string>(this.raidInformation.mapWeights[this.raidInformation.location]);
            const weaponPool = this.apbsEquipmentGetter.getEquipmentByBotRoleAndSlot(botRole, tierInfo, equipmentSlot, rangeType);
            return this.weightedRandomHelper.getWeightedValue<string>(weaponPool);
        }

        let range;
        if (questInformation.questData.requiredEquipmentSlots.includes("ShortRange")) range = "ShortRange";
        else range = "LongRange";
        // All other quests, put the required weapon in the primary weapon slot
        if (equipmentSlot == EquipmentSlots.SECOND_PRIMARY_WEAPON)
        {
            const weaponPool = this.apbsEquipmentGetter.getEquipmentByBotRoleAndSlot(botRole, tierInfo, equipmentSlot, range);
            return this.weightedRandomHelper.getWeightedValue<string>(weaponPool);
        }

        for (const item in questInformation.questData.PrimaryWeapon)
        {
            const itemTPL = questInformation.questData.PrimaryWeapon[item];
            newEquipmentPool[itemTPL] = 1;
        }
        return this.weightedRandomHelper.getWeightedValue<string>(newEquipmentPool);
    }
    private apbsPickWeightedWeaponTplFromPoolHasBothPrimary(equipmentSlot: string, botRole: string, tierInfo: number): string
    {
        let rangeType = "ShortRange";
        if (equipmentSlot == EquipmentSlots.FIRST_PRIMARY_WEAPON)
        {
            if (this.raidInformation.location == "Woods") rangeType = "LongRange";
            const weaponPool = this.apbsEquipmentGetter.getEquipmentByBotRoleAndSlot(botRole, tierInfo, equipmentSlot, rangeType);
            return this.weightedRandomHelper.getWeightedValue<string>(weaponPool);
        }
        if (equipmentSlot == EquipmentSlots.SECOND_PRIMARY_WEAPON)
        {
            if (this.raidInformation.location != "Woods") rangeType = "LongRange";
            const weaponPool = this.apbsEquipmentGetter.getEquipmentByBotRoleAndSlot(botRole, tierInfo, equipmentSlot, rangeType);
            return this.weightedRandomHelper.getWeightedValue<string>(weaponPool);
        }
        
        const weaponPool = this.apbsEquipmentGetter.getEquipmentByBotRoleAndSlot(botRole, tierInfo, equipmentSlot);
        return this.weightedRandomHelper.getWeightedValue<string>(weaponPool);
    }

    private apbsPickWeightedWeaponTplFromPool(equipmentSlot: string, botRole: string, tierInfo: number): string
    {
        if (equipmentSlot == EquipmentSlots.FIRST_PRIMARY_WEAPON || equipmentSlot == EquipmentSlots.SECOND_PRIMARY_WEAPON)
        {
            const rangeType = this.weightedRandomHelper.getWeightedValue<string>(this.raidInformation.mapWeights[this.raidInformation.location]);
            const weaponPool = this.apbsEquipmentGetter.getEquipmentByBotRoleAndSlot(botRole, tierInfo, equipmentSlot, rangeType);
            return this.weightedRandomHelper.getWeightedValue<string>(weaponPool);
        }
        
        const weaponPool = this.apbsEquipmentGetter.getEquipmentByBotRoleAndSlot(botRole, tierInfo, equipmentSlot);
        return this.weightedRandomHelper.getWeightedValue<string>(weaponPool);
    }

    private apbsGenerateWeaponByTpl(
        sessionId: string,
        weaponTpl: string,
        equipmentSlot: string,
        botTemplateInventory: IInventory,
        weaponParentId: string,
        modChances: APBSIChances,
        botRole: string,
        isPmc: boolean,
        botLevel: number,
        tierInfo: number,
        questInformation: APBSIQuestBotGenerationDetails
    ): IGenerateWeaponResult
    {
        const modPool = this.apbsEquipmentGetter.getModsByBotRole(botRole, tierInfo);
        let weaponChances = modChances.weaponMods;
        const weaponItemTemplate = this.itemHelper.getItem(weaponTpl)[1];

        if (ModConfig.config.generalConfig.enablePerWeaponTypeAttachmentChances)
        {
            switch (weaponItemTemplate._parent)
            {
                case "5447b5fc4bdc2d87278b4567":
                    weaponChances = modChances.assaultCarbine;
                    break;
                case "5447b6254bdc2dc3278b4568":
                    weaponChances = modChances.sniperRifle;
                    break;
                case "5447b6194bdc2d67278b4567":
                    weaponChances = modChances.marksmanRifle;
                    break;
                case "5447b5f14bdc2d61278b4567":
                    weaponChances = modChances.assaultRifle;
                    break;
                case "5447bed64bdc2d97278b4568":
                    weaponChances = modChances.machinegun;
                    break;
                case "5447b5e04bdc2d62278b4567":
                    weaponChances = modChances.smg;
                    break;
                case "5447b5cf4bdc2d65278b4567":
                    weaponChances = modChances.handgun;
                    break;
                case "617f1ef5e8b54b0998387733":
                    weaponChances = modChances.revolver;
                    break;
                case "5447b6094bdc2dc3278b4567":
                    weaponChances = modChances.shotgun;
                    break;
                case "5447bedf4bdc2d87278b4568":
                    weaponChances = modChances.weaponMods;
                    break;
                default:
                    weaponChances = modChances.weaponMods;
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
        const ammoTpl = this.apbsGetWeightedCompatibleAmmo(ammoTable, weaponItemTemplate);

        // Create with just base weapon item
        let weaponWithModsArray = this.constructWeaponBaseArray(
            weaponTpl,
            weaponParentId,
            equipmentSlot,
            weaponItemTemplate,
            botRole
        );

        let weaponEnhancementChance = 0;
        if (this.raidInformation.isBotEnabled(botRole))
        {
            if (Object.values(PMCBots).includes(botRole as PMCBots))
            {
                weaponEnhancementChance = ModConfig.config.pmcBots.weaponDurability.enhancementChance;
            }
            if (Object.values(ScavBots).includes(botRole as ScavBots))
            {
                weaponEnhancementChance = ModConfig.config.scavBots.weaponDurability.enhancementChance;
            }
            if (Object.values(BossBots).includes(botRole as BossBots))
            {
                weaponEnhancementChance = ModConfig.config.bossBots.weaponDurability.enhancementChance;
            }
            if (Object.values(FollowerBots).includes(botRole as FollowerBots))
            {
                weaponEnhancementChance = ModConfig.config.followerBots.weaponDurability.enhancementChance;
            }
            if (Object.values(SpecialBots).includes(botRole as SpecialBots))
            {
                weaponEnhancementChance = ModConfig.config.specialBots.weaponDurability.enhancementChance;
            }
        }

        // Chance to add randomised weapon enhancement
        if (this.randomUtil.getChance100(weaponEnhancementChance))
        {
            const weaponConfig = this.repairConfig.repairKit.weapon;
            this.repairService.addBuff(weaponConfig, weaponWithModsArray[0]);
        }

        // Add mods to weapon base
        if (Object.keys(modPool).includes(weaponTpl))
        {
            const botEquipmentRole = this.botGeneratorHelper.getBotEquipmentRole(botRole);
            const modLimits = this.botWeaponModLimitService.getWeaponModLimits(botEquipmentRole);

            if (this.itemHelper.isOfBaseclass(weaponTpl, BaseClasses.PISTOL))
            {
                modLimits.scopeMax = 1;
            }

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
                isPmc,
                questInformation,
                weaponItemTemplate._id
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
            ubglAmmoTpl = this.apbsGetWeightedCompatibleAmmo(botTemplateInventory.Ammo, ubglTemplate);
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
                .addStackCount(1)
                .addMoneyCost(Money.ROUBLES, botLevel)
                .addBuyRestriction(1)
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

    public apbsAddExtraMagazinesToInventory(
        generatedWeaponResult: IGenerateWeaponResult,
        magWeights: IGenerationData,
        inventory: PmcInventory,
        botRole: string,
        botLevel: number,
        tier: number
    ): void 
    {
        const weaponAndMods = generatedWeaponResult.weapon;
        const weaponTemplate = generatedWeaponResult.weaponTemplate;
        const magazineTpl = this.getMagazineTplFromWeaponTemplate(weaponAndMods, weaponTemplate, botRole);

        const magTemplate = this.itemHelper.getItem(magazineTpl)[1];
        if (!magTemplate) 
        {
            this.logger.error(this.localisationService.getText("bot-unable_to_find_magazine_item", magazineTpl));

            return;
        }

        const ammoTemplate = this.itemHelper.getItem(generatedWeaponResult.chosenAmmoTpl)[1];
        if (!ammoTemplate) 
        {
            this.logger.error(
                this.localisationService.getText("bot-unable_to_find_ammo_item", generatedWeaponResult.chosenAmmoTpl)
            );

            return;
        }

        // Has an UBGL
        if (generatedWeaponResult.chosenUbglAmmoTpl) 
        {
            this.addUbglGrenadesToBotInventory(weaponAndMods, generatedWeaponResult, inventory);
        }

        const apbsInventoryMagGenModel = new APBSInventoryMagGen(
            magWeights,
            magTemplate,
            weaponTemplate,
            ammoTemplate,
            inventory,
            botRole,
            botLevel,
            tier,
            this.getToploadConfig(botRole),
            this.getRerollConfig(botRole)
        );
        this.apbsInventoryMagGenComponents
            .find((v) => v.canHandleInventoryMagGen(apbsInventoryMagGenModel))
            .process(apbsInventoryMagGenModel);

        // Add x stacks of bullets to SecuredContainer (bots use a magic mag packing skill to reload instantly)
        this.addAmmoToSecureContainer(
            this.botConfig.secureContainerAmmoStackCount,
            generatedWeaponResult.chosenAmmoTpl,
            ammoTemplate._props.StackMaxSize,
            inventory
        );
    }

    // I'm only overriding this so I can get the ID and not the name because most custom item mods don't change this.
    protected override isWeaponValid(weaponItemArray: IItem[], botRole: string): boolean 
    {
        for (const mod of weaponItemArray) 
        {
            const modTemplate = this.itemHelper.getItem(mod._tpl)[1];
            if (!modTemplate._props.Slots?.length) 
            {
                continue;
            }

            // Iterate over required slots in db item, check mod exists for that slot
            for (const modSlotTemplate of modTemplate._props.Slots.filter((slot) => slot._required)) 
            {
                const slotName = modSlotTemplate._name;
                const hasWeaponSlotItem = weaponItemArray.some(
                    (weaponItem) => weaponItem.parentId === mod._id && weaponItem.slotId === slotName
                );
                if (!hasWeaponSlotItem) 
                {
                    this.logger.warning(
                        this.localisationService.getText("bot-weapons_required_slot_missing_item", {
                            modSlot: modSlotTemplate._name,
                            modName: modTemplate._id,
                            slotId: mod.slotId,
                            botRole: botRole
                        })
                    );

                    return false;
                }
            }
        }

        return true;
    }

    public apbsGetWeightedCompatibleAmmo(
        cartridgePool: Record<string, Record<string, number>>,
        weaponTemplate: ITemplateItem
    ): string 
    {
        let desiredCaliber = this.getWeaponCaliber(weaponTemplate);

        if ((weaponTemplate._id == "67a01e4ea2b82626b73d10a3" || weaponTemplate._id == "67a01e4ea2b82626b73d10a4"))
        {
            if (this.randomUtil.getChance100(50))
            {
                desiredCaliber = "Caliber762x39";
            }
        }

        let cartridgePoolForWeapon = cartridgePool[desiredCaliber];
        if (!cartridgePoolForWeapon || cartridgePoolForWeapon?.length === 0) 
        {
            this.logger.debug(`weapon generation, ${desiredCaliber}`)
            this.logger.debug(
                this.localisationService.getText("bot-no_caliber_data_for_weapon_falling_back_to_default", {
                    weaponId: weaponTemplate._id,
                    weaponName: weaponTemplate._name,
                    defaultAmmo: weaponTemplate._props.defAmmo
                })
            );

            // Immediately returns, default ammo is guaranteed to be compatible
            return weaponTemplate._props.defAmmo;
        }

        // Get cartridges the weapons first chamber allow
        const compatibleCartridgesInTemplate = this.getCompatibleCartridgesFromWeaponTemplate(weaponTemplate);
        if (!compatibleCartridgesInTemplate) 
        {
            // No chamber data found in weapon, send default
            return weaponTemplate._props.defAmmo;
        }

        // Inner join the weapons allowed + passed in cartridge pool to get compatible cartridges
        const compatibleCartridges = {};
        for (const cartridge of Object.keys(cartridgePoolForWeapon)) 
        {
            if (compatibleCartridgesInTemplate.includes(cartridge)) 
            {
                compatibleCartridges[cartridge] = cartridgePoolForWeapon[cartridge];
            }
        }

        // If no compatible cartridges found still, get caliber data from magazine in weapon template
        if (Object.keys(compatibleCartridges).length === 0) 
        {
            // Get cartridges from the weapons first magazine in filters
            const compatibleCartridgesInMagazine = this.getCompatibleCartridgesFromMagazineTemplate(weaponTemplate);
            if (compatibleCartridgesInMagazine.length === 0) 
            {
                // No compatible cartridges found in magazine, use default
                this.apbsLogger.log(Logging.DEBUG, `[AMMO] No compatible ammo found for ${weaponTemplate._id}, using weapons default ammo instead.`);
                return weaponTemplate._props.defAmmo;
            }
            // Get the caliber data from the first compatible round in the magazine
            const magazineCaliberData = this.itemHelper.getItem(compatibleCartridgesInMagazine[0])[1]._props.Caliber;
            cartridgePoolForWeapon = cartridgePool[magazineCaliberData];

            for (const cartridge of Object.keys(cartridgePoolForWeapon)) 
            {
                if (compatibleCartridgesInMagazine.includes(cartridge)) 
                {
                    compatibleCartridges[cartridge] = cartridgePoolForWeapon[cartridge];
                }
            }

            // Nothing found after also checking magazines, return default ammo
            if (Object.keys(compatibleCartridges).length === 0) 
            {
                this.apbsLogger.log(Logging.DEBUG, `[AMMO] No compatible ammo found for ${weaponTemplate._id} in last ditch effort, using weapons default ammo instead.`);
                return weaponTemplate._props.defAmmo;
            }
        }

        return this.weightedRandomHelper.getWeightedValue<string>(compatibleCartridges);
    }

    private getRerollConfig(botRole: string): EnableChance
    {
        if (Object.values(PMCBots).includes(botRole as PMCBots)) return ModConfig.config.pmcBots.rerollConfig;
        if (Object.values(ScavBots).includes(botRole as ScavBots)) return ModConfig.config.scavBots.rerollConfig;
        if (Object.values(BossBots).includes(botRole as BossBots)) return ModConfig.config.bossBots.rerollConfig;
        if (Object.values(FollowerBots).includes(botRole as FollowerBots)) return ModConfig.config.followerBots.rerollConfig;
        if (Object.values(SpecialBots).includes(botRole as SpecialBots)) return ModConfig.config.specialBots.rerollConfig;

        return {
            enable: false,
            chance: 0
        };
    }

    private getToploadConfig(botRole: string): ToploadConfig
    {
        if (Object.values(PMCBots).includes(botRole as PMCBots)) return ModConfig.config.pmcBots.toploadConfig;
        if (Object.values(ScavBots).includes(botRole as ScavBots)) return ModConfig.config.scavBots.toploadConfig;
        if (Object.values(BossBots).includes(botRole as BossBots)) return ModConfig.config.bossBots.toploadConfig;
        if (Object.values(FollowerBots).includes(botRole as FollowerBots)) return ModConfig.config.followerBots.toploadConfig;
        if (Object.values(SpecialBots).includes(botRole as SpecialBots)) return ModConfig.config.specialBots.toploadConfig;

        return {
            enable: false,
            chance: 0,
            percent: 0
        };
    }
}