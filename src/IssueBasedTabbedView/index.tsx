/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { css, jsx } from '@emotion/react';
import React, { useState } from 'react';
import { makeContextProvider as makeTabbedWorkspaceContextProvider } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import TabbedWorkspace from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace';
import { getPathFromTabURI } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/util';
import { ITUOBEContext } from './context';
import { sidebarConfig, SidebarID, sidebarIDs } from './sidebar';
import { ISSUE, Protocol, protocolRegistry, REC, SP } from './detail';
import NewTabMenu from './NewTabMenu';


const TabbedWorkspaceContextProvider = makeTabbedWorkspaceContextProvider<Protocol, SidebarID>(
  'Search',
  sidebarIDs,
  protocolRegistry);


const MainView: React.FC<Record<never, never>> =
function () {
  const [selectedObjectPath, selectObjectPath] = useState<string | undefined>(undefined);

  function handleFocusedTabChange(newURI: string | undefined) {
    if (newURI) {
      const path = getPathFromTabURI(newURI);
      if (path) {
        if (newURI.startsWith(`${ISSUE}:`) ||
            newURI.startsWith(`${SP}`) ||
            newURI.startsWith(`${REC}`)) {
          selectObjectPath(path);
        }
      }
    }
  }

  return (
    <ITUOBEContext.Provider value={{ selectedObjectPath, selectObjectPath }}>
      <TabbedWorkspaceContextProvider
          stateKey="aperis-view"
          onFocusedTabChange={handleFocusedTabChange}>
        <TabbedWorkspace
          css={css`flex: 1 1 auto;`}
          sidebarConfig={sidebarConfig}
          sidebarIDs={sidebarIDs}
          newTabPrompt={<NewTabMenu />}
        />
      </TabbedWorkspaceContextProvider>
    </ITUOBEContext.Provider>
  );
};


export default MainView;
