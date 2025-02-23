export interface APBSIQuestBotGear
{
    isQuestEnabled: boolean,
    questName: string,
    requiredMap: string[],
    requiredWeaponMods: string[],
    requiredWeaponModSlots: string[],
    requiredWeaponModBaseClasses: string[],
    requiredEquipmentSlots: string[],
    Headwear: string[],
    Earpiece: string[],
    FaceCover: string[],
    ArmorVest: string[],
    Eyewear: string[],
    TacticalVest: string[],
    Backpack: string[],
    PrimaryWeapon: string[],
    Holster: string[],
    Scabbard: string[],
    minLevel: number,
    maxLevel: number,
}

export interface APBSIQuestBotGenerationDetails
{
    isQuesting: boolean,
    questData?: APBSIQuestBotGear
}