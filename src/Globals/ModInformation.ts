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
    public testTrader: string = "6741449944c5b44c53741ccc"
    public testLevelLock: boolean = false;
    public clearAssortPreRaid: boolean = true;
}

