import { injectable, inject } from "tsyringe";

@injectable()
export class RaidInformation
{
    constructor(

    )
    {}

    public freshProfile: boolean;

    public location: string;
    public currentTime: string;
    public timeVariant: string;
    public nightTime: boolean;

    public sessionId: string;

    public usingDefaultDB: boolean;

    public mapWeights = {
        "bigmap":
        {
            "LongRange": 20,
            "ShortRange": 80
        },
        "RezervBase":
        {
            "LongRange": 20,
            "ShortRange": 80
        },
        "laboratory":
        {
            "LongRange": 5,
            "ShortRange": 95
        },
        "factory4_night":
        {
            "LongRange": 1,
            "ShortRange": 99
        },
        "factory4_day":
        {
            "LongRange": 1,
            "ShortRange": 99
        },
        "Interchange":
        {
            "LongRange": 20,
            "ShortRange": 80
        },
        "Sandbox":
        {
            "LongRange": 15,
            "ShortRange": 85
        },
        "Sandbox_high":
        {
            "LongRange": 15,
            "ShortRange": 85
        },
        "Woods":
        {
            "LongRange": 90,
            "ShortRange": 10
        },
        "Shoreline":
        {
            "LongRange": 50,
            "ShortRange": 50
        },
        "Lighthouse":
        {
            "LongRange": 30,
            "ShortRange": 70
        },
        "TarkovStreets":
        {
            "LongRange": 20,
            "ShortRange": 80
        }
    }
}