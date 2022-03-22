/** Column-wise storage of split. */
export type SplitSequencesColumn = string[];
export type SplitSequences = SplitSequencesColumn[];

export class Split {
  protected alignedSequences: string[];
  protected split: SplitSequences;

  constructor(alignedSequences: string[]) {
    this.alignedSequences = alignedSequences;
    this.split = [];
  }

  update(alignedSequences: string[]) {
    this.alignedSequences = alignedSequences;
    this.split = this._process();
  }

  protected _process(): SplitSequences {
    return [];
  }

  get result(): SplitSequences {
    return this.split;
  }
}
