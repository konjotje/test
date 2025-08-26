import { useState, useCallback } from 'react';
import { LoadingState, ApiResponse } from '../types';

/**
 * Custom hook for handling async operations with loading states and error handling
 * Provides consistent loading, error, and success states across the application
 */
export function useAsyncOperation<T = void>() {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: undefined,
  });

  const execute = useCallback(
    async (
      operation: () => Promise<T>,
      onSuccess?: (result: T) => void,
      onError?: (error: string) => void
    ): Promise<ApiResponse<T>> => {
      setState({ isLoading: true, error: undefined });

      try {
        const result = await operation();
        setState({ isLoading: false, error: undefined });
        
        if (onSuccess) {
          onSuccess(result);
        }

        return {
          success: true,
          data: result,
          message: 'Operatie succesvol uitgevoerd'
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden';
        setState({ isLoading: false, error: errorMessage });
        
        if (onError) {
          onError(errorMessage);
        }

        console.error('Async operation failed:', error);

        return {
          success: false,
          error: errorMessage,
          message: 'Operatie mislukt'
        };
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, error: undefined });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook specifically for form submissions with validation
 */
export function useFormSubmission<TData, TResult = void>(
  submitFunction: (data: TData) => Promise<TResult>,
  validator?: (data: TData) => { isValid: boolean; errors: string[] }
) {
  const { execute, isLoading, error, reset } = useAsyncOperation<TResult>();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const submit = useCallback(
    async (data: TData, onSuccess?: (result: TResult) => void): Promise<boolean> => {
      // Reset previous validation errors
      setValidationErrors([]);

      // Validate if validator is provided
      if (validator) {
        const validation = validator(data);
        if (!validation.isValid) {
          setValidationErrors(validation.errors);
          return false;
        }
      }

      const result = await execute(
        () => submitFunction(data),
        onSuccess,
        (error) => console.error('Form submission error:', error)
      );

      return result.success;
    },
    [execute, submitFunction, validator]
  );

  const resetForm = useCallback(() => {
    reset();
    setValidationErrors([]);
  }, [reset]);

  return {
    submit,
    isLoading,
    error,
    validationErrors,
    reset: resetForm,
    hasErrors: !!error || validationErrors.length > 0,
    allErrors: [...validationErrors, ...(error ? [error] : [])],
  };
}