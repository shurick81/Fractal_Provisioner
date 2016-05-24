<%@ Page language="C#" MasterPageFile="~masterurl/default.master"    Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage,Microsoft.SharePoint,Version=15.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" meta:progid="SharePoint.WebPartPage.Document"  %>
<asp:Content contentplaceholderid="PlaceHolderMain" runat="server">
<div><a href="#" onclick="StartFractalInstallation();">Start installation</a></div>
<div>Installation status:</div>
<div id="installationStatus"></div>
<script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
<script type="text/javascript" src="/_layouts/15/sp.publishing.js"></script>
<script type="text/javascript" src="utilities.js"></script>
<script type="text/javascript" src="provisioning.js"></script>
<script type="text/javascript" src="features.js"></script>
<script type="text/javascript" src="sites.js"></script>
<script type="text/javascript" src="webs.js"></script>
<script type="text/javascript" src="lists.js"></script>
<script type="text/javascript" src="columns.js"></script>
<script type="text/javascript" src="folders.js"></script>
<script type="text/javascript" src="folderscontent.js"></script>
<script type="text/javascript" src="pages.js"></script>
<script type="text/javascript" src="navigation.js"></script>
<script type="text/javascript" src="webparts.js"></script>
<script type="text/javascript" src="items.js"></script>
<script type="text/javascript" src="usercustomactions.js"></script>
<script type="text/javascript" src="permissions.js"></script>
<script type="text/javascript" src="portal.js"></script>
<style>
	.fractal-object .fractal-object
	{ padding-left: 20px }
	.fractal-object.processing > h1, .fractal-object.processing > h2, .fractal-object.processing > h3, .fractal-object.processing > h4, .fractal-object.processing > h5, .fractal-object.processing > h6, .fractal-object.processing > h7
	{ font-weight: bold }
	.fractal-object.done > h1, .fractal-object.done > h2, .fractal-object.done > h3, .fractal-object.done > h4, .fractal-object.done > h5, .fractal-object.done > h6, .fractal-object.done > h7
	{ color: gray }
	.fractal-object > h1, .fractal-object > h2
	{ font-size: 90%; min-height: 1em; }
</style>
</asp:Content>
