import { css } from '@emotion/react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';
import { Button as DropdownButton, Menu, MenuItem, Wrapper } from 'react-aria-menubutton';

import transientOptions from '../util/transientOptions';
import Icon from './Icon';
import { buttons, colors, components, zIndex } from './styles';

const StyledWrapper = styled(Wrapper)`
  position: relative;
  font-size: 14px;
  user-select: none;
`;

const StyledDropdownButton = styled(DropdownButton)`
  ${buttons.button};
  ${buttons.default};
  display: block;
  padding-left: 20px;
  padding-right: 40px;
  position: relative;

  &:after {
    ${components.caretDown};
    content: '';
    display: block;
    position: absolute;
    top: 16px;
    right: 10px;
    color: currentColor;
  }
`;

interface DropdownListProps {
  width: string;
  top: string;
  position: string;
}

const DropdownList = styled.ul<DropdownListProps>`
  ${components.dropdownList};
  margin: 0;
  position: absolute;
  top: 0;
  left: 0;
  min-width: 100%;
  z-index: ${zIndex.zIndex299};

  ${props => css`
    width: ${props.width};
    top: ${props.top};
    left: ${props.position === 'left' ? 0 : 'auto'};
    right: ${props.position === 'right' ? 0 : 'auto'};
  `};
`;

interface StyledMenuItemProps {
  isActive: boolean;
  isCheckedItem?: boolean;
  children: ReactNode;
  value?: () => void;
  className?: string;
  onClick?: () => void;
}

function StyledMenuItem({ isActive, isCheckedItem = false, ...props }: StyledMenuItemProps) {
  return (
    <MenuItem
      css={css`
        ${components.dropdownItem};
        &:focus,
        &:active,
        &:not(:focus),
        &:not(:active) {
          background-color: ${isActive ? colors.activeBackground : 'inherit'};
          color: ${isActive ? colors.active : 'inherit'};
          ${isCheckedItem ? 'display: flex; justify-content: start' : ''};
        }
        &:hover {
          color: ${colors.active};
          background-color: ${colors.activeBackground};
        }
        &.active {
          text-decoration: underline;
        }
      `}
      {...props}
    />
  );
}

interface MenuItemIconContainerProps {
  $iconSmall: boolean;
}

const MenuItemIconContainer = styled('div', transientOptions)<MenuItemIconContainerProps>`
  flex: 1 0 32px;
  text-align: right;
  position: relative;
  top: ${props => (props.$iconSmall ? '0' : '2px')};
`;

interface DropDownProps {
  renderButton: () => ReactNode;
  dropdownWidth: string;
  dropdownPosition: string;
  dropdownTopOverlap: string;
  className?: string;
  children: ReactNode;
  closeOnSelection?: boolean;
}

function Dropdown({
  closeOnSelection = true,
  renderButton,
  dropdownWidth = 'auto',
  dropdownPosition = 'left',
  dropdownTopOverlap = '0',
  className,
  children,
}: DropDownProps) {
  return (
    <StyledWrapper
      closeOnSelection={closeOnSelection}
      onSelection={(handler: any) => handler()}
      className={className}
    >
      {renderButton()}
      <Menu>
        <DropdownList width={dropdownWidth} top={dropdownTopOverlap} position={dropdownPosition}>
          {children}
        </DropdownList>
      </Menu>
    </StyledWrapper>
  );
}

interface DropdownItemProps {
  label: string;
  icon?: string;
  iconDirection?: string;
  onClick: () => void;
  className?: string;
  iconSmall?: boolean;
  isActive?: boolean;
}

function DropdownItem({
  label,
  icon,
  iconDirection,
  iconSmall = false,
  isActive = false,
  onClick,
  className,
}: DropdownItemProps) {
  return (
    <StyledMenuItem value={onClick} isActive={isActive} className={className}>
      <span>{label}</span>
      {icon ? (
        <MenuItemIconContainer $iconSmall={iconSmall}>
          <Icon type={icon} direction={iconDirection} size={iconSmall ? 'xsmall' : 'small'} />
        </MenuItemIconContainer>
      ) : null}
    </StyledMenuItem>
  );
}

interface StyledDropdownCheckboxProps {
  checked: boolean;
  id: string;
}

function StyledDropdownCheckbox({ checked, id }: StyledDropdownCheckboxProps) {
  return (
    <input
      readOnly
      type="checkbox"
      css={css`
        margin-right: 10px;
      `}
      checked={checked}
      id={id}
    />
  );
}

interface DropdownCheckedItemProps {
  label: string;
  id: string;
  checked: boolean;
  onClick: () => {};
}

function DropdownCheckedItem({ label, id, checked, onClick }: DropdownCheckedItemProps) {
  return (
    <StyledMenuItem isCheckedItem={true} isActive={checked} onClick={onClick}>
      <StyledDropdownCheckbox checked={checked} id={id} />
      <label htmlFor={id}>{label}</label>
    </StyledMenuItem>
  );
}

DropdownCheckedItem.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export {
  Dropdown as default,
  DropdownItem,
  DropdownCheckedItem,
  DropdownButton,
  StyledDropdownButton,
};
