import { useContext } from 'react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { ValueHook } from '@riboseinc/paneron-extension-kit/types';
import { AnnexesBlock, ScheduledIssue, MessageBlock, OBIssue, IssueMeta } from './types/issues';


export default function useIssueData
(opts: { issueIDs: number[] }):
ValueHook<{ issues: { [issueID: number]: OBIssue | null } }> {
  const { useObjectData } = useContext(DatasetContext);

  const objectPathsPerIssue: { [issueID: number]: Record<IssueObjectID, string> } =
    opts.issueIDs.
      map(iid => ({ [iid]: getObjectPaths(iid) })).
      reduce((prev, curr) => ({ ...prev, ...curr }));

  const allObjectPaths: string[] =
    Object.entries(objectPathsPerIssue).
      map(([, paths]) => Object.values(paths)).
      reduce((prev, curr) => [ ...prev, ...curr ]);

  const resp = useObjectData({ objectPaths: allObjectPaths });

  const issueDatasets: { [issueID: number]: OBIssue | null } =
    Object.entries(resp.value.data).
      map(([ objPath, dataset ]) => ({
        [getIssueIDFromObjectPath(objPath)]:
          dataset && isIssueDataset(dataset)
            ? dataToIssue(dataset)
            : null,
      })).
      reduce((prev, curr) => ({ ...prev, ...curr }));

  return {
    ...resp,
    value: { issues: issueDatasets },
  };
}


// Types & constants

interface IssueDataset {
  meta: ScheduledIssue & IssueMeta
  annexes: AnnexesBlock
  amendments: MessageBlock
  general: MessageBlock
};

type IssueObjectID = keyof IssueDataset

const ISSUE_FILENAMES: Record<IssueObjectID, string> = {
  meta: 'meta.yaml',
  general: 'general.yaml',
  amendments: 'amendments.yaml',
  annexes: 'annexes.yaml',
}

function isIssueDataset(data: any): data is IssueDataset {
  return data.meta && data.general && data.amendments && data.annexes ? true : false;
}


// Helpers

function dataToIssue(data: IssueDataset): OBIssue {
  const issue: OBIssue = {
    ...data.meta,
    annexes: data.annexes,
    amendments: data.amendments,
    general: data.general,
  };
  return issue;
}

function getObjectPaths(issueID: number): Record<IssueObjectID, string> {
  const root = getIssueRootPath(issueID);
  return Object.entries(ISSUE_FILENAMES).
    map(([id, fn]) => ({ [id]: `${root}${fn}` })).
    reduce((prev, curr) => ({ ...prev, ...curr }), {}) as Record<IssueObjectID, string>;
}

function getIssueRootPath(issueID: number): string {
  return `/issues/${issueID}/`;
}

function getIssueIDFromObjectPath(objPath: string): number {
  const issueID = objPath.split('/')[2];
  if (issueID) {
    return parseInt(issueID, 10);
  } else {
    throw new Error("Unable to resolve issue ID");
  }
}
