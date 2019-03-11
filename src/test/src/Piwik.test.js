"use strict";

// import sinon from "sinon";
import * as AssetsServer from "./../helpers/AssetsServer";
// import { getVirtualConsole } from "jsdom";
import Piwik from "../../Piwik";
import util from "util";


describe("Piwik", () => {
    const siteId = 99;
    let scripts;

    // before(() => DOM.create());
    // before(() => {
    //     virtualConsole = getVirtualConsole(window);
    //     virtualConsole.on("jsdomError", (err) => {
    //         throw err;
    //     });
    // });
    // before(() => document.body.appendChild(document.createElement("script")));

    beforeAll(() => {
        document.body.innerHTML = `
            <div>
                <p> Test Document </p>
            </div>
        `;
        document.body.appendChild(document.createElement("script"));
        // Kept here to show the trouble I had with console.logging the jsdom document. 
        // console.log(util.inspect(document.body.innerHTML));
    });

    describe("init", () => {
        it.only("should return a reference to itself", () => {
            console.log("hellooo");
            expect(Piwik.init(AssetsServer.host, siteId)).toEqual(Piwik)
        });

        describe(".loadScript()", () => {

            // before((done) => AssetsServer.start(done));
            // before((done) => Piwik.loadScript().then(() => done()).catch((err) => done(err)));

            beforeAll(async(done) => {
                AssetsServer.start(function(){
                    Piwik.loadScript().then(() => done()).catch((err) => done(err));
                });
            });

            it("should have injected `piwik.js` before other scripts", () => {
                scripts = Array.from(document.getElementsByTagName("script"));
                expect(scripts, "to have length", 2);
                expect(scripts[0].src, "to equal", AssetsServer.piwikScriptUrl);
            });

            it("should have removed Piwik from global/window", () => {
               expect(window.Piwik).toBeUndefined();
            });

            it("should store a Reference to previously global Piwik-Object (duck typing test)", () => {
                expect(Piwik.Piwik.getTracker, "to be a", "function");
                expect(Piwik.Piwik.getAsyncTracker, "to be a", "function");
                expect(Piwik.Piwik.addPlugin, "to be a", "function");
            });

            it("should extend Piwik with all tracker-methods (duck typing test)", () => {
                for (let methodName in Piwik.Piwik.getTracker()) {
                    expect(Piwik[methodName], "to be a", "function");
                }
            });

            it("it should return a Promise if a tracker function was called", (done) => {
                Piwik
                    .trackEvent("category", "action")
                    .then(() => Piwik.trackPageView())
                    .then(() => Piwik.trackSiteSearch("keyword"))
                    .then(() => Piwik.trackGoal("trackGoal"))
                    .then(() => Piwik.trackLink("url", "linkType"))
                    // ... and so on
                    .then(() => done())
                    .catch((err) => done(err));
            });

            it("should expose a Promise via `p`-property", (done) => {
                Piwik.p
                    .then(() => Piwik.setDocumentTitle("title"))
                    .then(() => Piwik.setCustomUrl("http://custom.url"));

                Piwik.p
                    .then(() => done())
                    .catch((err) => done(err));
            });

            after(() => Piwik.restore());
            after((done) => AssetsServer.stop(done));
        });

        describe(".queue()", () => {

            before((done) => AssetsServer.start(done));
            before(() => Piwik.init(AssetsServer.host, siteId));

            it("should execute given function with passed arguments when Piwik had been loaded", (done) => {
                const args = [1, 2, 3];

                Piwik.loadScript();

                Piwik
                    .queue("trackPageView")
                    .queue("trackSiteSearch", "keyword");

                Piwik
                    .queue("trackGoal", "trackGoal")
                    .queue("trackLink", "url", "linkType");

                Piwik
                    .queue("spy", ...args)
                    .queue("expect")
                    .queue("done");

                Piwik.done = done;
                Piwik.spy = sinon.spy();
                Piwik.expect = () => {
                    expect(Piwik.spy.callCount, "to be", 1);
                    expect(Piwik.spy.getCall(0).args, "to equal", args);
                };
            });

            after(() => Piwik.restore());
            after((done) => AssetsServer.stop(done));
        });

        describe(".p", () => {

            before((done) => AssetsServer.start(done));
            before(() => Piwik.init(AssetsServer.host, siteId));

            it("should be possible to use Piwik Tracking Client methods through .then before .loadScript has finished", (done) => {
                Piwik.loadScript();

                Piwik.p
                    .then(() => Piwik.setDocumentTitle("title"))
                    .then(() => Piwik.setCustomUrl("http://another.custom.url"))
                    .then(() => Piwik.trackPageView())
                    .then(() => done())
                    .catch((err) => err);
            });

            after(() => Piwik.restore());
            after((done) => AssetsServer.stop(done));
        });
    });

    after(() => DOM.destroy());
});