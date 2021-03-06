function fractalProvisioningSitesProvisioningProceduresAdding()
{
	FORoot.parsing.site = fractalProvisioningSiteParsing;
	if ( FORoot.getItemByName( "sitesProvisioning" ) == null ) { fractalProvisioningAppendSitesProvisioningNode( FORoot ) };
}
(function(){
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningSitesProvisioningProceduresAdding" ); 
})();

function fractalProvisioningAppendSitesProvisioningNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "sitesProvisioning";
	newFO.order = 10;
	newFO.displayName = "Site Collections Provisioning";
	FOInstance.appendItem( newFO );
}
function fractalProvisioningSiteParsing( nodeXML, environmentalAttributes )
{
	var parentNodeType = environmentalAttributes.parentNodeType;
	if ( parentNodeType == 'configuration' )
	{
		var searchCenter = getAttributeValue( nodeXML, 'searchCenter' );
		if ( !checkAnyEmpty( [ searchCenter ] ) )
		{
			var url = getAttributeValue( nodeXML, 'url' );
			var newFO = fractalProvisioningSiteConfiguringObject( url, searchCenter );
			if ( newFO != null )
			{
				newFO.displayName = url;
				FORoot.getItemByName( "sitesProvisioning" ).items.push( newFO );
			} else alert( "Could not put site in queue because of insufficient attributes" );
		}
	}
}
function fractalProvisioningSiteConfiguringObject( url, searchCenter )
{
	if ( !checkAnyEmpty( [ searchCenter ] ) )
	{
		var newFO = new fractalObject();
		if ( url != null ) { newFO.url = url; } else { newFO.url = ""; }
		newFO.searchCenter = searchCenter;
		newFO.procedure = fractalProvisioningSiteProvisioning;
		return newFO;
	} else return null;
}
function fractalProvisioningSiteProvisioning()
{
	applySearchCenter( this.url, this.searchCenter, fractalFree );
}
function applySearchCenter( siteUrl, searchCenterUrl, backFunction )
{
	var context = new SP.ClientContext( preparePath( siteUrl ) );
	var web = context.get_web();
	var webProperties = web.get_allProperties();
	context.load( webProperties );
	if ( searchCenterUrl != "" )
	{
		webProperties.set_item( 'SRCH_ENH_FTR_URL', searchCenterUrl );
		webProperties.set_item( 'SRCH_SB_SET_SITE', '{"Inherit":false,"ResultsPageAddress":"' + searchCenterUrl + '","ShowNavigation":false}' );
		web.update();
		context.executeQueryAsync(
			function ( sender, args ) {
				backFunction()
			},
			function ( sender, args ) {
				alert( 'Error occured when search center applying: ' + args.get_message() + '\n' + args.get_stackTrace() );
				backFunction();
			});
	} else backFunction()
}
