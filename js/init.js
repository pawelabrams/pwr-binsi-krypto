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
    decryption: function (t) { return t; },
};
app.decryptionAlgo = "pass";

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
                    toAdd.placeholder = i;
            }
            on(toAdd, "change", function() {
                app[saveField][i] = this.value;
            });
            element.appendChild(toAdd);
        }
    }

    // Function to add messages to history div
    function addMessage(type, msg) {
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
            addMessage('log', 'Now talking to ' + conn.peer);
        });
    }

    // Add those functions after everything loaded
    on(window, 'load', function () {
        // peerjs
        window.peer = new Peer(undefined, { host: 'abramowicz.org', port: 9517, path: '/qomm'});
        peer.on('open', function(id) {
            $("#yourId").value = id;
            addMessage('log', 'You are ' + window.peer.id);
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
            let cyphertext = app.algos[app.encryptionAlgo].encryption(plaintext);
            app.context.connection.send(cyphertext);
            // add to history
            addMessage('local', plaintext);
            // clear plaintext field
            $("#plaintext").innerHTML = "";
        });

        // Data was received
        on(window, 'dataReceive', function (e) {
            addMessage('remote', app.algos[app.decryptionAlgo].decryption(e.detail));
        });

        // Re-decrypt last message, if algo changed and we didn't notice
        on($("#decrypt"), 'click', function() {
            $("#history > :last-child").innerHTML = app.algos[app.decryptionAlgo].decryption(app.context.received.slice(-1)[0]);
        });
    });
})();
