import AppContext from '@renderer/components/AppContext';
import { ReactNode, useContext, useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import rendererContainer from '../../../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';
import { TYPES } from '@renderer/types';

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
  const { pushForm, removeForm, isLastForm } = useContext(AppContext);
  const methods = useForm();
  const { handleSubmit } = methods;

  const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  const logger = loggerFactory.getLogger({ processType: 'renderer', loggerName: 'FormContainer' });

  // アンマウント時の処理について
  // コンポーネントのアンマウント時に1回だけ実行されることを確実にするために、
  // useEffect の依存配列には何も入れてはいけない。
  // cleanupFunctionRef.current を関数にしているのも、依存配列を使わないためで、
  // こうすることで、依存配列を使わなくて済む。
  const cleanupFunctionRef = useRef<(() => void) | null>(null);
  cleanupFunctionRef.current = (): void => {
    if (isLastForm(formId)) {
      removeForm(formId);
    }
  };
  useEffect(() => {
    return () => {
      if (cleanupFunctionRef.current) {
        cleanupFunctionRef.current();
      }
    };
  }, []);

  // formの構成が変わった時に、スタックを更新する
  useEffect(() => {
    logger.info(`FormContainer useEffect: formId=${formId}, isVisible=${isVisible}`);
    if (isVisible && !isLastForm(formId)) {
      logger.info(`pushForm isVisible: ${formId}`);
      pushForm(formId);
    } else if (!isVisible && isLastForm(formId)) {
      logger.info(`popForm !isVisible: ${formId}`);
      removeForm(formId);
    }
  }, [formId, isLastForm, isVisible, removeForm, pushForm, logger]);

  /**
   * form の submit イベントハンドラー
   *
   * アクティブなformのsubmitだけを処理して、非アクティブなformのsubmitはイベントの伝搬を止める。
   *
   * @param {Function} onSubmit
   * @returns {Function}
   */
  const handleSubmitActiveForm = (e: React.FormEvent, onSubmit: (formData) => void): void => {
    if (!isLastForm(formId)) {
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
