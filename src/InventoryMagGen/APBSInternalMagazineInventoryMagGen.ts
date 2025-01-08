import { IInventoryMagGen } from "@spt/generators/weapongen/IInventoryMagGen";
import { InventoryMagGen } from "@spt/generators/weapongen/InventoryMagGen";
import { BotWeaponGeneratorHelper } from "@spt/helpers/BotWeaponGeneratorHelper";
import { inject, injectable } from "tsyringe";
import { APBSIInventoryMagGen } from "./APBSIInventoryMagGen";
import { APBSInventoryMagGen } from "./APBSInventoryMagGen";
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { APBSTierGetter } from "../Utils/APBSTierGetter";
import { APBSMethodHolder } from "./APBSMethodHolder";
import { ModConfig } from "../Globals/ModConfig";
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

        
        if (ModConfig.config.enableBotsToRollAmmoAgain && this.randomUtil.getChance100(ModConfig.config.chanceToRollAmmoAgain))
        {
            const weapon = inventoryMagGen.getWeaponTemplate();
            
            const tierInfo = this.apbsTierGetter.getTierByLevel(inventoryMagGen.getBotLevel());
            const ammoTable = this.apbsEquipmentGetter.getAmmoByBotRole(inventoryMagGen.getBotRole(), tierInfo)

            const rerolledAmmo = this.apbsMethodHolder.getWeightedCompatibleAmmo(ammoTable, weapon);

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