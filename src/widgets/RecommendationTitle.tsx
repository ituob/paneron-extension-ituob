/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext } from 'react';

import { LangConfigContext } from '@riboseinc/coulomb/localizer/renderer/context';
import { Recommendation, ITURecommendation } from '../types/recommendations';


const RecommendationTitle: React.FC<{ rec: Recommendation }> = function ({ rec }) {
  const lang = useContext(LangConfigContext);
  const version = rec.version ? `(${moment(rec.version).format('YYYY-MM')})` : null;
  const ituRec: ITURecommendation | null = useRecommendationData(rec.code).value;

  if (ituRec !== null) {
    return <>
      {rec.body} Rec. {rec.code} {version} <em>{ituRec.title[lang.default]}</em>
    </>;
  } else {
    return <em>
      {rec.body} {rec.code} {version}
    </em>;
  }
};


export default RecommendationTitle;
