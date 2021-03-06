function fractalProvisioningFoldersCreatingProceduresAdding()
{
	FORoot.parsing.folder = fractalProvisioningFoldersCreatingParsing;
	if ( FORoot.getItemByName( "foldersCreating" ) == null ) { fractalProvisioningAppendFoldersCreatingNode( FORoot ) };
}
(function(){ 
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningFoldersCreatingProceduresAdding" ); 
})();

function fractalProvisioningAppendFoldersCreatingNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "foldersCreating";
	newFO.order = 80;
	newFO.displayName = "Folders creation";
	FOInstance.appendItem( newFO );
}
function fractalProvisioningFoldersCreatingParsing( nodeXML, environmentalAttributes )
{
	var parentNodeType = environmentalAttributes.parentNodeType
	if ( ( parentNodeType == 'web' ) || ( parentNodeType == 'list' ) || ( parentNodeType == 'folder' ) )
	{
		if ( getAttributeValue( nodeXML, 'create' ) != 'false' )
		{
			var attributes = nodeXML.attributes;
			var newFO = new fractalObject();
			var webUrl = environmentalAttributes.webUrl;
			var parentFolderUrl = environmentalAttributes.parentNodeUrl;
			var url = getAttributeValue( nodeXML, 'url' )
			newFO.displayName = parentFolderUrl + url;
			newFO.webUrl = webUrl;
			newFO.parentFolderUrl = parentFolderUrl;
			newFO.url = url;
			newFO.procedure = fractalProvisioningFolderCreatingProcedure;
			FORoot.getItemByName( "foldersCreating" ).items.push( newFO );
		}
	}
}
function fractalProvisioningFolderCreatingProcedure()
{
	fractalProvisioninCreateFolder( this.webUrl, this.parentFolderUrl, this.url, fractalFree )
}
function fractalProvisioninCreateFolder( webUrl, parentFolderUrl, folderUrl, backFunction )
{
	var context = new SP.ClientContext( preparePath( webUrl ) );
	folder = context.get_web().getFolderByServerRelativeUrl( makeRelative( parentFolderUrl ) );
	folder.get_folders().add( removeFirstSlash( folderUrl ) );
	context.executeQueryAsync(
		function ( sender, args ) {
			backFunction();
		},
		function ( sender, args ) {
			alert('Error occured when folder creation: ' + args.get_message() + '\n' + args.get_stackTrace());
			backFunction();
		});
}