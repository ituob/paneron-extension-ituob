/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext } from 'react';

import { LangConfigContext } from '@riboseinc/coulomb/localizer/renderer/context';
import { Publication } from '../types/publications';


const PublicationTitle: React.FC<{ id: string }> = function ({ id }) {
  const lang = useContext(LangConfigContext);
  const pub: Publication | null = usePublicationData(id).value;

  if (pub) {
    return <>{pub.title[lang.default]}</>;
  } else {
    return <em>{id}</em>;
  }
};


export default PublicationTitle;
