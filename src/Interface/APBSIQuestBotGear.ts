export interface APBSIQuestBotGear
{
    isQuestEnabled: boolean,
    questName: string,
    requiredEquipmentSlots?: string[],
    requiredMap?: string[],
    requiredWeaponModBaseClasses?: string[],
    requiredWeaponMods?: string[],
    Headwear?: string[],
    Earpiece?: string[],
    FaceCover?: string[],
    ArmorVest?: string[],
    Eyewear?: string[],
    TacticalVest?: string[],
    Backpack?: string[],
    PrimaryWeapon?: string[],
    Holster?: string[],
    Scabbard?: string[],
    minLevel: number,
    maxLevel: number,
}

export interface APBSIQuestBotGenerationDetails
{
    isQuesting: boolean,
    questData: APBSIQuestBotGear
}