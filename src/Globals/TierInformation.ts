/* eslint-disable @typescript-eslint/naming-convention */
export class TierInformation
{
    public tier0;
    public tier1;
    public tier2;
    public tier3;
    public tier4;
    public tier5;
    public tier6;
    public tier7;

    public tier0mods;
    public tier1mods;
    public tier2mods;
    public tier3mods;
    public tier4mods;
    public tier5mods;
    public tier6mods;
    public tier7mods;

    public tier0chances;
    public tier1chances;
    public tier2chances;
    public tier3chances;
    public tier4chances;
    public tier5chances;
    public tier6chances;
    public tier7chances;

    public tier0ammo;
    public tier1ammo;
    public tier2ammo;
    public tier3ammo;
    public tier4ammo;
    public tier5ammo;
    public tier6ammo;
    public tier7ammo;

    public tier0appearance;
    public tier1appearance;
    public tier2appearance;
    public tier3appearance;
    public tier4appearance;
    public tier5appearance;
    public tier6appearance;
    public tier7appearance;

    public tiers = [
        {
            tier: 1,
            playerMinimumLevel: 1,
            playerMaximumLevel: 10,
            botMinLevelVariance: 10,
            botMaxLevelVariance: 5,
            scavMinLevelVariance: 10,
            scavMaxLevelVariance: 5
        },
        {
            tier: 2,
            playerMinimumLevel: 11,
            playerMaximumLevel: 20,
            botMinLevelVariance: 10,
            botMaxLevelVariance: 5,
            scavMinLevelVariance: 10,
            scavMaxLevelVariance: 5
        },
        {
            tier: 3,
            playerMinimumLevel: 21,
            playerMaximumLevel: 30,
            botMinLevelVariance: 15,
            botMaxLevelVariance: 7,
            scavMinLevelVariance: 15,
            scavMaxLevelVariance: 7
        },
        {
            tier: 4,
            playerMinimumLevel: 31,
            playerMaximumLevel: 40,
            botMinLevelVariance: 20,
            botMaxLevelVariance: 10,
            scavMinLevelVariance: 20,
            scavMaxLevelVariance: 10
        },
        {
            tier: 5,
            playerMinimumLevel: 41,
            playerMaximumLevel: 50,
            botMinLevelVariance: 30,
            botMaxLevelVariance: 15,
            scavMinLevelVariance: 30,
            scavMaxLevelVariance: 15
        },
        {
            tier: 6,
            playerMinimumLevel: 51,
            playerMaximumLevel: 60,
            botMinLevelVariance: 40,
            botMaxLevelVariance: 20,
            scavMinLevelVariance: 40,
            scavMaxLevelVariance: 20
        },
        {
            tier: 7,
            playerMinimumLevel: 61,
            playerMaximumLevel: 100,
            botMinLevelVariance: 50,
            botMaxLevelVariance: 20,
            scavMinLevelVariance: 50,
            scavMaxLevelVariance: 20
        }
    ]

    public armorPlateWeights = [
        {
            "levelRange": {
                "min": 1,
                "max": 10
            },
            "front_plate": {
                "2": 10,
                "3": 80,
                "4": 10
            },
            "back_plate": {
                "2": 10,
                "3": 80,
                "4": 10
            },
            "side_plate": {
                "2": 10,
                "3": 80,
                "4": 10
            },
            "left_side_plate": {
                "2": 10,
                "3": 80,
                "4": 10
            },
            "right_side_plate": {
                "2": 10,
                "3": 80,
                "4": 10
            }
        },
        {
            "levelRange": {
                "min": 11,
                "max": 20
            },
            "front_plate": {
                "3": 65,
                "4": 32,
                "5": 3
            },
            "back_plate": {
                "3": 65,
                "4": 32,
                "5": 3
            },
            "side_plate": {
                "3": 65,
                "4": 32,
                "5": 3
            },
            "left_side_plate": {
                "3": 65,
                "4": 32,
                "5": 3
            },
            "right_side_plate": {
                "3": 65,
                "4": 32,
                "5": 3
            }
        },
        {
            "levelRange": {
                "min": 21,
                "max": 30
            },
            "front_plate": {
                "3": 15,
                "4": 70,
                "5": 10,
                "6": 5
            },
            "back_plate": {
                "3": 15,
                "4": 70,
                "5": 10,
                "6": 5
            },
            "side_plate": {
                "3": 15,
                "4": 70,
                "5": 10,
                "6": 5
            },
            "left_side_plate": {
                "3": 15,
                "4": 70,
                "5": 10,
                "6": 5
            },
            "right_side_plate": {
                "3": 15,
                "4": 70,
                "5": 10,
                "6": 5
            }
        },
        {
            "levelRange": {
                "min": 31,
                "max": 40
            },
            "front_plate": {
                "3": 1,
                "4": 50,
                "5": 39,
                "6": 10
            },
            "back_plate": {
                "3": 1,
                "4": 50,
                "5": 39,
                "6": 10
            },
            "side_plate": {
                "3": 1,
                "4": 50,
                "5": 39,
                "6": 10
            },
            "left_side_plate": {
                "3": 1,
                "4": 50,
                "5": 39,
                "6": 10
            },
            "right_side_plate": {
                "3": 1,
                "4": 50,
                "5": 39,
                "6": 10
            }
        },
        {
            "levelRange": {
                "min": 41,
                "max": 50
            },
            "front_plate": {
                "4": 15,
                "5": 50,
                "6": 35
            },
            "back_plate": {
                "4": 15,
                "5": 50,
                "6": 35
            },
            "side_plate": {
                "4": 15,
                "5": 50,
                "6": 35
            },
            "left_side_plate": {
                "4": 15,
                "5": 50,
                "6": 35
            },
            "right_side_plate": {
                "4": 15,
                "5": 50,
                "6": 35
            }
        },
        {
            "levelRange": {
                "min": 51,
                "max": 60
            },
            "front_plate": {
                "4": 5,
                "5": 40,
                "6": 55
            },
            "back_plate": {
                "4": 5,
                "5": 40,
                "6": 55
            },
            "side_plate": {
                "4": 5,
                "5": 40,
                "6": 55
            },
            "left_side_plate": {
                "4": 5,
                "5": 40,
                "6": 55
            },
            "right_side_plate": {
                "4": 5,
                "5": 40,
                "6": 55
            }
        },
        {
            "levelRange": {
                "min": 61,
                "max": 100
            },
            "front_plate": {
                "4": 1,
                "5": 25,
                "6": 74
            },
            "back_plate": {
                "4": 1,
                "5": 25,
                "6": 74
            },
            "side_plate": {
                "4": 1,
                "5": 25,
                "6": 74
            },
            "left_side_plate": {
                "4": 1,
                "5": 25,
                "6": 74
            },
            "right_side_plate": {
                "4": 1,
                "5": 25,
                "6": 74
            }
        }
    ]

    public nonScavNonPMCArmorPlateWeights = [
        {
            "levelRange": {
                "min": 1,
                "max": 100
            },
            "front_plate": {
                "2": 1,
                "3": 9,
                "4": 60,
                "5": 25,
                "6": 5
            },
            "back_plate": {
                "2": 1,
                "3": 9,
                "4": 60,
                "5": 25,
                "6": 5
            },
            "side_plate": {
                "2": 1,
                "3": 9,
                "4": 60,
                "5": 25,
                "6": 5
            },
            "left_side_plate": {
                "2": 1,
                "3": 9,
                "4": 60,
                "5": 25,
                "6": 5
            },
            "right_side_plate": {
                "2": 1,
                "3": 9,
                "4": 60,
                "5": 25,
                "6": 5
            }
        }
    ]

    public scavArmorPlateWeights = [
        {
            "levelRange": {
                "min": 1,
                "max": 100
            },
            "front_plate": {
                "2": 15,
                "3": 35,
                "4": 5
            },
            "back_plate": {
                "2": 15,
                "3": 35,
                "4": 5
            },
            "side_plate": {
                "2": 15,
                "3": 35,
                "4": 5
            },
            "left_side_plate": {
                "2": 15,
                "3": 35,
                "4": 5
            },
            "right_side_plate": {
                "2": 15,
                "3": 35,
                "4": 5
            }
        }
    ]
}