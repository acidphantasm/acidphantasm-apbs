/* eslint-disable @typescript-eslint/brace-style */
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { Logging } from "../Enums/Logging";
import { LoggingFolders } from "../Enums/LoggingFolders";
import fs from "node:fs";

export class APBSLogger
{
    private logPath = "./user/mods/acidphantasm-acidsprogressivebotsystem/logs";

    public createLogFiles(): void
    {
        for (const value in LoggingFolders)
        {
            fs.writeFile(`${this.logPath}/${LoggingFolders[value]}.log`, `${new Date().toLocaleString()} - Acid's Progressive Bot System Log File\n`, function (err) 
            {
                if (err) throw err;
            });
        }
    }

    public log(logger: ILogger, logcation: Logging, message: string, message2?: string, message3?: string, message4?: string, message5?: string): void
    {
        const messagesArray = {
            message,
            message2,
            message3,
            message4,
            message5
        }
        let messages: string = "";
        let textFlag;
        let logType;
        let showInConsole;
        for (const line in messagesArray)
        {
            if (messagesArray[line])
            {
                switch (logcation) {
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
        fs.appendFile(`${this.logPath}/${logType}.log`, `${messages}`, function (err) {
            if (err) throw err;
            if (showInConsole) {
                if (logcation == Logging.WARN) {
                    logger.warning(`[APBS] -${textFlag} ${messages}`);
                }
                if (logcation == Logging.ERR) {
                    logger.error(`[APBS] -${textFlag} ${messages}`);
                }
            }
        });
    }    
}