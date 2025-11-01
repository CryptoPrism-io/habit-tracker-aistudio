export const getISODateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const areDatesConsecutive = (dateStr1: string, dateStr2: string): boolean => {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    // Add one day to the earlier date and check if it matches the later date
    d2.setDate(d2.getDate() + 1);
    return getISODateString(d1) === getISODateString(d2);
};

export const formatTimeOfDay = (isoTimestamp: string): string => {
    try {
        const date = new Date(isoTimestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch {
        return '';
    }
};
