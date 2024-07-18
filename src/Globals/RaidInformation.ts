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
            "ShortRange": 6,
            "LongRange": 1
        },
        "RezervBase":
        {
            "ShortRange": 10,
            "LongRange": 2
        },
        "laboratory":
        {
            "ShortRange": 30,
            "LongRange": 3
        },
        "factory4_night":
        {
            "ShortRange": 33,
            "LongRange": 2
        },
        "factory4_day":
        {
            "ShortRange": 33,
            "LongRange": 2
        },
        "Interchange":
        {
            "ShortRange": 19,
            "LongRange": 6
        },
        "Sandbox":
        {
            "ShortRange": 15,
            "LongRange": 3
        },
        "Sandbox_high":
        {
            "ShortRange": 15,
            "LongRange": 5
        },
        "Woods":
        {
            "ShortRange": 5,
            "LongRange": 34
        },
        "Shoreline":
        {
            "ShortRange": 9,
            "LongRange": 21
        },
        "Lighthouse":
        {
            "ShortRange": 27,
            "LongRange": 31
        },
        "TarkovStreets":
        {
            "ShortRange": 17,
            "LongRange": 4
        }
    }
}