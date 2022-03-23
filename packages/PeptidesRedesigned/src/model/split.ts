import {assert} from '@datagrok-libraries/utils/src/vector-operations';

/** Column-wise storage of split. */
export type SplitSequencesColumn = string[];
export type SplitSequences = SplitSequencesColumn[];

export class Split {
  protected alignedSequences: string[];
  protected split: SplitSequences;

  constructor(alignedSequences: string[]) {
    this.alignedSequences = alignedSequences;
    this.split = this._process();
  }

  update(alignedSequences: string[]) {
    this.alignedSequences = alignedSequences;
    this.split = this._process();
  }

  protected _process(): SplitSequences {
    const itemsCount = this.alignedSequences.length;
    const split: SplitSequences = [];
    let length = 0;

    for (let i = 0; i < itemsCount; ++i) {
      const seq = this.alignedSequences[i];

      for (let j = 0; j < seq.length; ++j) {
        if (split.length < j + 1) {
          split.push([]);
        }
        split[j].push(seq[j]);
      }

      if (length == 0) {
        length = split.length;
      }
      assert(length == split.length, `Sequences length mismatch (${length} != ${split.length})!`);
    }
    return split;
  }

  get result(): SplitSequences {
    return this.split;
  }
}
