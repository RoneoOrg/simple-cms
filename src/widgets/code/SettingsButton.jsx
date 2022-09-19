import React from 'react';
import styled from '@emotion/styled';
import { Icon, buttons, shadows, zIndex } from '../../ui-default';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';

const StyledSettingsButton = styled.button`
  ${buttons.button};
  ${buttons.default};
  ${shadows.drop};
  display: block;
  position: absolute;
  z-index: ${zIndex.zIndex100};
  right: 8px;
  top: 8px;
  opacity: 0.8;
  padding: 2px 4px;
  line-height: 1;
  height: auto;

  ${Icon} {
    position: relative;
    top: 1px;
  }
`;

function SettingsButton({ showClose, onClick }) {
  return (
    <StyledSettingsButton onClick={onClick}>
      {showClose ? <CloseIcon key="close-icon" /> : <SettingsIcon key="settings-icon" />}
    </StyledSettingsButton>
  );
}

export default SettingsButton;
