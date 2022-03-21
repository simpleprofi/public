import {SplittedSequences} from './split';

type PositionComposition = {[residue: string]: number};

export class Composition {
  private sequencesSplit: SplittedSequences;
  private composition: PositionComposition[];

  constructor(sequencesSplit: SplittedSequences) {
    this.sequencesSplit = sequencesSplit;
    this.composition = [];
  }

  update(sequencesSplit: SplittedSequences) {
    this.sequencesSplit = sequencesSplit;
  }

  private calculate(): PositionComposition[] {
    return [];
  }

  get result(): PositionComposition[] {
    return this.composition;
  }
}
