var clientSideCalc = function(anchorID){
	var width = document.getElementById('#' + anchorID + '').offsetWidth;
	var html = "<script> "
	html += "var sideBarWidth = '" + width
	html += "'; </script>"
	return html;
}
module.exports = clientSideCalc;