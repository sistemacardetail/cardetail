import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../login/LoginService';
import { useAuth } from '../Main';
import { PERMISSOES } from '../contexts/AuthContext';
import { useUnsavedChangesContext } from '../contexts/UnsavedChangesContext';
import {
    AccountCircle,
    AddBox,
    AirportShuttle,
    AutoAwesome,
    AutoFixHigh,
    Build,
    Business,
    CalendarMonth,
    ChevronLeft,
    ChevronRight,
    Dashboard,
    Diamond,
    DirectionsCar,
    DisplaySettings,
    ExpandLess,
    ExpandMore,
    Insights,
    LocalOffer,
    Logout,
    Menu as MenuIcon,
    NoCrash,
    NotificationsOutlined,
    Palette,
    People,
    ReceiptLong,
    RequestPage,
    Security,
    Settings,
    ShoppingCart,
} from '@mui/icons-material';
import {
    alpha,
    AppBar,
    Avatar,
    Badge,
    Box,
    Collapse,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useEmpresa } from '../contexts/EmpresaContext';

interface MenuItem {
    text: string;
    icon: React.ReactNode;
    path: string;
    description: string;
    permissao?: string;
    children?: MenuItem[];
    disabled?: boolean;
}

const menuItems: MenuItem[] = [
    {
        text: 'Dashboard',
        icon: <Dashboard />,
        path: '/app',
        description: 'Visão geral do sistema',
    },
    {
        text: 'Clientes',
        icon: <People />,
        path: '/app/clientes',
        description: 'Gerenciar clientes',
        permissao: PERMISSOES.CLIENTES_VISUALIZAR,
    },
    {
        text: 'Agendamentos',
        icon: <CalendarMonth />,
        path: '/app/agendamentos',
        description: 'Agenda de serviços',
        permissao: PERMISSOES.AGENDAMENTOS_VISUALIZAR,
    },
    {
        text: 'Orçamentos',
        icon: <RequestPage />,
        path: '/app/orcamentos',
        description: 'Criação de orçamentos',
        permissao: PERMISSOES.ORCAMENTOS_VISUALIZAR,
    },
    {
        text: 'Serviços',
        icon: <AutoAwesome />,
        path: '/app/servicos',
        description: 'Gerenciamento de serviços',
        permissao: PERMISSOES.SERVICOS_VISUALIZAR,
    },
    {
        text: 'Pacotes',
        icon: <Diamond />,
        path: '/app/pacotes',
        description: 'Pacotes de serviços',
        permissao: PERMISSOES.PACOTES_VISUALIZAR,
    },
    {
        text: 'Consultas',
        icon: <Insights />,
        path: '/app/consultas',
        description: 'Consultas estratégicas',
        children: [
            {
                text: 'Clientes',
                icon: <People fontSize="small" />,
                path: '/app/consultas/clientes',
                description: 'Consulta de clientes',
                permissao: PERMISSOES.CLIENTES_VISUALIZAR,
            },
            {
                text: 'Faturamento',
                icon: <ReceiptLong fontSize="small" />,
                path: '/app/consultas/agendamentos',
                description: 'Consulta financeira de agendamentos',
                permissao: PERMISSOES.AGENDAMENTOS_PAGAMENTOS_VISUALIZAR,
            },
        ],
    },
    {
        text: 'Produtos',
        icon: <AutoFixHigh />,
        path: '/app/produtos',
        description: 'Controle de produtos automotivos',
        disabled: true,
    },
    {
        text: 'Equipamentos',
        icon: <Build />,
        path: '/app/equipamentos',
        description: 'Controle de equipamentos',
        disabled: true,
    },
    {
        text: 'Serviços Terceirizados',
        icon: <NoCrash />,
        path: '/app/servicos-terceirizados',
        description: 'Serviços externos',
    },
    {
        text: 'Loja',
        icon: <ShoppingCart />,
        path: '/app/loja',
        description: 'Vendas e produtos',
        disabled: true,
    },
    {
        text: 'Cadastros',
        icon: <AddBox />,
        path: '/app/cadastros',
        description: 'Cadastros padrões',
        permissao: PERMISSOES.CADASTROS_VISUALIZAR,
        children: [
            {
                text: 'Tipos Veículos',
                icon: <AirportShuttle />,
                path: '/app/cadastros/tipos-veiculos',
                description: 'Tipos de veículos',
                permissao: PERMISSOES.CADASTROS_VISUALIZAR,
            },
            {
                text: 'Modelos',
                icon: <DirectionsCar />,
                path: '/app/cadastros/modelos',
                description: 'Modelos de veículos',
                permissao: PERMISSOES.CADASTROS_VISUALIZAR,
            },
            {
                text: 'Cores',
                icon: <Palette />,
                path: '/app/cadastros/cores',
                description: 'Cores de veículos',
                permissao: PERMISSOES.CADASTROS_VISUALIZAR,
            },
            {
                text: 'Marcas',
                icon: <LocalOffer />,
                path: '/app/cadastros/marcas',
                description: 'Marcas de veículos',
                permissao: PERMISSOES.CADASTROS_VISUALIZAR,
            },
        ],
    },
    {
        text: 'Configurações',
        icon: <Settings />,
        path: '/app/configuracoes',
        description: 'Configurações do sistema',
        children: [
            {
                text: 'Usuários',
                icon: <AccountCircle />,
                path: '/app/configuracoes/usuarios',
                description: 'Gerenciamento de usuários',
                permissao: PERMISSOES.USUARIOS_VISUALIZAR,
            },
            {
                text: 'Perfis',
                icon: <Security />,
                path: '/app/configuracoes/perfis',
                description: 'Perfis e permissões',
                permissao: PERMISSOES.PERFIS_VISUALIZAR,
            },
            {
                text: 'Empresa',
                icon: <Business />,
                path: '/app/configuracoes/empresa',
                description: 'Dados da empresa',
                permissao: PERMISSOES.EMPRESA_VISUALIZAR,
            },
            {
                text: 'Sistema',
                icon: <DisplaySettings />,
                path: '/app/configuracoes/sistema',
                description: 'Configurações do sistema',
                permissao: PERMISSOES.CONFIGURACAO_SISTEMA_GERENCIAR,
            },
        ],
    }
];

export const AppLayout: React.FC = () => {
    const drawerWidth = 280;
    const collapsedWidth = 72;
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { setIsAuthenticated, hasPermissao } = useAuth();
    const { navigateWithCheck } = useUnsavedChangesContext();

    const visibleMenuItems = menuItems
        .map((item) => {
            if (item.children) {
                const visibleChildren = item.children.filter(
                    (child) => !child.permissao || hasPermissao(child.permissao)
                );
                if (visibleChildren.length === 0) return null;
                return { ...item, children: visibleChildren };
            }
            return (!item.permissao || hasPermissao(item.permissao)) ? item : null;
        })
        .filter(Boolean) as MenuItem[];

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [open, setOpen] = useState(!isMobile);
    const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

    const { nomeEmpresa } = useEmpresa();

    useEffect(() => {
        setOpen(!isMobile);
    }, [isMobile]);

    // Expande automaticamente o menu pai se estiver em uma rota filha
    useEffect(() => {
        visibleMenuItems.forEach((item) => {
            if (item.children) {
                const isChildActive = item.children.some((child) =>
                    location.pathname.startsWith(child.path)
                );
                if (isChildActive && !expandedMenus.includes(item.text)) {
                    setExpandedMenus((prev) => [...prev, item.text]);
                }
            }
        });
    }, [location.pathname, expandedMenus, visibleMenuItems]);

    const toggleSubmenu = (menuText: string) => {
        setExpandedMenus((prev) =>
            prev.includes(menuText)
                ? prev.filter((text) => text !== menuText)
                : [...prev, menuText]
        );
    };

    const handleDrawerToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setOpen(!open);
        }
    };

    const handleMenuClick = (path: string) => {
        navigateWithCheck(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            setIsAuthenticated(false);
            await logout();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Erro no logout:', error);
            setIsAuthenticated(false);
            navigate('/login', { replace: true });
        } finally {
            setIsLoggingOut(false);
        }
    };

    const currentDrawerWidth = isMobile ? 0 : (open ? drawerWidth : collapsedWidth);

    const drawer = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
            <Box sx={{
                p: (open || isMobile) ? 2 : 1,
                minHeight: 80,
                borderBottom: 1,
                borderColor: 'divider',
                background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
                color: 'white',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: (open || isMobile) ? 'flex-start' : 'center',
                transition: theme.transitions.create(['padding', 'align-items'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.standard,
                }),
            }}>
                {!isMobile && (
                    <IconButton
                        onClick={handleDrawerToggle}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: open ? 12 : '50%',
                            transform: open ? 'none' : 'translateX(50%)',
                            color: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)',
                            width: 28,
                            height: 28,
                            zIndex: 2,
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.2)',
                                transform: open ? 'scale(1.1)' : 'translateX(50%) scale(1.1)',
                            },
                            transition: theme.transitions.create(['right', 'transform', 'background-color'], {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.standard,
                            }),
                        }}
                    >
                        {open ? <ChevronLeft fontSize="small" /> : <ChevronRight fontSize="small" />}
                    </IconButton>
                )}

                {!open && !isMobile && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 3 }}>
                        <DirectionsCar sx={{ fontSize: 28, color: 'white' }} />
                    </Box>
                )}

                <Box sx={{
                    pr: 6,
                    opacity: (open || isMobile) ? 1 : 0,
                    visibility: (open || isMobile) ? 'visible' : 'hidden',
                    maxHeight: (open || isMobile) ? 60 : 0,
                    overflow: 'hidden',
                    transition: theme.transitions.create(['opacity', 'visibility', 'max-height'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.shorter,
                    }),
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem', mb: 0.5 }}>
                        {nomeEmpresa ?? ''}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
                <List sx={{ px: 1 }}>
                    {visibleMenuItems.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expandedMenus.includes(item.text);
                        const isSelected = hasChildren
                            ? item.children!.some((child) => location.pathname.startsWith(child.path))
                            : item.path === '/app'
                                ? location.pathname === '/app'
                                : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                        const handleClick = () => {
                            if (item.disabled) return;

                            if (hasChildren) {
                                if (open || isMobile) {
                                    toggleSubmenu(item.text);
                                } else {
                                    // Se o menu está colapsado, expande e abre o submenu
                                    setOpen(true);
                                    if (!isExpanded) {
                                        toggleSubmenu(item.text);
                                    }
                                }
                            } else {
                                handleMenuClick(item.path);
                            }
                        };

                        return (
                            <React.Fragment key={item.text}>
                                <ListItem disablePadding sx={{ mb: 0.5 }}>
                                    <Tooltip
                                        title={!open && !isMobile ? `${item.text} - ${item.description}` : ''}
                                        placement="right"
                                        arrow
                                    >
                                        <ListItemButton
                                            onClick={handleClick}
                                            disabled={item.disabled}
                                            selected={isSelected && !hasChildren}
                                            sx={{
                                                borderRadius: 2,
                                                minHeight: 48,
                                                justifyContent: 'center',
                                                px: (open || isMobile) ? 2.5 : 1.5,
                                                mx: 0.5,
                                                overflow: 'hidden',
                                                position: 'relative',
                                                transition: theme.transitions.create(['padding', 'background-color'], {
                                                    easing: theme.transitions.easing.sharp,
                                                    duration: theme.transitions.duration.shorter,
                                                }),
                                                '&.Mui-disabled': {
                                                    opacity: 0.5,
                                                    cursor: 'not-allowed',
                                                    pointerEvents: 'auto',
                                                },
                                                '&.Mui-selected': {
                                                    backgroundColor: (t) => alpha(t.palette.primary.main, 0.12),
                                                    color: 'primary.main',
                                                    '&:before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: 4,
                                                        height: 24,
                                                        backgroundColor: 'primary.main',
                                                        borderRadius: '0 4px 4px 0',
                                                    },
                                                    '&:hover': {
                                                        backgroundColor: (t) => alpha(t.palette.primary.main, 0.16),
                                                    },
                                                    '& .MuiListItemIcon-root': {
                                                        color: 'primary.main',
                                                    },
                                                },
                                                '&:hover': {
                                                    backgroundColor: item.disabled ? 'transparent' : (t) => alpha(t.palette.primary.main, 0.04),
                                                },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    mr: (open || isMobile) ? 2 : 0,
                                                    justifyContent: 'center',
                                                    color: isSelected ? 'primary.main' : 'inherit',
                                                    transition: theme.transitions.create('margin', {
                                                        easing: theme.transitions.easing.sharp,
                                                        duration: theme.transitions.duration.shorter,
                                                    }),
                                                }}
                                            >
                                                {item.icon}
                                            </ListItemIcon>

                                            <ListItemText
                                                primary={item.text}
                                                primaryTypographyProps={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: isSelected ? 600 : 400,
                                                    noWrap: true,
                                                }}
                                            sx={{
                                                opacity: (open || isMobile) ? 1 : 0,
                                                width: (open || isMobile) ? 'auto' : 0,
                                                visibility: (open || isMobile) ? 'visible' : 'hidden',
                                                transition: theme.transitions.create(['opacity', 'width', 'visibility'], {
                                                    easing: theme.transitions.easing.sharp,
                                                    duration: theme.transitions.duration.shorter,
                                                }),
                                            }}
                                        />

                                            {/* Ícone de expandir/colapsar para itens com filhos */}
                                            {hasChildren && (open || isMobile) && (
                                                isExpanded ? <ExpandLess /> : <ExpandMore />
                                            )}
                                        </ListItemButton>
                                    </Tooltip>
                                </ListItem>

                                {/* Submenu */}
                                {hasChildren && (
                                    <Collapse in={isExpanded && (open || isMobile)} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {item.children!.map((child) => {
                                                const isChildSelected = location.pathname.startsWith(child.path);

                                                return (
                                                    <ListItem key={child.text} disablePadding sx={{ mb: 0.25 }}>
                                                        <ListItemButton
                                                            onClick={() => handleMenuClick(child.path)}
                                                            selected={isChildSelected}
                                                            sx={{
                                                                borderRadius: 2,
                                                                minHeight: 40,
                                                                pl: 5,
                                                                pr: 2.5,
                                                                mx: 0.5,
                                                                overflow: 'hidden',
                                                                position: 'relative',
                                                                '&.Mui-selected': {
                                                                    backgroundColor: (t) => alpha(t.palette.primary.main, 0.12),
                                                                    color: 'primary.main',
                                                                    '&:before': {
                                                                        content: '""',
                                                                        position: 'absolute',
                                                                        left: 0,
                                                                        top: '50%',
                                                                        transform: 'translateY(-50%)',
                                                                        width: 3,
                                                                        height: 20,
                                                                        backgroundColor: 'primary.main',
                                                                        borderRadius: '0 3px 3px 0',
                                                                    },
                                                                    '&:hover': {
                                                                        backgroundColor: (t) => alpha(t.palette.primary.main, 0.16),
                                                                    },
                                                                    '& .MuiListItemIcon-root': {
                                                                        color: 'primary.main',
                                                                    },
                                                                },
                                                                '&:hover': {
                                                                    backgroundColor: (t) => alpha(t.palette.primary.main, 0.04),
                                                                },
                                                            }}
                                                        >
                                                            <ListItemIcon
                                                                sx={{
                                                                    minWidth: 0,
                                                                    mr: 2,
                                                                    justifyContent: 'center',
                                                                    '& svg': {
                                                                        fontSize: '1.1rem',
                                                                    },
                                                                }}
                                                            >
                                                                {child.icon}
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={child.text}
                                                                primaryTypographyProps={{
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: isChildSelected ? 600 : 400,
                                                                    noWrap: true,
                                                                }}
                                                            />
                                                        </ListItemButton>
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Collapse>
                                )}
                            </React.Fragment>
                        );
                    })}
                </List>
            </Box>

            <Box sx={{
                borderTop: 1,
                borderColor: 'divider',
                p: (open || isMobile) ? 2 : 1.5,
                background: (t) => alpha(t.palette.primary.main, 0.02),
                transition: theme.transitions.create('padding', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.standard,
                }),
            }}>
                <Tooltip
                    title={!open && !isMobile ? localStorage.getItem('username') || '' : ''}
                    placement="right"
                    arrow
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: (open || isMobile) ? 'flex-start' : 'center',
                        mb: 2,
                        transition: theme.transitions.create('justify-content', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.standard,
                        }),
                    }}>
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                mr: (open || isMobile) ? 2 : 0,
                                bgcolor: 'primary.main',
                                transition: theme.transitions.create('margin', {
                                    easing: theme.transitions.easing.sharp,
                                    duration: theme.transitions.duration.standard,
                                }),
                            }}
                        >
                            {localStorage.getItem('username')?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box sx={{
                            flexGrow: 1,
                            minWidth: 0,
                            opacity: (open || isMobile) ? 1 : 0,
                            width: (open || isMobile) ? 'auto' : 0,
                            visibility: (open || isMobile) ? 'visible' : 'hidden',
                            transition: theme.transitions.create(['opacity', 'width', 'visibility'], {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.shorter,
                            }),
                        }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                {localStorage.getItem('username')}
                            </Typography>
                        </Box>
                    </Box>
                </Tooltip>

                <Tooltip title={!open && !isMobile ? 'Sair do sistema' : ''} placement="right" arrow>
                    <ListItemButton
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        sx={{
                            borderRadius: 2,
                            justifyContent: 'center',
                            px: (open || isMobile) ? 2.5 : 1.5,
                            overflow: 'hidden',
                            transition: theme.transitions.create(['padding', 'background-color'], {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.shorter,
                            }),
                            '&:hover': {
                                backgroundColor: alpha('#d32f2f', 0.08),
                                '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                                    color: '#d32f2f',
                                },
                            },
                        }}
                    >
                        <ListItemIcon sx={{
                            minWidth: 0,
                            mr: (open || isMobile) ? 2 : 0,
                            color: '#d32f2f',
                            justifyContent: 'center',
                            transition: theme.transitions.create('margin', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.shorter,
                            }),
                        }}>
                            <Logout />
                        </ListItemIcon>
                        <ListItemText
                            primary={isLoggingOut ? "Saindo..." : "Sair"}
                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                            sx={{
                                color: '#d32f2f',
                                opacity: (open || isMobile) ? 1 : 0,
                                width: (open || isMobile) ? 'auto' : 0,
                                visibility: (open || isMobile) ? 'visible' : 'hidden',
                                transition: theme.transitions.create(['opacity', 'width', 'visibility'], {
                                    easing: theme.transitions.easing.sharp,
                                    duration: theme.transitions.duration.shorter,
                                }),
                            }}
                        />
                    </ListItemButton>
                </Tooltip>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { xs: '100%', lg: `calc(100% - ${currentDrawerWidth}px)` },
                    ml: { xs: 0, lg: `${currentDrawerWidth}px` },
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.standard,
                    }),
                    bgcolor: 'white',
                    borderBottom: 1,
                    borderColor: 'divider',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {isMobile && (
                            <IconButton
                                color="primary"
                                aria-label="open drawer"
                                onClick={handleDrawerToggle}
                                edge="start"
                                sx={{ mr: 1 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}

                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: 'primary.main',
                                letterSpacing: '-0.01em',
                                cursor: 'pointer',
                                '&:hover': {
                                    opacity: 0.8,
                                },
                                transition: 'opacity 0.2s ease',
                                position: 'absolute',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                pointerEvents: 'none',
                            }}
                        >
                            Detail Flow
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton
                            size="small"
                            sx={{
                                color: 'text.secondary',
                                '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.08), color: 'primary.main' },
                            }}
                        >
                            <Badge badgeContent={0} color="error">
                                <NotificationsOutlined fontSize="small" />
                            </Badge>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box component="nav">
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', lg: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', lg: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: currentDrawerWidth,
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.standard,
                            }),
                            overflowX: 'hidden',
                            border: 'none',
                            boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
                        },
                    }}
                    open={open}
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 3,
                    width: { xs: '100%', lg: `calc(100% - ${currentDrawerWidth}px)` },
                    ml: { xs: 0, lg: `${currentDrawerWidth}px` },
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>

        </Box>
    );
};
