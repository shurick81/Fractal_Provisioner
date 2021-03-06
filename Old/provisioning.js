var configFile = 'provisioning.xml';

function fractalObject()
{
	this.name = "";
	this.displayName = "";
	this.id = SP.Guid.newGuid().toString();
	this.finished = false;
	this.currentlyProcessed = false;
	this.items = [ ];
	this.procedure = function() { fractalFree(); };
	this.getItemByName = fractalGetItemByName;
	this.appendItem = fractalAppendItem;
	this.findObject = fractalFindObject;
	this.renderItem = fractalRenderItem
	this.order = 50;
}
function fractalAppendItem( newItem )
{
	var items = this.items;
	var newNumber = items.length;
	for( var i = 0; i < items.length; i++ )
	{
		if ( items[ i ].order > newItem.order )
		{
			newNumber = i;
			break;
		}
	}
	items.splice( newNumber, 0, newItem )
	if ( this.childernFinished ) { this.childrenFinished = false }
}
var fractalGetItemByName = function( itemName )
{
	for ( var i=0; i < this.items.length; i++ )
	{
		if ( this.items[ i ].name == itemName )
		{
			return this.items[ i ];
		}
	}
}
function fractalFindObject( field, value )
{
	if ( this[ field ] != null )
	{
		if ( this[ field ] == value )
		{
			return this;
		}
	}
	for( var i in this.items )
	{
		var item = this.items[ i ];
		var foundObject = item.findObject( field, value );
		if ( foundObject != null )
		{
			return foundObject;
		}
	}
	return null;
}
function fractalFindCurrent()
{
	return this.findObject( "currentlyProcessed", true );
}
function fractalFindNext()
{
	return this.findObject( "finished", false )
}
function fractalFree()
{
	FORoot.fractalBusy = false;
}

function fractalIntervalPusher()
{
	var currentlyProcessedObject = null;
	var nextProcessedObject = null;
	if ( !FORoot.fractalBusy )
	{
		currentlyProcessedObject = FORoot.findCurrent();
		if ( currentlyProcessedObject != null )
		{
			currentlyProcessedObject.currentlyProcessed = false;
			currentlyProcessedObject.finished = true;
			var objectId = currentlyProcessedObject.id;
			var blockId = "fractal-" + objectId
			var objectBlock = document.getElementById( blockId )
			objectBlock.setAttribute( "class", "fractal-object done" );
		}
		nextProcessedObject = FORoot.findNext()
		if ( nextProcessedObject != null )
		{
			var objectId = nextProcessedObject.id;
			var blockId = "fractal-" + objectId
			var objectBlock = document.getElementById( blockId )
			objectBlock.setAttribute( "class", "fractal-object processing" );
			nextProcessedObject.currentlyProcessed = true;
			FORoot.fractalBusy = true;
			nextProcessedObject.procedure();
		} else {
			FORoot.stopTimer();
			FORoot.callBack();
		}
	}
}
function fractalRenderItem( tagId )
{
	var parentTag = document.getElementById( tagId )
	var newBlock = document.createElement( 'div' );
	var newBlockId = "fractal-" + this.id;
	newBlock.setAttribute( "id", newBlockId );
	newBlock.setAttribute( "class", "fractal-object waiting" );
	var newHeader = document.createElement( 'h1' );
	newHeader.appendChild( document.createTextNode( this.displayName ) );
	newBlock.appendChild( newHeader )
	parentTag.appendChild( newBlock )
	this.items.forEach( function( item )
	{
		item.renderItem( newBlockId )
	});
}

FORoot = new fractalObject();
FORoot.fractalBusy = false;
FORoot.name = "Provisioning";
FORoot.displayName = "Provisioning";
FORoot.parsing = { };
FORoot.processing = { };
FORoot.timer = fractalIntervalPusher;
FORoot.findCurrent = fractalFindCurrent;
FORoot.findNext = fractalFindNext;

FORoot.startTimer = function()
{
	this.timerVar = setInterval( this.timer, 100 );
}
FORoot.stopTimer = function()
{
	clearInterval( this.timerVar );
}
FORoot.callBack = function()
{
	installationStatusBlock = document.getElementById( 'installationStatus' );
	var newHeader = document.createElement( 'h1' );
	newHeader.appendChild( document.createTextNode( 'Sequence has been completed' ) );
	installationStatusBlock.appendChild( newHeader );
}


var xhr = new XMLHttpRequest();
var xmlConfig;

var currentURL = window.location.href;
currentFolder = currentURL.substring( 0, currentURL.lastIndexOf( '/' ) );

var parseXml;
if ( typeof window.DOMParser != "undefined" ) {
	parseXml = function( xmlStr ) {
		var fractalDOMParser = new window.DOMParser();
		return fractalDOMParser.parseFromString( xmlStr, 'text/xml' );
	};
} else if ( typeof window.ActiveXObject != "undefined" && new window.ActiveXObject( "Microsoft.XMLDOM" ) ) {
	parseXml = function( xmlStr ) {
		var xmlDoc = new window.ActiveXObject( "Microsoft.XMLDOM" );
		xmlDoc.async = "false";
		xmlDoc.loadXML( xmlStr );
		return xmlDoc;
	};
} else {
	throw new Error( "No XML parser found" );
}

configUrl = currentFolder + "/" + configFile;
xhr.onreadystatechange = onConfigFileReadStateChange;
xhr.open( "GET", configUrl, true );
xhr.send();
installationStatusBlock = document.getElementById( 'installationStatus' );
installationStatusBlock.innerHTML = "Config file reading";
function onConfigFileReadStateChange()
{
	if ( xhr.readyState == 4 ) {
    	xmlConfig = parseXml( xhr.responseText );
		installationStatusBlock = document.getElementById( 'installationStatus' );
		installationStatusBlock.innerHTML = "Ready to start";
  	}
}
function StartFractalInstallation()
{
	installationStatusBlock = document.getElementById( 'installationStatus' );
	installationStatusBlock.innerHTML = '';
	attentionBlock = document.createElement( 'div' );
	attentionBlock.innerHTML = 'Attention! If you close this page (or navigate from it) installation will be interrupted.';
	installationStatusBlock.appendChild( attentionBlock );
	if ( xmlConfig != null )
	{
		xmlConfigs = xmlConfig.getElementsByTagName( "Configuration" );
		ParseConfigurationChildNodes( xmlConfigs, '' )
		FORoot.renderItem( 'installationStatus' )
		FORoot.startTimer()
	} else attentionBlock.innerHTML = 'Failed to read config file';
}
function ParseConfigurationChildNodes( xmlConfigurationNodes, parentNodeUrl, parentNodeType, webUrl )
{
	if ( ( xmlConfigurationNodes != null ) && ( xmlConfigurationNodes.length != 0 ) )
	{
		for ( var i = 0; i < xmlConfigurationNodes.length; i++ )
		{
			ParseConfigurationNode( xmlConfigurationNodes[i], parentNodeUrl, parentNodeType, webUrl )
		}
	}
}
function ParseConfigurationNode( xmlConfigurationNode, parentNodeUrl, parentNodeType, webUrl )
{
	if ( xmlConfigurationNode.tagName != null )
	{
		var nodeType = xmlConfigurationNode.tagName.toLowerCase();
		var enable = xmlConfigurationNode.attributes[ 'enable' ];
		if ( ( enable == null ) || ( enable.value.toLowerCase() != 'false' ) )
		{
			var urlAttribute = getAttributeValue( xmlConfigurationNode, 'url' );
			if ( urlAttribute == null ) urlAttribute = "";
			if ( typeof nodeType != "undefined" )
			{
				var url = parentNodeUrl + urlAttribute;
				var environmentalAttributes = { "parentNodeUrl" : parentNodeUrl, "parentNodeType" : parentNodeType, "webUrl" : webUrl, "url" : url }
				var enablerNodes = xmlConfig.getElementsByTagName( "ProvisioningEnabling" )[0].getElementsByTagName( nodeType );
				if ( ( enablerNodes.length > 0 ) && ( enablerNodes[0].attributes[ 'enable' ].value.toLowerCase() == 'true' ) )
				{
					var parseFunction = FORoot.parsing[ nodeType ];
					if ( typeof parseFunction != "undefined" ) { parseFunction( xmlConfigurationNode, environmentalAttributes ); }
				}
				if ( nodeType == "web" ) webUrl = url;
			}
			ParseConfigurationChildNodes ( xmlConfigurationNode.childNodes, url, nodeType, webUrl );
		}
	}
}