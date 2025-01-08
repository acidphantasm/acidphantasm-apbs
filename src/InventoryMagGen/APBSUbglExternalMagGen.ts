import { IInventoryMagGen } from "@spt/generators/weapongen/IInventoryMagGen";
import { InventoryMagGen } from "@spt/generators/weapongen/InventoryMagGen";
import { BotWeaponGeneratorHelper } from "@spt/helpers/BotWeaponGeneratorHelper";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { EquipmentSlots } from "@spt/models/enums/EquipmentSlots";
import { inject, injectable } from "tsyringe";
import { APBSIInventoryMagGen } from "./APBSIInventoryMagGen";
import { APBSInventoryMagGen } from "./APBSInventoryMagGen";

@injectable()
export class APBSUbglExternalMagGen implements APBSIInventoryMagGen 
{
    constructor(@inject("BotWeaponGeneratorHelper") protected botWeaponGeneratorHelper: BotWeaponGeneratorHelper) 
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
        this.botWeaponGeneratorHelper.addAmmoIntoEquipmentSlots(
            inventoryMagGen.getAmmoTemplate()._id,
            bulletCount,
            inventoryMagGen.getPmcInventory(),
            [EquipmentSlots.TACTICAL_VEST]
        );
    }
}