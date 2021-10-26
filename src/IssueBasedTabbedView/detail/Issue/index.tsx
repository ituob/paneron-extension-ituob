/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { jsx } from '@emotion/react';
import { NonIdealState, Spinner } from '@blueprintjs/core';

import useIssueData from '../../../useIssueData';
import { IssueEditor } from './Editor';


const FallbackView = (opts: { issueID: number | null }) => <NonIdealState
  icon="heart-broken"
  title="Unable to show item"
  description={`Data for issue ${opts.issueID ?? 'with unknown ID'} cannot be loaded`}
/>;

const LoadingView = (opts: { issueID: number | null }) => <NonIdealState
  icon={<Spinner />}
  description={`Loading data for issue ${opts.issueID ?? 'with unknown ID'}`}
/>;

function parseIssueID(uri: string): number | null {
  try {
    return parseInt(uri, 10);
  } catch (e) {
    return null;
  }
}

const NONEXISTENT_ISSUE_ID = -1;


const IssueDetail: React.FC<{ uri: string }> = function ({ uri }) {
  const issueID = parseIssueID(uri)
  const resp = useIssueData(issueID ?? NONEXISTENT_ISSUE_ID);

  if (resp.isUpdating) {
    return <LoadingView issueID={issueID} />;
  } else if (resp.value) {
    return <IssueEditor issue={resp.value} />;
  } else {
    return <FallbackView issueID={issueID} />;
  }

};


const IssueTitle: React.FC<{ uri: string }> = function ({ uri }) {
  return <>Issue {parseIssueID(uri) ?? 'N/A'}</>
}


export default { main: IssueDetail, title: IssueTitle, plainTitle: async (uri: string) => {
  try {
    return `issue #${parseIssueID(uri) ?? '(unknown ID)'}`;
  } catch (e) {
    return "issue";
  }
} };
