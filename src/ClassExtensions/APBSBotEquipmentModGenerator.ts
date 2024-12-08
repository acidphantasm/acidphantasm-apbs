import { inject, injectable } from "tsyringe";

import { BotGeneratorHelper } from "@spt/helpers/BotGeneratorHelper";
import { BotHelper } from "@spt/helpers/BotHelper";
import { BotWeaponGeneratorHelper } from "@spt/helpers/BotWeaponGeneratorHelper";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { PresetHelper } from "@spt/helpers/PresetHelper";
import { ProbabilityHelper } from "@spt/helpers/ProbabilityHelper";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { IItem } from "@spt/models/eft/common/tables/IItem";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { ModSpawn } from "@spt/models/enums/ModSpawn";
import { IFilterPlateModsForSlotByLevelResult, Result } from "@spt/models/spt/bots/IFilterPlateModsForSlotByLevelResult";
import { IGenerateEquipmentProperties } from "@spt/models/spt/bots/IGenerateEquipmentProperties";
import { ExhaustableArray } from "@spt/models/spt/server/ExhaustableArray";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { BotEquipmentFilterService } from "@spt/services/BotEquipmentFilterService";
import { BotEquipmentModPoolService } from "@spt/services/BotEquipmentModPoolService";
import { BotWeaponModLimitService } from "@spt/services/BotWeaponModLimitService";
import { DatabaseService } from "@spt/services/DatabaseService";
import { ItemFilterService } from "@spt/services/ItemFilterService";
import { LocalisationService } from "@spt/services/LocalisationService";
import { HashUtil } from "@spt/utils/HashUtil";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { ICloner } from "@spt/utils/cloners/ICloner";

import { BotEquipmentModGenerator } from "@spt/generators/BotEquipmentModGenerator";
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { APBSTierGetter } from "../Utils/APBSTierGetter";
import { ModConfig } from "../Globals/ModConfig";
import { RaidInformation } from "../Globals/RaidInformation";
import { IChooseRandomCompatibleModResult } from "@spt/models/spt/bots/IChooseRandomCompatibleModResult";
import { ModInformation } from "../Globals/ModInformation";
import { APBSTester } from "../Utils/APBSTester";
import { Money } from "@spt/models/enums/Money";
import { IGenerateWeaponRequest } from "@spt/models/spt/bots/IGenerateWeaponRequest";
import { IModToSpawnRequest } from "@spt/models/spt/bots/IModToSpawnRequest";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { IEquipmentFilterDetails } from "@spt/models/spt/config/IBotConfig";

/** Handle profile related client events */
@injectable()
export class APBSBotEquipmentModGenerator extends BotEquipmentModGenerator
{

    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("ProbabilityHelper") protected probabilityHelper: ProbabilityHelper,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("BotEquipmentFilterService") protected botEquipmentFilterService: BotEquipmentFilterService,
        @inject("ItemFilterService") protected itemFilterService: ItemFilterService,
        @inject("ProfileHelper") protected profileHelper: ProfileHelper,
        @inject("BotWeaponModLimitService") protected botWeaponModLimitService: BotWeaponModLimitService,
        @inject("BotHelper") protected botHelper: BotHelper,
        @inject("BotGeneratorHelper") protected botGeneratorHelper: BotGeneratorHelper,
        @inject("BotWeaponGeneratorHelper") protected botWeaponGeneratorHelper: BotWeaponGeneratorHelper,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper,
        @inject("PresetHelper") protected presetHelper: PresetHelper,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("BotEquipmentModPoolService") protected botEquipmentModPoolService: BotEquipmentModPoolService,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("PrimaryCloner") protected cloner: ICloner,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("APBSTierGetter") protected apbsTierGetter: APBSTierGetter,
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("ModInformation") protected modInformation: ModInformation,
        @inject("APBSTester") protected apbsTester: APBSTester
    )
    {
        super(logger, 
            hashUtil, 
            randomUtil, 
            probabilityHelper, 
            databaseService, 
            itemHelper, 
            botEquipmentFilterService, 
            itemFilterService, 
            profileHelper, 
            botWeaponModLimitService, 
            botHelper, 
            botGeneratorHelper, 
            botWeaponGeneratorHelper, 
            weightedRandomHelper, 
            presetHelper, 
            localisationService, 
            botEquipmentModPoolService, 
            configServer, 
            cloner)
    }

    public override generateModsForEquipment(equipment: IItem[], parentId: string, parentTemplate: ITemplateItem, settings: IGenerateEquipmentProperties, specificBlacklist: IEquipmentFilterDetails, shouldForceSpawn: boolean): IItem[]
    {
        let forceSpawn = shouldForceSpawn;

        const botRole = settings.botData.role;
        const tier = this.apbsTierGetter.getTierByLevel(settings.botData.level);
        const tieredModPool = this.apbsEquipmentGetter.getModsByBotRole(botRole, tier)
        let compatibleModsPool = tieredModPool[parentTemplate._id]
        let actualModPool = tieredModPool;
        let spawnChances = this.apbsEquipmentGetter.getSpawnChancesByBotRole(botRole, tier);

        // Roll weapon spawns (primary/secondary/holster) and generate a weapon for each roll that passed
        if ((ModConfig.config.disableBossTierGeneration && (botRole.includes("boss") || botRole.includes("sectant") || botRole.includes("arena"))) || botRole == "bosslegion" || botRole == "bosspunisher")
        {
            spawnChances = settings.spawnChances;
            compatibleModsPool = settings.modPool[parentTemplate._id];
            actualModPool = settings.modPool;
        }
        if (ModConfig.config.disableBossFollowerTierGeneration && botRole.includes("follower"))
        {
            spawnChances = settings.spawnChances;
            compatibleModsPool = settings.modPool[parentTemplate._id];
            actualModPool = settings.modPool;
        }
        if (ModConfig.config.disableRaiderRogueTierGeneration && (botRole.includes("exusec") || botRole.includes("pmcbot")))
        {
            spawnChances = settings.spawnChances;
            compatibleModsPool = settings.modPool[parentTemplate._id];
            actualModPool = settings.modPool;
        }
        if (ModConfig.config.disablePMCTierGeneration && (botRole.includes("pmcusec") || botRole.includes("pmcbear")))
        {
            spawnChances = settings.spawnChances;
            compatibleModsPool = settings.modPool[parentTemplate._id];
            actualModPool = settings.modPool;
        }
        if (ModConfig.config.disableScavTierGeneration && (botRole.includes("assault") || botRole.includes("marksman")))
        {
            spawnChances = settings.spawnChances;
            compatibleModsPool = settings.modPool[parentTemplate._id];
            actualModPool = settings.modPool;
        }
        if (botRole.includes("infected") || botRole.includes("spirit") || botRole.includes("skier") || botRole.includes("peacemaker") || botRole.includes("gifter"))
        {
            spawnChances = settings.spawnChances;
            compatibleModsPool = settings.modPool[parentTemplate._id];
            actualModPool = settings.modPool;
        }

        if (!compatibleModsPool)
        {
            this.logger.warning(
                `bot: ${botRole} lacks a mod slot pool for item: ${parentTemplate._id} ${parentTemplate._name}`);
        }

        // Iterate over mod pool and choose mods to add to item
        for (const modSlotName in compatibleModsPool)
        {
            if (modSlotName === "mod_equipment_000" && this.raidInformation.nightTime) continue;

            const itemSlotTemplate = this.getModItemSlotFromDb(modSlotName, parentTemplate);
            if (!itemSlotTemplate)
            {
                this.logger.error(
                    this.localisationService.getText("bot-mod_slot_missing_from_item", {
                        modSlot: modSlotName,
                        parentId: parentTemplate._id,
                        parentName: parentTemplate._name,
                        botRole: settings.botData.role
                    })
                );
                continue;
            }
            const modSpawnResult = this.shouldModBeSpawned(
                itemSlotTemplate,
                modSlotName.toLowerCase(),
                spawnChances.equipmentMods,
                settings.botEquipmentConfig
            );
            if (modSpawnResult === ModSpawn.SKIP && !forceSpawn)
            {
                continue;
            }

            // Ensure submods for nvgs all spawn together if it's night
            if (modSlotName === "mod_nvg")
            {
                if (this.raidInformation.nightTime) 
                {
                    forceSpawn = true;
                }
                else
                {
                    continue;
                }
            }

            let modPoolToChooseFrom = compatibleModsPool[modSlotName];
            if (
                settings.botEquipmentConfig.filterPlatesByLevel
                && this.itemHelper.isRemovablePlateSlot(modSlotName.toLowerCase())
            )
            {
                const outcome = this.filterPlateModsForSlotByLevel(
                    settings,
                    modSlotName.toLowerCase(),
                    compatibleModsPool[modSlotName],
                    parentTemplate
                );
                if ([Result.UNKNOWN_FAILURE, Result.NO_DEFAULT_FILTER].includes(outcome.result))
                {
                    this.logger.debug(
                        `Plate slot: ${modSlotName} selection for armor: ${parentTemplate._id} failed: ${
                            Result[outcome.result]
                        }, skipping`
                    );

                    continue;
                }

                if ([Result.LACKS_PLATE_WEIGHTS].includes(outcome.result))
                {
                    this.logger.warning(
                        `Plate slot: ${modSlotName} lacks weights for armor: ${parentTemplate._id}, unable to adjust plate choice, using existing data`
                    );
                }

                modPoolToChooseFrom = outcome.plateModTpls;
            }

            // Find random mod and check its compatible
            let modTpl: string | undefined;
            let found = false;
            const exhaustableModPool = new ExhaustableArray<string>(modPoolToChooseFrom, this.randomUtil, this.cloner);
            while (exhaustableModPool.hasValues())
            {
                modTpl = exhaustableModPool.getRandomValue();
                if (modTpl
                    && !this.botGeneratorHelper.isItemIncompatibleWithCurrentItems(equipment, modTpl, modSlotName)
                        .incompatible
                )
                {
                    found = true;
                    break;
                }
            }

            // Compatible item not found but slot REQUIRES item, get random item from db
            if (!found && itemSlotTemplate._required)
            {
                modTpl = this.getRandomModTplFromItemDb(modTpl, itemSlotTemplate, modSlotName, equipment);
                found = !!modTpl;
            }

            // Compatible item not found + not required
            if (!(found || itemSlotTemplate._required))
            {
                // Don't add item
                continue;
            }

            const modTemplate = this.itemHelper.getItem(modTpl);
            if (!this.isModValidForSlot(modTemplate, itemSlotTemplate, modSlotName, parentTemplate, botRole))
            {
                continue;
            }

            // Generate new id to ensure all items are unique on bot
            const modId = this.hashUtil.generate();
            equipment.push(this.createModItem(modId, modTpl, parentId, modSlotName, modTemplate[1], botRole));

            // Does the item being added have possible child mods?
            if (Object.keys(actualModPool).includes(modTpl))
            {
                // Call self recursively with item being checkced item we just added to bot
                this.generateModsForEquipment(
                    equipment,
                    modId,
                    modTemplate[1],
                    settings,
                    specificBlacklist,
                    forceSpawn
                );
            }
        }
        
        // This is for testing...
        if (this.modInformation.testMode && this.modInformation.testBotRole.includes(botRole.toLowerCase()))
        {
            const tables = this.databaseService.getTables();
            const assortEquipment = this.cloner.clone(equipment);
            for (const item in assortEquipment)
            {
                const oldID = assortEquipment[item]._id
                const newID = this.hashUtil.generate();
                assortEquipment[item]._id = newID;
                
                // Loop array again to fix parentID
                for (const i in assortEquipment)
                {
                    if (assortEquipment[i].parentId == oldID) 
                    {
                        assortEquipment[i].parentId = newID
                    }
                }
            }
            this.apbsTester.createComplexAssortItem(assortEquipment)
                .addUnlimitedStackCount()
                .addMoneyCost(Money.ROUBLES, 20000)
                .addBuyRestriction(3)
                .addLoyaltyLevel(1)
                .export(tables.traders[this.modInformation.testTrader]);
        }

        return equipment;
    }

    protected override filterPlateModsForSlotByLevel(settings: IGenerateEquipmentProperties, modSlot: string, existingPlateTplPool: string[], armorItem: ITemplateItem): IFilterPlateModsForSlotByLevelResult
    {
        const result: IFilterPlateModsForSlotByLevelResult = { result: Result.UNKNOWN_FAILURE, plateModTpls: undefined };

        // Not pmc or not a plate slot, return original mod pool array
        if (!this.itemHelper.isRemovablePlateSlot(modSlot))
        {
            result.result = Result.NOT_PLATE_HOLDING_SLOT;
            result.plateModTpls = existingPlateTplPool;

            return result;
        }

        // Get the front/back/side weights based on bots level
        const plateSlotWeights = settings.botEquipmentConfig?.armorPlateWeighting?.find(
            (armorWeight) =>
                settings.botData.level >= armorWeight.levelRange.min && settings.botData.level <= armorWeight.levelRange.max);
        if (!plateSlotWeights)
        {
            // No weights, return original array of plate tpls
            result.result = Result.LACKS_PLATE_WEIGHTS;
            result.plateModTpls = existingPlateTplPool;

            return result;
        }

        // Get the specific plate slot weights (front/back/side)
        const plateWeights: Record<string, number> = plateSlotWeights[modSlot];
        if (!plateWeights)
        {
            // No weights, return original array of plate tpls
            result.result = Result.LACKS_PLATE_WEIGHTS;
            result.plateModTpls = existingPlateTplPool;

            return result;
        }

        // Choose a plate level based on weighting
        let chosenArmorPlateLevel = this.weightedRandomHelper.getWeightedValue<string>(plateWeights);

        // Convert the array of ids into database items
        let platesFromDb = existingPlateTplPool.map((plateTpl) => this.itemHelper.getItem(plateTpl)[1]);

        // Filter plates to the chosen level based on its armorClass property
        let platesOfDesiredLevel = platesFromDb.filter((item) => item._props.armorClass === chosenArmorPlateLevel);
        let tries = 0;
        while (platesOfDesiredLevel.length === 0)
        {
            tries++;
            chosenArmorPlateLevel = (parseInt(chosenArmorPlateLevel)+1).toString()
            if (parseInt(chosenArmorPlateLevel) > 6) 
            {
                chosenArmorPlateLevel = "3"
            }            
            platesFromDb = existingPlateTplPool.map((plateTpl) => this.itemHelper.getItem(plateTpl)[1]);
            platesOfDesiredLevel = platesFromDb.filter((item) => item._props.armorClass === chosenArmorPlateLevel);

            if (platesOfDesiredLevel.length > 0) break;
            if (tries >= 3) break;
        }

        if (platesOfDesiredLevel.length === 0)
        {
            this.logger.debug(`${settings.botData.role} - Plate filter was too restrictive for armor: ${armorItem._id}. Tried ${tries} times. Using mod items default plate.`);

            const relatedItemDbModSlot = armorItem._props.Slots.find((slot) => slot._name.toLowerCase() === modSlot);
            const defaultPlate = relatedItemDbModSlot._props.filters[0].Plate;
            if (!defaultPlate)
            {
                // No relevant plate found after filtering AND no default plate

                // Last attempt, get default preset and see if it has a plate default
                const defaultPreset = this.presetHelper.getDefaultPreset(armorItem._id);
                if (defaultPreset)
                {
                    const relatedPresetSlot = defaultPreset._items.find(
                        (item) => item.slotId?.toLowerCase() === modSlot);
                    if (relatedPresetSlot)
                    {
                        result.result = Result.SUCCESS;
                        result.plateModTpls = [relatedPresetSlot._tpl];

                        return result;
                    }
                }
                // Return Default Preset cause didn't have default plates
                result.result = Result.NO_DEFAULT_FILTER;

                return result;
            }
            // Return Default Plates cause couldn't get lowest level available from original selection
            result.result = Result.SUCCESS;
            result.plateModTpls = [defaultPlate];

            return result;
        }

        // Only return the items ids
        result.result = Result.SUCCESS;
        result.plateModTpls = platesOfDesiredLevel.map((item) => item._id);

        return result;
    }

    protected override getCompatibleModFromPool(
        modPool: string[],
        modSpawnType: ModSpawn,
        weapon: IItem[]
    ): IChooseRandomCompatibleModResult 
    {
        // Create exhaustable pool to pick mod item from
        const exhaustableModPool = this.createExhaustableArray(modPool);

        // Create default response if no compatible item is found below
        const chosenModResult: IChooseRandomCompatibleModResult = {
            incompatible: true,
            found: false,
            reason: "unknown"
        };

        // Limit how many attempts to find a compatible mod can occur before giving up
        const maxBlockedAttempts = Math.round(modPool.length); // 75% of pool size
        let blockedAttemptCount = 0;
        let chosenTpl: string;
        while (exhaustableModPool.hasValues()) 
        {
            chosenTpl = exhaustableModPool.getRandomValue();
            const pickedItemDetails = this.itemHelper.getItem(chosenTpl);
            if (!pickedItemDetails[0]) 
            {
                // Not valid item, try again
                continue;
            }

            if (!pickedItemDetails[1]._props) 
            {
                // no props data, try again
                continue;
            }

            // Success - Default wanted + only 1 item in pool
            if (modSpawnType === ModSpawn.DEFAULT_MOD && modPool.length === 1) 
            {
                chosenModResult.found = true;
                chosenModResult.incompatible = false;
                chosenModResult.chosenTpl = chosenTpl;

                break;
            }

            // Check if existing weapon mods are incompatible with chosen item
            const existingItemBlockingChoice = weapon.find((item) =>
                pickedItemDetails[1]._props.ConflictingItems?.includes(item._tpl)
            );
            if (existingItemBlockingChoice) 
            {
                // Give max of x attempts of picking a mod if blocked by another
                if (blockedAttemptCount > maxBlockedAttempts) 
                {
                    blockedAttemptCount = 0; // reset
                    break;
                }

                blockedAttemptCount++;

                // Not compatible - Try again
                continue;
            }

            // Edge case- Some mod combos will never work, make sure this isnt the case
            if (this.weaponModComboIsIncompatible(weapon, chosenTpl)) 
            {
                chosenModResult.reason = `Chosen weapon mod: ${chosenTpl} can never be compatible with existing weapon mods`;
                break;
            }

            // Success
            chosenModResult.found = true;
            chosenModResult.incompatible = false;
            chosenModResult.chosenTpl = chosenTpl;

            break;
        }

        return chosenModResult;
    }
    
    public apbsGenerateModsForWeapon(sessionId: string, request: IGenerateWeaponRequest, isPmc: boolean): IItem[] 
    {
        const pmcProfile = this.profileHelper.getPmcProfile(sessionId);

        // Get pool of mods that fit weapon
        const compatibleModsPool = request.modPool[request.parentTemplate._id];

        if (
            !(
                request.parentTemplate._props.Slots.length ||
                request.parentTemplate._props.Cartridges?.length ||
                request.parentTemplate._props.Chambers?.length
            )
        ) 
        {
            this.logger.error(
                this.localisationService.getText("bot-unable_to_add_mods_to_weapon_missing_ammo_slot", {
                    weaponName: request.parentTemplate._name,
                    weaponId: request.parentTemplate._id,
                    botRole: request.botData.role
                })
            );

            return request.weapon;
        }

        const botEquipConfig = this.botConfig.equipment[request.botData.equipmentRole];
        const botEquipBlacklist = this.botEquipmentFilterService.getBotEquipmentBlacklist(
            request.botData.equipmentRole,
            pmcProfile.Info.Level
        );
        const botWeaponSightWhitelist = this.botEquipmentFilterService.getBotWeaponSightWhitelist(
            request.botData.equipmentRole
        );
        const randomisationSettings = this.botHelper.getBotRandomizationDetails(request.botData.level, botEquipConfig);

        // Iterate over mod pool and choose mods to attach
        const sortedModKeys = this.sortModKeys(Object.keys(compatibleModsPool), request.parentTemplate._id);
        for (const modSlot of sortedModKeys) 
        {
            // Check weapon has slot for mod to fit in
            const modsParentSlot = this.getModItemSlotFromDb(modSlot, request.parentTemplate);
            if (!modsParentSlot) 
            {
                this.logger.error(
                    this.localisationService.getText("bot-weapon_missing_mod_slot", {
                        modSlot: modSlot,
                        weaponId: request.parentTemplate._id,
                        weaponName: request.parentTemplate._name,
                        botRole: request.botData.role
                    })
                );

                continue;
            }

            // Check spawn chance of mod
            const modSpawnResult = this.shouldModBeSpawned(
                modsParentSlot,
                modSlot,
                request.modSpawnChances,
                botEquipConfig
            );
            if (modSpawnResult === ModSpawn.SKIP) 
            {
                continue;
            }

            const isRandomisableSlot = randomisationSettings?.randomisedWeaponModSlots?.includes(modSlot) ?? false;
            const modToSpawnRequest: IModToSpawnRequest = {
                modSlot: modSlot,
                isRandomisableSlot: isRandomisableSlot,
                randomisationSettings: randomisationSettings,
                botWeaponSightWhitelist: botWeaponSightWhitelist,
                botEquipBlacklist: botEquipBlacklist,
                itemModPool: compatibleModsPool,
                weapon: request.weapon,
                ammoTpl: request.ammoTpl,
                parentTemplate: request.parentTemplate,
                modSpawnResult: modSpawnResult,
                weaponStats: request.weaponStats,
                conflictingItemTpls: request.conflictingItemTpls,
                botData: request.botData
            };
            const modToAdd = this.chooseModToPutIntoSlot(modToSpawnRequest);

            // Compatible mod not found
            if (!modToAdd || typeof modToAdd === "undefined") 
            {
                continue;
            }

            if (
                !this.isModValidForSlot(modToAdd, modsParentSlot, modSlot, request.parentTemplate, request.botData.role)
            ) 
            {
                continue;
            }

            const modToAddTemplate = modToAdd[1];
            // Skip adding mod to weapon if type limit reached
            if (
                this.botWeaponModLimitService.weaponModHasReachedLimit(
                    request.botData.equipmentRole,
                    modToAddTemplate,
                    request.modLimits,
                    request.parentTemplate,
                    request.weapon
                )
            ) 
            {
                continue;
            }
            
            // If item is a mount for scopes, set scope chance to 100%, this helps fix empty mounts appearing on weapons
            if (this.modSlotCanHoldScope(modSlot, modToAddTemplate._parent)) 
            {
                // mod_mount was picked to be added to weapon, force scope chance to ensure its filled
                let scopeSlots = ["mod_scope", "mod_scope_000", "mod_scope_001", "mod_scope_002", "mod_scope_003"];
                if (isPmc) scopeSlots =  ["mod_scope", "mod_scope_000"]
                
                this.adjustSlotSpawnChances(request.modSpawnChances, scopeSlots, 100);

                // Hydrate pool of mods that fit into mount as its a randomisable slot
                if (isRandomisableSlot) 
                {
                    // Add scope mods to modPool dictionary to ensure the mount has a scope in the pool to pick
                    this.addCompatibleModsForProvidedMod(
                        "mod_scope",
                        modToAddTemplate,
                        request.modPool,
                        botEquipBlacklist
                    );
                }
            }

            /*
            if (!isPmc)
            {
                // If picked item is muzzle adapter that can hold a child, adjust spawn chance
                if (this.modSlotCanHoldMuzzleDevices(modSlot, modToAddTemplate._parent)) 
                {
                    const muzzleSlots = ["mod_muzzle", "mod_muzzle_000", "mod_muzzle_001"];
                    // Make chance of muzzle devices 95%
                    this.adjustSlotSpawnChances(request.modSpawnChances, muzzleSlots, 95);
                }
            }
            */
            
            // If front/rear sight are to be added, set opposite to 100% chance
            if (this.modIsFrontOrRearSight(modSlot, modToAddTemplate._id)) 
            {
                request.modSpawnChances.mod_sight_front = 100;
                request.modSpawnChances.mod_sight_rear = 100;
            }

            // Handguard mod can take a sub handguard mod + weapon has no UBGL (takes same slot)
            // Force spawn chance to be 100% to ensure it gets added
            if (
                modSlot === "mod_handguard" &&
                modToAddTemplate._props.Slots.some((slot) => slot._name === "mod_handguard") &&
                !request.weapon.some((item) => item.slotId === "mod_launcher")
            ) 
            {
                // Needed for handguards with lower
                request.modSpawnChances.mod_handguard = 100;
            }

            // If stock mod can take a sub stock mod, force spawn chance to be 100% to ensure sub-stock gets added
            // Or if mod_stock is configured to be forced on
            if (this.shouldForceSubStockSlots(modSlot, botEquipConfig, modToAddTemplate)) 
            {
                // Stock mod can take additional stocks, could be a locking device, force 100% chance
                const subStockSlots = ["mod_stock", "mod_stock_000", "mod_stock_001", "mod_stock_akms"];
                this.adjustSlotSpawnChances(request.modSpawnChances, subStockSlots, 100);
            }

            // Gather stats on mods being added to weapon
            if (this.itemHelper.isOfBaseclass(modToAddTemplate._id, BaseClasses.IRON_SIGHT)) 
            {
                if (modSlot === "mod_sight_front") 
                {
                    request.weaponStats.hasFrontIronSight = true;
                }
                else if (modSlot === "mod_sight_rear") 
                {
                    request.weaponStats.hasRearIronSight = true;
                }
            }
            else if (
                !request.weaponStats.hasOptic &&
                this.itemHelper.isOfBaseclass(modToAddTemplate._id, BaseClasses.SIGHTS)
            ) 
            {
                request.weaponStats.hasOptic = true;
            }

            const modId = this.hashUtil.generate();
            request.weapon.push(
                this.createModItem(
                    modId,
                    modToAddTemplate._id,
                    request.weaponId,
                    modSlot,
                    modToAddTemplate,
                    request.botData.role
                )
            );

            // Update conflicting item list now item has been chosen
            for (const conflictingItem of modToAddTemplate._props.ConflictingItems) 
            {
                request.conflictingItemTpls.add(conflictingItem);
            }

            // I first thought we could use the recursive generateModsForItems as previously for cylinder magazines.
            // However, the recursion doesn't go over the slots of the parent mod but over the modPool which is given by the bot config
            // where we decided to keep cartridges instead of camoras. And since a CylinderMagazine only has one cartridge entry and
            // this entry is not to be filled, we need a special handling for the CylinderMagazine
            const modParentItem = this.itemHelper.getItem(modToAddTemplate._parent)[1];
            if (this.botWeaponGeneratorHelper.magazineIsCylinderRelated(modParentItem._name)) 
            {
                // We don't have child mods, we need to create the camoras for the magazines instead
                this.fillCamora(request.weapon, request.modPool, modId, modToAddTemplate);
            }
            else 
            {
                let containsModInPool = Object.keys(request.modPool).includes(modToAddTemplate._id);

                // Sometimes randomised slots are missing sub-mods, if so, get values from mod pool service
                // Check for a randomisable slot + without data in modPool + item being added as additional slots
                if (isRandomisableSlot && !containsModInPool && modToAddTemplate._props.Slots.length > 0) 
                {
                    const modFromService = this.botEquipmentModPoolService.getModsForWeaponSlot(modToAddTemplate._id);
                    if (Object.keys(modFromService ?? {}).length > 0) 
                    {
                        request.modPool[modToAddTemplate._id] = modFromService;
                        containsModInPool = true;
                    }
                }
                if (containsModInPool) 
                {
                    const recursiveRequestData: IGenerateWeaponRequest = {
                        weapon: request.weapon,
                        modPool: request.modPool,
                        weaponId: modId,
                        parentTemplate: modToAddTemplate,
                        modSpawnChances: request.modSpawnChances,
                        ammoTpl: request.ammoTpl,
                        botData: {
                            role: request.botData.role,
                            level: request.botData.level,
                            equipmentRole: request.botData.equipmentRole
                        },
                        modLimits: request.modLimits,
                        weaponStats: request.weaponStats,
                        conflictingItemTpls: request.conflictingItemTpls
                    };
                    // Call self recursively to add mods to this mod
                    this.apbsGenerateModsForWeapon(sessionId, recursiveRequestData, isPmc);
                }
            }
        }

        return request.weapon;
    }
}