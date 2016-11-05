window.setInterval(function(){
	processUserNames();
	processPage();
}, 1000);

function processUserNames(){
	var classNames = ["DashboardProfileCard-screennameLink", "username", "twitter-atreply",
		"ProfileHeaderCard-screennameLink", "ProfileCard-screennameLink"];
	for(var i=0; i<classNames.length; i++){
		processUserClassName(classNames[i]);
	}
}

function processUserClassName(className){
	var tags = $("." + className);
	for(var i=0; i<tags.length; i++){
		var name = $(tags[i]).text().trim();
		if(! isSane(name)){
			continue;
		}
		if($(tags[i]).hasClass("hoyahacks")){
			continue;
		}
		var data = api.getScoreByUsername(name);
		renderUserName(data, tags[i]);
	}
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
	var data = api.getDataByUsername(name);
	renderUserPage(data);
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