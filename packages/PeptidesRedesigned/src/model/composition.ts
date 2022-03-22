import {SplitSequencesColumn, SplitSequences} from './split';

type PositionComposition = {[residue: string]: number};

export class Composition {
  private sequencesSplit: SplitSequences;
  private composition: PositionComposition[];

  constructor(sequencesSplit: SplitSequences) {
    this.sequencesSplit = sequencesSplit;
    this.composition = [];
  }

  update(sequencesSplit: SplitSequences) {
    this.sequencesSplit = sequencesSplit;
    this.composition = this._calculate();
  }

  private _calculate(): PositionComposition[] {
    const columnsCount = this.sequencesSplit.length;
    const result: PositionComposition[] = [];

    for (let i = 0; i < columnsCount; ++i) {
      const column = this.sequencesSplit[i];
      const comp = this._analyseColumn(column);
      result.push(this._reduceComposition(comp, 1. / column.length));
    }
    return result;
  }

  private _analyseColumn(column: SplitSequencesColumn): PositionComposition {
    const comp: PositionComposition = {};

    for (const item of column) {
      if (!comp[item]) {
        comp[item] = 0;
      }
      comp[item] += 1;
    }
    return comp;
  }

  private _reduceComposition(composition: PositionComposition, ratio: number): PositionComposition {
    for (const key of Object.keys(composition)) {
      composition[key] *= ratio;
    }
    return composition;
  }

  get result(): PositionComposition[] {
    return this.composition;
  }
}
