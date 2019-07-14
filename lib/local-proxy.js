"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
var process_1 = __importDefault(require("process"));
var child_process_1 = require("child_process");
var node_fetch_1 = __importDefault(require("node-fetch"));
var DefaultHost = "https://go.poi.dev";
var LocalServerJs = "#!/usr/bin/env node\n\nvar http = require(\"http\");\n\nvar golinkHost = \"https://go.poi.dev\";\n\nvar server = http.createServer(function(req, res) {\n  res.writeHead(301, { Location: golinkHost + req.url });\n  res.end();\n});\n\nserver.listen(80);\n";
var manual = 0;
var verifyHost = function (golinkHost) {
    if (golinkHost === void 0) { golinkHost = DefaultHost; }
    return __awaiter(_this, void 0, void 0, function () {
        var qualifiedHost, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    qualifiedHost = golinkHost.startsWith("http")
                        ? golinkHost
                        : "http://" + golinkHost;
                    return [4 /*yield*/, node_fetch_1.default(qualifiedHost)];
                case 1:
                    res = _a.sent();
                    if (!res.ok) {
                        throw new Error("Verify host " + qualifiedHost + " failed: " + res.statusText);
                    }
                    return [2 /*return*/, res.ok];
            }
        });
    });
};
var prepareServer = function (golinkHost) {
    if (golinkHost === void 0) { golinkHost = DefaultHost; }
    if (process_1.default.platform !== "win32" && fs_1.default.existsSync("/mnt/c")) {
        throw new Error("WSL detected. Abort. Installation in WSL won't starup in Windows. Please run in powershell in your Windows.");
    }
    var qualifiedHost = golinkHost.startsWith("http")
        ? golinkHost
        : "http://" + golinkHost;
    var serverJs = LocalServerJs.replace(DefaultHost, qualifiedHost);
    var serverJsPath = path_1.default.join(os_1.default.homedir(), "golink-local.js");
    fs_1.default.writeFileSync(serverJsPath, serverJs);
    console.log("Created reverse proxy server script at: ", serverJsPath);
    return serverJsPath;
};
var installStartup = function (serverJsPath) {
    if (serverJsPath === void 0) { serverJsPath = ""; }
    switch (process_1.default.platform) {
        case "win32": {
            var startupWrapper = "CreateObject(\"Wscript.Shell\").Run \"node " + serverJsPath + "\", 0";
            var startupWrapperPath = path_1.default.join(process_1.default.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs", "Startup", "golink-local.vbs");
            fs_1.default.writeFileSync(startupWrapperPath, startupWrapper);
            console.log("Created startup entry at: ", startupWrapperPath);
            return startupWrapperPath;
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
var installHosts = function () {
    switch (process_1.default.platform) {
        case "win32": {
            var hostsPath = "c:\\Windows\\System32\\Drivers\\etc\\hosts";
            try {
                var hostsContent = fs_1.default.readFileSync(hostsPath, "utf8");
                if (hostsContent.includes("127.0.0.1 go")) {
                    console.log("Found go TLD in hosts, skip writing hosts");
                    break;
                }
                fs_1.default.writeFileSync(hostsPath, "\r\n127.0.0.1 go\r\n", { flag: "a" });
                console.log("Appended go TLD at: ", hostsPath);
            }
            catch (error) {
                console.error(error);
                console.error("Append go TLD record in etc/hosts failed.");
                manual += 1;
                console.error("Manual setup instruction: Please add the following record\r\n127.0.0.1 go\r\nto ", hostsPath);
            }
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
var firstTimeStart = function (startupWrapperPath) {
    if (startupWrapperPath === void 0) { startupWrapperPath = ""; }
    return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!fs_1.default.existsSync(startupWrapperPath)) {
                console.log("Server not started. No startup script found at ", startupWrapperPath);
                return [2 /*return*/];
            }
            child_process_1.execFile(startupWrapperPath, { shell: true });
            return [2 /*return*/, new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 5000);
                })];
        });
    });
};
exports.install = function (golinkHost) {
    if (golinkHost === void 0) { golinkHost = DefaultHost; }
    manual = 0;
    var asyncInstall = function () { return __awaiter(_this, void 0, void 0, function () {
        var serverJsPath, startupWrapperPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, verifyHost(golinkHost)];
                case 1:
                    if (!(_a.sent())) {
                        throw new Error("Provided host " + golinkHost + " didn't respond 200 ok.");
                    }
                    serverJsPath = prepareServer(golinkHost);
                    startupWrapperPath = installStartup(serverJsPath);
                    installHosts();
                    return [4 /*yield*/, firstTimeStart(startupWrapperPath)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    asyncInstall()
        .then(function () {
        if (manual === 0) {
            console.log("It looks like the local dns is installed. Please open http://go/google to verify.\nPlease reboot to verify if the local dns proxy server will start automatically.\nIf there's any problem, please check http://poi.page/golink-local-dns");
        }
        else {
            console.log("There are " + manual + " steps failed. Please try to rerun the script as root/admin.\nYou can also follow the instructions in the error message to install manually.\nPlease check http://poi.page/golink-local-dns\" for more details");
        }
    })
        .catch(function (error) {
        console.error(error);
        console.error("Precheck failed. Abort.");
    });
};
exports.default = {
    install: exports.install,
};
//# sourceMappingURL=local-proxy.js.map