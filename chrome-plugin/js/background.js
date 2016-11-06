chrome.browserAction.onClicked.addListener(function(tab) { main(tab); });


function main(tab){
	console.log(tab);
	alert("REPORT PERSON!!");
}
