import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiInputBase-root.Mui-disabled': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'rgba(0, 0, 0, 0.4)',
                    },
                    '& .MuiInputLabel-root.Mui-disabled': {
                        color: 'rgba(0, 0, 0, 0.6)',
                    },
                    '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.15)',
                    },
                },
            },
        },
        MuiAutocomplete: {
            styleOverrides: {
                root: {
                    '& .MuiInputBase-root.Mui-disabled': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'rgba(0, 0, 0, 0.7)',
                    },
                },
            },
        },
        MuiInputAdornment: {
            styleOverrides: {
                root: {
                    '& .MuiTypography-root': {
                        color: 'inherit',
                    },
                },
            },
        },
    },
});

export default theme;
