import React from 'react';
import {
    Box,
    ButtonBase,
    Chip,
    Divider,
    IconButton,
    InputBase,
    Popover,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ScheduleIcon from '@mui/icons-material/Schedule';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

interface TimeSpinnerProps {
    value: number;
    onChange: (value: number) => void;
    max: number;
    step?: number;
    disabled?: boolean;
}

function TimeSpinner({ value, onChange, max, step = 1, disabled = false }: TimeSpinnerProps) {
    const theme = useTheme();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const itemHeight = 32;
    const visibleItems = 5;

    const values = React.useMemo(() => {
        const arr: number[] = [];
        for (let i = 0; i <= max; i += step) {
            arr.push(i);
        }
        return arr;
    }, [max, step]);

    const valueIndex = values.indexOf(value);
    const selectedIndex = valueIndex >= 0 ? valueIndex : 0;

    const scrollToIndex = React.useCallback((index: number, smooth = true) => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: index * itemHeight,
                behavior: smooth ? 'smooth' : 'auto',
            });
        }
    }, []);

    React.useEffect(() => {
        scrollToIndex(selectedIndex, false);
    }, [scrollToIndex, selectedIndex]);

    const handleScroll = React.useCallback(() => {
        if (containerRef.current && !disabled) {
            const scrollTop = containerRef.current.scrollTop;
            const newIndex = Math.round(scrollTop / itemHeight);
            const clampedIndex = Math.max(0, Math.min(newIndex, values.length - 1));
            if (values[clampedIndex] !== value) {
                onChange(values[clampedIndex]);
            }
        }
    }, [disabled, onChange, value, values]);

    const handleScrollEnd = React.useCallback(() => {
        if (containerRef.current) {
            const scrollTop = containerRef.current.scrollTop;
            const newIndex = Math.round(scrollTop / itemHeight);
            const clampedIndex = Math.max(0, Math.min(newIndex, values.length - 1));
            scrollToIndex(clampedIndex);
        }
    }, [scrollToIndex, values.length]);

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let scrollTimeout: ReturnType<typeof setTimeout>;

        const onScroll = () => {
            handleScroll();
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(handleScrollEnd, 100);
        };

        container.addEventListener('scroll', onScroll);
        return () => {
            container.removeEventListener('scroll', onScroll);
            clearTimeout(scrollTimeout);
        };
    }, [handleScroll, handleScrollEnd]);

    const handleClick = (index: number) => {
        if (!disabled) {
            onChange(values[index]);
            scrollToIndex(index);
        }
    };

    return (
        <Box
            ref={containerRef}
            sx={{
                height: itemHeight * visibleItems,
                overflow: 'auto',
                position: 'relative',
                scrollSnapType: 'y mandatory',
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
            }}
        >
            <Box sx={{ height: itemHeight * 2 }} />
            {values.map((v, index) => (
                <Box
                    key={v}
                    onClick={() => handleClick(index)}
                    sx={{
                        height: itemHeight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        scrollSnapAlign: 'center',
                        cursor: disabled ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                        borderRadius: 1.5,
                        mx: 0.5,
                        fontWeight: index === selectedIndex ? 600 : 400,
                        fontSize: index === selectedIndex ? '1.1rem' : '0.9rem',
                        color: index === selectedIndex
                            ? theme.palette.primary.main
                            : alpha(theme.palette.text.primary, 0.4),
                        bgcolor: index === selectedIndex
                            ? alpha(theme.palette.primary.main, 0.08)
                            : 'transparent',
                        '&:hover': {
                            bgcolor: disabled ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
                        },
                    }}
                >
                    {v.toString().padStart(2, '0')}
                </Box>
            ))}
            <Box sx={{ height: itemHeight * 2 }} />
        </Box>
    );
}

interface TimeInputProps {
    hour: number;
    minute: number;
    onChange: (hour: number, minute: number) => void;
    disabled?: boolean;
    onOpenPicker: () => void;
}

function TimeInput({ hour, minute, onChange, disabled = false, onOpenPicker }: Readonly<TimeInputProps>) {
    const theme = useTheme();
    const [hourValue, setHourValue] = React.useState(hour.toString().padStart(2, '0'));
    const [minuteValue, setMinuteValue] = React.useState(minute.toString().padStart(2, '0'));
    const minuteInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setHourValue(hour.toString().padStart(2, '0'));
    }, [hour]);

    React.useEffect(() => {
        setMinuteValue(minute.toString().padStart(2, '0'));
    }, [minute]);

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
        setHourValue(val);
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
        setMinuteValue(val);
    };

    const commitHourChange = React.useCallback(() => {
        let h = parseInt(hourValue, 10);
        if (isNaN(h) || h < 0) h = 0;
        if (h > 23) h = 23;
        setHourValue(h.toString().padStart(2, '0'));
        return h;
    }, [hourValue]);

    const commitMinuteChange = React.useCallback(() => {
        let m = parseInt(minuteValue, 10);
        if (isNaN(m) || m < 0) m = 0;
        if (m > 59) m = 59;
        // Arredondar para múltiplo de 5
        m = Math.round(m / 5) * 5;
        if (m > 55) m = 55;
        setMinuteValue(m.toString().padStart(2, '0'));
        return m;
    }, [minuteValue]);

    const handleHourBlur = () => {
        const h = commitHourChange();
        onChange(h, minute);
    };

    const handleMinuteBlur = () => {
        const m = commitMinuteChange();
        onChange(hour, m);
    };

    const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ':') {
            e.preventDefault();
            const h = commitHourChange();
            onChange(h, minute);
            minuteInputRef.current?.focus();
            minuteInputRef.current?.select();
        }
    };

    const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const m = commitMinuteChange();
            onChange(hour, m);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                p: 0.75,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                border: 1,
                borderColor: 'divider',
            }}
        >
            <InputBase
                value={hourValue}
                onChange={handleHourChange}
                onBlur={handleHourBlur}
                onKeyDown={handleHourKeyDown}
                onFocus={(e) => e.target.select()}
                disabled={disabled}
                inputProps={{
                    maxLength: 2,
                    inputMode: 'numeric',
                    style: { textAlign: 'center' },
                }}
                sx={{
                    width: 32,
                    '& input': {
                        p: 0.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        borderRadius: 1,
                        '&:focus': {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                    },
                }}
            />
            <Typography
                sx={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    userSelect: 'none',
                }}
            >
                :
            </Typography>
            <InputBase
                inputRef={minuteInputRef}
                value={minuteValue}
                onChange={handleMinuteChange}
                onBlur={handleMinuteBlur}
                onKeyDown={handleMinuteKeyDown}
                onFocus={(e) => e.target.select()}
                disabled={disabled}
                inputProps={{
                    maxLength: 2,
                    inputMode: 'numeric',
                    style: { textAlign: 'center' },
                }}
                sx={{
                    width: 32,
                    '& input': {
                        p: 0.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        borderRadius: 1,
                        '&:focus': {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                    },
                }}
            />
            <Tooltip title="Selecionar horário">
                <IconButton
                    size="small"
                    onClick={onOpenPicker}
                    disabled={disabled}
                    sx={{
                        ml: 0.5,
                        color: 'text.secondary',
                        '&:hover': {
                            color: 'primary.main',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                    }}
                >
                    <ScheduleIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Tooltip>
        </Box>
    );
}

interface AndroidTimePickerProps {
    value: Dayjs | null;
    onChange: (hour: number, minute: number) => void;
    disabled?: boolean;
    label: string;
}

function AndroidTimePicker({ value, onChange, disabled = false, label }: AndroidTimePickerProps) {
    const theme = useTheme();
    const [showSpinner, setShowSpinner] = React.useState(false);
    const hour = value?.hour() ?? 9;
    const minute = value?.minute() ?? 0;

    const handleTimeChange = (h: number, m: number) => {
        onChange(h, m);
    };

    return (
        <Box sx={{ flex: 1 }}>
            <Typography
                variant="caption"
                sx={{
                    mb: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                }}
            >
                {label}
            </Typography>

            {!showSpinner ? (
                <TimeInput
                    hour={hour}
                    minute={minute}
                    onChange={handleTimeChange}
                    disabled={disabled}
                    onOpenPicker={() => setShowSpinner(true)}
                />
            ) : (
                <Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.25,
                            p: 0.5,
                            borderRadius: 1.5,
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            border: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <Box sx={{ width: 44 }}>
                            <TimeSpinner
                                value={hour}
                                onChange={(h) => onChange(h, minute)}
                                max={23}
                                disabled={disabled}
                            />
                        </Box>
                        <Typography
                            sx={{
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                color: 'text.secondary',
                                userSelect: 'none',
                            }}
                        >
                            :
                        </Typography>
                        <Box sx={{ width: 44 }}>
                            <TimeSpinner
                                value={minute}
                                onChange={(m) => onChange(hour, m)}
                                max={55}
                                step={5}
                                disabled={disabled}
                            />
                        </Box>
                    </Box>
                    <ButtonBase
                        onClick={() => setShowSpinner(false)}
                        sx={{
                            mt: 0.5,
                            width: '100%',
                            py: 0.25,
                            fontSize: '0.7rem',
                            color: 'primary.main',
                            borderRadius: 1,
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                            },
                        }}
                    >
                        Digitar
                    </ButtonBase>
                </Box>
            )}
        </Box>
    );
}

export type DateTimeRange = {
    start: Dayjs | null;
    end: Dayjs | null;
};

export interface DateTimeRangeFieldProps {
    value: DateTimeRange;
    onChange: (value: DateTimeRange) => void;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    minDateTime?: Dayjs;
    fullWidth?: boolean;
    defaultDurationMinutes?: number; // Duração padrão em minutos quando não há valor definido
}

const formatDisplayDate = (date: Dayjs | null): string => {
    if (!date) return '—';

    const formatted = date.format('DD MMM YYYY');
    return formatted.replace(
        /(\d{2}) (\w{3}) (\d{4})/,
        (_, day, month, year) =>
            `${day} ${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`
    );
};

const formatDisplayDateRange = (start: Dayjs | null, end: Dayjs | null): string => {
    if (!start) return '—';
    if (!end || start.isSame(end, 'day')) return formatDisplayDate(start);

    // Se mesmo mês e ano, formato compacto
    if (start.isSame(end, 'month')) {
        return `${start.format('DD')} - ${end.format('DD MMM YYYY')}`.replace(
            /(\d{2}) (\w{3}) (\d{4})/,
            (_, day, month, year) =>
                `${day} ${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`
        );
    }

    return `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`;
};

const formatDisplayTime = (date: Dayjs | null): string => {
    if (!date) return '--:--';
    return date.format('HH:mm');
};

const calculateDuration = (start: Dayjs | null, end: Dayjs | null): string | null => {
    if (!start || !end) return null;
    const diffMinutes = end.diff(start, 'minute');
    if (diffMinutes <= 0) return null;

    // Se for mais de um dia, exibe em dias
    const diffDays = end.diff(start, 'day');
    if (diffDays >= 1) {
        const remainingHours = Math.floor((diffMinutes % (24 * 60)) / 60);
        if (remainingHours === 0) {
            return diffDays === 1 ? '1 dia' : `${diffDays} dias`;
        }
        const daysText = diffDays === 1 ? '1 dia' : `${diffDays} dias`;
        return `${daysText} ${remainingHours}h`;
    }

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
};

export default function DateTimeRangeField({
    value,
    onChange,
    label = 'Data',
    disabled = false,
    error = false,
    helperText,
    minDateTime,
    fullWidth = false,
    defaultDurationMinutes = 60,
}: DateTimeRangeFieldProps) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [tempValue, setTempValue] = React.useState<DateTimeRange>(value);
    const [isHovered, setIsHovered] = React.useState(false);
    const [selectingEnd, setSelectingEnd] = React.useState(false);

    const open = Boolean(anchorEl);

    React.useEffect(() => {
        if (open) {
            if (!value.start || !value.end) {
                const now = dayjs();
                const start = now.minute(Math.ceil(now.minute() / 5) * 5).second(0);
                const duration = defaultDurationMinutes > 0 ? defaultDurationMinutes : 60;
                const end = start.add(duration, 'minute');
                setTempValue({ start, end });
            } else {
                setTempValue(value);
            }
            setSelectingEnd(false);
        }
    }, [open, value, defaultDurationMinutes]);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        if (disabled) return;
        const target = event.currentTarget;

        // Scroll para garantir espaço abaixo do campo
        setTimeout(() => {
            const rect = target.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const popoverHeight = 420; // altura aproximada do popover

            if (spaceBelow < popoverHeight) {
                const scrollNeeded = popoverHeight - spaceBelow + 20;
                window.scrollBy({ top: scrollNeeded, behavior: 'smooth' });
            }
        }, 0);

        setAnchorEl(target);
    };

    const handleClose = () => {
        setAnchorEl(null);
        if (tempValue.start && tempValue.end && tempValue.end.isAfter(tempValue.start)) {
            onChange(tempValue);
        }
    };

    const handleStartDateChange = (newDate: Dayjs | null) => {
        if (!newDate) return;

        const startTime = tempValue.start || dayjs().hour(9).minute(0);

        const newStart = newDate
            .hour(startTime.hour())
            .minute(startTime.minute())
            .second(0);

        let newEnd = tempValue.end;

        // Se a data fim for anterior à nova data início, ajusta
        if (newEnd && newStart.isAfter(newEnd)) {
            newEnd = newStart.add(defaultDurationMinutes || 60, 'minute');
        }

        setTempValue({ start: newStart, end: newEnd });
    };

    const handleEndDateChange = (newDate: Dayjs | null) => {
        if (!newDate || !tempValue.start) return;

        const endTime = tempValue.end || tempValue.start.add(1, 'hour');

        let newEnd = newDate
            .hour(endTime.hour())
            .minute(endTime.minute())
            .second(0);

        // Se a data fim for anterior ou igual à data início, ajusta o horário
        if (newEnd.isBefore(tempValue.start) || newEnd.isSame(tempValue.start)) {
            newEnd = tempValue.start.add(defaultDurationMinutes || 60, 'minute');
        }

        setTempValue({ ...tempValue, end: newEnd });
    };

    const handleStartTimeChange = (hour: number, minute: number) => {
        if (!tempValue.start) return;

        const newStart = tempValue.start
            .hour(hour)
            .minute(minute)
            .second(0);

        let newEnd = tempValue.end;
        // Só ajusta automaticamente se for mesmo dia
        if (newEnd && tempValue.start.isSame(tempValue.end, 'day') && newStart.isAfter(newEnd)) {
            newEnd = newStart.add(defaultDurationMinutes || 60, 'minute');
        }

        setTempValue({ start: newStart, end: newEnd });
    };

    const handleEndTimeChange = (hour: number, minute: number) => {
        if (!tempValue.end) return;

        const newEnd = tempValue.end
            .hour(hour)
            .minute(minute)
            .second(0);

        // Se for mesmo dia e horário fim for antes do início, não permite
        if (tempValue.start?.isSame(newEnd, 'day') && (newEnd.isBefore(tempValue.start) || newEnd.isSame(tempValue.start))) {
            setTempValue({ ...tempValue, end: tempValue.start.add(5, 'minute') });
            return;
        }

        setTempValue({ ...tempValue, end: newEnd });
    };

    const duration = calculateDuration(value.start, value.end);
    const hasValue = value.start && value.end;
    const isValid = hasValue && value.end!.isAfter(value.start!);

    const borderColor = error
        ? theme.palette.error.main
        : open
            ? theme.palette.primary.main
            : isHovered
                ? alpha(theme.palette.primary.main, 0.5)
                : theme.palette.divider;

    const localeText = {
        okButtonLabel: 'OK',
        cancelButtonLabel: 'Cancelar',
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br" localeText={localeText}>
            <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
                <ButtonBase
                    onClick={handleOpen}
                    disabled={disabled}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    sx={{
                        width: fullWidth ? '100%' : 'auto',
                        minWidth: 380,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        p: 1.5,
                        px: 2,
                        borderRadius: 2,
                        border: 1,
                        borderColor: borderColor,
                        bgcolor: disabled
                            ? alpha(theme.palette.action.disabled, 0.04)
                            : isHovered
                                ? alpha(theme.palette.primary.main, 0.02)
                                : 'background.paper',
                        transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isHovered && !disabled ? 'scale(1.005)' : 'scale(1)',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        boxShadow: isHovered && !disabled
                            ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`
                            : 'none',
                        '&:focus-visible': {
                            outline: 'none',
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
                        },
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: isHovered || open
                                ? alpha(theme.palette.primary.main, 0.1)
                                : alpha(theme.palette.text.secondary, 0.06),
                            transition: 'all 180ms ease',
                            flexShrink: 0,
                        }}
                    >
                        <CalendarTodayIcon
                            sx={{
                                fontSize: 18,
                                color: isHovered || open ? 'primary.main' : 'text.secondary',
                                transition: 'color 180ms ease',
                            }}
                        />
                    </Box>

                    <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ minWidth: 100 }}>
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: '0.8rem',
                                    letterSpacing: 0.5,
                                    color: 'text.secondary',
                                    display: 'block',
                                    mb: 0.25,
                                }}
                            >
                                {label}
                            </Typography>
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    color: hasValue ? 'text.primary' : 'text.disabled',
                                }}
                            >
                                {formatDisplayDateRange(value.start, value.end)}
                            </Typography>
                        </Box>

                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                        <Box>
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: '0.8rem',
                                    letterSpacing: 0.5,
                                    color: 'text.secondary',
                                    display: 'block',
                                    mb: 0.25,
                                }}
                            >
                                Horário
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                                <Typography
                                    component="span"
                                    sx={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: hasValue ? 'text.primary' : 'text.disabled',
                                    }}
                                >
                                    {formatDisplayTime(value.start)}
                                </Typography>
                                <Typography
                                    component="span"
                                    sx={{
                                        fontSize: '0.9rem',
                                        color: 'text.secondary',
                                    }}
                                >
                                    -
                                </Typography>
                                <Typography
                                    component="span"
                                    sx={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: hasValue ? 'text.primary' : 'text.disabled',
                                    }}
                                >
                                    {formatDisplayTime(value.end)}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                        {isValid && duration && (
                            <Chip
                                label={duration}
                                size="small"
                                sx={{
                                    height: 20,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    borderRadius: 1,
                                    '& .MuiChip-label': { px: 1 },
                                }}
                            />
                        )}

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                                borderRadius: 1,
                                opacity: isHovered || open ? 1 : 0,
                                transform: isHovered || open ? 'translateX(0)' : 'translateX(4px)',
                                transition: 'all 180ms ease',
                            }}
                        >
                            <EditRoundedIcon
                                sx={{
                                    fontSize: 14,
                                    color: 'primary.main',
                                }}
                            />
                        </Box>
                    </Stack>
                </ButtonBase>

                {helperText && (
                    <Typography
                        variant="caption"
                        sx={{
                            mt: 0.5,
                            ml: 1.5,
                            display: 'block',
                            color: error ? 'error.main' : 'text.secondary',
                        }}
                    >
                        {helperText}
                    </Typography>
                )}

                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    slotProps={{
                        paper: {
                            sx: {
                                mt: 1,
                                borderRadius: 3,
                                boxShadow: `0 16px 40px ${alpha(theme.palette.common.black, 0.12)}`,
                                border: 1,
                                borderColor: 'divider',
                                overflow: 'visible',
                            },
                        },
                    }}
                >
                    <Box sx={{ display: 'flex' }}>
                        <Box sx={{ borderRight: 1, borderColor: 'divider' }}>
                            {/* Tabs para início/fim */}
                            <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
                                <ButtonBase
                                    onClick={() => setSelectingEnd(false)}
                                    sx={{
                                        flex: 1,
                                        py: 1,
                                        px: 2,
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        color: !selectingEnd ? 'primary.main' : 'text.secondary',
                                        bgcolor: !selectingEnd ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                        borderBottom: !selectingEnd ? 2 : 0,
                                        borderColor: 'primary.main',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <Stack alignItems="center" spacing={0.25}>
                                        <Typography sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            Início
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                            {tempValue.start?.format('DD/MM')}
                                        </Typography>
                                    </Stack>
                                </ButtonBase>
                                <ButtonBase
                                    onClick={() => setSelectingEnd(true)}
                                    sx={{
                                        flex: 1,
                                        py: 1,
                                        px: 2,
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        color: selectingEnd ? 'primary.main' : 'text.secondary',
                                        bgcolor: selectingEnd ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                        borderBottom: selectingEnd ? 2 : 0,
                                        borderColor: 'primary.main',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <Stack alignItems="center" spacing={0.25}>
                                        <Typography sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            Fim
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                            {tempValue.end?.format('DD/MM')}
                                        </Typography>
                                    </Stack>
                                </ButtonBase>
                            </Box>

                            <DateCalendar
                                value={selectingEnd ? tempValue.end : tempValue.start}
                                onChange={selectingEnd ? handleEndDateChange : handleStartDateChange}
                                minDate={selectingEnd ? tempValue.start || minDateTime : minDateTime}
                                views={['day']}
                                dayOfWeekFormatter={(date) => {
                                    const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
                                    return days[date.day()];
                                }}
                                sx={{
                                    '& .MuiPickersCalendarHeader-label': {
                                        textTransform: 'capitalize',
                                        pointerEvents: 'none',
                                    },
                                    '& .MuiPickersCalendarHeader-switchViewButton': {
                                        display: 'none',
                                    },
                                    '& .MuiPickersDay-root': {
                                        borderRadius: 1.5,
                                        transition: 'all 0.15s ease',
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.main',
                                            '&:hover': { bgcolor: 'primary.dark' },
                                        },
                                    },
                                    '& .MuiPickersDay-today': {
                                        border: 2,
                                        borderColor: 'primary.main',
                                    },
                                }}
                            />
                        </Box>

                        <Box sx={{ width: 340, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 2, pb: 1.5 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        mb: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 0.5,
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        letterSpacing: 0.5,
                                        textTransform: 'uppercase',
                                        color: 'text.secondary',
                                    }}
                                >
                                    <AccessTimeIcon sx={{ fontSize: 12 }} />
                                    Horário
                                </Typography>
                                <Stack direction="row" spacing={1.5} alignItems="stretch">
                                    <AndroidTimePicker
                                        value={tempValue.start}
                                        onChange={handleStartTimeChange}
                                        disabled={!tempValue.start}
                                        label="Início"
                                    />
                                    <AndroidTimePicker
                                        value={tempValue.end}
                                        onChange={handleEndTimeChange}
                                        disabled={!tempValue.end}
                                        label="Fim"
                                    />
                                </Stack>
                            </Box>

                            {tempValue.start && tempValue.end && tempValue.end.isAfter(tempValue.start) && (
                                <Box
                                    sx={{
                                        mx: 2,
                                        p: 0.5,
                                        bgcolor: alpha(theme.palette.success.main, 0.08),
                                        borderRadius: 1.5,
                                        border: 1,
                                        borderColor: alpha(theme.palette.success.main, 0.2),
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontWeight: 500, fontSize: '0.65rem' }}
                                    >
                                        Duração
                                    </Typography>
                                    <Typography
                                        color="success.main"
                                        sx={{ fontWeight: 700, fontSize: '1rem' }}
                                    >
                                        {calculateDuration(tempValue.start, tempValue.end)}
                                    </Typography>
                                </Box>
                            )}

                            <Box sx={{ p: 2, mt: 'auto' }}>
                                <ButtonBase
                                    onClick={handleClose}
                                    disabled={!tempValue.start || !tempValue.end || !tempValue.end.isAfter(tempValue.start)}
                                    sx={{
                                        width: '100%',
                                        py: 1,
                                        borderRadius: 2,
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        fontWeight: 600,
                                        transition: 'all 0.15s ease',
                                        '&:hover': {
                                            bgcolor: 'primary.dark',
                                        },
                                        '&:disabled': {
                                            bgcolor: 'action.disabledBackground',
                                            color: 'action.disabled',
                                        },
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        Confirmar
                                    </Typography>
                                </ButtonBase>
                            </Box>
                        </Box>
                    </Box>
                </Popover>
            </Box>
        </LocalizationProvider>
    );
}
