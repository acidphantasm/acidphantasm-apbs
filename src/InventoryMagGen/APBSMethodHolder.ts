import { ItemHelper } from "@spt/helpers/ItemHelper";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { IInventory } from "@spt/models/eft/common/tables/IBotBase";
import { IGenerationData } from "@spt/models/eft/common/tables/IBotType";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { IModToSpawnRequest } from "@spt/models/spt/bots/IModToSpawnRequest";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { LocalisationService } from "@spt/services/LocalisationService";
import { inject, injectable } from "tsyringe";
import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";

@injectable()
export class APBSMethodHolder 
{
    public weaponsWithNoSmallMagazines: string[] = [
        "5cc82d76e24e8d00134b4b83",
        "64ca3d3954fc657e230529cc",
        "64637076203536ad5600c990",
        "6513ef33e06849f06c0957ca",
        "65268d8ecb944ff1e90ea385"
    ]
    
    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("APBSLogger") protected apbsLogger: APBSLogger,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper,
        @inject("ItemHelper") protected itemHelper: ItemHelper
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
                if (caliberData === currentCaliber)
                {
                    return true;
                } 
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
            return magazineDb[1]._props && magazineDb[1]._props.Cartridges[0]._max_count < 40 && magazineDb[1]._props.Cartridges[0]._max_count >= 30;
        });

        if (desiredMagazineTpls.length === 0) 
        {
            this.apbsLogger.log(Logging.DEBUG, `[MAGAZINES] Weapon: ${weapon._id} does not have compatible small magazines available in tier ${tier}. Ignoring filter...`);
        }

        return desiredMagazineTpls;
    }
}