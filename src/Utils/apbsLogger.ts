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

    public log(logger: ILogger, message: string, logcation: Logging, message2?: string, message3?: string, message4?: string, message5?: string): void
    {
        const messagesArray = {
            message,
            message2,
            message3,
            message4,
            message5
        }
        let messages: string = "";
        for (const line in messagesArray)
        {
            if (messagesArray[line])
            {
                messages = messages + `${messagesArray[line]}\n`;
            }
        }
        switch (logcation)
        {
            case Logging.DEBUG:
                fs.appendFile(`${this.logPath}/${Logging.DEBUG}.log`, `${new Date().toLocaleString()} - DEBUG - ${message}`, function (err) {
                    if (err) throw err;
                });
                break;
            case Logging.WARN:
                fs.appendFile(`${this.logPath}/${Logging.DEBUG}.log`, `${new Date().toLocaleString()} - WARNING - ${message}`, function (err) {
                    if (err) throw err;
                    logger.warning(`[APBS] WARNING - ${message}`);
                });
                break;
            case Logging.ERR:
                fs.appendFile(`${this.logPath}/${Logging.DEBUG}.log`, `${new Date().toLocaleString()} - ERROR - ${message}`, function (err) {
                    if (err) throw err;
                    logger.error(`[APBS] ERROR - ${message}`);
                });
                break;
            default:
                fs.appendFile(`${this.logPath}/${logcation}.log`, `${new Date().toLocaleString()} - ${messages}`, function (err) {
                    if (err) throw err;
                });
                break;
        }

    }    
}