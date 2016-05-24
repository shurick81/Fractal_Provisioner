var Utilities = (function () {
    function Utilities() {
    }
    return Utilities;
})();
exports.Utilities = Utilities;
function preparePath(path) {
    if (path == '') {
        return "/";
    }
    else {
        return path;
    }
    ;
}
exports.preparePath = preparePath;
;
function getRelativePath(parentUrl, url) {
    var relativeParent = makeRelative(parentUrl);
    var relativeUrl = makeRelative(url);
    if (relativeUrl.length >= relativeParent.length) {
        if (relativeUrl.substring(0, relativeParent.length).toLowerCase() == relativeParent.toLowerCase()) {
            return relativeUrl.substring(relativeParent.length);
        }
        else
            return null;
    }
    else
        return null;
}
exports.getRelativePath = getRelativePath;
function makeRelative(url) {
    var protocolSeparator = '://';
    var indexAfterProtocol = url.indexOf(protocolSeparator);
    if (indexAfterProtocol >= 0) {
        var withoutProtocol = url.substring(indexAfterProtocol + protocolSeparator.length);
        var indexOfFirstSlash = withoutProtocol.indexOf('/');
        if (indexOfFirstSlash >= 0) {
            return withoutProtocol.substring(indexOfFirstSlash);
        }
        else {
            return '';
        }
    }
    else {
        return url;
    }
}
exports.makeRelative = makeRelative;
function getFileNameFromUrl(url) {
    var lastSlashIndex = url.lastIndexOf('/');
    if (lastSlashIndex >= 0) {
        return url.substring(1 + lastSlashIndex);
    }
    else
        return '';
}
exports.getFileNameFromUrl = getFileNameFromUrl;
function removeFirstSlash(url) {
    if (url.length >= 0 && url[0] == '/') {
        return url.substring(1);
    }
    else
        return url;
}
exports.removeFirstSlash = removeFirstSlash;
function removeLastSlash(url) {
    if (url.length >= 0 && url[url.length - 1] == '/') {
        return url.substring(0, url.length - 2);
    }
    else
        return url;
}
exports.removeLastSlash = removeLastSlash;
function makeAbsUrl(url) {
    if (url.length > 0 && (url.substring(0, 1) == '/')) {
        return (url);
    }
    else
        return url;
}
exports.makeAbsUrl = makeAbsUrl;
//# sourceMappingURL=SPMeta2.JSOM.Utilities.js.map