"use strict";

import injectScript from "./lib/injectScript";
import getPiwikScript from "./lib/getPiwikScript";


const Piwik = {

    p: null,

    url: null,

    trackerURL: null,

    scriptURL: null,

    siteId: null,

    Piwik: null,

    Tracker: null,

    Queue: [],

    init(url, siteId) {
        this.restore();

        this.url = url;
        this.trackerURL = `${this.url}/piwik.php`;
        this.scriptURL = `${this.url}/piwik.js`;
        this.siteId = siteId;

        return this;
    },

    loadScript() {
        this.p = new Promise((resolve, reject) => injectScript(getPiwikScript(this.scriptURL, resolve, reject)));
        this.p.then(this._checkPiwikInitialization.bind(this));
        this.p.then(this._removePiwikFromWindow.bind(this));
        this.p.then(this._getTracker.bind(this));
        this.p.then(this._rewireTrackerFunctions.bind(this));

        return this.p;
    },

    queue(fn, ...args) {
        this.p.then(() => {
            this[fn].call(this.Tracker, ...args);
        });

        return this;
    },

    restore() {
        for (let fn in this.Tracker) {
            if (this[fn]) delete this[fn];
        }

        this.p = null;
        this.url = null;
        this.siteId = null;
        this.Piwik = null;
        this.Tracker = null;
        this.Queue = [];

        return this;
    },

    _checkPiwikInitialization() {
        if (!window.Piwik) {
            throw new Error("There was an Error while loading and initializing Piwik.");
        }
    },

    _removePiwikFromWindow() {
        this.Piwik = window.Piwik;
        window.Piwik = undefined;
    },

    _getTracker() {
        this.Tracker = this.Piwik.getTracker(this.trackerURL, this.siteId);
    },

    _rewireTrackerFunctions() {
        for (let fn in this.Tracker) {
            this[fn] = (...args) => this.p.then(() => this.Tracker[fn].apply(this.Tracker, args));
        }
    }
};

export default Piwik;