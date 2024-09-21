export const extractDomain = (url = '') => {
    try {
        const urlObj = new URL(url);
        let domain = urlObj?.hostname;
        if (domain.startsWith('www.')) {
            domain = domain.slice(4);
        }
        return domain;
    } catch (e) {
        return 'N/A';
    }
}