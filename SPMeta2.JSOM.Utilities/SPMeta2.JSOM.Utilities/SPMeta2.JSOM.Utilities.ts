export class Utilities {
    constructor() { }
}
export function preparePath(path: string): string {
    if (path == '') { return "/" } else { return path };
};
export function getRelativePath(parentUrl: string, url: string): string {
    var relativeParent: string = makeRelative(parentUrl);
    var relativeUrl: string = makeRelative(url);
    if (relativeUrl.length >= relativeParent.length) {
        if (relativeUrl.substring(0, relativeParent.length).toLowerCase() == relativeParent.toLowerCase()) {
            return relativeUrl.substring(relativeParent.length);
        } else return null;
    } else return null;
}
export function makeRelative(url: string): string {
    var protocolSeparator: string = '://';
    var indexAfterProtocol: number = url.indexOf(protocolSeparator);
    if (indexAfterProtocol >= 0) {
        var withoutProtocol: string = url.substring(indexAfterProtocol + protocolSeparator.length);
        var indexOfFirstSlash: number = withoutProtocol.indexOf('/');
        if (indexOfFirstSlash >= 0) {
            return withoutProtocol.substring(indexOfFirstSlash);
        } else {
            return '';
        }
    } else { return url; }
}
export function getFileNameFromUrl(url: string): string {
    var lastSlashIndex = url.lastIndexOf('/');
    if (lastSlashIndex >= 0) {
        return url.substring(1 + lastSlashIndex);
    } else return '';
}
export function removeFirstSlash(url: string): string {
    if (url.length >= 0 && url[0] == '/') {
        return url.substring(1)
    } else return url;
}
export function removeLastSlash(url: string): string {
    if (url.length >= 0 && url[url.length - 1] == '/') {
        return url.substring(0, url.length - 2);
    } else return url;
}
export function makeAbsUrl(url: string): string {
    if (url.length > 0 && (url.substring(0, 1) == '/')) {
        return (/*window.location.protocol + '//' + window.location.host +*/ url);
    } else return url;
}