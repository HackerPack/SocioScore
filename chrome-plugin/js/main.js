var userScores = {};
$(document).ready(function() {
	//window.setInterval(function(){
		processUserNames();
		processPage();
	//}, 1000);	
});


function processUserNames(){
	var classNames = ["DashboardProfileCard-screennameLink", "username", "twitter-atreply",
		"ProfileHeaderCard-screennameLink", "ProfileCard-screennameLink"];
		processUserClassName(classNames, 0);
}

function processUserClassName(classNames, q){
	className = classNames[q];
	var tags = $("." + className);
	getScoreByUsername(tags, 0, function() {
		if (q < classNames.length)
			processUserClassName(classNames, q + 1);
	});
}

function getScoreByUsername(tags, i, callback) {
	var name = $(tags[i]).text().trim();
	if (name in userScores) {
		console.log("PRINTING");
		renderUserName(userScores[name], tags[i]);
	}
	if(! isSane(name) || $(tags[i]).hasClass("hoyahacks") || (name in userScores)){
		if (i < tags.length) {
			getScoreByUsername(tags, i + 1, callback);
			return;
		}
		else {
			callback();
			return;
		}
	}
	api.getScoreByUsername(name, tags[i], function(data, tag) {
		userScores[name] = data;
		console.log("PRINING");
		renderUserName(data, tag);
		if (i < tags.length) {
			getScoreByUsername(tags, i + 1, callback);
			return;
		}
		else {
			callback();
			return;
		}
	});
}

function isSane(name){
	return (name[0] == "@" && name.length > 1);
}

function renderUserName(data, tag){
	$(tag).addClass("hoyahacks");
	if(data.score > 80){
		$(tag).append("<span class='hoya-name green'>"+data.score+"</span>");
	}
	else if(data.score < 40){
		$(tag).append("<span class='hoya-name red'>"+data.score+"</span>");
	}
	else{
		$(tag).append("<span class='hoya-name yellow'>"+data.score+"</span>");
	}
}

function processPage(){
	$("#report-btn").remove();
	var url = window.location.href.split("/");
	if(url.length != 4){
		return;
	}
	if(url[3] == "following" || url[3] == "followers"){
		return;
	}
	var name = url[3].trim();
	if(name.length < 1){
		return;
	}
	api.getDataByUsername(name, renderUserPage);
}

function renderUserPage(data){
	var parent = $("#global-actions");
	var button = "<button class='btn hoya-btn' id='report-btn'>View Report</button";
	parent.append(button);
	$("#report-btn").click(function(){
		renderPopup(data);
	});
}

function renderPopup(data){
	var score = "";
	if(data.score > 80){
		score = "<div class='score green'>" + data.score + "</div>";
	}
	else if(data.score < 40){
		score = "<div class='score red'>" + data.score + "</div>";
	}
	else{
		score = "<div class='score yellow'>" + data.score + "</div>";
	}
	var name = "<div class='name'>" + data.name + "</div>";
	var complaints = "<div class='complaints'>" + data.complaints + " complaints raised against user</div>";
	var fake = "<div class='complaints'>" + data.fake_accounts + " fake accounts reported</div>";
	$("body").append("<div class='hoya-hover' id='report-popup'><div class='hoya-popup'>"+name+score+complaints+fake+"</div></div>");
	$("#report-popup").click(function(){
		$("#report-popup").remove();
	})
}
