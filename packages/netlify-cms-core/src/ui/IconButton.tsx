import styled from '@emotion/styled';
import React from 'react';

import { transientOptions } from '../lib';
import Icon from './Icon';
import { buttons, colors, colorsRaw, shadows } from './styles';

import type { MouseEventHandler } from 'react';

const sizes = {
  small: '28px',
  large: '40px',
};

interface ButtonRoundProps {
  $isActive: boolean;
  $size: keyof typeof sizes;
}

const ButtonRound = styled(
  'button',
  transientOptions,
)<ButtonRoundProps>(
  ({ $isActive, $size }) => `
    ${buttons.button};
    ${shadows.dropMiddle};
    background-color: ${colorsRaw.white};
    color: ${colors[$isActive ? `active` : `inactive`]};
    border-radius: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${sizes[$size]};
    height: ${sizes[$size]};
    padding: 0;
  `,
);

interface IconButtonProps {
  size: keyof typeof sizes;
  isActive?: boolean;
  type: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  title?: string;
  className?: string;
}

function IconButton({ size, isActive = false, type, onClick, className, title }: IconButtonProps) {
  return (
    <ButtonRound
      $size={size}
      $isActive={isActive}
      className={className}
      onClick={onClick}
      title={title}
    >
      <Icon type={type} size={size} />
    </ButtonRound>
  );
}

export default IconButton;
