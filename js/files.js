(function() {
    on(window, 'connectionEstablished', function (e) {
        // GUI
        on($("#sendFile"), 'click', function() {
            if (!app.encryptionAlgo) {
                alert('Wybierz algorytm szyfrowania zanim prześlesz plik!');
            } else {
                $("#filesSelector").style.display = '';
            }
        });
        on($("#filesSelector"), 'click', function() {
            $("#filesSelector").style.display = 'none';
        });
        on($("#filesSelector .box"), 'click', function(event) {
            event.stopPropagation();
        });

        // Send files
        on($("#files"), 'change', function () {
            const files = this.files;
            const f_len = files.length;
            let i = 0;
            let file_readers = [];

            while (i < f_len) {
                let file = files[i];
                let fr = new FileReader();
                // fr.onprogress = function () {
                //     progress bar of loading here
                // };
                fr.onloadend = function () {
                    // send cyphertext
                    let cyphertext = app.algos[app.encryptionAlgo]
                        .encryption(
                            app.algos[app.encryptionAlgo]
                                .fileInput(file.name, new Uint8Array(this.result))
                        );
                    app.context.connection.send(cyphertext);
                    // add to history
                    app.addMessage('local', 'file: ' + file.name);
                };
                fr.readAsArrayBuffer(file);
                file_readers.push(fr);
                i++;
            }
            // clear file field
            this.files = [];
        });
    });
})();
