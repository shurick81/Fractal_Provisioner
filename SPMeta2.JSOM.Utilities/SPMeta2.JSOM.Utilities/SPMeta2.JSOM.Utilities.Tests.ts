import assert = require('assert');
import * as SPMeta2_JSOM from "./SPMeta2.JSOM.Utilities";
import SPMeta2_JSOM_Utilities = require("./SPMeta2.JSOM.Utilities");
class locationClass {
    protocol: string = "https";
}
class windowsClass {
    location: locationClass;
}
var window: windowsClass;
window = new windowsClass();

describe("General scripts", () => {
    var utilitiesSubject: SPMeta2_JSOM.Utilities;
    beforeEach(function () {
        utilitiesSubject = new SPMeta2_JSOM.Utilities();
    });
    describe('#preparePath', () => {
        it('Should return given path if it is not empty', () => {
            var result: string = SPMeta2_JSOM_Utilities.preparePath("http://intranet.no/path");
            if (result !== "http://intranet.no/path") {
                throw new Error('Expected http://intranet.no/path but was ' + result);
            }
        });
        it('Should return slash if path is empty', () => {
            var result: string = SPMeta2_JSOM_Utilities.preparePath("");
            if (result !== "/") {
                throw new Error('Expected / but was ' + result);
            }
        });
    });
    describe('#getRelativePath', () => {
        it('Should return relative URL', () => {
            var result: string = SPMeta2_JSOM_Utilities.getRelativePath("http://abc/def", "http://abc/def/ghi")
            if (result !== "/ghi") {
                throw new Error('Expected /ghi but was ' + result);
            }
        });
        it('Should return relative URL for empty parent', () => {
            var result: string = SPMeta2_JSOM_Utilities.getRelativePath("", "/def")
            if (result !== "/def") {
                throw new Error('Expected /def but was ' + result);
            }
        });
        it('Should return null if paths are irrelevant', () => {
            var result: string = SPMeta2_JSOM_Utilities.getRelativePath("http://abc/def", "http://abc/ghi")
            if (result !== null) {
                throw new Error('Expected null but was ' + result);
            }
        });
    });
    describe('#getFileNameFromUrl', () => {
        it('Should return file name', () => {
            var result: string = SPMeta2_JSOM_Utilities.getFileNameFromUrl("http://abd.sdf/asdgs.aspx/default.aspx?id=21");
            if (result != "default.aspx?id=21") {
                throw new Error('Expected default.aspx?id=21 but was ' + result);
            }
        });
        it('Should return empty string 1', () => {
            var result: string = SPMeta2_JSOM_Utilities.getFileNameFromUrl("http://abd.sdf.sd/");
            if (result != "") {
                throw new Error('Expected empty string but was ' + result);
            }
        });
/*        it('Should return empty string 2', () => {
            var result: string = SPMeta2_JSOM_Utilities.getFileNameFromUrl("http://abd.sdf.sdfsd");
            if (result != "") {
                throw new Error('Expected empty string but was ' + result);
            }
        });*/
    });
    describe('#makeAbsUrl', () => {
        var window: string = "test";
        it('Should return absolute URL', () => {
            var result: string = SPMeta2_JSOM_Utilities.makeAbsUrl("/distortion");
            if (result != "https://service.domain.com/distortion") {
                throw new Error('Expected "https://service.domain.com/distortion" but was "' + result + '"');
            }
        });
    });
});
