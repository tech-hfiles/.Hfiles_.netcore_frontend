// src/types/form.types.ts
export interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  contactNumber: string;
  email: string;
  gender: string;
  bloodGroup: string;
  pincode: string;
  state: string;
  city: string;
  emergencyContact: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface State {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
}

export interface LocationData {
  state: string;
  city: string;
}

export interface UserProfile extends FormData {
  profileImage?: string;
}

// src/hooks/useForm.ts
import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit?: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  }, [errors]);

  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    // Validate single field on blur
    if (validate) {
      const fieldErrors = validate(values);
      if (fieldErrors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: fieldErrors[name],
        }));
      }
    }
  }, [validate, values]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);

    // Validate all fields
    if (validate) {
      const newErrors = validate(values);
      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setFieldValue,
    setFieldError,
    setErrors,
  };
}

// src/hooks/useImageUpload.ts
import { useState, useCallback } from 'react';

interface UseImageUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onError?: (error: string) => void;
}

export function useImageUpload({
  maxSize = 5 * 1024 * 1024, // 5MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'],
  onError,
}: UseImageUploadOptions = {}) {
  const [preview, setPreview] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > maxSize) {
      const error = `File size must be less than ${maxSize / (1024 * 1024)}MB`;
      onError?.(error);
      return;
    }

    // Validate file type
    if (!allowedTypes.includes(selectedFile.type)) {
      const error = `Only ${allowedTypes.join(', ')} files are allowed`;
      onError?.(error);
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }, [maxSize, allowedTypes, onError]);

  const reset = useCallback(() => {
    setPreview('');
    setFile(null);
    setIsUploading(false);
  }, []);

  const upload = useCallback(async (uploadFn: (file: File) => Promise<string>) => {
    if (!file) return null;

    setIsUploading(true);
    try {
      const result = await uploadFn(file);
      return result;
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Upload failed');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [file, onError]);

  return {
    preview,
    file,
    isUploading,
    handleFileChange,
    reset,
    upload,
  };
}

// src/hooks/useAsync.ts
import { useState, useEffect, useCallback } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      });
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}

// src/components/common/FormField.tsx
import React from 'react';

interface FormFieldProps {
  icon: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  max?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const FormField: React.FC<FormFieldProps> = ({
  icon,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  maxLength,
  max,
  className = '',
  style,
}) => {
  return (
    <div className="col-12">
      <i className={`${icon} form-control-feedback`}></i>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`form-control ${className} ${error ? 'error' : ''}`}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        max={max}
        style={style}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

// src/components/common/SelectField.tsx
import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  icon: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  options: Option[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  icon,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  required = false,
  disabled = false,
  className = '',
  style,
}) => {
  return (
    <div className="col-12">
      <i className={`${icon} form-control-feedback`}></i>
      <select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`form-select form-control mySelect ${className} ${error ? 'error' : ''}`}
        required={required}
        disabled={disabled}
        style={style}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

// src/components/common/LoadingButton.tsx
import React from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status">
            <span className="sr-only">Loading...</span>
          </span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};