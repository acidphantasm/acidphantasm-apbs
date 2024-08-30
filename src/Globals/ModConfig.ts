import { VFS } from "@spt/utils/VFS";
import { container, inject, injectable } from "tsyringe";
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

    public setModConfiguration(): void
    {
        if (ModConfig.config.enableCustomLevelDeltas)
        {
            this.setTierLevelDeviation();
        }
        this.logger.debug(`[APBS] Mod Config - FOR SUPPORT FOLKS ❤❤`)
        this.logger.debug(`[APBS] Import Mod Weapons: ${ModConfig.config.enableModdedWeapons} <- MUST BE FALSE FOR SUPPORT`)
        this.logger.debug(`[APBS] Import Mod Equipment: ${ModConfig.config.enableModdedEquipment} <- MUST BE FALSE FOR SUPPORT`)
    }

    private setTierLevelDeviation(): void
    {
        this.tierInformation.tiers[0].botMinLevelVariance = ModConfig.config.tier1LevelDelta[0]
        this.tierInformation.tiers[0].botMaxLevelVariance = ModConfig.config.tier1LevelDelta[1]

        this.tierInformation.tiers[1].botMinLevelVariance = ModConfig.config.tier2LevelDelta[0]
        this.tierInformation.tiers[1].botMaxLevelVariance = ModConfig.config.tier2LevelDelta[1]

        this.tierInformation.tiers[2].botMinLevelVariance = ModConfig.config.tier3LevelDelta[0]
        this.tierInformation.tiers[2].botMaxLevelVariance = ModConfig.config.tier3LevelDelta[1]

        this.tierInformation.tiers[3].botMinLevelVariance = ModConfig.config.tier4LevelDelta[0]
        this.tierInformation.tiers[3].botMaxLevelVariance = ModConfig.config.tier4LevelDelta[1]

        this.tierInformation.tiers[4].botMinLevelVariance = ModConfig.config.tier5LevelDelta[0]
        this.tierInformation.tiers[4].botMaxLevelVariance = ModConfig.config.tier5LevelDelta[1]

        this.tierInformation.tiers[5].botMinLevelVariance = ModConfig.config.tier6LevelDelta[0]
        this.tierInformation.tiers[5].botMaxLevelVariance = ModConfig.config.tier6LevelDelta[1]

        this.tierInformation.tiers[6].botMinLevelVariance = ModConfig.config.tier7LevelDelta[0]
        this.tierInformation.tiers[6].botMaxLevelVariance = ModConfig.config.tier7LevelDelta[1]
    }
}

export interface Config
{
    enableModdedWeapons: boolean,
    enableModdedEquipment: boolean,
    enableModdedClothing: boolean,
    initalTierAppearance: number,
    onlyChads: boolean,
    tarkovAndChill: boolean,
    blickyMode: boolean,
    disableScavTierGeneration: boolean,
    disablePMCTierGeneration: boolean,
    disableBossTierGeneration: boolean,
    disableBossFollowerTierGeneration: boolean,
    disableRaiderRogueTierGeneration: boolean,
    enablePMCAmmoTierSliding: boolean,
    slideAmount: number,
    slideChance: number,
    forceStock: boolean,
    forceDustCover: boolean,
    forceScopeSlot: boolean,
    pmcLoot: boolean,
    scavLoot: boolean,
    bossesHaveLegaMedals: boolean,
    legaMedalChance: number,
    enableScavAttachmentTiering: boolean,
    forceWeaponModLimits: boolean,
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
    scavFoodFullChance: number,
    scavMedFullChance: number,
    pmcFoodFullChance: number,
    pmcMedFullChance: number,
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
    enableCustomLevelDeltas: boolean,
    tier1LevelDelta: [ number, number ],
    tier2LevelDelta: [ number, number ],
    tier3LevelDelta: [ number, number ],
    tier4LevelDelta: [ number, number ],
    tier5LevelDelta: [ number, number ],
    tier6LevelDelta: [ number, number ],
    tier7LevelDelta: [ number, number ],
    enableDebugLog: boolean,
}