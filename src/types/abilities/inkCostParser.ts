import {AbilityParserFactory} from "./index.js";

export type AbilityWithInkCost = {
  inkCost: number,
};

/**
 * Parses an ability that looks like "<ability> N", e.g. "Shift 4".
 * @param abilityName The name of the ability itself
 */
export const inkCostParser: AbilityParserFactory<AbilityWithInkCost> = (abilityName) => {
  const regex = new RegExp(`${abilityName} (\\d+)`);
  return (ability) => {
    const match = ability.match(regex);
    if(!match) {
      return false;
    }
    return {
      inkCost: parseInt(match[1]),
    };
  };
};
