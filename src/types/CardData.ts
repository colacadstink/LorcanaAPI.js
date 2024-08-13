import {Color} from "./Color.js";
import {CardType} from "./CardType.js";
import {Rarity} from "./Rarity.js";
import {CardAbilitiesDetails} from "./abilities/index.js";

/**
 * Fields that can exist on any type of card
 */
export type BaseCardData = {
  "Artist": string,
  "Set_Name": string,
  "Set_Num": number,
  "Color": Color,
  "Image": string,
  "Cost": number,
  "Inkable": boolean,
  "Name": string,
  "Rarity": Rarity,
  "Card_Num": number,
  "Set_ID": string,
  "Flavor_Text"?: string,
  "Body_Text"?: string,
  "Date_Added": string,
  "Date_Modified": string,
  "Gamemode": string, // "Lorcana" for most cards
  "Franchise": string,
  "Unique_ID": string, // SET-001
  // Type is omitted intentionally; should be implemented by subtypes
};

/**
 * Fields that exist on a song.
 */
export type SongCardData = BaseCardData & {
  Type: CardType.Song,
};

/**
 * Fields that exist on an action.
 */
export type ActionCardData = BaseCardData & {
  Type: CardType.Action,
};

/**
 * Fields that exist on an item.
 */
export type ItemCardData = BaseCardData & {
  Type: CardType.Item,
};

/**
 * Fields that exist on a character.
 */
export type CharacterCardData = BaseCardData & {
  Type: CardType.Character,
  Classifications: string[],
  Abilities?: CardAbilitiesDetails,
  Lore: number,
  Strength: number,
  Willpower: number,
};

/**
 * Fields that exist on a location.
 */
export type LocationCardData = BaseCardData & {
  Type: CardType.Location,
  Abilities?: CardAbilitiesDetails,
  Lore: number,
  Move_Cost: number,
  Willpower: number,
};

/**
 * This could be any one of the card types in the game - use the `Type` field to narrow it down.
 */
export type CardData = SongCardData | ActionCardData | ItemCardData | CharacterCardData | LocationCardData;

/**
 * Mainly for debugging - gives back a string with the card's name and ID.
 * @param card The card to get info from.
 */
export function getCardNameAndID(card: CardData): string {
  return `${card.Name} (${card.Set_ID}-${card.Card_Num})`;
}
