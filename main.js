"use strict";

const {app, globalShortcut, BrowserWindow} = require("electron");
const EventCenter = require("./src/ipc/event-center");
const Window = require("./src/index");

process.env.DEBUG = "*,-not_this";

const APP_EVENTS = {
    READY: "ready",
    ALL_CLOSED: "window-all-closed",
};

const PRIVATE = {
    INIT_EVENT: Symbol("_initEvent"),
    ON_READY: Symbol("_onReady"),
    ALL_CLOSED: Symbol("_allClosed"),
    REGISTER_SHORTCUT: Symbol("_registerShortcut"),
};

const SHORTCUTS = {
    OPEN_DEV_TOOL: process.platform === "darwin" ? "Alt+Cmd+I" : "Ctrl+Shift+I",
    RELOAD_PAGE: process.platform === "darwin" ? "Cmd+R" : "Ctrl+R",
};

class Application {
    constructor(){
        this._ipc = new EventCenter(this);
        this._mainWin = new Window(this);
    }

    start(){
        this._ipc.start();
        this[PRIVATE.INIT_EVENT]();
    }

    [PRIVATE.INIT_EVENT](){
        app.on(APP_EVENTS.READY, this[PRIVATE.ON_READY].bind(this));
        app.on(APP_EVENTS.ALL_CLOSED, this[PRIVATE.ALL_CLOSED].bind(this));
    }
    [PRIVATE.ON_READY](){
        this._mainWin.setScreenSize();
        this._mainWin.buildWindow();
        this[PRIVATE.REGISTER_SHORTCUT]();
    }
    [PRIVATE.ALL_CLOSED](){
        if(process.platform !== "darwin"){
            app.quit();
        }
    }
    [PRIVATE.REGISTER_SHORTCUT](){
        globalShortcut.register(SHORTCUTS.OPEN_DEV_TOOL, ()=>{
            let win = BrowserWindow.getFocusedWindow();
            if(!win) return;
            if(win.webContents.isDevToolsOpened()) {
                return win.webContents.closeDevTools();
            }
            win.webContents.openDevTools();
        });
        globalShortcut.register(SHORTCUTS.RELOAD_PAGE, ()=>{
            return false;
            //return console.info("Do not allow reload page");
            // let win = BrowserWindow.getFocusedWindow();
            // if(!win) return;
            // win.reload();
        });
    }
}

const application = new Application();
application.start();