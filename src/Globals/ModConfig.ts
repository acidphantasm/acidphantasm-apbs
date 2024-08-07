import { VFS } from "@spt/utils/VFS";
import { container, inject, injectable } from "tsyringe";
import jsonc from "jsonc";
import path from "path";
import { TierInformation } from "./TierInformation";
import { APBSLogger } from "../Utils/APBSLogger";

@injectable()
export class ModConfig
{
    public static config: Config;

    constructor(
        @inject("APBSLogger") protected apbsLogger: APBSLogger,
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
    disableScavTierGeneration: boolean,
    disablePMCTierGeneration: boolean,
    disableBossTierGeneration: boolean,
    disableBossFollowerTierGeneration: boolean,
    disableRaiderRogueTierGeneration: boolean,
    forceStock: boolean,
    forceWeaponModLimits: boolean,
    enableCustomLevelDeltas: boolean,
    tier1LevelDelta: [ number, number ],
    tier2LevelDelta: [ number, number ],
    tier3LevelDelta: [ number, number ],
    tier4LevelDelta: [ number, number ],
    tier5LevelDelta: [ number, number ],
    tier6LevelDelta: [ number, number ],
    tier7LevelDelta: [ number, number ],
}