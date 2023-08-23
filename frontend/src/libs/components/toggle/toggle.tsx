import {
  type Control,
  type FieldErrors,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { getValidClassNames } from '~/libs/helpers/helpers.js';
import { useFormController } from '~/libs/hooks/hooks.js';

import common from './common.module.scss';
import toggle from './toggle.module.scss';

const styles = { ...common, ...toggle };

type Properties<T extends FieldValues> = {
  control: Control<T, null>;
  errors?: FieldErrors<T>;
  label?: string;
  name: FieldPath<T>;
  isDisabled?: boolean;
};

const Toggle = <T extends FieldValues>({
  control,
  errors,
  label,
  name,
  isDisabled = false,
}: Properties<T>): JSX.Element => {
  const { field } = useFormController({ name, control });

  const error = errors?.[name]?.message;
  const hasLabel = Boolean(label);
  const hasError = Boolean(error);

  return (
    <span className={styles.container}>
      <label
        className={getValidClassNames(styles.label, isDisabled && 'disabled')}
      >
        <input
          className={getValidClassNames(styles.input, styles.toggle)}
          {...field}
          type="checkbox"
          defaultChecked={field.value || undefined}
          disabled={isDisabled || undefined}
          aria-disabled={isDisabled || undefined}
          aria-invalid={hasError || undefined}
        />
        {hasLabel && <span className={styles.labelText}>{label}</span>}
      </label>
      <div
        className={getValidClassNames(
          styles.error,
          !hasError && 'visually-hidden',
        )}
        role="alert"
        aria-hidden={!hasError || undefined}
      >
        {error as string}
      </div>
    </span>
  );
};

export { Toggle };
