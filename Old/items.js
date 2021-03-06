function fractalProvisioningItemCreationProceduresAdding()
{
	FORoot.parsing.item = fractalProvisioningItemParsing;
	if ( FORoot.getItemByName( "itemsCreation" ) == null ) { fractalProvisioningAppendItemCreationNode( FORoot ) };
}
(function(){ 
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningItemCreationProceduresAdding" ); 
})();

function fractalProvisioningAppendItemCreationNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "itemsCreation";
	newFO.order = 120;
	newFO.displayName = "Items creation";
	FOInstance.appendItem( newFO );
}
function fractalProvisioningItemParsing( nodeXML, environmentalAttributes )
{
	if ( environmentalAttributes.parentNodeType == 'list' )
	{
		var webUrl = environmentalAttributes.webUrl;
		var listUrl = environmentalAttributes.parentNodeUrl;
		var xmlItemAttributes = nodeXML.attributes;
		var itemAttributes = [];
		for ( var i = 0; i < xmlItemAttributes.length; i++ )
		{
			if ( xmlItemAttributes[ i ].localName != "enable" )
			{
				itemAttributes.push( [ xmlItemAttributes[ i ].localName, xmlItemAttributes[ i ].nodeValue] );
			}
		}
		var newFO = new fractalObject();
		newFO.displayName = webUrl + listUrl + ' : ' + itemAttributes[0][1];
		newFO.webUrl = webUrl;
		newFO.listUrl = listUrl;
		newFO.procedure = fractalProvisioningItemCreationProcedure;
		newFO.attributes = itemAttributes;
		FORoot.getItemByName( "itemsCreation" ).items.push( newFO );
	}
}
function fractalProvisioningItemCreationProcedure()
{
	fractalProvisioningCreateItem( this.webUrl, this.listUrl, this.attributes, fractalFree )
}
function fractalProvisioningCreateItem( webUrl, listUrl, attributes, backFunction )
{
	var clientContext = new SP.ClientContext( preparePath( webUrl ) );
	var lists = clientContext.get_web().get_lists();
	clientContext.load( lists, 'Include(Id,RootFolder)' );
	clientContext.executeQueryAsync(
		function ( sender, args )
		{
			var listEnumerator = lists.getEnumerator();
			while ( listEnumerator.moveNext() ) {
				var list = listEnumerator.get_current();
				if ( list.get_rootFolder().get_serverRelativeUrl().toLowerCase() == listUrl.toLowerCase() )
				{
					var ListId = list.get_id();
					break;
				}
			}
			if ( ListId != null )
			{
				var listFields = list.get_fields()
				clientContext.load( listFields )
				clientContext.executeQueryAsync(
					function ( sender, args )
					{
						var fieldRef = []
						var fieldEnumerator = listFields.getEnumerator();
						while ( fieldEnumerator.moveNext() ) {
							var oField = fieldEnumerator.get_current();
							fieldRef [ oField.get_internalName() ] = oField.get_typeAsString();
						}
						var itemCreateInfo = new SP.ListItemCreationInformation();
						oListItem = list.addItem( itemCreateInfo );
						for ( var i in attributes )
						{
							switch ( fieldRef[ attributes[i][0] ] )
							{
								case 'URL':
								{
									var urlValue = new SP.FieldUrlValue();
									splittedUrl = attributes[i][1].split( '#;' );
									urlValue.set_url( splittedUrl[0] );
									urlValue.set_description( splittedUrl[1] );
									oListItem.set_item( attributes[i][0], urlValue );
									break;
								}
								default:
								{
									oListItem.set_item( attributes[i][0], attributes[i][1] );
								}
							}
						}
						oListItem.update();
						clientContext.executeQueryAsync(
						function ( sender, args )
						{
							backFunction();
						},
						function ( sender, args )
						{
							alert( 'Error occured when item creation: ' + args.get_message() + '\n' + args.get_stackTrace() );
							backFunction();
						});
					},
					function ( sender, args )
					{
						alert( 'Error occured when fields reading: ' + args.get_message() + '\n' + args.get_stackTrace() );
						backFunction();
					});
			} else {
				alert( 'List has not been found' );
				backFunction();
			}
		},
		function ( sender, args )
		{
			alert( 'Error occured when list location: ' + args.get_message() + '\n' + args.get_stackTrace() );
			backFunction();
		});
}
