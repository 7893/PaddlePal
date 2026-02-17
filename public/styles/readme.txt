#################################### 
# 		自定义记分单函数
####################################
#	RD_Info			// 比赛名称
#	RD_Addr			// 比赛地点
#	RD_Gtype		// 组别
#	RD_Project		// 项目
#	RD_Phase		// 阶段
#	RD_Additional		// 附加
#	RD_Title		// 抬头
#	RD_Pid			// 场次号
#	RD_Group		// 小组号
#	RD_Loop			// 轮次
#	RD_Date			// 日期
#	RD_Time			// 时间
#	RD_Table		// 球台
#	RD_Lid			// 左位置号
#	RD_Rid			// 右位置号
#	RD_Lname		// 左队员名
#	RD_Rname		// 右队员名
#	RD_Lteam		// 左队名
#	RD_Rteam		// 右队名
#	RD_Bureau		// 比赛局数
#	RD_Promotion		// 晋级信息
#	RD_LplayerID		// 左选手ID
#	RD_RplayerID		// 右选手ID
#	RD_Split		// 分隔符(一张纸打印多张记分单)
#	RD_PageBreak		// 插入Excel分页符	
####
#		以下函数为团体专用
####
#	RD_Tplay		// 比赛团体场数
#	RD_ModeInfo		// 团体各场对抗项目(团体设定中：项目列)
#	RD_Exchange		// 是否主客交换
#	RD_Lmode		// 团体左对抗模式(团体设定中：主场列)
#	RD_Rmode		// 团体右对抗模式(团体设定中：客场列)
#	RD_ModeName		// 团体是否打印各场对抗选手姓名(在录入成绩界面，挑选出场顺序后，打印记分单时，该函数返回Y，否则返回N)
#	RD_LmodeName		// 团体对抗左选手名
#	RD_RmodeName		// 团体对抗右选手名
#	RD_LmodeID		// 团体对抗左选手ID
#	RD_RmodeID		// 团体对抗右选手ID
#	RD_Lmember		// 团体左成员列表
#	RD_Rmember 		// 团体右成员列表
#	RD_LmemberID		// 团体左成员ID列表
#	RD_RmemberID 		// 团体右成员ID列表
####
#		当前函数适用如下几种组合
####
#	1. 单独使用, 			如：RD_Project
#	2. 加前后缀字符串,		如：2016年挑战赛$(RD_Project)单项记分单
#	3. 多个函数组合使用，	如：2016年挑战赛$(RD_Gtype)-$(RD_Project)单项记分单
#####################################