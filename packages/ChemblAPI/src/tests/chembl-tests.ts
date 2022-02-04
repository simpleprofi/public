import {category, test} from '@datagrok-libraries/utils/src/test';
import { chemblSearchWidget } from '../widget';

category('ChemblAPI', () => {
  const molString = 'C';

  test('Similarity Search', async () => {
    await chemblSearchWidget(molString, 'similarity');
  });

  test('Substructure Search', async () => {
    await chemblSearchWidget(molString, 'substructure');
  });
});
