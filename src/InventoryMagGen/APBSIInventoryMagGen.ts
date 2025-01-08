import { APBSInventoryMagGen } from "./APBSInventoryMagGen";

export interface APBSIInventoryMagGen 
{
    getPriority(): number;
    canHandleInventoryMagGen(inventoryMagGen: APBSInventoryMagGen): boolean;
    process(inventoryMagGen: APBSInventoryMagGen): void;
}