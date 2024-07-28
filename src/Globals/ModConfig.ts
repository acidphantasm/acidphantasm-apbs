import { VFS } from "@spt/utils/VFS";
import { injectable, inject, container } from "tsyringe";
import jsonc from "jsonc";
import path from "path";

export class ModConfig
{
    private static vfs = container.resolve<VFS>("VFS");
    public static config: Config = jsonc.parse(ModConfig.vfs.readFile(path.resolve(__dirname, "../config/config.jsonc")));
}

interface Config
{
    enableModdedWeapons: boolean
}