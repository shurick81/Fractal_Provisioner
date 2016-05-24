function fractalProvisioningPermissionsProceduresAdding()
{
	FORoot.parsing.permissions = fractalProvisioningPermissionsParsing;
	if ( FORoot.getItemByName( "permissions" ) == null ) { fractalProvisioningAppendPermissionsNode( FORoot ) };
}
(function(){ 
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningPermissionsProceduresAdding" ); 
})();

function fractalProvisioningAppendPermissionsNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "permissions";
	newFO.order = 160;
	newFO.displayName = "Setting permissions";
	FOInstance.appendItem( newFO );
}
function fractalProvisioningPermissionsParsing( nodeXML, environmentalAttributes )
{
	if ( ( environmentalAttributes.parentNodeType == 'web' ) || ( environmentalAttributes.parentNodeType == 'list' ) )
	{
		var objectType = environmentalAttributes.parentNodeType;
		var url = environmentalAttributes.url;
		var webUrl = environmentalAttributes.webUrl;
		if ( getAttributeValue( nodeXML, "clear" ) == 'true' ) { var clear = true } else { var clear = false };
		xmlEntrieNodes = nodeXML.getElementsByTagName( "PermissionEntry" );
		var entries = [];
		for ( var i = 0; i < xmlEntrieNodes.length; i++ )
		{
			var subjectType = getAttributeValue( xmlEntrieNodes[ i ], "subjectType" );
			var subject = getAttributeValue( xmlEntrieNodes[ i ], "subject" );
			var accessLevels = getAttributeValue( xmlEntrieNodes[ i ], "accessLevels" ).split( "," );
			entries.push( { "subjectType": subjectType, "subject": subject, "accessLevels": accessLevels } );
		}
		var newFO = fractalProvisioningPermissionsConfiguringObject( objectType, url, clear, entries, webUrl );
		if ( newFO != null )
		{
			newFO.displayName = url;
			FORoot.getItemByName( "permissions" ).items.push( newFO );
		}
	}
}
function fractalProvisioningPermissionsConfiguringObject( objectType, url, clear, entries, webUrl )
{
	if ( !checkAnyEmpty( [ objectType, url, entries, webUrl ] ) )
	{
		var newFO = new fractalObject();
		newFO.objectType = objectType;
		newFO.url = url;
		newFO.clear = clear;
		newFO.entries = entries;
		newFO.webUrl = webUrl;
		newFO.procedure = fractalProvisioningPermissionsObjectOpening;
		return newFO;
	} else { return null }
}

function fractalProvisioningPermissionsObjectOpening()
{
	currentObject = this;
	var context = new SP.ClientContext( preparePath( this.webUrl ) );
	var web = context.get_web();
	if ( this.objectType == "web" )
	{
		context.load( web, 'HasUniqueRoleAssignments' );
		context.executeQueryAsync(
			function( sender, args )
			{
				fractalProvisioningConfigurePermissions( context, web, currentObject.entries, currentObject.clear, fractalFree );
			},
			function( sender, args )
			{
				alert( 'Error while web site permissions inheritance opening : ' + args.get_message() + '\n' + args.get_stackTrace() );
				fractalFree();
			});
	} else {
		var lists = context.get_web().get_lists();
		context.load( lists, 'Include(Id,RootFolder,HasUniqueRoleAssignments)' );
		context.executeQueryAsync(
			function ( sender, args )
			{
				var listEnumerator = lists.getEnumerator();
				var foundList = null;
				while ( listEnumerator.moveNext() ) {
					var list = listEnumerator.get_current();
					if ( list.get_rootFolder().get_serverRelativeUrl().toLowerCase() == currentObject.url.toLowerCase() )
					{
						var foundList = list;
						break;
					}
				}
				if ( foundList != null )
				{
					fractalProvisioningConfigurePermissions( context, foundList, currentObject.entries, currentObject.clear, fractalFree );
				} else {
					alert( 'List has not been found' );
					fractalFree();
				}
			},
			function( sender, args )
			{
				alert( 'Error while lists reading : ' + args.get_message() + '\n' + args.get_stackTrace() );
				fractalFree();
			});
	}
}
function fractalProvisioningConfigurePermissions( context, object, entries, clear, backFunction )
{
	var hasUniqueAssgns = object.get_hasUniqueRoleAssignments();
	if ( !hasUniqueAssgns )
	{
		object.breakRoleInheritance( true );
	}
	if ( clear )
	{
		var assignments = object.get_roleAssignments();
		context.load( assignments )
	}
	context.executeQueryAsync(
		function( sender, args )
		{
			if ( clear )
			{
				var tempAssignments = [];
				var assignmentsEnumerator = assignments.getEnumerator();
				while ( assignmentsEnumerator.moveNext() )
				{
					tempAssignments.push( assignmentsEnumerator.get_current() );
				}
				for( var i = 0; i < tempAssignments.length; i++ )
				{
					tempAssignments[ i ].deleteObject();
				}
			}
			for ( var i = 0; i < entries.length; i++ )
			{
				var subjectType = entries[ i ].subjectType;
				var subjectName = entries[ i ].subject;
				if ( subjectType == "group" )
				{
					var subject = context.get_web().get_siteGroups().getByName( subjectName );
				} else if ( subjectType == "associatedGroup" )
				{
					if ( subjectName == "owners" )
					{
						var subject = context.get_web().get_associatedOwnerGroup()
					} else if ( subjectName == "members" )
					{
						var subject = context.get_web().get_associatedMemberGroup()
					} else if( subjectName == "visitors" )
					{
						var subject = context.get_web().get_associatedVisitorGroup()
					}
				} else {
					var subject = context.get_web().get_siteUsers().getByLoginName( subjectName );
				}
				var roleDefBindingColl = SP.RoleDefinitionBindingCollection.newObject( context );
				accessLevels = entries[ i ].accessLevels;
				for ( var n = 0; n < accessLevels.length; n++ )
				{
					roleDefBindingColl.add( context.get_web().get_roleDefinitions().getByType( SP.RoleType[ accessLevels[ n ] ] ) );
				}
				object.get_roleAssignments().add( subject, roleDefBindingColl );
			}
			context.executeQueryAsync(
				function( sender, args )
				{
					backFunction();
				},
				function( sender, args )
				{
					alert( 'Error while permissions applying: ' + args.get_message() + '\n' + args.get_stackTrace() );
					backFunction();
				});
		},
		function( sender, args )
		{
			alert( 'Error while permissions applying: ' + args.get_message() + '\n' + args.get_stackTrace() );
			backFunction();
		});
}