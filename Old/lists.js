function fractalProvisioningListsCreatingProceduresAdding()
{
	FORoot.parsing.list = fractalProvisioningListCreatingParsing;
	if ( FORoot.getItemByName( "listsCreating" ) == null ) { fractalProvisioningAppendListsCreatingNode( FORoot ) };
}
(function(){
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningListsCreatingProceduresAdding" ); 
})();

function fractalProvisioningAppendListsCreatingNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "listsCreating";
	newFO.order = 50;
	newFO.displayName = "Lists creation";
	FOInstance.appendItem( newFO );
}
function fractalProvisioningListCreatingParsing( nodeXML, environmentalAttributes )
{
	var parentNodeType = environmentalAttributes.parentNodeType;
	if ( parentNodeType == 'web' )
	{
		var templateType = getAttributeValue( nodeXML, 'templateType' );
		if ( ( templateType != null ) && ( templateType != '' ) )
		{
			var webUrl = environmentalAttributes.webUrl;
			var url = getAttributeValue( nodeXML, 'url' );
			var title = getAttributeValue( nodeXML, 'title' );
			var newFO = fractalProvisioningListCreatingObject( webUrl, url, templateType, title );
			if ( newFO != null )
			{
				newFO.displayName = webUrl + url;
				FORoot.getItemByName( "listsCreating" ).items.push( newFO );
			} else alert( "Could not put list configuration into queue because of insufficient attributes" );
		}
	}
}
function fractalProvisioningListCreatingObject( webUrl, url, templateType, title )
{
	if ( !checkAnyEmpty ( [ url, templateType, title ] ) )
	{
		var newFO = new fractalObject();
		newFO.webUrl = webUrl;
		newFO.url = url;
		newFO.templateType = templateType;
		newFO.title = title;
		newFO.procedure = fractalProvisioningListCreating;
		return newFO;
	} else { return null }
}
function fractalProvisioningListCreating()
{
	createList( this.webUrl, this.url, this.templateType, this.title, fractalFree )
}
function createList( webUrl, listUrl, templateType, title, backFunction )
{
	if ( listUrl[0] == '/' ) listUrl = listUrl.substring(1);
	var context = new SP.ClientContext( preparePath( webUrl ) );
	var web = context.get_web();
	var listCreationInfo = new SP.ListCreationInformation();
	listCreationInfo.set_title( title );
	listCreationInfo.set_templateType( templateType );
	listCreationInfo.set_url( listUrl )
	newList = web.get_lists().add( listCreationInfo );
	context.load( newList );
	context.executeQueryAsync(
		function( sender, args )
		{
			backFunction();
		},
		function( sender, args )
		{
			alert( 'Error while list creation: ' + args.get_message() + '\n' + args.get_stackTrace() );
			backFunction();
		});
}