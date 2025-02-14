import { injectable } from "tsyringe";
import { BossBots, FollowerBots, PMCBots, ScavBots, SpecialBots, EventBots } from "../Enums/Bots";
import { ModConfig } from "../Globals/ModConfig";

@injectable()
export class BotEnablementHelper
{
    constructor()
    {}

    public doesBotExist(botType: string): boolean
    {
        const boss: string[] = Object.values(BossBots);
        const follower: string[] = Object.values(FollowerBots);
        const pmc: string[] = Object.values(PMCBots);
        const scav: string[] = Object.values(ScavBots);
        const special: string[] = Object.values(SpecialBots);
        const event: string[] = Object.values(EventBots);

        if (!boss.includes(botType) && !follower.includes(botType) && !pmc.includes(botType) && !scav.includes(botType) && !special.includes(botType) && !event.includes(botType))
        {            
            return false;
        }
        return true;
    }
    
    public botDisabled(botType: string): boolean
    {
        // Special handling for punisher & legion
        if (botType.toLowerCase() == "bosspunisher" || botType.toLowerCase() == "bosslegion") return true;

        // Normal bot types
        if (this.isPMC(botType)) return !ModConfig.config.pmcBots.enable;
        if (this.isScav(botType)) return !ModConfig.config.scavBots.enable;
        if (this.isBoss(botType)) return !ModConfig.config.bossBots.enable;
        if (this.isFollower(botType)) return !ModConfig.config.followerBots.enable;
        if (this.isSpecial(botType)) return !ModConfig.config.specialBots.enable;
        if (this.isEvent(botType)) return true;
        return false;
    }

    private isBoss(botType: string): boolean
    {
        return Object.values(BossBots).includes(botType as BossBots);
    }

    private isFollower(botType: string): boolean
    {        
        return Object.values(FollowerBots).includes(botType as FollowerBots);
    }

    private isPMC(botType: string): boolean
    {
        return Object.values(PMCBots).includes(botType as PMCBots);
    }

    private isScav(botType: string): boolean
    {
        return Object.values(ScavBots).includes(botType as ScavBots);
    }

    private isEvent(botType: string): boolean
    {
        return Object.values(EventBots).includes(botType as EventBots);
    }

    private isSpecial(botType: string): boolean
    {
        return Object.values(SpecialBots).includes(botType as SpecialBots);
    }
}