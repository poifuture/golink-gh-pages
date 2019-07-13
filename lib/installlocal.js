"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
var process_1 = __importDefault(require("process"));
var child_process_1 = require("child_process");
var DefaultHost = "https://go.poi.dev";
var LocalServerJs = "#!/usr/bin/env node\n\nvar http = require(\"http\");\n\nvar golinkHost = \"https://go.poi.dev\";\n\nvar server = http.createServer(function(req, res) {\n  res.writeHead(301, { Location: golinkHost + req.url });\n  res.end();\n});\n\nserver.listen(80);\n";
var StartupReg = "Windows Registry Editor Version 5.00\n\n[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run]\n\n\"GoLink\"=\"\\\"node %ESCAPESERVERJSPATH%\\\"\"\n";
var prepare = function (golinkHost) {
    if (golinkHost === void 0) { golinkHost = DefaultHost; }
    if (process_1.default.platform !== "win32" && fs_1.default.existsSync("/mnt/c")) {
        throw new Error("WSL detected. Abort. Installation needs to inject Windows registry. Please run in powershell.");
    }
    var protoHost = golinkHost.startsWith("http")
        ? golinkHost
        : "http://" + golinkHost;
    var serverJs = LocalServerJs.replace(DefaultHost, golinkHost);
    var serverJsPath = path_1.default.join(os_1.default.homedir(), "golink-local.js");
    fs_1.default.writeFileSync(serverJsPath, serverJs);
    switch (process_1.default.platform) {
        case "win32": {
            var escapeServerJsPath = serverJsPath.replace(/[\\]/g, "\\\\");
            var reg = StartupReg.replace("%ESCAPESERVERJSPATH%", escapeServerJsPath);
            fs_1.default.writeFileSync(path_1.default.join(os_1.default.homedir(), "golink-local.reg"), reg);
            break;
        }
        case "linux": {
            throw new Error("Unsupported platform: " + process_1.default.platform);
            break;
        }
        case "darwin": {
            throw new Error("Unsupported platform: " + process_1.default.platform);
            break;
        }
        default: {
            throw new Error("Unsupported platform: " + process_1.default.platform);
        }
    }
};
exports.default = (function (golinkHost) {
    if (golinkHost === void 0) { golinkHost = DefaultHost; }
    prepare(golinkHost);
    try {
        switch (process_1.default.platform) {
            case "win32": {
                child_process_1.exec(path_1.default.join(os_1.default.homedir(), "golink-local.reg"));
                fs_1.default.writeFileSync("c:\\Windows\\System32\\Drivers\\etc\\hosts", "\r\n127.0.0.1 go\r\n", { flag: "a" });
                break;
            }
            case "linux": {
                throw new Error("Unsupported platform: " + process_1.default.platform);
                break;
            }
            case "darwin": {
                throw new Error("Unsupported platform: " + process_1.default.platform);
                break;
            }
            default: {
                throw new Error("Unsupported platform: " + process_1.default.platform);
            }
        }
    }
    catch (error) {
        console.error(error);
        console.log("\nInstall not finished.\nThe installation needs to write local dns for go TLD and os registry for auto startup the local redirect server.\nYou can try to rerun \"golink install-local\" with root permision.\nOr, you can configure it manually described as follows.\n\n1. Append this record in your os etc/hosts\n\n127.0.0.1 go\n\nThe hosts file is located at:\nLinux: /etc/hosts\nWindows: c:\\Windows\\System32\\Drivers\\etc\\hosts\n\n2. Add the server to your os startup services\nWindows: Run %USERPROFILE%/golink-local.reg\n\n3. If the redirect server is not generated at ~/golink-local.js. Please create it manually.\n\n" + LocalServerJs + "\n\nInstall not finished.\nYou can try to rerun \"golink install-local\" with root permision.\n    ");
    }
});
//# sourceMappingURL=installlocal.js.map