function refresh_match(url, key) {
	$.post(url,{key:key},function(data) {
		var table = '', sex = '';
		var isLoop = (data.groups > 0 ? true : false);

		if (data.event.indexOf("M") >= 0) {
			sex = 'm';
		} else if (data.event.indexOf("W") >= 0) {
			sex = 'w';
		} else {
			sex = 'x';
		}

		// 标题
		$("#title").text(data.title.length > 0 ? data.title : data.key);
		$("#title_bg").addClass('event-header-' + sex);

		table = '<div class="swiper-slide"><table class="loop">';

		// 表头
		table += '<tr>';
		$(data.info.title).each(function(t, title) {
			table += '<th class="tg-header-' + sex + '">' + title + '</th>';
		});
		table += '</tr>';

		if (isLoop) {									// 分组循环
			$(data.info.rank).each(function(g, group) {	// 遍历各组
				$(group.rows).each(function(r, row) {	// 遍历组内各行
					table += '<tr>';
					if (r == 0) {						// 小组名
						table += '<td rowspan="' + group.rows.length + '">';
						table += group.group;
						table += '</td>';
					}
					$(row).each(function(c, col) {		// 遍历组内各列
						table += '<td>' + col + '</td>';
					});
					table += '</tr>';
				});
			});
		} else {										// 淘汰
			$(data.info.rank).each(function(r, row) {	// 遍历各行
				table += '<tr>';
				$(row).each(function(c, col) {			// 遍历各列
					table += '<td>' + col + '</td>';
				});
				table += '</tr>';
			});
		}
		table += '</table></div>';
		$("#table").html(table);
	},"json");
}
