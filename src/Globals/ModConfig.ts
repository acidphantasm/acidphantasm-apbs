/* eslint-disable @typescript-eslint/naming-convention */
import { FileSystemSync } from "@spt/utils/FileSystemSync";
import { inject, injectable } from "tsyringe";
import path from "path";
import { TierInformation } from "./TierInformation";
import { APBSLogger } from "../Utils/APBSLogger";
import { ILogger } from "@spt/models/spt/utils/ILogger";

@injectable()
export class ModConfig
{
    public static config: Config;
    public static blacklist: Blacklist;

    constructor(
        @inject("APBSLogger") protected apbsLogger: APBSLogger,
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("TierInformation") protected tierInformation: TierInformation,
        @inject("FileSystemSync") protected fileSystemSync: FileSystemSync
    )
    {
        ModConfig.config = this.fileSystemSync.readJson(path.resolve(__dirname, "../../config/config.json"));
        ModConfig.blacklist = this.fileSystemSync.readJson(path.resolve(__dirname, "../../config/blacklists.json"));
    }

    public serverLogDetails(): void
    {
        this.logger.debug("[APBS] Mod Config - FOR SUPPORT FOLKS ❤❤")
        this.logger.debug("[APBS] If any of these values are true, you can send them to me for support regarding bots/bot gen.")
        this.logger.debug(`[APBS] Using a Preset? ${ModConfig.config.usePreset}`)
        this.logger.debug(`[APBS] Mod Weapons: ${ModConfig.config.compatibilityConfig.enableModdedWeapons}`)
        this.logger.debug(`[APBS] Mod Equipment: ${ModConfig.config.compatibilityConfig.enableModdedEquipment}`)
        this.logger.debug(`[APBS] Mod Clothing: ${ModConfig.config.compatibilityConfig.enableModdedClothing}`)
        this.logger.debug(`[APBS] Mod Attachments: ${ModConfig.config.compatibilityConfig.enableModdedAttachments}`)
    }
}
export interface Config
{
    usePreset: boolean,
    presetName: string,
    compatibilityConfig: {
        enableModdedWeapons: boolean,
        enableModdedEquipment: boolean,
        enableModdedClothing: boolean,
        enableModdedAttachments: boolean,
        initalTierAppearance: number,
        pmcWeaponWeights: number,
        scavWeaponWeights: number,
        followerWeaponWeights: number,
        enableSafeGuard: boolean,
        enableMPRSafeGuard: boolean,
        PackNStrap_UnlootablePMCArmbandBelts: boolean,
        Realism_AddGasMasksToBots: boolean,
        General_SecureContainerAmmoStacks: number,
    },
    normalizedHealthPool: NormalizeHealthConfig,
    generalConfig: {
        enablePerWeaponTypeAttachmentChances: boolean,
        enableLargeCapacityMagazineLimit: boolean,
        largeCapacityMagazineCount: number,
        forceStock: boolean,
        stockButtpadChance: number,
        forceDustCover: boolean,
        forceScopeSlot: boolean,
        forceMuzzle: boolean,
        muzzleChance: [ number, number, number, number, number, number, number ],
        forceChildrenMuzzle: boolean,
        forceWeaponModLimits: boolean,
        scopeLimit: number,
        tacticalLimit: number,
        onlyChads: boolean,
        tarkovAndChill: boolean,
        blickyMode: boolean,
        enableT7Thermals: boolean,
        startTier: number,
        plateChances: PlateWeightConfig,
    }
    pmcBots: {
        enable: boolean,
        resourceRandomization: ResourceRandomizationConfig,
        weaponDurability: WeaponDurabilityConfig,
        lootConfig: LootConfig,
        rerollConfig: EnableChance,
        toploadConfig: ToploadConfig,
        questConfig: EnableChance,
        povertyConfig: EnableChance,
        additionalOptions: PMCSpecificConfig,
        secrets: PMCSecrets,
    }
    scavBots: {
        enable: boolean,
        resourceRandomization: ResourceRandomizationConfig,
        weaponDurability: WeaponDurabilityConfig,
        lootConfig: LootConfig,
        rerollConfig: EnableChance,
        toploadConfig: ToploadConfig,
        keyConfig: KeyConfig,
        additionalOptions: ScavSpecificConfig,
    },
    bossBots: {
        enable: boolean,
        resourceRandomization: ResourceRandomizationConfig,
        weaponDurability: WeaponDurabilityConfig,
        lootConfig: LootConfig,
        rerollConfig: EnableChance,
        toploadConfig: ToploadConfig,
    },
    followerBots: {
        enable: boolean,
        resourceRandomization: ResourceRandomizationConfig,
        weaponDurability: WeaponDurabilityConfig,
        lootConfig: LootConfig,
        rerollConfig: EnableChance,
        toploadConfig: ToploadConfig,
    },
    specialBots: {
        enable: boolean,
        resourceRandomization: ResourceRandomizationConfig,
        weaponDurability: WeaponDurabilityConfig,
        lootConfig: LootConfig,
        rerollConfig: EnableChance,
        toploadConfig: ToploadConfig,
    },
    customLevelDeltas: CustomLevelDeltas,
    customScavLevelDeltas: CustomLevelDeltas,
    enableDebugLog: boolean,
    configAppSettings: ConfigAppSettings,
}
export interface Blacklist
{
    weaponBlacklist: TierBlacklistConfig,
    equipmentBlacklist: TierBlacklistConfig,
    ammoBlacklist: TierBlacklistConfig,
    attachmentBlacklist: TierBlacklistConfig,
    clothingBlacklist: TierBlacklistConfig
}
export interface PMCSpecificConfig
{
    enablePrestiging: boolean,
    seasonalPmcAppearance: boolean,
    ammoTierSliding: AmmoTierSlideConfig,
    gameVersionWeighting: GameVersionWeightConfig, 
}
export interface EnableChance
{
    enable: boolean,
    chance: number,
}
export interface ScavSpecificConfig
{
    enableScavAttachmentTiering: boolean,
    enableScavEqualEquipmentTiering: boolean,
}
export interface ResourceRandomizationConfig
{
    enable: boolean,
    foodRateMaxChance: number,
    foodRateUsagePercent: number,
    medRateMaxChance: number,
    medRateUsagePercent: number,
}
export interface WeaponDurabilityConfig
{
    enable: boolean,
    min: number,
    max: number,
    minDelta: number,
    maxDelta: number,
    minLimitPercent: number,
    enhancementChance: number,
}
export interface LootConfig
{
    enable: boolean,
    blacklist: string[],
}
export interface ToploadConfig
{
    enable: boolean,
    chance: number,
    percent: number,
}
export interface KeyConfig
{
    addAllKeysToScavs: boolean,
    addOnlyMechanicalKeysToScavs: boolean,
    addOnlyKeyCardsToScavs: boolean,
}

export interface GameVersionWeightConfig
{
    enable: boolean,
    standard: number, 
    leftBehind: number, 
    prepareForEscape: number, 
    edgeOfDarkness: number, 
    unheardEdition: number,
}
export interface AmmoTierSlideConfig
{
    enable: boolean,
    slideAmount: number,
    slideChance: number,
}
export interface NormalizeHealthConfig
{
    enable: boolean,
    healthHead: number,
    healthChest: number,
    healthStomach: number,
    healthLeftArm: number,
    healthRightArm: number,
    healthLeftLeg: number,
    healthRightLeg: number,
    excludedBots: string[],
    normalizeSkills: boolean,
}

export interface TierBlacklistConfig
{
    tier1Blacklist: string[],
    tier2Blacklist: string[],
    tier3Blacklist: string[],
    tier4Blacklist: string[],
    tier5Blacklist: string[],
    tier6Blacklist: string[],
    tier7Blacklist: string[],
}
export interface CustomLevelDeltas
{
    enable: boolean,
    tier1: {
        min: number,
        max: number,
    }
    tier2: {
        min: number,
        max: number,
    }
    tier3: {
        min: number,
        max: number,
    }
    tier4: {
        min: number,
        max: number,
    }
    tier5: {
        min: number,
        max: number,
    }
    tier6: {
        min: number,
        max: number,
    }
    tier7: {
        min: number,
        max: number,
    }
}
export interface PlateWeightConfig
{
    enable: boolean,
    pmcMainPlateChance: [number, number, number, number, number, number, number],
    pmcSidePlateChance: [number, number, number, number, number, number, number],
    scavMainPlateChance: [number, number, number, number, number, number, number],
    scavSidePlateChance: [number, number, number, number, number, number, number],
    bossMainPlateChance: [number, number, number, number, number, number, number],
    bossSidePlateChance: [number, number, number, number, number, number, number],
    followerMainPlateChance: [number, number, number, number, number, number, number],
    followerSidePlateChance: [number, number, number, number, number, number, number],
    specialMainPlateChance: [number, number, number, number, number, number, number],
    specialSidePlateChance: [number, number, number, number, number, number, number],
}
export interface PMCSecrets
{
    developerSettings: PMCSecretDeveloperSettings
}
export interface PMCSecretDeveloperSettings
{
    devNames: PMCSecretDeveloperNames,
    devLevels: PMCSecretDeveloperLevels,
}
export interface PMCSecretDeveloperNames
{
    enable: boolean,
    nameList: string[],
}
export interface PMCSecretDeveloperLevels
{
    enable: boolean,
    min: number,
    max:  number,
}
export interface ConfigAppSettings
{
    showUndo: boolean,
    showDefault: boolean,
    disableAnimations: boolean,
}