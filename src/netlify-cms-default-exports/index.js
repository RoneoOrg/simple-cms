// eslint-disable-next-line @emotion/no-vanilla
import {
  css,
  withEmotionCache,
  CacheProvider,
  ThemeContext,
  jsx,
  Global,
  keyframes,
  ClassNames,
} from '@emotion/react';
import EmotionStyled from '@emotion/styled';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Lodash from 'lodash/lodash';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import * as UUId from 'uuid';

const EmotionCore = {
  css,
  withEmotionCache,
  CacheProvider,
  ThemeContext,
  jsx,
  Global,
  keyframes,
  ClassNames,
};
export const NetlifyCmsDefaultExports = {
  EmotionCore,
  EmotionStyled,
  Immutable,
  ImmutablePropTypes,
  Lodash,
  PropTypes,
  React,
  ReactDOM,
  UUId,
};
