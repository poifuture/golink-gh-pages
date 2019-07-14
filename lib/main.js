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
var rimraf_1 = __importDefault(require("rimraf"));
var json5_1 = __importDefault(require("json5"));
var json_stable_stringify_1 = __importDefault(require("json-stable-stringify"));
var child_process_1 = require("child_process");
var local_proxy_1 = __importDefault(require("./local-proxy"));
var getFuzzyKey = function (key) {
    return key.replace(/[^a-zA-Z0-9]*/g, "").toLowerCase();
};
var DefaultConfig = {
    cleanStart: false,
    fuzzy: true,
    jekyll301: false,
    sort: true,
    unsafe: false,
    homepage: "https://github.com/poifuture/golink-gh-pages/",
};
var ConfigPath = "golink.config.json";
var resolveConfig = function () {
    if (!fs_1.default.existsSync(ConfigPath)) {
        var defaultConfigString = json_stable_stringify_1.default(DefaultConfig, { space: 2 });
        fs_1.default.writeFileSync(ConfigPath, defaultConfigString);
    }
    var configString = fs_1.default.readFileSync(ConfigPath, "utf8");
    var config = json5_1.default.parse(configString);
    console.log("Golink config: ", config);
    return config;
};
var initRepo = function () {
    if (!fs_1.default.existsSync("package.json")) {
        fs_1.default.writeFileSync("package.json", json_stable_stringify_1.default({
            scripts: {
                build: "golink",
                start: "npm build && serve docs",
            },
            devDependencies: {
                "golink-gh-pages": "^1.20190712.2",
                serve: "^11.1.0",
            },
        }, { space: 2 }));
        child_process_1.execSync("npm init -y");
    }
    if (!fs_1.default.existsSync("entries.json")) {
        fs_1.default.writeFileSync("entries.json", json_stable_stringify_1.default({
            google: "https://www.google.com/",
            "google-maps": "https://maps.google.com/",
            youtube: "https://www.youtube.com/",
        }, { space: 2 }));
    }
    if (!fs_1.default.existsSync(".circleci")) {
        fs_1.default.mkdirSync(".circleci");
    }
    if (!fs_1.default.existsSync(".circleci/config.yml")) {
        fs_1.default.copyFileSync(__dirname + "/.circleci/config.yml", ".circleci/config.yml");
    }
};
var initDocs = function (_a) {
    var _b = _a.cleanStart, cleanStart = _b === void 0 ? DefaultConfig.cleanStart : _b, _c = _a.fuzzy, fuzzy = _c === void 0 ? DefaultConfig.fuzzy : _c, _d = _a.unsafe, unsafe = _d === void 0 ? DefaultConfig.unsafe : _d, _e = _a.homepage, homepage = _e === void 0 ? DefaultConfig.homepage : _e;
    if (cleanStart) {
        if (fs_1.default.existsSync("docs")) {
            rimraf_1.default.sync("docs");
        }
    }
    if (!fs_1.default.existsSync("docs")) {
        fs_1.default.mkdirSync("docs");
    }
    if (!fs_1.default.existsSync("docs/entry")) {
        fs_1.default.mkdirSync("docs/entry");
    }
    var templateHtml = fs_1.default.readFileSync(__dirname + "/template.html", "utf8");
    if (fuzzy !== true) {
        templateHtml = templateHtml.replace(/fuzzy start(.|\n)*fuzzy end/gm, "");
    }
    if (unsafe !== true) {
        templateHtml = templateHtml.replace(/unsafe start(.|\n)*unsafe end/gm, "");
    }
    if (homepage) {
        templateHtml = templateHtml.replace("// homepage jump", "location = \"" + homepage + "\"");
    }
    fs_1.default.writeFileSync("docs/index.html", templateHtml);
};
var readEntries = function (_a) {
    var _b = _a.sort, sort = _b === void 0 ? DefaultConfig.sort : _b;
    var entriesString = fs_1.default.readFileSync("entries.json", "utf8");
    var entries = json5_1.default.parse(entriesString);
    if (sort) {
        fs_1.default.writeFileSync("entries.json", json_stable_stringify_1.default(entries, { space: 2 }));
    }
    return entries;
};
var resolveRichEntries = function (_a) {
    var _b = _a.fuzzy, fuzzy = _b === void 0 ? DefaultConfig.fuzzy : _b, _c = _a.sort, sort = _c === void 0 ? DefaultConfig.sort : _c;
    var entries = readEntries({ sort: sort });
    var richEntries = {};
    var fuzzyPointers = {};
    for (var key in entries) {
        var fuzzyKey = getFuzzyKey(key);
        if (fuzzyKey in fuzzyPointers) {
            var warningMessage = "Two entries (" + key + " and " + fuzzyPointers[fuzzyKey] + ") have identical fuzzy key: " + fuzzyKey;
            if (fuzzy === true) {
                throw new Error(warningMessage);
            }
            else {
                console.warn(warningMessage);
            }
        }
        fuzzyPointers[fuzzyKey] = key;
        richEntries[key] = {
            fuzzyKey: fuzzyKey,
            target: entries[key],
        };
    }
    return richEntries;
};
var buildJekyll = function (richEntries) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.all(Object.keys(richEntries).map(function (key) {
                    return new Promise(function (resolve, reject) {
                        fs_1.default.writeFile("docs/" + key, "---\nredirect_to: " + richEntries[key].target + "\n---", function (error) {
                            if (error) {
                                reject(error);
                            }
                            resolve();
                        });
                    });
                }))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var buildEntries = function (richEntries, _a) {
    var _b = _a.fuzzy, fuzzy = _b === void 0 ? true : _b;
    return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, Promise.all(Object.keys(richEntries).map(function (key) {
                        return new Promise(function (resolve, reject) {
                            fs_1.default.writeFile("docs/entry/" + (fuzzy ? richEntries[key].fuzzyKey : key), richEntries[key].target, function (error) {
                                if (error) {
                                    reject(error);
                                }
                                resolve();
                            });
                        });
                    }))];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
};
var github404Hack = function () {
    var spaHtml = fs_1.default.readFileSync("docs/index.html", "utf8");
    fs_1.default.writeFileSync("docs/404.html", "---\npermalink: /404.html\n---\n" + spaHtml);
};
var build = function () { return __awaiter(_this, void 0, void 0, function () {
    var config, richEntries;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                config = resolveConfig();
                initRepo();
                initDocs({
                    cleanStart: config.cleanStart,
                    fuzzy: config.fuzzy,
                    unsafe: config.unsafe,
                    homepage: config.homepage,
                });
                richEntries = resolveRichEntries({
                    fuzzy: config.fuzzy,
                    sort: config.sort,
                });
                return [4 /*yield*/, buildEntries(richEntries, { fuzzy: config.fuzzy })];
            case 1:
                _a.sent();
                if (!config.jekyll301) return [3 /*break*/, 3];
                return [4 /*yield*/, buildJekyll(richEntries)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                github404Hack();
                return [2 /*return*/];
        }
    });
}); };
exports.default = (function () {
    if (process.argv[2] === "install-local-dns") {
        local_proxy_1.default.install(process.argv[3]);
        return;
    }
    build()
        .then(function () {
        console.log("Golink build done.");
    })
        .catch(function (error) {
        console.error(error);
    });
});
//# sourceMappingURL=main.js.map