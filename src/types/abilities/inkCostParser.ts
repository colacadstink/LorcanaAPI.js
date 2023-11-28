import {AbilityParserFactory} from "./index.js";

export type AbilityWithInkCost = {
  inkCost: number,
};

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
