import {Composition} from './composition';
import {Split} from './split';

export class Model {
  composition: Composition;
  split: Split;

  constructor(alignedSequences: string[]) {
    this.split = new Split(alignedSequences);
    this.composition = new Composition(this.split.result);
  }
}
