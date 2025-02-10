using System.ComponentModel;
using System.IO;
using System.Reflection;
using System.Windows.Input;
using Newtonsoft.Json;

namespace APBSConfig.Core
{
    public class ConfigData
    {
        #region PRESETS
        public bool usePreset { get; set; }
        public string? presetName { get; set; }
        #endregion

        #region MODCONFIG
        public bool enableModdedWeapons { get; set; }
        public bool enableModdedEquipment { get; set; }
        public bool enableModdedClothing { get; set; }
        public int initalTierAppearance { get; set; }
        public int pmcWeaponWeights { get; set; }
        public int scavWeaponWeights { get; set; }
        public int followerWeaponWeights { get; set; }
        public bool enableSafeGuard { get; set; }
        public bool enableAddingModdedAttachmentsToVanillaWeapons { get; set; }
        public bool PackNStrap_UnlootablePMCArmbandBelts { get; set; }
        public bool Realism_AddGasMasksToBots { get; set; }
        #endregion

        #region TIERGEN
        public bool enableScavTierGeneration { get; set; }
        public bool enablePMCTierGeneration { get; set; }
        public bool enableBossTierGeneration { get; set; }
        public bool enableBossFollowerTierGeneration { get; set; }
        public bool enableSpecialTierGeneration { get; set; }
        #endregion

        #region BOTCHANGES
        public bool normalizedHealthPoolValues { get; set; }
        public int healthHead { get; set; }
        public int healthChest { get; set; }
        public int healthStomach { get; set; }
        public int healthLeftArm { get; set; }
        public int healthRightArm { get; set; }
        public int healthLeftLeg { get; set; }
        public int healthRightLeg { get; set; }
        public List<string>? excludedBots { get; set; }
        public bool enableBotsToRollAmmoAgain { get; set; }
        public int chanceToRollAmmoAgain { get; set; }
        public bool enablePerWeaponTypeAttachmentChances { get; set; }
        public bool forceStock { get; set; }
        public int stockButtpadChance { get; set; }
        public bool forceDustCover { get; set; }
        public bool forceScopeSlot { get; set; }
        public bool forceMuzzle { get; set; }
        public List<int>? muzzleChance { get; set; }
        public bool forceChildrenMuzzle { get; set; }
        public bool forceWeaponModLimits { get; set; }
        public int scopeLimit { get; set; }
        public int tacticalLimit { get; set; }
        public bool enableT7Thermals { get; set; }
        public int startTier { get; set; }
        public List<int>? scavWeaponDurability { get; set; }
        public List<int>? pmcWeaponDurability { get; set; }
        public List<int>? bossWeaponDurability { get; set; }
        public List<int>? guardWeaponDurability { get; set; }
        public List<int>? raiderWeaponDurability { get; set; }
        public bool enableCustomPlateChances { get; set; }
        public List<int>? scavMainPlateChance { get; set; }
        public List<int>? scavSidePlateChance { get; set; }
        public List<int>? pmcMainPlateChance { get; set; }
        public List<int>? pmcSidePlateChance { get; set; }
        public List<int>? bossMainPlateChance { get; set; }
        public List<int>? bossSidePlateChance { get; set; }
        public List<int>? guardMainPlateChance { get; set; }
        public List<int>? guardSidePlateChance { get; set; }
        public List<int>? raiderMainPlateChance { get; set; }
        public List<int>? raiderSidePlateChance { get; set; }
        public bool enableConsumableResourceRandomization { get; set; }
        public List<int>? scavFoodRates { get; set; }
        public List<int>? scavMedRates { get; set; }
        public List<int>? pmcFoodRates { get; set; }
        public List<int>? pmcMedRates { get; set; }
        public bool enableCustomLevelDeltas { get; set; }
        public List<int>? tier1LevelDelta { get; set; }
        public List<int>? tier2LevelDelta { get; set; }
        public List<int>? tier3LevelDelta { get; set; }
        public List<int>? tier4LevelDelta { get; set; }
        public List<int>? tier5LevelDelta { get; set; }
        public List<int>? tier6LevelDelta { get; set; }
        public List<int>? tier7LevelDelta { get; set; }
        public bool enableScavCustomLevelDeltas { get; set; }
        public List<int>? tier1ScavLevelDelta { get; set; }
        public List<int>? tier2ScavLevelDelta { get; set; }
        public List<int>? tier3ScavLevelDelta { get; set; }
        public List<int>? tier4ScavLevelDelta { get; set; }
        public List<int>? tier5ScavLevelDelta { get; set; }
        public List<int>? tier6ScavLevelDelta { get; set; }
        public List<int>? tier7ScavLevelDelta { get; set; }
        #endregion

        #region GENERAL
        public bool onlyChads { get; set; }
        public bool tarkovAndChill {  get; set; }
        public bool blickyMode { get; set; }
        public bool enableDebugLog { get; set; }
        #endregion

        #region PMC-ONLY
        public bool seasonalPmcAppearance { get; set; }
        public bool gameVersionWeight { get; set; }
        public int standard { get; set; }
        public int left_behind { get; set; }
        public int prepare_for_escape { get; set; }
        public int edge_of_darkness { get; set; }
        public int unheard_edition { get; set; }
        public bool enablePMCAmmoTierSliding { get; set; }
        public int slideAmount { get; set; }
        public int slideChance { get; set; }
        public bool pmcLoot { get; set; }
        public List<string>? pmcLootBlacklistItems { get; set; }
        #endregion

        #region SCAV-ONLY
        public bool scavLoot { get; set; }
        public bool enableScavAttachmentTiering { get; set; }
        public bool enableScavEqualEquipmentTiering { get; set; }
        public bool addAllKeysToScavs { get; set; }
        public bool addOnlyMechanicalKeysToScavs { get; set; }
        public bool addOnlyKeyCardsToScavs { get; set; }
        #endregion

        #region BLACKLIST
        public List<string>? tier1AmmoBlacklist { get; set; }
        public List<string>? tier2AmmoBlacklist { get; set; }
        public List<string>? tier3AmmoBlacklist { get; set; }
        public List<string>? tier4AmmoBlacklist { get; set; }
        public List<string>? tier5AmmoBlacklist { get; set; }
        public List<string>? tier6AmmoBlacklist { get; set; }
        public List<string>? tier7AmmoBlacklist { get; set; }
        public List<string>? tier1EquipmentBlacklist { get; set; }
        public List<string>? tier2EquipmentBlacklist { get; set; }
        public List<string>? tier3EquipmentBlacklist { get; set; }
        public List<string>? tier4EquipmentBlacklist { get; set; }
        public List<string>? tier5EquipmentBlacklist { get; set; }
        public List<string>? tier6EquipmentBlacklist { get; set; }
        public List<string>? tier7EquipmentBlacklist { get; set; }
        public List<string>? tier1WeaponBlacklist { get; set; }
        public List<string>? tier2WeaponBlacklist { get; set; }
        public List<string>? tier3WeaponBlacklist { get; set; }
        public List<string>? tier4WeaponBlacklist { get; set; }
        public List<string>? tier5WeaponBlacklist { get; set; }
        public List<string>? tier6WeaponBlacklist { get; set; }
        public List<string>? tier7WeaponBlacklist { get; set; }
        public List<string>? tier1AttachmentBlacklist { get; set; }
        public List<string>? tier2AttachmentBlacklist { get; set; }
        public List<string>? tier3AttachmentBlacklist { get; set; }
        public List<string>? tier4AttachmentBlacklist { get; set; }
        public List<string>? tier5AttachmentBlacklist { get; set; }
        public List<string>? tier6AttachmentBlacklist { get; set; }
        public List<string>? tier7AttachmentBlacklist { get; set; }
        #endregion
    }
    public class DataLoader
    {
        private static readonly string directory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location) ?? "";

        public static ConfigData Data { get; set; } = default!;
        public static bool initialLoad = false;
        public static bool LoadJson()
        {
            var path = Path.Combine(directory, "./config/config.json");

            try
            {
                Data = JsonConvert.DeserializeObject<ConfigData>(File.ReadAllText(path)) ?? default!;
                return true;
            }
            catch
            {
                return false;
            }
        }
        public static bool SaveJson()
        {
            var path = Path.Combine(directory, "./config/config.json");

            try
            {
                File.WriteAllText(path, JsonConvert.SerializeObject(Data, Formatting.Indented));
                return true;
            }
            catch
            {
                return false;
            }            
        }
    }
}
