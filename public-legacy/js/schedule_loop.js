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
						if (isTeam) {
							td += '<span class="tname-' + sex + '">' + cell[1] + '</span>';
						}
						else if (isDouble) {
							td += '<span class="dname-' + sex + '">' + cell[1] + '</span>';
						} else {
							td += '<span class="pname-' + sex + '">' + cell[1] + '</span>';
						}
						// name != team
						// if (cell[1] != cell[2]) {
						if (!isTeam) {
							td += '<br><span class="tname">' + cell[2] + '</span>';
						}
						td += '</td>';
					} else if (c >= (line.length - 3)) {
						if (c == (line.length - 3) && colspan) {
							td += '<td colspan="2"></td>';
						} else {
							td += '<td></td>';
						}
					} else {
						if (l == c) {
							td += '<td class="tg-gray"></td>';	// 中间灰色单元
						} else {
							if (c > l)							// 右上半区
								td += '<td class="tg-schedule-r">' + cell + '</td>';
							else								// 左下半区
								td += '<td class="tg-schedule-l">' + cell + '</td>';
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