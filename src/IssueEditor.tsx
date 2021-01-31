import React, { useContext } from 'react';
import { NonIdealState, Spinner } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';


const IssueEditor: React.FC<{ objectPath: string }> = function ({ objectPath }) {
  const ctx = useContext(DatasetContext);
  const issueQueryResult = ctx.useObjectData({
    objectPaths: [objectPath],
  });
  const issue: Issue | null = issueQueryResult.value.data[objectPath] as Issue | null;

  const issueID: number = parseInt(objectPath.replace('/issues/', ''), 10);

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
