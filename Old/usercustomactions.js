function fractalProvisioningInjectionProceduresAdding()
{
	FORoot.parsing.cssinjection = fractalProvisioningCSSInjectionParsing;
	if ( FORoot.getItemByName( "injections" ) == null ) { fractalProvisioningAppendInjectionsNode( FORoot ) };
}
(function(){
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningInjectionProceduresAdding" ); 
})();

function fractalProvisioningAppendInjectionsNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "injections";
	newFO.order = 150;
	newFO.displayName = "Injections";
	FOInstance.appendItem( newFO );
}
function fractalProvisioningCSSInjectionParsing( nodeXML, environmentalAttributes )
{
	var parentNodeType = environmentalAttributes.parentNodeType;
	if ( ( parentNodeType == "site" ) || ( parentNodeType == "web" ) )
	{
		if ( getAttributeValue( nodeXML, 'create' ) != 'false' )
		{
			var nodeUrl = environmentalAttributes.parentNodeUrl;
			var url = environmentalAttributes.url;
			var newFO = new fractalObject();
			newFO.displayName = nodeUrl + " CSS " + url;
			newFO.title = title;
			newFO.type = "css";
			newFO.nodeUrl = nodeUrl;
			newFO.text = url;
			newFO.nodeType = environmentalAttributes.parentNodeType;
			newFO.procedure = fractalProvisioningInjection;
			FORoot.getItemByName( "injections" ).items.push( newFO );
		}
	}
}

function fractalProvisioningInjection()
{
	provisionUserCustomAction( this.type, this.nodeType, this.nodeUrl, this.title, this.text, fractalFree )
}
function provisionUserCustomAction( type, objectType, url, title, text, backFunction )
{
	var context = new SP.ClientContext( preparePath( url ) );
	switch ( objectType )
	{
		case "site" :
		{
			newUserCustomAction = context.get_site().get_userCustomActions().add();
		}
		case "web" :
		{
			newUserCustomAction = context.get_web().get_userCustomActions().add();
		}
	}
	newUserCustomAction.set_title( title );
	switch ( type )
	{
		case "css" :
		{
			newUserCustomAction.set_location( 'ScriptLink' );
			var scriptBlock = "var headID=document.getElementsByTagName( 'head' )[ 0 ];"; 
			scriptBlock += "var newScript=document.createElement( 'link' );"; 
			scriptBlock += "newScript.type='text/css';"; 
			scriptBlock += "newScript.rel='stylesheet';"; 
			scriptBlock += "newScript.href='" + text + "';"; 
			scriptBlock += "headID.appendChild( newScript );";
			newUserCustomAction.set_scriptBlock( scriptBlock );
		}
	}
	newUserCustomAction.update();
	context.executeQueryAsync(
		function ( sender, args ) {
			backFunction();
		},
		function ( sender, args ) {
			alert('Error occured when user custom action provisioning: ' + args.get_message() + '\n' + args.get_stackTrace());
			backFunction();
		});
}