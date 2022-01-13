import {RdKitServiceWorkerSimilarity} from './rdkit-service-worker-similarity';
import {isMolBlock} from './chem-utils';

export class RdkitServiceWorkerSubstructure extends RdKitServiceWorkerSimilarity {
  // _patternFps: BitArray[] | null = null;
  // readonly _patternFpLength = 64;

  constructor(module: Object, webRoot: string) {
    super(module, webRoot);
  }

  initMoleculesStructures(dict: string[]) {
    this.freeMoleculesStructures();
    this.freeMorganFingerprints();
    if (dict.length === 0)
      return;
    this._rdKitMols = [];
    // this._patternFps = [];
    const hashToMolblock: {[_:string] : any} = {};
    const molIdxToHash = [];
    for (let i = 0; i < dict.length; ++i) {
      let item = dict[i];
      // let arr = new BitArray(this._patternFpLength);
      let mol = null;
      try {
        mol = this._rdKitModule.get_mol(item);
        // const fp = mol.get_pattern_fp(this._patternFpLength);
        // arr = this.stringFpToArrBits(fp, arr, this._patternFpLength);
        if (isMolBlock(item)) {
          item = mol.normalize_2d_molblock();
          mol.straighten_2d_layout();
          if (!hashToMolblock[item])
            hashToMolblock[item] = mol.get_molblock();
        }
      } catch (e) {
        console.error('Chem | Possibly a malformed molString: `' + item + '`');
        // preserving indices with a placeholder
        mol?.delete();
        mol = this._rdKitModule.get_mol('');
        // Won't rethrow
      }
      this._rdKitMols.push(mol);
      // this._patternFps.push(arr);
      molIdxToHash.push(item);
    }
    return {molIdxToHash, hashToMolblock};
  }

  searchSubstructure(queryMolString: string, querySmarts: string) {
    const matches: number[] = [];
    if (this._rdKitMols) {
      try {
        let queryMol = null;
        // let arr = new BitArray(this._patternFpLength);
        try {
          try {
            queryMol = this._rdKitModule.get_mol(queryMolString, '{"mergeQueryHs":true}');
            // const fp = queryMol.get_pattern_fp(this._patternFpLength);
            // arr = this.stringFpToArrBits(fp, arr, this._patternFpLength);
          } catch (e2) {
            queryMol?.delete();
            queryMol = null;
            if (querySmarts !== null && querySmarts !== '') {
              console.log('Chem | Cannot parse a MolBlock. Switching to SMARTS');
              queryMol = this._rdKitModule.get_qmol(querySmarts);
            } else
              throw new Error('Chem | SMARTS not set');
          }
          if (queryMol) {
            if (queryMol.is_valid()) {
              for (let i = 0; i < this._rdKitMols!.length; ++i) {
                // if (arr.equals(this._patternFps![i].and(arr)))
                if (this._rdKitMols![i]!.get_substruct_match(queryMol) !== '{}')
                  matches.push(i);
              }
            }
          }
        } finally {
          queryMol?.delete();
        }
      } catch (e) {
        console.error(
          'Possibly a malformed query: `' + queryMolString + '`');
        // Won't rethrow
      }
    }
    return '[' + matches.join(', ') + ']';
  }

  freeMoleculesStructures() {
    if (this._rdKitMols !== null) {
      for (let mol of this._rdKitMols!)
        mol.delete();
      this._rdKitMols = null;
    }
    // this._patternFps = null;
  }
}
