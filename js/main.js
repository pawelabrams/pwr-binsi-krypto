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
    encryptionAlgo: null,
    encryptionOptions: {},
    decryptionAlgo: null,
    decryptionOptions: {},
    algos: {
        "caesar": {
            encryption: function (plaintext) {
                return $("#move").value;
            },
            decryption: function (cyphertext) {

            },
        }
    },
    algosOptions: {
        "caesar": {
            "move": "number"
        },
    }
};

(function() {
    // Change enc/dec options
    function changeOptions(element, algo) {
        element.innerHTML = '';
        for (i in app.algosOptions[algo]) {
            let toAdd = undefined;
            switch(app.algosOptions[algo][i]) {
                case "number":
                    toAdd = document.createElement("input");
                    toAdd.type = "number";
                    toAdd.id = i;
            }
            element.appendChild(toAdd);
        }
    }

    // Add those functions
    on(window, 'load', function () {
        on($("#encryptionAlgo"), 'change', function() {
            app.encryptionAlgo = $("#encryptionAlgo").value;
            changeOptions($("#encryptionOptions"), app.encryptionAlgo);
        });
        on($("#decryptionAlgo"), 'change', function() {
            app.decryptionAlgo = $("#decryptionAlgo").value;
            changeOptions($("#decryptionOptions"), app.decryptionAlgo);
        });
        on($("#encrypt"), 'click', function() {
            $("#communication").innerHTML = app.algos[app.encryptionAlgo].encryption($("#plaintext").value);
        });
        on($("#decrypt"), 'click', function() {
            $("#decryption").innerHTML = app.algos[app.decryptionAlgo].decryption($("#communication").innerHTML);
        });
    });
})();
