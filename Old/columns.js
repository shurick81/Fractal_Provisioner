function fractalProvisioningColumnsCreatingProceduresAdding()
{
	FORoot.parsing.column = fractalProvisioningColumnsCreatingParsing;
	if ( FORoot.getItemByName( "columnsCreating" ) == null ) { fractalProvisioningAppendColumnsCreatingNode( FORoot ) };
}
(function(){ 
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningColumnsCreatingProceduresAdding" ); 
})();

function fractalProvisioningAppendColumnsCreatingNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "columnsCreating";
	newFO.order = 70;
	newFO.displayName = "Columns creation";
	newFO.proceduresByType = { };
	FOInstance.appendItem( newFO );
	fractalProvisioningColumnTypesFunctionsAdding();
}
function fractalProvisioningColumnsCreatingParsing( nodeXML, environmentalAttributes )
{
	var parentNodeType = environmentalAttributes.parentNodeType
	if ( parentNodeType == 'list' )
	{
		var webUrl = environmentalAttributes.webUrl;
		var listUrl = environmentalAttributes.parentNodeUrl;
		var name = getAttributeValue( nodeXML, 'name' )
		if ( getAttributeValue( nodeXML, 'displayName' ) != null )
		{
			var displayName = getAttributeValue( nodeXML, 'displayName' );
		} else {
			var displayName = name;
		}
		var newFO = new fractalObject();
		newFO.displayName = listUrl + ' : ' + displayName;
		FORoot.getItemByName( "columnsCreating" ).items.push( newFO );
		var shared = { };
		shared.webUrl = webUrl;
		shared.name = name;
		shared.displayName = displayName;
		shared.nodeXML = nodeXML;
		jsFile = getAttributeValue( nodeXML, 'jsFile' );

		var newSubFO = new fractalObject();
		newSubFO.displayName = "XML Building";
		newSubFO.shared = shared;
		newSubFO.procedure = FORoot.getItemByName( "columnsCreating" ).proceduresByType[ getAttributeValue( nodeXML, 'type' ) ].buildXML;
		newFO.items.push( newSubFO );
		
		var newSubFO = new fractalObject();
		newSubFO.displayName = "Column adding";
		newSubFO.shared = shared;
		newSubFO.listUrl = listUrl;
		newSubFO.jsLink = null;
		newSubFO.jsFile = jsFile;
		newSubFO.addToDefaultView = getAttributeValue( nodeXML, 'addToDefaultView' );
		newSubFO.addFieldOptions = parseInt( getAttributeValue( nodeXML, 'addFieldOptions' ) );
		newSubFO.procedure = fractalProvisioningAddColumnXMLToList;
		newFO.items.push( newSubFO );
		
		if ( jsFile != null )
		{
			var newSubFO = new fractalObject();
			newSubFO.displayName = "JS file copying";
			newSubFO.jsFile = jsFile;
			newSubFO.listUrl = listUrl;
			newSubFO.shared = shared;
			newSubFO.procedure = fractalProvisioningCopyColumnJSFile;
			newFO.items.push( newSubFO );
		}
	}
}
function fractalProvisioningColumnTypesFunctionsAdding()
{
	//https://karinebosch.wordpress.com/my-articles/creating-fields-using-csom/
	FORoot.getItemByName( "columnsCreating" ).proceduresByType.Text = { buildXML: function ()
	{
		var fieldDefinition = {};
		fieldDefinition.Type = "Text";
		fieldDefinition.DisplayName = this.shared.displayName;
		this.shared.xml = buildFieldXml( fieldDefinition );
		fractalFree();
	} };
	FORoot.getItemByName( "columnsCreating" ).proceduresByType.URL = { buildXML: function ()
	{
		var fieldDefinition = {};
		fieldDefinition.Type = "URL";
		fieldDefinition.DisplayName = this.shared.displayName;
		fieldDefinition.Format = getAttributeValue( this.shared.nodeXML, 'format' );
		this.shared.xml = buildFieldXml( fieldDefinition );
		fractalFree();
	} };
	FORoot.getItemByName( "columnsCreating" ).proceduresByType.Number = { buildXML: function ()
	{
		var fieldDefinition = {};
		fieldDefinition.Type = "Number";
		fieldDefinition.DisplayName = this.shared.displayName;
		fieldDefinition.Decimals = getAttributeValue( this.shared.nodeXML, 'decimals' );
		this.shared.xml = buildFieldXml( fieldDefinition );
		fractalFree();
	} };
	FORoot.getItemByName( "columnsCreating" ).proceduresByType.Choice = { buildXML: function ()
	{
		var fieldDefinition = {};
		fieldDefinition.Type = "Choice";
		fieldDefinition.DisplayName = this.shared.name;
		fieldDefinition.Format = getAttributeValue( this.shared.nodeXML, 'format' );
		var fieldXML = buildFieldXml( fieldDefinition );
		var XMLChoices = this.shared.nodeXML.getElementsByTagName( 'Choice' )
		for ( var i = 0; i < XMLChoices.length; i++ )
		{
			fieldXML.getElementsByTagName( "Field" )[ 0 ].appendChild( XMLChoices[ i ] )
		}		
		this.shared.xml = fieldXML;
		fractalFree();
	} };
	FORoot.getItemByName( "columnsCreating" ).proceduresByType.DateTime = { buildXML: function ()
	{
		var fieldDefinition = {};
		fieldDefinition.Type = "DateTime";
		fieldDefinition.DisplayName = this.shared.name;
		fieldDefinition.Format = getAttributeValue( this.shared.nodeXML, 'format' );
		this.shared.xml = buildFieldXml( fieldDefinition );
		fractalFree();
	} };
	FORoot.getItemByName( "columnsCreating" ).proceduresByType.User = { buildXML: function ()
	{
		var fieldDefinition = {};
		fieldDefinition.Type = "User";
		fieldDefinition.DisplayName = this.shared.name;
		var required = getAttributeValue( this.shared.nodeXML, 'required' );
		if ( required != null && required.toLowerCase == "true" )
		{
			fieldDefinition.Required = 'TRUE';
		}
		// ShowField options: http://prasadtech2.blogspot.ru/2013/10/setting-show-field-for-person-or-group.html
		var showField = getAttributeValue( this.shared.nodeXML, 'showField' );
		if ( showField != null )
		{
			fieldDefinition.ShowField = required;
		}
		this.shared.xml = buildFieldXml( fieldDefinition );
		fractalFree();
	} };
}
function fractalProvisioningAddColumnXMLToList()
{
	var displayName = null;
	if ( this.shared.displayName != this.shared.name ) displayName = this.shared.displayName;
	var xmlString = XMLSerializer().serializeToString( this.shared.xml )
	createColumn( this.shared.webUrl, this.listUrl, xmlString, this.shared.name, displayName, this.jsFile, this.addToDefaultView, this.addFieldOptions, fractalFree );
}
function createColumn( webUrl, listUrl, xmlString, name, displayName, jsFile, addToDefaultView, addFieldOptions, backFunction )
{
	var context = new SP.ClientContext( preparePath( webUrl ) );
	var lists = context.get_web().get_lists();
	context.load( lists, 'Include(Id,RootFolder)' );
	var listSite = context.get_site();
	context.load( listSite );
	context.executeQueryAsync(
		function (sender, args)
		{
			var listEnumerator = lists.getEnumerator();
			list = null;
			listId = null;
			while ( listEnumerator.moveNext() ) {
				list = listEnumerator.get_current();
				if ( list.get_rootFolder().get_serverRelativeUrl().toLowerCase() ==  listUrl.toLowerCase() )
				{
					listId = list.get_id();
					break;
				}
			}
			if ( listId != null )
			{
				field = list.get_fields().addFieldAsXml( xmlString, addToDefaultView, addFieldOptions );
				field.set_jsLink();
				context.load( field );
				if ( displayName != null )
				{
					field.set_title( displayName );
					field.update();
				}
				if ( jsFile != null )
				{
					var newFileName = getFileNameFromUrl( jsFile ).addBeforeExtension( name );		
					jsLink = "~sitecollection" + getRelativePath( listSite.get_url(), listUrl ) + "/" + newFileName;
					field.set_jsLink( jsLink )
					field.update();
				}
				context.executeQueryAsync(
					function (sender, args)
					{
						backFunction();
					},
					function (sender, args)
					{
						alert( 'Failed to add column: ' + args.get_message() + '\n' + args.get_stackTrace() );
						backFunction();
					});
			} else {
				alert( 'List ' + listUrl + ' is not found' );
				backFunction();
			}
		},
		function (sender, args)
		{
			alert( 'Failed to enumerate lists: ' + args.get_message() + '\n' + args.get_stackTrace() );
			backFunction();
		});
}
function buildFieldXml( fieldAttributes )
{
	var xml = parseXml( "<Field/>" );
	var newNode = xml.getElementsByTagName( "Field" )[0];
	for ( var key in fieldAttributes ) {
		if ( fieldAttributes.hasOwnProperty( key ) ) {
			if ( fieldAttributes[ key ] != null )
			{
				newNode.setAttribute( key, fieldAttributes[ key ] );
			}
		}
	}
	return xml;
}
function fractalProvisioningCopyColumnJSFile()
{
	var webServerRelativeUrl = _spPageContextInfo.webServerRelativeUrl;
	var serverRequestPath = _spPageContextInfo.serverRequestPath;
	var sourceFileURL = serverRequestPath.substring( webServerRelativeUrl.length, serverRequestPath.lastIndexOf( '/' ) ) + this.jsFile;
	var replaceText = [ { "sample" : "FIELDNAME", "destination" : this.shared.name } ];
	var newFileName = getFileNameFromUrl( this.jsFile ).addBeforeExtension( this.shared.name );
	copyFile( webServerRelativeUrl, sourceFileURL, this.shared.webUrl, getRelativePath( this.shared.webUrl, this.listUrl ), newFileName, replaceText, fractalFree );
}