function fractalProvisioningWebsProceduresAdding()
{
	FORoot.parsing.web = fractalProvisioningWebParsing;
	if ( FORoot.getItemByName( "websCreating" ) == null ) { fractalProvisioningAppendWebsCreatingNode( FORoot ) };
	if ( FORoot.getItemByName( "websConfiguring" ) == null ) { fractalProvisioningAppendWebsConfiguringNode( FORoot ) };
}
(function(){
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningWebsProceduresAdding" ); 
})();

function fractalProvisioningAppendWebsCreatingNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "websCreating";
	newFO.order = 30;
	newFO.displayName = "Web sites creation";
	FOInstance.appendItem( newFO );
}
function fractalProvisioningAppendWebsConfiguringNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "websConfiguring";
	newFO.order = 140;
	newFO.displayName = "Certain web sites configuring";
	FOInstance.appendItem( newFO );
}
function fractalProvisioningWebParsing( nodeXML, environmentalAttributes )
{
	var parentNodeType = environmentalAttributes.parentNodeType;
	if ( ( parentNodeType == "site" ) || ( parentNodeType == "web" ) )
	{
		var template = getAttributeValue( nodeXML, 'template' );
		var create = getAttributeValue( nodeXML, 'create' );
		if ( ( template != null ) || ( create == 'true' ) )
		{
			var title = getAttributeValue( nodeXML, 'title' );
			var url = environmentalAttributes.url;
			var language = getAttributeValue( nodeXML, 'language' );
			var template = getAttributeValue( nodeXML, 'template' );
			var description = getAttributeValue( nodeXML, 'description' );
			var ownerGroup = getAttributeValue( nodeXML, 'ownerGroup' );
			var memberGroup = getAttributeValue( nodeXML, 'memberGroup' );
			var visitorGroup = getAttributeValue( nodeXML, 'visitorGroup' );
			var newFO = fractalProvisioningWebCreatingObject( title, url, language, template, description, ownerGroup, memberGroup, visitorGroup );
			if ( newFO != null )
			{
				newFO.displayName = url;
				FORoot.getItemByName( "websCreating" ).items.push( newFO );
			} else alert( "Could not add web configuration because of insufficient attributes" );
		}
		var title = getAttributeValue( nodeXML, 'title' );
		var description = getAttributeValue( nodeXML, 'description' );
		var welcomePage = getAttributeValue( nodeXML, 'welcomePage' );
		var siteLogoUrl = getAttributeValue( nodeXML, 'siteLogoUrl' );
		var css = getAttributeValue( nodeXML, 'css' );
		var colorPaletteUrl = getAttributeValue( nodeXML, 'colorPaletteUrl' );
		var fontSchemeUrl = getAttributeValue( nodeXML, 'fontSchemeUrl' );
		var backgroundImageUrl = getAttributeValue( nodeXML, 'backgroundImageUrl' );
		var shareGenerated = getAttributeValue( nodeXML, 'shareGenerated' );
		if ( checkAnyNotNull( [ title, description, welcomePage, siteLogoUrl, css, colorPaletteUrl, fontSchemeUrl, backgroundImageUrl, shareGenerated ] ) )
		{
			var url = environmentalAttributes.url;
			var newFO = fractalProvisioningWebConfiguringObject( url, title, description, welcomePage, siteLogoUrl, css, colorPaletteUrl, fontSchemeUrl, backgroundImageUrl, shareGenerated );
			if ( newFO != null )
			{
				newFO.displayName = url;
				FORoot.getItemByName( "websConfiguring" ).items.push( newFO );
			} else alert( "Could not create web because of insufficient attributes" );
		}
	}
}
function fractalProvisioningWebCreatingObject( title, url, language, template, description, ownerGroup, memberGroup, visitorGroup )
{
	if ( ( !checkAnyNull( [ url ] ) ) && ( !checkAnyEmpty ( [ title ] ) ) )
	{
		var newFO = new fractalObject();
		newFO.title = title;
		newFO.url = url;
		newFO.language = language;
		if ( ( template != null ) && ( template != "" ) ) 
		{
			newFO.template = template;
		} else {
			newFO.template = "STS#0";
		}
		if ( description != null )
		{
			newFO.description = description;
		} else {
			newFO.description = "";
		}
		newFO.ownerGroup = ownerGroup;
		newFO.memberGroup = memberGroup;
		newFO.visitorGroup = visitorGroup;
		newFO.procedure = fractalProvisioningWebCreating;
		return newFO;
	} else {
		return null;
	}
}
function fractalProvisioningWebConfiguringObject( url, title, description, welcomePage, siteLogoUrl, css, colorPaletteUrl, fontSchemeUrl, backgroundImageUrl, shareGenerated )
{
	if ( !checkAnyNull( [ url ] ) )
	{
		var newFO = new fractalObject();
		newFO.url = url;
		if ( ( title != null ) && ( title != "" ) ) { newFO.title = title; } else { newFO.title = null; }
		if ( description != null ) { newFO.description = description; } else { newFO.description = null; }
		if ( ( welcomePage != null ) && ( welcomePage != "" ) ) { newFO.welcomePage = welcomePage; } else { newFO.welcomePage = null; }
		if ( siteLogoUrl != null ) { newFO.siteLogoUrl = siteLogoUrl; } else { newFO.siteLogoUrl = null; }
		if ( css != null ) { newFO.css = css; } else { newFO.css = null; }
		if ( colorPaletteUrl != null ) { newFO.colorPaletteUrl = colorPaletteUrl; } else { newFO.colorPaletteUrl = null; }
		if ( fontSchemeUrl != null ) { newFO.fontSchemeUrl = fontSchemeUrl; } else { newFO.fontSchemeUrl = null; }
		if ( backgroundImageUrl != null ) { newFO.backgroundImageUrl = backgroundImageUrl; } else { newFO.backgroundImageUrl = null; }
		if ( shareGenerated == 'true' ) { newFO.shareGenerated = 'true'; } else { newFO.shareGenerated = null; }
		newFO.procedure = fractalProvisioningWebConfiguring;
		return newFO;
	} else {
		return null;
	}
}

function fractalProvisioningWebCreating()
{
	if ( this.template ) { var template = this.template; } else { var template = "STS#0" }
	if ( this.title ) { var title = this.title; } else { var title = ""; };
	createWeb( this.url, this.template, this.language, this.title, this.description, this.ownerGroup, this.memberGroup, this.visitorGroup, fractalFree )
}
function fractalProvisioningWebConfiguring()
{
	configureWeb( this.url, this.title, this.description, this.welcomePage, this.siteLogoUrl, this.css, this.colorPaletteUrl, this.fontSchemeUrl, this.backgroundImageUrl, this.shareGenerated, fractalFree )
}
function createWeb( url, template, language, title, description, ownerGroup, memberGroup, visitorGroup, backFunction )
{
	parentWebUrl = url.substring( 0, url.lastIndexOf( '/' ) );
	childWebUrl = url.substring( url.lastIndexOf( '/' ) + 1 )
	context = new SP.ClientContext( preparePath( parentWebUrl ) );
	parentWeb = context.get_web();
	
	var webCreationInfo = new SP.WebCreationInformation();
	webCreationInfo.set_title( title );
	if ( description != "" ) webCreationInfo.set_description( description );
	if ( language != null ) webCreationInfo.set_language( language );
	webCreationInfo.set_url( childWebUrl );
	webCreationInfo.set_useSamePermissionsAsParentSite( !checkAnyNotNull( [ ownerGroup, memberGroup, visitorGroup ] ) );
	webCreationInfo.set_webTemplate( template );

	parentWeb.get_webs().add( webCreationInfo );
	parentWeb.update();
	if ( ( ownerGroup == null ) || ( ownerGroup != "" ) )
	{
		var parentOwnerGroup = parentWeb.get_associatedOwnerGroup();
		context.load( parentOwnerGroup );
	}
	if ( ( memberGroup == null ) || ( memberGroup != "" ) )
	{
		var parentMemberGroup = parentWeb.get_associatedMemberGroup();
		context.load( parentMemberGroup );
	}
	if ( ( visitorGroup == null ) || ( visitorGroup != "" ) )
	{
		var parentVisitorGroup = parentWeb.get_associatedVisitorGroup();
		context.load( parentVisitorGroup );
	}
	context.executeQueryAsync(
		function ( sender, args ) {
			newContext = new SP.ClientContext( url );
			var web = newContext.get_web();
			if ( checkAnyNotNull( [ ownerGroup, memberGroup, visitorGroup ] ) )
			{
				if ( ( ownerGroup != null ) && ( ownerGroup != "" ) )
				{
					var groupCreationInfo = new SP.GroupCreationInformation();
					groupCreationInfo.set_title( ownerGroup.format( title ) );
					var oGroup = web.get_siteGroups().add( groupCreationInfo );
					web.set_associatedOwnerGroup( oGroup );
				} else {
					var ownerGroupObject = web.get_siteGroups().getById( parentOwnerGroup.get_id() )
					web.set_associatedOwnerGroup( ownerGroupObject );
				}
				if ( ( memberGroup != null ) && ( memberGroup != "" ) )
				{
					var groupCreationInfo = new SP.GroupCreationInformation();
					groupCreationInfo.set_title( memberGroup.format( title ) );
					var mGroup = web.get_siteGroups().add( groupCreationInfo );
					web.set_associatedMemberGroup( mGroup );
				} else {
					var memberGroupObject = web.get_siteGroups().getById( parentMemberGroup.get_id() )
					web.set_associatedMemberGroup( memberGroupObject );
				}
				if ( ( visitorGroup != null ) && ( visitorGroup != "" ) )
				{
					var groupCreationInfo = new SP.GroupCreationInformation();
					groupCreationInfo.set_title( visitorGroup.format( title ) );
					var vGroup = web.get_siteGroups().add( groupCreationInfo );
					web.set_associatedVisitorGroup( vGroup );
				} else {
					var visitorGroupObject = web.get_siteGroups().getById( parentVisitorGroup.get_id() )
					web.set_associatedVisitorGroup( visitorGroupObject );
				}
				web.update();
			}
			newContext.executeQueryAsync(
				function ( sender, args ) {
					backFunction()
				},
				function ( sender, args ) {
					alert('Error occured when site groups creating and assigning: ' + args.get_message() + '\n' + args.get_stackTrace());
					backFunction()
				});
		},
		function ( sender, args ) {
			alert( 'Error occured when site creation: ' + args.get_message() + '\n' + args.get_stackTrace() );
			backFunction()
		})
}
function configureWeb( webUrl, title, description, welcomePage, siteLogoUrl, css, colorPaletteUrl, fontSchemeUrl, backgroundImageUrl, shareGenerated, backFunction )
{
	var context = new SP.ClientContext( preparePath( webUrl ) );
	var site = context.get_site();
	context.load( site );
	web = context.get_web();
	context.executeQueryAsync(
		function ( sender, args ) {
			siteUrl = site.get_url();
			if ( ( title != null ) && ( title != "" ) )
			{
				web.set_title( title );
			}
			if ( siteLogoUrl != null )
			{
				web.set_siteLogoUrl( siteUrl + '/' + removeFirstSlash( siteLogoUrl ) );
			}
			if ( description != null )
			{
				web.set_description(description);
			}
			if ( ( welcomePage != null ) && ( welcomePage != "" ) )
			{
				rootFolder = web.get_rootFolder();
				rootFolder.set_welcomePage( welcomePage );
				rootFolder.update();
			}
			if ( css != null )
			{
				web.set_alternateCssUrl( siteUrl + '/' + removeFirstSlash( css ) );
				webProperties = web.get_allProperties();
				webProperties.set_item( '__InheritsAlternateCssUrl', 'False' );
			}
			web.update();
			context.executeQueryAsync(
				function ( sender, args ) {
					AssignTheme( webUrl, colorPaletteUrl, fontSchemeUrl, backgroundImageUrl, shareGenerated, backFunction )
				},
				function ( sender, args ) {
					alert( 'Error occured when web site settings applying: ' + args.get_message() + '\n' + args.get_stackTrace() );
					AssignTheme( webUrl, colorPaletteUrl, fontSchemeUrl, backgroundImageUrl, shareGenerated, backFunction )
				})
		},
		function ( sender, args ) {
			alert( 'Error occured when site opening: ' + args.get_message() + '\n' + args.get_stackTrace() );
			AssignTheme( webUrl, colorPaletteUrl, fontSchemeUrl, backgroundImageUrl, shareGenerated, backFunction )
		})
}
function fractalProvisioningWebsProvisioningProceduresAdding()
{
	FORoot.parsing.websprovisioning = fractalProvisioningWebsProvisioningParsing;
	if ( FORoot.getItemByName( "websRecursive" ) == null ) { fractalProvisioningAppendWebsProvisioningNode( FORoot ) };
}
(function(){ 
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningWebsProvisioningProceduresAdding" ); 
})();

function fractalProvisioningAppendWebsProvisioningNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "websRecursive";
	newFO.order = 130;
	newFO.displayName = "Recursive web provisioning";
	FOInstance.appendItem( newFO );
}
function fractalProvisioningWebsProvisioningParsing( nodeXML, environmentalAttributes )
{
	if ( environmentalAttributes.parentNodeType == 'web' )
	{
		var webUrl = environmentalAttributes.parentNodeUrl;
		var newFO = new fractalObject();
		newFO.displayName = webUrl;
		newFO.url = webUrl;
		newFO.rootPath = webUrl;
		newFO.masterFolder = getAttributeValue( nodeXML, "masterFolder" );
		newFO.masterFile = getAttributeValue( nodeXML, "masterFile" );
		newFO.previewFile = getAttributeValue( nodeXML, "previewFile" );
		newFO.colorPaletteUrl = getAttributeValue( nodeXML, "colorPaletteUrl" );
		newFO.fontSchemeUrl = getAttributeValue( nodeXML, "fontSchemeUrl" );
		newFO.backgroundImageUrl = getAttributeValue( nodeXML, "backgroundImageUrl" );
		newFO.procedure = fractalProvisioningWebsProvisioningProcedure;
		FORoot.getItemByName( "websRecursive" ).items.push( newFO );
	}
}
function fractalProvisioningWebsProvisioningProcedure()
{
	var blockId = "fractal-" + this.id
	if ( ( this.masterFile != null ) && ( this.masterFile != "" ) )
	{
		var newItem = new fractalObject();
		this.items.push( newItem );
		newItem.displayName = "Master Page File Copying";
		newItem.procedure = fractalProvisioningMasterPageCopying;
		newItem.url = this.url;
		newItem.rootPath = this.rootPath;
		newItem.masterFolder = this.masterFolder;
		newItem.masterFile = this.masterFile;
		newItem.renderItem( blockId );
	}
	if ( this.previewFile != "" )
	{
		var newItem = new fractalObject();
		this.items.push( newItem );
		newItem.displayName = "Master Page Preview File Copying";
		newItem.procedure = fractalProvisioningMasterPagePreviewCopying;
		newItem.url = this.url;
		newItem.rootPath = this.rootPath;
		newItem.masterFolder = this.masterFolder;
		newItem.previewFile = this.previewFile;
		newItem.renderItem( blockId );
	}
	if ( this.masterFile != "" )
	{
		var newItem = new fractalObject();
		this.items.push( newItem );
		newItem.displayName = "Master Page Applying";
		newItem.procedure = fractalProvisioningMasterPageApplying;
		newItem.url = this.url;
		newItem.rootPath = this.rootPath;
		newItem.masterFolder = this.masterFolder;
		newItem.masterFile = this.masterFile;
		newItem.renderItem( blockId );
	}
	if ( this.colorPaletteUrl != "" )
	{
		var newItem = new fractalObject();
		this.items.push( newItem );
		newItem.displayName = "Theme Applying";
		newItem.procedure = fractalProvisioningThemeApplying;
		newItem.url = this.url;
		newItem.colorPaletteUrl = this.colorPaletteUrl
		newItem.fontSchemeUrl = this.fontSchemeUrl;
		newItem.backgroundImageUrl = this.backgroundImageUrl;
		newItem.renderItem( blockId );
	}
	var newItem = new fractalObject();
	this.items.push( newItem );
	newItem.displayName = "Sub Webs Enumeration";
	newItem.procedure = fractalProvisioningEnumerateWebs;
	newItem.url = this.url;
	newItem.rootPath = this.rootPath;
	newItem.masterFolder = this.masterFolder;
	newItem.masterFile = this.masterFile;
	newItem.previewFile = this.previewFile;
	newItem.colorPaletteUrl = this.colorPaletteUrl
	newItem.fontSchemeUrl = this.fontSchemeUrl;
	newItem.backgroundImageUrl = this.backgroundImageUrl;
	newItem.rootId = this.id;
	newItem.renderItem( blockId );
	fractalFree();
}

function fractalProvisioningMasterPageCopying()
{
	copyFile( this.rootPath, this.masterFolder + "/" + this.masterFile, this.url, this.masterFolder, null, [], fractalFree )
}
function fractalProvisioningMasterPagePreviewCopying()
{
	copyFile( this.rootPath, this.masterFolder + "/" + this.previewFile, this.url, this.masterFolder, null, [], fractalFree )
}
function fractalProvisioningMasterPageApplying()
{
	AssignMaster( this.url, this.rootPath + '/' + this.masterFolder + '/' + this.masterFile, fractalFree );
}
function fractalProvisioningThemeApplying()
{
	AssignTheme( this.url, this.colorPaletteUrl, this.fontSchemeUrl, this.backgroundImageUrl, "", fractalFree );
}
function AssignMaster( webUrl, masterUrl, backFunction )
{
	masterContext = new SP.ClientContext( preparePath( webUrl ) );
	var masterWeb = masterContext.get_web();
	masterWeb.set_masterUrl( masterUrl );
	masterWeb.set_customMasterUrl( masterUrl );
	masterWeb.update();
	masterContext.executeQueryAsync(
		function ()
		{
			backFunction();
		},
		function ( sender, args )
		{
			alert( 'Error occured when master page assigning: ' + args.get_message() + '\n' + args.get_stackTrace() );
			backFunction()
		});
}
function fractalProvisioningEnumerateWebs()
{
	var currentObject = this;
	var context = new SP.ClientContext( preparePath( this.url ) );
	var parentWeb = context.get_web();
	var webCollection = parentWeb.getSubwebsForCurrentUser( null );
	context.load( webCollection );
	context.executeQueryAsync(
		function ()
		{
			var blockId = "fractal-" + currentObject.rootId;
			var webEnumerator = webCollection.getEnumerator();
			while ( webEnumerator.moveNext() )
			{
				var web = webEnumerator.get_current();
				var webUrl = web.get_serverRelativeUrl();
				var newFO = new fractalObject();
				newFO.displayName = webUrl;
				newFO.url = webUrl;
				newFO.rootPath = currentObject.rootPath;
				newFO.masterFolder = currentObject.masterFolder;
				newFO.masterFile = currentObject.masterFile;
				newFO.previewFile = currentObject.previewFile;
				newFO.colorPaletteUrl = currentObject.colorPaletteUrl;
				newFO.fontSchemeUrl = currentObject.fontSchemeUrl;
				newFO.backgroundImageUrl = currentObject.backgroundImageUrl;
				newFO.procedure = fractalProvisioningWebsProvisioningProcedure;
				FORoot.getItemByName( "websRecursive" ).items.push( newFO );
				newFO.renderItem( blockId );
			}
			fractalFree()
		},
		function ( sender, args )
		{
			alert( 'Failed to enumerate subwebs: ' + args.get_message() + '\n' + args.get_stackTrace() );
			fractalFree();
		});
}
function AssignTheme( webUrl, colorPaletteUrl, fontSchemeUrl, backgroundImageUrl, shareGenerated, backFunction )
{
	if ( checkAnyNotNull( [ colorPaletteUrl, fontSchemeUrl, backgroundImageUrl ] ) )
	{
		var context = new SP.ClientContext( preparePath( webUrl ) );
		var site = context.get_site();
		context.load( site );
		context.executeQueryAsync(
			function ()
			{
				var web = context.get_web();
				siteUrl = site.get_url();
				fullColorPaletteUrl = '';
				fullFontSchemeUrl = '';
				fullBackgroundImageUrl = '';
				if ( ( colorPaletteUrl != null ) && ( colorPaletteUrl != '' ) ) fullColorPaletteUrl = makeRelative( siteUrl ) + '/_catalogs/theme/15/' + removeFirstSlash( colorPaletteUrl );
				if ( ( fontSchemeUrl != null ) && ( fontSchemeUrl != '' ) ) fullFontSchemeUrl = '/_catalogs/theme/15/' + removeFirstSlash( fontSchemeUrl );
				if ( ( backgroundImageUrl != null ) && ( backgroundImageUrl != '' ) ) fullBackgroundImageUrl = '/' + removeFirstSlash( backgroundImageUrl );
				web.applyTheme( fullColorPaletteUrl, fullFontSchemeUrl, fullBackgroundImageUrl, shareGenerated );
				web.update();
				context.executeQueryAsync(
					function ()
					{
						backFunction();
					},
					function ( sender, args )
					{
						alert( 'Error occured when theme assigning: ' + args.get_message() + '\n' + args.get_stackTrace() );
						backFunction();
					});
			},
			function ( sender, args )
			{
				alert( 'Error occured while site opening: ' + args.get_message() + '\n' + args.get_stackTrace() );
				backFunction();
			});
	} else backFunction();
}