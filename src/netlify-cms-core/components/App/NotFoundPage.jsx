import React from 'react';
import styled from '@emotion/styled';
import { translate } from 'react-polyglot';
import PropTypes from 'prop-types';

import { lengths } from '../../../netlify-cms-ui-default';

const NotFoundContainer = styled.div`
  margin: ${lengths.pageMargin};
`;

function NotFoundPage({ t }) {
  return (
    <NotFoundContainer>
      <h2>{t('app.notFoundPage.header')}</h2>
    </NotFoundContainer>
  );
}

NotFoundPage.propTypes = {
  t: PropTypes.func.isRequired,
};

export default translate()(NotFoundPage);
