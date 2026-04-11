import { alpha, SxProps, Theme } from '@mui/material';

export const getCalendarStyles = (): SxProps<Theme> => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '16px',

    // FullCalendar base
    '& .fc': { height: '100%', fontFamily: 'inherit' },

    // Toolbar
    '& .fc-toolbar': {
        padding: '12px 20px',
        marginBottom: 0,
        backgroundColor: '#fafafa',
        borderBottom: '1px solid #ebebeb',
    },
    '& .fc-toolbar-title': {
        fontSize: '1rem',
        fontWeight: 700,
        color: '#111',
        textTransform: 'capitalize',
    },

    // Botões
    '& .fc-button': {
        backgroundColor: '#fff',
        borderColor: '#e0e0e0',
        color: '#444',
        textTransform: 'capitalize',
        fontWeight: 600,
        fontSize: '0.78rem',
        padding: '5px 14px',
        borderRadius: '8px',
        boxShadow: 'none',
        transition: 'all 0.15s ease',
        '&:hover': { backgroundColor: '#f5f5f5', borderColor: '#bbb' },
        '&:focus': { boxShadow: 'none' },
        '&.fc-button-active': {
            backgroundColor: '#1976d2',
            borderColor: '#1976d2',
            color: '#fff',
            boxShadow: `0 2px 6px ${alpha('#1976d2', 0.35)}`,
        },
    },
    '& .fc-button-group .fc-button': {
        borderRadius: 0,
        '&:first-of-type': { borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' },
        '&:last-of-type': { borderTopRightRadius: '8px', borderBottomRightRadius: '8px' },
    },
    '& .fc-prev-button, & .fc-next-button': { padding: '5px 9px' },

    // Header colunas
    '& .fc-col-header-cell': {
        backgroundColor: '#fafafa',
        padding: '10px 0',
        fontWeight: 700,
        fontSize: '0.72rem',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        borderBottom: '1px solid #ebebeb',
    },

    // Dia atual
    '& .fc-daygrid-day.fc-day-today': { backgroundColor: alpha('#1976d2', 0.04) },
    '& .fc-timegrid-col.fc-day-today': { backgroundColor: alpha('#1976d2', 0.04) },
    '& .fc-day-today .fc-daygrid-day-number': {
        backgroundColor: (theme: Theme) => theme.palette.primary.main,
        color: '#fff',
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '4px',
    },
    '& .fc-daygrid-day-number': {
        padding: '8px',
        fontSize: '0.85rem',
        fontWeight: 500,
        color: '#444',
    },

    // Eventos daygrid (mês)
    '& .fc-daygrid-event': {
        borderRadius: '6px',
        padding: 0,
        margin: '1px 3px',
        border: 'none',
        backgroundColor: 'transparent',
    },
    '& .fc-daygrid-event-harness': { marginTop: '2px' },
    '& .fc-daygrid-more-link': {
        fontSize: '0.72rem',
        color: '#1976d2',
        fontWeight: 600,
        padding: '2px 6px',
    },

    // Slots (timegrid)
    '& .fc-timegrid-slot': {
        borderColor: alpha('#000', 0.05),
        height: '48px',
    },
    '& .fc-timegrid-slot-label': {
        fontSize: '0.72rem',
        fontWeight: 600,
        color: '#999',
        paddingRight: '8px',
    },
    '& .fc-timegrid-axis': {
        backgroundColor: '#fafafa',
        borderRight: '1px solid #ebebeb',
    },

    // Eventos timegrid (semana/dia)
    '& .fc-timegrid-event-harness': {
        paddingRight: '3px',
    },
    '& .fc-timegrid-event': {
        borderRadius: '10px',
        border: 'none',
        backgroundColor: 'transparent',
        padding: '0 !important',
        marginRight: '3px',
    },
    '& .fc-timegrid-event .fc-event-main': {
        padding: 0,
        height: '100%',
    },

    // Now indicator
    '& .fc-timegrid-now-indicator-line': {
        borderColor: alpha('#1976d2', 0.4),
        borderWidth: '1px',
    },
    '& .fc-timegrid-now-indicator-arrow': {
        borderColor: alpha('#1976d2', 0.4),
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        width: '6px',
        height: '6px',
    },

    // Grid
    '& .fc-scrollgrid': { borderColor: '#ebebeb' },
    '& .fc-scrollgrid td, & .fc-scrollgrid th': { borderColor: '#ebebeb' },

    // Seleção
    '& .fc-highlight': { backgroundColor: alpha('#1976d2', 0.1), borderRadius: '6px' },

    // Popover
    '& .fc-popover': {
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        border: '1px solid #ebebeb',
    },
    '& .fc-popover-header': { padding: '10px 14px', fontWeight: 700, fontSize: '0.85rem' },
    '& .fc-popover-body': { padding: '8px', maxHeight: '280px', overflowY: 'auto' },

    // Hover geral em células
    '& .fc-daygrid-day:hover': { backgroundColor: alpha('#1976d2', 0.02) },
    '& .fc-timegrid-col:hover': { backgroundColor: alpha('#1976d2', 0.02) },
    '& .fc-event': { cursor: 'pointer' },

    // Estado de drag
    '& .fc-event-dragging': {
        opacity: '1 !important',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18) !important',
        zIndex: '999 !important',
        transform: 'scale(1.02)',
    },
    '& .fc-event-mirror': {
        opacity: '0.75 !important',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15) !important',
    },
});
