import { injectable } from "tsyringe";
import { Boss, Follower, PMC, Scav, Special } from "../Enums/Bots";
import { ModConfig } from "../Globals/ModConfig";

@injectable()
export class BotEnablementHelper
{
    constructor()
    {}

    public doesBotExist(botType: string): boolean
    {
        const boss: string[] = Object.values(Boss);
        const follower: string[] = Object.values(Follower);
        const pmc: string[] = Object.values(PMC);
        const scav: string[] = Object.values(Scav);
        const special: string[] = Object.values(Special);
        const event: string[] = Object.values(Event);

        if (!boss.includes(botType) && !follower.includes(botType) && !pmc.includes(botType) && !scav.includes(botType) && !special.includes(botType) && !event.includes(botType))
        {            
            return false;
        }
        return true;
    }
    
    public botDisabled(botType: string): boolean
    {
        if (this.isBoss(botType)) return ModConfig.config.disableBossTierGeneration;
        if (this.isFollower(botType)) return ModConfig.config.disableBossFollowerTierGeneration;
        if (this.isPMC(botType)) return ModConfig.config.disablePMCTierGeneration;
        if (this.isScav(botType)) return ModConfig.config.disableScavTierGeneration;
        if (this.isSpecial(botType)) return ModConfig.config.disableSpecialTierGeneration;
        if (this.isEvent(botType)) return false;
        return false;
    }

    private isBoss(botType: string): boolean
    {
        return botType in Boss;
    }

    private isFollower(botType: string): boolean
    {        
        return botType in Follower;
    }

    private isPMC(botType: string): boolean
    {
        return botType in PMC;        
    }

    private isScav(botType: string): boolean
    {
        return botType in Scav;        
    }

    private isEvent(botType: string): boolean
    {
        return botType in Event;        
    }

    private isSpecial(botType: string): boolean
    {
        return botType in Special;        
    }
}