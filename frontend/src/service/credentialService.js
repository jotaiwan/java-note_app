// frontend/src/services/credentialService.js
// No axios needed if you're using fetch

const credentialService = {
    /**
     * Get TA credential
     * @returns {Promise<Object>} - The credential data
     */
    async getTACredential() {
        try {
            const response = await fetch('/api/credentials/ta');
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching TA credential:', error);
            throw error;
        }
    },

    /**
     * Get Vault credential
     * @returns {Promise<Object>} - The vault credential data
     */
    async getVaultCredential() {
        try {
            const response = await fetch('/api/credentials/vault');
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching vault credential:', error);
            throw error;
        }
    },

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Copy failed:', error);
            return false;
        }
    }
};

export default credentialService;