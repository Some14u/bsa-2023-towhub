import { Form, Link } from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';
import { type UserSignUpRequestDto } from '~/libs/types/types.js';
import { userSignUpValidationSchema } from '~/packages/users/users.js';

import { DEFAULT_SIGN_UP_PAYLOAD } from './libs/constants.js';
import { signUpFields } from './libs/fields.js';

type Properties = {
  onSubmit: (payload: UserSignUpRequestDto) => void;
};

const SignUpForm: React.FC<Properties> = ({ onSubmit }: Properties) => {
  return (
    <>
      <h3>Sign Up</h3>
      <Form
        defaultValues={DEFAULT_SIGN_UP_PAYLOAD}
        validationSchema={userSignUpValidationSchema}
        onSubmit={onSubmit}
        btnLabel="Create Account"
        fields={signUpFields}
      />
      <p>
        Already have an account? Go to <Link to={AppRoute.SIGN_IN}>Log in</Link>
      </p>
    </>
  );
};

export { SignUpForm };
