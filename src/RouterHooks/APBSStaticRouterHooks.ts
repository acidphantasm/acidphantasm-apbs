import { inject, injectable } from "tsyringe";
import { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { WeatherGenerator } from "@spt/generators/WeatherGenerator";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";

import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";
import { RaidInformation } from "../Globals/RaidInformation";
import { ModInformation } from "../Globals/ModInformation";
import { APBSTester } from "../Utils/APBSTester";
import { DatabaseService } from "@spt/services/DatabaseService";

@injectable()
export class APBSStaticRouterHooks
{
    private grenadeList = [
        "5710c24ad2720bc3458b45a3", 
        "58d3db5386f77426186285a0", 
        "618a431df1eb8e24b8741deb", 
        "5448be9a4bdc2dfd2f8b456a", 
        "5e32f56fcb6d5863cc5e5ee4", 
        "5e340dcdcb6d5863cc5e5efb", 
        "617fd91e5539a84ec44ce155"
    ]

    constructor(
        @inject("StaticRouterModService") protected staticRouterService: StaticRouterModService,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("APBSLogger") protected apbsLogger: APBSLogger,
        @inject("WeatherGenerator") protected weatherGenerator: WeatherGenerator,
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("ModInformation") protected modInformation: ModInformation,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("APBSTester") protected apbsTester: APBSTester,
        @inject("ProfileHelper") protected profileHelper: ProfileHelper
    )
    {}

    public registerRouterHooks(): void
    {
        this.staticRouterService.registerStaticRouter(
            "APBS-BotGenerationRouter",
            [
                {
                    url: "/client/game/bot/generate",
                    action: async (url, info, sessionId, output) => 
                    {
                        try 
                        {
                            const outputJSON = JSON.parse(output);
                            if (outputJSON.data?.length)
                            {
                                this.logBotGeneration(outputJSON);
                            }
                        }
                        catch (err) 
                        {
                            this.apbsLogger.log(Logging.WARN, "Bot Router hook failed.\n", `${err.stack}`);
                        }
                        return output;
                    }
                }
            ],
            "APBS"
        );
        this.apbsLogger.log(Logging.DEBUG, "Bot Generation Router registered");
        this.staticRouterService.registerStaticRouter(
            "APBS-StartMatchRouter",
            [
                {
                    url: "/client/match/local/start",
                    action: async (url, info, sessionId, output) => 
                    {
                        this.raidInformation.sessionId = sessionId;
                        try 
                        {
                            this.logLocation(info);
                            if (this.modInformation.testMode && this.modInformation.clearAssortPreRaid)
                            {
                                const tables = this.databaseService.getTables();
                                this.apbsTester.clearAssort(tables.traders[this.modInformation.testTrader]);
                            }
                        }
                        catch (err) 
                        {
                            this.apbsLogger.log(Logging.WARN, "Match Start Router hook failed.\n", `${err.stack}`);
                        }
                        return output;
                    }
                }
            ],
            "APBS"
        );
        this.apbsLogger.log(Logging.DEBUG, "Match Start Router registered");
        this.staticRouterService.registerStaticRouter(
            "APBS-GameStartRouter",
            [
                {
                    url: "/client/game/start",
                    action: async (url, info, sessionId, output) => 
                    {
                        try 
                        {
                            const fullProfile = this.profileHelper.getFullProfile(sessionId);
                            this.raidInformation.freshProfile = (fullProfile.info.wipe === true) ? true : false;
                        }
                        catch (err) 
                        {
                            this.apbsLogger.log(Logging.WARN, "Game Start Router hook failed.\n", `${err.stack}`);
                        }
                        return output;
                    }
                }
            ],
            "APBS"
        );
        this.apbsLogger.log(Logging.DEBUG, "Game Start Router registered");
        this.staticRouterService.registerStaticRouter(
            "APBS-ProfileStatusChecker",
            [
                {
                    url: "/client/profile/status",
                    action: async (url, info, sessionId, output) => 
                    {
                        try 
                        {
                            const fullProfile = this.profileHelper.getFullProfile(sessionId);
                            this.raidInformation.freshProfile = (fullProfile.info.wipe === true) ? true : false;
                        }
                        catch (err) 
                        {
                            this.apbsLogger.log(Logging.WARN, "Profile Status Router hook failed.\n", `${err.stack}`);
                        }
                        return output;
                    }
                }
            ],
            "APBS"
        );
        this.apbsLogger.log(Logging.DEBUG, "Profile Status Router registered");
    }
    
    private logLocation(info: any):void
    {
        this.raidInformation.location = info.location;
        const gameTime = this.weatherGenerator.calculateGameTime({ acceleration: 0, time: "", date: "", weather: undefined, season: 1 }).time;

        if (info.timeVariant === "PAST") this.raidInformation.currentTime = this.parseTime(gameTime, 12, info.location)
        if (info.timeVariant === "CURR") this.raidInformation.currentTime = this.parseTime(gameTime, 0, info.location)
        this.raidInformation.nightTime = this.isNight(this.raidInformation.currentTime);

        this.apbsLogger.log(Logging.WARN, "---Raid Information---");
        this.apbsLogger.log(Logging.WARN, `Location: ${this.raidInformation.location}`);
        this.apbsLogger.log(Logging.WARN, `Time: ${this.raidInformation.currentTime}`);
        this.apbsLogger.log(Logging.WARN, `Night: ${this.raidInformation.nightTime}`);
    }

    private parseTime(time, hourDiff, location) 
    {
        if (location == "factory4_night")
        {
            return "03:28"
        }
        else if (location == "factory4_day" || location == "laboratory")
        {
            return "15:28"
        }
        else
        {
            const [hours, minutes] = time.split(":");
            if (hourDiff == 12 && parseInt(hours) >= 12)
            {
                return `${Math.abs(parseInt(hours) - hourDiff)}:${minutes}`
            }
            if (hourDiff == 12 && parseInt(hours) < 12)
            {
                return `${Math.abs(parseInt(hours) + hourDiff)}:${minutes}`
            }
            return `${hours}:${minutes}`
        }
    }
    
    private isNight(time) 
    {
        const [hours, minutes] = time.split(":");
        if (parseInt(hours) >= 5 && parseInt(hours) < 20)
        {
            return false;
        }
        else 
        {
            return true;
        }
    }

    private logBotGeneration(outputJSON: any): void
    {
        const start = performance.now()

        const botDetails = this.getBotDetails(outputJSON);
        const logMessages = this.getLogMessage(botDetails);

        try 
        {
            switch (outputJSON.data[0].Info.Settings.Role) 
            {
                case "pmcBEAR":
                case "pmcUSEC":
                    this.apbsLogger.log( 
                        Logging.PMC,
                        "-----------------------------------------------------Bot spawned from cache-----------------------------------------------------",
                        `| ${logMessages[0]}`,
                        `| ${logMessages[1]}`,
                        `| ${logMessages[2]} ${logMessages[3]}`
                    );
                    break;
                case "cursedassault":
                case "marksman":
                case "assault":
                    this.apbsLogger.log(
                        Logging.SCAV,
                        "-----------------------------------------------------Bot spawned from cache-----------------------------------------------------",
                        `| ${logMessages[0]}`,
                        `| ${logMessages[1]}`,
                        `| ${logMessages[2]} ${logMessages[3]}`
                    );
                    break;
                case "arenaFighterEvent":
                case "arenaFighter":
                case "exUsec":
                case "pmcbot":
                    this.apbsLogger.log(
                        Logging.RAIDER,
                        "-----------------------------------------------------Bot spawned from cache-----------------------------------------------------",
                        `| ${logMessages[0]}`,
                        `| ${logMessages[1]}`,
                        `| ${logMessages[2]} ${logMessages[3]}`
                    );
                    break;
                case "bossBully":
                case "bossTagilla":
                case "bossPartisan":
                case "bossGluhar":
                case "bossKilla":
                case "bossKojaniy":
                case "bossSanitar":
                case "bossKnight":
                case "bossZryachiy":
                case "bossTest":
                case "bossKolontay":
                case "bossBoar":
                case "bossBoarSniper":
                case "bosslegion":
                case "bosspunisher":
                case "followerBully":
                case "followerGluharAssault":
                case "followerGluharScout":
                case "followerGluharSecurity":
                case "followerGluharSnipe":
                case "followerKojaniy":
                case "followerSanitar":
                case "followerTagilla":
                case "followerBirdEye":
                case "followerBigPipe":
                case "followerZryachiy":
                case "followerTest":
                case "followerBoar":
                case "sectantPriest":
                case "sectantWarrior":
                case "followerBoarClose1":
                case "followerBoarClose2":
                case "followerKolontayAssault":
                case "followerKolontaySecurity":
                    this.apbsLogger.log( 
                        Logging.BOSS,
                        "-----------------------------------------------------Bot spawned from cache-----------------------------------------------------",
                        `| ${logMessages[0]}`,
                        `| ${logMessages[1]}`,
                        `| ${logMessages[2]} ${logMessages[3]}`
                    );
                    break;
                case "shooterBTR":
                case "skier":
                case "peacemaker":
                case "gifter":
                case "infectedAssault":
                case "infectedCivil":
                case "infectedLaborant":
                case "infectedPmc":
                case "infectedTagilla":
                    this.apbsLogger.log( 
                        Logging.EVENT,
                        "-----------------------------------------------------Bot spawned from cache-----------------------------------------------------",
                        `| ${logMessages[0]}`,
                        `| ${logMessages[1]}`,
                        `| ${logMessages[2]} ${logMessages[3]}`
                    );
                    break;
                default:
                    this.apbsLogger.log(
                        Logging.DEBUG,
                        "-----------------------------------------------------Bot spawned from cache-----------------------------------------------------",
                        `| ${logMessages[0]}`,
                        `| ${logMessages[1]}`,
                        `| ${logMessages[2]} ${logMessages[3]}`
                    );
                    break;
            }
        }
        catch (err) 
        {
            this.apbsLogger.log(Logging.ERR, "Bot Generation LogOutput failed.", `${err.stack}`);
        }
        const timeTaken = performance.now() - start;
        this.apbsLogger.log(Logging.DEBUG, `${timeTaken.toFixed(2)}ms for logging bot ${botDetails.role} | Name: ${botDetails.name}`);
    }

    private getBotDetails (detailsJSON: any): any
    {
        let primaryID;
        let primaryCaliberID;
        let secondaryID;
        let secondaryCaliberID;
        let holsterID;
        let holsterCaliberID;
        let helmetID;
        let nvgID;
        let earProID;
        let armourVestID;
        let frontPlateID;
        let backPlateID;
        let lSidePlateID;
        let rSidePlateID;
        let scabbardID;

        let canHavePlates = false;

        const botDetails = detailsJSON.data[0].Inventory.items;

        let grenadeCount = 0;
        for (const item in botDetails) 
        {
            if (this.grenadeList.includes(botDetails[item]._tpl)) grenadeCount++;
        }

        const primaryWeapon = botDetails.find(e => e.slotId === "FirstPrimaryWeapon");
        if (typeof primaryWeapon !== "undefined") 
        {
            primaryID = this.itemHelper.getItemName(primaryWeapon._tpl);
            const primaryCaliber = botDetails.find(e => e.slotId === "patron_in_weapon" && e.parentId == primaryWeapon._id);
            if (typeof primaryCaliber !== "undefined") 
            {
                primaryCaliberID = this.itemHelper.getItemName(primaryCaliber._tpl);
            }
        }

        const secondaryWeapon = botDetails.find(e => e.slotId === "SecondPrimaryWeapon");
        if (typeof secondaryWeapon !== "undefined") 
        {
            secondaryID = this.itemHelper.getItemName(secondaryWeapon._tpl);
            const secondaryCaliber = botDetails.find(e => e.slotId === "patron_in_weapon" && e.parentId == secondaryWeapon._id);
            if (typeof secondaryCaliber !== "undefined") 
            {
                secondaryCaliberID = this.itemHelper.getItemName(secondaryCaliber._tpl);
            }
        }

        const holster = botDetails.find(e => e.slotId === "Holster");
        if (typeof holster !== "undefined") 
        {
            holsterID = this.itemHelper.getItemName(holster._tpl);
            const holsterCaliber = botDetails.find(e => e.slotId === "patron_in_weapon" && e.parentId == holster._id);
            if (typeof holsterCaliber !== "undefined") 
            {
                holsterCaliberID = this.itemHelper.getItemName(holsterCaliber._tpl);
            }
        }

        const helmet = botDetails.find(e => e.slotId === "Headwear");
        if (typeof helmet !== "undefined") 
        {
            helmetID = this.itemHelper.getItemName(helmet._tpl);
        }

        const nvg = botDetails.find(e => e.slotId === "mod_nvg" && "upd" in e);
        if (typeof nvg !== "undefined") 
        {
            nvgID = this.itemHelper.getItemName(nvg._tpl);
        }

        const earPro = botDetails.find(e => e.slotId === "Earpiece");
        if (typeof earPro !== "undefined") 
        {
            earProID = this.itemHelper.getItemName(earPro._tpl);
        }

        const scabbard = botDetails.find(e => e.slotId === "Scabbard");
        if (typeof scabbard !== "undefined") 
        {
            scabbardID = this.itemHelper.getItemName(scabbard._tpl);
        }

        const armourVest = botDetails.find(e => e.slotId === "ArmorVest") ?? botDetails.find(e => e.slotId === "TacticalVest");
        if (typeof armourVest !== "undefined") 
        {
            armourVestID = this.itemHelper.getItem(armourVest._tpl);
            if (armourVestID[1]._props.Slots[0])
            {
                canHavePlates = true;
                const frontPlate = botDetails.find(e => e.slotId === "Front_plate" && e.parentId == armourVest._id);
                const backPlate = botDetails.find(e => e.slotId === "Back_plate" && e.parentId == armourVest._id);
                const lSidePlate = botDetails.find(e => e.slotId === "Left_side_plate" && e.parentId == armourVest._id);
                const rSidePlate = botDetails.find(e => e.slotId === "Right_side_plate" && e.parentId == armourVest._id);
                if (typeof frontPlate !== "undefined")
                {
                    frontPlateID = this.itemHelper.getItem(frontPlate._tpl)
                    frontPlateID = frontPlateID[1]._props.armorClass;
                }
                if (typeof backPlate !== "undefined")
                {
                    backPlateID = this.itemHelper.getItem(backPlate._tpl)
                    backPlateID = backPlateID[1]._props.armorClass;
                }
                if (typeof lSidePlate !== "undefined")
                {
                    lSidePlateID = this.itemHelper.getItem(lSidePlate._tpl)
                    lSidePlateID = lSidePlateID[1]._props.armorClass;
                }
                if (typeof rSidePlate !== "undefined")
                {
                    rSidePlateID = this.itemHelper.getItem(rSidePlate._tpl)
                    rSidePlateID = rSidePlateID[1]._props.armorClass;
                }
            }
            armourVestID = this.itemHelper.getItemName(armourVest._tpl);
        }

        return {
            tier: detailsJSON.data[0].Info.Tier,
            name: detailsJSON.data[0].Info.Nickname, 
            level: detailsJSON.data[0].Info.Level, 
            gameVersion: detailsJSON.data[0].Info.GameVersion, 
            role: detailsJSON.data[0].Info.Settings.Role, 
            side: detailsJSON.data[0].Info.Side,
            difficulty: detailsJSON.data[0].Info.Settings.BotDifficulty,
            primaryID,
            primaryCaliberID,
            secondaryID,
            secondaryCaliberID,
            holsterID,
            holsterCaliberID,
            helmetID,
            nvgID,
            earProID,
            canHavePlates,
            armourVestID,
            frontPlateID,
            backPlateID,
            lSidePlateID,
            rSidePlateID,
            scabbardID,
            grenadeCount
        }
    }

    private getLogMessage(botDetails: any): any
    {
        const removeNoneValues = value =>
            !["None"].some(element => value.includes(element));

        const removeNonArmouredRigs = value =>
            !["Armour/Rig:"].some(element => value.includes(element));

        let realMessage1;
        let realMessage2;
        let realMessage3;
        let realMessage4;

        let temporaryMessage1: string[] = [
            `Tier: ${botDetails.tier}`,
            `Role: ${botDetails.role}`,
            `Nickname: ${botDetails.name}`,
            `Level: ${botDetails.level}`,
            `Difficulty: ${botDetails.difficulty}`,
            `GameVersion: ${botDetails.gameVersion ?? "None" }`,
            `Grenades: ${botDetails.grenadeCount >= 1 ? botDetails.grenadeCount : "None" }`
        ];
        let temporaryMessage2: string[] = [
            `Primary: ${botDetails.primaryID ?? "None" }`,
            `Primary Caliber: ${botDetails.primaryCaliberID ?? "None" }`,
            `Secondary: ${botDetails.secondaryID ?? "None" }`,
            `Secondary Caliber: ${botDetails.secondaryCaliberID ?? "None" }`,
            `Holster: ${botDetails.holsterID ?? "None" }`,
            `Holster Caliber: ${botDetails.holsterCaliberID ?? "None" }`,
            `Melee: ${botDetails.scabbardID ?? "None" }`
        ];
        let temporaryMessage3: string[] = [
            `Helmet: ${botDetails.helmetID ?? "None" }`,
            `NVG: ${botDetails.nvgID ?? "None" }`,
            `Ears: ${botDetails.earProID ?? "None" }`,
            `Armour/Rig: ${botDetails.armourVestID ?? "None" }`
        ];
        let temporaryMessage4: string[] = [
            "| Plates:",
            `Front [${botDetails.frontPlateID ?? "None" }]`,
            `Back [${botDetails.backPlateID ?? "None" }]`,
            `Left [${botDetails.lSidePlateID ?? "None" }]`,
            `Right [${botDetails.rSidePlateID ?? "None" }]`
        ]
        
        temporaryMessage1 = temporaryMessage1.filter(removeNoneValues)
        if (temporaryMessage1?.length) 
        {
            realMessage1 = temporaryMessage1.filter(Boolean).join(" | ");
        }
        realMessage1 = realMessage1 ?? "No Bot Details";

        temporaryMessage2 = temporaryMessage2.filter(removeNoneValues)
        if (temporaryMessage2?.length) 
        {
            realMessage2 = temporaryMessage2.filter(Boolean).join(" | ");
        }
        realMessage2 = realMessage2 ?? "No Weapon Details";

        if (!botDetails.canHavePlates)
        {
            temporaryMessage3 = temporaryMessage3.filter(removeNonArmouredRigs)
        }
        temporaryMessage3 = temporaryMessage3.filter(removeNoneValues)
        if (temporaryMessage3?.length) 
        {
            
            realMessage3 = temporaryMessage3.filter(Boolean).join(" | ");
        }
        realMessage3 = realMessage3 ?? "No Gear Details";

        temporaryMessage4 = temporaryMessage4.filter(removeNoneValues)
        if (temporaryMessage4?.length > 1) 
        {
            realMessage4 = temporaryMessage4.filter(Boolean).join(" ");
        }
        realMessage4 = realMessage4 ?? " ";

        return [
            realMessage1,
            realMessage2,
            realMessage3,
            realMessage4
        ]
    }
}