import React, { useMemo } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';

import Editor from './Editor';

function getDefaultPath(collections: any) {
  const first = collections.filter((collection: any) => collection.hide !== true).first();
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
