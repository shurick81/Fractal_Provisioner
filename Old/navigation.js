function fractalProvisioningNavigationProceduresAdding()
{
	FORoot.parsing.navigation = navigationParsing;
	if ( FORoot.getItemByName( "navigation" ) == null ) { appendNavigationNode( FORoot ) };
}
(function(){ 
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningNavigationProceduresAdding" ); 
})();

function appendNavigationNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "navigation";
	newFO.order = 100;
	newFO.displayName = "Setting navigation";
	FOInstance.appendItem( newFO );
}
function navigationParsing( nodeXML, environmentalAttributes )
{
	if ( environmentalAttributes.parentNodeType == 'web' )
	{
		var webUrl = environmentalAttributes.parentNodeUrl;
		var nodes = nodeXML.childNodes;
		for ( var i = 0; i < nodes.length; i++ )
		{
			var node = nodes[ i ];
			if ( typeof node.tagName != "undefined" )
			{
				var type = node.tagName.toLowerCase();
				var newFO = new fractalObject();
				newFO.displayName = webUrl + " : " + type;
				newFO.webUrl = webUrl;
				newFO.type = type;
				newFO.xml = node;
				newFO.clear = stringToBoolean( getAttributeValue( node, "clear" ) );
				newFO.source = getAttributeValue( node, "source" );		
				newFO.includeTypes = getAttributeValue( node, "includeTypes" );		
				newFO.inherit = getAttributeValue( node, "inherit" );		
				newFO.procedure = navigationSettingProcedure;
				FORoot.getItemByName( "navigation" ).items.push( newFO );
			}
		}

	}
}
function navigationPresettingProcedure()
{
	var currentObject = this;
	var FeatureId = new SP.Guid( "f6924d36-2fa8-4f0b-b16d-06b7250180fa" );
	var context = new SP.ClientContext( preparePath( this.webUrl ) );
	var site = context.get_site();
	var featureCollection = site.get_features();
	context.load( featureCollection );
	context.executeQueryAsync(
		function ( sender, args )
		{
			var featureEnumerator = featureCollection.getEnumerator();
			featureEnabled = false;
			while ( featureEnumerator.moveNext() )
			{
				if ( featureEnumerator.get_current().get_definitionId().equals( FeatureId ) )
				{
					featureEnabled = true;
					break;
				}
			}
			if ( currentObject.clear )
			{
				var newFO = new fractalObject();
				newFO.displayName = "Navigation clearing";
				newFO.webUrl = currentObject.webUrl;
				newFO.type = currentObject.type;
				newFO.procedure = navigationClearingProcedure;
				newFO.publishing = featureEnabled;
				currentObject.items.push( newFO );
				var blockId = "fractal-" + currentObject.id;
				newFO.renderItem( blockId );
			}
			var headings = currentObject.xml.getElementsByTagName( "Heading" );
			if ( headings.length > 0 )
			{
				var newFO = new fractalObject();
				newFO.displayName = "Nodes adding";
				newFO.webUrl = currentObject.webUrl;
				newFO.type = currentObject.type;
				newFO.procedure = navigationNodesAddingProcedure;
				newFO.nodes = headings;
				newFO.publishing = featureEnabled;
				currentObject.items.push( newFO );
				var blockId = "fractal-" + currentObject.id;
				newFO.renderItem( blockId );
			}
			fractalFree();
		},
		function( sender, args )
		{
			alert( 'Error occured when publishing feature checking: ' + args.get_message() + '\n' + args.get_stackTrace() );
			fractalFree();
		});	
}
function navigationSettingProcedure()
{
	currentObject = this;
	var featureId = new SP.Guid( "f6924d36-2fa8-4f0b-b16d-06b7250180fa" );
	var context = new SP.ClientContext( preparePath( this.webUrl ) );
	var site = context.get_site();
	var featureCollection = site.get_features();
	context.load( featureCollection );
	var oWeb = context.get_web();
	var webNavigation = oWeb.get_navigation();
	context.load( webNavigation );
	context.executeQueryAsync(
		function ( sender, args )
		{
			var featureEnumerator = featureCollection.getEnumerator();
			featureEnabled = false;
			while ( featureEnumerator.moveNext() )
			{
				if ( featureEnumerator.get_current().get_definitionId().equals( featureId ) )
				{
					featureEnabled = true;
					break;
				}
			}
			if ( currentObject.clear )
			{
				var newFO = new fractalObject();
				newFO.displayName = "Navigation clearing";
				newFO.webUrl = currentObject.webUrl;
				newFO.type = currentObject.type;
				newFO.procedure = navigationClearingProcedure;
				newFO.publishing = featureEnabled;
				currentObject.items.push( newFO );
				var blockId = "fractal-" + currentObject.id;
				newFO.renderItem( blockId );
			}
			var headings = currentObject.xml.getElementsByTagName( "Heading" );
			if ( headings.length > 0 )
			{
				var newFO = new fractalObject();
				newFO.displayName = "Nodes adding";
				newFO.webUrl = currentObject.webUrl;
				newFO.type = currentObject.type;
				newFO.procedure = navigationNodesAddingProcedure;
				newFO.nodes = headings;
				newFO.publishing = featureEnabled;
				currentObject.items.push( newFO );
				var blockId = "fractal-" + currentObject.id;
				newFO.renderItem( blockId );
			}
			if ( currentObject.type == "global" )
			{
				var inherit = ( currentObject.inherit.toString().toLowerCase() == "true" );
				if ( webNavigation.get_useShared() != inherit )
				{
					webNavigation.set_useShared( inherit );
					oWeb.update();
				}
			}
			if ( featureEnabled )
			{
				fractalProvisioningPublishingNavigationSetting( currentObject );
			} else {
				context.executeQueryAsync(
					function ( sender, args )
					{
						fractalFree();
					},
					function( sender, args )
					{
						alert( 'Error occured when inheritance setting: ' + args.get_message() + '\n' + args.get_stackTrace() );
						fractalFree();
					});
			}
		},
		function( sender, args )
		{
			alert( 'Error occured when publishing feature checking: ' + args.get_message() + '\n' + args.get_stackTrace() );
			fractalFree();
		});	
}
function fractalProvisioningPublishingNavigationSetting( currentObject )
{
	var context = new SP.ClientContext( preparePath( currentObject.webUrl ) );
	var webNavSettings = new SP.Publishing.Navigation.WebNavigationSettings( context, context.get_web() );
	if ( currentObject.type == "global" )
	{
		var navigation = webNavSettings.get_globalNavigation();
		includeTypesPropertyName = "__GlobalNavigationIncludeTypes";
		inheritPropertyName = "__InheritGlobalNavigation";
	} else {
		var navigation = webNavSettings.get_currentNavigation();
		includeTypesPropertyName = "__CurrentNavigationIncludeTypes";
		inheritPropertyName = "__InheritCurrentNavigation";
	}
	var web = context.get_web();
	var props = web.get_allProperties();
	context.load( web );
	context.load( props );
	context.load( navigation );

	context.executeQueryAsync(
		function ( sender, args )
		{
			var updateNeeded = false;
			var currentSource = navigation.get_source();
			var source = parseInt( currentObject.source );
			if ( currentSource != source )
			{
				navigation.set_source( source );
				updateNeeded = true;
				webNavSettings.update();
			}
			var includeTypes = currentObject.includeTypes;
			if ( props.get_fieldValues()[ includeTypesPropertyName ] !== includeTypes )
			{
				props.set_item( includeTypesPropertyName, includeTypes );
				updateNeeded = true;
				web.update();
			}
			var inherit = currentObject.inherit;
			if ( props.get_fieldValues()[ inheritPropertyName ] !== inherit )
			{
				props.set_item( inheritPropertyName, inherit );
				updateNeeded = true;
				web.update();
			}
			if ( updateNeeded )
			{
				context.executeQueryAsync(
					function ( sender, args )
					{
						fractalFree();
					},
					function( sender, args )
					{
						alert( 'Error occured when publishing navigation settings updating: ' + args.get_message() + '\n' + args.get_stackTrace() );
						fractalFree();
					});
			} else {
				fractalFree();
			}
		},
		function( sender, args )
		{
			alert( 'Error occured when publishing navigation settings reading: ' + args.get_message() + '\n' + args.get_stackTrace() );
			fractalFree();
		});

}
function navigationClearingProcedure()
{
	navigationClearing( this.webUrl, this.type, this.publishing, fractalFree )
}
function navigationClearing( webUrl, type, publishing, callBack )
{
	var context = new SP.ClientContext( preparePath( webUrl ) );
	if ( currentObject.type == "current" )
	{
		var collNavNode = context.get_web().get_navigation().get_quickLaunch();
	}
	if ( currentObject.type == "global" )
	{
		var collNavNode = context.get_web().get_navigation().get_topNavigationBar();
	}
	context.load( collNavNode );
	context.executeQueryAsync(
		function ( sender, args )
		{
			var updateNeeded = false;
			while ( collNavNode.get_count() > 0 )
			{
				collNavNode.get_item( 0 ).deleteObject();
				if ( !updateNeeded ) { updateNeeded = true };
			}
			if ( updateNeeded )
			{
				context.executeQueryAsync(
					function ( sender, args )
					{
						fractalFree();
					},
					function( sender, args )
					{
						alert( 'Error occured when foundation navigation clearing: ' + args.get_message() + '\n' + args.get_stackTrace() );
						fractalFree();
					});	
			} else {
				fractalFree();
			}
		},
		function( sender, args )
		{
			alert( 'Error occured when foundation navigation reading: ' + args.get_message() + '\n' + args.get_stackTrace() );
			fractalFree();
		});
}
function navigationNodesAddingProcedure()
{
	var context = new SP.ClientContext( preparePath( this.webUrl ) );
		if ( this.type == "current" )
		{
			var collNavNode = context.get_web().get_navigation().get_quickLaunch();
		}
		if ( this.type == "global" )
		{
			var collNavNode = context.get_web().get_navigation().get_topNavigationBar();
		}
		var nodesCount = this.nodes.length;
		for( var i = 0; i < nodesCount; i++ )
		{
			var heading = this.nodes[ nodesCount - i - 1 ];
			var headingCreationInfo = new SP.NavigationNodeCreationInformation();
			headingCreationInfo.set_title( getAttributeValue( heading, "title" ) );
			var URL = getAttributeValue( heading, "URL" );
			if ( typeof URL != "undefined" ) {
				if ( this.publishing ) { URL = makeAbsUrl( URL ); }
				headingCreationInfo.set_url( URL );
			}
			var addedHeader = collNavNode.add( headingCreationInfo );
			var links = heading.getElementsByTagName( "Link" );
			var linksCount = links.length;
			for( var n = 0; n < linksCount; n++ )
			{
				var link = links[ linksCount - n - 1 ];
				var linkCreationInfo = new SP.NavigationNodeCreationInformation();
				linkCreationInfo.set_title( getAttributeValue( link, "title" ) );
				URL = getAttributeValue( link, "URL" );
				if ( this.publishing ) { URL = makeAbsUrl( URL ); }
				linkCreationInfo.set_url( URL );
				addedHeader.get_children().add( linkCreationInfo );
			}
		}
		context.executeQueryAsync(
			function( sender, args )
			{
				fractalFree();
			},
			function( sender, args )
			{
				alert( 'Error occured when changing navigation: ' + args.get_message() + '\n' + args.get_stackTrace() );
				fractalFree();
			});
}