import { type Location } from 'react-router';

import { AppRoute, AuthMode } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAuthNavigate,
  useCallback,
  useLocation,
} from '~/libs/hooks/hooks.js';
import {
  type CustomerSignUpRequestDto,
  type UserSignInRequestDto,
} from '~/packages/users/users.js';
import { actions as authActions } from '~/slices/auth/auth.js';

import { SignInForm, SignUpForm } from './components/components.js';
import styles from './styles.module.scss';

const Auth: React.FC = () => {
  const dispatch = useAppDispatch();
  const { navigateAuthUser } = useAuthNavigate();

  const location: Location = useLocation();

  const handleSignInSubmit = useCallback(
    (payload: UserSignInRequestDto): void => {
      void dispatch(authActions.signIn(payload))
        .unwrap()
        .then((user) => navigateAuthUser(user));
    },
    [dispatch, navigateAuthUser],
  );

  const handleSignUpSubmit = useCallback(
    (payload: CustomerSignUpRequestDto): void => {
      const mode =
        location.pathname === AppRoute.SIGN_UP_BUSINESS
          ? AuthMode.BUSINESS
          : AuthMode.CUSTOMER;

      void dispatch(authActions.signUp({ payload, mode }))
        .unwrap()
        .then((user) => navigateAuthUser(user));
    },
    [dispatch, location, navigateAuthUser],
  );

  const getScreen = useCallback((): React.ReactNode => {
    switch (location.pathname) {
      case AppRoute.SIGN_IN: {
        return <SignInForm onSubmit={handleSignInSubmit} />;
      }
      case AppRoute.SIGN_UP_BUSINESS: {
        return (
          <SignUpForm onSubmit={handleSignUpSubmit} mode={AuthMode.BUSINESS} />
        );
      }
      case AppRoute.SIGN_UP_CUSTOMER: {
        return (
          <SignUpForm onSubmit={handleSignUpSubmit} mode={AuthMode.CUSTOMER} />
        );
      }
    }

    return null;
  }, [handleSignInSubmit, handleSignUpSubmit, location.pathname]);

  return <div className={styles.page}>{getScreen()}</div>;
};

export { Auth };
