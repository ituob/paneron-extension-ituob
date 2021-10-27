/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext } from 'react';
import { Position, Menu, MenuItem } from '@blueprintjs/core';
import { Select, ItemPredicate, ItemRenderer, ItemListRenderer, renderFilteredItems } from '@blueprintjs/select';

import { AmendmentMessage } from '../../../../types/messages';
import { DatasetChanges } from '../../../../types/messages/amendment';
import { PositionDatasets } from '../../../../types/issues';
import { Publication } from '../../../../types/publications';

import useRunningAnnexes from '../../../../useRunningAnnexes';
import PublicationTitle from '../../../../widgets/PublicationTitle';
import { TabbedWorkspaceContext } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import { SP } from '../..';


const MAX_MENU_ITEMS_TO_SHOW = 7;


interface AmendablePublication {
  id: string,
  position: Date | null,
}
type NewPublication = { id: "(New publication)", title: "New publication" };
const NEW_PUBLICATION_STUB: NewPublication = { id: "(New publication)", title: "New publication" };


interface NewItemPromptProps {
  highlight?: boolean,
  onCreate: (item: unknown) => void,
}

type NewAmendmentPromptProps = NewItemPromptProps & {
  issueID: number
  nonAnnexablePublicationIDs: string[]
  allPublications: Publication[]
}
export const NewAmendmentPrompt: React.FC<NewAmendmentPromptProps> =
function ({ issueID, nonAnnexablePublicationIDs, allPublications, onCreate, highlight }) {
  const runningAnnexes = useRunningAnnexes(issueID).value ?? [];
  const { spawnTab } = useContext(TabbedWorkspaceContext);

  const annexedPublicationIds = runningAnnexes.map(item => item.publicationID);
  const nonAnnexedPublications = allPublications.
    filter(pub => annexedPublicationIds.indexOf(pub.id) < 0);

  const items: AmendablePublication[] = [...runningAnnexes.map(annex => { return {
    id: annex.publicationID,
    position: annex.positionOn,
  }}), ...nonAnnexedPublications.map(pub => { return {
    id: pub.id,
    position: null,
  }})];

  function handleCreatePublication() {
    spawnTab(`${SP}:new`);
  }

  async function createAmendmentMessage(pub: AmendablePublication) {
    let positionString: string | undefined;
    const position = pub.position;
    if (position != null) {
      positionString = `${position.getFullYear()}-${position.getMonth()}-${position.getDate()}`;
    }

    const datasets: PositionDatasets = await autoFillDatasets({
      forPubID: pub.id,
      asOfIssueID: issueID,
    });

    var message: AmendmentMessage = {
      type: 'amendment',
      target: {
        publication: pub.id,
        position_on: positionString,
      },
      contents: {},
    };

    if (datasets !== undefined) {
      var changes: DatasetChanges = {};
      for (const datasetID of Object.keys(datasets)) {
        changes[datasetID] = { contents: [] };
      }
      message.datasetChanges = changes;
    }

    return message;
  }

  return (
    <NewAmendmentSelector
        popoverProps={{
          wrapperTagName: 'div',
          targetTagName: 'div',
          position: Position.LEFT,
          minimal: true,
          boundary: "viewport",
        }}
        className={editableCardListStyles.addCardTriggerContainer}
        initialContent={filterUsageTip}
        items={items}
        itemRenderer={NewAmendmentMenuItemRenderer}
        itemListRenderer={NewAmendmentMenuRenderer}
        itemPredicate={NewAmendmentMenuItemFilter}
        itemDisabled={(item) => {
          return nonAnnexablePublicationIDs.indexOf(item.id) >= 0;
        }}
        onItemSelect={async (pub: AmendablePublication | NewPublication) =>
          pub.id === NEW_PUBLICATION_STUB.id
            ? handleCreatePublication()
            : onCreate(await createAmendmentMessage(pub as AmendablePublication))}>
      <AddCardTriggerButton highlight={highlight} label="Amend service publication" />
    </NewAmendmentSelector>
  );
};


const noResultsMessage = (
  <MenuItem disabled={true} text="No matching publications!" />
);

const filterUsageTip = (
  <MenuItem disabled={true} text="Type publication title or rec. ID…" />
);

const NewAmendmentMenuRenderer: ItemListRenderer<AmendablePublication | NewPublication> =
    function (props) {

  const hasExactMatch = props.filteredItems.
    find(i => i.id.toLowerCase() === props.query.trim().toLowerCase()) !== undefined;
  const filteredItems = props.filteredItems.slice(0, MAX_MENU_ITEMS_TO_SHOW);

  if (props.query !== '' && hasExactMatch === false) {
    filteredItems.push(NEW_PUBLICATION_STUB);
  }

  return (
    <Menu ulRef={props.itemsParentRef} className={styles.newItemMenu}>
      {renderFilteredItems({
        ...props,
        filteredItems,
      }, noResultsMessage, filterUsageTip)}
    </Menu>
  );
};

const NewAmendmentMenuItemRenderer: ItemRenderer<AmendablePublication | NewPublication> =
    function ({ id }, { handleClick, modifiers, query }) {

  return (
    <MenuItem
      key={id}
      text={<PublicationTitle id={id} />}
      onClick={handleClick}
      active={modifiers.active}
      title={modifiers.disabled ? `Publication was annexed to or amended in this edition` : undefined}
      disabled={modifiers.disabled} />
  );
};

const NewAmendmentMenuItemFilter: ItemPredicate<AmendablePublication | NewPublication> =
    function (query, pub, _index, exactMatch) {

  //const normalizedTitle: string = pub.title.toLowerCase();
  const normalizedId: string = pub.id.toLowerCase();
  const normalizedQuery: string = query.toLowerCase();

  if (exactMatch) {
    return normalizedId === normalizedQuery;
  } else {
    return normalizedId.indexOf(normalizedQuery) >= 0;
  }
};

const NewAmendmentSelector = Select.ofType<AmendablePublication | NewPublication>();
