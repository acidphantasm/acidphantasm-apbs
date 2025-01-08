import { ItemHelper } from "@spt/helpers/ItemHelper";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { IInventory } from "@spt/models/eft/common/tables/IBotBase";
import { IGenerationData } from "@spt/models/eft/common/tables/IBotType";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { LocalisationService } from "@spt/services/LocalisationService";
import { inject, injectable } from "tsyringe";

@injectable()
export class APBSMethodHolder 
{
    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper,
        @inject("ItemHelper") protected itemHelper: ItemHelper
    ) 
    {}

    public getWeightedCompatibleAmmo(
        cartridgePool: Record<string, Record<string, number>>,
        weaponTemplate: ITemplateItem
    ): string 
    {
        const desiredCaliber = this.getWeaponCaliber(weaponTemplate);

        const cartridgePoolForWeapon = cartridgePool[desiredCaliber];
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
        const compatibleCartridges = Object.keys(cartridgePoolForWeapon)
            .filter((cartridge) => compatibleCartridgesInTemplate.includes(cartridge))
            .reduce((acc, key) => ({ ...acc, [key]: cartridgePoolForWeapon[key] }), {});

        if (!compatibleCartridges) 
        {
            // No compatible cartridges, use default
            return weaponTemplate._props.defAmmo;
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
}