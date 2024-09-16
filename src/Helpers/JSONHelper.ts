import { injectable, inject } from "tsyringe";
import * as path from "path";
import * as fs from "fs";

import { TierInformation } from "../Globals/TierInformation";
import { RaidInformation } from "../Globals/RaidInformation";
import { APBSLogger } from "../Utils/APBSLogger";
import { Logging } from "../Enums/Logging";

import Tier0equipment = require("../db/Tier0_equipment.json");
import Tier1equipment = require("../db/Tier1_equipment.json");
import Tier2equipment = require("../db/Tier2_equipment.json");
import Tier3equipment = require("../db/Tier3_equipment.json");
import Tier4equipment = require("../db/Tier4_equipment.json");
import Tier5equipment = require("../db/Tier5_equipment.json");
import Tier6equipment = require("../db/Tier6_equipment.json");
import Tier7equipment = require("../db/Tier7_equipment.json");

import Tier0mods = require("../db/Tier0_mods.json");
import Tier1mods = require("../db/Tier1_mods.json");
import Tier2mods = require("../db/Tier2_mods.json");
import Tier3mods = require("../db/Tier3_mods.json");
import Tier4mods = require("../db/Tier4_mods.json");
import Tier5mods = require("../db/Tier5_mods.json");
import Tier6mods = require("../db/Tier6_mods.json");
import Tier7mods = require("../db/Tier7_mods.json");

import Tier0chances = require("../db/Tier0_chances.json");
import Tier1chances = require("../db/Tier1_chances.json");
import Tier2chances = require("../db/Tier2_chances.json");
import Tier3chances = require("../db/Tier3_chances.json");
import Tier4chances = require("../db/Tier4_chances.json");
import Tier5chances = require("../db/Tier5_chances.json");
import Tier6chances = require("../db/Tier6_chances.json");
import Tier7chances = require("../db/Tier7_chances.json");

import Tier0ammo = require("../db/Tier0_ammo.json");
import Tier1ammo = require("../db/Tier1_ammo.json");
import Tier2ammo = require("../db/Tier2_ammo.json");
import Tier3ammo = require("../db/Tier3_ammo.json");
import Tier4ammo = require("../db/Tier4_ammo.json");
import Tier5ammo = require("../db/Tier5_ammo.json");
import Tier6ammo = require("../db/Tier6_ammo.json");
import Tier7ammo = require("../db/Tier7_ammo.json");

import Tier0appearance = require("../db/Tier0_appearance.json");
import Tier1appearance = require("../db/Tier1_appearance.json");
import Tier2appearance = require("../db/Tier2_appearance.json");
import Tier3appearance = require("../db/Tier3_appearance.json");
import Tier4appearance = require("../db/Tier4_appearance.json");
import Tier5appearance = require("../db/Tier5_appearance.json");
import Tier6appearance = require("../db/Tier6_appearance.json");
import Tier7appearance = require("../db/Tier7_appearance.json");

@injectable()
export class JSONHelper
{
    count: number;
    constructor(
        @inject("TierInformation") protected tierInformation: TierInformation,
        @inject("RaidInformation") protected raidInformation: RaidInformation,
        @inject("APBSLogger") protected apbsLogger: APBSLogger
    )
    {
        this.count = 0
    }

    public buildTierJson(): void
    {
        this.tierInformation.tier0 = Tier0equipment;
        this.tierInformation.tier1 = Tier1equipment;
        this.tierInformation.tier2 = Tier2equipment;
        this.tierInformation.tier3 = Tier3equipment;
        this.tierInformation.tier4 = Tier4equipment;
        this.tierInformation.tier5 = Tier5equipment;
        this.tierInformation.tier6 = Tier6equipment;
        this.tierInformation.tier7 = Tier7equipment;

        this.tierInformation.tier0mods = Tier0mods;
        this.tierInformation.tier1mods = Tier1mods;
        this.tierInformation.tier2mods = Tier2mods;
        this.tierInformation.tier3mods = Tier3mods;
        this.tierInformation.tier4mods = Tier4mods;
        this.tierInformation.tier5mods = Tier5mods;
        this.tierInformation.tier6mods = Tier6mods;
        this.tierInformation.tier7mods = Tier7mods;

        this.tierInformation.tier0chances = Tier0chances;
        this.tierInformation.tier1chances = Tier1chances;
        this.tierInformation.tier2chances = Tier2chances;
        this.tierInformation.tier3chances = Tier3chances;
        this.tierInformation.tier4chances = Tier4chances;
        this.tierInformation.tier5chances = Tier5chances;
        this.tierInformation.tier6chances = Tier6chances;
        this.tierInformation.tier7chances = Tier7chances;

        this.tierInformation.tier0ammo = Tier0ammo;
        this.tierInformation.tier1ammo = Tier1ammo;
        this.tierInformation.tier2ammo = Tier2ammo;
        this.tierInformation.tier3ammo = Tier3ammo;
        this.tierInformation.tier4ammo = Tier4ammo;
        this.tierInformation.tier5ammo = Tier5ammo;
        this.tierInformation.tier6ammo = Tier6ammo;
        this.tierInformation.tier7ammo = Tier7ammo;

        this.tierInformation.tier0appearance = Tier0appearance;
        this.tierInformation.tier1appearance = Tier1appearance;
        this.tierInformation.tier2appearance = Tier2appearance;
        this.tierInformation.tier3appearance = Tier3appearance;
        this.tierInformation.tier4appearance = Tier4appearance;
        this.tierInformation.tier5appearance = Tier5appearance;
        this.tierInformation.tier6appearance = Tier6appearance;
        this.tierInformation.tier7appearance = Tier7appearance;
    }

    public usePreset(presetName: string): void
    {
        const folderName = presetName;
        const presetFolder = path.join(path.dirname(__filename), "..", "..", "presets");
        const folderPath = path.join(presetFolder, folderName);

        if (!fs.existsSync(folderPath)) 
        {
            this.missingPresetFolder(folderName, presetFolder);
            return;
        }
        const files = fs.readdirSync(folderPath);
        if (files.length < 35)
        {
            this.missingFileCount(folderName, 0);
            return;
        }
        if (files.length > 35)
        {
            this.missingFileCount(folderName, 1);
            return;
        }

        this.raidInformation.usingDefaultDB = false;
        for (const item of files)
        {
            const filePath = path.join(folderPath, item);
            this.mapFileToTierType(filePath, folderName, item)
        }
        
        if (this.count == 35) this.apbsLogger.log(Logging.WARN, `"${folderName}" preset loaded...`);
    }

    private mapFileToTierType(filePath: string, folderName: string,  item: string): void
    {
        let tier = 0;
        let type = "none";
        if (item.includes("1")) tier = 1;
        if (item.includes("2")) tier = 2;
        if (item.includes("3")) tier = 3;
        if (item.includes("4")) tier = 4;
        if (item.includes("5")) tier = 5;
        if (item.includes("6")) tier = 6;
        if (item.includes("7")) tier = 7;

        if (tier == 0) 
        {
            this.invalidFileName(folderName, item);
            return;
        }

        if (item.includes("equipment")) type = "equipment";
        if (item.includes("mods")) type = "mods";
        if (item.includes("chances")) type = "chances";
        if (item.includes("ammo")) type = "ammo";
        if (item.includes("appearance")) type = "appearance";

        if (type == "none") 
        {
            this.invalidFileName(folderName, item);
            return;
        }

        this.configureTierType(filePath, tier, type);
    }

    private configureTierType(filePath: string, tier: number, type: string):void
    {
        this.count++;
        this.tierInformation.tier0 = Tier0equipment;
        this.tierInformation.tier0mods = Tier0mods;
        this.tierInformation.tier0chances = Tier0chances;
        this.tierInformation.tier0ammo = Tier0ammo;
        this.tierInformation.tier0appearance = Tier0appearance;

        switch (true) 
        {
            case tier == 1 && type == "equipment": 
                this.tierInformation.tier1 = require(filePath);
                return;
            case tier == 2 && type == "equipment": 
                this.tierInformation.tier2 = require(filePath);
                return;
            case tier == 3 && type == "equipment":
                this.tierInformation.tier3 = require(filePath);
                return;
            case tier == 4 && type == "equipment":
                this.tierInformation.tier4 = require(filePath);
                return;
            case tier == 5 && type == "equipment":
                this.tierInformation.tier5 = require(filePath);
                return;
            case tier == 6 && type == "equipment":
                this.tierInformation.tier6 = require(filePath);
                return;
            case tier == 7 && type == "equipment":
                this.tierInformation.tier7 = require(filePath);
                return;
            case tier == 1 && type == "mods":
                this.tierInformation.tier1mods = require(filePath);
                return;
            case tier == 2 && type == "mods":
                this.tierInformation.tier2mods = require(filePath);
                return;
            case tier == 3 && type == "mods":
                this.tierInformation.tier3mods = require(filePath);
                return;
            case tier == 4 && type == "mods":
                this.tierInformation.tier4mods = require(filePath);
                return;
            case tier == 5 && type == "mods":
                this.tierInformation.tier5mods = require(filePath);
                return;
            case tier == 6 && type == "mods":
                this.tierInformation.tier6mods = require(filePath);
                return;
            case tier == 7 && type == "mods":
                this.tierInformation.tier7mods = require(filePath);
                return;
            case tier == 1 && type == "chances":
                this.tierInformation.tier1chances = require(filePath);
                return;
            case tier == 2 && type == "chances":
                this.tierInformation.tier2chances = require(filePath);
                return;
            case tier == 3 && type == "chances":
                this.tierInformation.tier3chances = require(filePath);
                return;
            case tier == 4 && type == "chances":
                this.tierInformation.tier4chances = require(filePath);
                return;
            case tier == 5 && type == "chances":
                this.tierInformation.tier5chances = require(filePath);
                return;
            case tier == 6 && type == "chances":
                this.tierInformation.tier6chances = require(filePath);
                return;
            case tier == 7 && type == "chances":
                this.tierInformation.tier7chances = require(filePath);
                return;
            case tier == 1 && type == "ammo":
                this.tierInformation.tier1ammo = require(filePath);
                return;
            case tier == 2 && type == "ammo":
                this.tierInformation.tier2ammo = require(filePath);
                return;
            case tier == 3 && type == "ammo":
                this.tierInformation.tier3ammo = require(filePath);
                return;
            case tier == 4 && type == "ammo":
                this.tierInformation.tier4ammo = require(filePath);
                return;
            case tier == 5 && type == "ammo":
                this.tierInformation.tier5ammo = require(filePath);
                return;
            case tier == 6 && type == "ammo":
                this.tierInformation.tier6ammo = require(filePath);
                return;
            case tier == 7 && type == "ammo":
                this.tierInformation.tier7ammo = require(filePath);
                return;
            case tier == 1 && type == "appearance":
                this.tierInformation.tier1appearance = require(filePath);
                return;
            case tier == 2 && type == "appearance":
                this.tierInformation.tier2appearance = require(filePath);
                return;
            case tier == 3 && type == "appearance":
                this.tierInformation.tier3appearance = require(filePath);
                return;
            case tier == 4 && type == "appearance":
                this.tierInformation.tier4appearance = require(filePath);
                return;
            case tier == 5 && type == "appearance":
                this.tierInformation.tier5appearance = require(filePath);
                return;
            case tier == 6 && type == "appearance":
                this.tierInformation.tier6appearance = require(filePath);
                return;
            case tier == 7 && type == "appearance":
                this.tierInformation.tier7appearance = require(filePath);
                return;
        }
    }
    
    private missingFileCount(folderName: string, errorType: number): void
    {
        const error = errorType == 0 ? "Missing files" : "Extra files found";
        this.raidInformation.usingDefaultDB = true;
        this.apbsLogger.log(Logging.ERR, `Preset name "${folderName}" is invalid.`);
        this.apbsLogger.log(Logging.ERR, `${error}. Report issue to author of preset.`);
        this.apbsLogger.log(Logging.WARN, "Using APBS database instead of preset...");
        this.buildTierJson();
    }
    
    private invalidFileName(folderName: string, item: string): void
    {
        this.raidInformation.usingDefaultDB = true;
        this.apbsLogger.log(Logging.ERR, `Preset name "${folderName}" is invalid.`);
        this.apbsLogger.log(Logging.ERR, `"${item}" is incorrectly named. Report issue to author of preset.`);
        this.apbsLogger.log(Logging.WARN, "Using APBS database instead of preset...");
        this.buildTierJson();
    }

    private missingPresetFolder(folderName: string, presetFolder: string): void
    {
        this.raidInformation.usingDefaultDB = true;
        this.apbsLogger.log(Logging.ERR, `Preset name "${folderName}" is invalid.`);
        this.apbsLogger.log(Logging.ERR, `Verify the preset folder exists in "${presetFolder}" and is named properly.`);
        this.apbsLogger.log(Logging.WARN, "Using APBS database instead of preset...");
        this.buildTierJson();
    }
}