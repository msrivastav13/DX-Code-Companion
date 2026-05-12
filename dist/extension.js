/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(__webpack_require__(1));
const config_1 = __webpack_require__(2);
const ccprovider_1 = __importDefault(__webpack_require__(4));
const changeset_1 = __webpack_require__(5);
const deploy_1 = __webpack_require__(10);
const navigation_1 = __webpack_require__(15);
const osUtils_1 = __webpack_require__(8);
const retrieve_1 = __webpack_require__(16);
const switchOrg_1 = __webpack_require__(17);
const vscodeCore_1 = __webpack_require__(7);
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // show activation message
    vscodeCore_1.VSCodeCore.showActivationMessage();
    // Auto-install mo-dx-plugin on activation
    const activeTerminal = vscodeCore_1.VSCodeCore.setupTerminal();
    if (activeTerminal) {
        activeTerminal.sendText('sf plugins install mo-dx-plugin@latest');
    }
    const retrieveSource = vscode.commands.registerCommand('retrieve.dxSource', () => __awaiter(this, void 0, void 0, function* () {
        const connection = yield config_1.Config.getConnection();
        const retrievesrc = new retrieve_1.RetrieveSource(connection);
        retrievesrc.retrieve('sf retrieve dxsource -n ');
    }));
    const retrievepkgSource = vscode.commands.registerCommand('retrieve.pkgSource', () => __awaiter(this, void 0, void 0, function* () {
        const connection = yield config_1.Config.getConnection();
        const retrievesrc = new retrieve_1.RetrieveSource(connection);
        retrievesrc.retrieve('sf retrieve pkgsource -n ');
    }));
    const deploysrc = vscode.commands.registerCommand('deploy.src', (fileUri) => __awaiter(this, void 0, void 0, function* () {
        yield deploy_1.DeploySource.deploySrc(fileUri.path);
    }));
    const changesetRetrieve = vscode.commands.registerCommand('changeset.retrieve', () => __awaiter(this, void 0, void 0, function* () {
        let changeset = new changeset_1.Changeset();
        yield changeset.retrieve();
    }));
    const changesetOrgAdd = vscode.commands.registerCommand('changeset.addorgs', () => __awaiter(this, void 0, void 0, function* () {
        let changeset = new changeset_1.Changeset();
        yield changeset.addOrgs();
    }));
    const openSLDS = vscode.commands.registerCommand('open.slds', () => {
        navigation_1.NavigationService.openSLDSDocument();
    });
    const openMetadataCoverage = vscode.commands.registerCommand('open.metadataCoverageReport', () => {
        navigation_1.NavigationService.metadataCoverageReport();
    });
    const openComponentLibrary = vscode.commands.registerCommand('open.componentLibrary', () => {
        navigation_1.NavigationService.componentLibrary();
    });
    const openSalesforceOrg = vscode.commands.registerCommand('open.org', () => {
        let activeTerminal = vscodeCore_1.VSCodeCore.setupTerminal();
        if (activeTerminal) {
            let openCmd = 'sf org open';
            activeTerminal.sendText(openCmd);
        }
    });
    const installPlugin = vscode.commands.registerCommand('extension.installplugin', () => {
        let activeTerminal = vscodeCore_1.VSCodeCore.setupTerminal();
        if (activeTerminal) {
            let openCmd = 'sf plugins install mo-dx-plugin@latest';
            activeTerminal.sendText(openCmd);
        }
    });
    const openVFPage = vscode.commands.registerCommand('open.vf', () => {
        let activeTerminal = vscodeCore_1.VSCodeCore.setupTerminal();
        if (activeTerminal) {
            let openCmd = 'sf org open -p /apex/' + navigation_1.NavigationService.openVFPage(vscodeCore_1.VSCodeCore.getFsPath());
            activeTerminal.sendText(openCmd);
        }
    });
    const openLightningAppPage = vscode.commands.registerCommand('open.lightningPage', () => {
        let activeTerminal = vscodeCore_1.VSCodeCore.setupTerminal();
        if (activeTerminal) {
            let openCmd = 'sf org open -f ' + '"' + vscodeCore_1.VSCodeCore.getFsPath() + '"';
            activeTerminal.sendText(openCmd);
        }
    });
    const switchorg = vscode.commands.registerCommand('switch.org', () => __awaiter(this, void 0, void 0, function* () {
        yield (0, switchOrg_1.switchOrg)();
    }));
    const deployStaticResource = vscode.commands.registerCommand('deploy.staticresource', (uri) => {
        const staticresourcefolder = vscode.workspace.getConfiguration("dx-code-companion").staticresourcefolder.resourceBundleFoldername;
        let activeTerminal = vscodeCore_1.VSCodeCore.setupTerminal();
        if (activeTerminal) {
            if (uri.fsPath.indexOf(staticresourcefolder) !== -1) {
                let openCmd = 'sf deploy staticresource -p ' + '"' + osUtils_1.OSUtil.toUnixStyle(uri.fsPath) + '"' + ' -r ' + staticresourcefolder;
                activeTerminal.sendText(openCmd);
            }
        }
    });
    const deploySource = vscode.commands.registerCommand('deploy.source', () => {
        if (vscode.window.activeTextEditor) {
            deploy_1.DeploySource.deployToSFDC(vscode.window.activeTextEditor.document);
        }
    });
    const refreshSource = vscode.commands.registerCommand('refresh.source', () => __awaiter(this, void 0, void 0, function* () {
        if (vscode.window.activeTextEditor) {
            deploy_1.DeploySource.refreshFromServer(vscode.window.activeTextEditor.document);
        }
    }));
    const compareSource = vscode.commands.registerCommand('compare.source', () => __awaiter(this, void 0, void 0, function* () {
        if (vscode.window.activeTextEditor) {
            deploy_1.DeploySource.compareWithServer(vscode.window.activeTextEditor.document);
        }
    }));
    // Provider for compare view when server files are modified
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('codecompanion', ccprovider_1.default.getInstance()));
    // Trigger Deploy on Save
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((textDocument) => {
        if (vscode.window.activeTextEditor) {
            // Execute save only for the opened Editor file save event
            if (vscode.window.activeTextEditor.document.uri.fsPath === textDocument.uri.fsPath) {
                deploy_1.DeploySource.deploy(textDocument);
            }
        }
    }));
    context.subscriptions.push(deploySource);
    context.subscriptions.push(changesetRetrieve);
    context.subscriptions.push(compareSource);
    context.subscriptions.push(refreshSource);
    context.subscriptions.push(retrieveSource);
    context.subscriptions.push(retrievepkgSource);
    context.subscriptions.push(openLightningAppPage);
    context.subscriptions.push(openMetadataCoverage);
    context.subscriptions.push(openComponentLibrary);
    context.subscriptions.push(openVFPage);
    context.subscriptions.push(openSLDS);
    context.subscriptions.push(switchorg);
    context.subscriptions.push(openSalesforceOrg);
    context.subscriptions.push(deploysrc);
    context.subscriptions.push(changesetOrgAdd);
    context.subscriptions.push(deployStaticResource);
    context.subscriptions.push(installPlugin);
}
// this method is called when your extension is deactivated
function deactivate() {
    vscodeCore_1.VSCodeCore.showActivationMessage().dispose();
}


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Config = void 0;
const sfcore = __importStar(__webpack_require__(3));
const vscode = __importStar(__webpack_require__(1));
class Config {
    static getAllOrgs() {
        return __awaiter(this, void 0, void 0, function* () {
            const authorizations = yield sfcore.AuthInfo.listAllAuthorizations();
            return authorizations.map(a => a.username);
        });
    }
    static getAllOrgAliases() {
        return __awaiter(this, void 0, void 0, function* () {
            const orgAlias = [];
            const orgs = yield this.getAllOrgs();
            const stateAgg = yield sfcore.StateAggregator.getInstance();
            for (const org of orgs) {
                const alias = stateAgg.aliases.get(org);
                if (alias) {
                    orgAlias.push(alias + ':' + org);
                }
            }
            return orgAlias;
        });
    }
    static getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            let defaultusername = yield Config.getDefaultUsername();
            const connection = yield sfcore.Connection.create({
                authInfo: yield sfcore.AuthInfo.create({ username: defaultusername })
            });
            return connection;
        });
    }
    static getDefaultUsername() {
        return __awaiter(this, void 0, void 0, function* () {
            if (vscode.workspace && vscode.workspace.workspaceFolders) {
                const aggregator = yield sfcore.ConfigAggregator.create();
                const value = aggregator.getPropertyValue(sfcore.OrgConfigProperties.TARGET_ORG);
                if (!value) {
                    return undefined;
                }
                const stateAgg = yield sfcore.StateAggregator.getInstance();
                return stateAgg.aliases.resolveUsername(String(value));
            }
        });
    }
}
exports.Config = Config;


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@salesforce/core");

/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
class CodeCompanionContentProvider {
    static getInstance() {
        if (!CodeCompanionContentProvider.instance) {
            this.instance = new CodeCompanionContentProvider();
        }
        return this.instance;
    }
    provideTextDocumentContent(uri) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (CodeCompanionContentProvider.serverContent) {
                resolve(CodeCompanionContentProvider.serverContent);
            }
        }));
    }
}
exports["default"] = CodeCompanionContentProvider;


/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Changeset = void 0;
const fs = __importStar(__webpack_require__(6));
const vscode = __importStar(__webpack_require__(1));
const config_1 = __webpack_require__(2);
const vscodeCore_1 = __webpack_require__(7);
const vscodeUI_1 = __webpack_require__(9);
class Changeset {
    retrieve() {
        return __awaiter(this, void 0, void 0, function* () {
            const name = yield vscodeUI_1.VSCodeUI.showInputBox('Enter changeset name');
            if (vscode.workspace.workspaceFolders) {
                const changesetDir = vscode.workspace.workspaceFolders[0].uri.fsPath + '/changesets';
                const subDirectory = changesetDir + '/' + name.trim().toLowerCase().replace(/\s/g, '');
                const orgsJson = vscode.workspace.workspaceFolders[0].uri.fsPath + '/changesets/orgs.json';
                if (!fs.existsSync(changesetDir)) {
                    //create changesets directory
                    fs.mkdirSync(changesetDir);
                    const defaultorg = yield config_1.Config.getDefaultUsername();
                    const orgArray = [defaultorg];
                    yield fs.writeFile(orgsJson, JSON.stringify(orgArray), 'utf-8', (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                }
                if (!fs.existsSync(subDirectory)) {
                    fs.mkdirSync(subDirectory);
                }
                let activeTerminal = vscodeCore_1.VSCodeCore.setupTerminal();
                if (activeTerminal) {
                    let retrievecommand = 'sf retrieve pkgsource -n ' + '"' + name + '"' + ' -r ' + 'changesets/' + name.trim().toLowerCase().replace(/\s/g, '') + '/src';
                    activeTerminal.sendText(retrievecommand);
                }
            }
        });
    }
    addOrgs() {
        return __awaiter(this, void 0, void 0, function* () {
            if (vscode.workspace.workspaceFolders) {
                const orgsJson = vscode.workspace.workspaceFolders[0].uri.fsPath + '/changesets/orgs.json';
                yield fs.readFile(orgsJson, (err, currentorgs) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        throw err;
                    }
                    if (currentorgs) {
                        const currentOrgsArray = JSON.parse(currentorgs.toString());
                        let allOrgsListArray = yield config_1.Config.getAllOrgs();
                        allOrgsListArray = allOrgsListArray.filter((el) => !currentOrgsArray.includes(el));
                        const selectedOrgs = yield vscodeUI_1.VSCodeUI.showQuickPickMultiple(allOrgsListArray);
                        if (selectedOrgs) {
                            currentOrgsArray.push.apply(currentOrgsArray, selectedOrgs);
                            yield fs.writeFile(orgsJson, JSON.stringify(currentOrgsArray), 'utf-8', (err) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                    }
                }));
            }
        });
    }
}
exports.Changeset = Changeset;


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VSCodeCore = void 0;
const vscode = __importStar(__webpack_require__(1));
const osUtils_1 = __webpack_require__(8);
class VSCodeCore {
    static ensureTerminalExists() {
        if (vscode.window.terminals.length === 0) {
            return false;
        }
        return true;
    }
    static setupTerminal() {
        let activeTerminal;
        if (this.ensureTerminalExists()) {
            activeTerminal = vscode.window.terminals[0];
            if (activeTerminal) {
                activeTerminal.show(true);
            }
        }
        else {
            // Create Terminal via VScode API
            const terminalName = this.terminalName;
            activeTerminal = vscode.window.createTerminal(terminalName);
            activeTerminal.show(true);
        }
        return activeTerminal;
    }
    static getFsPath() {
        let path = '';
        if (vscode.window.activeTextEditor) {
            path = vscode.window.activeTextEditor.document.uri.fsPath;
            if (osUtils_1.OSUtil.isWindowsOs()) {
                path = osUtils_1.OSUtil.toUnixStyle(path); //change to unix style for windows
            }
        }
        return path;
    }
    static showActivationMessage() {
        vscode.commands.executeCommand('setContext', 'CCDXActive', true);
        const ccdx = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 90);
        ccdx.text = `DX Code Companion $(rocket)`;
        ccdx.tooltip = 'SalesforceDX Code Companion is Active ! Enjoy!!!!';
        ccdx.command = 'open.org';
        ccdx.show();
        return ccdx;
    }
}
exports.VSCodeCore = VSCodeCore;
VSCodeCore.terminalName = 'DX Companion';


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OSUtil = void 0;
class OSUtil {
    static toUnixStyle(path) {
        return path.replace(/\\/g, "/");
    }
    static isWindowsOs() {
        const operatingsystem = process.platform;
        if (operatingsystem.includes('win')) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.OSUtil = OSUtil;


/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VSCodeUI = void 0;
const vscode = __importStar(__webpack_require__(1));
class VSCodeUI {
    static showInputBox(placeholder) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield vscode.window.showInputBox({
                ignoreFocusOut: true,
                value: undefined,
                valueSelection: [2, 4],
                placeHolder: placeholder,
                prompt: placeholder
            });
            return result;
        });
    }
    static showQuickPick(options, placeholder, canPickMany) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield vscode.window.showQuickPick(options, {
                placeHolder: placeholder,
                ignoreFocusOut: true,
                canPickMany: canPickMany
            });
            return result;
        });
    }
    static showQuickPickMultiple(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield vscode.window.showQuickPick(options, {
                canPickMany: true
            });
            return result;
        });
    }
}
exports.VSCodeUI = VSCodeUI;


/***/ }),
/* 10 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeploySource = void 0;
const fs = __importStar(__webpack_require__(6));
const path = __importStar(__webpack_require__(11));
const vscode = __importStar(__webpack_require__(1));
const ccprovider_1 = __importDefault(__webpack_require__(4));
const commandBuilder_1 = __webpack_require__(12);
const config_1 = __webpack_require__(2);
const sfdcUtils_1 = __webpack_require__(14);
const vscodeCore_1 = __webpack_require__(7);
const osUtils_1 = __webpack_require__(8);
const vscodeUI_1 = __webpack_require__(9);
class DeploySource {
    static compareWithServer(textDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.supportedFileForDeploy()) {
                // The authorization creates sfdx-project.json files and this extension supports only auth done using sf cli
                if (this.isProjectAuthroizedToSFDC()) {
                    if (vscode.window.activeTextEditor) {
                        const { commandToExecute, filename, fileextension } = DeploySource.extractInfo(textDocument);
                        const metadataType = commandToExecute.metadataDef.getMetadataType()
                            .MetadataName;
                        const serverResponse = yield this.getServerCopy(metadataType, filename, fileextension);
                        if (serverResponse.exist) {
                            // Set content provider content
                            ccprovider_1.default.serverContent = serverResponse.Body;
                            var sfuri = vscode.Uri.parse(`codecompanion://salesforce.com/${metadataType}/${filename}.${fileextension}?${Date.now()}`);
                            vscode.commands.executeCommand("vscode.diff", sfuri, textDocument.uri, `${filename}.${fileextension}(SERVER) <~> ${filename}.${fileextension} (LOCAL)`, { preview: false });
                        }
                    }
                }
            }
        });
    }
    static deployToSFDC(textDocument) {
        if (this.supportedFileForDeploy()) {
            // The authorization creates sfdx-project.json files and this extension supports only auth done using sf cli
            if (this.isProjectAuthroizedToSFDC()) {
                if (vscode.window.activeTextEditor) {
                    const { commandToExecute, filename, fileextension } = DeploySource.extractInfo(textDocument);
                    if (vscode.workspace.getConfiguration("dx-code-companion")
                        .manageconflict.enabled) {
                        const metadataType = commandToExecute.metadataDef.getMetadataType()
                            .MetadataName;
                        this.save(metadataType, filename, textDocument, commandToExecute, fileextension);
                    }
                    else {
                        this.executeDeployCommand(commandToExecute);
                    }
                }
            }
            else {
                vscode.window.showErrorMessage("Authorize a salesforce org");
            }
        }
    }
    static extractInfo(textDocument) {
        const filepath = vscodeCore_1.VSCodeCore.getFsPath();
        const filepathArray = path.basename(textDocument.fileName).split(".");
        const filename = filepathArray[0];
        let fileextension = filepathArray[1];
        if (filepathArray.length > 2) {
            fileextension = fileextension + "." + filepathArray[2];
        }
        const commandToExecute = new commandBuilder_1.CommandService(filepath);
        return { commandToExecute, filename, fileextension };
    }
    static save(metadataType, filename, textDocument, commandToExecute, fileextension) {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Comparing with server copy"
        }, () => __awaiter(this, void 0, void 0, function* () {
            try {
                const serverResponse = yield this.getServerCopy(metadataType, filename, fileextension);
                if (serverResponse.exist) {
                    ccprovider_1.default.serverContent = serverResponse.Body;
                    if (!this.compare(textDocument.getText(), serverResponse.Body) &&
                        !this.compare(serverResponse.Body, this.lastSavedToServer)) {
                        var sfuri = vscode.Uri.parse(`codecompanion://salesforce.com/${metadataType}/${filename}?${Date.now()}`);
                        vscode.commands.executeCommand("vscode.diff", sfuri, textDocument.uri, `${filename}.${fileextension}(SERVER) <~> ${filename}.${fileextension} (LOCAL)`, { preview: true });
                        const selection = yield vscode.window.showWarningMessage("File has been modified in salesforce", "Refresh From Server", "Overwrite Server Copy");
                        if (selection === "Overwrite Server Copy") {
                            this.run(commandToExecute, textDocument);
                        }
                        else if (selection === "Refresh From Server") {
                            this.refresh(serverResponse.Body);
                        }
                    }
                    else {
                        this.run(commandToExecute, textDocument);
                    }
                }
                else {
                    this.run(commandToExecute, textDocument);
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to compare with server: ${error instanceof Error ? error.message : error}`);
                this.run(commandToExecute, textDocument);
            }
        }));
    }
    static refreshFromServer(textDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.supportedFileForDeploy()) {
                // The authorization creates sfdx-project.json files and this extension supports only auth done using sf cli
                if (this.isProjectAuthroizedToSFDC()) {
                    if (vscode.window.activeTextEditor) {
                        const { commandToExecute, filename, fileextension } = DeploySource.extractInfo(textDocument);
                        const metadataType = commandToExecute.metadataDef.getMetadataType()
                            .MetadataName;
                        vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: "Refreshing.."
                        }, () => {
                            var p = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                                const serverResponse = yield this.getServerCopy(metadataType, filename, fileextension);
                                this.refresh(serverResponse.Body);
                                resolve();
                            }));
                            return p;
                        });
                    }
                }
            }
        });
    }
    static run(commandToExecute, textDocument) {
        this.lastSavedToServer = textDocument.getText();
        this.executeDeployCommand(commandToExecute);
    }
    static refresh(filecontent) {
        this.lastSavedToServer = filecontent;
        fs.writeFileSync(vscodeCore_1.VSCodeCore.getFsPath(), filecontent);
    }
    static deploy(textDocument) {
        if (vscode.workspace.getConfiguration("dx-code-companion").autosave.enabled) {
            DeploySource.deployToSFDC(textDocument);
        }
    }
    static getServerCopy(metadataName, fileName, fileextension) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield config_1.Config.getConnection();
            const util = new sfdcUtils_1.SalesforceUtil(connection);
            return util.getFileContentFromServer(metadataName, fileName, fileextension);
        });
    }
    static compare(localfile, serverfile) {
        if (localfile === serverfile) {
            return true;
        }
        else {
            return false;
        }
    }
    static executeDeployCommand(cmd) {
        let activeTerminal = vscodeCore_1.VSCodeCore.setupTerminal();
        if (activeTerminal) {
            activeTerminal.sendText(cmd.generateCommand());
        }
    }
    static isProjectAuthroizedToSFDC() {
        let isProjectAuthorized = false;
        if (vscode.workspace.workspaceFolders) {
            // The authorization creates sfdx-project.json files and this extension supports only auth done using sf cli
            if (fs.existsSync(vscode.workspace.workspaceFolders[0].uri.fsPath + "/sfdx-project.json")) {
                isProjectAuthorized = true;
            }
        }
        return isProjectAuthorized;
    }
    static supportedFileForDeploy() {
        let fileSupported = false;
        if (vscode.window.activeTextEditor) {
            const filePath = vscode.window.activeTextEditor.document.uri.fsPath;
            const resourcefoldername = vscode.workspace.getConfiguration("dx-code-companion").staticresourcefolder.resourceBundleFoldername;
            // Check if this is a static resource
            if (filePath.indexOf("/" + resourcefoldername + "/") !== -1 ||
                filePath.indexOf("\\" + resourcefoldername + "\\") !== -1) {
                fileSupported = true;
            }
            else {
                //At this point only few file types are supported for auto save
                const supportedFileTypes = [
                    "trigger",
                    "cls",
                    "cmp",
                    "evt",
                    "design",
                    "tokens",
                    "page",
                    "svg",
                    "auradoc",
                    "component",
                    "intf",
                    "app"
                ];
                const pathAsArray = filePath.split("/");
                const lastparam = pathAsArray[pathAsArray.length - 1];
                const fileExtension = lastparam.substring(lastparam.lastIndexOf(".") + 1);
                const directory = path.basename(path.dirname(path.dirname(filePath)));
                if (fileExtension === "js" ||
                    fileExtension === "css" ||
                    fileExtension === "html") {
                    // check for immediate directory
                    if (directory === "lwc" || directory === "aura") {
                        fileSupported = true;
                    }
                }
                if (supportedFileTypes.indexOf(fileExtension) !== -1) {
                    fileSupported = true;
                }
            }
        }
        return fileSupported;
    }
    static deploySrc(uripath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (vscode.workspace.workspaceFolders) {
                let activeTerminal = vscodeCore_1.VSCodeCore.setupTerminal();
                let deployCommand = "sf project deploy start -d " + osUtils_1.OSUtil.toUnixStyle(uripath) + " --metadata-dir -w -1";
                let runCommand = true;
                if (uripath.indexOf("changesets") > -1) {
                    //changesets folder so ask for relevant org
                    try {
                        const orgs = fs.readFileSync(vscode.workspace.workspaceFolders[0].uri.fsPath +
                            "/changesets/orgs.json");
                        const username = yield vscodeUI_1.VSCodeUI.showQuickPick(JSON.parse(orgs.toString()), "Select Org for deployment(To display more orgs add usernames in orgs.json)");
                        deployCommand = deployCommand + " -u " + username;
                        if (!username) {
                            runCommand = false;
                        }
                    }
                    catch (error) {
                        throw error;
                    }
                }
                if (activeTerminal && runCommand) {
                    activeTerminal.sendText(deployCommand);
                }
            }
        });
    }
}
exports.DeploySource = DeploySource;


/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 12 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommandService = void 0;
const path = __importStar(__webpack_require__(11));
const findMetadataType_1 = __webpack_require__(13);
const vscode_1 = __webpack_require__(1);
class CommandService {
    constructor(filepath) {
        this.filepath = filepath;
        this.directory = path.basename(path.dirname(path.dirname(this.filepath)));
        this.metadataDef = new findMetadataType_1.Metadata(this.filepath);
    }
    generateCommand() {
        let command = "sf deploy ";
        const metadata = this.metadataDef;
        // const auraFiles = ['.cmp','.app','.evt','.css','.js','design','svg','tokens','intf','auradoc'];
        command = command + metadata.getMetadataType().CommandName + " ";
        command = command + "-p " + '"' + this.filepath + '"';
        if (this.metadataDef.getMetadataType().CommandName === "staticresource") {
            command =
                command +
                    " -r " +
                    vscode_1.workspace.getConfiguration("dx-code-companion").staticresourcefolder
                        .resourceBundleFoldername;
        }
        return command;
    }
}
exports.CommandService = CommandService;


/***/ }),
/* 13 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Metadata = void 0;
const path = __importStar(__webpack_require__(11));
const vscode = __importStar(__webpack_require__(1));
class Metadata {
    constructor(filepath) {
        this.resourcefoldername = vscode.workspace.getConfiguration("dx-code-companion").staticresourcefolder.resourceBundleFoldername;
        this.filepath = filepath;
        this.directory = path.basename(path.dirname(path.dirname(this.filepath)));
        this.isstaticresource =
            filepath.indexOf("\\" + this.resourcefoldername + "\\") === -1 &&
                filepath.indexOf("/" + this.resourcefoldername + "/") === -1
                ? false
                : true;
    }
    getMetadataType() {
        const metadataType = {};
        // check for static Resource
        if (this.isstaticresource) {
            metadataType.MetadataName = "StaticResource";
            metadataType.CommandName = "staticresource";
        }
        else {
            // const auraFiles = ['.cmp','.app','.evt','.css','.js','design','svg','tokens','intf','auradoc'];
            if (this.filepath.includes(".cls")) {
                metadataType.MetadataName = "ApexClass";
                metadataType.CommandName = "apex";
            }
            else if (this.filepath.includes(".trigger")) {
                metadataType.MetadataName = "ApexTrigger";
                metadataType.CommandName = "trigger";
            }
            else if (this.filepath.includes(".page")) {
                metadataType.MetadataName = "ApexPage";
                metadataType.CommandName = "vf";
            }
            else if (this.filepath.includes(".component")) {
                metadataType.MetadataName = "ApexComponent";
                metadataType.CommandName = "vfcomponent";
            }
            else if (this.directory === "aura") {
                metadataType.MetadataName = "AuraDefinition";
                metadataType.CommandName = "aura";
            }
            else if (this.directory === "lwc") {
                metadataType.MetadataName = "LightningComponent";
                metadataType.CommandName = "lwc";
            }
            else {
                // Modify this to add support for other Metadata Types
                metadataType.MetadataName = "unknown";
                metadataType.CommandName = "unknown";
            }
        }
        return metadataType;
    }
    // function to get file extension
    static getDefType(extension, filename) {
        let auratype;
        switch (extension) {
            case "app": {
                // APPLICATION — Lightning Components app
                auratype = "APPLICATION";
                break;
            }
            case "cmp": {
                // COMPONENT — component markup
                auratype = "COMPONENT";
                break;
            }
            case "auradoc": {
                // DOCUMENTATION — documentation markup
                auratype = "DOCUMENTATION";
                break;
            }
            case "css": {
                // STYLE — style (CSS) resource
                auratype = "STYLE";
                break;
            }
            case "evt": {
                // EVENT — event definition
                auratype = "EVENT";
                break;
            }
            case "design": {
                // DESIGN — design definition
                auratype = "DESIGN";
                break;
            }
            case "svg": {
                // SVG — SVG graphic resource
                auratype = "SVG";
                break;
            }
            case "js": {
                if (filename !== null) {
                    const fname = filename.toLowerCase();
                    if (fname.endsWith("controller")) {
                        auratype = "CONTROLLER";
                    }
                    else if (fname.endsWith("helper")) {
                        auratype = "HELPER";
                    }
                    else if (fname.endsWith("renderer")) {
                        // RENDERER — client-side renderer
                        auratype = "RENDERER";
                    }
                }
                break;
            }
            case "tokens": {
                auratype = "TOKENS";
                break;
            }
            case "intf": {
                auratype = "INTERFACE";
                break;
            }
            default: {
                auratype = "";
            }
        }
        return auratype;
    }
}
exports.Metadata = Metadata;


/***/ }),
/* 14 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SalesforceUtil = void 0;
const findMetadataType_1 = __webpack_require__(13);
class SalesforceUtil {
    constructor(conn) {
        this.connection = conn;
    }
    getPackages() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.connection;
            return yield connection.tooling.query('SELECT Name, NamespacePrefix FROM MetadataPackage');
        });
    }
    getNamespace() {
        return __awaiter(this, void 0, void 0, function* () {
            let namespacePrefix = '';
            const connection = yield this.connection;
            const Organization = yield connection.query('Select NamespacePrefix from Organization');
            if (Organization.totalSize > 0) {
                const organizationRec = Organization.records[0];
                namespacePrefix = organizationRec['NamespacePrefix'];
            }
            return namespacePrefix;
        });
    }
    getFileContentFromServer(metadataType, filename, fileextension) {
        return __awaiter(this, void 0, void 0, function* () {
            const namespacePrefix = yield this.getNamespace();
            const connection = yield this.connection;
            const query = yield this.getToolingQuery(metadataType, filename, fileextension, namespacePrefix);
            let serverResponse = {};
            serverResponse.exist = false;
            const result = yield connection.tooling.query(query.queryString);
            if (result.records.length > 0) {
                const response = result.records[0];
                serverResponse.Body = response[query.bodyfield];
                serverResponse.exist = true;
            }
            return serverResponse;
        });
    }
    getToolingQuery(metadataType, filename, fileextension, namespacePrefix) {
        return __awaiter(this, void 0, void 0, function* () {
            let bodyfield;
            let wherefield;
            let lwcpath = '';
            let auraDefId = '';
            let lwcDefId = '';
            let componentName = '';
            const query = {};
            switch (metadataType) {
                case "ApexClass": {
                    bodyfield = 'Body';
                    wherefield = 'Name';
                    break;
                }
                case "ApexTrigger": {
                    bodyfield = 'Body';
                    wherefield = 'Name';
                    break;
                }
                case "ApexComponent": {
                    bodyfield = 'Markup';
                    wherefield = 'Name';
                    break;
                }
                case "ApexPage": {
                    bodyfield = 'Markup';
                    wherefield = 'Name';
                    break;
                }
                case "AuraDefinition": {
                    if (filename !== null && (filename.endsWith('Helper') || filename.endsWith('Controller'))) {
                        componentName = filename.replace('Helper', '');
                        componentName = componentName.replace('Controller', '');
                    }
                    else {
                        componentName = filename;
                    }
                    const auraDefinition = yield this.getDefinition(componentName, namespacePrefix, 'AuraDefinitionBundle');
                    bodyfield = 'Source';
                    wherefield = 'AuraDefinitionBundleId';
                    metadataType = 'AuraDefinition';
                    auraDefId = this.getDefId(auraDefinition, auraDefId);
                    break;
                }
                case "LightningComponent": {
                    lwcpath = this.getlwcPath(filename, fileextension);
                    const lwcDefinition = yield this.getDefinition(filename, namespacePrefix, 'LightningComponentBundle');
                    bodyfield = 'Source';
                    wherefield = 'LightningComponentBundleId';
                    metadataType = 'LightningComponentResource';
                    lwcDefId = this.getDefId(lwcDefinition, lwcDefId);
                    break;
                }
                default: {
                    bodyfield = 'Body';
                    wherefield = 'Name';
                }
            }
            query.queryString = `Select ${bodyfield} from ${metadataType}`;
            if (metadataType === 'AuraDefinition') {
                const deftype = findMetadataType_1.Metadata.getDefType(fileextension, filename);
                query.queryString += ` where DefType='${deftype}'`;
                if (filename !== null) {
                    query.queryString += ` and ${wherefield}='${auraDefId}'`;
                }
            }
            else if (metadataType === 'LightningComponentResource') {
                query.queryString += ` where FilePath='${lwcpath}'`;
                if (filename !== null) {
                    query.queryString += ` and ${wherefield}='${lwcDefId}'`;
                }
            }
            else {
                query.queryString += ` where ${wherefield}='${filename}'`;
                // Add Namespace Prefix
                if (namespacePrefix) {
                    query.queryString += ` and NamespacePrefix='${namespacePrefix}'`;
                }
                else {
                    query.queryString += ` and NamespacePrefix=null`;
                }
            }
            query.bodyfield = bodyfield;
            return query;
        });
    }
    getlwcPath(filename, fileextension) {
        let lwcpath;
        lwcpath = 'lwc/' + filename + '/' + filename + '.' + fileextension;
        return lwcpath;
    }
    getDefId(definition, filename) {
        if (definition.length > 0) {
            filename = definition[0].Id;
        }
        else {
            filename = null;
        }
        return filename;
    }
    getDefinition(filename, namespacePrefix, typename) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = this.connection;
            const definition = yield connection.tooling.sobject(typename).find({
                DeveloperName: filename,
                NamespacePrefix: namespacePrefix
            });
            return definition;
        });
    }
}
exports.SalesforceUtil = SalesforceUtil;


/***/ }),
/* 15 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NavigationService = void 0;
const path = __importStar(__webpack_require__(11));
const vscode = __importStar(__webpack_require__(1));
class NavigationService {
    static metadataCoverageReport() {
        NavigationService.vscodeOpenurl('https://developer.salesforce.com/docs/metadata-coverage');
    }
    static componentLibrary() {
        NavigationService.vscodeOpenurl('https://developer.salesforce.com/docs/component-library');
    }
    static openSLDSDocument() {
        NavigationService.vscodeOpenurl('https://www.lightningdesignsystem.com/');
    }
    static vscodeOpenurl(url) {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
    }
    static openVFPage(filePath) {
        let fileName = path.basename(filePath);
        fileName = fileName.replace('.page', '');
        return fileName;
    }
}
exports.NavigationService = NavigationService;


/***/ }),
/* 16 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RetrieveSource = void 0;
const sfdcUtils_1 = __webpack_require__(14);
const vscodeCore_1 = __webpack_require__(7);
const vscodeUI_1 = __webpack_require__(9);
class RetrieveSource {
    constructor(conn) {
        this.connection = conn;
    }
    retrieve(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            const sfdcUtil = new sfdcUtils_1.SalesforceUtil(this.connection);
            const packages = yield sfdcUtil.getPackages();
            const pkgs = packages.records.map(pkg => pkg.Name);
            const unmanagedpkg = yield vscodeUI_1.VSCodeUI.showQuickPick(pkgs);
            if (unmanagedpkg) {
                let activeTerminal = vscodeCore_1.VSCodeCore.setupTerminal();
                if (activeTerminal) {
                    let retrievecommand = cmd + '"' + unmanagedpkg + '"';
                    activeTerminal.sendText(retrievecommand);
                }
            }
        });
    }
}
exports.RetrieveSource = RetrieveSource;


/***/ }),
/* 17 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.switchOrg = switchOrg;
const config_1 = __webpack_require__(2);
const vscodeCore_1 = __webpack_require__(7);
const vscodeUI_1 = __webpack_require__(9);
function switchOrg() {
    return __awaiter(this, void 0, void 0, function* () {
        const orgs = yield config_1.Config.getAllOrgAliases();
        const result = yield vscodeUI_1.VSCodeUI.showQuickPick(orgs);
        let cmd = 'sf config set target-org=';
        if (result) {
            cmd = cmd + result.split(':')[0];
            let activeTerminal = vscodeCore_1.VSCodeCore.setupTerminal();
            if (activeTerminal) {
                activeTerminal.sendText(cmd);
            }
        }
    });
}


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map