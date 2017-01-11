app.algos.rsa = {
    separator: "/",
    sepCharCode: "/".charCodeAt(0),
    chunkSize: 250, // TODO: change
    textInput: function (plaintext) {
        // convert to hex (so that sjcl.bn gets them as a number)
        const uint8array = new TextEncoder("utf-8").encode(plaintext + this.separator);
        const hex = Array.prototype.map.call(uint8array, function(x) {
            return ('00' + x.toString(16)).slice(-2);
        });
        const hexLen = hex.length;

        // return the chunks of bigints
        let ret = [];
        for (let i = 0; i < hexLen; i += this.chunkSize) {
            ret.push(new sjcl.bn(hex.slice(i, i + this.chunkSize).join('')));
        }
        return ret;
    },
    textOutput: function (decryptionOutput) {
        // return the merged array as utf-8 string
        let td = new TextDecoder("utf-8");
        return td.decode(decryptionOutput).slice(0, -1);
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
        return decryptionOutput.slice(-1)[0] != this.sepCharCode;
    },
    encryption: function (plaintext) {
        const e = new sjcl.bn(app.encryptionOptions.e);
        const n = new sjcl.bn(app.encryptionOptions.n);
        let ret = [];
        for (let i = 0; i < plaintext.length; i++) {
            ret.push(plaintext[i].powermod(e, n).toString().slice(2));
        }
        return ret.join(';');
    },
    decryption: function (cyphertext) {
        cyphertext = cyphertext.split(";");
        const d = new sjcl.bn(app.decryptionOptions.d);
        const n = new sjcl.bn(app.decryptionOptions.n);

        // decode chunks and write them to Uint8Arrays
        let arrs = [];
        let fullLen = 0;
        for (let i = 0; i < cyphertext.length; i++) {
            // decode a chunk
            plainchunk = (new sjcl.bn(cyphertext[i])).powermod(d, n);

            // rewrite it to Uint8Array
            const arr = Uint8Array.from(
                plainchunk.toString().match(/.{2}/g) || [],
                function(byte) {
                    return parseInt(byte, 16);
                }
            );
            arrs.push(arr.slice(1));
            fullLen += arr.length - 1;
        }

        // merge the arrays
        let ret = new Uint8Array(fullLen);
        let cur_pos = 0;
        for (let i = 0; i < arrs.length; i++) {
            ret.set(arrs[i], cur_pos);
            cur_pos += arrs[i].length;
        }
        return ret;
    },
}

app.algosOptions.rsa = {
    "n": {
        "type": "text",
        "default": "a7965f314a26fad474896f787608b5e1b9b43c1b8193e064a10e81c1e43dee0d3797e0da074d456ac63af914b7790f3501fd57aa3f66a36e30a0930be5870bb990eb21b45981b20e7d16c6dd922ff3a21ff44e7a58a7585eebcca419680f9c2a65993933a475a9f0ded5255af8ec758da9cfd55805d2697bd44b70bce642989cc6ff24e6f6ea0e015763c1c2a83f893963211566188e7aec0dc7dda8163de674f9251fd61e8160aeb0e6b44a604df8f52233e1b4dab3c886a773c25a12b9f31877b905cc8b05be9ade48a336d7de293d959b8e7f1c15dd6da05329bf558c1b91c411515500f409a1ce9abb1b233d0ac628c84df080649440aa6c240926950623",
        "tooltip": "Dzielnik (hex)",
        "placeholder": "n",
    },
    "d": {
        "type": "text",
        "default": "941f5771d44d91a3988124f23eb942310997210d5ac11e33331b045b20661072c4314c3ec8f7662492a2eb268167d1a613651d47cf93e35d70436cd4b6015fbe9b3507ec44b45a716de464cecff7ec09dede6b42bdfae323ba9c7c6a2c4ca7c5dd58c97338a7fb15778ec2de9e67391b85fcb95f7c7dd657e972e8693dc79ce47e1198ab5f2a2a537bc76507aa652ae65ec7c9621e41249062870d60abf42eeee448fdb470e4b72da338df6db71b7cb8e9c4bb4d155a0dd7c69707ed2c66e49f89f88bfba045479f4dbb8078100abd9dda05a8a2c32cc7ea4379ad42d8729f3720145b0717dfcbf9aaf84b006e13eb305bcc0df8faf2518dcf5f153d76279e79",
        "tooltip": "Wykładnik prywatny (hex)",
        "placeholder": "d",
        "groups": ["decryptionOptions"],
    },
    "e": {
        "type": "text",
        "default": "10001",
        "tooltip": "Wykładnik publiczny (hex)",
        "placeholder": "e",
        "groups": ["encryptionOptions"],
    }
};
