import { IChances, IModsChances } from "@spt/models/eft/common/tables/IBotType";

export interface APBSIChances extends IChances
{
    assaultCarbine: IModsChances,
    sniperRifle: IModsChances,
    marksmanRifle: IModsChances,
    assaultRifle: IModsChances,
    machinegun: IModsChances,
    smg: IModsChances,
    handgun: IModsChances,
    revolver: IModsChances,
    shotgun: IModsChances
}