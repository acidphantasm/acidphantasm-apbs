import * as path from "path";
import modPackage = require("../../package.json");

export class ModInformation
{
    public modPath: string = path.join(path.dirname(__filename), "..", "..");
    public logPath: string = path.join(path.dirname(__filename), "..", "..", "logs");
    public profilePath: string = path.join(path.dirname(__filename), "..", "..", "..", "..", "profiles");
    public versionNumber: string = modPackage.version;

    // Don't mess with this shit unless you are making a preset and know what you are doing
    public testMode: boolean = false;
    public testBotRole: (string)[] = [ "pmcusec", "pmcbear" ]
    public testTrader: string = "100000000000000000000000"
    public testLevelLockToPlayer: boolean = false;
    public testLevelLock: boolean = false;
    public levelLockLevel: number = 1;
    public clearAssortPreRaid: boolean = true;
}

