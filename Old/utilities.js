function preparePath (path)
{
	if (path == '') return '/'; else return path;
}
function getRelativePath( rootUrl, destUrl )
{
	relativeRoot = makeRelative( rootUrl );
	relativeDest = makeRelative( destUrl );
	if ( relativeDest.length >= relativeRoot.length )
	{
		if ( relativeDest.substring( 0, relativeRoot.length ).toLowerCase() == relativeRoot.toLowerCase() )
		{
			return relativeDest.substring( relativeRoot.length );
		} else return null;
	} else return null;
}
function makeRelative( url )
{
	var protocolSeparator = '://';
	var indexAfterProtocol = url.indexOf( protocolSeparator )
	if ( indexAfterProtocol >= 0 )
	{
		var withoutProtocol = url.substring( indexAfterProtocol + protocolSeparator.length );
		indexOfFirstSlash = withoutProtocol.indexOf( '/' )
		if ( indexOfFirstSlash >= 0 )
		{
			return withoutProtocol.substring( indexOfFirstSlash );
		} else {
			return ''
		}
	} else { return url }
}
function getFileNameFromUrl( url )
{
	var lastSlashIndex = url.lastIndexOf( '/' )
	if ( lastSlashIndex >= 0 )
	{
		return url.substring( 1 + lastSlashIndex )
	} else return ''
}
function removeFirstSlash( url )
{
	if ( url.length >= 0 && url [ 0 ] == '/' )
	{ return url.substring( 1 ) } else return url;
}
function removeLastSlash( url )
{
	if ( url.length >= 0 && url[ url.length - 1 ] == '/' )
	{ return url.substring( 0, url.length - 2 ) } else return url;
}

function makeAbsUrl( strUrl )
/* makes url absolute if url is relative. Something like GetFullUrl? */
{
	if ( strUrl.length > 0 && ( strUrl.substr( 0, 1 ) == '/' ) )
	{
		strUrl=window.location.protocol+'//'+window.location.host+strUrl;
	}
	return strUrl;
}
function getRelativeCurrentFolderUrl()
{
	var serverRequestPath = _spPageContextInfo.serverRequestPath;
	return serverRequestPath.substring( 0, serverRequestPath.lastIndexOf('/') );
}



function copyFile( sourceWebUrl, sourceFileUrl, destinationWeb, destinationFolder, newFileName, replaceTextArray, nextFunction )
{

	/*to make it ensure folder and check content difference*/
	
	var destinationFolder = removeFirstSlash( destinationFolder );
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = onContentReadStateChange;
	var preparedSourceWebUrl = removeLastSlash( sourceWebUrl );
	var sourceUrl = preparedSourceWebUrl + '/_layouts/15/download.aspx?SourceUrl=' + encodeURI( preparedSourceWebUrl + '/' + removeFirstSlash( sourceFileUrl ) );
	xhr.open( "GET", sourceUrl, true );
	if ( replaceTextArray.length == 0 ) xhr.responseType = 'arraybuffer';
	xhr.send();
	function onContentReadStateChange()
	{
		if ( xhr.readyState == 4 ) {
			if ( newFileName != null )
			{
				var fileName = newFileName;
			} else {
				var fileName = getFileNameFromUrl( sourceFileUrl );
			}
			var context = new SP.ClientContext( preparePath( destinationWeb ) );
			var serverRelativeFileUrl = makeRelative( destinationWeb + '/' + destinationFolder + '/' + fileName );
			var currentFile = context.get_web().getFileByServerRelativeUrl( serverRelativeFileUrl );
			currentFile.checkOut();
			context.load( currentFile );
			context.executeQueryAsync(
				function ( sender, args ) {
					var fileCreateInfo = new SP.FileCreationInformation();
					fileCreateInfo.set_url( fileName );
					fileCreateInfo.set_overwrite(true);
					fileCreateInfo.set_content( new SP.Base64EncodedByteArray() );
					if ( replaceTextArray.length == 0 )
					{
						uInt8Array = new Uint8Array( xhr.response );
						for ( var i = 0; i < uInt8Array.length; i++ )
						{
							fileCreateInfo.get_content().append( uInt8Array[i] );
						}
					} else {
						fileContent = xhr.responseText;
				    	for ( var i = 0; i < replaceTextArray.length; i++ )
				    	{
				    		fileContent = fileContent.replace( replaceTextArray[i].sample, replaceTextArray[i].destination );
				    	}
				    	for ( var i = 0; i < fileContent.length; i++ )
				    	{
				    		fileCreateInfo.get_content().append( fileContent.charCodeAt(i) );
				    	}
					}
					var newFile = context.get_web().getFolderByServerRelativeUrl( makeRelative( destinationWeb + '/' + destinationFolder ) ).get_files().add( fileCreateInfo );
			    	context.load(newFile);
					context.executeQueryAsync(
						function ( sender, args ) {
							publishFile( destinationWeb, serverRelativeFileUrl, nextFunction )
						},
						function ( sender, args ) {
							alert( 'Error occured when file uploading: ' + args.get_message() + '\n' + args.get_stackTrace() );
							nextFunction();
						});
				},
				function ( sender, args ) {
					if ( ( args.get_errorCode() == -2147024893 ) || ( args.get_errorCode() == -2147024894 ) )
					{
						var fileCreateInfo = new SP.FileCreationInformation();
						fileCreateInfo.set_url( fileName );
						fileCreateInfo.set_overwrite( true );
				    	fileCreateInfo.set_content( new SP.Base64EncodedByteArray() );
						if ( replaceTextArray.length == 0 )
						{
					    	var uInt8Array = new Uint8Array( xhr.response );
					    	for ( var i = 0; i < uInt8Array.length; i++ )
					    	{
					    		fileCreateInfo.get_content().append( uInt8Array[i] );
					    	}
						} else {
							var fileContent = xhr.responseText;
					    	for ( var i = 0; i < replaceTextArray.length; i++ )
					    	{
					    		fileContent = fileContent.replace( replaceTextArray[i].sample, replaceTextArray[i].destination );
					    	}
					    	for (var i = 0; i < fileContent.length; i++)
					    	{
					    		fileCreateInfo.get_content().append( fileContent.charCodeAt(i) );
					    	}
						}
						var newFile = context.get_web().getFolderByServerRelativeUrl( makeRelative( destinationWeb + '/' + destinationFolder ) ).get_files().add( fileCreateInfo );
				    	context.load( newFile );
						context.executeQueryAsync(
							function ( sender, args ) {
								publishFile( destinationWeb, serverRelativeFileUrl, nextFunction )
							},
							function ( sender, args ) {
								alert( 'Error occured when file uploading: ' + args.get_message() + '\n' + args.get_stackTrace() );
								nextFunction();
							});
					} else {
						alert( 'Error occured when current file reading: ' + args.get_message() + '\n' + args.get_stackTrace() );
						nextFunction();
					}
				});
	  	}
	}
}
function publishFile( webUrl, fileUrl, nextFunction )
{
	var context = new SP.ClientContext( preparePath( webUrl ) );
	var file = context.get_web().getFileByServerRelativeUrl( fileUrl );
	context.load( file );
	context.executeQueryAsync(
		function ( sender, args ) {
			if ( file.get_checkOutType() != SP.CheckOutType.none )
			{
				checkInFile( file, context, nextFunction );
			} else {
				approveFile( file, context, nextFunction );
			}
		},
		function ( sender, args ) {
			alert( 'Error occured when file publishing: ' + args.get_message() + '\n' + args.get_stackTrace() );
			nextFunction();
		});
}
function checkInFile( file, context, nextFunction )
{
	file.checkIn( "", SP.CheckinType.majorCheckIn )
	context.executeQueryAsync(
		function ( sender, args ) {
			approveFile( file, context, nextFunction );
		},
		function ( sender, args ) {
			alert( 'Error occured when file checking in: ' + args.get_message() + '\n' + args.get_stackTrace() );
			approveFile( file, context, nextFunction )
		});
}
function approveFile(file, context, nextFunction)
{
	approveisneeded = false;
	if (approveisneeded == true)
	{
		file.approve("");
		context.executeQueryAsync(
			function ( sender, args ) {
				nextFunction();
			},
			function ( sender, args ) {
				alert('Error occured when file approving: ' + args.get_message() + '\n' + args.get_stackTrace());
				nextFunction();
			});
	} else nextFunction();
}


function createFolderChains(foldersChains)
{
	folderChainsToCreate = [];
	for (i = 0; i < foldersChains.length; i++)
	{
		folderChainsToCreate[folderChainsToCreate.length] = [foldersChains[i][0], foldersChains[i][1], foldersChains[i][2], initializingStatus]
	}
	if (folderChainsToCreate.length != 0)
	{
		createNextFolderChain();
	} else {
		backFromCreateFolderChains();
	}
}
function createNextFolderChain()
{
	lastCreated = null;
	for (i = 0; i < folderChainsToCreate.length; i++)
	{
		if (folderChainsToCreate[i][3] == initializingStatus)
		{
			lastCreated = i;
		}
	}
	if (lastCreated != null)
	{
		backFromCreateFolderChain = createNextFolderChain;
		folderChainsToCreate[lastCreated][3] = processingCopyFileStatus;
		createFolderChain (folderChainsToCreate[lastCreated][0], folderChainsToCreate[lastCreated][1], folderChainsToCreate[lastCreated][2])
	} else {
		backFromCreateFolderChains()
	}
}
function createFolderChain( webUrl, parentFolder, subFoldersString )
{
	subFolders = subFoldersString.split('/');
	if (subFolders.length != 0)
	{
		var context = new SP.ClientContext( preparePath( webUrl ) );
		folder = context.get_web().getFolderByServerRelativeUrl( webUrl + '/' + parentFolder );
		for (i = 0; i < subFolders.length; i++)
		{
			folder = folder.get_folders().add(subFolders[i]);
		}
		context.executeQueryAsync(
			function ( sender, args ) {
				backFromCreateFolderChain();
			},
			function ( sender, args ) {
				alert('Error occured when folders creation: ' + args.get_message() + '\n' + args.get_stackTrace());
				backFromCreateFolderChain();
			});
	} else {
		backFromCreateFolderChain();
	}
}
function copyFolders( siteUrl, foldersToCopy, replaceTextFileArray )
{
	/* to be finished */
	var context = new SP.ClientContext.get_current();
	web = context.get_web();
	filesToCopy = [];
	foldersWaiting = 0;
	serverRequestPath = _spPageContextInfo.serverRequestPath
	currentFolderText = serverRequestPath.substring(0, serverRequestPath.lastIndexOf('/')+1);
	var files = [];
	for (i = 0; i < foldersToCopy.length; i++)
	{
		files[i] = context.get_web().getFolderByServerRelativeUrl(currentFolderText + foldersToCopy[i][0]).get_files();
		context.load(files[i]);
		foldersWaiting++;
		context.executeQueryAsync(
			function ( sender, args ) {
				foldersWaiting--;
				if ((foldersWaiting == 0)&&(i == foldersToCopy.length))
				{
					for (i = 0; i < files.length; i++)
					{
						filesEnumerator = files[i].getEnumerator();
						while (filesEnumerator.moveNext())
						{
							replaceTextArray = [];
							fileRelativeUrl = foldersToCopy[i][0] + '/' + filesEnumerator.get_current().get_name();
							for (n = 0; n < replaceTextFileArray.length; n++)
							{
								if (replaceTextFileArray[n][0] == fileRelativeUrl)
								{
									replaceTextArray = replaceTextFileArray[n][1];
									break;
								}
							}
							filesToCopy[ filesToCopy.length ] = [ fileRelativeUrl, initializingStatus, siteUrl, foldersToCopy[i][1], replaceTextArray ];
						}
					}
					copyNextFile();
				}
			},
			function ( sender, args ) {
				foldersWaiting--;
				alert('Error occured when files enumerating: ' + args.get_message() + '\n' + args.get_stackTrace());
				nextSitesProvisionStep();
			});
	}
	if (foldersToCopy.length == 0) nextSitesProvisionStep();
}
stringToBoolean = function( string ){
	if ( string ) {
		switch( string.toLowerCase().trim() ){
			case "true": case "yes": case "1": return true;
			case "false": case "no": case "0": case null: return false;
			default: return Boolean( string );
		}
	} else { return false }
};
getAttributeValue = function( xml, name )
{
	if ( typeof xml != "undefined" ) { var attributes = xml.attributes } else { return null }
	if ( typeof attributes != "undefined" ) { var attribute = xml.attributes[ name ]; } else { return null }
	if ( typeof attribute != "undefined" ) { return attribute.value } else { return null }
};
getAttributeValueWithDefault = function( xml, name, defaultValue )
{
	var xmlValue = getAttributeValue( xml, name );
	if ( xmlValue == null ) { return defaultValue; } else { return xmlValue; }
}
function encodeXml( string ) {
	return string.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');
};

function decodeXml( string ) {
	return string.replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&apos;/g, "'");
};

function checkAnyNotNull( stringArray )
{
	for ( i = 0; i < stringArray.length; i++ )
	{
		if ( ( stringArray[ i ] != null ) && ( stringArray[ i ] != "" ) ) { return true }
	}
	return false;
}
function checkAnyNull( stringArray )
{
	for ( i = 0; i < stringArray.length; i++ )
	{
		if ( ( typeof stringArray[ i ] == "undefined" ) || ( stringArray[ i ] == null ) ) { return true }
	}
	return false;
}
function checkAnyEmpty( stringArray )
{
	for ( i = 0; i < stringArray.length; i++ )
	{
		if ( ( typeof stringArray[ i ] == "undefined" ) || ( stringArray[ i ] == null ) || ( stringArray[ i ] == "" ) ) { return true }
	}
	return false;
}
// First, checks if it isn't implemented yet.
if ( !String.prototype.format ) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace( /{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined'
			? args[number]
			: match
			;
		});
	};
}
"{0} is dead, but {1} is alive! {0} {2}".format( "ASP", "ASP.NET" )

if ( !String.prototype.addBeforeExtension )
{
	String.prototype.addBeforeExtension = function( newText ) {
		var sep = this.lastIndexOf( "." );
		return ( this.substring( 0, sep ) + newText + this.substring( sep ) );
	}
}
function getInnerXMLAsString( xml )
{
	var output = "";
	var htmlNodes = xml.childNodes;
	for( var i = 0; i < htmlNodes.length; i++ )
	{
		var htmlNode = htmlNodes[ i ];
		if ( htmlNode.nodeName == "#text" )
		{
			output += htmlNode.wholeText;
		} else {
			output += XMLSerializer().serializeToString( htmlNode );
		}
	}
	return output;
}