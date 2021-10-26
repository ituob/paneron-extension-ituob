import log from 'electron-log';
import { useContext } from 'react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { ValueHook } from '@riboseinc/paneron-extension-kit/types';
import { AnnexesBlock, ScheduledIssue, MessageBlock, OBIssue, IssueMeta } from './types/issues';


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

function getIssueRootPath(issueID: number): string {
  return `/issues/${issueID}/`;
}

function getObjectPaths(issueID: number): Record<IssueObjectID, string> {
  const root = getIssueRootPath(issueID);
  return Object.entries(ISSUE_FILENAMES).
    map(([id, fn]) => ({ [id]: `${root}${fn}` })).
    reduce((prev, curr) => ({ ...prev, ...curr }), {}) as Record<IssueObjectID, string>;
}

function isIssueDataset(data: any): data is IssueDataset {
  return data.meta && data.general && data.amendments && data.annexes ? true : false;
}

function dataToIssue(data: IssueDataset): OBIssue {
  const issue: OBIssue = {
    ...data.meta,
    annexes: data.annexes,
    amendments: data.amendments,
    general: data.general,
  };
  return issue;
}


export default function useIssueData
(issueID: number):
ValueHook<OBIssue | null> {
  const { useObjectData } = useContext(DatasetContext);
  const paths = getObjectPaths(issueID);
  const resp = useObjectData({ objectPaths: Object.values(paths) });
  const maybeIssueDataset = resp.value.data;

  if (isIssueDataset(maybeIssueDataset)) {
    const issueData = dataToIssue(maybeIssueDataset);
    return {
      ...resp,
      value: issueData,
    };
  } else {
    log.error("useIssueData: Unable to retrieve issue data", issueID);
    return {
      ...resp,
      value: null,
    };
  }
}
