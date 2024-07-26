/* eslint-disable @typescript-eslint/naming-convention */
export class TierInformation
{
    public tier1;
    public tier2;
    public tier3;
    public tier4;
    public tier5;
    public tier6;
    public tier7;

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
                "2": 15,
                "3": 35,
                "4": 15
            },
            "back_plate": {
                "2": 15,
                "3": 35,
                "4": 15
            },
            "side_plate": {
                "2": 15,
                "3": 35,
                "4": 15
            },
            "left_side_plate": {
                "2": 15,
                "3": 35,
                "4": 15
            },
            "right_side_plate": {
                "2": 15,
                "3": 35,
                "4": 15
            }
        },
        {
            "levelRange": {
                "min": 11,
                "max": 20
            },
            "front_plate": {
                "3": 35,
                "4": 25,
                "5": 3
            },
            "back_plate": {
                "3": 35,
                "4": 25,
                "5": 3
            },
            "side_plate": {
                "3": 35,
                "4": 25,
                "5": 3
            },
            "left_side_plate": {
                "3": 35,
                "4": 25,
                "5": 3
            },
            "right_side_plate": {
                "3": 35,
                "4": 25,
                "5": 3
            }
        },
        {
            "levelRange": {
                "min": 21,
                "max": 30
            },
            "front_plate": {
                "3": 10,
                "4": 30,
                "5": 15,
                "6": 3
            },
            "back_plate": {
                "3": 10,
                "4": 30,
                "5": 15,
                "6": 3
            },
            "side_plate": {
                "3": 10,
                "4": 30,
                "5": 15,
                "6": 3
            },
            "left_side_plate": {
                "3": 10,
                "4": 30,
                "5": 15,
                "6": 3
            },
            "right_side_plate": {
                "3": 10,
                "4": 30,
                "5": 15,
                "6": 3
            }
        },
        {
            "levelRange": {
                "min": 31,
                "max": 40
            },
            "front_plate": {
                "4": 15,
                "5": 30,
                "6": 20
            },
            "back_plate": {
                "4": 15,
                "5": 30,
                "6": 20
            },
            "side_plate": {
                "4": 15,
                "5": 30,
                "6": 20
            },
            "left_side_plate": {
                "4": 15,
                "5": 30,
                "6": 20
            },
            "right_side_plate": {
                "4": 15,
                "5": 30,
                "6": 20
            }
        },
        {
            "levelRange": {
                "min": 41,
                "max": 50
            },
            "front_plate": {
                "4": 15,
                "5": 35,
                "6": 35
            },
            "back_plate": {
                "4": 15,
                "5": 35,
                "6": 35
            },
            "side_plate": {
                "4": 15,
                "5": 35,
                "6": 35
            },
            "left_side_plate": {
                "4": 15,
                "5": 35,
                "6": 35
            },
            "right_side_plate": {
                "4": 15,
                "5": 35,
                "6": 35
            }
        },
        {
            "levelRange": {
                "min": 51,
                "max": 60
            },
            "front_plate": {
                "4": 10,
                "5": 40,
                "6": 50
            },
            "back_plate": {
                "4": 10,
                "5": 40,
                "6": 50
            },
            "side_plate": {
                "4": 10,
                "5": 40,
                "6": 50
            },
            "left_side_plate": {
                "4": 10,
                "5": 40,
                "6": 50
            },
            "right_side_plate": {
                "4": 10,
                "5": 40,
                "6": 50
            }
        },
        {
            "levelRange": {
                "min": 61,
                "max": 100
            },
            "front_plate": {
                "4": 25,
                "5": 70,
                "6": 100
            },
            "back_plate": {
                "4": 25,
                "5": 70,
                "6": 100
            },
            "side_plate": {
                "4": 25,
                "5": 70,
                "6": 100
            },
            "left_side_plate": {
                "4": 25,
                "5": 70,
                "6": 100
            },
            "right_side_plate": {
                "4": 25,
                "5": 70,
                "6": 100
            }
        }
    ]

    public lootRandomization = [
        {
            "levelRange": {
                "min": 1,
                "max": 15
            },
            "generation": {
                "drugs": {
                    "weights": {
                        "0": 1
                    },
                    "whitelist": {}
                },
                "grenades": {
                    "weights": {
                        "0": 45,
                        "1": 35,
                        "2": 1
                    },
                    "whitelist": {
                        "5710c24ad2720bc3458b45a3": 25,
                        "58d3db5386f77426186285a0": 25,
                        "5448be9a4bdc2dfd2f8b456a": 25
                    }
                },
                "healing": {
                    "weights": {
                        "0": 10,
                        "1": 85,
                        "2": 20
                    },
                    "whitelist": {
                        "5755356824597772cb798962": 4,
                        "590c661e86f7741e566b646a": 9,
                        "544fb45d4bdc2dee738b4568": 2,
                        "5e831507ea0a7c419c2f9bd9": 6
                    }
                },
                "backpackLoot": {
                    "weights": {
                        "0": 1
                    },
                    "whitelist": {}
                },
                "pocketLoot": {
                    "weights": {
                        "0": 1
                    },
                    "whitelist": {}
                },
                "vestLoot": {
                    "weights": {
                        "0": 1
                    },
                    "whitelist": {}
                },
                "magazines": {
                    "weights": {
                        "0": 0,
                        "1": 10,
                        "2": 55,
                        "3": 25
                    },
                    "whitelist": {}
                },
                "stims": {
                    "weights": {
                        "0": 100,
                        "1": 1
                    },
                    "whitelist": {
                        "544fb3f34bdc2d03748b456a": 25,
                        "5c0e530286f7747fa1419862": 65
                    }
                }
            }
        },
        {
            "levelRange": {
                "min": 16,
                "max": 30
            },
            "generation": {
                "drugs": {
                    "weights": {
                        "0": 1,
                        "1": 1
                    },
                    "whitelist": {}
                },
                "grenades": {
                    "weights": {
                        "0": 15,
                        "1": 35,
                        "2": 5,
                        "3": 0
                    },
                    "whitelist": {
                        "5710c24ad2720bc3458b45a3": 25,
                        "58d3db5386f77426186285a0": 25,
                        "5448be9a4bdc2dfd2f8b456a": 25,
                        "5e32f56fcb6d5863cc5e5ee4": 5,
                        "5e340dcdcb6d5863cc5e5efb": 1

                    }
                },
                "healing": {
                    "weights": {
                        "0": 1,
                        "1": 25,
                        "2": 65,
                        "3": 10
                    },
                    "whitelist": {
                        "60098ad7c2240c0fe85c570a": 15,
                        "590c678286f77426c9660122": 10,
                        "5e8488fa988a8701445df1e4": 12
                    }
                },
                "backpackLoot": {
                    "weights": {
                        "0": 1
                    },
                    "whitelist": {}
                },
                "pocketLoot": {
                    "weights": {
                        "0": 1
                    },
                    "whitelist": {}
                },
                "vestLoot": {
                    "weights": {
                        "0": 1
                    },
                    "whitelist": {}
                },
                "magazines": {
                    "weights": {
                        "0": 0,
                        "1": 1,
                        "2": 55,
                        "3": 25
                    },
                    "whitelist": {}
                },
                "stims": {
                    "weights": {
                        "0": 75,
                        "1": 20,
                        "2": 5
                    },
                    "whitelist": {
                        "544fb3f34bdc2d03748b456a": 1,
                        "5c0e530286f7747fa1419862": 65,
                        "5c0e534186f7747fa1419867": 12,
                        "5c0e531d86f7747fa23f4d42": 8,
                        "5ed51652f6c34d2cc26336a1": 17
                    }
                }
            }
        },
        {
            "levelRange": {
                "min": 31,
                "max": 45
            },
            "generation": {
                "drugs": {
                    "weights": {
                        "0": 1,
                        "1": 1
                    },
                    "whitelist": {}
                },
                "grenades": {
                    "weights": {
                        "0": 1,
                        "1": 15,
                        "2": 25,
                        "3": 10
                    },
                    "whitelist": {
                        "5710c24ad2720bc3458b45a3": 15,
                        "58d3db5386f77426186285a0": 15,
                        "5448be9a4bdc2dfd2f8b456a": 15,
                        "5e32f56fcb6d5863cc5e5ee4": 45,
                        "5e340dcdcb6d5863cc5e5efb": 20,
                        "617fd91e5539a84ec44ce155": 5,
                        "618a431df1eb8e24b8741deb": 5
                    }
                },
                "healing": {
                    "weights": {
                        "0": 1,
                        "1": 15,
                        "2": 65,
                        "3": 30,
                        "4": 5
                    },
                    "whitelist": {
                        "60098ad7c2240c0fe85c570a": 45,
                        "590c678286f77426c9660122": 20,
                        "5e8488fa988a8701445df1e4": 45
                    }
                },
                "backpackLoot": {
                    "weights": {
                        "0": 1
                    },
                    "whitelist": {}
                },
                "pocketLoot": {
                    "weights": {
                        "0": 1
                    },
                    "whitelist": {}
                },
                "vestLoot": {
                    "weights": {
                        "0": 1
                    },
                    "whitelist": {}
                },
                "magazines": {
                    "weights": {
                        "0": 0,
                        "1": 1,
                        "2": 55,
                        "3": 25
                    },
                    "whitelist": {}
                },
                "stims": {
                    "weights": {
                        "0": 50,
                        "1": 20,
                        "2": 5
                    },
                    "whitelist": {
                        "544fb3f34bdc2d03748b456a": 1,
                        "5c0e530286f7747fa1419862": 65,
                        "5c0e534186f7747fa1419867": 12,
                        "5c0e531d86f7747fa23f4d42": 8,
                        "5ed51652f6c34d2cc26336a1": 17
                    }
                }
            }
        },
        {
            "levelRange": {
                "min": 46,
                "max": 100
            },
            "generation": {
                "drugs": {
                    "weights": {
                        "0": 1,
                        "1": 1
                    },
                    "whitelist": {}
                },
                "grenades": {
                    "weights": {
                        "0": 1,
                        "1": 15,
                        "2": 20,
                        "3": 15
                    },
                    "whitelist": {
                        "5710c24ad2720bc3458b45a3": 1,
                        "58d3db5386f77426186285a0": 1,
                        "5448be9a4bdc2dfd2f8b456a": 1,
                        "5e32f56fcb6d5863cc5e5ee4": 35,
                        "5e340dcdcb6d5863cc5e5efb": 35,
                        "617fd91e5539a84ec44ce155": 10,
                        "618a431df1eb8e24b8741deb": 10

                    }
                },
                "healing": {
                    "weights": {
                        "0": 1,
                        "1": 15,
                        "2": 35,
                        "3": 75,
                        "4": 20
                    },
                    "whitelist": {
                        "60098ad7c2240c0fe85c570a": 45,
                        "590c678286f77426c9660122": 20,
                        "5e8488fa988a8701445df1e4": 45
                    }
                },
                "backpackLoot": {
                    "weights": {
                        "0": 1
                    },
                    "whitelist": {}
                },
                "pocketLoot": {
                    "weights": {
                        "0": 1
                    },
                    "whitelist": {}
                },
                "vestLoot": {
                    "weights": {
                        "0": 1
                    },
                    "whitelist": {}
                },
                "magazines": {
                    "weights": {
                        "0": 0,
                        "1": 1,
                        "2": 25,
                        "3": 55
                    },
                    "whitelist": {}
                },
                "stims": {
                    "weights": {
                        "0": 50,
                        "1": 20,
                        "2": 5
                    },
                    "whitelist": {
                        "544fb3f34bdc2d03748b456a": 1,
                        "5c0e530286f7747fa1419862": 65,
                        "5c0e534186f7747fa1419867": 12,
                        "5c0e531d86f7747fa23f4d42": 8,
                        "5ed51652f6c34d2cc26336a1": 17
                    }
                }
            }
        }
    ]
}