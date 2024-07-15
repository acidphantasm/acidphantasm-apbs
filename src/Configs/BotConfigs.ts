import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { injectable, inject } from "tsyringe";


@injectable()
export class BotConfigs
{
    constructor(
        @inject("IDatabaseTables") protected tables: IDatabaseTables
    )
    {}

    public configureBotExperienceLevels(): void
    {
        const botTypes = this.tables.bots.types;

        for (const type in botTypes)
        {
            botTypes[type].experience.level.min = 1;
            botTypes[type].experience.level.max = 78;
        }
    }
}