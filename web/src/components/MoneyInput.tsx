import React from 'react';
import { InputAdornment, TextField, TextFieldProps } from '@mui/material';

type MoneyInputProps = Omit<TextFieldProps, 'value' | 'onChange'> & {
    value: number | undefined | null;
    onChange: (value: number) => void;
    allowZero?: boolean;
};

export default function MoneyInput({
    value,
    onChange,
    slotProps,
    allowZero = true,
    ...props
}: MoneyInputProps) {
    const [displayValue, setDisplayValue] = React.useState<string>('');
    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
        if (!isFocused) {
            if (value === undefined || value === null) {
                setDisplayValue(allowZero ? '0.00' : '');
            } else if (value === 0) {
                setDisplayValue(allowZero ? '0.00' : '');
            } else {
                setDisplayValue(value.toFixed(2));
            }
        }
    }, [value, isFocused, allowZero]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setDisplayValue(inputValue);

        const parsed = parseFloat(inputValue);
        if (!isNaN(parsed)) {
            const rounded = Math.round(parsed * 100) / 100;
            onChange(rounded);
        } else if (inputValue === '' || inputValue === '-') {
            onChange(0);
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (value !== undefined && value !== null && value !== 0) {
            setDisplayValue(value.toFixed(2));
        } else {
            setDisplayValue(allowZero ? '0.00' : '');
        }
    };

    return (
        <TextField
            {...props}
            type="number"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            slotProps={{
                ...slotProps,
                input: {
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    ...(slotProps?.input as object),
                },
            }}
        />
    );
}
