/**
 * Qomm -- Simple Encrypted Messenger
 * by Paweł Abramowicz
 * (NOT FOR PRODUCTION USE)
 * (ABSOLUTELY NO WARRANTY)
 */

// simplified dollar function
function $(selector, context) {
    context = context || document;
    return context.querySelector(selector);
}
function $$(selector, context) {
    context = context || document;
    let elements = context.querySelectorAll(selector);
    return Array.prototype.slice.call(elements);
}

// simplified on function
function on(context, event, fn) {
    context = context || window;
    context.addEventListener(event, fn, false);
}

// app fields initialization
var app = {
    context: {},
    encryptionAlgo: null,
    encryptionOptions: {},
    decryptionAlgo: null,
    decryptionOptions: {},
    algos: {},
    algosOptions: {},
};

// make encrypted messages show even when no algorithm is selected
app.algos.pass = {
    textOutput: function (t) { return t; },
    decryption: function (t) { return t; },
    isEncryptedFile: function(f) { return false; },
};
app.decryptionAlgo = "pass";

(function() {
    function changeHelper(saveField, field) {
        return function() {
            app[saveField][field] = this.value;
        }
    }
    // Change enc/dec options
    function changeOptions(element, algo, saveField) {
        element.innerHTML = '';
        for (i in app.algosOptions[algo]) {
            if (app.algosOptions[algo][i].groups !== undefined && app.algosOptions[algo][i].groups.indexOf(saveField) < 0) {
                continue;
            }
            let toAdd = undefined;
            switch(app.algosOptions[algo][i]["type"]) {
                case "number":
                case "text":
                    toAdd = document.createElement("input");
                    toAdd.type = app.algosOptions[algo][i]["type"];
                    toAdd.name = i;
                    toAdd.placeholder = app.algosOptions[algo][i]["placeholder"];
                    toAdd.title = app.algosOptions[algo][i]["tooltip"];
                    toAdd.value = app[saveField][i] = app.algosOptions[algo][i]["default"];
            }
            on(toAdd, "change", changeHelper(saveField, i));
            element.appendChild(toAdd);
        }
    }

    // Function to add messages to history div
    app.addMessage = function(type, msg) {
        let toAdd = document.createElement("div");
        toAdd.classList.add(type);
        toAdd.innerHTML = msg;
        $("#history").appendChild(toAdd);
    }

    // Bind app.context: .received and .connection and make hangout visible
    function openHangout(conn) {
        conn.on('open', function() {
            // Receive messages
            app.context.received = [];
            conn.on('data', function(data) {
                app.context.received.push(data);
                window.dispatchEvent(new CustomEvent('dataReceive', {'detail': data}));
            });
            // Send messages
            app.context.connection = conn;
            // Make hangout visible
            $(".connect").style.display = 'none';
            $(".hangout").style.display = '';
            // Add info about who are we talking to
            app.addMessage('log', 'Rozmawiasz teraz z ' + conn.peer);
            // Fire an event
            window.dispatchEvent(new CustomEvent('connectionEstablished'));
        });
    }

    // Add those functions after everything loaded
    on(window, 'load', function () {
        // peerjs
        window.peer = new Peer(undefined, { host: 'abramowicz.org', port: 9517, path: '/qomm'});
        peer.on('open', function(id) {
            $("#yourId").value = id;
            app.addMessage('log', 'Twoje id to ' + window.peer.id);
        });
        peer.on('connection', openHangout);
        on($("#connectButton"), 'click', function() {
            openHangout(peer.connect($("#connectId").value));
        });

        // GUI: on algorithm change, show corresponding options
        on($("#encryptionAlgo"), 'change', function() {
            app.encryptionAlgo = $("#encryptionAlgo").value;
            changeOptions($("#encryptionOptions"), app.encryptionAlgo, "encryptionOptions");
        });
        on($("#decryptionAlgo"), 'change', function() {
            app.decryptionAlgo = $("#decryptionAlgo").value;
            changeOptions($("#decryptionOptions"), app.decryptionAlgo, "decryptionOptions");
        });

        // Encryption button was clicked
        on($("#encrypt"), 'click', function() {
            let plaintext = $("#plaintext").innerHTML.replace(/<br[^>]*>/gi, "\n");
            // send cyphertext
            let cyphertext = app.algos[app.encryptionAlgo].encryption(app.algos[app.encryptionAlgo].textInput(plaintext));
            app.context.connection.send(cyphertext);
            // add to history
            app.addMessage('local', plaintext);
            // clear plaintext field
            $("#plaintext").innerHTML = "";
        });

        // Data was received
        on(window, 'dataReceive', function (e) {
            const msg = app.algos[app.decryptionAlgo].decryption(e.detail);
            let line;
            if (app.algos[app.decryptionAlgo].isEncryptedFile(msg)) {
                let file = app.algos[app.decryptionAlgo].fileOutput(msg);
                line = `file: <a download="${file.filename}" href="${URL.createObjectURL(file.contents)}">${file.filename}</a>`;
            } else {
                line = app.algos[app.decryptionAlgo].textOutput(msg);
            }
            app.addMessage('remote', line);
        });

        // Re-decrypt last message, if algo changed and we didn't notice
        on($("#decrypt"), 'click', function() {
            const msg = app.algos[app.decryptionAlgo].decryption(app.context.received.slice(-1)[0]);
            let line;
            if (app.algos[app.decryptionAlgo].isEncryptedFile(msg)) {
                let file = app.algos[app.decryptionAlgo].fileOutput(msg);
                line = `file: <a download="${file.filename}" href="${URL.createObjectURL(file.contents)}">${file.filename}</a>`;
            } else {
                line = app.algos[app.decryptionAlgo].textOutput(msg);
            }
            $("#history > :last-child").innerHTML = line;
        });
    });
})();
