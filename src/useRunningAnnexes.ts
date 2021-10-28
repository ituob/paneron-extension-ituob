import { ValueHook } from '@riboseinc/paneron-extension-kit/types';
import { RunningAnnex } from './types/running-annexes';
import { OBIssue } from './types/issues';
import useIssues from './useIssues';
import useIssueData from './useIssueData';


/** Given a list of issues */
function getRunningAnnexes(fromIssues: OBIssue[], onlyForPublicationID?: string) {
  // Sort issues by ID newest to oldest
  const issues = [ ...fromIssues ].sort((a, b) => b.id - a.id);

  var runningAnnexes: RunningAnnex[] = [];

  for (const pastIssue of issues) {
    const annexes = Object.entries(pastIssue.annexes || {});
    for (const [annexedPublicationId, annexedPublicationPosition] of annexes) {

      if (onlyForPublicationID && annexedPublicationId !== onlyForPublicationID) {
        continue;
      }

      if (runningAnnexes.find(ann => ann.publicationID === annexedPublicationId) === undefined) {
        const position = annexedPublicationPosition;
        runningAnnexes.push({
          publicationID: annexedPublicationId,
          annexedTo: pastIssue,
          positionOn: position ? (position.position_on as Date) : null,
        });
      }

    }
  }

  return runningAnnexes;
}



export default function useRunningAnnexes
(issueID: number, pubID?: string):
ValueHook<RunningAnnex[] | null> {
  // Find IDs for all actually existing issues up to and including the current one
  const issueListResp = useIssues({ query: `obj.id <= ${issueID}` });
  const issueIDs = Object.values(issueListResp.value.issueMeta).map(i => i.id);

  // Retrieve data for those issues
  const issueDataResp = useIssueData({ issueIDs });

  const isUpdating = issueListResp.isUpdating || issueDataResp.isUpdating;

  let runningAnnexes: RunningAnnex[];

  if (!isUpdating && Object.keys(issueDataResp.value.issues).length > 0) {
    const actualIssues: OBIssue[] =
      Object.values(issueDataResp.value.issues).filter(v => v !== null) as OBIssue[];
    runningAnnexes = getRunningAnnexes(actualIssues, pubID);
  } else {
    runningAnnexes = [];
  }

  return {
    isUpdating,
    errors: [ ...issueListResp.errors, ...issueDataResp.errors ],
    _reqCounter: issueListResp._reqCounter + issueDataResp._reqCounter,
    refresh: issueListResp.refresh,
    value: runningAnnexes,
  };
}
