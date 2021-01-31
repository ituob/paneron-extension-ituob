import Electron from 'electron';
import { remote } from 'electron';
import * as R from 'ramda';
import React from 'react';
import { Button, ButtonGroup, ControlGroup, IButtonProps, IconName } from '@blueprintjs/core';


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
      {crumbs.map(crumb => <Crumb
        crumb={crumb}
        onNavigate={() => handleCrumbNavigate(crumb)} />
      )}
    </ControlGroup>
  );
};

export const Crumb: React.FC<{ crumb: Crumb; onNavigate: () => void; }> = function ({ crumb, onNavigate }) {
  const crumbButtonProps: IButtonProps = {
    icon: crumb.icon,
    text: crumb.label,
    disabled: !crumb.canNavigate,
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
};

export interface Crumb {
  path: string;
  label: JSX.Element | string;
  icon: IconName;
  canNavigate?: boolean;
  siblingMenu?: Electron.MenuItemConstructorOptions[];
  view?: React.FC<any>;
}

export interface BreadcrumbsProps {
  crumbs: Crumb[];
  onNavigate: (newCrumbs: Crumb[]) => void;
}


export default Breadcrumbs;
