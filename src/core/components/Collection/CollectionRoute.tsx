import React, { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Collections } from '../../types/redux';
import Collection from './Collection';

function getDefaultPath(collections: Collections) {
  const first = Object.values(collections).filter((collection: any) => collection.hide !== true)[0];
  if (first) {
    return `/collections/${first.name}`;
  } else {
    throw new Error('Could not find a non hidden collection');
  }
}

interface CollectionRouteProps {
  isSearchResults?: boolean;
  isSingleSearchResult?: boolean;
  collections: any;
}

const CollectionRoute = ({
  isSearchResults,
  isSingleSearchResult,
  collections,
}: CollectionRouteProps) => {
  const { name, searchTerm, filterTerm } = useParams();
  const shouldRedirect = useMemo(() => {
    if (!name) {
      return false;
    }
    return !Boolean(collections[name]);
  }, [name]);

  const defaultPath = useMemo(() => getDefaultPath(collections), [collections]);

  if (shouldRedirect) {
    return <Navigate to={defaultPath} />;
  }

  return (
    <Collection
      name={name}
      searchTerm={searchTerm}
      filterTerm={filterTerm}
      isSearchResults={isSearchResults}
      isSingleSearchResult={isSingleSearchResult}
    />
  );
};

export default CollectionRoute;
