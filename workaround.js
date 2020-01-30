const websites = [
  "*://*.dailytelegraph.com.au/*",
  "*://*.telegraph.co.uk/*",
  "*://*.ft.com/*",
  "://suzylu.co.uk/*"
];

const cookies = [
  "open_token=anonymous",
  "sr=true",
  "FreedomCookie=true",
  "n_regis=123456789"
]
  .join(";")
  .trim();

const UA_Desktop =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const UA_Mobile =
  "Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible ; Googlebot/2.1 ; +http://www.google.com/bot.html)";

function bypassPaywall(details) {
  const shouldDropUA = !details.url.includes("medium.com");
  var useMobileUA = false;
  var reqHeaders = details.requestHeaders.filter(function(header) {
    // drop cookies, referer and UA
    switch (header.name) {
      case "User-Agent":
        useMobileUA = header.value.toLowerCase().includes("mobile");
        return !shouldDropUA;
      case "Cookie":
      case "Referer":
        return false;
        break;
      default:
        return true;
    }
  });

  reqHeaders.push({
    name: "Referer",
    value: "https://www.google.com/"
  });

  if (shouldDropUA) {
    reqHeaders.push({
      name: "User-Agent",
      value: useMobileUA ? UA_Mobile : UA_Desktop
    });
  }

  reqHeaders.push({
    name: "Cookie",
    value: cookies
  });

  reqHeaders.push({
    name: "X-Forwarded-For",
    value: "66.249.66.1"
  });

  return { requestHeaders: reqHeaders };
}

function blocker(details) {
  var responseHeaders = details.responseHeaders.filter(function(header) {
    if (header.name === "Cookie") {
      return false;
    }

    return true;
  });

  return { responseHeaders: responseHeaders };
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  bypassPaywall,
  {
    urls: [...websites],
    types: ["main_frame", "script"]
  },
  ["requestHeaders", "blocking"]
);

chrome.webRequest.onHeadersReceived.addListener(
  blocker,
  {
    urls: [...websites],
    types: ["main_frame", "script"]
  },
  ["responseHeaders", "blocking"]
);
