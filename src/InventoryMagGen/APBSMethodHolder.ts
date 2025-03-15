import { ItemHelper } from "@spt/helpers/ItemHelper";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { LocalisationService } from "@spt/services/LocalisationService";
import { inject, injectable } from "tsyringe";
import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";
import { IItem } from "@spt/models/eft/common/tables/IItem";
import { HashUtil } from "@spt/utils/HashUtil";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { RandomUtil } from "@spt/utils/RandomUtil";

@injectable()
export class APBSMethodHolder 
{
    public weaponsWithNoSmallMagazines: string[] = [
        "5cc82d76e24e8d00134b4b83",
        "64ca3d3954fc657e230529cc",
        "64637076203536ad5600c990",
        "6513ef33e06849f06c0957ca",
        "65268d8ecb944ff1e90ea385",
        "65fb023261d5829b2d090755"
    ]
    
    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("APBSLogger") protected apbsLogger: APBSLogger,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("RandomUtil") protected randUtil: RandomUtil
    ) 
    {}

    public apbsGetWeightedCompatibleAmmo(
        cartridgePool: Record<string, Record<string, number>>,
        currentCaliber: string,
        weaponTemplate: ITemplateItem
    ): string 
    {
        if (currentCaliber == "762x67mmB")
        {
            currentCaliber = "Caliber762x67mmB";
        } 
        let cartridgePoolForWeapon = cartridgePool[currentCaliber];
        if (!cartridgePoolForWeapon || cartridgePoolForWeapon?.length === 0) 
        {
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

    public getWeaponCaliber(weaponTemplate: ITemplateItem): string 
    {
        if (weaponTemplate._props.Caliber) 
        {
            return weaponTemplate._props.Caliber;
        }

        if (weaponTemplate._props.ammoCaliber) 
        {
            // 9x18pmm has a typo, should be Caliber9x18PM
            return weaponTemplate._props.ammoCaliber === "Caliber9x18PMM"
                ? "Caliber9x18PM"
                : weaponTemplate._props.ammoCaliber;
        }

        if (weaponTemplate._props.LinkedWeapon) 
        {
            const ammoInChamber = this.itemHelper.getItem(
                weaponTemplate._props.Chambers[0]._props.filters[0].Filter[0]
            );
            if (!ammoInChamber[0]) 
            {
                return;
            }

            return ammoInChamber[1]._props.Caliber;
        }
    }

    private getCompatibleCartridgesFromWeaponTemplate(weaponTemplate: ITemplateItem): string[] 
    {
        const cartridges = weaponTemplate._props?.Chambers[0]?._props?.filters[0]?.Filter;
        if (!cartridges) 
        {
            // Fallback to the magazine if possible, e.g. for revolvers
            return this.getCompatibleCartridgesFromMagazineTemplate(weaponTemplate);
        }

        return cartridges;
    }

    private getCompatibleCartridgesFromMagazineTemplate(weaponTemplate: ITemplateItem): string[] 
    {
        // Get the first magazine's template from the weapon
        const magazineSlot = weaponTemplate._props.Slots?.find((slot) => slot._name === "mod_magazine");
        if (!magazineSlot) 
        {
            return [];
        }
        const magazineTemplate = this.itemHelper.getItem(magazineSlot._props.filters[0].Filter[0]);
        if (!magazineTemplate[0]) 
        {
            return [];
        }

        // Get the first slots array of cartridges
        let cartridges = magazineTemplate[1]._props.Slots[0]?._props?.filters[0].Filter;
        if (!cartridges) 
        {
            // Normal magazines
            // None found, try the cartridges array
            cartridges = magazineTemplate[1]._props.Cartridges[0]?._props?.filters[0].Filter;
        }

        return cartridges ?? [];
    }
    
    private magazineHasCompatibleCaliber(magazineTemplate: ITemplateItem, currentCaliber: string): boolean 
    {
        const cartridges = magazineTemplate._props.Cartridges[0]?._props?.filters[0].Filter;

        if (cartridges.length)
        {
            // Check each rout in the compatible cartridges
            for (const round in cartridges)
            {
                const caliberData = this.itemHelper.getItem(cartridges[round])[1]._props.Caliber;
                if (caliberData == currentCaliber) return true;
            }
            return false;
        }
        return false;
    }

    // Custom filtered magazine pool by capacity - returns empty array if nothing is compatible
    public getFilteredMagazinePoolByCapacity(tier: number, weapon: ITemplateItem, currentCaliber: string, modPool: string[]): string[] 
    {
        const desiredMagazineTpls = modPool.filter((magTpl) => 
        {
            const magazineDb = this.itemHelper.getItem(magTpl);
            if (!magazineDb[0]) return false;
            if (!this.magazineHasCompatibleCaliber(magazineDb[1], currentCaliber)) return false;
            return magazineDb[1]._props && magazineDb[1]._props.Cartridges[0]._max_count < 40 && magazineDb[1]._props.Cartridges[0]._max_count >= 25;
        });

        if (desiredMagazineTpls.length === 0) 
        {
            this.apbsLogger.log(Logging.DEBUG, `[MAGAZINES] Weapon: ${weapon._id} does not have compatible small magazines available in tier ${tier}. Ignoring filter...`);
        }

        return desiredMagazineTpls;
    }

    public createMagazineWithAmmo(magazineTpl: string, ammoTpl: string, ammoPool: Record<string, Record<string, number>>, ammoCaliber: string, magTemplate: ITemplateItem, percentOfMag: number): IItem[] 
    {
        const magazine: IItem[] = [{ _id: this.hashUtil.generate(), _tpl: magazineTpl }];

        this.fillMagazineWithCartridge(magazine, magTemplate, ammoTpl, ammoPool, ammoCaliber, percentOfMag);

        return magazine;
    }

    public fillMagazineWithCartridge(
        magazineWithChildCartridges: IItem[],
        magTemplate: ITemplateItem,
        cartridgeTpl: string,
        ammoPool: Record<string, Record<string, number>>,
        ammoCaliber: string,
        percentOfMag: number
    ): void 
    {
        // Get cartridge properties and max allowed stack size
        const cartridgeDetails = this.itemHelper.getItem(cartridgeTpl);
        if (!cartridgeDetails[0]) 
        {
            this.logger.error(this.localisationService.getText("item-invalid_tpl_item", cartridgeTpl));
        }

        const cartridgeMaxStackSize = cartridgeDetails[1]._props?.StackMaxSize;
        if (!cartridgeMaxStackSize) 
        {
            this.logger.error(`Item with tpl: ${cartridgeTpl} lacks a _props or StackMaxSize property`);
        }

        // Get max number of cartridges in magazine, choose random value between min/max
        const magazineCartridgeMaxCount = this.itemHelper.isOfBaseclass(magTemplate._id, BaseClasses.SPRING_DRIVEN_CYLINDER)
            ? magTemplate._props.Slots.length // Edge case for rotating grenade launcher magazine
            : magTemplate._props.Cartridges[0]?._max_count;

        if (!magazineCartridgeMaxCount) 
        {
            this.logger.warning(
                `Magazine: ${magTemplate._id} ${magTemplate._name} lacks a Cartridges array, unable to fill magazine with ammo`
            );

            return;
        }

        let bottomLoadTpl = cartridgeTpl;
        let topLoadTpl = cartridgeTpl;
        
        const ammoTableKeys = Object.keys(ammoPool[ammoCaliber]);
        const topLoadAmmoSelection = ammoTableKeys.at(ammoTableKeys.indexOf(cartridgeTpl) + 1);

        if (topLoadAmmoSelection == null)
        {
            bottomLoadTpl = ammoTableKeys.at(ammoTableKeys.indexOf(cartridgeTpl) - 1) ?? cartridgeTpl;
            topLoadTpl = cartridgeTpl;
        }
        else
        {
            topLoadTpl = topLoadAmmoSelection;
        }

        const desiredMaxStackCount = magazineCartridgeMaxCount;
        const desiredTopLoadAmount = Math.max(1, this.randUtil.getPercentOfValue(percentOfMag, desiredMaxStackCount, 0));
        const desiredBottomLoadAmount = desiredMaxStackCount - desiredTopLoadAmount;

        if (magazineWithChildCartridges.length > 1) 
        {
            this.logger.warning(`Magazine ${magTemplate._name} already has cartridges defined, this may cause issues`);
        }

        // Loop over cartridge count and add stacks to magazine
        let cartridgeTplToAdd = cartridgeTpl;
        let cartridgeCountToAdd = 0;
        let currentStoredCartridgeCount = 0;
        let location = 0;
        let remainingMagSpace = 0;

        while (currentStoredCartridgeCount < desiredMaxStackCount) 
        {
            remainingMagSpace = desiredMaxStackCount - currentStoredCartridgeCount;
            if (currentStoredCartridgeCount < desiredBottomLoadAmount)
            {
                cartridgeTplToAdd = bottomLoadTpl;
                cartridgeCountToAdd = desiredBottomLoadAmount <= cartridgeMaxStackSize ? desiredBottomLoadAmount : cartridgeMaxStackSize;
                if (cartridgeCountToAdd > (remainingMagSpace - desiredTopLoadAmount))
                {
                    cartridgeCountToAdd = remainingMagSpace - desiredTopLoadAmount
                }
            }
            else
            {
                cartridgeTplToAdd = topLoadTpl;
                cartridgeCountToAdd = desiredTopLoadAmount <= cartridgeMaxStackSize ? desiredTopLoadAmount : cartridgeMaxStackSize;
            }

            // Ensure we don't go over the max stackcount size
            const actualSpace = desiredMaxStackCount - currentStoredCartridgeCount;
            if (cartridgeCountToAdd > actualSpace) 
            {
                cartridgeCountToAdd = actualSpace;
            }

            // Add cartridge item object into items array
            magazineWithChildCartridges.push(
                this.itemHelper.createCartridges(
                    magazineWithChildCartridges[0]._id,
                    cartridgeTplToAdd,
                    cartridgeCountToAdd,
                    location,
                    magazineWithChildCartridges[0].upd?.SpawnedInSession
                )
            );

            currentStoredCartridgeCount += cartridgeCountToAdd;
            location++;
        }

        // Only one cartridge stack added, remove location property as its only used for 2 or more stacks
        if (location === 1) 
        {
            delete magazineWithChildCartridges[1].location;
        }
    }
}