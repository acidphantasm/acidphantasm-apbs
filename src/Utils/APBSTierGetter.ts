import { inject, injectable } from "tsyringe";
import { TierInformation } from "../Globals/TierInformation";

@injectable()
export class APBSTierGetter
{
    constructor(
        @inject("TierInformation") protected tierInformation: TierInformation
    )
    {}

    public getTierByLevel(level: number): number
    {
        return this.tierInformation.tiers.find(({playerMinimumLevel,playerMaximumLevel}) => level>=playerMinimumLevel && level<=playerMaximumLevel)?.tier
    }

    public getTierUpperLevelDeviation(level:number): number
    {
        return this.tierInformation.tiers.find(({playerMinimumLevel,playerMaximumLevel}) => level>=playerMinimumLevel && level<=playerMaximumLevel)?.botMaxLevelVariance
    }

    public getTierLowerLevelDeviation(level:number): number
    {
        return this.tierInformation.tiers.find(({playerMinimumLevel,playerMaximumLevel}) => level>=playerMinimumLevel && level<=playerMaximumLevel)?.botMinLevelVariance
    }

    public getScavTierUpperLevelDeviation(level:number): number
    {
        return this.tierInformation.tiers.find(({playerMinimumLevel,playerMaximumLevel}) => level>=playerMinimumLevel && level<=playerMaximumLevel)?.scavMaxLevelVariance
    }

    public getScavTierLowerLevelDeviation(level:number): number
    {
        return this.tierInformation.tiers.find(({playerMinimumLevel,playerMaximumLevel}) => level>=playerMinimumLevel && level<=playerMaximumLevel)?.scavMinLevelVariance
    }
}