import { injectable, inject } from "tsyringe";
import { APBSLogger } from "../Utils/apbsLogger";

@injectable()
export class RaidInformation
{
    constructor(
        @inject("APBSLogger") protected apbsLogger: APBSLogger
    )
    {}

    public location: string;
    public currentTime: string;
    public timeVariant: string;
    public nightTime: boolean;

    public mapWeights = {
        "bigmap":
        {
            "short": 6,
            "long": 1
        },
        "RezervBase":
        {
            "short": 10,
            "long": 2
        },
        "laboratory":
        {
            "short": 30,
            "long": 3
        },
        "factory4_night":
        {
            "short": 30,
            "long": 2
        },
        "factory4_day":
        {
            "short": 30,
            "long": 2
        },
        "Interchange":
        {
            "short": 25,
            "long": 6
        },
        "Sandbox":
        {
            "short": 15,
            "long": 3
        },
        "Sandbox_high":
        {
            "short": 15,
            "long": 22
        },
        "Woods":
        {
            "short": 5,
            "long": 43
        },
        "Shoreline":
        {
            "short": 9,
            "long": 22
        },
        "Lighthouse":
        {
            "short": 27,
            "long": 31
        },
        "TarkovStreets":
        {
            "short": 21,
            "long": 4
        }
    }
}