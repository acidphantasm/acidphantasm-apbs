import * as path from "path";

export class ModInformation
{
    public modPath: string = path.join(process.cwd(), "\\user\\mods\\acidphantasm-acidsprogressivebotsystem\\");
    public logPath: string = path.join(process.cwd(), "\\user\\mods\\acidphantasm-acidsprogressivebotsystem\\logs");
    public profilePath: string = path.join(process.cwd(), "\\user\\profiles");
}