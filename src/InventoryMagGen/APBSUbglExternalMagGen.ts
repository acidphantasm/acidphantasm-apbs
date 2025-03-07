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
        
        const rerollConfig = inventoryMagGen.getRerollDetails();
        if (rerollConfig.enable && this.randomUtil.getChance100(rerollConfig.chance))
        {
            const weapon = inventoryMagGen.getWeaponTemplate();
            
            const ammoTable = this.apbsEquipmentGetter.getAmmoByBotRole(inventoryMagGen.getBotRole(), inventoryMagGen.getTierNumber())
            const ammoTemplate = inventoryMagGen.getAmmoTemplate();
            const ammoCaliber = ammoTemplate._props.Caliber;

            const rerolledAmmo = this.apbsMethodHolder.apbsGetWeightedCompatibleAmmo(ammoTable, ammoCaliber, weapon);

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