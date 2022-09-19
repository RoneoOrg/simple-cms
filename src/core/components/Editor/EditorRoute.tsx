import React, { useMemo } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { Collections } from '../../types/redux';
import Editor from './Editor';

function getDefaultPath(collections: Collections) {
  const first = Object.values(collections).filter((collection: any) => collection.hide !== true)[0];
  if (first) {
    return `/collections/${first.name}`;
  } else {
    throw new Error('Could not find a non hidden collection');
  }
}

interface EditorRouteProps {
  newRecord?: boolean;
  collections: any;
}

const EditorRoute = ({ newRecord, collections }: EditorRouteProps) => {
  const { name, slug } = useParams();
  const { search } = useLocation();
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

  return <Editor name={name} slug={slug} newRecord={newRecord} search={search} />;
};

export default EditorRoute;
