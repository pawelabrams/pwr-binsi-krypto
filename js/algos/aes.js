app.algos.aes = {
    keyLen: 256,
    encryption: function (plaintext) {
        const key = CryptoJS.enc.Hex.parse(app.encryptionOptions.key);
        const iv  = CryptoJS.lib.WordArray.random(16);
        let words = CryptoJS.AES.encrypt(plaintext, key, {iv});
        return iv.concat(words.ciphertext).toString(CryptoJS.enc.Latin1);
    },
    decryption: function (cyphertext) {
        cyphertext = CryptoJS.enc.Latin1.parse(cyphertext);
        const key = CryptoJS.enc.Hex.parse(app.decryptionOptions.key);
        const iv  = cyphertext.words.slice(0,4);
        let words = CryptoJS.AES.decrypt({ciphertext: cyphertext.words.slice(4)}, key, {iv});
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
