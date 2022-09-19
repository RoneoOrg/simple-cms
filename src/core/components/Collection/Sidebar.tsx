import { css } from '@emotion/react';
import styled from '@emotion/styled';
import CreateIcon from '@mui/icons-material/Create';
import React from 'react';
import { translate } from 'react-polyglot';
import { NavLink } from 'react-router-dom';
import { Collection } from '../..';
import { TranslatedProps } from '../../../interface';
import { colors, components, Icon } from '../../../ui-default';
import transientOptions from '../../../util/transientOptions';
import { searchCollections } from '../../actions/collections';
import CollectionSearch from './CollectionSearch';
import NestedCollection from './NestedCollection';

const styles = {
  sidebarNavLinkActive: css`
    color: ${colors.active};
    background-color: ${colors.activeBackground};
    border-left-color: #4863c6;
  `,
};

const SidebarContainer = styled.aside`
  ${components.card};
  width: 250px;
  padding: 8px 0 12px;
  position: fixed;
  max-height: calc(100vh - 112px);
  display: flex;
  flex-direction: column;
`;

const SidebarHeading = styled.h2`
  font-size: 23px;
  font-weight: 600;
  padding: 0;
  margin: 18px 12px 12px;
  color: ${colors.textLead};
`;

const SidebarNavList = styled.ul`
  margin: 16px 0 0;
  padding-left: 0;
  list-style: none;
  overflow: auto;
`;

interface SidebarNavLinkProps {
  $activeClassName: string;
}

const SidebarNavLink = styled(NavLink, transientOptions)<SidebarNavLinkProps>`
  display: flex;
  font-size: 14px;
  font-weight: 500;
  align-items: center;
  padding: 8px 12px;
  border-left: 2px solid #fff;
  z-index: -1;

  ${Icon} {
    margin-right: 8px;
    flex-shrink: 0;
  }

  ${props => css`
    &:hover,
    &:active,
    &.${props.$activeClassName} {
      ${styles.sidebarNavLinkActive};
    }
  `};
`;

interface SidebarProps {
  collections: Record<string, Collection>;
  collection?: Collection;
  isSearchEnabled?: boolean;
  searchTerm?: string;
  filterTerm?: string;
}

const Sidebar = ({
  collections,
  collection,
  isSearchEnabled,
  searchTerm,
  filterTerm,
  t,
}: TranslatedProps<SidebarProps>) => {
  const renderLink = (collection: Collection, filterTerm?: string) => {
    const collectionName = collection.name;
    if (collection.nested) {
      return (
        <li key={collectionName}>
          <NestedCollection
            collection={collection}
            filterTerm={filterTerm}
            data-testid={collectionName}
          />
        </li>
      );
    }
    return (
      <li key={collectionName}>
        <SidebarNavLink
          to={`/collections/${collectionName}`}
          $activeClassName="sidebar-active"
          data-testid={collectionName}
        >
          <CreateIcon />
          {collection.label}
        </SidebarNavLink>
      </li>
    );
  };

  return (
    <SidebarContainer>
      <SidebarHeading>{t('collection.sidebar.collections')}</SidebarHeading>
      {isSearchEnabled && (
        <CollectionSearch
          searchTerm={searchTerm}
          collections={collections}
          collection={collection}
          onSubmit={(query: string, collectionName: string) =>
            searchCollections(query, collectionName)
          }
        />
      )}
      <SidebarNavList>
        {Object.values(collections)
          .filter(collection => collection.hide !== true)
          .map(collection => renderLink(collection, filterTerm))}
      </SidebarNavList>
    </SidebarContainer>
  );
};

export default translate()(Sidebar);
