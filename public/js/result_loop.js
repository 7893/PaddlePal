var table_nr = 2;					// 每列显示表个数
var mySwiper = null;
var swiper_lock = false;
var match = null;

function is_multi_sliders() {
	// According to htdocs\templets\metro\js\swiper.initialize.js(breakpoints)
	var sliders = [898,1598,2198,0xffffffff];
	var ret = false;

	if ((match != null) || (table_nr >= 1)) {
		for (var i = 0; i < sliders.length; i++) {
			if (window.innerWidth <= sliders[i]) {
				if (i > 0) {
					ret = (match.score.length >= table_nr);
				}
				break;
			}
		}
	}
	return ret;
}
function swiper_refresh(data) {
	var html = '', table = '', sex = '';
	var tables = 0, cols = 0, rows = 0;
	var isTeam = false, isDouble = false;

	if (table_nr <= 0) {
		table_nr = 1;
	} else if (table_nr > data.score.length) {
		table_nr = data.score.length;
	}
	if (data.event.indexOf("M") >= 0) {
		sex = 'm';
	} else if (data.event.indexOf("W") >= 0) {
		sex = 'w';
	} else {
		sex = 'x';
	}
	if (data.event.indexOf("T") >= 0) {
		isTeam = true;
	} else if (data.event.indexOf("D") >= 0) {
		isDouble = true;
	}
	$("#title").text(data.title.length > 0 ? data.title : data.key);
	$("#title_bg").addClass('event-header-' + sex);

	$(data.score).each(function(g, group) {
		rows = Math.max(rows, group.length);
	});
	$(data.score).each(function(g, group) {
		var upper = (parseInt(g / table_nr) + 1) * table_nr;
		upper = Math.min(upper, data.score.length);

		if (tables == 0) {
			for (var i = g; i < upper; i++) {
				var sg = data.score[i];
				cols = Math.max(cols, sg[0].length);
			}
			table = '<div class="swiper-slide"><table class="loop">';
		} else {
			var sg = data.score[g - 1];
			// 当超过1个滑块时，插入空白行，实现多个表格行对齐
			if (is_multi_sliders() && sg.length < rows) {
				// FIXME ?
				table += '<tr><td class="tg-blank"><br><br></td></tr>';
				// table += '<tr><td class="tg-blank-i"><br><br></td></tr>';
			}
			table += '<tr><td class="tg-blank"></td></tr>';
		}
		var colspan = (group[0].length < cols);
		$(group).each(function(l, line) {
			var tr = '<tr>';
			$(line).each(function(c, cell) {
				var td = '';

				if (l == 0) {
					if (c == 0) {
						td += '<td class="tg-number-b"></td><td class="tg-name-b"></td></tr><tr>';
						td += '<th class="tg-header-' + sex + '" colspan="2">' + cell + '</th>';
					} else if (c == (line.length - 3) && colspan) {
						td += '<th class="tg-header-' + sex + '" colspan="2">' + cell + '</th>';
					} else {
						td += '<th class="tg-header-' + sex + '">' + cell + '</th>';
					}
				} else {
					if (c == 0) {
						td += '<td class="tg-number-' + sex + ' tg-number-i">' + cell[0] + '</td>';
						td += '<td class="tg-name-' + sex + '">';
						if (isDouble) {
							td += '<span class="pname-' + sex + '-s">' + cell[1] + '</span>';
						} else {
							td += '<span class="pname-' + sex + '">' + cell[1] + '</span>';
						}
						// name != team
						if (cell[1] != cell[2]) {
							td += '<br><span class="tname">' + cell[2] + '</span>';
						}
						td += '</td>';
					} else if ((c + 3) == line.length) {
						if (colspan) {
							td += '<td class="tg-points-2c" colspan="2">' + cell + '</td>';
						} else {
							td += '<td class="tg-points-2c">' + cell + '</td>';
						}
					} else if ((c + 2) == line.length) {
						td += '<td class="tg-calculate">' + cell + '</td>';
					} else if ((c + 1) == line.length) {
						if (cell.length > 1)
							td += '<td class="tg-rank-w">' + cell[0] + '</td>';
						else
							td += '<td class="tg-rank-l">' + cell + '</td>';
					} else {
						if (l == c) {
							td += '<td class="tg-gray"></td>';
						} else {
							// var isString = ((typeof(cell) == 'string') && (cell.constructor == String));
							var isWin = (cell.length > 2) && (cell[1] == 'red');
							var isTime = (cell.length > 2) && (cell[1] == 'time');
							var isPid = (cell.length > 2) && (cell[2] != '');
							var strTxt = cell[0];

							// 单元格上只显示大比分，去掉积分
							if (strTxt.indexOf('---') >= 0) {
								var item = strTxt.split('---');
								strTxt = item[0];               // 显示一行
								// strTxt = '<br>' + item[0] + '<br>';	// 显示三行
							}
							td += '<td ';
							if (c > l) {				// 右上半区样式
								if (isTime)				// 显示时间
									td += 'class="tg-schedule-r-g"';
								else					// 显示大比分
									td += isWin ? 'class="tg-win"' : 'class="tg-loss"';
							} else {					// 左下半区样式
								if (isTime) {			// 显示时间
									td += 'class="tg-schedule-l-g"';
								} else {
									if (!isTeam)		// 详细比分
										td += isWin ? 'class="tg-win-s"' : 'class="tg-loss-s"';
									else				// 大比分
										td += isWin ? 'class="tg-win"' : 'class="tg-loss"';
								}
							}
							td += '>';
                            if (isPid) {
                                if (isTeam) {
                                    td += '<a href=/result_team.html?pid=' + cell[2] + '>';
                                } else {
                                    td += '<a href=/result_singles.html?pid=' + cell[2] + '>';
                                }
                                td += strTxt + '</a>';
                            } else {
                                td += strTxt;
                            }
                            td += '</td>';
						}
					}
				}
				tr += td;
			});
			tr += "</tr>";
			table += tr;
		});
		tables = tables + 1;

		if ((g + 1) == upper) {
			table += "</table></div>";
			html += table;
			tables = 0;
		}
	});
	$("#table").html(html);
	swiper_lock = true;
	mySwiper.update();
	swiper_lock = false;
}
function refresh_match(url, key) {
	$.post(url,{key:key},function(data) {
		match = data;
		swiper_refresh(match);
	},"json");
}
function swiper_callback() {
	if (match != null && swiper_lock == false) {
		swiper_refresh(match);
	}
}