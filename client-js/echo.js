/*
Helper methods for converting data to/from various formats and ArrayBuffer
objects.
*/
const encode = {
    base64: {
        fromBuffer: buffer => {
        },
        toBuffer: base64 => {
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
        },
        toBuffer: utf8 => {
        },
    },
};
