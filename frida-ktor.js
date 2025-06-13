Java.perform(function () {
    var CIOEngine = Java.use("io.ktor.client.engine.cio.CIOEngine");

    
    var RESET = "\x1b[0m";
    var BRIGHT = "\x1b[1m";
    var DIM = "\x1b[2m";
    var RED = "\x1b[31m";
    var GREEN = "\x1b[32m";
    var YELLOW = "\x1b[33m";
    var BLUE = "\x1b[34m";
    var MAGENTA = "\x1b[35m";
    var CYAN = "\x1b[36m";

    function timestamp() {
        return new Date().toISOString();
    }

    function logSection(title, color) {
        console.log(color + BRIGHT + "\n=== " + title + " ===" + RESET);
    }

    function logKV(key, val, keyColor = CYAN, valColor = RESET) {
        console.log(keyColor + key.padEnd(20) + RESET + ": " + valColor + val + RESET);
    }

    CIOEngine.execute.overloads.forEach(function (overload) {
        overload.implementation = function (requestData) {
            if (!requestData) {
                return this.execute.apply(this, arguments);
            }

            try {
                console.log(DIM + "[" + timestamp() + "] " + RESET + BRIGHT + "CIOEngine.execute called" + RESET);

                var url = "N/A";
                try {
                    var urlField = requestData.getClass().getDeclaredField("url");
                    urlField.setAccessible(true);
                    url = urlField.get(requestData).toString();
                } catch (e) {
                    url = "Unavailable";
                }

               
                var methodField = requestData.getClass().getDeclaredField("method");
                methodField.setAccessible(true);
                var methodObj = methodField.get(requestData);
                var httpMethod = (methodObj.value) ? methodObj.value : methodObj.toString();

                logSection("Request Info", GREEN);
                logKV("URL", url);
                logKV("HTTP Method", httpMethod);

                
                logSection("Headers", YELLOW);
                var headersField = requestData.getClass().getDeclaredField("headers");
                headersField.setAccessible(true);
                var headers = headersField.get(requestData);
                if (headers) {
                    try {
                        var names = headers.names();
                        var headerCount = names.size();
                        if (headerCount === 0) {
                            console.log("<No headers>");
                        } else {
                            for (var i = 0; i < headerCount; i++) {
                                var name = names.get(i);
                                var values = headers.getAll(name);
                                var valStr = values ? values.toString() : "<null>";
                                logKV(name, valStr, MAGENTA, RESET);
                            }
                        }
                    } catch (e) {
                        console.log("<Could not iterate headers, fallback>");
                        console.log(headers.toString());
                    }
                } else {
                    console.log("<Headers object is null>");
                }

               
                logSection("Body / Content", BLUE);

                var contentField = null;
                try {
                    contentField = requestData.getClass().getDeclaredField("body");
                } catch (e) {
                    try {
                        contentField = requestData.getClass().getDeclaredField("content");
                    } catch (ee) {
                        console.log(RED + "<Could not find body or content field>" + RESET);
                    }
                }

                if (contentField) {
                    contentField.setAccessible(true);
                    var content = contentField.get(requestData);

                    if (content) {
                        var contentClassName = content.getClass().getName();
                        logKV("Content class", contentClassName);

                        if (contentClassName === "io.ktor.http.content.TextContent") {
                            var text = null;
                            try {
                                var textField = content.getClass().getDeclaredField("text");
                                textField.setAccessible(true);
                                text = textField.get(content);
                            } catch (e) {}

                            if (!text) {
                                if (content.text) {
                                    if (typeof content.text === "function") {
                                        try {
                                            text = content.text();
                                        } catch (_) {}
                                    } else if (content.text.value) {
                                        text = content.text.value;
                                    } else {
                                        text = content.text.toString();
                                    }
                                } else {
                                    text = content.toString();
                                }
                            }

                            
                            try {
                                var pretty = JSON.stringify(JSON.parse(text), null, 2);
                                console.log(pretty);
                            } catch (jsonErr) {
                                console.log(text);
                            }
                        } else {
                            var fields = content.getClass().getDeclaredFields();
                            fields.forEach(function (field) {
                                field.setAccessible(true);
                                try {
                                    var val = field.get(content);
                                    logKV(field.getName(), val === null ? "<null>" : val.toString());
                                } catch (e) {
                                    logKV(field.getName(), "<unable to read>");
                                }
                            });
                            console.log(content.toString());
                        }
                    } else {
                        console.log("<Content is null>");
                    }
                } else {
                    console.log("<Content field not found>");
                }

                
                console.log(GREEN + BRIGHT + "\n=== Request Summary ===" + RESET);
                logKV("URL", url);
                logKV("HTTP Method", httpMethod);
                console.log("\n");

            } catch (ex) {
                console.log(RED + "[!] Exception in hook: " + ex + RESET);
            }

            return this.execute.apply(this, arguments);
        };
    });
});
