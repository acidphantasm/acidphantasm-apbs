import { inject, injectable } from "tsyringe";
import { BossBots, FollowerBots, PMCBots, ScavBots, SpecialBots, EventBots } from "../Enums/Bots";
import { ModConfig } from "../Globals/ModConfig";
import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";
import { APBSIQuestBotGear } from "../Interface/APBSIQuestBotGear";
import { EquipmentSlots } from "@spt/models/enums/EquipmentSlots";
import { RaidInformation } from "../Globals/RaidInformation";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { BaseClasses } from "@spt/models/enums/BaseClasses";

@injectable()
export class BotQuestHelper
{
    private humanitarianSupplies: APBSIQuestBotGear = {
        isQuestEnabled: true,
        questName: "Humanitarian Supplies",
        requiredEquipmentSlots: [ EquipmentSlots.ARMOR_VEST, EquipmentSlots.HEADWEAR ],
        requiredMap: ["shoreline"],
        Headwear: ["5aa7d03ae5b5b00016327db5"],
        ArmorVest: ["5ab8e4ed86f7742d8e50c7fa"],
        minLevel: 11,
        maxLevel: 21
    }
    private setup: APBSIQuestBotGear = {
        isQuestEnabled: true,
        questName: "Setup",
        requiredEquipmentSlots: [ EquipmentSlots.TACTICAL_VEST, EquipmentSlots.HEADWEAR, "ShortRange" ],
        requiredMap: ["bigmap"],
        PrimaryWeapon: [
            "54491c4f4bdc2db1078b4568",
            "56dee2bdd2720bc8328b4567",
            "606dae0ab0e443224b421bb7",
            "5580223e4bdc2d1c128b457f",
            "64748cb8de82c85eaf0a273a",
            "61f7c9e189e6fb1a5e3ea78d"
        ],
        Headwear: ["59e7708286f7742cbd762753"],
        TacticalVest: [
            "572b7adb24597762ae139821",
            "5fd4c5477a8d854fa0105061"
        ],
        minLevel: 18,
        maxLevel: 28
    }
    private punisherPart1: APBSIQuestBotGear = {
        isQuestEnabled: true,
        questName: "Punisher Part 1",
        requiredEquipmentSlots: [ "ShortRange" ],
        PrimaryWeapon: [
            "5abcbc27d8ce8700182eceeb",
            "59d6088586f774275f37482f",
            "59ff346386f77477562ff5e2",
            "5a0ec13bfcdbcb00165aa685",
            "59e6152586f77473dc057aa1",
            "5ac66d2e5acfc43b321d4b53",
            "5ac66d725acfc43b321d4b60"
        ],
        minLevel: 17,
        maxLevel: 27
    }
    private punisherPart2: APBSIQuestBotGear = {
        isQuestEnabled: false,
        questName: "Punisher Part 2",
        requiredMap: ["rezervbase"],
        requiredWeaponModBaseClasses: [ BaseClasses.SILENCER ],
        minLevel: 18,
        maxLevel: 28
    }
    private punisherPart3: APBSIQuestBotGear = {
        isQuestEnabled: true,
        questName: "Punisher Part 3",
        requiredMap: ["bigmap"],
        requiredEquipmentSlots: ["ShortRange"],
        PrimaryWeapon: [
            "583990e32459771419544dd2",
            "5839a40f24597726f856b511",
            "57dc2fa62459775949412633",
            "628b9c37a733087d0d7fe84b"
        ],
        minLevel: 19,
        maxLevel: 29
    }
    private punisherPart4: APBSIQuestBotGear = {
        isQuestEnabled: true,
        questName: "Punisher Part 4",
        requiredMap: ["lighthouse"],
        requiredEquipmentSlots: [EquipmentSlots.FACE_COVER, EquipmentSlots.TACTICAL_VEST, "ShortRange"],
        PrimaryWeapon: [
            "576165642459773c7a400233",
            "54491c4f4bdc2db1078b4568",
            "5a7828548dc32e5a9c28b516",
            "5e870397991fd70db46995c8",
            "56dee2bdd2720bc8328b4567",
            "5580223e4bdc2d1c128b457f",
            "606dae0ab0e443224b421bb7",
            "60db29ce99594040e04c4a27",
            "6259b864ebedf17603599e88",
            "64748cb8de82c85eaf0a273a",
            "67124dcfa3541f2a1f0e788b",
            "66ffa9b66e19cc902401c5e8"
        ],
        FaceCover: [
            "572b7f1624597762ae139822",
            "5b432f3d5acfc4704b4a1dfb",
            "5fd8d28367cb5e077335170f",
            "5ab8f4ff86f77431c60d91ba",
            "5ab8f39486f7745cd93a1cca",
            "607f201b3c672b3b3a24a800"
        ],
        TacticalVest: [
            "572b7adb24597762ae139821",
            "5fd4c5477a8d854fa0105061"
        ],
        minLevel: 20,
        maxLevel: 30
    }
    private punisherPart5: APBSIQuestBotGear = {
        isQuestEnabled: true,
        questName: "Punisher Part 5",
        requiredEquipmentSlots: [EquipmentSlots.ARMOR_VEST, EquipmentSlots.HEADWEAR],
        ArmorVest: [
            "5648a7494bdc2d9d488b4583",
            "607f20859ee58b18e41ecd90"
        ],
        Headwear: [
            "5aa7cfc0e5b5b00015693143",
            "5a7c4850e899ef00150be885"
        ],
        minLevel: 20,
        maxLevel: 30
    }
    private punisherPart6: APBSIQuestBotGear = {
        isQuestEnabled: true,
        questName: "Punisher Part 6",
        requiredMap: ["bigmap","interchange","laboratory","lighthouse","rezervbase","sandbox","sandbox_high","shoreline","tarkovstreets","woods"],
        requiredEquipmentSlots: ["LongRange"],
        PrimaryWeapon: [
            "5c46fbd72e2216398b5a8c9c"
        ],
        minLevel: 21,
        maxLevel: 31
    }
    private testDrivePart1: APBSIQuestBotGear = {
        isQuestEnabled: false,
        questName: "Test Drive Part 1",
        requiredEquipmentSlots: ["LongRange"],
        requiredWeaponMods: [
            "59bffc1f86f77435b128b872", 
            "59bffbb386f77435b379b9c2", 
            "617151c1d92c473c770214ab", 
            "57c69dd424597774c03b7bbc"
        ],
        PrimaryWeapon: [
            "5aafa857e5b5b00018480968"
        ],
        minLevel: 30,
        maxLevel: 40
    }
    private testDrivePart2: APBSIQuestBotGear = {
        isQuestEnabled: false,
        questName: "Test Drive Part 2",
        requiredMap: ["tarkovstreets"],
        requiredEquipmentSlots: ["ShortRange"],
        requiredWeaponModBaseClasses: [BaseClasses.SILENCER],
        requiredWeaponMods: ["62ff9920fe938a24c90c10d2"],
        PrimaryWeapon: [
            "62e14904c2699c0ec93adc47"
        ],
        minLevel: 30,
        maxLevel: 40
    }
    private testDrivePart3: APBSIQuestBotGear = {
        isQuestEnabled: false,
        questName: "Test Drive Part 3",
        requiredMap: ["lighthouse"],
        requiredEquipmentSlots: ["ShortRange"],
        requiredWeaponModBaseClasses: [BaseClasses.SILENCER],
        requiredWeaponMods: ["5c0517910db83400232ffee5"],
        PrimaryWeapon: [
            "6499849fc93611967b034949"
        ],
        minLevel: 30,
        maxLevel: 40
    }
    private testDrivePart4: APBSIQuestBotGear = {
        isQuestEnabled: false,
        questName: "Test Drive Part 4",
        requiredMap: ["shoreline"],
        requiredEquipmentSlots: ["ShortRange"],
        requiredWeaponMods: ["618a75f0bd321d49084cd399"],
        PrimaryWeapon: [
            "65268d8ecb944ff1e90ea385"
        ],
        minLevel: 40,
        maxLevel: 50
    }
    private testDrivePart5: APBSIQuestBotGear = {
        isQuestEnabled: false,
        questName: "Test Drive Part 5",
        requiredMap: ["factory4_day","factory4_night"],
        requiredEquipmentSlots: ["ShortRange"],
        requiredWeaponMods: [
            "668670432b934a68630a7fe8", 
            "66867310f3734a938b077f79", 
            "655f13e0a246670fb0373245"
        ],
        PrimaryWeapon: [
            "6680304edadb7aa61d00cef0"
        ],
        minLevel: 40,
        maxLevel: 50
    }
    private theGoodTimesPart1: APBSIQuestBotGear = {
        isQuestEnabled: true,
        questName: "The Good Times Part 1",
        requiredMap: ["factory4_day","factory4_night"],
        requiredEquipmentSlots: [EquipmentSlots.ARMOR_VEST, EquipmentSlots.HEADWEAR, "ShortRange"],
        PrimaryWeapon: [
            "5447a9cd4bdc2dbd208b4567"
        ],
        ArmorVest: ["545cdb794bdc2d3a198b456a"],
        Headwear: ["5645bc214bdc2d363b8b4571"],
        minLevel: 30,
        maxLevel: 40
    }
    private dangerousProps: APBSIQuestBotGear = {
        isQuestEnabled: true,
        questName: "Dangerous Props",
        requiredEquipmentSlots: ["ShortRange"],
        PrimaryWeapon: [
            "66ffa9b66e19cc902401c5e8",
            "67124dcfa3541f2a1f0e788b"
        ],
        minLevel: 35,
        maxLevel: 45
    }
    private connectionsUpNorth: APBSIQuestBotGear = {
        isQuestEnabled: false,
        questName: "Connections Up North",
        requiredEquipmentSlots: ["LongRange"],
        requiredWeaponModBaseClasses: [BaseClasses.SPECIAL_SCOPE],
        PrimaryWeapon: [
            "5bfea6e90db834001b7347f3",
            "588892092459774ac91d4b11",
            "55801eed4bdc2d89578b4588",
            "5df24cf80dee1b22f862e9bc",
            "627e14b21713922ded6f2c15"
        ],
        minLevel: 35,
        maxLevel: 45
    }
    private peacekeepingMission: APBSIQuestBotGear = {
        isQuestEnabled: true,
        questName: "Peacekeeping Mission",
        requiredMap: ["bigmap","interchange","sandbox","sandbox_high","shoreline","tarkovstreets","woods"],
        requiredEquipmentSlots: [EquipmentSlots.ARMOR_VEST, EquipmentSlots.HEADWEAR, "ShortRange"],
        PrimaryWeapon: [
            "5447a9cd4bdc2dbd208b4567"
        ],
        Headwear: ["5aa7d03ae5b5b00016327db5"],
        ArmorVest: ["5ab8e4ed86f7742d8e50c7fa"],
        minLevel: 33,
        maxLevel: 43
    }
    private dandies: APBSIQuestBotGear = {
        isQuestEnabled: true,
        questName: "Dandies",
        requiredMap: ["tarkovstreets"],
        requiredEquipmentSlots: [EquipmentSlots.EYEWEAR, EquipmentSlots.HEADWEAR],
        Headwear: ["60bf74184a63fc79b60c57f6"],
        Eyewear: ["5aa2b9aee5b5b00015693121"],
        minLevel: 33,
        maxLevel: 43
    }
    private decontaminationService: APBSIQuestBotGear = {
        isQuestEnabled: true,
        questName: "Decontamination Service",
        requiredMap: ["interchange"],
        requiredEquipmentSlots: [EquipmentSlots.FACE_COVER],
        FaceCover: [
            "59e7715586f7742ee5789605", 
            "5b432c305acfc40019478128", 
            "60363c0c92ec1c31037959f5"
        ],
        minLevel: 35,
        maxLevel: 45
    }

    private availableQuests = [
        this.humanitarianSupplies,
        this.setup,
        this.punisherPart1,
        this.punisherPart2,
        this.punisherPart3,
        this.punisherPart4,
        this.punisherPart5,
        this.punisherPart6,
        this.testDrivePart1,
        this.testDrivePart2,
        this.testDrivePart3,
        this.testDrivePart4,
        this.testDrivePart5,
        this.theGoodTimesPart1,
        this.dangerousProps,
        this.connectionsUpNorth,
        this.peacekeepingMission,
        this.dandies,
        this.decontaminationService

    ]
    constructor(
        @inject("APBSLogger") protected apbsLogger: APBSLogger,
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("RandomUtil") protected randomUtil: RandomUtil
    )
    {}

    public shouldBotHaveQuest(isPMC: boolean) : boolean
    {
        if (!isPMC) return false;

        if (ModConfig.config.pmcBots.questConfig.enable && this.randomUtil.getChance100(ModConfig.config.pmcBots.questConfig.chance))
        {
            return true;
        }
        return false;
    }

    public getQuestFromInternalDatabase(botLevel: number, location: string): APBSIQuestBotGear
    {
        const questArray = this.getValidQuestArray(botLevel, location);
        const chosenQuest = Math.floor(Math.random() * questArray.length);

        return questArray[chosenQuest];
    }

    public getValidQuestArray(botLevel: number, location: string): APBSIQuestBotGear[]
    {
        const questArray: APBSIQuestBotGear[] = [];
        for (const quest in this.availableQuests)
        {
            const questData = this.availableQuests[quest];
            if (!questData.isQuestEnabled) continue;
            if (questData.minLevel <= botLevel && questData.maxLevel >= botLevel)
            {
                if (questData.requiredMap && !questData.requiredMap.includes(location.toLowerCase())) continue;

                questArray.push(questData);
            }
        }
        if (questArray.length == 0)
        {
            // No quests found, return empty array
            return questArray;
        }
        return questArray;
    }

    public isPMC(botType: string): boolean
    {
        botType = botType.toLowerCase();
        return Object.values(PMCBots).includes(botType as PMCBots);
    }
}