import { IGenerateEquipmentProperties } from "@spt/models/spt/bots/IGenerateEquipmentProperties";
import { IBotData } from "@spt/models/spt/bots/IGenerateWeaponRequest";

export interface APBSIGenerateEquipmentProperties extends IGenerateEquipmentProperties
{
    botData: APBSIBotData
}

export interface APBSIBotData extends IBotData
{
    tier: number
}