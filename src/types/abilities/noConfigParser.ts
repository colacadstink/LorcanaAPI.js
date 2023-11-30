import {AbilityParserFactory} from "./index.js";

/**
 * Parses abilities that are either present or not, like "Rush" or "Bodyguard".
 * @param abilityName The name of the ability.
 */
export const noConfigParser: AbilityParserFactory<true> = (abilityName) => {
  return (ability) => ability === abilityName;
};
