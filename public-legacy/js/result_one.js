function GetQueryString(name) {
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);//search,查询？后面的参数，并匹配正则
     if(r!=null)return  unescape(r[2]); return null;
}

function merge_str(a, b) {
    if ((b != "") && (b != a))
        return (a + '/' + b);
    return a;
}

function fill_single (data) {
    var table = '';
    $("#event-header").text(data.name);             
    $("#event-schedule").text(data.play.pid + ' | ' + data.play.date + '日 ' + data.play.time + ' | ' + data.play.table + '台');
//    $("#tg-placeid-1").text(data.play.seat1);
//    $("#tg-placeid-2").text(data.play.seat2);
    $("#tg-playerName-1").text('' + data.play.seat1 + '. ' + merge_str(data.play.player1, data.play.player2));
    $("#tg-playerTeam-1").text(merge_str(data.play.team1, data.play.team2));
    $("#tg-playerName-2").text('' + data.play.seat2 + '. ' + merge_str(data.play.player3, data.play.player4));
    $("#tg-playerTeam-2").text(merge_str(data.play.team3, data.play.team4));
    $("#tg-result").text(data.play.result.replace(/'/, ""));

    table += '<table id="score_table" class="table table-striped tb_ScoreSheet">';
    $(data.play.score).each(function(i, score) {
        var ls = score[0];
        var rs = score[1];

        if ((ls == 0xffff) || (rs == 0xffff) || (ls == -1) || (rs == -1)) {
            ls = ((ls == 0xffff || ls == -1) ? '弃权' : '');
            rs = ((rs == 0xffff || rs == -1) ? '弃权' : '');
        }

        table += '<tr>';
        if (i % 2 == 0) {
            table += '<td class="tg-mark-l-w-s"></td>';
            table += '<td class="tg-points-w">' + ls + '</td>';
            table += '<td class="tg-games">第' + (i + 1) + '局</td>';
            table += '<td class="tg-points-l">' + rs + '</td>';
            table += '<td class="tg-mark-r-l-s"></td>';
        } else {
            table += '<td class="tg-mark-l-l-s"></td>';
            table += '<td class="tg-points-l">' + ls + '</td>';
            table += '<td class="tg-games">第' + (i + 1) + '局</td>';
            table += '<td class="tg-points-w">' + rs + '</td>';
            table += '<td class="tg-mark-r-w-s"></td>';
        }
        table += '</tr>';
   });
   table += '</table>';
   $("#score_table").html(table);
}

function fill_team (data) {
    var html = '';

    $("#event-header").text(data.name);             
    $("#event-schedule").text(data.play.pid + ' | ' + data.play.date + '日 ' + data.play.time + ' | ' + data.play.table + '台');
//    $("#tg-placeid-1").text(data.play.seat1);
//    $("#tg-placeid-2").text(data.play.seat2);
    $("#tg-playerName-1").text('' + data.play.seat1 + '. ' + merge_str(data.play.player1, data.play.player2));
    $("#tg-playerName-2").text('' + data.play.seat2 + '. ' + merge_str(data.play.player3, data.play.player4));
    $("#tg-result").text(data.play.result.replace(/'/, ""));

    $(data.play.score).each(function(i, score) {
        if (i < data.play.member.length) {
            var lp = 0;
            var rp = 0;
            $(score).each(function(j, mscore) {
                var ls = mscore[0] % 0xffff;
                var rs = mscore[1] % 0xffff;
                if (ls > rs)
                    lp ++;
                else if (ls < rs)
                    rp ++;
            });
            html += '<section class="section bg-white arrow-white clearfix"><div class="container text-center"><table class="table table-striped tb_ScoreSheet">';
            // tr
            html += '<tr><td class="tg-mark-l-w"></td><td class="tg-playerName2">' + merge_str(data.play.member[i].l1, data.play.member[i].l2) + '</td>';
            html += '<td class="tg-gamepoints">'+ lp +':'+ rp +'</td>';
            html += '<td class="tg-playerName2">' + merge_str(data.play.member[i].r1, data.play.member[i].r2) + '</td><td class="tg-mark-r-l"></td></tr>';

        $(score).each(function(j, mscore) {
            var ls = mscore[0];
            var rs = mscore[1];
            
            if ((ls == 0xffff) || (rs == 0xffff) || (ls == -1) || (rs == -1)) {
                ls = ((ls == 0xffff || ls == -1) ? '弃权' : '');
                rs = ((rs == 0xffff || rs == -1) ? '弃权' : '');
            }

            html += '<tr>';
            if (j % 2 == 0) { 
                html += '<td class="tg-mark-l-w-s"></td>';
                html += '<td class="tg-points-w">' + ls + '</td>';
                html += '<td class="tg-games">第' + (j + 1)+ '局</td>';
                html += '<td class="tg-points-l">' + rs + '</td>';
                html += '<td class="tg-mark-r-l-s"></td>';
            } else {
                html += '<td class="tg-mark-l-l-s"></td>';
                html += '<td class="tg-points-l">' + ls + '</td>';
                html += '<td class="tg-games">第' + (j + 1)+ '局</td>';
                html += '<td class="tg-points-w">' + rs + '</td>';
                html += '<td class="tg-mark-r-w-s"></td>';
            }
            html += '</tr>';
        });
        html += '</table></div></section>';
        }
    });
     $("#score_table").html(html);
    console.log(data);
}

function load_play_info(pid) {
    $.post('oneplay',{pid:pid},function(data) {
        if (data.event.indexOf("T") >= 0) {
            fill_team(data);
        } else {
            fill_single(data);
        }
	},"json");
}

$(document).ready(function(){
    var pid = GetQueryString('pid');
    if (pid != null) {
        load_play_info(pid);
    }
});
