import { IBotBase, IInfo } from "@spt/models/eft/common/tables/IBotBase";

export interface APBSIBotBase extends IBotBase
{
    Info: APBSIBotBaseInfo;
}
export interface APBSIBotBaseInfo extends IInfo
{
    Tier: string
}