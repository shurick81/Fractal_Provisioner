function fractalProvisioningWebPartsAddingProceduresAdding()
{
	FORoot.parsing.webpart = webPartParsing;
	if ( FORoot.getItemByName( "webPartsAdding" ) == null ) { appendWebPartAddingNode( FORoot ) };
	FORoot.getItemByName( "webPartsAdding" ).webPartAddingProcedure = webPartAddingProcedure;
}
(function(){ 
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningWebPartsAddingProceduresAdding" ); 
})();

function appendWebPartAddingNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "webPartsAdding";
	newFO.order = 100;
	newFO.displayName = "Adding WebParts"
	newFO.proceduresByType = { };
	FOInstance.appendItem( newFO );
}
function webPartParsing( webPartXML, environmentalAttributes )
{
	if ( environmentalAttributes.parentNodeType == 'page' )
	{
		var newWebPartItem = webPartAddingObject();
		var pageUrl = environmentalAttributes.parentNodeUrl;
		var attributes = webPartXML.attributes;
		var webPartType = attributes[ 'type' ].value;
		newWebPartItem.displayName = pageUrl + ' : ' + webPartType
		newWebPartItem.shared.pageUrl = pageUrl;
		newWebPartItem.shared.webUrl = environmentalAttributes.webUrl;
		newWebPartItem.shared.zoneID = attributes[ 'zoneID' ].value;
		newWebPartItem.shared.partOrder = attributes[ 'partOrder' ].value;
		newWebPartItem.shared.title = getAttributeValue( webPartXML, "title" );
		var description = getAttributeValue( webPartXML, "description" );
		if ( description == null ) { description = "" }
		newWebPartItem.shared.description = description;
		var titleUrl = getAttributeValue( webPartXML, "titleUrl" );
		if ( titleUrl == null ) { titleUrl = "" }
		newWebPartItem.shared.titleUrl = titleUrl;
		newWebPartItem.shared.xml = webPartXML;
		FORoot.getItemByName( "webPartsAdding" ).items.push( newWebPartItem )
	}
}
function webPartAddingProcedure()
{
	customProcedure = FORoot.getItemByName( "webPartsAdding" ).proceduresByType[ this.shared.xml.attributes[ 'type' ].value ].procedure;
	if ( customProcedure != null )
	{
		this.customProcedureInstance = customProcedure;
		this.customProcedureInstance();
	} else {
		var blockId = "fractal-" + this.id
		var newItem = new fractalObject();
		newItem.name = "buildXML";
		this.shared.added = false;
		this.items.push( newItem );
		this.getItemByName( "buildXML" ).displayName = "Building Web Part XML";
		this.getItemByName( "buildXML" ).procedure = FORoot.getItemByName( "webPartsAdding" ).proceduresByType[ this.shared.xml.attributes[ 'type' ].value ].buildXML;
		this.getItemByName( "buildXML" ).shared = this.shared;
		this.getItemByName( "buildXML" ).renderItem( blockId );
		var newItem = new fractalObject();
		newItem.name = "addToPage";
		this.items.push( newItem );
		this.getItemByName( "addToPage" ).displayName = "Adding Web Part to page";
		this.getItemByName( "addToPage" ).procedure = addWebPartToPage;
		this.getItemByName( "addToPage" ).shared = this.shared;
		this.getItemByName( "addToPage" ).renderItem( blockId );
		var newItem = new fractalObject();
		newItem.name = "publishPage";
		this.items.push( newItem );
		this.getItemByName( "publishPage" ).displayName = "Publishing Page";
		this.getItemByName( "publishPage" ).procedure = publishPageAfterWebPartAdding;
		this.getItemByName( "publishPage" ).shared = this.shared;
		this.getItemByName( "publishPage" ).renderItem( blockId );
	}
	fractalFree()
}
function webPartAddingObject()
{
	var newFO = new fractalObject();
	newFO.shared = { }
	newFO.shared.WPProperties = [];
	newFO.procedure = FORoot.getItemByName( "webPartsAdding" ).webPartAddingProcedure;
	return newFO;
}
function addWebPartToPage()
{
	var isWiki = false;
	var currentObject = this;
	var WPProperties = this.shared.WPProperties;
	var context = new SP.ClientContext( preparePath( this.shared.webUrl ) );
	var page = context.get_web().getFileByServerRelativeUrl( this.shared.pageUrl );
	var pageItem = page.get_listItemAllFields();
	context.load( page );
	context.load( pageItem );
	context.executeQueryAsync(
		function( sender, args )
		{
			var pageCT = pageItem.get_fieldValues()[ "ContentTypeId" ];
			if ( typeof pageCT != "undefined" )
			{
				isWiki = ( pageCT.get_stringValue().indexOf( "0x010108" ) == 0 )
			}
			if ( isWiki )
			{
				var wikiField = pageItem.get_item( "WikiField" );
				var webParts = page.getLimitedWebPartManager( SP.WebParts.PersonalizationScope.shared ).get_webParts();
				context.load( webParts );
			}
			context.executeQueryAsync(
				function( sender, args )
				{
					if ( isWiki )
					{
						var partIds = [];
						for( var i = 0; i < webParts.get_count(); i++ )
						{
							partIds.push( webParts.get_item( i ).get_id().toString() )
						}
					}
					if ( page.get_checkOutType() == SP.CheckOutType.none )
					{
						page.checkOut()
					}
					var limitedWebPartManager = page.getLimitedWebPartManager( SP.WebParts.PersonalizationScope.shared );
					var webPartDefinition = limitedWebPartManager.importWebPart( currentObject.shared.webPartMarkup );
					if ( WPProperties.length > 0 )
					{
						var webPartProperties = webPartDefinition.get_webPart().get_properties();
						WPProperties.forEach( function( WPProperty ) { webPartProperties.set_item( WPProperty.name, WPProperty.value ); });
					}
					webPart = webPartDefinition.get_webPart();
					if ( !isWiki )
					{
						limitedWebPartManager.addWebPart( webPart, currentObject.shared.zoneID, currentObject.shared.partOrder );
					} else {
						limitedWebPartManager.addWebPart( webPart, "wpz", 1 );
					}
					context.load( webPart );
					context.executeQueryAsync(
						function( sender, args )
						{
							if ( isWiki )
							{
								var webParts = page.getLimitedWebPartManager( SP.WebParts.PersonalizationScope.shared ).get_webParts();
								context.load( webParts );
								context.executeQueryAsync(
									function( sender, args )
									{
										var newPartId = null;
										for( var i = 0; i < webParts.get_count(); i++ )
										{
											var isFound = false;
											var tempPartId = webParts.get_item( i ).get_id();
											for( var n = 0; n < partIds.length; n++ )
											{
												if ( partIds[ n ] == tempPartId ) { isFound = true; break; }
											}
											if ( !isFound )
											{
												newPartId = tempPartId;
												break;
											}
										}
										var htmlObject = document.createElement( 'div' );
										htmlObject.innerHTML = wikiField;
										var zoneNumber = parseInt( currentObject.shared.zoneID );
										var partOrder = parseInt( currentObject.shared.partOrder );
										var zoneObject = htmlObject.getElementsByClassName( "ms-rte-layoutszone-inner" )[ zoneNumber ];

										var outerBlock = document.createElement( 'div' );
										outerBlock.setAttribute( "class", "ms-rtestate-read ms-rte-wpbox" );
										outerBlock.setAttribute( "contenteditable", "false" );
										var innerBlock = document.createElement( 'div' );
										innerBlock.setAttribute( "class", "ms-rtestate-notify ms-rtestate-read " + newPartId );
										innerBlock.setAttribute( "id", "div_" + newPartId );
										outerBlock.appendChild( innerBlock );
										var hiddenBlock = document.createElement( 'div' );
										hiddenBlock.setAttribute( "id", "vid_" + newPartId );
										hiddenBlock.setAttribute( "style", "display: none;" );
										outerBlock.appendChild( hiddenBlock );
						
										var existingBlocks = zoneObject.childNodes;
										if ( partOrder < existingBlocks.length )
										{
											zoneObject.insertBefore( outerBlock, existingBlocks[ partOrder ] );
										} else {
											zoneObject.appendChild( outerBlock );
										}
										newHtml = htmlObject.innerHTML;
										pageItem.set_item( "WikiField", newHtml )
										pageItem.update()
										context.executeQueryAsync(
											function( sender, args )
											{
												//Successfully added web part
												currentObject.shared.added = true;
												fractalFree();
											},
											function( sender, args )
											{
												alert( 'Error occured when page layout updating: ' + args.get_message() + '\n' + args.get_stackTrace() );
												fractalFree();
											});	
									},
									function( sender, args )
									{
										alert( 'Error occured when added web part reading: ' + args.get_message() + '\n' + args.get_stackTrace() );
										fractalFree();
									});
							} else {
								//Successfully added web part
								currentObject.shared.added = true;
								fractalFree();
							}
						},
						function( sender, args )
						{
							alert( 'Error occured when web part adding: ' + args.get_message() + '\n' + args.get_stackTrace() );
							fractalFree();
						});
				},
				function( sender, args )
				{
					alert( 'Error occured when existing web parts reading: ' + args.get_message() + '\n' + args.get_stackTrace() );
					fractalFree();
				});
		},
		function( sender, args )
		{
			alert( 'Error occured when page opening: ' + args.get_message() + '\n' + args.get_stackTrace() );
			fractalFree();
		});
}


function publishPageAfterWebPartAdding()
{
	publishFile( this.shared.webUrl, this.shared.pageUrl, fractalFree );
}


/* PictureLibrarySlideshowWebPart */
function pictureLibrarySlideshowWebPart_BuildXML()
{
	currentObject = this;
	var webUrl = this.shared.webUrl;
	var listUrl = getAttributeValue( this.shared.xml, 'listUrl' );
	var viewUrl = getAttributeValue( this.shared.xml, 'viewUrl' );
	var layout = getAttributeValue( this.shared.xml, 'layout' );
	var mode = getAttributeValue( this.shared.xml, 'mode' );
	var showToolbar = getAttributeValue( this.shared.xml, 'showToolbar' );
	var speed = getAttributeValue( this.shared.xml, 'speed' );
	var chromeType = getAttributeValue( this.shared.xml, 'chromeType' );

	var context = new SP.ClientContext( preparePath( this.shared.webUrl ) );
	var lists = context.get_web().get_lists();
	context.load( lists, 'Include(Id,RootFolder)' );
	context.executeQueryAsync(
		function ( sender, args )
		{
			var listEnumerator = lists.getEnumerator();
			var list = null;
			var listId = null;
			while ( listEnumerator.moveNext() ) {
				list = listEnumerator.get_current();
				if ( list.get_rootFolder().get_serverRelativeUrl().toLowerCase() == ( webUrl + listUrl ).toLowerCase() )
				{
					listId = list.get_id().toString();
					break;
				}
			}
			if ( listId != null )
			{
				var views = list.get_views();
				context.load( views, 'Include(Id,ServerRelativeUrl )' );
				context.executeQueryAsync(
					function ( sender, args )
					{
						var viewEnumerator = views.getEnumerator();
						var view = null;
						var viewId = null;
						while ( viewEnumerator.moveNext() ) {
							view = viewEnumerator.get_current();
							if ( view.get_serverRelativeUrl().toLowerCase() == ( webUrl + listUrl + viewUrl ).toLowerCase() )
							{
								viewId = view.get_id().toString();
								break;
							}
						}
						if ( viewId != null )
						{
							currentObject.shared.webPartMarkup = pictureLibrarySlideshowWebPartXML( currentObject.shared.title, currentObject.shared.titleUrl, currentObject.shared.description, listId, viewId, layout, mode, showToolbar, speed, chromeType );
							fractalFree();
						} else {
							alert( 'List view has not been found' );
							fractalFree();
						}
					},
					function ( sender, args )
					{
						alert( 'Failed to read views ' + args.get_message() + '\n' + args.get_stackTrace() );
						fractalFree();
					});
			} else {
				alert( 'List has not been found' );
				fractalFree();
			}
		},
		function ( sender, args )
		{
			alert( 'Failed to read lists ' + args.get_message() + '\n' + args.get_stackTrace() );
			fractalFree();
		});
}
function pictureLibrarySlideshowWebPartXML( title, titleUrl, description, libraryGuid, viewGuid, layout, mode, showToolbar, speed, chromeType )
{
	result='<webParts>\
		<webPart xmlns="http://schemas.microsoft.com/WebPart/v3">\
			<metaData>\
				<type name="Microsoft.SharePoint.WebPartPages.PictureLibrarySlideshowWebPart, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" />\
				<importErrorMessage>Cannot import this Web Part.</importErrorMessage>\
			</metaData>\
			<data>\
				<properties>\
					<property name="Title" type="string">' + title + '</property>\
					<property name="TitleUrl" type="string">' + titleUrl + '</property>\
					<property name="Description" type="string">' + description + '</property>\
					<property name="LibraryGuid" type="System.Guid, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089">' + libraryGuid + '</property>\
					<property name="ViewGuid" type="System.Guid, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089">' + viewGuid + '</property>\
					<property name="Layout" type="Microsoft.SharePoint.WebPartPages.SPPictureLibrarySlideshowDisplayStyle, Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c">' + layout + '</property>\
					<property name="Mode" type="Microsoft.SharePoint.WebPartPages.SPPictureLibrarySlideshowMode, Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c">' + mode + '</property>\
					<property name="ShowToolbar" type="bool">' + showToolbar + '</property>\
					<property name="ChromeType" type="chrometype">' + chromeType + '</property>\
					<property name="Speed" type="int">' + speed + '</property>\
				</properties>\
			</data>\
		</webPart>\
	</webParts>'
	return result;
}

/* contactFieldControl */

function contactFieldControl_BuildXML()
{
	var currentObject = this;
	var attributes = this.shared.xml.attributes;
	var contactLoginName = attributes[ 'contactLoginName' ].value
	var context = new SP.ClientContext( preparePath( this.shared.webUrl ) );
	var user = context.get_web().ensureUser( contactLoginName );
	context.load( user );
	context.executeQueryAsync(
		function ( sender, args )
		{
			currentObject.shared.webPartMarkup = contactWebPartXml( attributes[ 'title' ].value, contactLoginName );
			fractalFree();
		},
		function ( sender, args )
		{
			alert( 'Error occured ensuring user: ' + args.get_message() + '\n' + args.get_stackTrace() );
			currentObject.shared.webPartMarkup = contactWebPartXml( attributes[ 'title' ].value, contactLoginName );
			fractalFree();
		});
}
function contactWebPartXml( title, contactLoginName )
{
	result='<?xml version="1.0" encoding="utf-8"?>\
<WebPart xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/WebPart/v2">\
  <Title>' + title + '</Title>\
  <FrameType>TitleBarOnly</FrameType>\
  <Description>Displays details about a contact for this page or site.</Description>\
  <IsIncluded>true</IsIncluded>\
  <FrameState>Normal</FrameState>\
  <Height />\
  <Width />\
  <AllowRemove>true</AllowRemove>\
  <AllowZoneChange>true</AllowZoneChange>\
  <AllowMinimize>true</AllowMinimize>\
  <AllowConnect>true</AllowConnect>\
  <AllowEdit>true</AllowEdit>\
  <AllowHide>true</AllowHide>\
  <IsVisible>true</IsVisible>\
  <DetailLink />\
  <HelpLink />\
  <HelpMode>Modeless</HelpMode>\
  <Dir>Default</Dir>\
  <PartImageSmall />\
  <MissingAssembly>Cannot import this Web Part.</MissingAssembly>\
  <PartImageLarge>/_layouts/images/wp_pers.gif</PartImageLarge>\
  <IsIncludedFilter />\
  <Assembly>Microsoft.SharePoint.Portal, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c</Assembly>\
  <TypeName>Microsoft.SharePoint.Portal.WebControls.ContactFieldControl</TypeName>\
  <CacheTimeout xmlns="urn:schemas-microsoft-com:sharepoint:CacheableWebPart">600</CacheTimeout>\
  <ContactLoginName xmlns="urn:schemas-microsoft-com:contactfieldcontrol">' + contactLoginName + '</ContactLoginName>\
</WebPart>';
	return result;
}


/* ExcelWebRenderer */

function excelWebRenderer_BuildXML()
{
	var attributes = this.shared.xml.attributes;
	this.shared.webPartMarkup = excelWebPartXml( attributes[ 'title' ].value, attributes[ 'workbookUri' ].value, attributes[ 'chromeType' ].value );
	fractalFree();
}
function excelWebPartXml( title, workbookUri, chromeType )
{
	result='<webParts>\
  <webPart xmlns="http://schemas.microsoft.com/WebPart/v3">\
    <metaData>\
      <type name="Microsoft.Office.Excel.WebUI.ExcelWebRenderer, Microsoft.Office.Excel.WebUI, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" />\
      <importErrorMessage>Cannot import this Web Part.</importErrorMessage>\
    </metaData>\
    <data>\
      <properties>\
        <property name="ChromeState" type="chromestate">Normal</property>\
        <property name="AllowInExcelOperations" type="bool">False</property>\
        <property name="AllowMinimize" type="bool">True</property>\
        <property name="Height" type="string" />\
        <property name="ShowAgaveTaskPanes" type="bool">False</property>\
        <property name="ShowWorkbookParameters" type="bool">True</property>\
        <property name="AllowInteractivity" type="bool">False</property>\
        <property name="AllowConnect" type="bool">True</property>\
        <property name="TypingAndFormulaEntry" type="bool">False</property>\
        <property name="ExportMode" type="exportmode">All</property>\
        <property name="AutoGenerateTitle" type="bool">False</property>\
        <property name="WorkbookUri" type="string">' + workbookUri + '</property>\
        <property name="AllowHide" type="bool">True</property>\
        <property name="AllowClose" type="bool">True</property>\
        <property name="ChromeType" type="chrometype">' + chromeType + '</property>\
        <property name="TitleUrl" type="string" />\
        <property name="AllowEdit" type="bool">True</property>\
        <property name="HelpUrl" type="string" />\
        <property name="AllowHyperlinks" type="bool">True</property>\
        <property name="HelpMode" type="helpmode">Modeless</property>\
        <property name="AutoGenerateDetailLink" type="bool">False</property>\
        <property name="AllowSorting" type="bool">True</property>\
        <property name="Description" type="string">Use the Excel Web Access Web Part to interact with an Excel workbook as a Web page.</property>\
        <property name="CatalogIconImageUrl" type="string">/_layouts/15/images/ewr023.gif</property>\
        <property name="AllowPivotSpecificOperations" type="bool">True</property>\
        <property name="TitleIconImageUrl" type="string">/_layouts/15/images/ewr023.gif</property>\
        <property name="Direction" type="direction">NotSet</property>\
        <property name="AllowManualDataRefresh" type="bool">True</property>\
        <property name="AllowZoneChange" type="bool">True</property>\
        <property name="ToolbarStyle" type="Microsoft.Office.Excel.WebUI.ToolbarVisibilityStyle, Microsoft.Office.Excel.WebUI, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c">None</property>\
        <property name="ShowPivotFieldList" type="bool">False</property>\
        <property name="AllowRecalculation" type="bool">True</property>\
        <property name="MissingAssembly" type="string">Cannot import this Web Part.</property>\
        <property name="Width" type="string" />\
        <property name="AllowParameterModification" type="bool">True</property>\
        <property name="ShowVisibleItemButton" type="bool">False</property>\
        <property name="Hidden" type="bool">False</property>\
        <property name="Title" type="string">' + title + '</property>\
        <property name="AllowPeriodicDataRefresh" type="bool">True</property>\
        <property name="AllowFiltering" type="bool">True</property>\
        <property name="VisibleItem" type="string" />\
      </properties>\
    </data>\
  </webPart>\
</webParts>'
	return result;
}


/* MicroFeedWebPart */

function microFeedWebPart_BuildXML()
{
	var attributes = this.shared.xml.attributes;
	this.shared.webPartMarkup = newsFeedWebPartXml( attributes[ 'title' ].value, attributes[ 'frameType' ].value );
	fractalFree();
}
function newsFeedWebPartXml( title, frameType )
{
	result='<?xml version="1.0" encoding="utf-8"?>\
<WebPart xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/WebPart/v2">\
  <Title>' + title + '</Title>\
  <FrameType>' + frameType + '</FrameType>\
  <Description>Displays conversations and event notifications from content and people you follow across SharePoint sites, and lets users send short, publicly-viewable messages.</Description>\
  <IsIncluded>true</IsIncluded>\
  <FrameState>Normal</FrameState>\
  <AllowRemove>true</AllowRemove>\
  <AllowZoneChange>true</AllowZoneChange>\
  <AllowMinimize>true</AllowMinimize>\
  <AllowConnect>true</AllowConnect>\
  <AllowEdit>true</AllowEdit>\
  <AllowHide>true</AllowHide>\
  <IsVisible>true</IsVisible>\
  <HelpMode>Modeless</HelpMode>\
  <Dir>Default</Dir>\
  <MissingAssembly>Cannot import this Web Part.</MissingAssembly>\
  <PartImageLarge>/_layouts/images/wp_pers.gif</PartImageLarge>\
  <Assembly>Microsoft.SharePoint.Portal, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c</Assembly>\
  <TypeName>Microsoft.SharePoint.Portal.WebControls.MicroFeedWebPart</TypeName>\
</WebPart>'
	return result;
}


/* XsltListViewWebPart */

function xsltListViewWebPart_Procedure()
{
	var blockId = "fractal-" + this.id
	var newItem = new fractalObject();
	newItem.name = "buildXML";
	this.items.push( newItem );
	this.shared.added = false;
	this.getItemByName( "buildXML" ).displayName = "Building Web Part XML";
	this.getItemByName( "buildXML" ).procedure = FORoot.getItemByName( "webPartsAdding" ).proceduresByType[ this.shared.xml.attributes[ 'type' ].value ].buildXML;
	this.getItemByName( "buildXML" ).shared = this.shared;
	this.getItemByName( "buildXML" ).renderItem( blockId );
	var newItem = new fractalObject();
	newItem.name = "addToPage";
	this.items.push( newItem );
	this.getItemByName( "addToPage" ).displayName = "Adding Web Part to page";
	this.getItemByName( "addToPage" ).procedure = addWebPartToPage;
	this.getItemByName( "addToPage" ).shared = this.shared;
	this.getItemByName( "addToPage" ).renderItem( blockId );
	var newItem = new fractalObject();
	newItem.name = "postAdding";
	this.items.push( newItem );
	this.getItemByName( "postAdding" ).displayName = "Additional activity after Web Part is added";
	this.getItemByName( "postAdding" ).procedure = FORoot.getItemByName( "webPartsAdding" ).proceduresByType[ this.shared.xml.attributes[ 'type' ].value ].postAdding;
	this.getItemByName( "postAdding" ).shared = this.shared;
	this.getItemByName( "postAdding" ).renderItem( blockId )
	var newItem = new fractalObject();
	newItem.name = "publishPage";
	this.items.push( newItem );
	this.getItemByName( "publishPage" ).displayName = "Publishing Page";
	this.getItemByName( "publishPage" ).procedure = publishPageAfterWebPartAdding;
	this.getItemByName( "publishPage" ).shared = this.shared;
	this.getItemByName( "publishPage" ).renderItem( blockId )
}
function xsltListViewWebPart_BuildXML()
{
	currentObject = this;
	var attributes = this.shared.xml.attributes;
	var listWebUrl = attributes[ 'listWebUrl' ].value
	var listUrl = attributes[ 'listUrl' ].value
	var listContext = new SP.ClientContext( preparePath( listWebUrl ) );
	this.shared.listContext = listContext;
	
	var lists = listContext.get_web().get_lists();
	listContext.load( lists, 'Include(Id,RootFolder)' );
	
	var listSite = listContext.get_site();
	listContext.load( listSite );
	listContext.executeQueryAsync(
		function ( sender, args )
		{
			var listEnumerator = lists.getEnumerator();
			var list = null;
			var listId = null;
			while ( listEnumerator.moveNext() ) {
				list = listEnumerator.get_current();
				if ( list.get_rootFolder().get_serverRelativeUrl().toLowerCase() == ( listWebUrl + listUrl ).toLowerCase() )
				{
					listId = list.get_id();
					break;
				}
			}
			if ( listId != null )
			{
				currentObject.shared.wpid = SP.Guid.newGuid().toString();
				var JSLink = ""
				var jsFile = attributes[ 'jsFile' ].value
				if ( jsFile != "" )
				{
					JSLink = "~sitecollection" + getRelativePath( listSite.get_url(), listWebUrl ) + listUrl + "/" + getFileNameFromUrl( jsFile ).addBeforeExtension( currentObject.shared.wpid );
				}
				currentObject.shared.JSLink = JSLink;
				var xmlDefinition = "";
				xmlDefinitionNodes = currentObject.shared.xml.getElementsByTagName( "XmlDefinition" );
				if ( xmlDefinitionNodes.length > 0 ) { xmlDefinition = encodeXml( getInnerXMLAsString( xmlDefinitionNodes[ 0 ] ) ); }
				currentObject.shared.webPartMarkup = listViewWebPartXml( listId, xmlDefinition, attributes[ 'noAnnouncements' ].value, attributes[ 'noAnnouncementsHowTo' ].value, currentObject.shared.wpid, JSLink, attributes[ 'chromeType' ].value );
				currentObject.shared.list = list;
				currentObject.shared.WPProperties.push( { name: "JSLink", value: JSLink } );
				fractalFree();
			} else {
				alert( 'List is not found' );
				fractalFree();
			}
		},
		function ( sender, args )
		{
			alert( 'Failed to read lists ' + args.get_message() + '\n' + args.get_stackTrace() );
			fractalFree();
		});
}
function listViewWebPartXml( listId, xmlDefinition, noAnnouncements, noAnnouncementsHowTo, webPartTitle, JSLink, chromeType )
{
	var result = '<?xml version=\"1.0\" encoding=\"utf-8\"?>' +
		'<webParts>' +
		  '<webPart xmlns=\"http://schemas.microsoft.com/WebPart/v3\">' +
		    '<metaData>' +
		      '<type name=\"Microsoft.SharePoint.WebPartPages.XsltListViewWebPart, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c\" />' +
		      '<importErrorMessage>Cannot import this Web Part.</importErrorMessage>' +
		    '</metaData>' +
		    '<data>' +
		      '<properties>' +
		        '<property name=\"ListId\" type=\"System.Guid, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089\">' + listId + '</property>' +
		        '<property name=\"ListName\" type=\"string\">{' + listId + '}</property>' +
				'<property name=\"InplaceSearchEnabled\" type=\"bool\">False</property>' +
				'<property name=\"ExportMode\" type=\"exportmode\">All</property>' +
		        '<property name=\"ChromeType\" type=\"chrometype\">' + chromeType + '</property>' +
		        '<property name=\"JSLink\" type=\"string\" null=\"true\" >' + JSLink + '</property>' +
		        '<property name=\"Title\" type=\"string\">' + webPartTitle + '</property>' +
		        '<property name=\"XmlDefinition\" type=\"string\">' + xmlDefinition + '</property>' +
		        '<property name=\"ParameterBindings\" type=\"string\">' +
		  '&lt;ParameterBinding Name=\"dvt_sortdir\" Location=\"Postback;Connection\"/&gt;' +
		            '&lt;ParameterBinding Name=\"dvt_sortfield\" Location=\"Postback;Connection\"/&gt;' +
		            '&lt;ParameterBinding Name=\"dvt_startposition\" Location=\"Postback\" DefaultValue=\"\"/&gt;' +
		            '&lt;ParameterBinding Name=\"dvt_firstrow\" Location=\"Postback;Connection\"/&gt;' +
		            '&lt;ParameterBinding Name=\"OpenMenuKeyAccessible\" Location=\"Resource(wss,OpenMenuKeyAccessible)\" /&gt;' +
		            '&lt;ParameterBinding Name=\"open_menu\" Location=\"Resource(wss,open_menu)\" /&gt;' +
		            '&lt;ParameterBinding Name=\"select_deselect_all\" Location=\"Resource(wss,select_deselect_all)\" /&gt;' +
		            '&lt;ParameterBinding Name=\"idPresEnabled\" Location=\"Resource(wss,idPresEnabled)\" /&gt;&lt;ParameterBinding Name=\"NoAnnouncements\" Location=\"None\" DefaultValue=\"' + noAnnouncements + '\"/&gt;&lt;ParameterBinding Name=\"NoAnnouncementsHowTo\" Location=\"None\" DefaultValue=\"' + noAnnouncementsHowTo + '\"/&gt;</property>' +
		      '</properties>' +
		    '</data>' +
		  '</webPart>' +
		'</webParts>';
	return result;
}
function xsltListViewWebPart_PostAdding()
{
	if ( this.shared.added ) {
	var currentObject = this;
	var attributes = this.shared.xml.attributes;
	var webUrl = this.shared.webUrl;
	var pageUrl = this.shared.pageUrl;
	var title = attributes[ 'title' ].value;
	var jsFile = attributes[ 'jsFile' ].value;
	var listUrl = attributes[ 'listUrl' ].value;
	var JSLink = this.shared.JSLink;
	var listContext = this.shared.listContext;
	var list = this.shared.list;
	var pageContext = new SP.ClientContext( preparePath( webUrl ) );
	var page = pageContext.get_web().getFileByServerRelativeUrl( pageUrl ); /* Needed? */
	var webParts = pageContext.get_web().getFileByServerRelativeUrl( pageUrl ).getLimitedWebPartManager( SP.WebParts.PersonalizationScope.shared ).get_webParts();
	pageContext.load( webParts, 'Include(WebPart.Properties)' );
	pageContext.executeQueryAsync(
		function ( sender, args )
		{
			for ( var i = 0; i < webParts.get_count(); i++ )
			{
				var webPartDef = webParts.get_item( i )
				var webPart = webPartDef.get_webPart();
				if ( webPart.get_properties().get_item( 'Title' ) == currentObject.shared.wpid )
				{
					webPart.set_title( title );
					webPartDef.saveWebPartChanges();
					/* pageContext.load( webPart, 'TitleUrl' ); */
					pageContext.executeQueryAsync(
						function ( sender, args )
						{
							var webPartProperties = webParts.get_item( i ).get_webPart().get_properties();
							var xmlDefinitionText = webPartProperties.get_item( 'XmlDefinition' );
							var xmlDefinition = parseXml( xmlDefinitionText );
							var viewIdText = xmlDefinition.getElementsByTagName( "View" )[ 0 ].attributes[ "Name" ].value;
							var viewId = new SP.Guid( viewIdText );
							var view = list.get_views().getById( viewId );
							listContext.load ( view )
							listContext.executeQueryAsync(
								function ( sender, args )
								{
									listContext.executeQueryAsync(
										function ( sender, args )
										{
											var XMLColumns = currentObject.shared.xml.getElementsByTagName( 'Column' )
											if ( XMLColumns.length > 0 )
											{
												view.get_viewFields().removeAll();
												for ( var i = 0; i < XMLColumns.length; i++ )
												{
													var columnName = XMLColumns[i].attributes[ 'name' ].value
													view.get_viewFields().add( columnName );
												}
												view.update()
											}
											listContext.executeQueryAsync(
												function ( sender, args )
												{
													if ( jsFile != "" )
													{
														var webServerRelativeUrl = _spPageContextInfo.webServerRelativeUrl;
														var serverRequestPath = _spPageContextInfo.serverRequestPath;
														var sourceFileURL = serverRequestPath.substring( webServerRelativeUrl.length, serverRequestPath.lastIndexOf( '/' ) ) + jsFile;
														var replaceText = [ { "sample" : "TILESVIEWGUID", "destination" : viewIdText } ];
														var newFileName = getFileNameFromUrl( jsFile ).addBeforeExtension( currentObject.shared.wpid )
														copyFile( webServerRelativeUrl, sourceFileURL, webUrl, listUrl, newFileName, replaceText, fractalFree )
													} else {
														fractalFree();
													}
												},
												function ( sender, args )
												{
													alert( 'Failed to update list view ' + args.get_message() + '\n' + args.get_stackTrace() );
													fractalFree();
												});
										},
										function ( sender, args )
										{
											alert( 'Failed to read list view ' + args.get_message() + '\n' + args.get_stackTrace() );
											fractalFree();
										});
								},
								function ( sender, args )
								{
									alert( 'Failed to read list views ' + args.get_message() + '\n' + args.get_stackTrace() );
									fractalFree();
								});
						},
						function ( sender, args )
						{
							alert( 'Failed to set web part title ' + args.get_message() + '\n' + args.get_stackTrace() );
							fractalFree();
						});
					break;
				}
			}
		},
		function ( sender, args )
		{
			alert( 'Failed to read webparts ' + args.get_message() + '\n' + args.get_stackTrace() );
			fractalFree();
		});
	} else { fractalFree(); }
}


/* ContentBySearchWebPart */

function contentBySearchWebPart_BuildXML()
{
	var propertyMappings = this.shared.xml.getElementsByTagName( 'PropertyMappings' )[0].textContent;
	var dataProviderJSON = this.shared.xml.getElementsByTagName( 'DataProviderJSON' )[0].textContent;
	var attributes = this.shared.xml.attributes;
	var title = attributes[ 'title' ].value
	var numberOfItems = attributes[ 'numberOfItems' ].value
	var groupTemplateId = attributes[ 'groupTemplateId' ].value;
	var itemTemplateId = attributes[ 'itemTemplateId' ].value;
	var resultsPerPage = attributes[ 'resultsPerPage' ].value;
	var renderTemplateId = attributes[ 'renderTemplateId' ].value;
	var advancedSearchPageAddress = attributes[ 'advancedSearchPageAddress' ].value;
	var emptyMessage = attributes[ 'emptyMessage' ].value;
	var chromeType = attributes[ 'chromeType' ].value;
	this.shared.webPartMarkup = searchWebPartXml( title, propertyMappings, numberOfItems, groupTemplateId, itemTemplateId, resultsPerPage, renderTemplateId, advancedSearchPageAddress, emptyMessage, dataProviderJSON, chromeType )
	fractalFree();
}
function searchWebPartXml( title, propertyMappings, numberOfItems, groupTemplateId, itemTemplateId, resultsPerPage, renderTemplateId, advancedSearchPageAddress, emptyMessage, dataProviderJSON, chromeType )
{
	var result = '<?xml version=\"1.0\" encoding=\"utf-8\"?>\
		<webParts>\
  			<webPart xmlns="http://schemas.microsoft.com/WebPart/v3">\
				<metaData>\
					<type name="Microsoft.Office.Server.Search.WebControls.ContentBySearchWebPart, Microsoft.Office.Server.Search, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" />\
					<importErrorMessage>Cannot import this Web Part.</importErrorMessage>\
				</metaData>\
				<data>\
					<properties>\
						<property name="StatesJson" type="string">{}</property>\
						<property name="UseSharedDataProvider" type="bool">False</property>\
						<property name="UseSimplifiedQueryBuilder" type="bool">False</property>\
						<property name="QueryGroupName" type="string">Default</property>\
						<property name="LogAnalyticsViewEvent" type="bool">False</property>\
						<property name="SelectedPropertiesJson" type="string">["PublishingImage","PictureURL","PictureThumbnailURL","SiteLogo","Path","Title","Description","SecondaryFileExtension","ContentTypeId"]</property>\
						<property name="PropertyMappings" type="string">' + propertyMappings + '</property>\
						<property name="ShowAdvancedLink" type="bool">True</property>\
						<property name="NumberOfItems" type="int">' + numberOfItems + '</property>\
						<property name="EmitStyleReference" type="bool">True</property>\
						<property name="ShowPreferencesLink" type="bool">True</property>\
						<property name="ServerIncludeScriptsJson" type="string">null</property>\
						<property name="IncludeResultTypeConstraint" type="bool">False</property>\
						<property name="Height" type="string" />\
						<property name="MaxPagesBeforeCurrent" type="int">4</property>\
						<property name="ResultType" type="string" />\
						<property name="ShowDidYouMean" type="bool">False</property>\
						<property name="StartingItemIndex" type="int">1</property>\
						<property name="AlwaysRenderOnServer" type="bool">False</property>\
						<property name="GroupTemplateId" type="string">' + groupTemplateId + '</property>\
						<property name="ResultTypeId" type="string" />\
						<property name="ItemTemplateId" type="string">' + itemTemplateId + '</property>\
						<property name="AllowConnect" type="bool">True</property>\
						<property name="HelpUrl" type="string" />\
						<property name="ResultsPerPage" type="int">' + resultsPerPage + '</property>\
						<property name="RenderTemplateId" type="string">' + renderTemplateId + '</property>\
						<property name="AllowEdit" type="bool">True</property>\
						<property name="AllowZoneChange" type="bool">True</property>\
						<property name="AddSEOPropertiesFromSearch" type="bool">False</property>\
						<property name="AdvancedSearchPageAddress" type="string">' + advancedSearchPageAddress + '</property>\
						<property name="HitHighlightedPropertiesJson" type="string">["Title","Path","Author","SectionNames","SiteDescription"]</property>\
						<property name="TitleUrl" type="string" />\
						<property name="EmptyMessage" type="string"> + emptyMessage + </property>\
						<property name="ShowBestBets" type="bool">False</property>\
						<property name="AllowHide" type="bool">True</property>\
						<property name="BypassResultTypes" type="bool">True</property>\
						<property name="Description" type="string">Content Search Web Part will allow you to show items that are results of a search query you specify. When you add it to the page, this Web Part will show recently modified items from the current site. You can change this setting to show items from another site or list by editing the Web Part and changing its search criteria.As new content is discovered by search, this Web Part will display an updated list of items each time the page is viewed.</property>\
						<property name="ShowSortOptions" type="bool">False</property>\
						<property name="ExportMode" type="exportmode">All</property>\
						<property name="AllowMinimize" type="bool">True</property>\
						<property name="ShowPersonalFavorites" type="bool">False</property>\
						<property name="ChromeType" type="chrometype">' + chromeType + '</property>\
						<property name="ShowPaging" type="bool">True</property>\
						<property name="ChromeState" type="chromestate">Normal</property>\
						<property name="CatalogIconImageUrl" type="string" />\
						<property name="HelpMode" type="helpmode">Modeless</property>\
						<property name="TitleIconImageUrl" type="string" />\
						<property name="ItemBodyTemplateId" type="string" />\
						<property name="AlternateErrorMessage" type="string" null="true" />\
						<property name="Hidden" type="bool">False</property>\
						<property name="TargetResultTable" type="string">RelevantResults</property>\
						<property name="AllowClose" type="bool">True</property>\
						<property name="MissingAssembly" type="string">Cannot import this Web Part.</property>\
						<property name="ShowResultCount" type="bool">True</property>\
						<property name="ShowLanguageOptions" type="bool">True</property>\
						<property name="ShowUpScopeMessage" type="bool">False</property>\
						<property name="Width" type="string" />\
						<property name="RepositionLanguageDropDown" type="bool">False</property>\
						<property name="Title" type="string">' + title + '</property>\
						<property name="ScrollToTopOnRedraw" type="bool">False</property>\
						<property name="ShowResults" type="bool">True</property>\
						<property name="ShowAlertMe" type="bool">True</property>\
						<property name="OverwriteResultPath" type="bool">True</property>\
						<property name="PreloadedItemTemplateIdsJson" type="string">null</property>\
						<property name="MaxPagesAfterCurrent" type="int">1</property>\
						<property name="ShowDefinitions" type="bool">False</property>\
						<property name="ShouldHideControlWhenEmpty" type="bool">True</property>\
						<property name="ShowViewDuplicates" type="bool">False</property>\
						<property name="AvailableSortsJson" type="string">null</property>\
						<property name="DataProviderJSON" type="string">' + dataProviderJSON + '</property>\
						<property name="Direction" type="direction">NotSet</property>\
					</properties>\
				</data>\
			</webPart>\
		</webParts>'
	return result;
}


/* ContentByQueryWebPart */

function contentByQueryWebPart_Procedure()
{
	var blockId = "fractal-" + this.id;
	this.shared.listId = "";
	if ( getAttributeValue( this.shared.xml, "listUrl" ) != "" )
	{
		var newItem = new fractalObject();
		newItem.name = "listFinding";
		this.items.push( newItem );
		this.getItemByName( "listFinding" ).displayName = "Looking for specified list";
		this.getItemByName( "listFinding" ).procedure = fractalProvisioningListFinding;
		this.getItemByName( "listFinding" ).shared = this.shared;
		var columns = [];
		var XMLColumns = this.shared.xml.getElementsByTagName( 'Column' );
		for ( var i = 0; i < XMLColumns.length; i++ )
		{
			columns[ columns.length ] = { "spot" : XMLColumns[i].attributes[ 'spot' ].value, "field" : XMLColumns[i].attributes[ 'field' ].value, "type" : XMLColumns[i].attributes[ 'type' ].value }
		}
		this.shared.columns = columns;
		this.getItemByName( "listFinding" ).renderItem( blockId );
	}
	var newItem = new fractalObject();
	newItem.name = "buildXML";
	this.items.push( newItem );
	this.shared.added = false;
	this.getItemByName( "buildXML" ).displayName = "Building Web Part XML";
	this.getItemByName( "buildXML" ).procedure = FORoot.getItemByName( "webPartsAdding" ).proceduresByType[ this.shared.xml.attributes[ 'type' ].value ].buildXML;
	this.getItemByName( "buildXML" ).shared = this.shared;
	this.getItemByName( "buildXML" ).renderItem( blockId );
	var newItem = new fractalObject();
	newItem.name = "addToPage";
	this.items.push( newItem );
	this.getItemByName( "addToPage" ).displayName = "Adding Web Part to page";
	this.getItemByName( "addToPage" ).procedure = addWebPartToPage;
	this.getItemByName( "addToPage" ).shared = this.shared;
	this.getItemByName( "addToPage" ).renderItem( blockId );
	var newItem = new fractalObject();
	newItem.name = "publishPage";
	this.items.push( newItem );
	this.getItemByName( "publishPage" ).displayName = "Publishing Page";
	this.getItemByName( "publishPage" ).procedure = publishPageAfterWebPartAdding;
	this.getItemByName( "publishPage" ).shared = this.shared;
	this.getItemByName( "publishPage" ).renderItem( blockId )
}
function fractalProvisioningListFinding()
{
	var currentObject = this;
	var attributes = this.shared.xml.attributes;
	var listWebUrl = attributes[ 'listWebUrl' ].value;
	var listUrl = attributes[ 'listUrl' ].value;
	var context = new SP.ClientContext( preparePath( this.shared.webUrl ) );
	var rootWeb = context.get_site().get_rootWeb();
	context.load( rootWeb );
	context.executeQueryAsync(
		function ( sender, args )
		{
			var listWebServerRelativeUrl = makeRelative( rootWeb.get_url() ) + listWebUrl;
			var listContext = new SP.ClientContext( listWebServerRelativeUrl );
			var lists = listContext.get_web().get_lists();
			listContext.load( lists, 'Include(Id,RootFolder)' );
			var listSite = listContext.get_site();
			listContext.load( listSite );
			listContext.executeQueryAsync(
				function ( sender, args )
				{
					var listEnumerator = lists.getEnumerator();
					var list = null;
					var listId = null;
					while ( listEnumerator.moveNext() ) {
						var list = listEnumerator.get_current();
						if ( list.get_rootFolder().get_serverRelativeUrl() == ( listWebServerRelativeUrl + listUrl ) )
						{
							listId = list.get_id();
							break;
						}
					}
					if ( listId != null )
					{
						currentObject.shared.listId = listId;
						listFields = list.get_fields();
						listContext.load( listFields );
						listContext.executeQueryAsync(
							function ( sender, args )
							{
								for ( var i = 0; i < currentObject.shared.columns.length; i++ )
								{
									var fieldEnumerator = listFields.getEnumerator();
									while ( fieldEnumerator.moveNext() ) {
										var currentField = fieldEnumerator.get_current()
										if ( currentField.get_internalName() == currentObject.shared.columns[ i ].field )
										{
											currentObject.shared.columns[ i ].id = currentField.get_id().toString();
										}
									}
								}
								fractalFree();
							},
							function ( sender, args )
							{
								alert( 'Error occured when list fields reading: ' + args.get_message() + '\n' + args.get_stackTrace() );
								fractalFree();
							});
					} else {
						alert( 'Error occured when list opening: List with given url is not found' );
						fractalFree();
					}
				},
				function ( sender, args )
				{
					alert( 'Error occured when root web opening: ' + args.get_message() + '\n' + args.get_stackTrace() );
					fractalFree();
				});
		},
		function ( sender, args )
		{
			alert( 'Error occured when root web opening: ' + args.get_message() + '\n' + args.get_stackTrace() );
			fractalFree();
		});
}
function contentByQueryWebPart_BuildXML()
{
	var listId = this.shared.listId;
	var title = this.shared.title;
	var titleUrl = this.shared.titleUrl;
	var description = this.shared.description;
	var columns = this.shared.columns;
	var attributes = this.shared.xml.attributes;
	var listWebUrl = attributes[ 'listWebUrl' ].value;
	var serverTemplate = attributes[ 'serverTemplate' ].value;
	var sortBy = attributes[ 'sortBy' ].value;
	var sortDirection = attributes[ 'sortDirection' ].value;
	var itemStyle = attributes[ 'itemStyle' ].value;
	var groupStyle = attributes[ 'groupStyle' ].value;
	var itemLimit = attributes[ 'itemLimit' ].value;
	var chromeType = attributes[ 'chromeType' ].value;
	this.shared.webPartMarkup = contentByQueryWebPartXml( title, listWebUrl, listId, titleUrl, description, serverTemplate, columns, sortBy, sortDirection, itemStyle, groupStyle, itemLimit, chromeType )
	fractalFree();
}
function contentByQueryWebPartXml( title, webUrl, listGuid, titleUrl, description, serverTemplate, columns, sortBy, sortDirection, itemStyle, groupStyle, itemLimit, chromeType )
{
	var dataMappingViewFields = "";
	var dataMappings = "";
	for ( var i = 0; i < columns.length; i++ )
	{
		dataMappings = dataMappings + columns[ i ].spot + ":{" + columns[ i ].id + "}," + columns[ i ].field + "," + columns[ i ].type + ";|";
		dataMappingViewFields = dataMappingViewFields + "{" + columns[ i ].id + "}," + columns[ i ].type + ";";
	}
	var result = '<?xml version=\"1.0\" encoding=\"utf-8\"?>\
		<webParts>\
			<webPart xmlns="http://schemas.microsoft.com/WebPart/v3">\
				<metaData>\
					<type name="Microsoft.SharePoint.Publishing.WebControls.ContentByQueryWebPart, Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" />\
					<importErrorMessage>Cannot import this Web Part.</importErrorMessage>\
				</metaData>\
				<data>\
					<properties>\
						<property name="Filter1ChainingOperator" type="Microsoft.SharePoint.Publishing.WebControls.ContentByQueryWebPart+FilterChainingOperator, Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c">Or</property>\
						<property name="FilterOperator1" type="Microsoft.SharePoint.Publishing.WebControls.ContentByQueryWebPart+FilterFieldQueryOperator, Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c">Eq</property>\
						<property name="FilterOperator3" type="Microsoft.SharePoint.Publishing.WebControls.ContentByQueryWebPart+FilterFieldQueryOperator, Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c">Eq</property>\
						<property name="GroupByDirection" type="Microsoft.SharePoint.Publishing.WebControls.ContentByQueryWebPart+SortDirection, Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c">Desc</property>\
						<property name="ChromeState" type="chromestate">Normal</property>\
						<property name="Description" type="string">' + description + '</property>\
						<property name="DataMappingViewFields" type="string">' + dataMappingViewFields + '</property>\
						<property name="Title" type="string">' + title + '</property>\
						<property name="ItemStyle" type="string">' + itemStyle + '</property>\
						<property name="ServerTemplate" type="string">' + serverTemplate + '</property>\
						<property name="TitleUrl" type="string">' + titleUrl + '</property>\
						<property name="ListGuid" type="string">' + listGuid + '</property>\
						<property name="SortBy" type="string">' + sortBy + '</property>\
						<property name="ChromeType" type="chrometype">' + chromeType + '</property>\
						<property name="DataMappings" type="string">' + dataMappings + '</property>\
						<property name="GroupStyle" type="string">' + groupStyle + '</property>\
						<property name="ItemLimit" type="int">' + itemLimit + '</property>\
						<property name="WebUrl" type="string">~sitecollection' + webUrl + '</property>\
					</properties>\
				</data>\
			</webPart>\
		</webParts>'
	return result;
}


/* ColleaguesWebPart */

function colleaguesWebPart_BuildXML()
{
	var attributes = this.shared.xml.attributes;
	var title = attributes[ 'title' ].value;
	var description = attributes[ 'description' ].value;
	var titleUrl = attributes[ 'titleUrl' ].value;
	var showNames = attributes[ 'showNames' ].value;
	var maxRows = attributes[ 'maxRows' ].value;
	var chromeType = attributes[ 'chromeType' ].value;
	this.shared.webPartMarkup = colleaguesWebPartXml( title, description, titleUrl, showNames, maxRows, chromeType )
	fractalFree();
}
function colleaguesWebPartXml( title, description, titleUrl, showNames, maxRows, chromeType )
{
	var result = '<?xml version=\"1.0\" encoding=\"utf-8\"?>\
	<webParts>\
		<webPart xmlns="http://schemas.microsoft.com/WebPart/v3">\
			<metaData>\
				<type name="Microsoft.SharePoint.Portal.WebControls.ColleaguesWebPart, Microsoft.SharePoint.Portal, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" />\
				<importErrorMessage>Cannot import this Web Part.</importErrorMessage>\
			</metaData>\
			<data>\
				<properties>\
					<property name="ExportMode" type="exportmode">All</property>\
					<property name="HelpUrl" type="string" />\
					<property name="Hidden" type="bool">False</property>\
					<property name="MissingAssembly" type="string">Cannot import this Web Part.</property>\
					<property name="ShowNames" type="bool">' + showNames + '</property>\
					<property name="Description" type="string">' + description + '</property>\
					<property name="MaxRows" type="int">' + maxRows + '</property>\
					<property name="Title" type="string">' + title + '</property>\
					<property name="AllowHide" type="bool">True</property>\
					<property name="AllowMinimize" type="bool">True</property>\
					<property name="AllowZoneChange" type="bool">True</property>\
					<property name="TitleUrl" type="string">' + titleUrl + '</property>\
					<property name="ChromeType" type="chrometype">' + chromeType + '</property>\
					<property name="AllowConnect" type="bool">True</property>\
					<property name="Width" type="string" />\
					<property name="Height" type="string" />\
					<property name="CatalogIconImageUrl" type="string">/_layouts/images/wp_pers.gif</property>\
					<property name="HelpMode" type="helpmode">Modeless</property>\
					<property name="AllowEdit" type="bool">True</property>\
					<property name="TitleIconImageUrl" type="string" />\
					<property name="Direction" type="direction">NotSet</property>\
					<property name="AllowClose" type="bool">True</property>\
					<property name="ChromeState" type="chromestate">Normal</property>\
				</properties>\
			</data>\
		</webPart>\
	</webParts>'
	return result;
}


/* SiteFeedWebPart */

function siteFeedWebPart_BuildXML()
{
	var attributes = this.shared.xml.attributes;
	var title = attributes[ 'title' ].value;
	var description = attributes[ 'description' ].value;
	var frameType = attributes[ 'frameType' ].value;
	this.shared.webPartMarkup = siteFeedWebPartXml( title, description, frameType )
	fractalFree();
}
function siteFeedWebPartXml( title, description, frameType )
{
	var result = '<?xml version="1.0" encoding="utf-8"?>\
		<WebPart xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/WebPart/v2">\
			<Assembly>Microsoft.SharePoint.Portal, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c</Assembly>\
			<TypeName>Microsoft.SharePoint.Portal.WebControls.SiteFeedWebPart</TypeName>\
			<Title>' + title + '</Title>\
			<FrameType>' + frameType + '</FrameType>\
			<Description>' + description + '</Description>\
		</WebPart>';
	return result;
}


/* ContentEditorWebPart */

function contentEditorWebPart_BuildXML()
{
	var attributes = this.shared.xml.attributes;
	var title = this.shared.title;
	var description = this.shared.description;
	var frameType = attributes[ 'frameType' ].value;
	var content = getInnerXMLAsString( this.shared.xml );
	this.shared.webPartMarkup = contentEditorWebPartXml( title, description, frameType, content );
	fractalFree();
}
function contentEditorWebPartXml( title, description, frameType, content )
{
	var result = '<?xml version=\"1.0\" encoding=\"utf-8\"?>' + 
        '<WebPart xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"' + 
        ' xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"' + 
        ' xmlns=\"http://schemas.microsoft.com/WebPart/v2\">' + 
        '<TypeName>Microsoft.SharePoint.WebPartPages.ContentEditorWebPart</TypeName>' + 
        '<Assembly>Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=94de0004b6e3fcc5</Assembly>' + 
        '<Title>' + title + '</Title>' +
		'<FrameType>' + frameType + '</FrameType>' + 
        '<Description>' + description + '</Description>' + 
        '<Content xmlns=\"http://schemas.microsoft.com/WebPart/v2/ContentEditor\">' + 
        '<![CDATA[' + content + ']]></Content>' + 
        '<PartStorage xmlns=\"http://schemas.microsoft.com/WebPart/v2/ContentEditor\" /></WebPart>';
	return result;
}


/* MembersWebPartXml */

function membersWebPart_BuildXML()
{
	var title = this.shared.title;
	var titleUrl = this.shared.titleUrl;
	var description = this.shared.description;
	var frameType = getAttributeValue( this.shared.xml, "frameType" );
	var displayType = getAttributeValue( this.shared.xml, "displayType" );
	if ( displayType == "WebMemberGroup" )
	{
		this.shared.webPartMarkup = MembersWebPartXml( title, description, titleUrl, frameType, displayType, "" );
		fractalFree();
	} else if ( displayType == "GroupMembership" )
	{
		var currentObject = this;
		var context = new SP.ClientContext( preparePath( this.shared.webUrl ) );
		var groupCollection = context.get_web().get_siteGroups();
		var visitorsGroup = groupCollection.getByName( getAttributeValue( this.shared.xml, "group" ) );
		context.load( visitorsGroup );
		context.executeQueryAsync(
			function( sender, args )
			{
				var membershipGroupId = visitorsGroup.get_id();
				currentObject.shared.webPartMarkup = MembersWebPartXml( title, description, titleUrl, frameType, displayType, membershipGroupId );
				fractalFree();
			},
			function( sender, args )
			{
				alert( 'Error occured when group properties reading: ' + args.get_message() + '\n' + args.get_stackTrace() );
				fractalFree();
			});
	} else { fractalFree(); }
}
function MembersWebPartXml( title, description, titleUrl, frameType, displayType, membershipGroupId )
{
	var result = '<?xml version="1.0" encoding="utf-8"?>\
			<WebPart xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/WebPart/v2">\
				<Assembly>Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c</Assembly>\
				<TypeName>Microsoft.SharePoint.WebPartPages.MembersWebPart</TypeName>\
				<Title>' + title + '</Title>\
				<FrameType>' + frameType + '</FrameType>\
				<Description>' + description + '</Description>';
				if ( titleUrl != "") { result += '<DetailLink>' + titleUrl + '</DetailLink>'; }
				result += '<DisplayType xmlns="http://schemas.microsoft.com/WebPart/v2/Members">' + displayType + '</DisplayType>';
				if ( ( membershipGroupId != null ) && ( membershipGroupId != "" ) ) { result += '<MembershipGroupId xmlns="http://schemas.microsoft.com/WebPart/v2/Members">' + membershipGroupId + '</MembershipGroupId>'; }
				result += '</WebPart>'
	return result;
}


/* RSSAggregatorWebPart */

function rssAggregatorWebPart_BuildXML()
{
	var title = this.shared.title;
	var titleUrl = this.shared.titleUrl;
	var description = this.shared.description;
	var chromeType = getAttributeValue( this.shared.xml, "chromeType" );
	var feedUrl = getAttributeValue( this.shared.xml, "feedUrl" );
	var feedLimit = getAttributeValue( this.shared.xml, "feedLimit" );
	this.shared.webPartMarkup = rssAggregatorWebPartXml( title, description, titleUrl, chromeType, feedUrl, feedLimit )
	fractalFree();
}
function rssAggregatorWebPartXml( title, description, titleUrl, chromeType, feedUrl, feedLimit )
{
	result = '<webParts>\
			<webPart xmlns="http://schemas.microsoft.com/WebPart/v3">\
				<metaData>\
					<type name="Microsoft.SharePoint.Portal.WebControls.RSSAggregatorWebPart, Microsoft.SharePoint.Portal, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" />\
				</metaData>\
				<data>\
					<properties>\
						<property name="ChromeType" type="chrometype">' + chromeType + '</property>\
						<property name="ParameterBindings" type="string">&lt;ParameterBinding Name="RequestUrl" Location="WPProperty[FeedUrl]"/&gt;</property>\
						<property name="FeedLimit" type="int">' + feedLimit + '</property>\
						<property name="FeedUrl" type="string">' + encodeXml( feedUrl ) + '</property>\
						<property name="Title" type="string">' + title + '</property>\
						<property name="Description" type="string">' + description + '</property>'
						if ( titleUrl != "") { result += '<property name="TitleUrl" type="string" />' + titleUrl + '</property>'; }
						result += '<property name="DataSourcesString" type="string">\
&lt;%@ Register TagPrefix="WebControls" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %&gt;\
&lt;%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %&gt;\
&lt;WebControls:XmlUrlDataSource runat="server" AuthType="None" HttpMethod="GET"&gt;\
  &lt;DataFileParameters&gt;\
            &lt;WebPartPages:DataFormParameter Name="RequestUrl" ParameterKey="RequestUrl" PropertyName="ParameterValues"/&gt;\
&lt;/DataFileParameters&gt;\
&lt;/WebControls:XmlUrlDataSource&gt;</property>\
      </properties>\
    </data>\
  </webPart>\
</webParts>';
	return result;
}
function fractalProvisioningWebPartAddingProceduresAdding()
{
	if ( FORoot.getItemByName( "webPartsAdding" ) == null ) { appendWebPartAddingNode( FORoot ) };
	FORoot.getItemByName( "webPartsAdding" ).proceduresByType.PictureLibrarySlideshowWebPart = { buildXML: pictureLibrarySlideshowWebPart_BuildXML };
	FORoot.getItemByName( "webPartsAdding" ).proceduresByType.ContentEditorWebPart = { buildXML: contentEditorWebPart_BuildXML };
	FORoot.getItemByName( "webPartsAdding" ).proceduresByType.ContactFieldControl = { buildXML: contactFieldControl_BuildXML };
	FORoot.getItemByName( "webPartsAdding" ).proceduresByType.MicroFeedWebPart = { buildXML: microFeedWebPart_BuildXML };
	FORoot.getItemByName( "webPartsAdding" ).proceduresByType.ExcelWebRenderer = { buildXML: excelWebRenderer_BuildXML };
	FORoot.getItemByName( "webPartsAdding" ).proceduresByType.XsltListViewWebPart = { procedure: xsltListViewWebPart_Procedure, buildXML: xsltListViewWebPart_BuildXML, postAdding: xsltListViewWebPart_PostAdding };
	FORoot.getItemByName( "webPartsAdding" ).proceduresByType.ContentBySearchWebPart = { buildXML: contentBySearchWebPart_BuildXML };
	FORoot.getItemByName( "webPartsAdding" ).proceduresByType.ContentByQueryWebPart = { procedure: contentByQueryWebPart_Procedure, buildXML: contentByQueryWebPart_BuildXML };
	FORoot.getItemByName( "webPartsAdding" ).proceduresByType.ColleaguesWebPart = { buildXML: colleaguesWebPart_BuildXML };
	FORoot.getItemByName( "webPartsAdding" ).proceduresByType.SiteFeedWebPart = { buildXML: siteFeedWebPart_BuildXML };
	FORoot.getItemByName( "webPartsAdding" ).proceduresByType.MembersWebPart = { buildXML: membersWebPart_BuildXML };
	FORoot.getItemByName( "webPartsAdding" ).proceduresByType.RSSAggregatorWebPart = { buildXML: rssAggregatorWebPart_BuildXML };
}
(function(){ 
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningWebPartAddingProceduresAdding" ); 
})();


/* WikiContent */

function fractalProvisioningWikiContentAddingProceduresAdding()
{
	FORoot.parsing.wikicontent = wikiContentParsing;
	if ( FORoot.getItemByName( "wikiContentAdding" ) == null ) { appendWikiContentAddingNode( FORoot ) };
	FORoot.getItemByName( "wikiContentAdding" ).wikiContentAddingProcedure = wikiContentAddingProcedure;
}
(function(){ 
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningWikiContentAddingProceduresAdding" ); 
})();

function appendWikiContentAddingNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "wikiContentAdding";
	newFO.order = 110;
	newFO.displayName = "Adding Wiki Content"
	FOInstance.appendItem( newFO );
}
function wikiContentParsing( wikiContentXML, environmentalAttributes )
{
	if ( environmentalAttributes.parentNodeType == 'page' )
	{
		var newWikiContentItem = wikiContentAddingObject();
		var attributes = wikiContentXML.attributes;
		newWikiContentItem.webUrl = environmentalAttributes.webUrl;
		newWikiContentItem.pageUrl = environmentalAttributes.parentNodeUrl;
		newWikiContentItem.displayName = newWikiContentItem.pageUrl;
		newWikiContentItem.zoneID = attributes[ 'zoneID' ].value;
		newWikiContentItem.partOrder = attributes[ 'partOrder' ].value;
		newWikiContentItem.content = getInnerXMLAsString( wikiContentXML );
		FORoot.getItemByName( "wikiContentAdding" ).items.push( newWikiContentItem )
	}
}
function wikiContentAddingObject()
{
	var newFO = new fractalObject();
	newFO.procedure = FORoot.getItemByName( "wikiContentAdding" ).wikiContentAddingProcedure;
	return newFO;
}
function wikiContentAddingProcedure()
{
	var isWiki = false;
	var currentObject = this;
	var context = new SP.ClientContext( preparePath( this.webUrl ) );
	var page = context.get_web().getFileByServerRelativeUrl( this.pageUrl );
	var pageItem = page.get_listItemAllFields();
	context.load( page );
	context.load( pageItem );
	context.executeQueryAsync(
		function( sender, args )
		{
			var wikiField = pageItem.get_item( "WikiField" );
			if ( wikiField != null )
			{
				var htmlObject = document.createElement( 'div' );
				htmlObject.innerHTML = wikiField;
				var zoneNumber = parseInt( currentObject.zoneID );
				var partOrder = parseInt( currentObject.partOrder );
				var zoneObject = htmlObject.getElementsByClassName( "ms-rte-layoutszone-inner" )[ zoneNumber ];
				var existingBlocks = zoneObject.childNodes;
				var newHTML = document.createElement( 'div' );
				newHTML.innerHTML = currentObject.content;
				if ( partOrder < existingBlocks.length )
				{
					zoneObject.insertBefore( newHTML, existingBlocks[ partOrder ] );
				} else {
					zoneObject.appendChild( newHTML );
				}
				newHtml = htmlObject.innerHTML;
				pageItem.set_item( "WikiField", newHtml )
				pageItem.update()
				context.executeQueryAsync(
					function( sender, args )
					{
						fractalFree();
					},
					function( sender, args )
					{
						alert( 'Error occured when existing web parts reading: ' + args.get_message() + '\n' + args.get_stackTrace() );
						fractalFree();
					});					
			} else {
				alert( 'Page is not a wiki-capable' );
				fractalFree();				
			}
		},
		function( sender, args )
		{
			alert( 'Error occured when page opening or user adding: ' + args.get_message() + '\n' + args.get_stackTrace() );
			fractalFree();
		});
}