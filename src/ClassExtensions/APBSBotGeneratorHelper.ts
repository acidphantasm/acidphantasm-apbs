import { inject, injectable } from "tsyringe";

import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { DatabaseService } from "@spt/services/DatabaseService";
import { RandomUtil } from "@spt/utils/RandomUtil";

import { BotGeneratorHelper } from "@spt/helpers/BotGeneratorHelper";
import { ApplicationContext } from "@spt/context/ApplicationContext";
import { ContainerHelper } from "@spt/helpers/ContainerHelper";
import { DurabilityLimitsHelper } from "@spt/helpers/DurabilityLimitsHelper";
import { InventoryHelper } from "@spt/helpers/InventoryHelper";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { LocalisationService } from "@spt/services/LocalisationService";
import { IRandomisedResourceValues } from "@spt/models/spt/config/IBotConfig";

/** Handle profile related client events */
@injectable()
export class APBSBotGeneratorHelper extends BotGeneratorHelper
{

    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("DurabilityLimitsHelper") protected durabilityLimitsHelper: DurabilityLimitsHelper,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("InventoryHelper") protected inventoryHelper: InventoryHelper,
        @inject("ContainerHelper") protected containerHelper: ContainerHelper,
        @inject("ApplicationContext") protected applicationContext: ApplicationContext,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("ConfigServer") protected configServer: ConfigServer
    )
    {
        super(logger, 
            randomUtil, 
            databaseService, 
            durabilityLimitsHelper, 
            itemHelper, 
            inventoryHelper, 
            containerHelper, 
            applicationContext, 
            localisationService, 
            configServer)
    }

    protected override getRandomizedResourceValue(maxResource: number, randomizationValues: IRandomisedResourceValues): number
    {
        if (!randomizationValues) 
        {
            return maxResource;
        }

        if (this.randomUtil.getChance100(randomizationValues.chanceMaxResourcePercent)) 
        {
            return maxResource;
        }

        // Never let % value fall below 1
        const percentOfValue = Math.max(
            1,
            this.randomUtil.getPercentOfValue(randomizationValues.resourcePercent, maxResource, 0)
        );
        return this.randomUtil.getInt(percentOfValue, maxResource);
    }
}