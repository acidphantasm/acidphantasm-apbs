import { inject, injectable } from "tsyringe";

import { ItemHelper } from "@spt/helpers/ItemHelper";
import { IBotType, IGenerationWeightingItems } from "@spt/models/eft/common/tables/IBotType";

import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { APBSTierGetter } from "../Utils/APBSTierGetter";
import { RagfairPriceService } from "@spt/services/RagfairPriceService";
import { PMCLootGenerator } from "@spt/generators/PMCLootGenerator";
import { BotLootCacheService } from "@spt/services/BotLootCacheService";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { LocalisationService } from "@spt/services/LocalisationService";
import { ICloner } from "@spt/utils/cloners/ICloner";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { IBotLootCache, LootCacheType } from "@spt/models/spt/bots/IBotLootCache";
import { RaidInformation } from "../Globals/RaidInformation";
import { APBSLogger } from "../Utils/APBSLogger";

@injectable()
export class APBSBotLootCacheService extends BotLootCacheService
{
    protected apbsLootCache: Record<string, IBotLootCache>;
    
    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("PMCLootGenerator") protected pmcLootGenerator: PMCLootGenerator,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("RagfairPriceService") protected ragfairPriceService: RagfairPriceService,
        @inject("PrimaryCloner") protected cloner: ICloner,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("APBSTierGetter") protected apbsTierGetter: APBSTierGetter,
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("APBSLogger") protected apbsLogger: APBSLogger
    )
    {
        super(logger, 
            itemHelper,
            pmcLootGenerator, 
            localisationService, 
            ragfairPriceService, 
            cloner)            
        this.apbsClearCache();
        this.clearCache();
    }
    
    public apbsClearCache(): void 
    {
        this.apbsLootCache = {};
    }

    public apbsBotRoleExistsInCache(combinedBotRoleTier: string): boolean 
    {
        return !!this.apbsLootCache[combinedBotRoleTier];
    }

    public apbsInitCacheForBotRole(combinedBotRoleTier: string): void 
    {
        this.apbsLootCache[combinedBotRoleTier] = {
            backpackLoot: {},
            pocketLoot: {},
            vestLoot: {},
            secureLoot: {},
            combinedPoolLoot: {},

            specialItems: {},
            grenadeItems: {},
            drugItems: {},
            foodItems: {},
            drinkItems: {},
            currencyItems: {},
            healingItems: {},
            stimItems: {}
        };
    }

    public apbsGetLootFromCache(
        botRole: string,
        isPmc: boolean,
        lootType: LootCacheType,
        botJsonTemplate: IBotType,
        botLevel: number,
        tier: number
    ): Record<string, number> 
    {
        const tierInfo = tier.toString()
        const combinedBotRoleTier = botRole + tierInfo;
        if (!this.apbsBotRoleExistsInCache(combinedBotRoleTier))
        {
            this.apbsInitCacheForBotRole(combinedBotRoleTier);

            this.apbsAddLootToCache(botRole, isPmc, botJsonTemplate, botLevel, tier);
        }

        let result = undefined;
        switch (lootType) 
        {
            case LootCacheType.SPECIAL:
                result = this.apbsLootCache[combinedBotRoleTier].specialItems;
                break;
            case LootCacheType.BACKPACK:
                result = this.apbsLootCache[combinedBotRoleTier].backpackLoot;
                break;
            case LootCacheType.POCKET:
                result = this.apbsLootCache[combinedBotRoleTier].pocketLoot;
                break;
            case LootCacheType.VEST:
                result = this.apbsLootCache[combinedBotRoleTier].vestLoot;
                break;
            case LootCacheType.SECURE:
                result = this.apbsLootCache[combinedBotRoleTier].secureLoot;
                break;
            case LootCacheType.COMBINED:
                result = this.apbsLootCache[combinedBotRoleTier].combinedPoolLoot;
                break;
            case LootCacheType.HEALING_ITEMS:
                result = this.apbsLootCache[combinedBotRoleTier].healingItems;
                break;
            case LootCacheType.GRENADE_ITEMS:
                result = this.apbsLootCache[combinedBotRoleTier].grenadeItems;
                break;
            case LootCacheType.DRUG_ITEMS:
                result = this.apbsLootCache[combinedBotRoleTier].drugItems;
                break;
            case LootCacheType.FOOD_ITEMS:
                result = this.apbsLootCache[combinedBotRoleTier].foodItems;
                break;
            case LootCacheType.DRINK_ITEMS:
                result = this.apbsLootCache[combinedBotRoleTier].drinkItems;
                break;
            case LootCacheType.CURRENCY_ITEMS:
                result = this.apbsLootCache[combinedBotRoleTier].currencyItems;
                break;
            case LootCacheType.STIM_ITEMS:
                result = this.apbsLootCache[combinedBotRoleTier].stimItems;
                break;
            default:
                this.logger.error(
                    this.localisationService.getText("bot-loot_type_not_found", {
                        lootType: lootType,
                        botRole: botRole,
                        isPmc: isPmc
                    })
                );
                break;
        }
        
        return this.cloner.clone(result);
    }
    
    public apbsAddLootToCache(botRole: string, isPmc: boolean, botJsonTemplate: IBotType, botLevel: number, tier: number): void
    {
        const tierInfo = tier.toString();
        const combinedBotRoleTier = botRole + tierInfo;
        const chances = this.apbsEquipmentGetter.getSpawnChancesByBotRole(botRole, tier);
        let realWhitelist: IGenerationWeightingItems = chances.generation.items;
        
        if (!this.raidInformation.isBotEnabled(botRole))
        {
            realWhitelist = botJsonTemplate.generation.items;
        }
        
        // the full pool of loot we use to create the various sub-categories with
        const lootPool = botJsonTemplate.inventory.items;

        // Flatten all individual slot loot pools into one big pool, while filtering out potentially missing templates
        const specialLootPool: Record<string, number> = {};
        const backpackLootPool: Record<string, number> = {};
        const pocketLootPool: Record<string, number> = {};
        const vestLootPool: Record<string, number> = {};
        const secureLootTPool: Record<string, number> = {};
        const combinedLootPool: Record<string, number> = {};

        if (isPmc) 
        {
            // Replace lootPool from bot json with our own generated list for PMCs
            lootPool.Backpack = this.cloner.clone(this.pmcLootGenerator.generatePMCBackpackLootPool(botRole));
            lootPool.Pockets = this.cloner.clone(this.pmcLootGenerator.generatePMCPocketLootPool(botRole));
            lootPool.TacticalVest = this.cloner.clone(this.pmcLootGenerator.generatePMCVestLootPool(botRole));
        }

        // Backpack/Pockets etc
        for (const [slot, pool] of Object.entries(lootPool)) 
        {
            // No items to add, skip
            if (Object.keys(pool).length === 0)
            {
                continue;
            }

            // Sort loot pool into separate buckets
            switch (slot.toLowerCase()) 
            {
                case "specialloot":
                    this.addItemsToPool(specialLootPool, pool);
                    break;
                case "pockets":
                    this.addItemsToPool(pocketLootPool, pool);
                    break;
                case "tacticalvest":
                    this.addItemsToPool(vestLootPool, pool);
                    break;
                case "securedcontainer":
                    this.addItemsToPool(secureLootTPool, pool);
                    break;
                case "backpack":
                    this.addItemsToPool(backpackLootPool, pool);
                    break;
                default:
                    this.logger.warning(`How did you get here ${slot}`);
            }

            // Add all items (if any) to combined pool (excluding secure)
            if (Object.keys(pool).length > 0 && slot.toLowerCase() !== "securedcontainer") 
            {
                this.addItemsToPool(combinedLootPool, pool);
            }
        }

        // Assign whitelisted special items to bot if any exist
        const specialLootItems: Record<string, number> =
            Object.keys(realWhitelist.specialItems.whitelist)?.length > 0
                ? realWhitelist.specialItems.whitelist
                : {};

        // no whitelist, find and assign from combined item pool
        if (Object.keys(specialLootItems).length === 0) 
        {
            for (const [tpl, weight] of Object.entries(specialLootPool)) 
            {
                const itemTemplate = this.itemHelper.getItem(tpl)[1];
                if (!(this.isBulletOrGrenade(itemTemplate._props) || this.isMagazine(itemTemplate._props))) 
                {
                    specialLootItems[tpl] = weight;
                }
            }
        }

        // Assign whitelisted healing items to bot if any exist
        const healingItems: Record<string, number> =
            Object.keys(realWhitelist.healing.whitelist)?.length > 0
                ? realWhitelist.healing.whitelist
                : {};

        // No whitelist, find and assign from combined item pool
        if (Object.keys(healingItems).length === 0) 
        {
            for (const [tpl, weight] of Object.entries(combinedLootPool)) 
            {
                const itemTemplate = this.itemHelper.getItem(tpl)[1];
                if (
                    this.isMedicalItem(itemTemplate._props) &&
                    itemTemplate._parent !== BaseClasses.STIMULATOR &&
                    itemTemplate._parent !== BaseClasses.DRUGS
                ) 
                {
                    healingItems[tpl] = weight;
                }
            }
        }

        // Assign whitelisted drugs to bot if any exist
        const drugItems: Record<string, number> =
            Object.keys(realWhitelist.drugs.whitelist)?.length > 0
                ? realWhitelist.drugs.whitelist
                : {};

        // no drugs whitelist, find and assign from combined item pool
        if (Object.keys(drugItems).length === 0) 
        {
            for (const [tpl, weight] of Object.entries(combinedLootPool)) 
            {
                const itemTemplate = this.itemHelper.getItem(tpl)[1];
                if (this.isMedicalItem(itemTemplate._props) && itemTemplate._parent === BaseClasses.DRUGS) 
                {
                    drugItems[tpl] = weight;
                }
            }
        }

        // Assign whitelisted food to bot if any exist
        const foodItems: Record<string, number> =
            Object.keys(realWhitelist.food.whitelist)?.length > 0
                ? realWhitelist.food.whitelist
                : {};

        // No food whitelist, find and assign from combined item pool
        if (Object.keys(foodItems).length === 0) 
        {
            for (const [tpl, weight] of Object.entries(combinedLootPool)) 
            {
                const itemTemplate = this.itemHelper.getItem(tpl)[1];
                if (this.itemHelper.isOfBaseclass(itemTemplate._id, BaseClasses.FOOD)) 
                {
                    foodItems[tpl] = weight;
                }
            }
        }

        // Assign whitelisted drink to bot if any exist
        const drinkItems: Record<string, number> =
            Object.keys(realWhitelist.food.whitelist)?.length > 0
                ? realWhitelist.food.whitelist
                : {};

        // No drink whitelist, find and assign from combined item pool
        if (Object.keys(drinkItems).length === 0) 
        {
            for (const [tpl, weight] of Object.entries(combinedLootPool)) 
            {
                const itemTemplate = this.itemHelper.getItem(tpl)[1];
                if (this.itemHelper.isOfBaseclass(itemTemplate._id, BaseClasses.DRINK)) 
                {
                    drinkItems[tpl] = weight;
                }
            }
        }

        // Assign whitelisted currency to bot if any exist
        const currencyItems: Record<string, number> =
            Object.keys(realWhitelist.currency.whitelist)?.length > 0
                ? realWhitelist.currency.whitelist
                : {};

        // No currency whitelist, find and assign from combined item pool
        if (Object.keys(currencyItems).length === 0) 
        {
            for (const [tpl, weight] of Object.entries(combinedLootPool)) 
            {
                const itemTemplate = this.itemHelper.getItem(tpl)[1];
                if (this.itemHelper.isOfBaseclass(itemTemplate._id, BaseClasses.MONEY)) 
                {
                    currencyItems[tpl] = weight;
                }
            }
        }

        // Assign whitelisted stims to bot if any exist
        const stimItems: Record<string, number> =
            Object.keys(realWhitelist.stims.whitelist)?.length > 0
                ? realWhitelist.stims.whitelist
                : {};

        // No whitelist, find and assign from combined item pool
        if (Object.keys(stimItems).length === 0) 
        {
            for (const [tpl, weight] of Object.entries(combinedLootPool)) 
            {
                const itemTemplate = this.itemHelper.getItem(tpl)[1];
                if (this.isMedicalItem(itemTemplate._props) && itemTemplate._parent === BaseClasses.STIMULATOR) 
                {
                    stimItems[tpl] = weight;
                }
            }
        }

        // Assign whitelisted grenades to bot if any exist
        const grenadeItems: Record<string, number> =
            Object.keys(realWhitelist.grenades.whitelist)?.length > 0
                ? realWhitelist.grenades.whitelist
                : {};

        // no whitelist, find and assign from combined item pool
        if (Object.keys(grenadeItems).length === 0) 
        {
            for (const [tpl, weight] of Object.entries(combinedLootPool)) 
            {
                const itemTemplate = this.itemHelper.getItem(tpl)[1];
                if (this.isGrenade(itemTemplate._props)) 
                {
                    grenadeItems[tpl] = weight;
                }
            }
        }

        // Get backpack loot (excluding magazines, bullets, grenades, drink, food and healing/stim items)
        const filteredBackpackItems = {};
        const secondFilteredBackpackItems = {};
        let useInitialFilter = true;
        for (const itemKey of Object.keys(backpackLootPool)) 
        {
            const itemResult = this.itemHelper.getItem(itemKey);
            if (!itemResult[0]) 
            {
                continue;
            }
            const itemTemplate = itemResult[1];
            if (
                this.isBulletOrGrenade(itemTemplate._props) ||
                this.isMagazine(itemTemplate._props) ||
                this.isMedicalItem(itemTemplate._props) ||
                this.isGrenade(itemTemplate._props) ||
                this.isFood(itemTemplate._id) ||
                this.isDrink(itemTemplate._id) ||
                this.isAmmoBox(itemTemplate._id) ||
                this.isCurrency(itemTemplate._id)
            ) 
            {
                // Is type we dont want as backpack loot, skip
                continue;
            }

            filteredBackpackItems[itemKey] = backpackLootPool[itemKey];
        }
        // If filtered pool gets too small, hydrate with combined loot pool and then filter again
        if (!isPmc && Object.keys(filteredBackpackItems).length < 5)
        {
            useInitialFilter = false;

            const pmcType = Math.round(Math.random()) == 1 ? "pmcBEAR" : "pmcUSEC";
            const newItemPool = this.cloner.clone(this.pmcLootGenerator.generatePMCBackpackLootPool(pmcType));

            for (const tpl in newItemPool) 
            {
                // Skip adding items that already exist
                if (filteredBackpackItems[tpl]) 
                {
                    continue;
                }
    
                filteredBackpackItems[tpl] = newItemPool[tpl];
            }

            //Refilter them
            for (const itemKey of Object.keys(filteredBackpackItems)) 
            {
                const itemResult = this.itemHelper.getItem(itemKey);
                if (!itemResult[0]) 
                {
                    continue;
                }
                const itemTemplate = itemResult[1];
                if (
                    this.isBulletOrGrenade(itemTemplate._props) ||
                    this.isMagazine(itemTemplate._props) ||
                    this.isMedicalItem(itemTemplate._props) ||
                    this.isGrenade(itemTemplate._props) ||
                    this.isFood(itemTemplate._id) ||
                    this.isDrink(itemTemplate._id) ||
                    this.isAmmoBox(itemTemplate._id) ||
                    this.isArmour(itemTemplate._id) ||
                    this.isCurrency(itemTemplate._id) ||
                    itemTemplate._id == "6711039f9e648049e50b3307" ||
                    itemTemplate._id == "593962ca86f774068014d9af"
                ) 
                {
                    // Is type we dont want as backpack loot, skip
                    continue;
                }
                secondFilteredBackpackItems[itemKey] = filteredBackpackItems[itemKey];
            }
        }

        const finalFilteredBackpackItems = useInitialFilter ? filteredBackpackItems : secondFilteredBackpackItems;

        // Get pocket loot (excluding magazines, bullets, grenades, drink, food medical and healing/stim items)
        const filteredPocketItems = {};
        for (const itemKey of Object.keys(pocketLootPool)) 
        {
            const itemResult = this.itemHelper.getItem(itemKey);
            if (!itemResult[0]) 
            {
                continue;
            }
            const itemTemplate = itemResult[1];
            if (
                this.isBulletOrGrenade(itemTemplate._props) ||
                this.isMagazine(itemTemplate._props) ||
                this.isMedicalItem(itemTemplate._props) ||
                this.isGrenade(itemTemplate._props) ||
                this.isFood(itemTemplate._id) ||
                this.isDrink(itemTemplate._id) ||
                this.isCurrency(itemTemplate._id) ||
                !("Height" in itemTemplate._props) || // lacks height
                !("Width" in itemTemplate._props) // lacks width
            ) 
            {
                continue;
            }

            filteredPocketItems[itemKey] = pocketLootPool[itemKey];
        }

        // Get vest loot (excluding magazines, bullets, grenades, medical and healing/stim items)
        const filteredVestItems = {};
        for (const itemKey of Object.keys(vestLootPool)) 
        {
            const itemResult = this.itemHelper.getItem(itemKey);
            if (!itemResult[0]) 
            {
                continue;
            }
            const itemTemplate = itemResult[1];
            if (
                this.isBulletOrGrenade(itemTemplate._props) ||
                this.isMagazine(itemTemplate._props) ||
                this.isMedicalItem(itemTemplate._props) ||
                this.isGrenade(itemTemplate._props) ||
                this.isFood(itemTemplate._id) ||
                this.isDrink(itemTemplate._id) ||
                this.isCurrency(itemTemplate._id)
            ) 
            {
                continue;
            }

            filteredVestItems[itemKey] = vestLootPool[itemKey];
        }

        this.apbsLootCache[combinedBotRoleTier].healingItems = healingItems;
        this.apbsLootCache[combinedBotRoleTier].drugItems = drugItems;
        this.apbsLootCache[combinedBotRoleTier].foodItems = foodItems;
        this.apbsLootCache[combinedBotRoleTier].drinkItems = drinkItems;
        this.apbsLootCache[combinedBotRoleTier].currencyItems = currencyItems;
        this.apbsLootCache[combinedBotRoleTier].stimItems = stimItems;
        this.apbsLootCache[combinedBotRoleTier].grenadeItems = grenadeItems;

        this.apbsLootCache[combinedBotRoleTier].specialItems = specialLootItems;
        this.apbsLootCache[combinedBotRoleTier].backpackLoot = finalFilteredBackpackItems;
        this.apbsLootCache[combinedBotRoleTier].pocketLoot = filteredPocketItems;
        this.apbsLootCache[combinedBotRoleTier].vestLoot = filteredVestItems;
        this.apbsLootCache[combinedBotRoleTier].secureLoot = secureLootTPool;
    }

    private isAmmoBox(tpl: string): boolean 
    {        
        return this.itemHelper.isOfBaseclass(tpl, BaseClasses.AMMO_BOX);
    }

    private isArmour(tpl: string): boolean 
    {        
        return this.itemHelper.isOfBaseclass(tpl, BaseClasses.EQUIPMENT);
    }
}