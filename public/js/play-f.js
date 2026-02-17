	var score_bar_enable = false;		// 是否开启水平滚动条
	var direction = 0;
	var pos = 0;
	var name_handle = false;
	var score_handle = false;
	var bar1, bar3, bar4;

	// 更新垂直滚动内容
	function name_refresh() {
		$.getJSON('playing?option=json', function(playing) {
				var maxTable = 0;
				var tbody = '';
				$.each(playing.array, function(i, obj) {
					maxTable = Math.max(maxTable, obj.tb);
				});
				for (var i = 1; i <= maxTable; i++) {
					var tdArray = new Array("", "", "", "", "", "", "", "");
					var find = false;
					for (var j = 0; j < playing.array.length; j++) {
						var obj = playing.array[j];
						if (obj.tb == i && obj.nl.length > 0 && obj.nr.length > 0) {
							tdArray[0] = obj.tb;
							tdArray[1] = obj.tm;
							tdArray[2] = obj.gp + obj.ev;
							tdArray[3] = obj.nl;
							tdArray[4] = "<img class=\"flagImage\" src=\"/images/flag/"+obj.tl+".png\">";
							tdArray[5] = "—";
							tdArray[6] = "<img class=\"flagImage\" src=\"/images/flag/"+obj.tr+".png\">";
							tdArray[7] = obj.nr;
							find = true;
							break;
						}
					}

					if (find) {
						tbody += "<tr>";
						for (var l = 0; l < tdArray.length; l++) {
							tbody += "<td>" + tdArray[l] + "</td>";
						}
						tbody += "</tr>";
					}
				}
				$("#alternatecolor tbody").html(tbody);
				$("#alternatecolor tbody tr:odd").addClass("odd");
				$("#alternatecolor tbody tr:even").addClass("even");
				$("#alternatecolor tr:gt(0)").each(function(i) {
					$(this).children("td").each(function(i) {
						if (i == 0) {
							$(this).addClass('t_table');
						} else if (i == 2) {
							var event = $(this).text();
							if (event.indexOf("M") >= 0)
								$(this).addClass('m_event');
							else if (event.indexOf("W") >= 0)
								$(this).addClass('w_event');
							else
								$(this).addClass('x_event');
						} else if (i == 3) {
							$(this).addClass('l_name');
						} else if (i == 4) {
							$(this).addClass('flag');
						} else if (i == 6) {
							$(this).addClass('flag');
						} else if (i == 7) {
							$(this).addClass('r_name');
						}
					});
				});
			});
	}
	// 垂直滚动控制
	function name_scroll() {
		if (direction == 0) {
			window.scrollBy(0, +1);
			if (pos > document.body.scrollHeight)
				direction = 1;
			else
				pos++;
		} else {
			window.scrollBy(0, -1);
			if (pos == 0)
				direction = 0;
			else
				pos--;
		}
	}
	function is_after(a, b) {
		if (a.date > b.date)
			return true;
		else if (a.date < b.date)
			return false;
		if (a.time > b.time)
			return true;
		else if (a.time < b.time)
			return false;
		return false;
	}
	// 更新水平滚动内容
	function score_refresh() {
		$.getJSON('allplay', function(plays) {
			var pList = new Array();
			var tbody = '';
			var tdcount = 0;

			// 取出所有球台最后录入成绩的比赛
			for (t = 0; t < plays.tables; t++) {
				$.each(plays.match, function(m, match) {
					$.each(match.play, function(p, play) {
						if (play.state == 3 && play.table == (t + 1)) {
							if (typeof(play.is_time) == "undefined") {
								var time = play.time.split(":");
								play.is_time = true;
								play.match = match;
								play.time = parseInt(time[0]) * 60 + parseInt(time[1]);
							}
							if (typeof(pList[t]) == "undefined") {
								pList[t] = play;
							} else {
								if (is_after(play, pList[t])) {
									pList[t] = play;
								}
							}
						}
					});
				});
			}
			// 拼表格更新样式
			for (t = 0; t < plays.tables; t++) {
				var p = pList[t];
				if (typeof(p) == "undefined")
					continue;
				tdcount ++;
				var style = '';					// 项目样式
				var event = p.match.event;		// 项目
				var group = p.match.group;		// 组别
				var name_l = p.player1;			// 队员1
				var name_r = p.player3;			// 队员2
				if (p.player2 != "")
					name_l += '/' + p.player2;
				if (p.player4 != "")
					name_r += '/' + p.player4;
				if (event == 'MS' || event == 'MD' || event == 'MT')
					style = 'm_event';
				else if (event == 'WS' || event == 'WD' || event == 'WT')
					style = 'w_event';
				else
					style = 'x_event';
				tbody += "<td class=\"" + style + "\">" + group + event + " " + name_l + " vs " + name_r + "<br>" + p.result.replace(/'/,"") + "</td>";
			}
			// 拼接使得内容超过显示区，将产生滚动条，形成走马灯效果
			if (tbody != "") {
				for (; tdcount < 16; tdcount *= 2) {
					tbody += tbody;
				}
			}
			$("#score tbody").html("<tr align=center>" + tbody + "</tr>");
			bar4.innerHTML = bar3.innerHTML;
			if (score_handle == false)
				score_handle = setInterval(score_scroll, 20);
			// 抬高垂直表格的表脚高度，使垂直滚动能全部显示内容
			$("#alternatecolor tfoot tr").height($("#bar").height());
		});
	}
	// 水平滚动控制
	function score_scroll() {
		if (bar4.offsetWidth - bar1.scrollLeft <= 0) {
			bar1.scrollLeft -= bar3.offsetWidth;
		} else {
			var left = bar1.scrollLeft;
			bar1.scrollLeft ++;
			if (left == bar1.scrollLeft) {
				bar1.scrollLeft = 0;
			}
		}
	}
	$(document).ready(function() {
		$("#alternatecolor").freezeHeader();
		name_refresh();
		setInterval(name_refresh, 60000);		// 60s更新垂直滚动内容
		setInterval(name_scroll, 20);			// 水平滚动
		if (score_bar_enable) {
			bar1 = document.getElementById('bar1');
			bar3 = document.getElementById('bar3');
			bar4 = document.getElementById('bar4');
			score_refresh();
			setInterval(score_refresh, 60000);	// 60s更新水平滚动内容
		} else {
			$("#bar").hide();
		}
	});
