import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';

import Icon from './Icon';
import { colors, lengths, buttons } from './styles';

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  height: 26px;
  border-radius: ${lengths.borderRadius} ${lengths.borderRadius} 0 0;
  position: relative;
`;

const TopBarButton = styled.button`
  ${buttons.button};
  color: ${colors.controlLabel};
  background: transparent;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  width: 32px;
  text-align: center;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TopBarButtonSpan = TopBarButton.withComponent('span');

const DragIconContainer = styled(TopBarButtonSpan)`
  width: 100%;
  cursor: move;
`;

function DragHandle({ dragHandleHOC }) {
  const Handle = dragHandleHOC(() => (
    <DragIconContainer>
      <DragHandleIcon size="sm" />
    </DragIconContainer>
  ));
  return <Handle />;
}

function ListItemTopBar({ className, collapsed, onCollapseToggle, onRemove, dragHandleHOC }) {
  return (
    <TopBar className={className}>
      {onCollapseToggle ? (
        <TopBarButton onClick={onCollapseToggle}>
          <ChevronRightIcon size="sm" sx={{ transform: collapsed ? 'rotate(0)' : 'rotate(90)' }} />
        </TopBarButton>
      ) : null}
      {dragHandleHOC ? <DragHandle dragHandleHOC={dragHandleHOC} /> : null}
      {onRemove ? (
        <TopBarButton onClick={onRemove}>
          <CloseIcon size="sm" />
        </TopBarButton>
      ) : null}
    </TopBar>
  );
}

ListItemTopBar.propTypes = {
  className: PropTypes.string,
  collapsed: PropTypes.bool,
  onCollapseToggle: PropTypes.func,
  onRemove: PropTypes.func,
};

const StyledListItemTopBar = styled(ListItemTopBar)`
  display: flex;
  justify-content: space-between;
  height: 26px;
  border-radius: ${lengths.borderRadius} ${lengths.borderRadius} 0 0;
  position: relative;
`;

export default StyledListItemTopBar;
