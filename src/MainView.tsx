import * as R from 'ramda';
import React, { useState, useContext } from 'react';
import { NonIdealState } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import type { DatasetContext as DatasetContextSpec } from '@riboseinc/paneron-extension-kit/types/renderer';
import Breadcrumbs, { Crumb } from './Breadcrumbs';


const ErrorLoadingObjectView: React.FC<DatasetContextSpec & { objectPath: string }> = function ({ objectPath }) {
  return <NonIdealState
    icon="heart-broken"
    title="Error loading screen"
    description={<>View for object at <code>{objectPath}</code> could not be found</>}
  />;
};


const MainView: React.FC<Record<never, never>> =
function () {

  const [crumbs, setCrumbs] = useState<Crumb[]>([]);

  const datasetContext = useContext(DatasetContext);
  const { getObjectView } = datasetContext;

  const lastCrumb = R.last(crumbs);

  let View: React.FC<DatasetContextSpec & { objectPath: string }>;
  if (lastCrumb !== undefined) {
    if (lastCrumb.view) {
      View = lastCrumb.view;
    } else {
      try {
        View = getObjectView({ objectPath: lastCrumb.path });
      } catch (e) {
        View = ErrorLoadingObjectView;
      }
    }
  } else {
    View = Home;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <Breadcrumbs
        crumbs={crumbs}
        onNavigate={setCrumbs}
      />
      <View
        objectPath=''
        // If ctx contains objectPath, this placeholder will be overwritten
        {...datasetContext}
      />
    </div>
  );
};


interface HomeProps extends DatasetContextSpec {}
const Home: React.FC<HomeProps> = function ({ navigateToObjectPath }) {
  return <>Welcome to ITU OB editor</>;
};


export default MainView;
