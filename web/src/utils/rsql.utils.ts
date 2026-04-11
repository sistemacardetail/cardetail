export interface EnumOption {
    value: string;
    label: string;
}

export interface FilterableField {
    field: string;
    headerName: string;
    type?: 'string' | 'number' | 'date' | 'dateDay' | 'boolean' | 'enum';
    enumOptions?: EnumOption[];
}

// Operadores RSQL suportados
export type RsqlOperator =
    | '=='
    | '!='
    | '=gt='
    | '=ge='
    | '=lt='
    | '=le='
    | '=in='
    | '=out='
    | '=like=';

// Mapeamento de operadores do DataGrid para RSQL
const operatorMap: Record<string, RsqlOperator> = {
    'equals': '==',
    'is': '==',
    '=': '==',
    'not': '!=',
    'isNot': '!=',
    '!=': '!=',
    'contains': '==',
    'startsWith': '==',
    'endsWith': '==',
    '>': '=gt=',
    'greaterThan': '=gt=',
    'after': '=gt=',
    '>=': '=ge=',
    'greaterThanOrEqual': '=ge=',
    'onOrAfter': '=ge=',
    '<': '=lt=',
    'lessThan': '=lt=',
    'before': '=lt=',
    '<=': '=le=',
    'lessThanOrEqual': '=le=',
    'onOrBefore': '=le=',
    'isAnyOf': '=in=',
    'isNotAnyOf': '=out=',
};

// Operadores disponíveis para o usuário
export interface FilterOperatorOption {
    value: string;
    label: string;
    rsqlOperator: RsqlOperator;
    supportsWildcard?: boolean;
}

export const filterOperatorsByType: Record<
    NonNullable<FilterableField['type']>,
    FilterOperatorOption[]
> = {
    string: [
        { value: 'contains', label: 'Contém', rsqlOperator: '==', supportsWildcard: true },
        { value: 'equals', label: 'Igual a', rsqlOperator: '==' },
        { value: 'not', label: 'Diferente de', rsqlOperator: '!=' },
        { value: 'startsWith', label: 'Começa com', rsqlOperator: '==', supportsWildcard: true },
        { value: 'endsWith', label: 'Termina com', rsqlOperator: '==', supportsWildcard: true },
    ],

    number: [
        { value: 'equals', label: 'Igual a', rsqlOperator: '==' },
        { value: 'not', label: 'Diferente de', rsqlOperator: '!=' },
        { value: 'greaterThan', label: 'Maior que', rsqlOperator: '=gt=' },
        { value: 'greaterThanOrEqual', label: 'Maior ou igual', rsqlOperator: '=ge=' },
        { value: 'lessThan', label: 'Menor que', rsqlOperator: '=lt=' },
        { value: 'lessThanOrEqual', label: 'Menor ou igual', rsqlOperator: '=le=' },
    ],

    date: [
        { value: 'equals', label: 'Na data', rsqlOperator: '==' },
        { value: 'greaterThan', label: 'Após', rsqlOperator: '=gt=' },
        { value: 'lessThan', label: 'Antes', rsqlOperator: '=lt=' },
    ],

    dateDay: [
        { value: 'equals', label: 'Igual a', rsqlOperator: '==' },
    ],

    boolean: [
        { value: 'equals', label: 'Igual a', rsqlOperator: '==' },
        { value: 'not', label: 'Diferente de', rsqlOperator: '!=' },
    ],

    enum: [
        { value: 'equals', label: 'Igual a', rsqlOperator: '==' },
        { value: 'not', label: 'Diferente de', rsqlOperator: '!=' },
    ],
};

// Escapa caracteres especiais do RSQL
const escapeRsqlValue = (value: string): string => {
    // Escapa aspas simples duplicando-as
    return value.replace(/'/g, "''");
};

// Converte um valor para formato RSQL com wildcards quando necessário
const formatRsqlValue = (value: string, operator: string): string => {
    const escaped = escapeRsqlValue(value);

    switch (operator) {
        case 'contains':
            return `'*${escaped}*'`;
        case 'startsWith':
            return `'${escaped}*'`;
        case 'endsWith':
            return `'*${escaped}'`;
        default:
            // Se o valor contém espaços ou caracteres especiais, envolve em aspas
            if (/[\s,;()]/.test(escaped) || escaped === '') {
                return `'${escaped}'`;
            }
            return escaped;
    }
};

const formatValueByType = (
    value: string,
    operator: string,
    type: FilterableField['type'] = 'string'
): string => {
    if (type === 'number') {
        return value; // sem aspas
    }

    if (type === 'boolean') {
        return value.toLowerCase();
    }

    if (type === 'enum') {
        return value; // enum: valor literal sem aspas
    }

    if (type === 'date') {
        // Formato datetime-local: "2024-01-15T10:30" -> "2024-01-15T10:30:00"
        const dateValue = value.includes(':') && value.split(':').length === 2
            ? `${value}:00`
            : value;
        return `'${dateValue}'`;
    }

    return formatRsqlValue(value, operator);
};

export interface CustomFilter {
    field: string;
    operator: string;
    value: string;
}

export const customFiltersToRsql = (
    filters: CustomFilter[],
    fields: FilterableField[]
): string => {
    return filters
        .filter(f => f.field && f.value)
        .flatMap(f => {
            const fieldMeta = fields.find(field => field.field === f.field);
            const type = fieldMeta?.type || 'string';

            // Tipo dateDay: gera duas condições para filtrar o dia inteiro
            if (type === 'dateDay') {
                const dateOnly = String(f.value).split('T')[0];
                return [
                    `${f.field}=ge='${dateOnly}T00:00:00'`,
                    `${f.field}=le='${dateOnly}T23:59:59'`,
                ];
            }

            const rsqlOperator = operatorMap[f.operator] || '==';

            const value = formatValueByType(
                String(f.value),
                f.operator,
                type
            );

            return [`${f.field}${rsqlOperator}${value}`];
        })
        .join(';');
};

export const getFilterableFields = (columns: Array<{ field: string; headerName?: string; type?: string; filterable?: boolean }>): FilterableField[] => {
    return columns
        .filter(col => col.field !== 'actions' && col.filterable !== false)
        .map(col => ({
            field: col.field,
            headerName: col.headerName || col.field,
            type: (col.type as FilterableField['type']) || 'string',
        }));
};
