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

    public mapWeights = {
        "bigmap":
        {
            "LongRange": 1,
            "ShortRange": 6
        },
        "RezervBase":
        {
            "LongRange": 2,
            "ShortRange": 10
        },
        "laboratory":
        {
            "LongRange": 3,
            "ShortRange": 30
        },
        "factory4_night":
        {
            "LongRange": 2,
            "ShortRange": 33
        },
        "factory4_day":
        {
            "LongRange": 2,
            "ShortRange": 33
        },
        "Interchange":
        {
            "LongRange": 6,
            "ShortRange": 19
        },
        "Sandbox":
        {
            "LongRange": 3,
            "ShortRange": 15
        },
        "Sandbox_high":
        {
            "LongRange": 5,
            "ShortRange": 15
        },
        "Woods":
        {
            "LongRange": 34,
            "ShortRange": 5
        },
        "Shoreline":
        {
            "LongRange": 21,
            "ShortRange": 9
        },
        "Lighthouse":
        {
            "LongRange": 31,
            "ShortRange": 27
        },
        "TarkovStreets":
        {
            "LongRange": 4,
            "ShortRange": 17
        }
    }
}