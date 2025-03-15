import { inject, injectable } from "tsyringe";

import { BotGenerator } from "@spt/generators/BotGenerator";
import { BotGeneratorHelper } from "@spt/helpers/BotGeneratorHelper";
import { BotHelper } from "@spt/helpers/BotHelper";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";
import { IPmcData } from "@spt/models/eft/common/IPmcData";
import { IBotInfoSettings } from "@spt/models/eft/common/tables/IBotBase";
import { IBotType } from "@spt/models/eft/common/tables/IBotType";
import { MemberCategory } from "@spt/models/enums/MemberCategory";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { SaveServer } from "@spt/servers/SaveServer";
import { BotLootCacheService } from "@spt/services/BotLootCacheService";
import { DatabaseService } from "@spt/services/DatabaseService";
import { FenceService } from "@spt/services/FenceService";
import { LocalisationService } from "@spt/services/LocalisationService";
import { HashUtil } from "@spt/utils/HashUtil";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { ICloner } from "@spt/utils/cloners/ICloner";
import { PlayerScavGenerator } from "@spt/generators/PlayerScavGenerator";
import { APBSBotLootCacheService } from "./APBSBotLootCacheService";

@injectable()
export class APBSPlayerScavGenerator extends PlayerScavGenerator
{
    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("BotGeneratorHelper") protected botGeneratorHelper: BotGeneratorHelper,
        @inject("SaveServer") protected saveServer: SaveServer,
        @inject("ProfileHelper") protected profileHelper: ProfileHelper,
        @inject("BotHelper") protected botHelper: BotHelper,
        @inject("FenceService") protected fenceService: FenceService,
        @inject("BotLootCacheService") protected botLootCacheService: BotLootCacheService,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("BotGenerator") protected botGenerator: BotGenerator,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("PrimaryCloner") protected cloner: ICloner,
        @inject("APBSBotLootCacheService") protected apbsBotLootCacheService: APBSBotLootCacheService
    )
    {
        super(logger, 
            randomUtil, 
            databaseService, 
            hashUtil, 
            itemHelper,
            botGeneratorHelper, 
            saveServer, 
            profileHelper, 
            botHelper,
            fenceService, 
            botLootCacheService, 
            localisationService,
            botGenerator,
            configServer, 
            cloner)
    }

    public override generate(sessionID: string): IPmcData 
    {
        // get karma level from profile
        const profile = this.saveServer.getProfile(sessionID);
        const profileCharactersClone = this.cloner.clone(profile.characters);
        const pmcDataClone = profileCharactersClone.pmc;
        const existingScavDataClone = profileCharactersClone.scav;

        const scavKarmaLevel = this.getScavKarmaLevel(pmcDataClone);

        // use karma level to get correct karmaSettings
        const playerScavKarmaSettings = this.playerScavConfig.karmaLevel[scavKarmaLevel];
        if (!playerScavKarmaSettings) 
        {
            this.logger.error(this.localisationService.getText("scav-missing_karma_settings", scavKarmaLevel));
        }

        this.logger.debug(`generated player scav loadout with karma level ${scavKarmaLevel}`);

        // Edit baseBotNode values
        const baseBotNode: IBotType = this.constructBotBaseTemplate(playerScavKarmaSettings.botTypeForLoot);
        this.adjustBotTemplateWithKarmaSpecificSettings(playerScavKarmaSettings, baseBotNode);

        let scavData = this.botGenerator.generatePlayerScav(
            sessionID,
            playerScavKarmaSettings.botTypeForLoot.toLowerCase(),
            "easy",
            baseBotNode,
            pmcDataClone
        );

        // Remove cached bot data after scav was generated
        this.botLootCacheService.clearCache();
        this.apbsBotLootCacheService.apbsClearCache();

        // Add scav metadata
        scavData.savage = undefined;
        scavData.aid = pmcDataClone.aid;
        scavData.TradersInfo = pmcDataClone.TradersInfo;
        scavData.Info.Settings = {} as IBotInfoSettings;
        scavData.Info.Bans = [];
        scavData.Info.RegistrationDate = pmcDataClone.Info.RegistrationDate;
        scavData.Info.GameVersion = pmcDataClone.Info.GameVersion;
        scavData.Info.MemberCategory = MemberCategory.UNIQUE_ID;
        scavData.Info.lockedMoveCommands = true;
        scavData.RagfairInfo = pmcDataClone.RagfairInfo;
        scavData.UnlockedInfo = pmcDataClone.UnlockedInfo;

        // Persist previous scav data into new scav
        scavData._id = existingScavDataClone._id ?? pmcDataClone.savage;
        scavData.sessionId = existingScavDataClone.sessionId ?? pmcDataClone.sessionId;
        scavData.Skills = this.getScavSkills(existingScavDataClone);
        scavData.Stats = this.getScavStats(existingScavDataClone);
        scavData.Info.Level = this.getScavLevel(existingScavDataClone);
        scavData.Info.Experience = this.getScavExperience(existingScavDataClone);
        scavData.Quests = existingScavDataClone.Quests ?? [];
        scavData.TaskConditionCounters = existingScavDataClone.TaskConditionCounters ?? {};
        scavData.Notes = existingScavDataClone.Notes ?? { Notes: [] };
        scavData.WishList = existingScavDataClone.WishList ?? {};
        scavData.Encyclopedia = pmcDataClone.Encyclopedia ?? {};

        // Add additional items to player scav as loot
        this.addAdditionalLootToPlayerScavContainers(playerScavKarmaSettings.lootItemsToAddChancePercent, scavData, [
            "TacticalVest",
            "Pockets",
            "Backpack"
        ]);

        // Remove secure container
        scavData = this.profileHelper.removeSecureContainer(scavData);

        // Set cooldown timer
        scavData = this.setScavCooldownTimer(scavData, pmcDataClone);

        // Add scav to the profile
        this.saveServer.getProfile(sessionID).characters.scav = scavData;

        return scavData;
    }
}