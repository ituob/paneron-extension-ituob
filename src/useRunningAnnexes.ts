import { ValueHook } from '@riboseinc/paneron-extension-kit/types';
import { RunningAnnex } from './types/running-annexes';
import { OBIssue } from './types/issues';


function getRunningAnnexes(fromIssues: OBIssue[], onlyForPublicationID?: string) {
  // Sort issues by ID newest to oldest
  const issues = [ ...fromIssues ].sort((a, b) => a.id - b.id);

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
  const pastIssueResp: ValueHook<OBIssue[]> = useIssueRange({ before: issueID + 1 });
  let runningAnnexes: RunningAnnex[];

  if (!pastIssueResp.isUpdating && pastIssueResp.value.length > 0) {
    runningAnnexes = getRunningAnnexes(pastIssueResp.value, pubID);
  } else {
    runningAnnexes = [];
  }

  return {
    ...pastIssueResp,
    value: runningAnnexes,
  };
}
