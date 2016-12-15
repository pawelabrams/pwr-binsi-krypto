app.algos.rsa = {
    separator: "/",
    sepCharCode: "/".charCodeAt(0),
    chunkSize: 250,
    textInput: function (plaintext) {
        const uint8array = new TextEncoder("utf-8").encode(plaintext);
        const hex = Array.prototype.map.call(uint8array, function(x) {
            return ('00' + x.toString(16)).slice(-2);
        });
        const hexLen = hex.length;
        let ret = [];

        for (let i = 0; i < hexLen; i += this.chunkSize) {
            // console.log(hex.slice(i, i + this.chunkSize));
            ret.push(bigInt(hex.slice(i, i + this.chunkSize).join(''), 16));
        }

        return ret;
    },
    textOutput: function (decryptionOutput) {
        ret = "";
        let td = new TextDecoder("utf-8");
        for (let i = 0; i < decryptionOutput.length; i++) {
            const arr = Uint8Array.from(
                decryptionOutput[i].toString(16).match(/.{2}/g) || [],
                function(byte) {
                    return parseInt(byte, 16);
                }
            );
            ret += td.decode(arr);
        }
        return ret;
    },
    fileInput: function (fileName, fileContent) {

    },
    fileOutput: function (decryptionOutput) {

        return {
            filename: x,
            contents: x,
        };
    },
    isEncryptedFile: function (decryptionOutput) {
        return (decryptionOutput.words[0] >> 24) != this.sepCharCode;
    },
    encryption: function (plaintext) {
        const e = bigInt(app.encryptionOptions.e, 16);
        const n = bigInt(app.encryptionOptions.n, 16);
        let ret = [];
        for (let i = 0; i < plaintext.length; i++) {
            ret.push(plaintext[i].modPow(e, n).toString(36));
        }
        return ret.join(';');
    },
    decryption: function (cyphertext) {
        cyphertext = cyphertext.split(";");
        const d = bigInt(app.decryptionOptions.d, 16);
        const n = bigInt(app.decryptionOptions.n, 16);
        let ret = [];
        for (let i = 0; i < cyphertext.length; i++) {
            cypher = bigInt(cyphertext[i], 36);
            ret.push(cypher.modPow(d, n));
        }
        return ret;
    },
}

app.algosOptions.rsa = {
    "n": {
        "type": "text",
        "default": "",
        "tooltip": "Modulus",
        "placeholder": "n",
    },
    "d": {
        "type": "text",
        "default": "",
        "tooltip": "Wykładnik prywatny",
        "placeholder": "d",
    },
    "e": {
        "type": "text",
        "default": "",
        "tooltip": "Wykładnik publiczny",
        "placeholder": "e",
    }
};
