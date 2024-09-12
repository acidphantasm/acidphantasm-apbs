import { inject, injectable } from "tsyringe";

import { BotGeneratorHelper } from "@spt/helpers/BotGeneratorHelper";
import { BotHelper } from "@spt/helpers/BotHelper";
import { BotWeaponGeneratorHelper } from "@spt/helpers/BotWeaponGeneratorHelper";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { PresetHelper } from "@spt/helpers/PresetHelper";
import { ProbabilityHelper } from "@spt/helpers/ProbabilityHelper";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { Item } from "@spt/models/eft/common/tables/IItem";
import { ITemplateItem, Slot } from "@spt/models/eft/common/tables/ITemplateItem";
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
import { IModToSpawnRequest } from "@spt/models/spt/bots/IModToSpawnRequest";
import { IChooseRandomCompatibleModResult } from "@spt/models/spt/bots/IChooseRandomCompatibleModResult";

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
        @inject("RaidInformation") protected raidInformation: RaidInformation
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

    public override generateModsForEquipment(equipment: Item[], parentId: string, parentTemplate: ITemplateItem, settings: IGenerateEquipmentProperties, shouldForceSpawn: boolean): Item[]
    {
        let forceSpawn = shouldForceSpawn;

        const botRole = settings.botRole;
        const tier = this.apbsTierGetter.getTierByLevel(settings.botLevel);
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

        if (!compatibleModsPool)
        {
            this.logger.warning(
                `bot: ${settings.botRole} lacks a mod slot pool for item: ${parentTemplate._id} ${parentTemplate._name}`);
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
                        botRole: settings.botRole
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
                this.generateModsForEquipment(equipment, modId, modTemplate[1], settings, forceSpawn);
            }
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
                settings.botLevel >= armorWeight.levelRange.min && settings.botLevel <= armorWeight.levelRange.max);
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
            this.logger.debug(`${settings.botRole} - Plate filter was too restrictive for armor: ${armorItem._id}. Tried ${tries} times. Using mod items default plate.`);

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
    
    protected override pickWeaponModTplForSlotFromPool(
        modPool: string[],
        parentSlot: Slot,
        choiceTypeEnum: ModSpawn,
        weapon: Item[],
        modSlotName: string
    ): IChooseRandomCompatibleModResult 
    {
        let chosenTpl: string;
        const exhaustableModPool = new ExhaustableArray(modPool, this.randomUtil, this.cloner);
        let chosenModResult: IChooseRandomCompatibleModResult = { incompatible: true, found: false, reason: "unknown" };
        const modParentFilterList = parentSlot._props.filters[0].Filter;

        // How many times can a mod for the slot be blocked before we stop trying
        const maxBlockedAttempts = Math.round(modPool.length); 
        let blockedAttemptCount = 0;
        while (exhaustableModPool.hasValues())
        {
            chosenTpl = exhaustableModPool.getRandomValue()!;
            if (choiceTypeEnum === ModSpawn.DEFAULT_MOD && modPool.length === 1) 
            {
                // Default mod wanted and only one choice in pool
                chosenModResult.found = true;
                chosenModResult.incompatible = false;
                chosenModResult.chosenTpl = chosenTpl;

                break;
            }

            // Check chosen item is on the allowed list of the parent
            const isOnModParentFilterList = modParentFilterList.includes(chosenTpl);
            if (!isOnModParentFilterList) 
            {
                // Try again
                continue;
            }

            chosenModResult = this.botGeneratorHelper.isWeaponModIncompatibleWithCurrentMods(
                weapon,
                chosenTpl,
                modSlotName
            );

            if (chosenModResult.slotBlocked) 
            {
                // Give max of x attempts of picking a mod if blocked by another
                if (blockedAttemptCount > maxBlockedAttempts) 
                {
                    blockedAttemptCount = 0;
                    break;
                }

                blockedAttemptCount++;

                // Try again
                continue;
            }

            // Some mod combos will never work, make sure this isnt the case
            if (!(chosenModResult.incompatible || this.weaponModComboIsIncompatible(weapon, chosenTpl))) 
            {
                // Success
                chosenModResult.found = true;
                chosenModResult.incompatible = false;
                chosenModResult.chosenTpl = chosenTpl;

                break;
            }
        }

        return chosenModResult;
    }
}