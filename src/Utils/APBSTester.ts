/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { inject, injectable } from "tsyringe";
import { APBSLogger } from "./APBSLogger";
import { IItem } from "@spt/models/eft/common/tables/IItem";
import { HashUtil } from "@spt/utils/HashUtil";
import { IBarterScheme, ITrader } from "@spt/models/eft/common/tables/ITrader";
import { Money } from "@spt/models/enums/Money";
import { Logging } from "../Enums/Logging";

@injectable()
export class APBSTester
{
    protected itemsToSell: IItem[] = [];
    protected barterScheme: Record<string, IBarterScheme[][]> = {};
    protected loyaltyLevel: Record<string, number> = {};

    constructor(
        @inject("APBSLogger") protected apbsLogger: APBSLogger,
        @inject("HashUtil") protected hashUtil: HashUtil
    )
    {}

    public createComplexAssortItem(items: IItem[]): APBSTester
    {
        items[0].parentId = "hideout";
        items[0].slotId = "hideout";

        if (!items[0].upd)
        {
            items[0].upd = {}
        }

        items[0].upd.UnlimitedCount = false;
        items[0].upd.StackObjectsCount = 100;

        this.itemsToSell.push(...items);

        return this;
    }

    public addStackCount(stackCount: number): APBSTester
    {
        this.itemsToSell[0].upd.StackObjectsCount = stackCount;

        return this;
    }

    public addUnlimitedStackCount(): APBSTester
    {
        this.itemsToSell[0].upd.StackObjectsCount = 999999;
        this.itemsToSell[0].upd.UnlimitedCount = true;

        return this;
    }

    public makeStackCountUnlimited(): APBSTester
    {
        this.itemsToSell[0].upd.StackObjectsCount = 999999;

        return this;
    }

    public addBuyRestriction(maxBuyLimit: number): APBSTester
    {
        this.itemsToSell[0].upd.BuyRestrictionMax = maxBuyLimit;
        this.itemsToSell[0].upd.BuyRestrictionCurrent = 0;

        return this;
    }

    public addLoyaltyLevel(level: number): APBSTester
    {
        this.loyaltyLevel[this.itemsToSell[0]._id] = level;

        return this;
    }

    public addMoneyCost(currencyType: Money, amount: number): APBSTester
    {
        this.barterScheme[this.itemsToSell[0]._id] = [
            [
                {
                    count: amount,
                    _tpl: currencyType
                }
            ]
        ];

        return this;
    }

    public export(data: ITrader): APBSTester
    {
        const itemBeingSoldId = this.itemsToSell[0]._id;
        if (data.assort.items.find(x => x._id === itemBeingSoldId))
        {
            this.apbsLogger.log(Logging.WARN, `Unable to add complex item with item key ${this.itemsToSell[0]._id}, key already used`);

            return;
        }

        data.assort.items.push(...this.itemsToSell);
        data.assort.barter_scheme[itemBeingSoldId] = this.barterScheme[itemBeingSoldId];
        data.assort.loyal_level_items[itemBeingSoldId] = this.loyaltyLevel[itemBeingSoldId];

        this.itemsToSell = [];
        this.barterScheme = {};
        this.loyaltyLevel = {};

        return this;
    }

    public clearAssort(data: ITrader): any
    {
        
        data.assort.items = [];
        data.assort.barter_scheme = {};
        data.assort.loyal_level_items = {};
    }
}