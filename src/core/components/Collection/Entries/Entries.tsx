import styled from '@emotion/styled';
import React from 'react';
import { translate } from 'react-polyglot';
import { TranslatedProps } from '../../../../interface';
import { Cursor } from '../../../../lib/util';
import { lengths, Loader } from '../../../../ui-default';
import { Collections, Entry } from '../../../types/redux';
import EntryListing from './EntryListing';

const PaginationMessage = styled.div`
  width: ${lengths.topCardWidth};
  padding: 16px;
  text-align: center;
`;

const NoEntriesMessage = styled(PaginationMessage)`
  margin-top: 16px;
`;

interface EntriesProps {
  collections: Collections;
  entries: Entry[];
  page: number;
  isFetching: boolean;
  viewStyle: string;
  cursor: Cursor;
  handleCursorActions: () => void;
}

const Entries = ({
  collections,
  entries,
  isFetching,
  viewStyle,
  cursor,
  handleCursorActions,
  t,
  page,
}: TranslatedProps<EntriesProps>) => {
  const loadingMessages = [
    t('collection.entries.loadingEntries'),
    t('collection.entries.cachingEntries'),
    t('collection.entries.longerLoading'),
  ];

  if (isFetching && page === undefined) {
    return <Loader $active>{loadingMessages}</Loader>;
  }

  const hasEntries = (entries && entries.length > 0) || cursor?.actions?.includes('append_next');
  if (hasEntries) {
    return (
      <>
        <EntryListing
          collections={collections}
          entries={entries}
          viewStyle={viewStyle}
          cursor={cursor}
          handleCursorActions={handleCursorActions}
          page={page}
        />
        {isFetching && page !== undefined && entries.length > 0 ? (
          <PaginationMessage>{t('collection.entries.loadingEntries')}</PaginationMessage>
        ) : null}
      </>
    );
  }

  return <NoEntriesMessage>{t('collection.entries.noEntries')}</NoEntriesMessage>;
};

export default translate()(Entries);
