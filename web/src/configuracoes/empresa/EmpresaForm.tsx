import React from 'react';
import {
    Autocomplete,
    Avatar,
    Box,
    Button,
    Card,
    CircularProgress,
    Grid,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material';
import {
    AddPhotoAlternate,
    Business as BusinessIcon,
    Delete as DeleteIcon,
    InsertPhoto,
    LocationOn,
    PhotoLibrary,
    Refresh as RefreshIcon,
    Smartphone,
} from '@mui/icons-material';

import PageContainer from '../../components/PageContainer';
import { useNotifications } from '../../hooks/useNotifications';
import { CnpjConsultaDTO, EmpresaCreateDTO, EmpresaDTO, EmpresaService, TelefoneDTO } from './EmpresaService';
import { extractFieldErrors, formatApiErrors } from '../../services/apiService';
import { formatCep, formatCnpj, formatTelefone, unformatCep, unformatCnpj } from '../../utils';
import { useDialogs } from '../../hooks/useDialogs';
import { PERMISSOES, useAuth } from '../../contexts/AuthContext';
import { useEmpresa } from '../../contexts/EmpresaContext';
import { PermissionPageGuard } from '../../components/PermissionGuard';
import { checkPermission } from '../../components/crud/CrudList';
import { CidadeDTO, findByNomeUf, searchCidades, ufDTO } from '../../cidades/CidadeService';
import { CrudForm } from '../../components/crud';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';

interface EmpresaFormValues {
    nomeFantasia: string;
    razaoSocial: string;
    cnpj: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: CidadeDTO | null;
    telefone: TelefoneDTO;
}

const initialValues: EmpresaFormValues = {
    nomeFantasia: '',
    razaoSocial: '',
    cnpj: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: null,
    telefone: { ddd: '', numero: '' },
};

interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
    action?: React.ReactNode;
}

function SectionHeader({ icon, title, action }: SectionHeaderProps) {
    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
                px: 3,
                py: 2,
                borderBottom: 1,
                borderColor: 'divider',
                background: (theme) => alpha(theme.palette.primary.main, 0.03),
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5}>
                {icon}
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
            </Stack>
            {action}
        </Stack>
    );
}


export default function EmpresaForm() {

    const { hasPermissao } = useAuth();
    const disabledEdit = !checkPermission(PERMISSOES.EMPRESA_EDITAR, hasPermissao);
    const notifications = useNotifications();
    const dialogs = useDialogs();
    const { setEmpresa: setEmpresaContext } = useEmpresa();

    const [values, setValues] = React.useState<EmpresaFormValues>(initialValues);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [loading, setLoading] = React.useState(true);
    const [empresa, setEmpresa] = React.useState<EmpresaDTO | null>(null);
    const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
    const [isDirty, setIsDirty] = React.useState(false);

    const [cidades, setCidades] = React.useState<CidadeDTO[]>([]);
    const [loadingCidades, setLoadingCidades] = React.useState(false);
    const [loadingCnpj, setLoadingCnpj] = React.useState(false);
    const [cnpjConsultado, setCnpjConsultado] = React.useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const loadEmpresa = React.useCallback(async () => {
        setLoading(true);

        const result = await EmpresaService.buscar();

        if (result.data) {
            setEmpresa(result.data);

            let telefoneObj: TelefoneDTO = { ddd: '', numero: '' };
            if (result.data.telefone) {
                const match = result.data.telefone.match(/\((\d{2})\)\s*(\d+)/);
                if (match) {
                    telefoneObj = { ddd: match[1], numero: match[2] };
                }
            }

            setValues({
                nomeFantasia: result.data.nomeFantasia || '',
                razaoSocial: result.data.razaoSocial || '',
                cnpj: result.data.cnpj || '',
                cep: result.data.cep || '',
                logradouro: result.data.logradouro || '',
                numero: result.data.numero || '',
                complemento: result.data.complemento || '',
                bairro: result.data.bairro || '',
                cidade: {
                    id: result.data.idCidade || '',
                    nome: result.data.cidade || '',
                    uf: { sigla: result.data.estado ?? '' } as ufDTO
                },
                telefone: telefoneObj,
            });

            if (result.data.temLogo) {
                setLogoPreview(EmpresaService.getLogoUrl(result.data.id));
            }

            setCnpjConsultado(true);
        }

        setLoading(false);
    }, []);

    const handleSearchCidades = async (searchText: string) => {
        setLoadingCidades(true);
        try {
            const { data } = await searchCidades(searchText);
            if (data) setCidades(data);
        } finally {
            setLoadingCidades(false);
        }
    };

    const buscarDadosCnpj = async (cnpj: string) => {
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        if (cnpjLimpo.length !== 14) return;

        setLoadingCnpj(true);
        try {
            const result = await EmpresaService.consultarCnpj(cnpjLimpo);

            setCnpjConsultado(true);

            if (result.error) {
                notifications.show({
                    message: result.error,
                    severity: 'error',
                });
                return;
            }

            const data = result.data as CnpjConsultaDTO;

            let cidadeEncontrada: CidadeDTO | null = null;
            if (data.municipio && data.uf) {
                const { data: cidadeResult } = await findByNomeUf(data.municipio, data.uf);
                cidadeEncontrada = cidadeResult ?? null;
            }

            let telefoneObj: TelefoneDTO = { ddd: '', numero: '' };
            if (data.telefone) {
                const telefoneMatch = data.telefone.match(/\(?(\d{2})\)?\s*(\d{4,5})-?(\d{4})/);
                if (telefoneMatch) {
                    telefoneObj = {
                        ddd: telefoneMatch[1],
                        numero: telefoneMatch[2] + telefoneMatch[3],
                    };
                }
            }

            setValues({
                ...values,
                cnpj: cnpjLimpo,
                nomeFantasia: data.nomeFantasia || data.razaoSocial || '',
                razaoSocial: data.razaoSocial || '',
                cep: data.cep?.replace(/\D/g, '') || '',
                logradouro: data.logradouro || '',
                numero: data.numero || '',
                complemento: data.complemento || '',
                bairro: data.bairro || '',
                cidade: cidadeEncontrada,
                telefone: telefoneObj,
            });

            notifications.show({
                message: 'Dados do CNPJ carregados com sucesso!',
                severity: 'success',
            });
        } finally {
            setLoadingCnpj(false);
        }
    };

    const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cnpjValue = unformatCnpj(e.target.value);
        setValues({ ...values, cnpj: cnpjValue });
        setIsDirty(true);

        if (cnpjValue.length === 14 && !cnpjConsultado) {
            buscarDadosCnpj(cnpjValue);
        }
    };

    const handleFieldChange = (field: keyof EmpresaFormValues, value: any) => {
        setValues(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    React.useEffect(() => {
        loadEmpresa();
        handleSearchCidades('');
    }, [loadEmpresa]);

    const validate = React.useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!values.nomeFantasia.trim()) newErrors.nomeFantasia = 'Obrigatório';
        if (!values.razaoSocial.trim()) newErrors.razaoSocial = 'Obrigatório';

        const cnpjLimpo = values.cnpj.replace(/\D/g, '');
        if (!cnpjLimpo) newErrors.cnpj = 'Obrigatório';
        else if (cnpjLimpo.length !== 14) newErrors.cnpj = 'CNPJ inválido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values]);

    const handleSubmit = React.useCallback(async () => {

        if (!validate()) return;

        const telefoneParaEnviar =
            values.telefone.ddd && values.telefone.numero
                ? {
                    ddd: values.telefone.ddd,
                    numero: values.telefone.numero.replace(/\D/g, ''),
                }
                : undefined;

        const dto: EmpresaCreateDTO = {
            nomeFantasia: values.nomeFantasia,
            razaoSocial: values.razaoSocial,
            cnpj: values.cnpj.replace(/\D/g, ''),
            cep: values.cep?.replace(/\D/g, ''),
            logradouro: values.logradouro,
            numero: values.numero,
            complemento: values.complemento,
            bairro: values.bairro,
            idCidade: values.cidade?.id ?? null,
            telefone: telefoneParaEnviar,
        };

        const result = empresa
            ? await EmpresaService.atualizar(dto)
            : await EmpresaService.criar(dto);

        if (result.error) {
            notifications.show({
                message: formatApiErrors(result.errors) || result.error,
                severity: 'error',
            });
            setErrors(extractFieldErrors(result.errors));
        } else {
            notifications.show({
                message: 'Empresa salva com sucesso!',
                severity: 'success',
            });
            if (result.data) {
                setEmpresa(result.data);
                setEmpresaContext(result.data);
            }
        }
    }, [values, empresa, validate, notifications, setEmpresaContext]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !empresa) return;

        const result = await EmpresaService.uploadLogo(empresa.id, file);

        if (result.error) {
            notifications.show({ message: result.error, severity: 'error' });
        } else {
            notifications.show({ message: 'Logo atualizada!', severity: 'success' });
            setLogoPreview(EmpresaService.getLogoUrl(empresa.id) + '?t=' + Date.now());
        }
    };

    const handleRemoveLogo = async () => {
        if (!empresa) return;

        const confirmed = await dialogs.open(ConfirmDeleteDialog, {
            itemName: 'logo da empresa',
            itemType: 'a',
        });

        if (!confirmed) return;

        const result = await EmpresaService.removerLogo(empresa.id);

        if (!result.error) {
            setLogoPreview(null);
            notifications.show({ message: 'Logo removida!', severity: 'success' });
        }
    };

    if (loading) {
        return (
            <PageContainer title="Empresa" description="Configurações da empresa" icon={<BusinessIcon />}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            </PageContainer>
        );
    }

    return (
        <PermissionPageGuard permissao={PERMISSOES.EMPRESA_VISUALIZAR}>
            <PageContainer
                breadcrumbs={[
                    { title: 'Configurações', path: '/app/configuracoes' },
                    { title: 'Usuários', path: '/app/configuracoes/usuarios' },
                    { title: 'Editar' },
                ]}
            >
                <CrudForm onSubmit={handleSubmit}
                          backButtonPath="/app"
                          permission={PERMISSOES.EMPRESA_EDITAR}
                          isDirty={isDirty}
                >
                    <Card
                        elevation={0}
                        sx={{
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 3,
                            overflow: 'hidden',
                        }}
                    >
                        <SectionHeader
                            icon={<BusinessIcon sx={{ color: 'primary.main', fontSize: 22 }} />}
                            title="Dados da Empresa"
                        />
                        <Stack spacing={3} sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="CNPJ"
                                            placeholder="00.000.000/0000-00"
                                            value={formatCnpj(values.cnpj)}
                                            onChange={handleCnpjChange}
                                            error={!!errors.cnpj}
                                            helperText={errors.cnpj || (loadingCnpj ? 'Consultando CNPJ...' : '')}
                                            slotProps={{
                                                htmlInput: { maxLength: 18 },
                                                input: {
                                                    endAdornment: loadingCnpj ? (
                                                        <InputAdornment position="end">
                                                            <CircularProgress size={20} />
                                                        </InputAdornment>
                                                    ) : undefined,
                                                },
                                            }}
                                        />
                                        <IconButton
                                            onClick={() => buscarDadosCnpj(values.cnpj)}
                                            disabled={loadingCnpj || values.cnpj.replace(/\D/g, '').length !== 14}
                                            color="primary"
                                            title="Buscar e atualizar dados do CNPJ"
                                            sx={{ mt: 0.25 }}
                                        >
                                            <RefreshIcon />
                                        </IconButton>
                                    </Box>
                                </Grid>

                                <Grid size={6}/>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Nome Fantasia"
                                        value={values.nomeFantasia}
                                        onChange={(e) => handleFieldChange('nomeFantasia', e.target.value)}
                                        error={!!errors.nomeFantasia}
                                        helperText={errors.nomeFantasia}
                                        disabled={!cnpjConsultado && !empresa}
                                    />
                                </Grid>

                                <Grid size={6}/>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Razão Social"
                                        value={values.razaoSocial}
                                        onChange={(e) => handleFieldChange('razaoSocial', e.target.value)}
                                        error={!!errors.razaoSocial}
                                        helperText={errors.razaoSocial}
                                        disabled={!cnpjConsultado && !empresa}
                                    />
                                </Grid>
                            </Grid>
                        </Stack>
                    </Card>

                    <Card
                        elevation={0}
                        sx={{
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 3,
                            overflow: 'hidden',
                        }}
                    >
                        <SectionHeader
                            icon={<LocationOn sx={{ color: 'primary.main', fontSize: 22 }} />}
                            title="Dados do Endereço"
                        />
                        <Stack spacing={3} sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField fullWidth label="CEP"
                                               value={formatCep(values.cep)}
                                               size="small"
                                               placeholder="00000-000"
                                               onChange={(e) => handleFieldChange('cep', unformatCep(e.target.value))}
                                               slotProps={{ htmlInput: { maxLength: 9 } }}
                                               disabled={!cnpjConsultado && !empresa}
                                    />
                                </Grid>

                                <Grid size={6}/>

                                <Grid size={{ xs: 12, md: 8 }}>
                                    <TextField fullWidth label="Logradouro"
                                               value={values.logradouro}
                                               size="small"
                                               onChange={(e) => handleFieldChange('logradouro', e.target.value)}
                                               disabled={!cnpjConsultado && !empresa}
                                    />
                                </Grid>

                                <Grid size={4}/>

                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField fullWidth
                                               label="Número"
                                               value={values.numero}
                                               size="small"
                                               onChange={(e) => handleFieldChange('numero', e.target.value.replace(/\D/g, ''))}
                                               slotProps={{ htmlInput: { maxLength: 8 } }}
                                               disabled={!cnpjConsultado && !empresa}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField fullWidth label="Complemento"
                                               value={values.complemento}
                                               size="small"
                                               onChange={(e) => handleFieldChange('complemento', e.target.value)}
                                               disabled={!cnpjConsultado && !empresa}
                                    />
                                </Grid>

                                <Grid size={4}/>

                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField fullWidth label="Bairro"
                                               value={values.bairro}
                                               size="small"
                                               onChange={(e) => handleFieldChange('bairro', e.target.value)}
                                               disabled={!cnpjConsultado && !empresa}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Autocomplete
                                        options={cidades}
                                        value={values.cidade}
                                        loading={loadingCidades}
                                        disabled={!cnpjConsultado && !empresa}
                                        getOptionLabel={(option) =>
                                            option ? `${option.nome} - ${option.uf.sigla}` : ''
                                        }
                                        isOptionEqualToValue={(o, v) => o.id === v.id}
                                        onChange={(_, newValue) => handleFieldChange('cidade', newValue)}
                                        onInputChange={(_, newInput, reason) => {
                                            if (reason === 'input')
                                                handleSearchCidades(newInput);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Cidade"
                                                size="small"
                                                error={!!errors.cidade}
                                                helperText={errors.cidade}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Stack>
                    </Card>

                    <Card
                        elevation={0}
                        sx={{
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 3,
                            overflow: 'hidden',
                        }}
                    >
                        <SectionHeader
                            icon={<Smartphone sx={{ color: 'primary.main', fontSize: 22 }} />}
                            title="Dados de Contato"
                        />
                        <Stack spacing={3} sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 3, md: 1 }}>
                                    <TextField
                                        fullWidth
                                        label="DDD"
                                        size={"small"}
                                        value={values.telefone.ddd}
                                        onChange={(e) => {
                                            handleFieldChange('telefone', { ...values.telefone, ddd: e.target.value.replace(/\D/g, '') });
                                        }}
                                        slotProps={{ htmlInput: { maxLength: 2 } }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 9, md: 3 }}>
                                    <TextField
                                        fullWidth
                                        label="Número"
                                        size={"small"}
                                        value={formatTelefone(values.telefone.numero)}
                                        onChange={(e) => {
                                            handleFieldChange('telefone', {
                                                ...values.telefone,
                                                numero: e.target.value.replace(/\D/g, ''),
                                            });
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Stack>
                    </Card>

                    {empresa && (
                        <Card
                            elevation={0}
                            sx={{
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 3,
                                overflow: 'hidden',
                            }}
                        >
                            <SectionHeader
                                icon={<PhotoLibrary sx={{ color: 'primary.main', fontSize: 22 }} />}
                                title="Logo"
                            />
                            <Stack spacing={3} sx={{ p: 3 }}>
                                <Grid container spacing={3}>
                                    <Avatar
                                        src={logoPreview || undefined}
                                        sx={{ width: 100, height: 100 }}
                                        variant="rounded"
                                    >
                                        <InsertPhoto />
                                    </Avatar>

                                    <Box>
                                        <input
                                            hidden
                                            type="file"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={handleLogoUpload}
                                        />

                                        <Button
                                            disabled={disabledEdit}
                                            variant="outlined"
                                            startIcon={<AddPhotoAlternate />}
                                            onClick={() => fileInputRef.current?.click()}
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                px: 4,
                                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                                                },
                                            }}
                                        >
                                            Upload
                                        </Button>

                                        {logoPreview && (
                                            <IconButton onClick={handleRemoveLogo} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Grid>
                            </Stack>
                        </Card>
                    )}
                </CrudForm>
            </PageContainer>
        </PermissionPageGuard>
    );
}
