import type Electron from 'electron';
import { remote } from 'electron';
import * as R from 'ramda';
import React, { useState, useContext } from 'react';
import { Button, ButtonGroup, ControlGroup, IButtonProps, IconName, NonIdealState } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import type { DatasetContext as DatasetContextSpec } from '@riboseinc/paneron-extension-kit/types/renderer';


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


interface Crumb {
  path: string
  label: JSX.Element | string
  icon: IconName
  canNavigate?: boolean
  siblingMenu?: Electron.MenuItemConstructorOptions[]
  view?: React.FC<any>
}


interface BreadcrumbsProps {
  crumbs: Crumb[]
  onNavigate: (newCrumbs: Crumb[]) => void
}
const Breadcrumbs: React.FC<BreadcrumbsProps> = function ({ crumbs, onNavigate }) {
  function handleCrumbNavigate(crumb: Crumb) {
    const currentIndex = crumbs.indexOf(crumb);
    if (currentIndex >= 0) {
      const newCrumbs = R.take(currentIndex + 1, crumbs);
      onNavigate(newCrumbs);
    }
  }
  return (
    <ControlGroup>
      {crumbs.map(crumb =>
        <Crumb
          crumb={crumb}
          onNavigate={() => handleCrumbNavigate(crumb)}
        />
      )}
    </ControlGroup>
  );
};


const Crumb: React.FC<{ crumb: Crumb, onNavigate: () => void }> = function ({ crumb, onNavigate }) {
  const crumbButtonProps: IButtonProps = {
    disabled: !crumb.canNavigate,
    text: crumb.label,
    onClick: onNavigate,
  };
  function invokeSiblingMenu() {
    if (crumb.siblingMenu) {
      remote.Menu.buildFromTemplate(crumb.siblingMenu).popup();
    }
  }
  if (crumb.siblingMenu) {
    return (
      <ButtonGroup>
        <Button {...crumbButtonProps} />
        <Button icon="chevron-down" onClick={invokeSiblingMenu} />
      </ButtonGroup>
    );
  } else {
    return <Button {...crumbButtonProps} />;
  }
}


interface HomeProps extends DatasetContextSpec {}
const Home: React.FC<HomeProps> = function ({ navigateToObjectPath }) {
  return <>Welcome to ITU OB editor</>;
};


export default MainView;
