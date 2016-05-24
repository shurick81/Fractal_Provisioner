var SPMeta2_JSOM = require("./SPMeta2.JSOM.Utilities");
var SPMeta2_JSOM_Utilities = require("./SPMeta2.JSOM.Utilities");
var locationClass = (function () {
    function locationClass() {
        this.protocol = "https";
    }
    return locationClass;
})();
var windowsClass = (function () {
    function windowsClass() {
    }
    return windowsClass;
})();
var window;
window = new windowsClass();
describe("General scripts", function () {
    var utilitiesSubject;
    beforeEach(function () {
        utilitiesSubject = new SPMeta2_JSOM.Utilities();
    });
    describe('#preparePath', function () {
        it('Should return given path if it is not empty', function () {
            var result = SPMeta2_JSOM_Utilities.preparePath("http://intranet.no/path");
            if (result !== "http://intranet.no/path") {
                throw new Error('Expected http://intranet.no/path but was ' + result);
            }
        });
        it('Should return slash if path is empty', function () {
            var result = SPMeta2_JSOM_Utilities.preparePath("");
            if (result !== "/") {
                throw new Error('Expected / but was ' + result);
            }
        });
    });
    describe('#getRelativePath', function () {
        it('Should return relative URL', function () {
            var result = SPMeta2_JSOM_Utilities.getRelativePath("http://abc/def", "http://abc/def/ghi");
            if (result !== "/ghi") {
                throw new Error('Expected /ghi but was ' + result);
            }
        });
        it('Should return relative URL for empty parent', function () {
            var result = SPMeta2_JSOM_Utilities.getRelativePath("", "/def");
            if (result !== "/def") {
                throw new Error('Expected /def but was ' + result);
            }
        });
        it('Should return null if paths are irrelevant', function () {
            var result = SPMeta2_JSOM_Utilities.getRelativePath("http://abc/def", "http://abc/ghi");
            if (result !== null) {
                throw new Error('Expected null but was ' + result);
            }
        });
    });
    describe('#getFileNameFromUrl', function () {
        it('Should return file name', function () {
            var result = SPMeta2_JSOM_Utilities.getFileNameFromUrl("http://abd.sdf/asdgs.aspx/default.aspx?id=21");
            if (result != "default.aspx?id=21") {
                throw new Error('Expected default.aspx?id=21 but was ' + result);
            }
        });
        it('Should return empty string 1', function () {
            var result = SPMeta2_JSOM_Utilities.getFileNameFromUrl("http://abd.sdf.sd/");
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
    describe('#makeAbsUrl', function () {
        var window = "test";
        it('Should return absolute URL', function () {
            var result = SPMeta2_JSOM_Utilities.makeAbsUrl("/distortion");
            if (result != "https://service.domain.com/distortion") {
                throw new Error('Expected "https://service.domain.com/distortion" but was "' + result + '"');
            }
        });
    });
});
//# sourceMappingURL=SPMeta2.JSOM.Utilities.Tests.js.map