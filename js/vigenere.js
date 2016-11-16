app.algos.vigenere = {
    startCode: 65,
    mod: 26,
    encryption: function (plaintext) {
        const key = app.encryptionOptions.key.toUpperCase();
        const keylen = key.length;
        const start = this.startCode;
        const mod = this.mod;
        let cyphertext = "";
        plaintext = plaintext.toUpperCase();

        for (let i = 0; i < plaintext.length; i++) {
            let letter = plaintext.charCodeAt(i);
            let move = key.charCodeAt(i % keylen) - start;
            if (letter >= start && letter < start + mod) {
                cyphertext += String.fromCharCode((letter - start + move) % mod + start);
            } else {
                cyphertext += String.fromCharCode(letter);
            }
        }
        return cyphertext;
    },
    decryption: function (cyphertext) {
        const key = app.decryptionOptions.key.toUpperCase();
        const keylen = key.length;
        const start = this.startCode;
        const mod = this.mod;
        let plaintext = "";
        cyphertext = cyphertext.toUpperCase();

        for (let i = 0; i < cyphertext.length; i++) {
            let letter = cyphertext.charCodeAt(i);
            let move = key.charCodeAt(i % keylen) - start;
            if (letter >= start && letter < start + mod) {
                plaintext += String.fromCharCode((letter - start - move + mod) % mod + start);
            } else {
                plaintext += String.fromCharCode(letter);
            }
        }
        return plaintext;
    },
};

app.algosOptions.vigenere = {
    "key": "text"
};
