function fractalProvisioningPagesCreatingProceduresAdding()
{
	FORoot.parsing.page = fractalProvisioningPageCreatingParsing;
	if ( FORoot.getItemByName( "pagesCreating" ) == null ) { fractalProvisioningAppendPagesCreatingNode( FORoot ) };
}
(function(){
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningPagesCreatingProceduresAdding" ); 
})();

function fractalProvisioningAppendPagesCreatingNode( FOInstance )
{
	var newFO = new fractalObject();
	newFO.name = "pagesCreating";
	newFO.order = 60;
	newFO.displayName = "Pages creation";
	newFO.proceduresByType = { };
	FOInstance.appendItem( newFO );
}
function fractalProvisioningPageCreatingParsing( nodeXML, environmentalAttributes )
{
	var parentNodeType = environmentalAttributes.parentNodeType;
	if ( ( parentNodeType == 'web' ) || ( parentNodeType == 'list' ) || ( parentNodeType == 'folder' ) )
	{
		var type = getAttributeValue( nodeXML, 'type' );
		if ( ( type != null ) && ( type != '' ) )
		{
			var webUrl = environmentalAttributes.webUrl;
			var folderRelativeUrl = getRelativePath( webUrl, environmentalAttributes.parentNodeUrl )
			var url = folderRelativeUrl + getAttributeValue( nodeXML, 'url' );
			var newFO = new fractalObject();
			newFO.displayName = webUrl + url;
			newFO.webUrl = webUrl;
			newFO.url = url;
			newFO.xml = nodeXML;
			var customFunction = FORoot.getItemByName( "pagesCreating" ).proceduresByType[ type ];
			if ( typeof customFunction != "undefined" ) {
				newFO.procedure = customFunction;
			}
			FORoot.getItemByName( "pagesCreating" ).items.push( newFO );
		}
	}
}
function fractalProvisioningEmbeddedPageTypesAdding()
{
	if ( FORoot.getItemByName( "pagesCreating" ) == null ) { fractalProvisioningAppendPagesCreatingNode( FORoot ) };
	FORoot.getItemByName( "pagesCreating" ).proceduresByType.wiki = function () {
		createWikiPage( this.webUrl, this.url, getAttributeValue( this.xml, 'layoutsData' ), fractalFree );
	};
	FORoot.getItemByName( "pagesCreating" ).proceduresByType.publishing = function () {
		createPublishingPage( this.webUrl, getFileNameFromUrl( getAttributeValue( this.xml, 'url' ) ), getAttributeValue( this.xml, 'title' ), getAttributeValue( this.xml, 'layout' ), fractalFree );
	};
}
(function(){ 
	_spBodyOnLoadFunctionNames.push( "fractalProvisioningEmbeddedPageTypesAdding" ); 
})();
function createWikiPage( webUrl, newPageUrl, layoutsData, backFunction )
{
	var fullPageUrl = webUrl + newPageUrl;
	var context = new SP.ClientContext( preparePath( webUrl ) );
	var folder = context.get_web().getFolderByServerRelativeUrl( fullPageUrl.substring( 0, fullPageUrl.lastIndexOf( '/' ) + 1 ) );
	context.load( folder );
	context.executeQueryAsync(
		function ( sender, args )
		{
			var currentPageFile = context.get_web().getFileByServerRelativeUrl( fullPageUrl );
			context.load( currentPageFile );
			files = folder.get_files();
			context.load( files );
			context.executeQueryAsync(
				function ( sender, args )
				{
					alert('Page already exists');
					backFunction()
				},
				function ( sender, args )
				{
					if ( args.get_errorCode() == -2147024894 )
					{
						var newPage = files.addTemplateFile( fullPageUrl, SP.TemplateFileType.wikiPage );
						context.load( newPage );
						if ( layoutsData != "" )
						{
							var newItem = newPage.get_listItemAllFields();
							newItem.set_item( "WikiField", wikiPageLayout( layoutsData ) )
							newItem.update();
						}
						context.executeQueryAsync(
							function ( sender, args )
							{
								backFunction();
							},
							function ( sender, args )
							{
								alert( 'Error when page creation or content changing: ' + args.get_message() + '\n' + args.get_stackTrace() );
								backFunction();
							});
					} else {
						alert( 'Error occured when library files accessing: ' + args.get_message() + '\n' + args.get_stackTrace() );
						backFunction();
					}
				}
			)
		},	
		function ( sender, args )
		{
			alert( 'Error occured when library accessing: ' + args.get_message() + '\n' + args.get_stackTrace() );
			backFunction();
		});
}
function wikiPageLayout( layoutsData )
{
	var layoutText = ""
	switch ( layoutsData )
	{
		case "one column with sidebar":
		{
			layoutText = '<table id="layoutsTable" style="width: 100%">\
				<tbody>\
					<tr style="vertical-align: top">\
						<td style="width: 66.6%">\
							<div class="ms-rte-layoutszone-outer" style="width: 100%">\
								<div class="ms-rte-layoutszone-inner" style="min-height: 60px; word-wrap: break-word">\
									<p></p>\
								</div>\
							</div>\
						</td>\
						<td style="width: 33.3%">\
							<div class="ms-rte-layoutszone-outer" style="width: 100%">\
								<div class="ms-rte-layoutszone-inner" style="min-height: 60px; word-wrap: break-word">\
									<p></p>\
								</div>\
							</div>\
						</td>\
					</tr>\
				</tbody>\
			</table>\
			<span id="layoutsData" style="display: none">false,false,2</span>'
			break;
		}
		case "one column with sidebar and header":
		{
			layoutText = '<table id="layoutsTable" style="width: 100%">\
				<tbody>\
					<tr style="vertical-align:top;">\
						<td colspan="2">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
									<p></p>\
								</div>\
							</div>\
						</td>\
					</tr>\
					<tr style="vertical-align: top">\
						<td style="width: 66.6%">\
							<div class="ms-rte-layoutszone-outer" style="width: 100%">\
								<div class="ms-rte-layoutszone-inner" style="min-height: 60px; word-wrap: break-word">\
									<p></p>\
								</div>\
							</div>\
						</td>\
						<td style="width: 33.3%">\
							<div class="ms-rte-layoutszone-outer" style="width: 100%">\
								<div class="ms-rte-layoutszone-inner" style="min-height: 60px; word-wrap: break-word">\
									<p></p>\
								</div>\
							</div>\
						</td>\
					</tr>\
				</tbody>\
			</table>\
			<span id="layoutsData" style="display: none">false,false,2</span>'
			break;
		}
		case "two columns":
		{
			layoutText = '<table id="layoutsTable" style="width: 100%">\
				<tbody>\
					<tr style="vertical-align: top">\
						<td style="width: 49.95%">\
							<div class="ms-rte-layoutszone-outer" style="width: 100%">\
								<div class="ms-rte-layoutszone-inner" style="min-height: 60px; word-wrap: break-word">\
									<p></p>\
								</div>\
							</div>\
						</td>\
						<td style="width: 49.95%">\
							<div class="ms-rte-layoutszone-outer" style="width: 100%">\
								<div class="ms-rte-layoutszone-inner" style="min-height: 60px; word-wrap: break-word">\
									<p></p>\
								</div>\
							</div>\
						</td>\
					</tr>\
				</tbody>\
			</table>\
			<span id="layoutsData" style="display: none">false,false,2</span>'
			break;
		}
		case "two columns with header":
		{
			layoutText = '<table id="layoutsTable" style="width:100%;">\
				<tbody>\
					<tr style="vertical-align:top;">\
						<td colspan="2">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
									<p></p>\
								</div>\
							</div>\
						</td>\
					</tr>\
					<tr style="vertical-align:top;">\
						<td style="width:49.95%;">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
									<p></p>\
								</div>\
							</div>\
						</td>\
						<td class="ms-wiki-columnSpacing" style="width:49.95%;">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
									<p></p>\
								</div>\
							</div>\
						</td>\
					</tr>\
				</tbody>\
			</table>\
			<span id="layoutsData" style="display:none;">true,false,2</span>';
			break;
		}
		case "two columns with header and footer":
		{
			layoutText = '<table id="layoutsTable" style="width:100%;">\
				<tbody>\
					<tr style="vertical-align:top;">\
						<td colspan="2">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
									​<br>\
								</div>\
							</div>\
						</td>\
					</tr>\
					<tr style="vertical-align:top;">\
						<td style="width:49.95%;">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
									<p></p>\
								</div>\
							</div>\
						</td>\
						<td class="ms-wiki-columnSpacing" style="width:49.95%;">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
								</div>\
							</div>\
						</td>\
					</tr>\
					<tr style="vertical-align:top;">\
						<td colspan="2">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
								</div>\
							</div>\
						</td>\
					</tr>\
				</tbody>\
			</table>\
			<span id="layoutsData" style="display:none;">true,true,2</span>';
			break;
		}
		case "three columns":
		{
			layoutText = '<table id="layoutsTable" style="width:100%;">\
				<tbody>\
					<tr style="vertical-align:top;">\
						<td style="width:33.3%;">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
								</div>\
							</div>\
						</td>\
						<td class="ms-wiki-columnSpacing" style="width:33.3%;">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
								</div>\
							</div>\
						</td>\
						<td class="ms-wiki-columnSpacing" style="width:33.3%;">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
								</div>\
							</div>\
						</td>\
					</tr>\
				</tbody>\
			</table>\
			<span id="layoutsData" style="display:none;">false,false,3</span>';
			break;
		}
		case "three columns with header":
		{
			layoutText = '<table id="layoutsTable" style="width:100%;">\
				<tbody>\
					<tr style="vertical-align:top;">\
						<td colspan="3">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
								</div>\
							</div>\
						</td>\
					</tr>\
					<tr style="vertical-align:top;">\
						<td style="width:33.3%;">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
								</div>\
							</div>\
						</td>\
						<td class="ms-wiki-columnSpacing" style="width:33.3%;">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
								</div>\
							</div>\
						</td>\
						<td class="ms-wiki-columnSpacing" style="width:33.3%;">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
								</div>\
							</div>\
						</td>\
					</tr>\
				</tbody>\
			</table>\
			<span id="layoutsData" style="display:none;">true,false,3</span>';
			break;
		}
		case "three columns with header and footer":
		{
			layoutText = '<table id="layoutsTable" style="width:100%;">\
				<tbody>\
					<tr style="vertical-align:top;">\
						<td colspan="3">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">​\
								</div>\
							</div>\
						</td>\
					</tr>\
					<tr style="vertical-align:top;">\
						<td style="width:33.3%;">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">​​​​\
								</div>\
							</div>\
						</td>\
						<td class="ms-wiki-columnSpacing" style="width:33.3%;">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
								</div>\
							</div>\
						</td>\
						<td class="ms-wiki-columnSpacing" style="width:33.3%;">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
								</div>\
							</div>\
						</td>\
					</tr>\
					<tr style="vertical-align:top;">\
						<td colspan="3">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
								</div>\
							</div>\
						</td>\
					</tr>\
				</tbody>\
			</table>\
			<span id="layoutsData" style="display:none;">true,true,3</span>'
			break;
		}
		default:
		{
			layoutText = '<table id="layoutsTable" style="width:100%;">\
				<tbody>\
					<tr style="vertical-align:top;">\
						<td style="width:100%;">\
							<div class="ms-rte-layoutszone-outer" style="width:100%;">\
								<div class="ms-rte-layoutszone-inner" role="textbox" aria-haspopup="true" aria-autocomplete="both" aria-multiline="true">\
									<p>\
										​​<br>\
									</p>\
									<br><br>\
								</div>\
							</div>\
						</td>\
					</tr>\
				</tbody>\
			</table>\
			<span id="layoutsData" style="display:none;">false,false,1</span>'
		}
	}
	return layoutText;
}
function createPublishingPage( webUrl, newPageName, title, layout, backFunction )
{
	//listUrl is not used yet. Pages library is a default storage
	context = new SP.ClientContext( preparePath( webUrl ) );
	web = context.get_web();
	pubWeb = SP.Publishing.PublishingWeb.getPublishingWeb( context, web );
	context.load( web );
	context.load( pubWeb );
	context.executeQueryAsync(
		function ( sender, args )
		{
			pageInfo = new SP.Publishing.PublishingPageInformation();
			newPage = pubWeb.addPublishingPage( pageInfo );
			context.load( newPage );
			pageItem = newPage.get_listItem();
			var urlValue = new SP.FieldUrlValue();
			urlValue.set_url( webUrl + "/" + "_catalogs/masterpage/" + layout );
			urlValue.set_description( layout );
			pageItem.set_item( 'PublishingPageLayout', urlValue );
			pageItem.set_item( 'Title', title );
			pageItem.set_item( 'FileLeafRef', newPageName );
			pageItem.update ()
			context.executeQueryAsync(
				function ( sender, args )
				{
					publishFile( webUrl, webUrl + '/Pages/' + newPageName, backFunction );
				},
				function ( sender, args )
				{
					alert( 'Error when page creation: ' + args.get_message() + '\n' + args.get_stackTrace() );
					backFunction();
				} );
		},
		function ( sender, args )
		{
			alert( 'Error when web reading: ' + args.get_message() + '\n' + args.get_stackTrace() );
			backFunction();
		} );
}