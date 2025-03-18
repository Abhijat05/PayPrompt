export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US');
};

export const generateRandomId = () => {
    return Math.random().toString(36).substr(2, 9);
};

export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};