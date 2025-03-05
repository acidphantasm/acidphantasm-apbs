import { BotWeaponGeneratorHelper } from "@spt/helpers/BotWeaponGeneratorHelper";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { inject, injectable } from "tsyringe";
import { APBSIInventoryMagGen } from "./APBSIInventoryMagGen";
import { APBSInventoryMagGen } from "./APBSInventoryMagGen";

@injectable()
export class APBSBarrelInventoryMagGen implements APBSIInventoryMagGen
{
    constructor(
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("BotWeaponGeneratorHelper") protected botWeaponGeneratorHelper: BotWeaponGeneratorHelper
    ) 
    {}

    getPriority(): number 
    {
        return 50;
    }

    canHandleInventoryMagGen(inventoryMagGen: APBSInventoryMagGen): boolean 
    {
        return inventoryMagGen.getWeaponTemplate()._props.ReloadMode === "OnlyBarrel";
    }

    process(inventoryMagGen: APBSInventoryMagGen): void 
    {
        // Can't be done by _props.ammoType as grenade launcher shoots grenades with ammoType of "buckshot"
        let randomisedAmmoStackSize: number;
        if (inventoryMagGen.getAmmoTemplate()._props.StackMaxRandom === 1) 
        {
            // doesnt stack
            randomisedAmmoStackSize = this.randomUtil.getInt(3, 6);
        }
        else 
        {
            randomisedAmmoStackSize = this.randomUtil.getInt(
                inventoryMagGen.getAmmoTemplate()._props.StackMinRandom,
                inventoryMagGen.getAmmoTemplate()._props.StackMaxRandom
            );
        }

        this.botWeaponGeneratorHelper.addAmmoIntoEquipmentSlots(
            inventoryMagGen.getAmmoTemplate()._id,
            randomisedAmmoStackSize,
            inventoryMagGen.getPmcInventory()
        );
    }
}