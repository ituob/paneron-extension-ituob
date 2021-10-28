import { useContext } from 'react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { ValueHook } from '@riboseinc/paneron-extension-kit/types';
import { IssueMeta, ScheduledIssue } from './types/issues';
import { getIssueQueryExp } from './query';


export function getUpcomingIssueQueryExp(): string {
  const ts = (new Date()).valueOf();
  return `obj.publication_date?.valueOf() >= ${ts}`;
}


interface IssueQuery {
  /**
   * String that is evaluated in context of `obj` variable,
   * which can be expected to be of type IssueMeta & ScheduledIssue.
   */
  query: string
}


/**
 * Returns issue meta (IssueMeta & ScheduledIssue) for multiple issues, given query.
 * The result is provided as an object with numeric issue IDs as keys
 * and (IssueMeta & ScheduledIssue) as values.
 * 
 * NOTE: Since it is an object with numbers as keys, this may require careful handling
 * to avoid accidentally treating it as an array.
 */
export default function useIssues({ query }: IssueQuery):
ValueHook<{ issueMeta: { [issueID: number]: (ScheduledIssue & IssueMeta) } }> {
  const { useObjectData, useFilteredObjectPaths } = useContext(DatasetContext);

  const { value: issuePaths }: { value: string[] } = useFilteredObjectPaths({
    queryExpression: getIssueQueryExp(query),
    keyExpression: 'obj.id',
  });

  const dataReq = useObjectData({ objectPaths: issuePaths });

  const issues: (ScheduledIssue & IssueMeta)[] =
    issuePaths.
      map(path => dataReq.value.data[path]).
      filter(issue => issue !== null && issue !== undefined) as (ScheduledIssue & IssueMeta)[];

  const result =
    issues.
      map(issue => ({ [issue.id]: issue })).
      reduce((prev, curr) => ({ ...prev, ...curr }));

  return {
    ...dataReq,
    value: {
      issueMeta: result,
    },
  };
}
