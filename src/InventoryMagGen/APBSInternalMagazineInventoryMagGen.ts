import { BotWeaponGeneratorHelper } from "@spt/helpers/BotWeaponGeneratorHelper";
import { inject, injectable } from "tsyringe";
import { APBSIInventoryMagGen } from "./APBSIInventoryMagGen";
import { APBSInventoryMagGen } from "./APBSInventoryMagGen";
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { APBSTierGetter } from "../Utils/APBSTierGetter";
import { APBSMethodHolder } from "./APBSMethodHolder";
import { RandomUtil } from "@spt/utils/RandomUtil";

@injectable()
export class APBSInternalMagazineInventoryMagGen implements APBSIInventoryMagGen 
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
        return 0;
    }

    public canHandleInventoryMagGen(inventoryMagGen: APBSInventoryMagGen): boolean 
    {
        return inventoryMagGen.getMagazineTemplate()._props.ReloadMagType === "InternalMagazine";
    }

    public process(inventoryMagGen: APBSInventoryMagGen): void 
    {
        let bulletCount = this.botWeaponGeneratorHelper.getRandomizedBulletCount(
            inventoryMagGen.getMagCount(),
            inventoryMagGen.getMagazineTemplate()
        );

        const rerollConfig = inventoryMagGen.getRerollDetails();
        if (rerollConfig.enable && this.randomUtil.getChance100(rerollConfig.chance))
        {
            const weapon = inventoryMagGen.getWeaponTemplate();
            
            const ammoTable = this.apbsEquipmentGetter.getAmmoByBotRole(inventoryMagGen.getBotRole(), inventoryMagGen.getTierNumber())
            const ammoCaliber = inventoryMagGen.getAmmoTemplate()._props.Caliber;

            const rerolledAmmo = this.apbsMethodHolder.apbsGetWeightedCompatibleAmmo(ammoTable, ammoCaliber, weapon);

            if (bulletCount > 20) 
            {
                bulletCount = this.randomUtil.getInt(10, bulletCount);
            }

            this.botWeaponGeneratorHelper.addAmmoIntoEquipmentSlots(
                rerolledAmmo,
                bulletCount,
                inventoryMagGen.getPmcInventory()
            );
        }

        this.botWeaponGeneratorHelper.addAmmoIntoEquipmentSlots(
            inventoryMagGen.getAmmoTemplate()._id,
            bulletCount,
            inventoryMagGen.getPmcInventory()
        );
    }
}