app.algos.aes = {
    keyLen: 256,
    separator: "/",
    sepCharCode: "/".charCodeAt(0),
    textInput: function (plaintext) {
        return CryptoJS.enc.Utf8.parse(this.separator + plaintext);
    },
    textOutput: function (decryptionOutput) {
        return decryptionOutput.toString(CryptoJS.enc.Utf8).slice(1);
    },
    fileInput: function (fileName, fileContent) {
        return CryptoJS.enc.Utf8.parse(fileName + this.separator).concat(CryptoJS.enc.Uint8Array.parse(fileContent));
    },
    fileOutput: function (decryptionOutput) {
        const decrypted = CryptoJS.enc.Uint8Array.stringify(decryptionOutput);
        const pos_slash = decrypted.indexOf(this.sepCharCode);
        return {
            filename: (new TextDecoder("utf-8")).decode(decrypted.slice(0, pos_slash)),
            contents: new Blob([decrypted.slice(pos_slash+1)]),
        };
    },
    isEncryptedFile: function (decryptionOutput) {
        return (decryptionOutput.words[0] >> 24) != this.sepCharCode;
    },
    encryption: function (plaintext) {
        const key = CryptoJS.enc.Hex.parse(app.encryptionOptions.key);
        const iv  = CryptoJS.lib.WordArray.random(16);
        let words = CryptoJS.AES.encrypt(plaintext, key, {iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
        return iv.concat(words.ciphertext).toString(CryptoJS.enc.Latin1);
    },
    decryption: function (cyphertext) {
        cyphertext = CryptoJS.enc.Latin1.parse(cyphertext);
        const key = CryptoJS.enc.Hex.parse(app.decryptionOptions.key);
        const iv  = {words: cyphertext.words.slice(0, 4), sigBytes: 16};
        cyphertext = {words: cyphertext.words.slice(4), sigBytes: cyphertext.sigBytes - 16};
        let words = CryptoJS.AES.decrypt({ciphertext: cyphertext}, key, {iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
        return words;
    },
};

app.algosOptions.aes = {
    "key": {
        "type": "text",
        "default": "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
        "tooltip": "Klucz",
        "placeholder": "Klucz",
    }
};
