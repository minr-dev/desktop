import AppContext from '@renderer/components/AppContext';
import { ReactNode, useContext, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

interface FormContainerProps {
  formId: string;
  children: ReactNode;
  onSubmit: (formData) => void;
  isVisible?: boolean;
  ref?: React.RefObject<HTMLFormElement>;
}

/**
 * form の入れ子をサポートするためのコンポーネント
 *
 * ネストしないことが分かっている場合は、このコンポーネントを使わなくて良い
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
export const FormContainer = ({
  formId,
  children,
  onSubmit,
  isVisible = true,
  ref,
  ...formProps
}: FormContainerProps): JSX.Element => {
  const { pushForm, popForm, getActiveForm } = useContext(AppContext);
  const methods = useForm();
  const { handleSubmit } = methods;

  useEffect(() => {
    if (isVisible && getActiveForm() !== formId) {
      pushForm(formId);
    } else if (!isVisible && getActiveForm() === formId) {
      popForm();
    }
    return () => {
      if (getActiveForm() === formId) {
        popForm();
      }
    };
  }, [formId, getActiveForm, isVisible, popForm, pushForm]);

  /**
   * handleSubmitActiveForm
   * @param {Function} onSubmit
   * @returns {Function}
   */
  const handleSubmitActiveForm = (e: React.FormEvent, onSubmit: (formData) => void): void => {
    if (getActiveForm() !== formId) {
      e.preventDefault();
      return;
    }
    handleSubmit((data) => {
      onSubmit(data);
    })(e);
  };

  return (
    <FormProvider {...methods}>
      <form {...formProps} ref={ref} onSubmit={(e): void => handleSubmitActiveForm(e, onSubmit)}>
        {children}
      </form>
    </FormProvider>
  );
};
