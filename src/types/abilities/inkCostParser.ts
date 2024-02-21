import {AbilityParserFactory} from "./index.js";

export type AbilityWithInkCost = {
  inkCost: number | undefined,
};

/**
 * Parses an ability that looks like "<ability> N", e.g. "Shift 4". Note that the cost may not be present if the card
 * simply talks about the ability instead of having it, e.x. Morph - Space Goo having "Shift".
 * @param abilityName The name of the ability itself
 */
export const inkCostParser: AbilityParserFactory<AbilityWithInkCost> = (abilityName) => {
  const regex = new RegExp(`${abilityName}(?: (\\d+))?`);
  return (ability) => {
    const match = ability.match(regex);
    if(!match) {
      return false;
    }
    return {
      inkCost: match[1] ? parseInt(match[1]) : undefined,
    };
  };
};
