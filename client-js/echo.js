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
SecretKey object used for symmetric-key cryptography.
*/
class SecretKey {
    constructor(key) {
        this.aesKey = key;
    }
    /*
    Encrypt ArrayBuffer plaintext with SecretKey and iv (also ArrayBuffer).
    */
    encrypt(iv, plaintext) {
        return crypto.subtle.encrypt(
            {name: "AES-CBC", iv: iv},
            this.aesKey,
            plaintext
        );
    }
    /*
    Decrypt ArrayBuffer ciphertext with SecretKey and iv (also ArrayBuffer).
    */
    decrypt(iv, ciphertext) {
        return crypto.subtle.decrypt(
            {name: "AES-CBC", iv: iv},
            this.aesKey,
            ciphertext
        );
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


/*
PrivateKey object used for asymmetric-key cryptography.
*/
class PrivateKey {
    constructor(key) {
        this.rsaPrivateKey = key;
    }
    /*
    Extract PublicKey.
    */
    getPublicKey() {
        const key = this.rsaPrivateKey;
        // jwk object
        const data = {
            alg: 'RSA-OAEP-256',
            ext: true,
            key_ops: ['encrypt'],
            kty: 'RSA',
        };
        return crypto.subtle.exportKey('jwk', key).then(jwk => {
            // Copy e and n from PrivateKey
            data.e = jwk.e;
            data.n = jwk.n;
            return crypto.subtle.importKey(
                'jwk',
                data,
                {name: 'RSA-OAEP', hash: {name: 'SHA-256'}},
                true,
                ['encrypt']
            );
        }).then(key => {
            return new PublicKey(key);
        });
    }
    /*
    Export to PKCS8 format ArrayBuffer.
    */
    export() {
        const key = this.rsaPrivateKey;
        return crypto.subtle.exportKey('pkcs8', key);
    }
    /*
    Unwrap a SecretKey that was wrapped by PublicKey.
    */
    unwrapKey(wrappedKey) {
        return crypto.subtle.decrypt(
            {name: 'RSA-OAEP'},
            this.rsaPrivateKey,
            wrappedKey
        ).then(raw => {
            return SecretKey.import(raw);
        });
    }
    /*
    Return signature of ArrayBuffer data.
    */
    sign(data) {
        return this.export().then(pkcs8 => {
            return crypto.subtle.importKey(
                'pkcs8',
                pkcs8,
                {name: 'RSASSA-PKCS1-v1_5', hash: {name: 'SHA-256'}},
                true,
                ['sign']
            );
        }).then(key => {
            return window.crypto.subtle.sign(
                {name: 'RSASSA-PKCS1-v1_5'},
                key,
                data
            );
        });
    }
}

/*
Generate a new PrivateKey.
*/
PrivateKey.generate = () => {
    return crypto.subtle.generateKey({
        hash: {name: 'SHA-256'},
        modulusLength: 4096,
        name: 'RSA-OAEP',
        publicExponent: new Uint8Array([0x01, 0x00, 0x01])
    }, true, ['encrypt', 'decrypt']).then(key => {
        return new PrivateKey(key.privateKey);
    });
};

/*
Import PrivateKey from PKCS8 ArrayBuffer.
*/
PrivateKey.import = raw => {
    return crypto.subtle.importKey(
        'pkcs8',
        raw,
        {name: 'RSA-OAEP', hash: {name: 'SHA-256'}},
        true,
        ['decrypt']
    ).then(key => {
        return new PrivateKey(key);
    });
};


/*
PublicKey object used for asymmetric-key cryptography.
*/
class PublicKey {
    constructor(key) {
        this.rsaPublicKey = key;
    }
    /*
    Export to SPKI format ArrayBuffer.
    */
    export() {
        const key = this.rsaPublicKey;
        return crypto.subtle.exportKey('spki', key);
    }
    /*
    Wrap SecretKey and return as ArrayBuffer.
    */
    wrapKey(secretKey) {
        return secretKey.export().then(raw => {
            return crypto.subtle.encrypt(
                {name: 'RSA-OAEP'},
                this.rsaPublicKey,
                raw
            );
        });
    }
    /*
    Verify true/false ArrayBuffer signature and data.
    */
    verify(signature, data) {
        return this.export().then(spki => {
            return crypto.subtle.importKey(
                'spki',
                spki,
                {name: 'RSASSA-PKCS1-v1_5', hash: {name: 'SHA-256'}},
                true,
                ['verify']
            );
        }).then(key => {
            return window.crypto.subtle.verify(
                {name: 'RSASSA-PKCS1-v1_5'},
                key,
                signature,
                data
            );
        });
    }
}

/*
Import PublicKey from SPKI ArrayBuffer.
*/
PublicKey.import = raw => {
    return crypto.subtle.importKey(
        'spki',
        raw,
        {name: 'RSA-OAEP', hash: {name: 'SHA-256'}},
        true,
        ['encrypt']
    ).then(key => {
        return new PublicKey(key);
    });
};
