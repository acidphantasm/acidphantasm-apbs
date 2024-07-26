import { inject, injectable } from "tsyringe";

import { BotEquipmentModGenerator } from "@spt/generators/BotEquipmentModGenerator";
import { BotLootGenerator } from "@spt/generators/BotLootGenerator";
import { BotWeaponGenerator } from "@spt/generators/BotWeaponGenerator";
import { BotGeneratorHelper } from "@spt/helpers/BotGeneratorHelper";
import { BotHelper } from "@spt/helpers/BotHelper";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { Inventory as PmcInventory } from "@spt/models/eft/common/tables/IBotBase";
import { Chances, Equipment, Generation, IBotType, Inventory } from "@spt/models/eft/common/tables/IBotType";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { EquipmentSlots } from "@spt/models/enums/EquipmentSlots";
import { GameEditions } from "@spt/models/enums/GameEditions";
import { ItemTpl } from "@spt/models/enums/ItemTpl";
import { IGenerateEquipmentProperties } from "@spt/models/spt/bots/IGenerateEquipmentProperties";
import {
    EquipmentFilterDetails,
    IBotConfig
} from "@spt/models/spt/config/IBotConfig";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { BotEquipmentModPoolService } from "@spt/services/BotEquipmentModPoolService";
import { DatabaseService } from "@spt/services/DatabaseService";
import { LocalisationService } from "@spt/services/LocalisationService";
import { HashUtil } from "@spt/utils/HashUtil";
import { RandomUtil } from "@spt/utils/RandomUtil";


import { BotInventoryGenerator } from "@spt/generators/BotInventoryGenerator";
import customModPool = require("../db/mods.json");
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { APBSTierGetter } from "../Utils/APBSTierGetter";

/** Handle profile related client events */
@injectable()
export class APBSBotInventoryGenerator extends BotInventoryGenerator
{
    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("BotWeaponGenerator") protected botWeaponGenerator: BotWeaponGenerator,
        @inject("BotLootGenerator") protected botLootGenerator: BotLootGenerator,
        @inject("BotGeneratorHelper") protected botGeneratorHelper: BotGeneratorHelper,
        @inject("BotHelper") protected botHelper: BotHelper,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("BotEquipmentModPoolService") protected botEquipmentModPoolService: BotEquipmentModPoolService,
        @inject("BotEquipmentModGenerator") protected botEquipmentModGenerator: BotEquipmentModGenerator,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("APBSTierGetter") protected apbsTierGetter: APBSTierGetter
    )
    {
        super(logger, 
            hashUtil, 
            randomUtil, 
            databaseService, 
            botWeaponGenerator, 
            botLootGenerator, 
            botGeneratorHelper, 
            botHelper, 
            weightedRandomHelper, 
            itemHelper,
            localisationService, 
            botEquipmentModPoolService, 
            botEquipmentModGenerator, 
            configServer)
    }

    public override generateInventory(
        sessionId: string,
        botJsonTemplate: IBotType,
        botRole: string,
        isPmc: boolean,
        botLevel: number,
        chosenGameVersion: string
    ): PmcInventory
    {
        const tierInfo = this.apbsTierGetter.getTierByLevel(botLevel);
        const wornItemChances = this.apbsEquipmentGetter.getSpawnChancesByBotRole(botRole, tierInfo);

        const templateInventory = botJsonTemplate.inventory;
        const itemGenerationLimitsMinMax = botJsonTemplate.generation;

        // Generate base inventory with no items
        const botInventory = this.generateInventoryBase();

        this.generateAndAddEquipmentToBot(
            templateInventory,
            wornItemChances,
            botRole,
            botInventory,
            botLevel,
            chosenGameVersion);

        // Roll weapon spawns (primary/secondary/holster) and generate a weapon for each roll that passed
        this.generateAndAddWeaponsToBot(
            templateInventory,
            wornItemChances,
            sessionId,
            botInventory,
            botRole,
            isPmc,
            itemGenerationLimitsMinMax,
            botLevel
        );

        // Pick loot and add to bots containers (rig/backpack/pockets/secure)
        this.botLootGenerator.generateLoot(sessionId, botJsonTemplate, isPmc, botRole, botInventory, botLevel);

        return botInventory;
    }

    protected override generateEquipment = (settings: IGenerateEquipmentProperties): boolean => 
    {
        const equipmentSlot = settings.rootEquipmentSlot as string;
        const botRole = settings.botRole;
        const botLevel = settings.botLevel;
        const tierInfo = this.apbsTierGetter.getTierByLevel(botLevel);
        let equipmentPool = this.apbsEquipmentGetter.getEquipmentByBotRole(botRole, tierInfo, equipmentSlot);
        settings.randomisationDetails = this.apbsEquipmentGetter.getSpawnChancesByBotRole(botRole, tierInfo);

        if (equipmentSlot == EquipmentSlots.TACTICAL_VEST && !settings.inventory.items.find(e => e.slotId === "ArmorVest"))
        {
            equipmentPool = this.apbsEquipmentGetter.getEquipmentByBotRole(botRole, tierInfo, "ArmouredRig");
        }

        const spawnChance = ([EquipmentSlots.POCKETS, EquipmentSlots.SECURED_CONTAINER] as string[]).includes(
            settings.rootEquipmentSlot
        )
            ? 100
            : settings.spawnChances.equipment[settings.rootEquipmentSlot];

        if (typeof spawnChance === "undefined")
        {
            this.logger.warning(
                this.localisationService.getText(
                    "bot-no_spawn_chance_defined_for_equipment_slot",
                    settings.rootEquipmentSlot
                )
            );

            return false;
        }

        const shouldSpawn = this.randomUtil.getChance100(spawnChance);
        if (shouldSpawn && Object.keys(equipmentPool).length)
        {
            let pickedItemDb: ITemplateItem;
            let found = false;

            const maxAttempts = Math.round(Object.keys(equipmentPool).length * 0.75); // Roughly 75% of pool size
            let attempts = 0;
            while (!found)
            {
                if (Object.values(equipmentPool).length === 0)
                {
                    return false;
                }

                const chosenItemTpl = this.weightedRandomHelper.getWeightedValue<string>(equipmentPool);
                const dbResult = this.itemHelper.getItem(chosenItemTpl);

                if (!dbResult[0])
                {
                    this.logger.error(this.localisationService.getText("bot-missing_item_template", chosenItemTpl));
                    this.logger.info(`EquipmentSlot -> ${settings.rootEquipmentSlot}`);

                    // remove picked item
                    delete equipmentPool[chosenItemTpl];

                    attempts++;

                    continue;
                }

                const compatabilityResult = this.botGeneratorHelper.isItemIncompatibleWithCurrentItems(
                    settings.inventory.items,
                    chosenItemTpl,
                    settings.rootEquipmentSlot
                );
                if (compatabilityResult.incompatible)
                {
                    // Tried x different items that failed, stop
                    if (attempts > maxAttempts)
                    {
                        return false;
                    }

                    // Remove picked item
                    delete equipmentPool[chosenItemTpl];

                    attempts++;
                }
                else
                {
                    // Success
                    found = true;
                    pickedItemDb = dbResult[1];
                }
            }

            // Create root item
            const id = this.hashUtil.generate();
            const item = {
                _id: id,
                _tpl: pickedItemDb._id,
                parentId: settings.inventory.equipment,
                slotId: settings.rootEquipmentSlot,
                ...this.botGeneratorHelper.generateExtraPropertiesForItem(pickedItemDb, settings.botRole)
            };

            // Use dynamic mod pool if enabled in config for this bot
            const botEquipmentRole = this.botGeneratorHelper.getBotEquipmentRole(settings.botRole);
            if (
                this.botConfig.equipment[botEquipmentRole]
                && settings.randomisationDetails?.randomisedArmorSlots?.includes(settings.rootEquipmentSlot)
            )
            {
                customModPool.mods[pickedItemDb._id] = this.getFilteredDynamicModsForItem(
                    pickedItemDb._id,
                    this.botConfig.equipment[botEquipmentRole].blacklist
                );
            }

            // Item has slots, fill them
            if (pickedItemDb._props.Slots?.length > 0 && !settings.generateModsBlacklist?.includes(pickedItemDb._id))
            {
                const items = this.botEquipmentModGenerator.generateModsForEquipment(
                    [item],
                    id,
                    pickedItemDb,
                    settings
                );
                settings.inventory.items.push(...items);
            }
            else
            {
                // No slots, push root item only
                settings.inventory.items.push(item);
            }

            return true;
        }

        return false;
    }
}