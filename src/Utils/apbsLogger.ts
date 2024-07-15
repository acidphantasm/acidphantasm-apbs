import { inject, injectable } from "tsyringe";
import { ILogger } from "@spt/models/spt/utils/ILogger";

import { Logging } from "../Enums/Logging";
import { LoggingFolders } from "../Enums/LoggingFolders";
import { ModInformation } from "../Globals/ModInformation";
import fs from "node:fs";

@injectable()
export class APBSLogger
{
    constructor(
        @inject("ILogger") protected logger: ILogger,
        @inject("ILogger") protected modInformation: ModInformation
    )
    {}    

    public createLogFiles(): void
    {
        for (const value in LoggingFolders)
        {
            fs.writeFile(`${this.modInformation.logPath}/${LoggingFolders[value]}.log`, `${new Date().toLocaleString()} - Log File Created\n`, function (err) 
            {
                if (err) throw err;
            });
        }
    }

    public log(logcation: Logging, message: string, message2?: string, message3?: string, message4?: string, message5?: string, message6?: string, message7?: string, message8?: string): void
    {
        const messagesArray = {
            message,
            message2,
            message3,
            message4,
            message5,
            message6,
            message7,
            message8
        }
        let messages: string = "";
        let textFlag;
        let logType;
        let showInConsole;
        for (const line in messagesArray)
        {
            if (messagesArray[line])
            {
                switch (logcation) 
                {
                    case Logging.DEBUG:
                        logType = Logging.DEBUG;
                        textFlag = " DEBUG - "
                        showInConsole = false;
                        break;
                    case Logging.WARN:
                        logType = Logging.DEBUG;
                        textFlag = " WARNING - "
                        showInConsole = true;
                        break;
                    case Logging.ERR:
                        logType = Logging.DEBUG;
                        textFlag = " ERROR - "
                        showInConsole = true;
                        break;
                    default:
                        logType = logcation;
                        textFlag = " - "
                        showInConsole = false;
                        break;
                }
                messages = messages + `${new Date().toLocaleString()}${textFlag}${messagesArray[line]}\n`;
            }
        }
        fs.appendFile(`${this.modInformation.logPath}/${logType}.log`, `${messages}`, function (err) 
        {
            if (err) throw err;
            if (showInConsole) 
            {
                if (logcation == Logging.WARN) 
                {
                    this.logger.warning(`[APBS] -${textFlag} ${messages}`);
                }
                if (logcation == Logging.ERR) 
                {
                    this.logger.error(`[APBS] -${textFlag} ${messages}`);
                }
            }
        });
    }    
}