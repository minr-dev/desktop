import AppContext from '@renderer/components/AppContext';
import { useContext, useEffect, useRef } from 'react';
import { FieldValues, SubmitHandler, useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { getLogger } from '@renderer/utils/LoggerUtil';

interface UseFormManagerProps<TFieldValue extends FieldValues> extends UseFormProps<TFieldValue> {
  formId: string;
  isVisible?: boolean;
}

const logger = getLogger('FormContainer');

/**
 * form の入れ子をサポートするための、useForm の handleSubmit を上書きしたフック
 *
 * ネストしないことが分かっている場合は、通常の useForm でもよい
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
export const useFormManager = <TFieldValue extends FieldValues>({
  formId,
  isVisible = true,
  ...useFormProps
}: UseFormManagerProps<TFieldValue>): UseFormReturn<TFieldValue> => {
  const { pushForm, removeForm, isLastForm } = useContext(AppContext);
  const methods = useForm(useFormProps);
  const { handleSubmit } = methods;

  // アンマウント時の処理について
  // フックのアンマウント時に1回だけ実行されることを確実にするために、
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
    if (logger.isDebugEnabled()) logger.debug('useFormManager was unmounted.');
    return () => {
      if (cleanupFunctionRef.current) {
        cleanupFunctionRef.current();
      }
    };
  }, []);

  // formの構成が変わった時に、スタックを更新する
  useEffect(() => {
    if (logger.isDebugEnabled()) logger.debug('FormContainer useEffect', formId, isVisible);
    if (isVisible && !isLastForm(formId)) {
      if (logger.isDebugEnabled()) logger.debug('pushForm isVisible', formId);
      pushForm(formId);
    } else if (!isVisible && isLastForm(formId)) {
      if (logger.isDebugEnabled()) logger.debug('popForm !isVisible', formId);
      removeForm(formId);
    }
  }, [formId, isLastForm, isVisible, removeForm, pushForm]);

  /**
   * form の submit イベントハンドラー
   *
   * アクティブなformのsubmitだけを処理して、非アクティブなformのsubmitはイベントの伝搬を止める。
   *
   * @param {Function} onSubmit
   * @returns {Function}
   */
  const handleSubmitActiveForm =
    (onSubmit: SubmitHandler<TFieldValue>) =>
    async (e): Promise<void> => {
      if (!isLastForm(formId)) {
        e.preventDefault();
        return;
      }
      handleSubmit((data) => {
        onSubmit(data);
      })(e);
    };

  return { ...methods, handleSubmit: handleSubmitActiveForm };
};
