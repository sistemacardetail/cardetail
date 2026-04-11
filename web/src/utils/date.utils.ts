export const diffMinutes = (inicio: string | Date, fim: string | Date): number => {
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
        return 0;
    }

    const diffMs = dataFim.getTime() - dataInicio.getTime();

    return diffMs / (1000 * 60);
};
