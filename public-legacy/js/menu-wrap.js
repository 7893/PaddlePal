function menu_wrap_init() {
	var button = "<button class=\"close-button\">Close Menu</button>";
	var html = "<nav class=\"menu\"><div class=\"icon-list\"><a href=\"/\"><span class=\"icon-home\">&nbsp;&nbsp;首页</span></a><a href=\"matchtime.html\"><span class=\"icon-li\">&nbsp;&nbsp;比赛秩序</span></a><a href=\"matchresult.html\"><span class=\"icon-bullhorn\">&nbsp;&nbsp;成绩公告</span></a><a href=\"play.html\"><span class=\"icon-bell\">&nbsp;&nbsp;检录信息</span></a><a href=\"matchprogress.html\"><span class=\"icon-equalizer\">&nbsp;&nbsp;赛程进度</span></a><a href=\"inquiry.html\"><span class=\"icon-search\">&nbsp;&nbsp;赛程查询</span></a><a href=\"range.html\"><span class=\"icon-sort-amount-asc\">&nbsp;&nbsp;比赛排名</span></a><a href=\"PlayinfoPage\"><span class=\"icon-table\">&nbsp;&nbsp;节目单</span></a><a href=\"download/\"><span class=\"icon-cloud-download\">&nbsp;&nbsp;文档下载</span></a><a href=\"notice.html\"><span class=\"icon-bubble\">&nbsp;&nbsp;发送消息</span></a></div></nav>";
	$("#menu-wrap").html(html);
}
function menu_event_list(menu_id, hdl_page) {
	var item = new Array();
	var html = "<ul id=\"accordion\" class=\"accordion\"><li id=\"liMT\"><div class=\"link\"><i class=\"fa fa-male\" aria-hidden=\"true\"></i>男子团体<i class=\"fa fa-chevron-down\"></i></div><ul id=\"MT\" class=\"submenu\"></ul></li><li id=\"liWT\"><div class=\"link\"><i class=\"fa fa-female\" aria-hidden=\"true\"></i>女子团体<i class=\"fa fa-chevron-down\"></i></div><ul id=\"WT\" class=\"submenu\"></ul></li><li id=\"liXT\"><div class=\"link\"><i class=\"fa fa-user\" aria-hidden=\"true\"></i>混合团体<i class=\"fa fa-chevron-down\"></i></div><ul id=\"XT\" class=\"submenu\"></ul></li><li id=\"liMS\"><div class=\"link\"><i class=\"fa fa-mars\" aria-hidden=\"true\"></i>男子单打<i class=\"fa fa-chevron-down\"></i></div><ul id=\"MS\" class=\"submenu\"></ul></li><li id=\"liWS\"><div class=\"link\"><i class=\"fa fa-venus\" aria-hidden=\"true\"></i>女子单打<i class=\"fa fa-chevron-down\"></i></div><ul id=\"WS\" class=\"submenu\"></ul></li><li id=\"liXS\"><div class=\"link\"><i class=\"fa fa-user-o\" aria-hidden=\"true\"></i>混合单打<i class=\"fa fa-chevron-down\"></i></div><ul id=\"XS\" class=\"submenu\"></ul></li><li id=\"liMD\"><div class=\"link\"><i class=\"fa fa-mars-double\" aria-hidden=\"true\"></i>男子双打<i class=\"fa fa-chevron-down\"></i></div><ul id=\"MD\" class=\"submenu\"></ul></li><li id=\"liWD\"><div class=\"link\"><i class=\"fa fa-venus-double\" aria-hidden=\"true\"></i>女子双打<i class=\"fa fa-chevron-down\"></i></div><ul id=\"WD\" class=\"submenu\"></ul></li><li id=\"liXD\"><div class=\"link\"><i class=\"fa fa-venus-mars\" aria-hidden=\"true\"></i>混合双打<i class=\"fa fa-chevron-down\"></i></div><ul id=\"XD\" class=\"submenu\"></ul></li></ul>";
	$("#"+menu_id).html(html);
	html = '';
	$.getJSON('rawinfo', function(data) {
		$.each(data.match, function (mi, match) {
			var url = hdl_page;
			if (url == "MatchResultPage") {
				url = match.groups > 0 ? "result_loop.html" : "result_cull.html";
			} else if (url == "MatchTimePage") {
				url = match.groups > 0 ? "schedule_loop.html" : "result_cull.html";
			}
			var li = "<li><a href=\"#\" rel=\"" + match.key + "\" onClick=\"form_request('" + url + "','key',this.rel);\">" + (match.title != "" ? match.title : match.key) + "</a></li>";
			if (typeof(item[match.event]) == "undefined")
				item[match.event] = '';
			item[match.event] += li;
		});
		$.each(['MT','WT','XT','MS','WS','XS','MD','WD','XD'],function(i,v) {
			if (typeof(item[v]) == "undefined") {
				$("#li"+v).hide();
			} else {
				$("#"+v).html(item[v]);
			}
		});
	});
}
