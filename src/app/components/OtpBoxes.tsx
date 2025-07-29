import React, { useEffect, useRef, useState } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  error?: string | false;
}

const OtpBoxes: React.FC<Props> = ({ value, onChange, onBlur, error }) => {
  const length = 6;
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const digits = value.split('').slice(0, length);
    const filled = Array(length).fill('').map((_, i) => digits[i] || '');
    setOtp(filled);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) return;

    const updated = [...otp];
    updated[idx] = val[0];
    setOtp(updated);
    onChange(updated.join(''));

    if (val && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      if (otp[idx]) {
        const updated = [...otp];
        updated[idx] = '';
        setOtp(updated);
        onChange(updated.join(''));
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted.length) {
      const updated = Array(length).fill('').map((_, i) => pasted[i] || '');
      setOtp(updated);
      onChange(pasted);
      inputsRef.current[Math.min(pasted.length - 1, length - 1)]?.focus();
    }
  };

  return (
      <div className="flex justify-center items-center flex-wrap gap-2 p-2 sm:p-3 border border-black rounded-lg mb-2">
    {otp.map((digit, idx) => (
      <input
        key={idx}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={digit}
        onChange={(e) => handleChange(e, idx)}
        onKeyDown={(e) => handleKeyDown(e, idx)}
        onPaste={handlePaste}
        onBlur={onBlur}
        ref={(el:any) => (inputsRef.current[idx] = el)}
        className={`w-7 h-12 sm:w-12 sm:h-10 text-center border-b 
        text-base sm:text-xl font-semibold tracking-widest focus:outline-none bg-transparent`}
      />
    ))}
  </div>
  );
};

export default OtpBoxes;
