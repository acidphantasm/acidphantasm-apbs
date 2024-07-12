/* eslint-disable @typescript-eslint/brace-style */
import { StaticRouterModService } from "@spt/services/mod/staticRouter/StaticRouterModService";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { APBSLogger } from "../Utils/apbsLogger";
import { Logging } from "../Enums/Logging";
import { ILogger } from "@spt/models/spt/utils/ILogger";

export class BotStaticRouterHook
{
    private staticRouterService: StaticRouterModService;
    private itemHelper: ItemHelper;
    private apbsLogger: APBSLogger;
    private logger: ILogger;

    constructor(
        staticRouterService: StaticRouterModService, 
        itemHelper: ItemHelper,
        apbsLogger: APBSLogger,
        logger: ILogger
    )
    {
        this.staticRouterService = staticRouterService;
        this.itemHelper = itemHelper;
        this.apbsLogger = apbsLogger;
        this.logger = logger;
    }

    public registerRouterHook(): void
    {
        let routerHitCount = 0;
        this.staticRouterService.registerStaticRouter(
            "APBS-BotGenerationRouter",
            [
                {
                    url: "/client/game/bot/generate",
                    action: async (url, info, sessionId, output) => {
                        try {
                            if (routerHitCount >= 1) {
                                this.logOutput(output);
                            }
                        } catch (err) {
                            this.apbsLogger.log(this.logger, Logging.WARN, "Bot Router hook failed. Disable Logging to remove this message if intentional.", `${err.stack}`);
                        }
                        routerHitCount++;
                        return output;
                    }
                }
            ],
            "spt"
        );
        this.staticRouterService.registerStaticRouter(
            "APBS-EndRaidStateRouter",
            [
                {
                    url: "/singleplayer/settings/raid/endstate",
                    action: async (url, info, sessionId, output) => {
                        routerHitCount = 0;
                        return output;
                    }
                }
            ],
            "spt"
        );
    }

    public logOutput(output: any):void
    {
        const start = performance.now()
        const outputJson = JSON.parse(output);
        const botDetails = this.getBotDetails(JSON.parse(output))
        const primaryId = this.itemHelper.getItemName(botDetails.primaryID) ?? "None" ;
        const primaryCaliberID = this.itemHelper.getItemName(botDetails.primaryCaliberID) ?? "" ;
        const secondaryID = this.itemHelper.getItemName(botDetails.secondaryID) ?? "None" ;
        const secondaryCaliberID = this.itemHelper.getItemName(botDetails.secondaryCaliberID) ?? "" ;
        const holsterID = this.itemHelper.getItemName(botDetails.holsterID) ?? "None" ;
        const holsterCaliberID = this.itemHelper.getItemName(botDetails.holsterCaliberID) ?? "" ;
        const helmetID = this.itemHelper.getItemName(botDetails.helmetID) ?? "None" ;
        const earProID = this.itemHelper.getItemName(botDetails.earProID) ?? "None" ;
        const armourVestID = this.itemHelper.getItemName(botDetails.armourVestID) ?? "None" ;
        const frontPlateID = botDetails.frontPlateID ?? "0" ;
        const backPlateID = botDetails.backPlateID ?? "0" ;
        const lSidePlateID = botDetails.lSidePlateID ?? "0" ;
        const rSidePlateID = botDetails.rSidePlateID ?? "0" ;

        try {
            switch (outputJson["data"][0].Info.Settings.Role) {
                case "pmcBEAR":
                case "pmcUSEC":
                    this.apbsLogger.log(this.logger, 
                        Logging.PMC,
                        "-----------------------------------------------------Bot spawned from cache-----------------------------------------------------",
                        `       Nickname: ${botDetails.name} | Level: ${botDetails.level} | Account: ${botDetails.gameVersion} | Role: ${botDetails.role} | Difficulty: ${botDetails.difficulty}`,
                        `       Primary: ${primaryId} ${primaryCaliberID} | Secondary: ${secondaryID} ${secondaryCaliberID} | Holster: ${holsterID} ${holsterCaliberID}`,
                        `       Helmet: ${helmetID} | EarsPro: ${earProID} | Vest/Armour: ${armourVestID} | Front Plate: ${frontPlateID} | Back Plate: ${backPlateID} | Side Plates: ${lSidePlateID} & ${rSidePlateID}`
                    );
                    break;
                case "cursedassault":
                case "marksman":
                case "assault":
                    this.apbsLogger.log(this.logger, 
                        Logging.SCAV,
                        "-----------------------------------------------------Bot spawned from cache-----------------------------------------------------",
                        `       Nickname: ${botDetails.name} | Level: ${botDetails.level} | Role: ${botDetails.role} | Difficulty: ${botDetails.difficulty}`,
                        `       Primary: ${primaryId} ${primaryCaliberID} | Secondary: ${secondaryID} ${secondaryCaliberID} | Holster: ${holsterID} ${holsterCaliberID}`,
                        `       Helmet: ${helmetID} | EarsPro: ${earProID} | Vest/Armour: ${armourVestID} | Front Plate: ${frontPlateID} | Back Plate: ${backPlateID} | Side Plates: ${lSidePlateID} & ${rSidePlateID}`
                    );
                    break;
                case "exUsec":
                    this.apbsLogger.log(this.logger, 
                        Logging.RAIDER,
                        "-----------------------------------------------------Bot spawned from cache-----------------------------------------------------",
                        `       Nickname: ${botDetails.name} | Level: ${botDetails.level} | Role: ${botDetails.role} | Difficulty: ${botDetails.difficulty}`,
                        `       Primary: ${primaryId} ${primaryCaliberID} | Secondary: ${secondaryID} ${secondaryCaliberID} | Holster: ${holsterID} ${holsterCaliberID}`,
                        `       Helmet: ${helmetID} | EarsPro: ${earProID} | Vest/Armour: ${armourVestID} | Front Plate: ${frontPlateID} | Back Plate: ${backPlateID} | Side Plates: ${lSidePlateID} & ${rSidePlateID}`
                    );
                    break;
                case "bossBully":
                case "bossTagilla":
                case "bossGluhar":
                case "bossKilla":
                case "bossKojaniy":
                case "bossSanitar":
                case "bossKnight":
                case "bossZryachiy":
                case "bossTest":
                case "bossKolontay":
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
                case "bossBoar":
                case "bossBoarSniper":
                case "followerBoarClose1":
                case "followerBoarClose2":
                case "followerKolontayAssault":
                case "followerKolontaySecurity":
                    this.apbsLogger.log(this.logger, 
                        Logging.BOSS,
                        "-----------------------------------------------------Bot spawned from cache-----------------------------------------------------",
                        `       Nickname: ${botDetails.name} | Level: ${botDetails.level} | Role: ${botDetails.role} | Difficulty: ${botDetails.difficulty}`,
                        `       Primary: ${primaryId} ${primaryCaliberID} | Secondary: ${secondaryID} ${secondaryCaliberID} | Holster: ${holsterID} ${holsterCaliberID}`,
                        `       Helmet: ${helmetID} | EarsPro: ${earProID} | Vest/Armour: ${armourVestID} | Front Plate: ${frontPlateID} | Back Plate: ${backPlateID} | Side Plates: ${lSidePlateID} & ${rSidePlateID}`
                    );
                    break;
                default:
                    this.apbsLogger.log(this.logger, 
                        Logging.DEBUG,
                        "-----------------------------------------------------Bot spawned from cache-----------------------------------------------------",
                        `       Nickname: ${botDetails.name} | Level: ${botDetails.level} | Role: ${botDetails.role} | Difficulty: ${botDetails.difficulty}`,
                        `       Primary: ${primaryId} ${primaryCaliberID} | Secondary: ${secondaryID} ${secondaryCaliberID} | Holster: ${holsterID} ${holsterCaliberID}`,
                        `       Helmet: ${helmetID} | EarsPro: ${earProID} | Vest/Armour: ${armourVestID} | Front Plate: ${frontPlateID} | Back Plate: ${backPlateID} | Side Plates: ${lSidePlateID} & ${rSidePlateID}`
                    );
                    break;
            }
        } catch (err) {
            this.apbsLogger.log(this.logger, Logging.ERR, "Bot Generation LogOutput failed.", `${err.stack}`);
        }
        const timeTaken = performance.now() - start;
        this.apbsLogger.log(this.logger, Logging.DEBUG, `Time Taken for bot ${botDetails.name} to log: ${timeTaken}`);
    }

    public getBotDetails (detailsJSON: any): any
    {
        let primaryID;
        let primaryCaliberID;
        let secondaryID;
        let secondaryCaliberID;
        let holsterID;
        let holsterCaliberID;
        let helmetID;
        let earProID;
        let armourVestID;
        let frontPlateID;
        let backPlateID;
        let lSidePlateID;
        let rSidePlateID;

        let tempIdHolder;

        const botDetails = detailsJSON["data"][0].Inventory.items;

        const primaryWeapon = botDetails.find(e => e.slotId === "FirstPrimaryWeapon");
        if (typeof primaryWeapon !== "undefined") {
            primaryID = primaryWeapon._tpl;
            const primaryCaliber = botDetails.find(e => e.slotId === "patron_in_weapon" && e.parentId == primaryWeapon._id);
            if (typeof primaryCaliber !== "undefined") {
                primaryCaliberID = primaryCaliber._tpl;
            }
        }

        const secondaryWeapon = botDetails.find(e => e.slotId === "SecondPrimaryWeapon");
        if (typeof secondaryWeapon !== "undefined") {
            secondaryID = secondaryWeapon._tpl;
            const secondaryCaliber = botDetails.find(e => e.slotId === "patron_in_weapon" && e.parentId == secondaryWeapon._id);
            if (typeof secondaryCaliber !== "undefined") {
                secondaryCaliberID = secondaryCaliber._tpl;
            }
        }

        const holster = botDetails.find(e => e.slotId === "Holster");
        if (typeof holster !== "undefined") {
            holsterID = holster._tpl;
            const holsterCaliber = botDetails.find(e => e.slotId === "patron_in_weapon" && e.parentId == holster._id);
            if (typeof holsterCaliber !== "undefined") {
                holsterCaliberID = holsterCaliber._tpl;
            }
        }

        const helmet = botDetails.find(e => e.slotId === "Headwear");
        if (typeof helmet !== "undefined") {
            helmetID = helmet._tpl;
        }

        const earPro = botDetails.find(e => e.slotId === "Earpiece");
        if (typeof earPro !== "undefined") {
            earProID = earPro._tpl;
        }

        const armourVest = botDetails.find(e => e.slotId === "ArmorVest");
        const tacticalVest = botDetails.find(e => e.slotId === "TacticalVest");
        if (typeof armourVest !== "undefined") {
            armourVestID = armourVest._tpl;
            tempIdHolder = armourVest;
        } else if (typeof tacticalVest !== "undefined") {
            armourVestID = tacticalVest._tpl;
            tempIdHolder = tacticalVest;
        }
        const frontPlate = botDetails.find(e => e.slotId === "Front_plate" && e.parentId == tempIdHolder._id);
        const backPlate = botDetails.find(e => e.slotId === "Back_plate" && e.parentId == tempIdHolder._id);
        const lSidePlate = botDetails.find(e => e.slotId === "Left_side_plate" && e.parentId == tempIdHolder._id);
        const rSidePlate = botDetails.find(e => e.slotId === "Right_side_plate" && e.parentId == tempIdHolder._id);
        if (typeof frontPlate !== "undefined") {
            frontPlateID = this.itemHelper.getItem(frontPlate._tpl)
            frontPlateID = frontPlateID[1]._props.armorClass;
        }
        if (typeof backPlate !== "undefined") {
            backPlateID = this.itemHelper.getItem(backPlate._tpl)
            backPlateID = backPlateID[1]._props.armorClass;
        }
        if (typeof lSidePlate !== "undefined") {
            lSidePlateID = this.itemHelper.getItem(lSidePlate._tpl)
            lSidePlateID = lSidePlateID[1]._props.armorClass;
        }
        if (typeof rSidePlate !== "undefined") {
            rSidePlateID = this.itemHelper.getItem(rSidePlate._tpl)
            rSidePlateID = rSidePlateID[1]._props.armorClass;
        }

        return {
            name: detailsJSON["data"][0].Info.Nickname, 
            level: detailsJSON["data"][0].Info.Level, 
            gameVersion: detailsJSON["data"][0].Info.GameVersion, 
            role: detailsJSON["data"][0].Info.Settings.Role, 
            side: detailsJSON["data"][0].Info.Side,
            difficulty: detailsJSON["data"][0].Info.Settings.BotDifficulty,
            primaryID,
            primaryCaliberID,
            secondaryID,
            secondaryCaliberID,
            holsterID,
            holsterCaliberID,
            helmetID,
            earProID,
            armourVestID,
            frontPlateID,
            backPlateID,
            lSidePlateID,
            rSidePlateID
        }
    }
}