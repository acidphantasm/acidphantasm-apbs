import { inject, injectable } from "tsyringe";

import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { DatabaseService } from "@spt/services/DatabaseService";
import { RandomUtil } from "@spt/utils/RandomUtil";

import { BotGeneratorHelper } from "@spt/helpers/BotGeneratorHelper";
import { ApplicationContext } from "@spt/context/ApplicationContext";
import { ContextVariableType } from "@spt/context/ContextVariableType";
import { ContainerHelper } from "@spt/helpers/ContainerHelper";
import { DurabilityLimitsHelper } from "@spt/helpers/DurabilityLimitsHelper";
import { InventoryHelper } from "@spt/helpers/InventoryHelper";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { IUpd } from "@spt/models/eft/common/tables/IItem";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { IGetRaidConfigurationRequestData } from "@spt/models/eft/match/IGetRaidConfigurationRequestData";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { LocalisationService } from "@spt/services/LocalisationService";

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

    public override generateExtraPropertiesForItem(itemTemplate: ITemplateItem, botRole?: string): { upd?: IUpd } 
    {
        // Get raid settings, if no raid, default to day
        const raidSettings = this.applicationContext
            .getLatestValue(ContextVariableType.RAID_CONFIGURATION)
            ?.getValue<IGetRaidConfigurationRequestData>();
        const raidIsNight = raidSettings?.timeVariant === "PAST";

        const itemProperties: IUpd = {};

        if (itemTemplate._props.MaxDurability) 
        {
            if (itemTemplate._props.weapClass) 
            {
                // Is weapon
                itemProperties.Repairable = this.generateWeaponRepairableProperties(itemTemplate, botRole);
            }
            else if (itemTemplate._props.armorClass) 
            {
                // Is armor
                itemProperties.Repairable = this.generateArmorRepairableProperties(itemTemplate, botRole);
            }
        }

        if (itemTemplate._props.HasHinge) 
        {
            itemProperties.Togglable = { On: true };
        }

        if (itemTemplate._props.Foldable) 
        {
            itemProperties.Foldable = { Folded: false };
        }

        if (itemTemplate._props.weapFireType?.length) 
        {
            if (itemTemplate._props.weapFireType.includes("fullauto")) 
            {
                itemProperties.FireMode = { FireMode: "fullauto" };
            }
            else 
            {
                itemProperties.FireMode = { FireMode: this.randomUtil.getArrayValue(itemTemplate._props.weapFireType) };
            }
        }

        if (itemTemplate._props.MaxHpResource) 
        {
            itemProperties.MedKit = {
                HpResource: this.getRandomizedResourceValue(
                    itemTemplate._props.MaxHpResource,
                    this.botConfig.lootItemResourceRandomization[botRole]?.meds
                )
            };
        }

        if (itemTemplate._props.MaxResource > 1 && itemTemplate._props.foodUseTime)
        {
            itemProperties.FoodDrink = {
                HpPercent: this.getRandomizedResourceValue(
                    itemTemplate._props.MaxResource,
                    this.botConfig.lootItemResourceRandomization[botRole]?.food
                )
            };
        }

        if (itemTemplate._parent === BaseClasses.FLASHLIGHT) 
        {
            // Get chance from botconfig for bot type
            const lightLaserActiveChance = raidIsNight
                ? this.getBotEquipmentSettingFromConfig(botRole, "lightIsActiveNightChancePercent", 50)
                : this.getBotEquipmentSettingFromConfig(botRole, "lightIsActiveDayChancePercent", 25);
            itemProperties.Light = {
                IsActive: this.randomUtil.getChance100(lightLaserActiveChance),
                SelectedMode: 0
            };
        }
        else if (itemTemplate._parent === BaseClasses.TACTICAL_COMBO) 
        {
            // Get chance from botconfig for bot type, use 50% if no value found
            const lightLaserActiveChance = this.getBotEquipmentSettingFromConfig(
                botRole,
                "laserIsActiveChancePercent",
                50
            );
            itemProperties.Light = {
                IsActive: this.randomUtil.getChance100(lightLaserActiveChance),
                SelectedMode: 0
            };
        }

        if (itemTemplate._parent === BaseClasses.NIGHTVISION) 
        {
            // Get chance from botconfig for bot type
            const nvgActiveChance = raidIsNight
                ? this.getBotEquipmentSettingFromConfig(botRole, "nvgIsActiveChanceNightPercent", 90)
                : this.getBotEquipmentSettingFromConfig(botRole, "nvgIsActiveChanceDayPercent", 15);
            itemProperties.Togglable = { On: this.randomUtil.getChance100(nvgActiveChance) };
        }

        // Togglable face shield
        if (itemTemplate._props.HasHinge && itemTemplate._props.FaceShieldComponent) 
        {
            // Get chance from botconfig for bot type, use 75% if no value found
            const faceShieldActiveChance = this.getBotEquipmentSettingFromConfig(
                botRole,
                "faceShieldIsActiveChancePercent",
                75
            );
            itemProperties.Togglable = { On: this.randomUtil.getChance100(faceShieldActiveChance) };
        }

        return Object.keys(itemProperties).length ? { upd: itemProperties } : {};
    }
}