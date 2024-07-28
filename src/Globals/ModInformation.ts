import * as path from "path";
import modPackage = require("../../package.json");
import { container, inject, injectable } from "tsyringe";
import { VFS } from "@spt/utils/VFS";
import { jsonc } from "jsonc";

@injectable()
export class ModInformation
{
    private static vfs = container.resolve<VFS>("VFS");    
    public modConfig: Config = jsonc.parse(ModInformation.vfs.readFile(path.resolve(__dirname, "../config/config.jsonc")));

    public modPath: string = path.join(path.dirname(__filename), "..", "..");
    public logPath: string = path.join(path.dirname(__filename), "..", "..", "logs");
    public profilePath: string = path.join(path.dirname(__filename), "..", "..", "..", "..", "profiles");
    public versionNumber: string = modPackage.version;

}

interface Config 
{
    enableModdedWeapons: boolean,
}