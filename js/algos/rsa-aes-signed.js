app.algos.rsaAesSigned = {
    keyNegotiated: {
        encryption: false,
        decryption: false,
    },
    randomKey: function () {
        let array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return array;
    },
    textInput: app.algos.aes.textInput.bind(app.algos.aes),
    textOutput: app.algos.aes.textOutput.bind(app.algos.aes),
    fileInput: app.algos.aes.fileInput.bind(app.algos.aes),
    fileOutput: app.algos.aes.fileOutput.bind(app.algos.aes),
    isEncryptedFile: app.algos.aes.isEncryptedFile.bind(app.algos.aes),
    encryption: function (plaintext) {
        ret = "";
        if (!this.keyNegotiated.encryption) {
            let keyToSend = this.randomKey();
            app.encryptionOptions.key = "";
            for (let i = 0; i < keyToSend.length; i++) {
                app.encryptionOptions.key += ('0' + keyToSend[i].toString(16)).slice(-2);
            }
            this.keyNegotiated.encryption = true;
            ret += app.algos.rsa.encryption(app.algos.rsa.toHex(keyToSend)) + ";";
        }
        ret += app.algos.aes.encryption(plaintext) + ";";

        // Jeez, it's so hacky I don't even.
        // Add a signature
        const signatureSize = app.algos.rsa.getChunkSize(app.encryptionOptions.sn.length) + 2;
        let oldEO = app.encryptionOptions;
        app.encryptionOptions = {n: app.encryptionOptions.sn, e: app.encryptionOptions.sd};
        let theHash = CryptoJS.SHA256(plaintext.toString()).toString();
        let signature = app.algos.rsa.encryption(app.algos.rsa.textInput(theHash));
        app.encryptionOptions = oldEO;

        ret += signature
        return ret;
    },
    decryption: function (cyphertext) {
        cyphertext = cyphertext.split(";");
        if (!this.keyNegotiated.decryption) {
            let keyToSave = app.algos.rsa.decryption(cyphertext.shift());
            app.decryptionOptions.key = "";
            for (let i = 0; i < keyToSave.length; i++) {
                app.decryptionOptions.key += ('0' + keyToSave[i].toString(16)).slice(-2);
            }
            this.keyNegotiated.decryption = true;
        }

        // Jeez, it's so hacky I don't even.
        let oldDO = app.decryptionOptions;
        let check;
        try {
          app.decryptionOptions = {n: app.decryptionOptions.sn, d: app.decryptionOptions.se};
          check = app.algos.rsa.textOutput(app.algos.rsa.decryption(cyphertext.pop()));
        } catch (e) {
          alert ("couldn't verify!");
          return;
        } finally {
          app.decryptionOptions = oldDO;
        }

        let decrypted = app.algos.aes.decryption(cyphertext.join(';'));
        if (check !== CryptoJS.SHA256(decrypted.toString()).toString()) {
          alert ("couldn't verify!");
        }
        return decrypted;
    },
}

app.algosOptions.rsaAesSigned = {
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
    },
    "sn": {
        "type": "text",
        "default": "a7965f314a26fad474896f787608b5e1b9b43c1b8193e064a10e81c1e43dee0d3797e0da074d456ac63af914b7790f3501fd57aa3f66a36e30a0930be5870bb990eb21b45981b20e7d16c6dd922ff3a21ff44e7a58a7585eebcca419680f9c2a65993933a475a9f0ded5255af8ec758da9cfd55805d2697bd44b70bce642989cc6ff24e6f6ea0e015763c1c2a83f893963211566188e7aec0dc7dda8163de674f9251fd61e8160aeb0e6b44a604df8f52233e1b4dab3c886a773c25a12b9f31877b905cc8b05be9ade48a336d7de293d959b8e7f1c15dd6da05329bf558c1b91c411515500f409a1ce9abb1b233d0ac628c84df080649440aa6c240926950623",
        "tooltip": "Dzielnik podpisu (hex)",
        "placeholder": "sig_n",
    },
    "sd": {
        "type": "text",
        "default": "941f5771d44d91a3988124f23eb942310997210d5ac11e33331b045b20661072c4314c3ec8f7662492a2eb268167d1a613651d47cf93e35d70436cd4b6015fbe9b3507ec44b45a716de464cecff7ec09dede6b42bdfae323ba9c7c6a2c4ca7c5dd58c97338a7fb15778ec2de9e67391b85fcb95f7c7dd657e972e8693dc79ce47e1198ab5f2a2a537bc76507aa652ae65ec7c9621e41249062870d60abf42eeee448fdb470e4b72da338df6db71b7cb8e9c4bb4d155a0dd7c69707ed2c66e49f89f88bfba045479f4dbb8078100abd9dda05a8a2c32cc7ea4379ad42d8729f3720145b0717dfcbf9aaf84b006e13eb305bcc0df8faf2518dcf5f153d76279e79",
        "tooltip": "Wykładnik prywatny podpisu (hex)",
        "placeholder": "sig_d",
        "groups": ["encryptionOptions"],
    },
    "se": {
        "type": "text",
        "default": "10001",
        "tooltip": "Wykładnik publiczny podpisu (hex)",
        "placeholder": "sig_e",
        "groups": ["decryptionOptions"],
    },
};
