import {AbilityParserFactory} from "./index.js";

export type AbilityWithModifier = {
  modifier: number,
};

/**
 * Parses an ability that looks like "<ability> +N", e.g. "Resist +2".
 * @param abilityName The name of the ability.
 */
export const modifierParser: AbilityParserFactory<AbilityWithModifier> = (abilityName) => {
  const regex = new RegExp(`${abilityName} \\+(\\d+)`);
  return (ability) => {
    const match = ability.match(regex);
    if(!match) {
      return false;
    }
    return {
      modifier: parseInt(match[1]),
    };
  };
};
