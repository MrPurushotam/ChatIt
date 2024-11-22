

export function formatToDDMMYYYY(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0'); // Ensures 2 digits for day
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensures 2 digits for month (0-indexed)
    const year = date.getFullYear(); // Gets the full year

    return `${day}/${month}/${year}`;
}
