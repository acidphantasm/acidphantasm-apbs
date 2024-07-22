/* eslint-disable @typescript-eslint/naming-convention */
export class TierInformation
{
    public tiers = [
        {
            tier: 1,
            playerMinimumLevel: 1,
            playerMaximumLevel: 10,
            botMinLevelVariance: 5,
            botMaxLevelVariance: 5
        },
        {
            tier: 2,
            playerMinimumLevel: 11,
            playerMaximumLevel: 20,
            botMinLevelVariance: 7,
            botMaxLevelVariance: 7
        },
        {
            tier: 3,
            playerMinimumLevel: 21,
            playerMaximumLevel: 30,
            botMinLevelVariance: 10,
            botMaxLevelVariance: 10
        },
        {
            tier: 4,
            playerMinimumLevel: 31,
            playerMaximumLevel: 40,
            botMinLevelVariance: 15,
            botMaxLevelVariance: 15
        },
        {
            tier: 5,
            playerMinimumLevel: 41,
            playerMaximumLevel: 50,
            botMinLevelVariance: 15,
            botMaxLevelVariance: 15
        },
        {
            tier: 6,
            playerMinimumLevel: 51,
            playerMaximumLevel: 60,
            botMinLevelVariance: 20,
            botMaxLevelVariance: 20
        },
        {
            tier: 7,
            playerMinimumLevel: 61,
            playerMaximumLevel: 100,
            botMinLevelVariance: 30,
            botMaxLevelVariance: 10
        }
    ]

    public armorPlateWeights = [
        {
            "levelRange": {
                "min": 1,
                "max": 10
            },
            "front_plate": {
                "2": 20,
                "3": 20,
                "4": 5,
                "5": 0,
                "6": 0
            },
            "back_plate": {
                "2": 20,
                "3": 20,
                "4": 5,
                "5": 0,
                "6": 0
            },
            "side_plate": {
                "2": 20,
                "3": 20,
                "4": 5,
                "5": 0,
                "6": 0
            },
            "left_side_plate": {
                "2": 20,
                "3": 20,
                "4": 5,
                "5": 0,
                "6": 0
            },
            "right_side_plate": {
                "2": 20,
                "3": 20,
                "4": 5,
                "5": 0,
                "6": 0
            }
        },
        {
            "levelRange": {
                "min": 11,
                "max": 20
            },
            "front_plate": {
                "2": 20,
                "3": 20,
                "4": 10,
                "5": 1,
                "6": 0
            },
            "back_plate": {
                "2": 20,
                "3": 20,
                "4": 10,
                "5": 1,
                "6": 0
            },
            "side_plate": {
                "2": 20,
                "3": 20,
                "4": 10,
                "5": 1,
                "6": 0
            },
            "left_side_plate": {
                "2": 20,
                "3": 20,
                "4": 10,
                "5": 1,
                "6": 0
            },
            "right_side_plate": {
                "2": 20,
                "3": 20,
                "4": 10,
                "5": 1,
                "6": 0
            }
        },
        {
            "levelRange": {
                "min": 21,
                "max": 30
            },
            "front_plate": {
                "2": 1,
                "3": 15,
                "4": 20,
                "5": 15,
                "6": 1
            },
            "back_plate": {
                "2": 1,
                "3": 15,
                "4": 20,
                "5": 15,
                "6": 1
            },
            "side_plate": {
                "2": 1,
                "3": 15,
                "4": 20,
                "5": 15,
                "6": 1
            },
            "left_side_plate": {
                "2": 1,
                "3": 15,
                "4": 20,
                "5": 15,
                "6": 1
            },
            "right_side_plate": {
                "2": 1,
                "3": 15,
                "4": 20,
                "5": 15,
                "6": 1
            }
        },
        {
            "levelRange": {
                "min": 31,
                "max": 40
            },
            "front_plate": {
                "2": 5,
                "3": 15,
                "4": 20,
                "5": 25,
                "6": 15
            },
            "back_plate": {
                "2": 5,
                "3": 15,
                "4": 20,
                "5": 25,
                "6": 15
            },
            "side_plate": {
                "2": 5,
                "3": 15,
                "4": 20,
                "5": 25,
                "6": 15
            },
            "left_side_plate": {
                "2": 5,
                "3": 15,
                "4": 20,
                "5": 25,
                "6": 15
            },
            "right_side_plate": {
                "2": 5,
                "3": 15,
                "4": 20,
                "5": 25,
                "6": 15
            }
        },
        {
            "levelRange": {
                "min": 41,
                "max": 50
            },
            "front_plate": {
                "2": 1,
                "3": 3,
                "4": 10,
                "5": 25,
                "6": 25
            },
            "back_plate": {
                "2": 1,
                "3": 3,
                "4": 10,
                "5": 25,
                "6": 25
            },
            "side_plate": {
                "2": 1,
                "3": 3,
                "4": 10,
                "5": 25,
                "6": 25
            },
            "left_side_plate": {
                "2": 1,
                "3": 3,
                "4": 10,
                "5": 25,
                "6": 25
            },
            "right_side_plate": {
                "2": 1,
                "3": 3,
                "4": 10,
                "5": 25,
                "6": 25
            }
        },
        {
            "levelRange": {
                "min": 51,
                "max": 60
            },
            "front_plate": {
                "2": 1,
                "3": 3,
                "4": 10,
                "5": 40,
                "6": 40
            },
            "back_plate": {
                "2": 1,
                "3": 3,
                "4": 10,
                "5": 40,
                "6": 40
            },
            "side_plate": {
                "2": 1,
                "3": 3,
                "4": 10,
                "5": 40,
                "6": 40
            },
            "left_side_plate": {
                "2": 1,
                "3": 3,
                "4": 10,
                "5": 40,
                "6": 40
            },
            "right_side_plate": {
                "2": 1,
                "3": 3,
                "4": 10,
                "5": 40,
                "6": 40
            }
        },
        {
            "levelRange": {
                "min": 61,
                "max": 100
            },
            "front_plate": {
                "2": 1,
                "3": 3,
                "4": 10,
                "5": 40,
                "6": 50
            },
            "back_plate": {
                "2": 1,
                "3": 3,
                "4": 10,
                "5": 40,
                "6": 50
            },
            "side_plate": {
                "2": 1,
                "3": 3,
                "4": 10,
                "5": 40,
                "6": 50
            },
            "left_side_plate": {
                "2": 1,
                "3": 3,
                "4": 10,
                "5": 40,
                "6": 50
            },
            "right_side_plate": {
                "2": 1,
                "3": 3,
                "4": 10,
                "5": 40,
                "6": 50
            }
        }
    ]
}