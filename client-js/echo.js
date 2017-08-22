/*
Helper methods for converting data to/from various formats and ArrayBuffer
objects.
*/
const encode = {
    base64: {
        fromBuffer: buffer => {
            return btoa(encode.string.fromBuffer(buffer));
        },
        toBuffer: base64 => {
            return encode.string.toBuffer(atob(base64));
        },
    },
    hex: {
        fromBuffer: buffer => {
            const array = new Uint8Array(buffer);
            const len = array.length;
            let hex = '';
            for (let i = 0; i < len; i++) {
                hex += ('00' + array[i].toString(16)).slice(-2);
            }
            return hex;
        },
        toBuffer: hex => {
            const len = hex.length / 2 | 0;
            const array = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                array[i] = parseInt(hex.substr(i * 2, 2), 16);
            }
            return array.buffer;
        },
    },
    string: {
        fromBuffer: buffer => {
            const array = new Uint8Array(buffer);
            const len = array.length;
            let string = '';
            for (let i = 0; i < len; i++) {
                string += String.fromCharCode(array[i]);
            }
            return string;
        },
        toBuffer: string => {
            const len = string.length;
            const array = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                array[i] = string.charCodeAt(i);
            }
            return array.buffer;
        },
    },
    utf8: {
        fromBuffer: buffer => {
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(buffer);
        },
        toBuffer: utf8 => {
            const encoder = new TextEncoder('utf-8');
            return encoder.encode(utf8);
        },
    },
};


/*
SecretKey object used for symmetric-key crypography.
*/
class SecretKey {
    constructor(key) {
        this.aesKey = key;
    }
    /*
    Encrypt ArrayBuffer plaintext with SecretKey and iv (also ArrayBuffer).
    */
    encrypt(iv, plaintext) {
        return Promise.resolve('not implemented');
    }
    /*
    Decrypt ArrayBuffer ciphertext with SecretKey and iv (also ArrayBuffer).
    */
    decrypt(iv, ciphertext) {
        return Promise.resolve('not implemented');
    }
    /*
    Export SecretKey to raw ArrayBuffer.
    */
    export() {
        return crypto.subtle.exportKey('raw', this.aesKey);
    }
}

/*
Generate a new random SecretKey.
*/
SecretKey.generate = () => {
    return crypto.subtle.generateKey(
        {name: 'AES-CBC', length: 256},
        true,
        ['encrypt', 'decrypt']
    ).then(key => {
        return new SecretKey(key);
    });
};

/*
Import SecretKey from raw ArrayBuffer.
*/
SecretKey.import = raw => {
    return crypto.subtle.importKey(
        'raw',
        raw,
        {name: 'AES-CBC'},
        true,
        ['encrypt', 'decrypt']
    ).then(key => {
        return new SecretKey(key);
    });
};
