import {AbilityParserFactory} from "./index.js";

export const noConfigParser: AbilityParserFactory<true> = (abilityName) => {
  return (ability) => ability === abilityName;
};
