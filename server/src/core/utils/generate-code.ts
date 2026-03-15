export const generateOTP = (length = 6): string => {
    const characters = '0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
};

export const generateProjectCode = (length: number): string => {
    const characters = '0123456789';
    let randomString = 'PRJ-';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
};

/**
 * Generate secure API key using Base64 URL-safe encoding
 * Format: pk_[43 base64 characters]
 * Example: pk_o0_2K8HNp7qW5eP2bJ9R1o4Y8Z2c7b3D5e9F1a2C4d
 * 
 * - 32 bytes = 256 bits entropy
 * - Base64 URL-safe (no +, /, =)
 * - Length: 46 characters total
 */
export const generateClientKey = (): string => {
    const prefix = 'pk_';
    const bytes = new Uint8Array(32); // 32 bytes = 256 bits
    crypto.getRandomValues(bytes);
    
    // Convert to base64
    let base64 = '';
    if (typeof Buffer !== 'undefined') {
        // Node.js environment
        base64 = Buffer.from(bytes).toString('base64');
    } else {
        // Browser environment
        base64 = btoa(String.fromCharCode(...bytes));
    }
    
    // Make URL-safe: replace +/= with -_
    const urlSafe = base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    return `${prefix}${urlSafe}`;
};
