app.algos.caesar = {
    startCode: 65,
    mod: 26,
    encryption: function (plaintext) {
        const move = parseInt(app.encryptionOptions.move);
        const start = this.startCode;
        const mod = this.mod;
        let cyphertext = "";
        plaintext = plaintext.toUpperCase();

        for (let i = 0; i < plaintext.length; i++) {
            let letter = plaintext.charCodeAt(i);
            if (letter >= start && letter < start + mod) {
                cyphertext += String.fromCharCode((letter - start + move) % mod + start);
            } else {
                cyphertext += String.fromCharCode(letter);
            }
        }
        return cyphertext;
    },
    decryption: function (cyphertext) {
        const move = parseInt(app.decryptionOptions.move);
        const start = this.startCode;
        const mod = this.mod;
        let plaintext = "";
        cyphertext = cyphertext.toUpperCase();

        for (let i = 0; i < cyphertext.length; i++) {
            let letter = cyphertext.charCodeAt(i);
            if (letter >= start && letter < start + mod) {
                plaintext += String.fromCharCode((letter - start - move + mod) % mod + start);
            } else {
                plaintext += String.fromCharCode(letter);
            }
        }
        return plaintext;
    },
};

app.algosOptions.caesar = {
    "move": "number"
};
