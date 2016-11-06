var userScores = {};
setTimeout(function() {
		processUserNames(function() {
			processPage(function() {
				processTweets();
			});
		});
}, 2000);


function processUserNames(callback){
	var classNames = ["DashboardProfileCard-screennameLink", "username", "twitter-atreply",
		"ProfileHeaderCard-screennameLink", "ProfileCard-screennameLink"];
		processUserClassName(classNames, 0, function() {
			callback();
		});
}

function processUserClassName(classNames, q, callback){
	className = classNames[q];
	var tags = $("." + className);
	getScoreByUsername(tags, 0, function() {
		if (q < classNames.length) {
			processUserClassName(classNames, q + 1, callback);
		}
		else {
			callback();
		}
	});
}

function getScoreByUsername(tags, i, callback) {
	var name = $(tags[i]).text().trim();
	if (name in userScores) {
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

function processPage(callback){
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
	api.getDataByUsername(name, function(data) {
		renderUserPage(data);
		callback();
	});
}

function renderUserPage(data){
	//console.log(data);
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
	$("body").append("<div class='hoya-hover' id='report-popup'><div class='hoya-popup'>"+name+score+complaints+"</div></div>");
	$("#report-popup").click(function(){
		$("#report-popup").remove();
	})
}

function processTweets() {
	var tweetsLi = $("li[data-item-type='tweet']");
	var data = [];

	for (var i = 0; i < tweetsLi.length; i++) {
		var  val = tweetsLi[i];
		var tid = $(val).attr('data-item-id');
		var tweetText = $($('.tweet-text')[i]).text();
		var userid = $($(".username.js-action-profile-name")[i]).text();
		data.push({"tweet_id" : tid, "tweet" : tweetText, "user_id" : userid});
	}



	api.getTweetAnalysis(data, function(response_data) {
		$.each(response_data, function(i, v) {
			var tid = v['tweet_id'];
			var abusive = v['abusive'];
			if (abusive === 'true') {
				var d = document.createElement('div');
				$(d).append('<div class="displayMessage">We found this tweet to be abusive. </div>');

				var showButton = document.createElement("div");
				showButton.className = 'showTweet';
				showButton.innerHTML = "Show Tweet";
				$(d).append(showButton);

				d.className = "hoya-blackbox";
				d.id = "hoya-black-" + tid;

				(function(tid) {
					$(showButton).on("click", function() {
						$("#hoya-black-" + tid).hide();
					});
				})(tid);

				$("li[data-item-id='"+tid+"']").append(d);
			}
		});
	});
}
