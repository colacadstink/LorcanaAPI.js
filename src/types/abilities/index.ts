import {noConfigParser} from "./noConfigParser.js";
import {modifierParser} from "./modifierParser.js";
import {inkCostParser} from "./inkCostParser.js";

/**
 * List of all known abilities in the game.
 */
export enum Ability {
  Bodyguard = 'Bodyguard',
  Challenger = 'Challenger',
  Evasive = 'Evasive',
  Reckless = 'Reckless',
  Resist = 'Resist',
  Rush = 'Rush',
  Shift = 'Shift',
  Singer = 'Singer',
  Support = 'Support',
  Ward = 'Ward',
}

/**
 * Maps each ability to the AbilityParser for that ability.
 */
export const AbilityParsers = {
  // Abilities with no config - either they exist or they don't
  [Ability.Bodyguard]: noConfigParser(Ability.Bodyguard),
  [Ability.Evasive]: noConfigParser(Ability.Evasive),
  [Ability.Reckless]: noConfigParser(Ability.Reckless),
  [Ability.Rush]: noConfigParser(Ability.Rush),
  [Ability.Support]: noConfigParser(Ability.Support),
  [Ability.Ward]: noConfigParser(Ability.Ward),

  // Abilities with an ink cost, like "Shift 3"
  [Ability.Shift]: inkCostParser(Ability.Shift),
  [Ability.Singer]: inkCostParser(Ability.Singer),

  // Abilities with a modifier, like "Challenger +2"
  [Ability.Challenger]: modifierParser(Ability.Challenger),
  [Ability.Resist]: modifierParser(Ability.Resist),

} as const satisfies Record<Ability, AbilityParser<unknown>>;

/**
 * Takes an ability string as an input, and either returns the correct config
 * object for that ability if it's a match, or false if it can't parse this
 * ability for any reason. (Do _not_ use "false" as a valid config value;
 * if you think you need this, please make an object with a property that's
 * set to false instead.)
 */
export type AbilityParser<T> = (ability: string) => T | false;

/** Generates an AbilityParser for the ability with the given name. */
export type AbilityParserFactory<T> = (abilityName: string) => AbilityParser<T>;

/** Maps each ability to its config type, as specified in AbilityParsers. */
export type FullCardAbilitiesDetails = {
  [A in Ability]: Exclude<ReturnType<(typeof AbilityParsers)[A]>, false>;
};

/**
 *  A list of all the abilities that exist on this card. If an ability is
 *  missing or false, it's not on the card in question.
 */
export type CardAbilitiesDetails = Partial<FullCardAbilitiesDetails>;
export const Abilities = Object.values(Ability);
