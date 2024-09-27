/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { inject, injectable } from "tsyringe";
import { DatabaseService } from "@spt/services/DatabaseService";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { Logging } from "../Enums/Logging";
import { APBSLogger } from "./APBSLogger";
import { vanillaAttachments } from "../Globals/VanillaItemLists";

@injectable()
export class APBSAttachmentChecker
{
    public vanillaAttachmentList: string[] = [];
    constructor(
        @inject("DatabaseService") protected database: DatabaseService,
        @inject("APBSLogger") protected apbsLogger: APBSLogger,
        @inject("ItemHelper") protected itemHelper: ItemHelper
    )
    {}
    
    public buildAttachmentList(): void
    {
        const items = this.database.getTables().templates.items;
        const itemValues = Object.values(items);
        const attachments = itemValues.filter(x => this.itemHelper.isOfBaseclass(x._id, BaseClasses.MOD))

        for (const item in attachments)
        {
            this.vanillaAttachmentList.push(attachments[item]._id)
        }
        this.apbsLogger.log(Logging.DEBUG, `${JSON.stringify(this.vanillaAttachmentList)}`)
    }

    public isVanillaItem(itemID: string): boolean
    {
        if (vanillaAttachments.includes(itemID)) 
        {
            return true;
        }
        return false;
    }
}