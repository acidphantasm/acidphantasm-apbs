import { VFS } from "@spt/utils/VFS";
import { container } from "tsyringe";
import jsonc from "jsonc";
import path from "path";

export class ModConfig
{
    private static vfs = container.resolve<VFS>("VFS");
    public static config: Config = jsonc.parse(this.vfs.readFile(path.resolve(__dirname, "../../config/config.jsonc")));
}

export interface Config
{
    enableModdedWeapons: boolean
}