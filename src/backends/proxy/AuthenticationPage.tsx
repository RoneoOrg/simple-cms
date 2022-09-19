import styled from '@emotion/styled';
import React, { MouseEvent, useCallback } from 'react';
import { TranslatedProps } from '../../interface';
import { buttons, GoBackButton, Icon, shadows } from '../../ui-default';

const StyledAuthenticationPage = styled.section`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const PageLogoIcon = styled(Icon)`
  color: #c4c6d2;
  margin-top: -300px;
`;

const LoginButton = styled.button`
  ${buttons.button};
  ${shadows.dropDeep};
  ${buttons.default};
  ${buttons.gray};

  padding: 0 30px;
  margin-top: -40px;
  display: flex;
  align-items: center;
  position: relative;

  ${Icon} {
    margin-right: 18px;
  }
`;

export interface AuthenticationPageProps {
  onLogin: (state: {}) => void;
  inProgress: boolean;
  config: any;
}

const AuthenticationPage = ({
  onLogin,
  inProgress,
  config,
  t,
}: TranslatedProps<AuthenticationPageProps>) => {
  const handleLogin = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onLogin({});
  }, []);

  return (
    <StyledAuthenticationPage>
      <PageLogoIcon size="300px" type="netlify-cms" />
      <LoginButton disabled={inProgress} onClick={handleLogin}>
        {inProgress ? t('auth.loggingIn') : t('auth.login')}
      </LoginButton>
      {config.site_url && <GoBackButton href={config.site_url} t={t}></GoBackButton>}
    </StyledAuthenticationPage>
  );
};

export default AuthenticationPage;
