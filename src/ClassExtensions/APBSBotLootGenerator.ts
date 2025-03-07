import { inject, injectable } from "tsyringe";

import { BotWeaponGenerator } from "@spt/generators/BotWeaponGenerator";
import { BotGeneratorHelper } from "@spt/helpers/BotGeneratorHelper";
import { BotHelper } from "@spt/helpers/BotHelper";
import { HandbookHelper } from "@spt/helpers/HandbookHelper";
import { InventoryHelper } from "@spt/helpers/InventoryHelper";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { IInventory as PmcInventory } from "@spt/models/eft/common/tables/IBotBase";
import { IGenerationWeightingItems, IBotType } from "@spt/models/eft/common/tables/IBotType";
import { EquipmentSlots } from "@spt/models/enums/EquipmentSlots";
import { LootCacheType } from "@spt/models/spt/bots/IBotLootCache";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { BotLootCacheService } from "@spt/services/BotLootCacheService";
import { DatabaseService } from "@spt/services/DatabaseService";
import { LocalisationService } from "@spt/services/LocalisationService";
import { ICloner } from "@spt/utils/cloners/ICloner";
import { HashUtil } from "@spt/utils/HashUtil";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { BotLootGenerator } from "@spt/generators/BotLootGenerator";

import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { APBSTierGetter } from "../Utils/APBSTierGetter";
import { APBSBotLootCacheService } from "./APBSBotLootCacheService";
import { RaidInformation } from "../Globals/RaidInformation";
import { APBSLogger } from "../Utils/APBSLogger";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { IItemSpawnLimitSettings } from "@spt/models/spt/bots/IItemSpawnLimitSettings";

/** Handle profile related client events */
@injectable()
export class APBSBotLootGenerator extends BotLootGenerator
{
    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("InventoryHelper") protected inventoryHelper: InventoryHelper,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("HandbookHelper") protected handbookHelper: HandbookHelper,
        @inject("BotGeneratorHelper") protected botGeneratorHelper: BotGeneratorHelper,
        @inject("BotWeaponGenerator") protected botWeaponGenerator: BotWeaponGenerator,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper,
        @inject("BotHelper") protected botHelper: BotHelper,
        @inject("BotLootCacheService") protected botLootCacheService: BotLootCacheService,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("PrimaryCloner") protected cloner: ICloner,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("APBSTierGetter") protected apbsTierGetter: APBSTierGetter,
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("APBSBotLootCacheService") protected apbsBotLootCacheService: APBSBotLootCacheService,
        @inject("APBSLogger") protected apbsLogger: APBSLogger
    )
    {
        super(logger, 
            hashUtil, 
            randomUtil, 
            itemHelper, 
            inventoryHelper, 
            databaseService, 
            handbookHelper, 
            botGeneratorHelper, 
            botWeaponGenerator, 
            weightedRandomHelper,
            botHelper, 
            botLootCacheService, 
            localisationService, 
            configServer,
            cloner)
    }

    public apbsGenerateLoot(
        sessionId: string,
        botJsonTemplate: IBotType,
        isPmc: boolean,
        botRole: string,
        botInventory: PmcInventory,
        botLevel: number,
        tier: number
    ): void
    {
        // Limits on item types to be added as loot
        const chances = this.apbsEquipmentGetter.getSpawnChancesByBotRole(botRole, tier);
        const itemCounts: IGenerationWeightingItems = chances.generation.items;

        if (
            !itemCounts.backpackLoot.weights
            || !itemCounts.pocketLoot.weights
            || !itemCounts.vestLoot.weights
            || !itemCounts.specialItems.weights
            || !itemCounts.healing.weights
            || !itemCounts.drugs.weights
            || !itemCounts.food.weights
            || !itemCounts.drink.weights
            || !itemCounts.currency.weights
            || !itemCounts.stims.weights
            || !itemCounts.grenades.weights
        )
        {
            this.logger.warning(this.localisationService.getText("bot-unable_to_generate_bot_loot", botRole));

            return;
        }

        let backpackLootCount = Number(
            this.weightedRandomHelper.getWeightedValue<number>(itemCounts.backpackLoot.weights)
        );
        let pocketLootCount = Number(this.weightedRandomHelper.getWeightedValue<number>(itemCounts.pocketLoot.weights));
        let vestLootCount = this.weightedRandomHelper.getWeightedValue<number>(itemCounts.vestLoot.weights);
        const specialLootItemCount = Number(this.weightedRandomHelper.getWeightedValue<number>(itemCounts.specialItems.weights));
        const healingItemCount = Number(this.weightedRandomHelper.getWeightedValue<number>(itemCounts.healing.weights));
        const drugItemCount = Number(this.weightedRandomHelper.getWeightedValue<number>(itemCounts.drugs.weights));

        const foodItemCount = Number(this.weightedRandomHelper.getWeightedValue<number>(itemCounts.food.weights));
        const drinkItemCount = Number(this.weightedRandomHelper.getWeightedValue<number>(itemCounts.drink.weights));

        let currencyItemCount = Number(this.weightedRandomHelper.getWeightedValue<number>(itemCounts.currency.weights));

        const stimItemCount = Number(this.weightedRandomHelper.getWeightedValue<number>(itemCounts.stims.weights));
        const grenadeCount = Number(this.weightedRandomHelper.getWeightedValue<number>(itemCounts.grenades.weights));

        // If bot has been flagged as not having loot, set below counts to 0
        if (this.botConfig.disableLootOnBotTypes?.includes(botRole.toLowerCase()))
        {
            backpackLootCount = 0;
            pocketLootCount = 0;
            vestLootCount = 0;
            currencyItemCount = 0;
        }

        // Forced pmc healing loot into secure container
        if (isPmc && this.pmcConfig.forceHealingItemsIntoSecure)
        {
            this.addForcedMedicalItemsToPmcSecure(botInventory, botRole);
        }

        const botItemLimits = this.getItemSpawnLimitsForBot(botRole);

        const containersBotHasAvailable = this.getAvailableContainersBotCanStoreItemsIn(botInventory);

        // This set is passed as a reference to fill up the containers that are already full, this aliviates
        // generation of the bots by avoiding checking the slots of containers we already know are full
        const containersIdFull = new Set<string>();

        // Special items
        this.addLootFromPool(
            this.apbsBotLootCacheService.apbsGetLootFromCache(botRole, isPmc, LootCacheType.SPECIAL, botJsonTemplate, botLevel, tier),
            containersBotHasAvailable,
            specialLootItemCount,
            botInventory,
            botRole,
            botItemLimits,
            undefined,
            undefined,
            containersIdFull
        );

        // Healing items / Meds
        this.addLootFromPool(
            this.apbsBotLootCacheService.apbsGetLootFromCache(botRole, isPmc, LootCacheType.HEALING_ITEMS, botJsonTemplate, botLevel, tier),
            containersBotHasAvailable,
            healingItemCount,
            botInventory,
            botRole,
            botItemLimits,
            0,
            isPmc,
            containersIdFull
        );

        // Drugs
        this.addLootFromPool(
            this.apbsBotLootCacheService.apbsGetLootFromCache(botRole, isPmc, LootCacheType.DRUG_ITEMS, botJsonTemplate, botLevel, tier),
            containersBotHasAvailable,
            drugItemCount,
            botInventory,
            botRole,
            botItemLimits,
            0,
            isPmc,
            containersIdFull
        );

        // Food
        this.addLootFromPool(
            this.apbsBotLootCacheService.apbsGetLootFromCache(botRole, isPmc, LootCacheType.FOOD_ITEMS, botJsonTemplate, botLevel, tier),
            containersBotHasAvailable,
            foodItemCount,
            botInventory,
            botRole,
            botItemLimits,
            0,
            isPmc,
            containersIdFull
        );

        // Drink
        this.addLootFromPool(
            this.apbsBotLootCacheService.apbsGetLootFromCache(botRole, isPmc, LootCacheType.DRINK_ITEMS, botJsonTemplate, botLevel, tier),
            containersBotHasAvailable,
            drinkItemCount,
            botInventory,
            botRole,
            botItemLimits,
            0,
            isPmc,
            containersIdFull
        );

        // Currency
        this.addLootFromPool(
            this.apbsBotLootCacheService.apbsGetLootFromCache(botRole, isPmc, LootCacheType.CURRENCY_ITEMS, botJsonTemplate, botLevel, tier),
            containersBotHasAvailable,
            currencyItemCount,
            botInventory,
            botRole,
            botItemLimits,
            0,
            isPmc,
            containersIdFull
        );

        // Stims
        this.addLootFromPool(
            this.apbsBotLootCacheService.apbsGetLootFromCache(botRole, isPmc, LootCacheType.STIM_ITEMS, botJsonTemplate, botLevel, tier),
            containersBotHasAvailable,
            stimItemCount,
            botInventory,
            botRole,
            botItemLimits,
            0,
            isPmc,
            containersIdFull
        );

        // Grenades
        this.addLootFromPool(
            this.apbsBotLootCacheService.apbsGetLootFromCache(botRole, isPmc, LootCacheType.GRENADE_ITEMS, botJsonTemplate, botLevel, tier),
            [EquipmentSlots.POCKETS, EquipmentSlots.TACTICAL_VEST], // Can't use containersBotHasEquipped as we dont want grenades added to backpack
            grenadeCount,
            botInventory,
            botRole,
            botItemLimits,
            0,
            isPmc,
            containersIdFull
        );

        // Backpack - generate loot if they have one
        if (containersBotHasAvailable.includes(EquipmentSlots.BACKPACK))
        {
            // Add randomly generated weapon to PMC backpacks
            if (isPmc && this.randomUtil.getChance100(this.pmcConfig.looseWeaponInBackpackChancePercent))
            {
                this.addLooseWeaponsToInventorySlot(
                    sessionId,
                    botInventory,
                    EquipmentSlots.BACKPACK,
                    botJsonTemplate.inventory,
                    botJsonTemplate.chances.weaponMods,
                    botRole,
                    isPmc,
                    botLevel,
                    containersIdFull
                );
            }

            const backpackLootRoubleTotal = this.getBackpackRoubleTotalByLevel(botLevel, isPmc);
            this.addLootFromPool(
                this.apbsBotLootCacheService.apbsGetLootFromCache(botRole, isPmc, LootCacheType.BACKPACK, botJsonTemplate, botLevel, tier),
                [EquipmentSlots.BACKPACK],
                backpackLootCount,
                botInventory,
                botRole,
                botItemLimits,
                backpackLootRoubleTotal,
                isPmc,
                containersIdFull
            );
        }

        // TacticalVest - generate loot if they have one
        if (containersBotHasAvailable.includes(EquipmentSlots.TACTICAL_VEST))
        {
            // Vest
            this.addLootFromPool(
                this.apbsBotLootCacheService.apbsGetLootFromCache(botRole, isPmc, LootCacheType.VEST, botJsonTemplate, botLevel, tier),
                [EquipmentSlots.TACTICAL_VEST],
                vestLootCount,
                botInventory,
                botRole,
                botItemLimits,
                this.pmcConfig.maxVestLootTotalRub,
                isPmc,
                containersIdFull
            );
        }

        // Pockets
        this.addLootFromPool(
            this.apbsBotLootCacheService.apbsGetLootFromCache(botRole, isPmc, LootCacheType.POCKET, botJsonTemplate, botLevel, tier),
            [EquipmentSlots.POCKETS],
            pocketLootCount,
            botInventory,
            botRole,
            botItemLimits,
            this.pmcConfig.maxPocketLootTotalRub,
            isPmc,
            containersIdFull
        );

        // Secure

        // only add if not a pmc or is pmc and flag is true
        if (!isPmc || (isPmc && this.pmcConfig.addSecureContainerLootFromBotConfig))
        {
            this.addLootFromPool(
                this.apbsBotLootCacheService.apbsGetLootFromCache(botRole, isPmc, LootCacheType.SECURE, botJsonTemplate, botLevel, tier),
                [EquipmentSlots.SECURED_CONTAINER],
                50,
                botInventory,
                botRole,
                undefined,
                -1,
                isPmc,
                containersIdFull
            );
        }
    } 
    
    protected override itemHasReachedSpawnLimit(
        itemTemplate: ITemplateItem,
        botRole: string,
        itemSpawnLimits: IItemSpawnLimitSettings
    ): boolean 
    {
        // PMCs and scavs have different sections of bot config for spawn limits
        if (!!itemSpawnLimits && Object.keys(itemSpawnLimits.globalLimits).length === 0) 
        {
            // No items found in spawn limit, drop out
            return false;
        }

        // No spawn limits, skipping
        if (!itemSpawnLimits) 
        {
            return false;
        }

        const idToCheckFor = this.getMatchingIdFromSpawnLimits(itemTemplate, itemSpawnLimits.globalLimits);
        if (!idToCheckFor) 
        {
            // ParentId or tplid not found in spawnLimits, not a spawn limited item, skip
            return false;
        }

        // Increment item count with this bot type
        itemSpawnLimits.currentLimits[idToCheckFor]++;

        // Check if over limit
        if (itemSpawnLimits.currentLimits[idToCheckFor] > itemSpawnLimits.globalLimits[idToCheckFor]) 
        {
            // Prevent edge-case of small loot pools + code trying to add limited item over and over infinitely
            if (itemSpawnLimits.currentLimits[idToCheckFor] > itemSpawnLimits.globalLimits[idToCheckFor] * 10) 
            {
                this.logger.debug(
                    this.localisationService.getText("bot-item_spawn_limit_reached_skipping_item", {
                        botRole: botRole,
                        itemName: itemTemplate._name,
                        attempts: itemSpawnLimits.currentLimits[idToCheckFor]
                    })
                );

                return false;
            }

            return true;
        }

        return false;
    }
}