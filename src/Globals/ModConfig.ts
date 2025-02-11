/* eslint-disable @typescript-eslint/naming-convention */
import { VFS } from "@spt/utils/VFS";
import { inject, injectable } from "tsyringe";
import { jsonc } from "jsonc";
import path from "path";
import { TierInformation } from "./TierInformation";
import { APBSLogger } from "../Utils/APBSLogger";
import { ILogger } from "@spt/models/spt/utils/ILogger";

@injectable()
export class ModConfig
{
    public static config: Config;

    constructor(
        @inject("APBSLogger") protected apbsLogger: APBSLogger,
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("TierInformation") protected tierInformation: TierInformation,
        @inject("VFS") protected vfs: VFS
    )
    {
        ModConfig.config = jsonc.parse(this.vfs.readFile(path.resolve(__dirname, "../../config/config.json")));
    }

    public serverLogDetails(): void
    {
        this.logger.debug("[APBS] Mod Config - FOR SUPPORT FOLKS ❤❤")
        this.logger.debug(`[APBS] Using a Preset? ${ModConfig.config.usePreset} <- MUST BE FALSE FOR SUPPORT`)
        this.logger.debug(`[APBS] Mod Weapons: ${ModConfig.config.compatibilityConfig.enableModdedWeapons} <- MUST BE FALSE FOR SUPPORT`)
        this.logger.debug(`[APBS] Mod Equipment: ${ModConfig.config.compatibilityConfig.enableModdedEquipment} <- MUST BE FALSE FOR SUPPORT`)
        this.logger.debug(`[APBS] Mod Clothing: ${ModConfig.config.compatibilityConfig.enableModdedClothing} <- MUST BE FALSE FOR SUPPORT`)
        this.logger.debug(`[APBS] Mod Attachments: ${ModConfig.config.compatibilityConfig.enableModdedAttachments} <- MUST BE FALSE FOR SUPPORT`)
        this.logger.debug(`[APBS] Seasonal PMC Clothing: ${ModConfig.config.pmcBots.additionalOptions.seasonalPmcAppearance} <- IF TRUE, Mod Clothing not used`)
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
        PackNStrap_UnlootablePMCArmbandBelts: boolean,
        Realism_AddGasMasksToBots: boolean,
    },
    normalizedHealthPool: NormalizeHealthConfig,
    generalConfig: {
        enableBotsToRollAmmoAgain: boolean,
        chanceToRollAmmoAgain: number,
        onlyChads: boolean,
        tarkovAndChill: boolean,
        blickyMode: boolean,
        enablePerWeaponTypeAttachmentChances: boolean,
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
        enableT7Thermals: boolean,
        startTier: number,
        plateChances: PlateWeightConfig,
    }
    pmcBots: {
        enable: boolean,
        resourceRandomization: ResourceRandomizationConfig,
        weaponDurability: WeaponDurabilityConfig,
        lootConfig: LootConfig,
        additionalOptions: PMCSpecificConfig,
    }
    scavBots: {
        enable: boolean,
        resourceRandomization: ResourceRandomizationConfig,
        weaponDurability: WeaponDurabilityConfig,
        lootConfig: LootConfig,
        keyConfig: KeyConfig,
        additionalOptions: ScavSpecificConfig,
    },
    bossBots: {
        enable: boolean,
        resourceRandomization: ResourceRandomizationConfig,
        weaponDurability: WeaponDurabilityConfig,
        lootConfig: LootConfig
    },
    followerBots: {
        enable: boolean,
        resourceRandomization: ResourceRandomizationConfig,
        weaponDurability: WeaponDurabilityConfig,
        lootConfig: LootConfig
    },
    specialBots: {
        enable: boolean,
        resourceRandomization: ResourceRandomizationConfig,
        weaponDurability: WeaponDurabilityConfig,
        lootConfig: LootConfig
    },
    weaponBlacklist: TierBlacklistConfig,
    equipmentBlacklist: TierBlacklistConfig,
    ammoBlacklist: TierBlacklistConfig,
    attachmentBlacklist: TierBlacklistConfig,
    customLevelDeltas: CustomLevelDeltas,
    customScavLevelDeltas: CustomLevelDeltas,
    enableDebugLog: boolean,
}
export interface PMCSpecificConfig
{
    seasonalPmcAppearance: boolean,
    ammoTierSliding: AmmoTierSlideConfig,
    gameVersionWeighting: GameVersionWeightConfig, 
}
export interface ScavSpecificConfig
{
    enableScavAttachmentTiering: boolean,
    enableScavEqualEquipmentTiering: boolean
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
    min: number,
    max: number,
    minDelta: number,
    maxDelta: number,
    minLimitPercent: number,
}
export interface LootConfig
{
    enable: boolean,
    blacklist: string[],
}
export interface KeyConfig
{
    addAllKeysToScavs: boolean,
    addOnlyMechanicalKeysToScavs: boolean,
    addOnlyKeyCardsToScavs: boolean
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
}

export interface TierBlacklistConfig
{
    tier1Blacklist: string[]
    tier2Blacklist: string[]
    tier3Blacklist: string[]
    tier4Blacklist: string[]
    tier5Blacklist: string[]
    tier6Blacklist: string[]
    tier7Blacklist: string[]
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
    pmcMainPlateChance: [number, number, number, number, number, number, number]
    pmcSidePlateChance: [number, number, number, number, number, number, number]
    scavMainPlateChance: [number, number, number, number, number, number, number]
    scavSidePlateChance: [number, number, number, number, number, number, number]
    bossMainPlateChance: [number, number, number, number, number, number, number]
    bossSidePlateChance: [number, number, number, number, number, number, number]
    followerMainPlateChance: [number, number, number, number, number, number, number]
    followerSidePlateChance: [number, number, number, number, number, number, number]
    specialMainPlateChance: [number, number, number, number, number, number, number]
    specialSidePlateChance: [number, number, number, number, number, number, number]
}