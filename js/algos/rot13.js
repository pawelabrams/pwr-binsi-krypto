app.algos.rot13 = {
    startCode: 65,
    mod: 26,
    move: 13,
    encryption: function (plaintext) {
        const move = this.move;
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
        return this.encryption(cyphertext);
    },
};

app.algosOptions.rot13 = {};
