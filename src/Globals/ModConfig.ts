/* eslint-disable @typescript-eslint/naming-convention */
import { VFS } from "@spt/utils/VFS";
import { inject, injectable } from "tsyringe";
import jsonc from "jsonc";
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
        ModConfig.config = jsonc.parse(this.vfs.readFile(path.resolve(__dirname, "../../config/config.jsonc")));
    }

    public serverLogDetails(): void
    {
        this.logger.debug("[APBS] Mod Config - FOR SUPPORT FOLKS ❤❤")
        this.logger.debug(`[APBS] Import Mod Weapons: ${ModConfig.config.enableModdedWeapons} <- MUST BE FALSE FOR SUPPORT`)
        this.logger.debug(`[APBS] Import Mod Equipment: ${ModConfig.config.enableModdedEquipment} <- MUST BE FALSE FOR SUPPORT`)
        this.logger.debug(`[APBS] Import Mod Clothing: ${ModConfig.config.enableModdedClothing} <- MUST BE FALSE FOR SUPPORT`)
    }
}

export interface Config
{
    usePreset: boolean,
    presetName: string,
    enableModdedWeapons: boolean,
    enableModdedEquipment: boolean,
    enableModdedClothing: boolean,
    initalTierAppearance: number,
    pmcWeaponWeights: number,
    scavWeaponWeights: number,
    followerWeaponWeights: number,
    enableSafeGuard: boolean,
    seasonalPmcAppearance: boolean,
    disableRealismGasMasks: boolean,
    onlyChads: boolean,
    tarkovAndChill: boolean,
    blickyMode: boolean,
    disableScavTierGeneration: boolean,
    disablePMCTierGeneration: boolean,
    disableBossTierGeneration: boolean,
    disableBossFollowerTierGeneration: boolean,
    disableRaiderRogueTierGeneration: boolean,
    gameVersionWeight: boolean, 
    standard: number, 
    left_behind: number, 
    prepare_for_escape: number, 
    edge_of_darkness: number, 
    unheard_edition: number,
    enablePMCAmmoTierSliding: boolean,
    slideAmount: number,
    slideChance: number,
    enablePerWeaponTypeAttachmentChances: boolean,
    forceStock: boolean,
    stockButtpadChance: number,
    forceDustCover: boolean,
    forceScopeSlot: boolean,
    forceMuzzle: boolean,
    muzzleChance: [ number, number, number, number, number, number, number ],
    forceChildrenMuzzle: boolean,
    pmcLoot: boolean,
    scavLoot: boolean,
    enableScavAttachmentTiering: boolean,
    enableScavEqualEquipmentTiering: boolean,
    forceWeaponModLimits: boolean,
    scopeLimit: number,
    tacticalLimit: number,
    enableT7Thermals: boolean,
    startTier: number,
    scavWeaponDurability: [ number, number, number, number ],
    pmcWeaponDurability: [ number, number, number, number ],
    bossWeaponDurability: [ number, number, number, number ],
    guardWeaponDurability: [ number, number, number, number ],
    raiderWeaponDurability: [ number, number, number, number ],
    enableCustomPlateChances: boolean,
    scavMainPlateChance: [ number, number, number, number, number, number, number ],
    scavSidePlateChance: [ number, number, number, number, number, number, number ],
    pmcMainPlateChance: [ number, number, number, number, number, number, number ],
    pmcSidePlateChance: [ number, number, number, number, number, number, number ],
    bossMainPlateChance: [ number, number, number, number, number, number, number ],
    bossSidePlateChance: [ number, number, number, number, number, number, number ],
    guardMainPlateChance: [ number, number, number, number, number, number, number ],
    guardSidePlateChance: [ number, number, number, number, number, number, number ],
    raiderMainPlateChance: [ number, number, number, number, number, number, number ],
    raiderSidePlateChance: [ number, number, number, number, number, number, number ],
    addAllKeysToScavs: boolean,
    addOnlyMechanicalKeysToScavs: boolean,
    addOnlyKeyCardsToScavs: boolean,
    enableConsumableResourceRandomization: boolean,
    scavFoodRates: [ number, number ]
    scavMedRates: [ number, number ]
    pmcFoodRates: [ number, number ]
    pmcMedRates: [ number, number ]
    tier1AmmoBlacklist: string[],
    tier2AmmoBlacklist: string[],
    tier3AmmoBlacklist: string[],
    tier4AmmoBlacklist: string[],
    tier5AmmoBlacklist: string[],
    tier6AmmoBlacklist: string[],
    tier7AmmoBlacklist: string[],
    tier1EquipmentBlacklist: string[],
    tier2EquipmentBlacklist: string[],
    tier3EquipmentBlacklist: string[],
    tier4EquipmentBlacklist: string[],
    tier5EquipmentBlacklist: string[],
    tier6EquipmentBlacklist: string[],
    tier7EquipmentBlacklist: string[],
    tier1WeaponBlacklist: string[],
    tier2WeaponBlacklist: string[],
    tier3WeaponBlacklist: string[],
    tier4WeaponBlacklist: string[],
    tier5WeaponBlacklist: string[],
    tier6WeaponBlacklist: string[],
    tier7WeaponBlacklist: string[],
    tier1AttachmentBlacklist: string[],
    tier2AttachmentBlacklist: string[],
    tier3AttachmentBlacklist: string[],
    tier4AttachmentBlacklist: string[],
    tier5AttachmentBlacklist: string[],
    tier6AttachmentBlacklist: string[],
    tier7AttachmentBlacklist: string[],
    enableCustomLevelDeltas: boolean,
    tier1LevelDelta: [ number, number ],
    tier2LevelDelta: [ number, number ],
    tier3LevelDelta: [ number, number ],
    tier4LevelDelta: [ number, number ],
    tier5LevelDelta: [ number, number ],
    tier6LevelDelta: [ number, number ],
    tier7LevelDelta: [ number, number ],
    enableScavCustomLevelDeltas: boolean,
    tier1ScavLevelDelta: [ number, number ],
    tier2ScavLevelDelta: [ number, number ],
    tier3ScavLevelDelta: [ number, number ],
    tier4ScavLevelDelta: [ number, number ],
    tier5ScavLevelDelta: [ number, number ],
    tier6ScavLevelDelta: [ number, number ],
    tier7ScavLevelDelta: [ number, number ],
    enableDebugLog: boolean,
}