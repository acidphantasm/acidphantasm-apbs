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

    public mapWeights = {
        "bigmap":
        {
            "LongRange": 1,
            "ShortRange": 15
        },
        "RezervBase":
        {
            "LongRange": 1,
            "ShortRange": 19
        },
        "laboratory":
        {
            "LongRange": 1,
            "ShortRange": 23
        },
        "factory4_night":
        {
            "LongRange": 1,
            "ShortRange": 31
        },
        "factory4_day":
        {
            "LongRange": 1,
            "ShortRange": 31
        },
        "Interchange":
        {
            "LongRange": 1,
            "ShortRange": 16
        },
        "Sandbox":
        {
            "LongRange": 1,
            "ShortRange": 19
        },
        "Sandbox_high":
        {
            "LongRange": 1,
            "ShortRange": 19
        },
        "Woods":
        {
            "LongRange": 12,
            "ShortRange": 1
        },
        "Shoreline":
        {
            "LongRange": 1,
            "ShortRange": 1
        },
        "Lighthouse":
        {
            "LongRange": 4,
            "ShortRange": 8
        },
        "TarkovStreets":
        {
            "LongRange": 1,
            "ShortRange": 16
        }
    }
}