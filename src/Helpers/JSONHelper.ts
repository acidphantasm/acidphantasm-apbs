import { injectable, inject } from "tsyringe";
import { TierInformation } from "../Globals/TierInformation";

import Tier0 = require("../db/Tier0_equipment.json");
import Tier1 = require("../db/Tier1_equipment.json");
import Tier2 = require("../db/Tier2_equipment.json");
import Tier3 = require("../db/Tier3_equipment.json");
import Tier4 = require("../db/Tier4_equipment.json");
import Tier5 = require("../db/Tier5_equipment.json");
import Tier6 = require("../db/Tier6_equipment.json");
import Tier7 = require("../db/Tier7_equipment.json");

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
    constructor(
        @inject("TierInformation") protected tierInformation: TierInformation
    )
    {}

    public buildTierJson(): void
    {
        this.tierInformation.tier0 = Tier0;
        this.tierInformation.tier1 = Tier1;
        this.tierInformation.tier2 = Tier2;
        this.tierInformation.tier3 = Tier3;
        this.tierInformation.tier4 = Tier4;
        this.tierInformation.tier5 = Tier5;
        this.tierInformation.tier6 = Tier6;
        this.tierInformation.tier7 = Tier7;

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
}