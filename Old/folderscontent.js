function fractalProvisioningFoldersContentCopyingProceduresAdding()
{
	FORoot.parsing.copyfoldercontent = fractalProvisioningCopyFolderContentParsing;
	if ( FORoot.getItemByName( "folderContentCopying" ) == null ) { fractalProvisioningAppendFolderContentCopyingNode( FORoot ) };
}
(function(){ 
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningFoldersContentCopyingProceduresAdding" ); 
})();

function fractalProvisioningAppendFolderContentCopyingNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "folderContentCopying";
	newFO.order = 90;
	newFO.displayName = "Folder contents copying";
	FOInstance.appendItem( newFO );
}
function fractalProvisioningCopyFolderContentParsing( nodeXML, environmentalAttributes )
{
	var parentNodeType = environmentalAttributes.parentNodeType
	if ( ( parentNodeType == 'web' ) || ( parentNodeType == 'list' ) || ( parentNodeType == 'folder' ) )
	{
		var replacePairs = [];
		var replacePairsXML = nodeXML.getElementsByTagName( "ReplaceText" );
		for ( var i = 0; i < replacePairsXML.length; i++ )
		{
			var attributes = replacePairsXML[i].attributes;
			replacePairs.push( { "sample" : attributes[ 'sample' ].value, "destination" : attributes[ 'destination' ].value } );
		}
		var attributes = nodeXML.attributes;
		var newFO = new fractalObject();
		var webUrl = environmentalAttributes.webUrl;
		var destination = getRelativePath( webUrl, environmentalAttributes.parentNodeUrl );
		var source = getAttributeValue( nodeXML, 'source' );
		newFO.displayName = webUrl + destination + " : " + source;
		newFO.webUrl = webUrl;
		newFO.source = source;
		newFO.destination = destination;
		newFO.replaceText = replacePairs;
		newFO.procedure = fractalProvisioningCopyFolderContentProcedure;
		FORoot.getItemByName( "folderContentCopying" ).items.push( newFO );
	}
}

function fractalProvisioningCopyFolderContentProcedure()
{
	fractalProvisioningCopyFolderContent( this.webUrl, this.source, this.destination, this.replaceText, fractalFree )
}
function fractalProvisioningCopyFolderContent( webUrl, sourceUrl, destinationFolderUrl, replaceText, backFunction )
{
	var context = new SP.ClientContext.get_current();
	var currentFolderText = getRelativeCurrentFolderUrl();
	var files = context.get_web().getFolderByServerRelativeUrl( currentFolderText + '/' + removeFirstSlash( sourceUrl ) ).get_files();
	context.load( files );
	var web = context.get_web();
	context.load( web );
	context.executeQueryAsync(
		function ( sender, args ) {
			var currentWebUrl = web.get_url();
			currentFolderText = getRelativePath( currentWebUrl, currentFolderText )
			copiedFiles = [];
			var filesEnumerator = files.getEnumerator();
			while ( filesEnumerator.moveNext() )
			{
				fileRelativeUrl = currentFolderText + '/' + removeFirstSlash( sourceUrl ) + '/' + filesEnumerator.get_current().get_name();
				copiedFiles[ copiedFiles.length ] = { "processed" : false, "sourceWebUrl" : currentWebUrl, "sourceFileUrl" : fileRelativeUrl, "destinationWebUrl" : webUrl, "destinationFolderUrl" : destinationFolderUrl, "replaceText": replaceText }
			}
			copyNextFile( backFunction );
		},
		function ( sender, args ) {
			alert('Error occured when folder files enumeration: ' + args.get_message() + '\n' + args.get_stackTrace());
			backFunction();
		});
}
function copyNextFile( backFunction )
{
	var nextProcessed = null;
	if ( copiedFiles.length > 0 )
	{
		for ( var i in copiedFiles )
		{
			if ( copiedFiles[i].processed == false )
			{
				nextProcessed = i;
				break;
			}
		}
		if ( nextProcessed != null )
		{
			if ( nextProcessed == 0 )
			{
				storedBackFunction = backFunction;
			}
			copiedFiles[ nextProcessed ].processed = true;
			copyFile( copiedFiles[ nextProcessed ].sourceWebUrl, copiedFiles[ nextProcessed ].sourceFileUrl, copiedFiles[ nextProcessed ].destinationWebUrl, copiedFiles[ nextProcessed ].destinationFolderUrl, null, copiedFiles[ nextProcessed ].replaceText, copyNextFile )
		} else {
			storedBackFunction();
		}
	} else {
		backFunction();
	}
}