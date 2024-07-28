import * as path from "path";
import modPackage = require("../../package.json");

export class ModInformation
{
    public modPath: string = path.join(path.dirname(__filename), "..", "..");
    public logPath: string = path.join(path.dirname(__filename), "..", "..", "logs");
    public profilePath: string = path.join(path.dirname(__filename), "..", "..", "..", "..", "profiles");
    public versionNumber: string = modPackage.version;
}

