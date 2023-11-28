import {AbilityParserFactory} from "./index.js";

export type AbilityWithModifier = {
  modifier: number,
};

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
