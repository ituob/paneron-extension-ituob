import React, { useContext } from 'react';
import { NonIdealState, Spinner } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';


const IssueEditor: React.FC<{ objectPath: string }> = function ({ objectPath }) {
  const issueID: number = parseInt(objectPath.replace('/issues/', ''), 10);
  const ctx = useContext(DatasetContext);
  const issuePath = `issues/${issueID}`;
  const issueQueryResult = ctx.useObjectData({
    objectPaths: [issuePath],
  });
  const issue: Issue | null = issueQueryResult.value.data[issuePath] as Issue | null;

  if (issue) {
    return <>{issue.id}</>;

  } else {
    if (issueQueryResult.isUpdating) {
      return <NonIdealState
        title={<Spinner />}
        description={<>Loading issue {issueID}…</>} />;
    } else {
      return <NonIdealState
        icon="heart-broken"
        title="Issue not found"
        description={<>Issue {issueID} could not be loaded.</>} />;
    }
  }
};

interface Issue {
  id: number;
}

export default IssueEditor;
