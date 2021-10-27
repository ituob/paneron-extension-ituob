import { makeExtension } from '@riboseinc/paneron-extension-kit';


export default makeExtension({
  requiredHostAppVersion: '1.0.0-beta1',
  mainView: () => import('./IssueBasedTabbedView'),
  name: "ITU OB",
});
