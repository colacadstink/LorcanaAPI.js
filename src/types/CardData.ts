import {Color} from "./Color.js";
import {CardType} from "./CardType.js";
import {Rarity} from "./Rarity.js";

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
  // Type is omitted intentionally; should be implemented by subtypes
};

export type SongCardData = BaseCardData & {
  Type: CardType.Song,
};

export type ActionCardData = BaseCardData & {
  Type: CardType.Action,
};

export type ItemCardData = BaseCardData & {
  Type: CardType.Item,
};

export type CharacterCardData = BaseCardData & {
  Type: CardType.Character,
  Classifications: string[],
  Abilities?: string,
  Lore: number,
  Strength: number,
  Willpower: number,
};

export type CardData = SongCardData | ActionCardData | ItemCardData | CharacterCardData;