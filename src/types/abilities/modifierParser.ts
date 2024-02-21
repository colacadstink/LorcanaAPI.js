import {AbilityParserFactory} from "./index.js";

export type AbilityWithModifier = {
  modifier: number | undefined,
};

/**
 * Parses an ability that looks like "<ability> +N", e.g. "Resist +2". Note that the cost may not be present if the card
 * simply talks about the ability instead of having it (like Noi - Orphaned Thief (ROF-155)).
 * @param abilityName The name of the ability.
 */
export const modifierParser: AbilityParserFactory<AbilityWithModifier> = (abilityName) => {
  const regex = new RegExp(`${abilityName}(?: \\+(\\d+))?`);
  return (ability) => {
    const match = ability.match(regex);
    if(!match) {
      return false;
    }
    return {
      modifier: match[1] ? parseInt(match[1]) : undefined,
    };
  };
};
