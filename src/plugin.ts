import yaml from 'js-yaml';
import { makeExtension } from '@riboseinc/paneron-extension-kit';
import { makeNestedSerializableObjectSpec } from '@riboseinc/paneron-extension-kit/object-specs/nested';
import { decoder, encoder } from '@riboseinc/paneron-extension-kit/util';


const issueObjectSpec = makeNestedSerializableObjectSpec({
  matches: {
    pathPrefix: '/issues/',
  },
  views: async () => ({
    default: {
      default: (await import('./IssueEditor')).default,
    },
  }),
  serializePart: (data) => encoder.encode(yaml.dump(data, { noRefs: true })),
  deserializePart: (buffer) => yaml.load(decoder.decode(buffer)),
});


export default makeExtension({
  requiredHostAppVersion: '1.0.0-beta1',
  mainView: () => import('./MainView'),
  objects: [
    issueObjectSpec,
  ],
  name: "ITU OB",
});
