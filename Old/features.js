function fractalProvisioningFeaturesControllingProceduresAdding()
{
	FORoot.parsing.feature = fractalProvisioningFeatureControllingParsing;
	if ( FORoot.getItemByName( "siteFeaturesControlling" ) == null ) { fractalProvisioningAppendSiteFeaturesControllingNode( FORoot ) };
	if ( FORoot.getItemByName( "webFeaturesControlling" ) == null ) { fractalProvisioningAppendWebFeaturesControllingNode( FORoot ) };
}
(function(){
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningFeaturesControllingProceduresAdding" ); 
})();

function fractalProvisioningAppendSiteFeaturesControllingNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "siteFeaturesControlling";
	newFO.order = 20;
	newFO.displayName = "Site collection features controlling";
	FOInstance.appendItem( newFO );
}
function fractalProvisioningAppendWebFeaturesControllingNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "webFeaturesControlling";
	newFO.order = 40;
	newFO.displayName = "Web features controlling";
	FOInstance.appendItem( newFO );
}
function fractalProvisioningFeatureControllingParsing( nodeXML, environmentalAttributes )
{
	var parentNodeType = environmentalAttributes.parentNodeType;
	if ( ( parentNodeType == 'web' ) || ( parentNodeType == 'site' ) )
	{
		if ( getAttributeValue( nodeXML, 'create' ) != 'false' )
		{
			var objectType = environmentalAttributes.parentNodeType;
			var url = environmentalAttributes.url;
			var featureIdText = getAttributeValue( nodeXML, 'id' );
			deactivateValue = getAttributeValue( nodeXML, 'deactivate' );
			if ( ( deactivateValue != null ) && ( deactivateValue.toLowerCase() != "false" ) && ( deactivateValue.toLowerCase() != "no" ) )
			{
				var deactivate = true;
			} else var deactivate = false;
			var newFO = fractalProvisioningFeatureControllingObject( objectType, url, featureIdText, deactivate );
			if ( newFO != null )
			{
				if ( !deactivate ) { var activationText = "Activation" } else { var activationText = "Deactivation" }
				newFO.displayName = url + ", " + featureIdText + " : " + activationText;
				if ( objectType == 'site' )
				{
					FORoot.getItemByName( "siteFeaturesControlling" ).items.push( newFO );
				} else if ( objectType == 'web' ) {
					FORoot.getItemByName( "webFeaturesControlling" ).items.push( newFO );
				}
			}
		}
	}
}
function fractalProvisioningFeatureControllingObject( objectType, url, feature, deactivate )
{
	if ( !checkAnyNull( [ objectType, url, feature ] ) )
	{
		if ( !checkAnyEmpty( [ objectType, feature ] ) )
		{
			var newFO = new fractalObject();
			newFO.objectType = objectType;
			newFO.url = url;
			newFO.feature = feature;
			if ( ( deactivate != null ) && ( deactivate.toString().toLowerCase() != "false" ) && ( deactivate.toString().toLowerCase() != "no" ) )
			{
				newFO.deactivate = true;
			}
			newFO.procedure = fractalProvisioningFeatureControlling;
			return newFO;
		} else { return null }
	} else { return null }
}
function fractalProvisioningFeatureControlling()
{
	featureControl( this.url, this.feature, this.deactivate, this.objectType, fractalFree )
}

function featureControl( url, feature, deactivate, objectType, backFunction )
{
	var featureId = new SP.Guid( feature );
	context = new SP.ClientContext( preparePath(url) );
	if ( objectType == 'site' )
	{
		var weborsite = context.get_site();
	} else if ( objectType == 'web' )
	{
		var weborsite = context.get_web();
	} else {
		backFunction();
		return;
	}
	var featureCollection = weborsite.get_features();
	context.load( featureCollection );
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
			if ( !deactivate != featureEnabled )
			{
				if ( !deactivate == true )
				{
					weborsite.get_features().add( featureId, false );
				} else {
					weborsite.get_features().remove( featureId, false );
				}
				context.executeQueryAsync(
					function ()
					{
						backFunction();
					},
					function ( sender, args )
					{
						alert( 'Error occured when feature activation or deactivation: ' + args.get_message() + '\n' + args.get_stackTrace() );
						backFunction();
					});
			} else {
				backFunction();
			}
		},
		function ( sender, args )
		{
			alert( 'Error occured when features reading ' + args.get_message() + '\n' + args.get_stackTrace() );
			backFunction();
		});
}