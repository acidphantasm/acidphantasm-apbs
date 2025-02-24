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
        weaponTemplate: ITemplateItem
    ): string 
    {
        const desiredCaliber = this.getWeaponCaliber(weaponTemplate);
        
        let cartridgePoolForWeapon = cartridgePool[desiredCaliber];
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
        let compatibleCartridges = Object.keys(cartridgePoolForWeapon)
            .filter((cartridge) => compatibleCartridgesInTemplate.includes(cartridge))
            .reduce((acc, key) => ({ ...acc, [key]: cartridgePoolForWeapon[key] }), {});

        if (Object.keys(compatibleCartridges).length === 0) 
        {
            // No compatible cartridges, try to get compatible caliber from magazines
            const firstMagazine = weaponTemplate._props.Slots.find((slot) => slot._name === "mod_magazine");
            const magazineTemplate = this.itemHelper.getItem(firstMagazine._props.filters[0].Filter[0]);

            // Get the first slots array of cartridges
            compatibleCartridges = magazineTemplate[1]._props.Slots[0]?._props.filters[0].Filter;
            if (!compatibleCartridges) 
            {
                // Normal magazines
                // None found, try the cartridges array
                compatibleCartridges = magazineTemplate[1]._props.Cartridges[0]?._props.filters[0].Filter;
                
                if (!compatibleCartridges)
                {
                    this.apbsLogger.log(Logging.DEBUG, `No compatible ammo found for ${weaponTemplate._id}, using weapons default ammo instead.`);
                    return weaponTemplate._props.defAmmo
                }
            }

            // Last ditch effor to get compatible calibers
            const magazineCaliberData = this.itemHelper.getItem(compatibleCartridges[0])[1]._props.Caliber;
            cartridgePoolForWeapon = cartridgePool[magazineCaliberData];
            
            compatibleCartridges = Object.keys(cartridgePoolForWeapon)
                .filter((cartridge) => compatibleCartridgesInTemplate.includes(cartridge))
                .reduce((acc, key) => ({ ...acc, [key]: cartridgePoolForWeapon[key] }), {});

            if (Object.keys(compatibleCartridges).length === 0) 
            {
                this.apbsLogger.log(Logging.DEBUG, `No compatible ammo found for ${weaponTemplate._id} in last ditch effort, using weapons default ammo instead.`);
                return weaponTemplate._props.defAmmo
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

    public getCompatibleCartridgesFromWeaponTemplate(weaponTemplate: ITemplateItem): string[] 
    {
        let cartridges = weaponTemplate._props.Chambers[0]?._props?.filters[0]?.Filter;
        if (!cartridges) 
        {
            // Fallback to the magazine if possible, e.g. for revolvers
            //  Grab the magazines template
            const firstMagazine = weaponTemplate._props.Slots.find((slot) => slot._name === "mod_magazine");
            const magazineTemplate = this.itemHelper.getItem(firstMagazine._props.filters[0].Filter[0]);

            // Get the first slots array of cartridges
            cartridges = magazineTemplate[1]._props.Slots[0]?._props.filters[0].Filter;
            if (!cartridges) 
            {
                // Normal magazines
                // None found, try the cartridges array
                cartridges = magazineTemplate[1]._props.Cartridges[0]?._props.filters[0].Filter;
            }
        }

        return cartridges;
    }

    // Custom filtered magazine pool by capacity - returns empty array if nothing is compatible
    public getFilteredMagazinePoolByCapacity(tier: number, weaponTpl: string, currentMagazineSize: number, modPool: string[]): string[] 
    {
        const desiredMagazineTpls = modPool.filter((magTpl) => 
        {
            const magazineDb = this.itemHelper.getItem(magTpl)[1];
            if (!this.itemHelper.getItem(magazineDb._id)[0]) return false;
            return magazineDb._props && magazineDb._props.Cartridges[0]._max_count < currentMagazineSize && magazineDb._props.Cartridges[0]._max_count >= 30;
        });

        if (desiredMagazineTpls.length === 0) 
        {
            this.apbsLogger.log(Logging.DEBUG, `[MAGAZINES] Weapon: ${weaponTpl} does not have compatible small magazines available in tier ${tier}. Ignoring filter...`);
        }

        return desiredMagazineTpls;
    }
}