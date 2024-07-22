import { ItemHelper } from "@spt/helpers/ItemHelper";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { TierInformation } from "../Globals/TierInformation";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { injectable, inject } from "tsyringe";
import { APBSEquipmentGetter } from "../Utils/APBSEquipmentGetter";
import { ITemplateItem, ItemType } from "@spt/models/eft/common/tables/ITemplateItem";
import { DatabaseService } from "@spt/services/DatabaseService";


@injectable()
export class TierConfigs
{
    private tieredWeaponList: ITemplateItem;
    private blacklist: any[];

    constructor(
        @inject("IDatabaseTables") protected tables: IDatabaseTables,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("TierInformation") protected tierInformation: TierInformation,
        @inject("APBSEquipmentGetter") protected apbsEquipmentGetter: APBSEquipmentGetter
    )
    {
        
        this.tieredWeaponList = {}
        this.blacklist = [
            "5ae083b25acfc4001a5fc702",
            "5e81ebcd8e146c7080625e15",
            "6217726288ed9f0845317459",
            "5d52cc5ba4b9367408500062",
            "620109578d82e67e7911abf2",
            "639af924d0446708ee62294e",
            "657857faeff4c850222dff1b",
            "639c3fbbd0446708ee622ee9",
            "62178be9d0050232da3485d9",
            "62178c4d4ecf221597654e3d",
            "624c0b3340357b5f566e8766",
            "5cdeb229d7f00c000e7ce174",
            "579204f224597773d619e051",
            "6275303a9f372d6ea97f9ec7",
            "66015072e9f84d5680039678",
            "59f9cabd86f7743a10721f46",
            "5abccb7dd8ce87001773e277"
        ]
    }

    public tiersTable = [];

    public populateTiersTable(): void
    {        
        const tier7JSON = this.apbsEquipmentGetter.getTierJson(7)
        
        Object.keys(tier7JSON.scav.equipment.FirstPrimaryWeapon.LongRange).forEach(element => {
            const data = this.getItem(element)
            this.tieredWeaponList[element] = data
        })
        
        Object.keys(tier7JSON.scav.equipment.FirstPrimaryWeapon.ShortRange).forEach(element => {
            const data = this.getItem(element)
            this.tieredWeaponList[element] = data;
        })

        Object.keys(tier7JSON.scav.equipment.Holster).forEach(element => {
            const data = this.getItem(element)
            this.tieredWeaponList[element] = data;
        })

        Object.keys(tier7JSON.scav.equipment.Scabbard).forEach(element => {
            const data = this.getItem(element)
            this.tieredWeaponList[element] = data;
        })

        this.getModdedWeapons();
    }

    public getModdedWeapons(): void
    {
        const items = Object.values(this.tables.templates.items);
        const allWeapons = items.filter(x => this.itemHelper.isOfBaseclass(x._id, BaseClasses.WEAPON));

        const tieredItems = Object.values(this.tieredWeaponList);
        const allTieredItems = tieredItems.filter(x => this.itemHelper.isOfBaseclass(x._id, BaseClasses.WEAPON));
        const difference:any = allWeapons.filter(x => !allTieredItems.includes(x));

        let moddedItems = difference;
        
        const blacklist = this.blacklist
        for (const item of difference)
        {
            for (const blacklistedItem of blacklist)
            {
                if (item._id == blacklistedItem)
                {
                    //console.log(`Blacklisted Item: ${item._id}`)
                    moddedItems = moddedItems.filter(id => id._id != blacklistedItem)
                }
            }
        }
        
        //console.log(`${JSON.stringify(moddedItems)}`)

        /**
         * Push @param moddedItems to Tier4+, soonTM.
        */
    }

    private getItem(tpl: string): ITemplateItem
    {
        if (tpl in this.databaseService.getItems())
        {
            return this.databaseService.getItems()[tpl];
        }

        return undefined;
    }
}