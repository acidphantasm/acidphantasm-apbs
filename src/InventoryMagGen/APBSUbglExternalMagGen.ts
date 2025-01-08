import { IInventoryMagGen } from "@spt/generators/weapongen/IInventoryMagGen";
import { InventoryMagGen } from "@spt/generators/weapongen/InventoryMagGen";
import { BotWeaponGeneratorHelper } from "@spt/helpers/BotWeaponGeneratorHelper";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { EquipmentSlots } from "@spt/models/enums/EquipmentSlots";
import { inject, injectable } from "tsyringe";
import { APBSIInventoryMagGen } from "./APBSIInventoryMagGen";
import { APBSInventoryMagGen } from "./APBSInventoryMagGen";
import { ModConfig } from "../Globals/ModConfig";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { APBSTierGetter } from "../Utils/APBSTierGetter";
import { APBSMethodHolder } from "./APBSMethodHolder";

@injectable()
export class APBSUbglExternalMagGen implements APBSIInventoryMagGen 
{
    constructor(
        @inject("BotWeaponGeneratorHelper") protected botWeaponGeneratorHelper: BotWeaponGeneratorHelper,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter,
        @inject("APBSTierGetter") protected apbsTierGetter: APBSTierGetter,
        @inject("APBSMethodHolder") protected apbsMethodHolder: APBSMethodHolder
    ) 
    {}

    public getPriority(): number 
    {
        return 1;
    }

    public canHandleInventoryMagGen(inventoryMagGen: APBSInventoryMagGen): boolean 
    {
        return inventoryMagGen.getWeaponTemplate()._parent === BaseClasses.UBGL;
    }

    public process(inventoryMagGen: APBSInventoryMagGen): void 
    {
        const bulletCount = this.botWeaponGeneratorHelper.getRandomizedBulletCount(
            inventoryMagGen.getMagCount(),
            inventoryMagGen.getMagazineTemplate()
        );

        
        if (ModConfig.config.enableBotsToRollAmmoAgain && this.randomUtil.getChance100(ModConfig.config.chanceToRollAmmoAgain))
        {
            const weapon = inventoryMagGen.getWeaponTemplate();
            
            const tierInfo = this.apbsTierGetter.getTierByLevel(inventoryMagGen.getBotLevel());
            const ammoTable = this.apbsEquipmentGetter.getAmmoByBotRole(inventoryMagGen.getBotRole(), tierInfo)

            const rerolledAmmo = this.apbsMethodHolder.getWeightedCompatibleAmmo(ammoTable, weapon);

            this.botWeaponGeneratorHelper.addAmmoIntoEquipmentSlots(
                rerolledAmmo,
                bulletCount,
                inventoryMagGen.getPmcInventory()
            );
        }
        
        this.botWeaponGeneratorHelper.addAmmoIntoEquipmentSlots(
            inventoryMagGen.getAmmoTemplate()._id,
            bulletCount,
            inventoryMagGen.getPmcInventory(),
            [EquipmentSlots.TACTICAL_VEST]
        );
    }
}