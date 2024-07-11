import { DependencyContainer } from "tsyringe";

// SPT
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { ILogger } from "@spt/models/spt/utils/ILogger";

// Custom
import { APBSLogger } from "./Utils/apbsLogger";
import { Logging } from "./Enums/Logging";

class APBS implements IPostDBLoadMod
{
    private mod: string
    private logger: ILogger

    public postDBLoad(container: DependencyContainer): void
    {
        const start = performance.now()
        const apbsLogger = new APBSLogger;
        this.logger = container.resolve<ILogger>("WinstonLogger");

        apbsLogger.createLogFiles();
        
        const timeTaken = performance.now() - start;
        apbsLogger.log(this.logger, `Time Taken: ${timeTaken}`, Logging.DEBUG);
    }
}

export const mod = new APBS();
