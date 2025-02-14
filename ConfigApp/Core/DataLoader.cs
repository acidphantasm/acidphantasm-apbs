using System.Collections.ObjectModel;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Runtime.Serialization;
using System.Windows.Input;
using System.Windows.Media.TextFormatting;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;

namespace APBSConfig.Core
{
    public class BotData
    {
        public bool enable {  get; set; }
        public required ResourceRandomizationConfig resourceRandomization { get; set; }
        public required WeaponDurabilityConfig weaponDurability { get; set; }
        public required LootConfig lootConfig { get; set; }
    }
    public class PMCBotData
    {
        public bool enable { get; set; }
        public required ResourceRandomizationConfig resourceRandomization { get; set; }
        public required WeaponDurabilityConfig weaponDurability { get; set; }
        public required LootConfig lootConfig { get; set; }
        public required PMCSpecificConfig additionalOptions { get; set; }
        public required PMCSecrets secrets { get; set; }
    }
    public class ScavBotData
    {
        public bool enable { get; set; }
        public required ResourceRandomizationConfig resourceRandomization { get; set; }
        public required WeaponDurabilityConfig weaponDurability { get; set; }
        public required LootConfig lootConfig { get; set; }
        public required KeyConfig keyConfig { get; set; }
        public required ScavSpecificConfig additionalOptions { get; set; }

    }

    public class APBSServerConfig
    {
        #region PRESETS
        public bool usePreset { get; set; }
        public required string presetName { get; set; }
        #endregion

        #region MOD COMPATIBILITY
        public required ModCompatibilityConfig compatibilityConfig { get; set; }
        #endregion

        #region NORMALIZE-HEALTH-POOL
        public required NormalizeHealthConfig normalizedHealthPool { get; set; }
        #endregion

        #region GENERAL CONFIG
        public required GeneralConfig generalConfig { get; set; }
        #endregion

        #region PMC-ONLY
        public required PMCBotData pmcBots { get; set; }
        #endregion

        #region SCAV-ONLY
        public required ScavBotData scavBots { get; set; }
        #endregion

        #region BOSS-ONLY
        public required BotData bossBots { get; set; }
        #endregion

        #region FOLLOWER-ONLY
        public required BotData followerBots { get; set; }
        #endregion

        #region SPECIAL-ONLY
        public required BotData specialBots { get; set; }
        #endregion

        #region BLACKLISTS
        public required TierBlacklistConfig weaponBlacklist { get; set; }
        public required TierBlacklistConfig equipmentBlacklist { get; set; }
        public required TierBlacklistConfig ammoBlacklist { get; set; }
        public required TierBlacklistConfig attachmentBlacklist { get; set; }
        #endregion

        #region LEVEL DELTAS
        public required CustomLevelDelta customLevelDeltas { get; set; }
        public required CustomLevelDelta customScavLevelDeltas { get; set; }
        #endregion

        #region DEBUG LOG
        public bool enableDebugLog { get; set; }
        #endregion
        public required ConfigAppSettings configAppSettings { get; set; }
    }
    public class PMCSpecificConfig
    {
        public bool seasonalPmcAppearance { get; set; }
        public required AmmoTierSlideConfig ammoTierSliding { get; set; }
        public required GameVersionWeightConfig gameVersionWeighting { get; set; }

    }
    public class ScavSpecificConfig
    {
        public bool enableScavAttachmentTiering { get; set; }
        public bool enableScavEqualEquipmentTiering { get; set; }
    }
    public class ResourceRandomizationConfig
    {
        public required bool enable { get; set; }
        public required int foodRateMaxChance { get; set; }
        public required int foodRateUsagePercent { get; set; }
        public required int medRateMaxChance { get; set; }
        public required int medRateUsagePercent { get; set; }
    }
    public class WeaponDurabilityConfig
    {
        public bool enable { get; set; }
        public int min { get; set; }
        public int max { get; set; }
        public int minDelta { get; set; }
        public int maxDelta { get; set; }
        public int minLimitPercent { get; set; }
    }
    public class LootConfig
    {
        public bool enable { get; set; }
        public required List<string> blacklist { get; set; }
    }
    public class KeyConfig
    {
        public bool addAllKeysToScavs { get; set; }
        public bool addOnlyMechanicalKeysToScavs { get; set; }
        public bool addOnlyKeyCardsToScavs { get; set; }
    }
    public class GeneralConfig
    {
        public bool enableBotsToRollAmmoAgain { get; set; }
        public int chanceToRollAmmoAgain { get; set; }
        public bool enablePerWeaponTypeAttachmentChances { get; set; }
        public bool forceStock { get; set; }
        public int stockButtpadChance { get; set; }
        public bool forceDustCover { get; set; }
        public bool forceScopeSlot { get; set; }
        public bool forceMuzzle { get; set; }
        public required List<int> muzzleChance { get; set; }
        public bool forceChildrenMuzzle { get; set; }
        public bool forceWeaponModLimits { get; set; }
        public int scopeLimit { get; set; }
        public int tacticalLimit { get; set; }
        public bool onlyChads { get; set; }
        public bool tarkovAndChill { get; set; }
        public bool blickyMode { get; set; }
        public bool enableT7Thermals { get; set; }
        public int startTier { get; set; }
        public required PlateWeightConfig plateChances { get; set; }
    }
    public class PlateWeightConfig
    {
        public bool enable { get; set; }
        public required List<int> pmcMainPlateChance { get; set; }
        public required List<int> pmcSidePlateChance { get; set; }
        public required List<int> scavMainPlateChance { get; set; }
        public required List<int> scavSidePlateChance { get; set; }
        public required List<int> bossMainPlateChance { get; set; }
        public required List<int> bossSidePlateChance { get; set; }
        public required List<int> followerMainPlateChance { get; set; }
        public required List<int> followerSidePlateChance { get; set; }
        public required List<int> specialMainPlateChance { get; set; }
        public required List<int> specialSidePlateChance { get; set; }
    }
    public class AmmoTierSlideConfig
    {
        public bool enable { get; set; }
        public int slideAmount { get; set; }
        public int slideChance { get; set; }
    }
    public class GameVersionWeightConfig
    {
        public bool enable { get; set; }
        public int standard { get; set; }
        public int leftBehind { get; set; }
        public int prepareForEscape { get; set; }
        public int edgeOfDarkness { get; set; }
        public int unheardEdition { get; set; }
    }
    public class NormalizeHealthConfig
    {
        public bool enable { get; set; }
        public int healthHead { get; set; }
        public int healthChest { get; set; }
        public int healthStomach { get; set; }
        public int healthLeftArm { get; set; }
        public int healthRightArm { get; set; }
        public int healthLeftLeg { get; set; }
        public int healthRightLeg { get; set; }
        public required List<string> excludedBots { get; set; }
    }
    public class TierBlacklistConfig
    {
        public required List<string> tier1Blacklist { get; set; }
        public required List<string> tier2Blacklist { get; set; }
        public required List<string> tier3Blacklist { get; set; }
        public required List<string> tier4Blacklist { get; set; }
        public required List<string> tier5Blacklist { get; set; }
        public required List<string> tier6Blacklist { get; set; }
        public required List<string> tier7Blacklist { get; set; }
    }
    public class CustomLevelDelta
    {
        public bool enable { get; set; }
        public required MinMax tier1 { get; set; }
        public required MinMax tier2 { get; set; }
        public required MinMax tier3 { get; set; }
        public required MinMax tier4 { get; set; }
        public required MinMax tier5 { get; set; }
        public required MinMax tier6 { get; set; }
        public required MinMax tier7 { get; set; }
    }
    public class MinMax
    {
        public int min { get; set; }
        public int max { get; set; }
    }

    public class ModCompatibilityConfig
    {
        public bool enableModdedWeapons { get; set; }
        public bool enableModdedEquipment { get; set; }
        public bool enableModdedClothing { get; set; }
        public bool enableModdedAttachments { get; set; }
        public int initalTierAppearance { get; set; }
        public int pmcWeaponWeights { get; set; }
        public int scavWeaponWeights { get; set; }
        public int followerWeaponWeights { get; set; }
        public bool enableSafeGuard { get; set; }
        public bool PackNStrap_UnlootablePMCArmbandBelts { get; set; }
        public bool Realism_AddGasMasksToBots { get; set; }
    }

    public class PMCSecrets
    {
        public required DeveloperSettings developerSettings { get; set; }
    }
    public class DeveloperSettings
    {
        public required DeveloperNames devNames { get; set; }
        public required DeveloperLevels devLevels { get; set; }

    }
    public class DeveloperNames
    {
        public bool enable { get; set; }
        public required List<string> nameList { get; set; }
    }

    public class DeveloperLevels
    {
        public bool enable { get; set; }
        public int min { get; set; }
        public int max { get; set; }
    }
        public class ConfigAppSettings
    {
        public bool showUndo { get; set; }
        public bool showDefault { get; set; }
    }
    public class PMCSecretLevels
    {
        public bool enable { get; set; }
        public int min { get; set; }
        public int max { get; set; }
    }

public class DataLoader
    {
        private static readonly string directory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location) ?? "";

        public static APBSServerConfig Data { get; set; } = default!;
        public static APBSServerConfig OriginalConfig { get; set; } = default!;
        public static bool initialLoad = false;
        public static bool LoadJson()
        {
            if (directory != null)
            {
                var path = Path.Combine(directory, "./config/config.json");

                try
                {
                    Data = JsonConvert.DeserializeObject<APBSServerConfig>(File.ReadAllText(path)) ?? default!;

                    // Reserialize Data into temporary object to reset OriginalConfig to current loaded config
                    string serializedData = JsonConvert.SerializeObject(Data);
                    OriginalConfig = JsonConvert.DeserializeObject<APBSServerConfig>(serializedData)!;

                    return true;
                }
                catch
                {
                    return false;
                }
            }
            return false;
        }
        public static bool SaveJson()
        {

            if (directory != null)
            {
                var path = Path.Combine(directory, "./config/config.json");

                try
                {
                    File.WriteAllText(path, JsonConvert.SerializeObject(Data, Formatting.Indented));

                    // Reserialize Data into temporary object to reset OriginalConfig to current loaded config
                    string serializedData = JsonConvert.SerializeObject(Data);
                    OriginalConfig = JsonConvert.DeserializeObject<APBSServerConfig>(serializedData)!;

                    return true;
                }
                catch
                {
                    return false;
                }
            }
            return false;
        }
    }
}
