import {randomFloat, randomInt} from '@datagrok-libraries/utils/src/random';

export class SequenceGenerator {
  alphabet = 'ACDEFGHIKLMNPQRSTVWY-';
  length: number;
  alphas: string[];

  constructor(length = 15) {
    this.length = length;
    this.alphas = this.genRestrictedAlpha();
  }

  genRestrictedAlpha(maxPopulationLength = 10): string[] {
    const alpha: string[] = [];
    const alphaLength = this.alphabet.length;
    const alphaRestrictedLength = Math.min(maxPopulationLength, alphaLength);

    for (let i = 0; i < this.length; ++i) {
      const selCount = randomInt(alphaRestrictedLength - 1) + 1;
      let s = '';

      for (let j = 0; j < selCount; ++j) {
        s += this.alphabet[randomInt(alphaLength)];
      }
      alpha.push(s);
    }
    return alpha;
  }

  genSequence(): string {
    let seq = '';

    for (let i = 0; i < this.length; ++i) {
      const alphaLength = this.alphas[i].length;
      seq += this.alphas[i][randomInt(alphaLength)];
    }
    return seq;
  }
}

interface GridRow {
  Sequence: string,
  IC50: number,
}

export function genItems(count = 500, activity = 5): GridRow[] {
  const items: GridRow[] = [];
  const gen = new SequenceGenerator();

  for (let i = 0; i < count; ++i) {
    items.push({Sequence: gen.genSequence(), IC50: randomFloat(activity)});
  }
  return items;
}
