
import { BotGeneratorHelper } from "@spt/helpers/BotGeneratorHelper";
import { BotWeaponGeneratorHelper } from "@spt/helpers/BotWeaponGeneratorHelper";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { EquipmentSlots } from "@spt/models/enums/EquipmentSlots";
import { ItemAddedResult } from "@spt/models/enums/ItemAddedResult";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { LocalisationService } from "@spt/services/LocalisationService";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { inject, injectable } from "tsyringe";
import { APBSIInventoryMagGen } from "./APBSIInventoryMagGen";
import { APBSInventoryMagGen } from "./APBSInventoryMagGen";
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { APBSTierGetter } from "../Utils/APBSTierGetter";
import { APBSMethodHolder } from "./APBSMethodHolder";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { ModConfig } from "../Globals/ModConfig";
import { IItem } from "@spt/models/eft/common/tables/IItem";

@injectable()
export class APBSExternalInventoryMagGen implements APBSIInventoryMagGen
{
    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("BotWeaponGeneratorHelper") protected botWeaponGeneratorHelper: BotWeaponGeneratorHelper,
        @inject("BotGeneratorHelper") protected botGeneratorHelper: BotGeneratorHelper,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("APBSTierGetter") protected apbsTierGetter: APBSTierGetter,
        @inject("APBSMethodHolder") protected apbsMethodHolder: APBSMethodHolder
    ) 
    {}

    getPriority(): number 
    {
        return 99;
    }

    canHandleInventoryMagGen(inventoryMagGen: APBSInventoryMagGen): boolean 
    {
        if (inventoryMagGen.getWeaponTemplate()._props.ReloadMode === "OnlyBarrel") return false;
        if (inventoryMagGen.getMagazineTemplate()._props.ReloadMagType === "InternalMagazine") return false;
        if (inventoryMagGen.getWeaponTemplate()._parent === BaseClasses.UBGL) return false;
        return true; // Fallback, if code reaches here it means no other implementation can handle this type of magazine
    }

    process(inventoryMagGen: APBSInventoryMagGen): void 
    {
        // Cout of attempts to fit a magazine into bot inventory
        let fitAttempts = 0;

        // Magazine Db template
        let magTemplate = inventoryMagGen.getMagazineTemplate();
        let magazineTpl = magTemplate._id;
        const weapon = inventoryMagGen.getWeaponTemplate();
        const ammoCaliber = inventoryMagGen.getAmmoTemplate()._props.Caliber;
        const attemptedMagBlacklist: string[] = [];
        const defaultMagazineTpl = this.botWeaponGeneratorHelper.getWeaponsDefaultMagazineTpl(weapon);
        let randomizedMagazineCount = Number(
            this.botWeaponGeneratorHelper.getRandomizedMagazineCount(inventoryMagGen.getMagCount())
        );        
        const ammoTable = this.apbsEquipmentGetter.getAmmoByBotRole(inventoryMagGen.getBotRole(), inventoryMagGen.getTierNumber());
        const rerollConfig = inventoryMagGen.getRerollDetails();
        const toploadConfig = inventoryMagGen.getToploadDetails();

        let hasSwitchedToSmallerMags = false;
        let isTryingSmallerMags = false;

        const shouldBotRerollAmmo = (rerollConfig.enable && !toploadConfig.enable) ? this.randomUtil.getChance100(rerollConfig.chance) : false;
        const shouldBotTopload = (toploadConfig.enable && !rerollConfig.enable) ? this.randomUtil.getChance100(toploadConfig.chance) : false;

        for (let i = 0; i < randomizedMagazineCount; i++) 
        {
            if (this.itemHelper.isOfBaseclass(weapon._id, BaseClasses.PISTOL)) 
            {
                randomizedMagazineCount = this.randomUtil.getInt(1, 2);
            }

            // Large capacity mag limited
            if (ModConfig.config.generalConfig.enableLargeCapacityMagazineLimit && !hasSwitchedToSmallerMags && !this.apbsMethodHolder.weaponsWithNoSmallMagazines.includes(weapon._id))
            {
                const apbsModPool = this.apbsEquipmentGetter.getModsByBotRole(inventoryMagGen.getBotRole(), inventoryMagGen.getTierNumber());
                const apbsModsForWeapon = apbsModPool[weapon._id];
                const apbsMagazineModPool = apbsModsForWeapon["mod_magazine"];
                const currentMagazineCountSize = magTemplate?._props?.Cartridges[0]?._max_count;
                if (currentMagazineCountSize && apbsMagazineModPool.length)
                {
                    if (currentMagazineCountSize > 35 && i >= (ModConfig.config.generalConfig.largeCapacityMagazineCount - 1))
                    {
                        isTryingSmallerMags = true;
                        const smallerMagazines = this.apbsMethodHolder.getFilteredMagazinePoolByCapacity(inventoryMagGen.getTierNumber(), weapon, ammoCaliber, apbsMagazineModPool);
                        if (smallerMagazines.length)
                        {
                            magazineTpl = this.randomUtil.getStringArrayValue(smallerMagazines);
                            magTemplate = this.itemHelper.getItem(magazineTpl)[1];
                        }
                    }
                }
            }

            // Ammo reselection
            let selectedAmmoForMag = inventoryMagGen.getAmmoTemplate()._id;
            if (shouldBotRerollAmmo)
            {
                selectedAmmoForMag = this.apbsMethodHolder.apbsGetWeightedCompatibleAmmo(ammoTable, ammoCaliber, weapon);
            }

            let magazineWithAmmo: IItem[];
            if (shouldBotTopload)
            {
                magazineWithAmmo = this.apbsMethodHolder.createMagazineWithAmmo(
                    magazineTpl,
                    selectedAmmoForMag,
                    ammoTable,
                    ammoCaliber,
                    magTemplate,
                    toploadConfig.percent
                );
            }
            else
            {
                magazineWithAmmo = this.botWeaponGeneratorHelper.createMagazineWithAmmo(
                    magazineTpl,
                    selectedAmmoForMag,
                    magTemplate
                );
            }

            const fitsIntoInventory = this.botGeneratorHelper.addItemWithChildrenToEquipmentSlot(
                [EquipmentSlots.TACTICAL_VEST, EquipmentSlots.POCKETS],
                magazineWithAmmo[0]._id,
                magazineTpl,
                magazineWithAmmo,
                inventoryMagGen.getPmcInventory()
            );

            if (fitsIntoInventory === ItemAddedResult.NO_CONTAINERS) 
            {
                // No containers to fit magazines, stop trying
                break;
            }

            // No space for magazine and we haven't reached desired magazine count
            if (fitsIntoInventory === ItemAddedResult.NO_SPACE && i < randomizedMagazineCount) 
            {
                // Prevent infinite loop by only allowing 5 attempts at fitting a magazine into inventory
                if (fitAttempts > 5) 
                {
                    this.logger.debug(
                        `Failed ${fitAttempts} times to add magazine ${magazineTpl} to bot inventory, stopping`
                    );

                    break;
                }

                /* We were unable to fit at least the minimum amount of magazines,
                 * so we fallback to default magazine and try again.
                 * Temporary workaround to Killa spawning with no extra mags if he spawns with a drum mag */

                if (magazineTpl === defaultMagazineTpl) 
                {
                    // We were already on default - stop here to prevent infinite looping
                    break;
                }

                // Add failed magazine tpl to blacklist
                attemptedMagBlacklist.push(magazineTpl);

                // Set chosen magazine tpl to the weapons default magazine tpl and try to fit into inventory next loop
                magazineTpl = defaultMagazineTpl;
                magTemplate = this.itemHelper.getItem(magazineTpl)[1];
                if (!magTemplate) 
                {
                    this.logger.error(
                        this.localisationService.getText("bot-unable_to_find_default_magazine_item", magazineTpl)
                    );

                    break;
                }

                // Edge case - some weapons (SKS) have an internal magazine as default, choose random non-internal magazine to add to bot instead
                if (magTemplate._props.ReloadMagType === "InternalMagazine") 
                {
                    const result = this.getRandomExternalMagazineForInternalMagazineGun(
                        inventoryMagGen.getWeaponTemplate()._id,
                        attemptedMagBlacklist
                    );
                    if (!result?._id) 
                    {
                        this.logger.debug(
                            `Unable to add additional magazine into bot inventory for weapon: ${weapon._name}, attempted: ${fitAttempts} times`
                        );

                        break;
                    }

                    magazineTpl = result._id;
                    magTemplate = result;
                    fitAttempts++;
                }

                // Reduce loop counter by 1 to ensure we get full cout of desired magazines
                i--;
            }

            if (fitsIntoInventory === ItemAddedResult.SUCCESS) 
            {
                // Reset fit counter now it succeeded
                fitAttempts = 0;
                if (isTryingSmallerMags) hasSwitchedToSmallerMags = true;
            }
        }
    }

    /**
     * Get a random compatible external magazine for a weapon, exclude internal magazines from possible pool
     * @param weaponTpl Weapon to get mag for
     * @returns tpl of magazine
     */
    protected getRandomExternalMagazineForInternalMagazineGun(
        weaponTpl: string,
        magazineBlacklist: string[]
    ): ITemplateItem | undefined 
    {
        // The mag Slot data for the weapon
        const magSlot = this.itemHelper.getItem(weaponTpl)[1]._props.Slots.find((x) => x._name === "mod_magazine");
        if (!magSlot) 
        {
            return undefined;
        }

        // All possible mags that fit into the weapon excluding blacklisted
        const magazinePool = magSlot._props.filters[0].Filter.filter((x) => !magazineBlacklist.includes(x)).map(
            (x) => this.itemHelper.getItem(x)[1]
        );
        if (!magazinePool) 
        {
            return undefined;
        }

        // Non-internal magazines that fit into the weapon
        const externalMagazineOnlyPool = magazinePool.filter((x) => x._props.ReloadMagType !== "InternalMagazine");
        if (!externalMagazineOnlyPool || externalMagazineOnlyPool?.length === 0) 
        {
            return undefined;
        }

        // Randomly chosen external magazine
        return this.randomUtil.getArrayValue(externalMagazineOnlyPool);
    }
}