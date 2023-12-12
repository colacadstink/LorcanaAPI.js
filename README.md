[![npm version](https://img.shields.io/npm/v/lorcana-api.svg)](https://www.npmjs.com/package/lorcana-api)

# LorcanaAPI.js
JavaScript / TypeScript client for https://lorcana-api.com/

## Usage

While this is still in v0, the most up-to-date usages will be in [LorcanaAPI.test.ts](src/LorcanaAPI.test.ts). But
here's a couple examples that should be relatively stable:

```ts
import {LorcanaAPI} from "lorcana-api";

const api = new LorcanaAPI();

const allCards = await api.getCardsList();

const arielOnHumanLegs = await api.getCardByIDs(1, 1);

const someRandomCards = await api.getCardsByIDs([
  {setNum: 1, cardNum: 1},
  {setNum: 1, cardNum: 3},
  {setNum: 2, cardNum: 5},
  {setNum: 2, cardNum: 9},
]);
```