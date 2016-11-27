app.algos.aes = {
    keyLen: 256,
    encryption: function (plaintext) {
        const key = CryptoJS.enc.Hex.parse(app.encryptionOptions.key);
        const iv  = key;
        let words = CryptoJS.AES.encrypt(plaintext, key, {iv});
        return words.ciphertext.toString(CryptoJS.enc.Latin1);
    },
    decryption: function (cyphertext) {
        const key = CryptoJS.enc.Hex.parse(app.decryptionOptions.key);
        const iv  = key;
        let words = CryptoJS.AES.decrypt({ciphertext:CryptoJS.enc.Latin1.parse(cyphertext)}, key, {iv});
        return words.toString(CryptoJS.enc.Utf8);
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
