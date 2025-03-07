import { IInventory } from "@spt/models/eft/common/tables/IBotBase";
import { IGenerationData } from "@spt/models/eft/common/tables/IBotType";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { EnableChance, ToploadConfig } from "../Globals/ModConfig";

export class APBSInventoryMagGen 
{
    constructor(
        private magCounts: IGenerationData,
        private magazineTemplate: ITemplateItem,
        private weaponTemplate: ITemplateItem,
        private ammoTemplate: ITemplateItem,
        private pmcInventory: IInventory,
        private botRole: string,
        private botLevel: number,
        private tier: number,
        private toploadDetails: ToploadConfig,
        private rerollDetails: EnableChance
    ) 
    {}

    public getMagCount(): IGenerationData 
    {
        return this.magCounts;
    }

    public getMagazineTemplate(): ITemplateItem 
    {
        return this.magazineTemplate;
    }

    public getWeaponTemplate(): ITemplateItem 
    {
        return this.weaponTemplate;
    }

    public getAmmoTemplate(): ITemplateItem 
    {
        return this.ammoTemplate;
    }

    public getPmcInventory(): IInventory 
    {
        return this.pmcInventory;
    }

    public getBotRole(): string 
    {
        return this.botRole;
    }

    public getBotLevel(): number 
    {
        return this.botLevel;
    }

    public getTierNumber(): number 
    {
        return this.tier;
    }

    public getToploadDetails(): ToploadConfig 
    {
        return this.toploadDetails;
    }

    public getRerollDetails(): EnableChance 
    {
        return this.rerollDetails;
    }
}