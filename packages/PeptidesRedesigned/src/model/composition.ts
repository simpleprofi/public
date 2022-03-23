import {SplitSequencesColumn, SplitSequences} from './split';

/** Compostion of residues at certain position. */
type PositionComposition = {[residue: string]: number};

export class Composition {
  protected sequencesSplit: SplitSequences;
  protected composition: PositionComposition[];
  protected Reducer = EmptyReducer;

  constructor(sequencesSplit: SplitSequences = []) {
    this.sequencesSplit = sequencesSplit;
    this.composition = this._calculate();
  }

  update(sequencesSplit: SplitSequences) {
    this.sequencesSplit = sequencesSplit;
    this.composition = this._calculate();
  }

  private _calculate(): PositionComposition[] {
    const columnsCount = this.sequencesSplit.length;
    const result: PositionComposition[] = [];
    const reducer = new this.Reducer();

    for (let i = 0; i < columnsCount; ++i) {
      const column = this.sequencesSplit[i];
      const comp = this._analyseColumn(column);
      result.push(reducer.reduce(comp));
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

  get result(): PositionComposition[] {
    return this.composition;
  }
}

interface CompositionReducer {
  reduce(composition: PositionComposition): PositionComposition;
}

// eslint-disable-next-line no-unused-vars
class RatioReducer implements CompositionReducer {
  ratio: number;

  constructor(ratio: number) {
    this.ratio = ratio;
  }

  reduce(composition: PositionComposition): PositionComposition {
    for (const key of Object.keys(composition)) {
      composition[key] *= this.ratio;
    }
    return composition;
  }
}

class EmptyReducer implements CompositionReducer {
  reduce(composition: PositionComposition): PositionComposition {
    return composition;
  }
}
