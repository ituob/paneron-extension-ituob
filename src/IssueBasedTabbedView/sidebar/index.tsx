/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Icon } from '@blueprintjs/core';
//import React from 'react';
import { css, jsx } from '@emotion/react';
import { SuperSidebarConfig } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/types';
import Search from './Search';
import Schedule from './Schedule';


export const sidebarIDs = [
  'Search',
  'Schedule',
];

export type SidebarID = typeof sidebarIDs[number];

export const sidebarConfig: SuperSidebarConfig<SidebarID> = {
  Search: {
    icon: () => <Icon icon="search" />,
    title: "Search",
    blocks: [{
      key: 'search',
      title: "Search",
      content: <Search css={css`position: absolute; inset: 0;`} />,
      nonCollapsible: true,
    }],
  },
  Schedule: {
    icon: () => <Icon icon="calendar" />,
    title: "Schedule",
    blocks: [{
      key: 'commits',
      title: "Commits",
      content: <Schedule />,
    }],
  },
};
