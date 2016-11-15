// Can't live w/o EventListeners
// if (!window.addEventListener)
//     return;

// Simplified dollar function
function $(selector, context) {
    context = context || document;
    return context.querySelector(selector);
}
function $$(selector, context) {
    context = context || document;
    let elements = context.querySelectorAll(selector);
    return Array.prototype.slice.call(elements);
}

// Simplified on function
function on(context, event, fn) {
    context = context || window;
    context.addEventListener(event, fn, false);
}

var app = {
    context: {},
    encryptionAlgo: null,
    encryptionOptions: {},
    decryptionAlgo: null,
    decryptionOptions: {},
    algos: {
        "caesar": {
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
        },
        "rot13": {
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
        },
        "vigenere": {
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
                const key = app.encryptionOptions.key.toUpperCase();
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
        },
    },
    algosOptions: {
        "caesar": {
            "move": "number"
        },
        "rot13": {
        },
        "vigenere": {
            "key": "text"
        },
    }
};

(function() {
    // Change enc/dec options
    function changeOptions(element, algo, saveField) {
        element.innerHTML = '';
        for (i in app.algosOptions[algo]) {
            let toAdd = undefined;
            switch(app.algosOptions[algo][i]) {
                case "number":
                case "text":
                    toAdd = document.createElement("input");
                    toAdd.type = app.algosOptions[algo][i];
                    toAdd.name = i;
            }
            on(toAdd, "change", function() {
                app[saveField][i] = this.value;
            });
            element.appendChild(toAdd);
        }
    }

    // Bind app.context: .received and .connection and make hangout visible
    function openHangout(conn) {
        conn.on('open', function() {
            // Receive messages
            app.context.received = [];
            conn.on('data', function(data) {
                console.log('Received '+data);
                app.context.received.push(data);
                window.dispatchEvent(new CustomEvent('dataReceive', {'detail': data}));
            });
            // Send messages
            app.context.connection = conn;
            // Make hangout visible
            $(".connect").style.display = 'none';
            $(".hangout").style.display = 'block';
        });
    }

    // Add those functions
    on(window, 'load', function () {
        // peerjs
        window.peer = new Peer(undefined, { host: 'abramowicz.org', port: 9517, path: '/qomm'});
        peer.on('open', function(id) { $("#yourId").value = id; });
        peer.on('connection', openHangout);
        on($("#connectButton"), 'click', function() {
            openHangout(peer.connect($("#connectId").value));
        });

        on($("#encryptionAlgo"), 'change', function() {
            app.encryptionAlgo = $("#encryptionAlgo").value;
            changeOptions($("#encryptionOptions"), app.encryptionAlgo, "encryptionOptions");
        });
        on($("#decryptionAlgo"), 'change', function() {
            app.decryptionAlgo = $("#decryptionAlgo").value;
            changeOptions($("#decryptionOptions"), app.decryptionAlgo, "decryptionOptions");
        });
        on($("#encrypt"), 'click', function() {
            let cyphertext = app.algos[app.encryptionAlgo].encryption($("#plaintext").value);
            $("#communication").innerHTML = cyphertext;
            app.context.connection.send(cyphertext);
        });
        on(window, 'dataReceive', function (e) {
            console.log(e);
            $("#decoded").innerHTML = app.algos[app.decryptionAlgo].decryption(e.detail);
        });
        on($("#decrypt"), 'click', function() {
            $("#decoded").innerHTML = app.algos[app.decryptionAlgo].decryption(app.context.received.slice(-1)[0]);
        });
    });
})();
