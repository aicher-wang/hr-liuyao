/**
 * 八宫六十四卦基础数据
 * 京房易/火珠林体系
 * 
 * 每宫八卦，每卦数据包含：
 * - name: 卦名
 * - symbol: 上下卦象（上卦下卦）
 * - palace: 所属八宫
 * - order: 在宫中的序位（1=一世,2=二世,3=三世,4=四世,5=五世,6=游魂,7=归魂,8=八纯）
 * - shiYao: 世爻位置（1-6）
 * - yingYao: 应爻位置（1-6）
 * - stemTop: 上卦天干（纳甲用）
 * - stemBottom: 下卦天干
 * - earthlyBranches: 各爻地支 [初爻,...,上爻]
 * - element: 卦宫五行 木/火/土/金/水
 * - trigramTop: 上卦名（乾兑离震巽坎艮坤）
 * - trigramBottom: 下卦名
 * - judgment: 卦辞（简略）
 * - greatImage: 大象辞
 */

const bagua64 = [
  // ===== 乾宫八卦 ===== 五行：金
  { name: '乾为天', symbol: '乾上乾下', palace: '乾', order: 8, shiYao: 6, yingYao: 3,
    trigramTop: '乾', trigramBottom: '乾',
    stemTop: '壬', stemBottom: '甲',
    earthlyBranches: ['甲子', '甲寅', '甲辰', '壬午', '壬申', '壬戌'],
    element: '金',
    judgment: '元亨利贞',
    greatImage: '天行健，君子以自强不息' },

  { name: '天风姤', symbol: '乾上巽下', palace: '乾', order: 1, shiYao: 1, yingYao: 4,
    trigramTop: '乾', trigramBottom: '巽',
    stemTop: '壬', stemBottom: '辛',
    earthlyBranches: ['辛丑', '辛亥', '辛酉', '壬午', '壬申', '壬戌'],
    element: '金',
    judgment: '女壮，勿用取女',
    greatImage: '天下有风，姤。后以施命诰四方' },

  { name: '天山遁', symbol: '乾上艮下', palace: '乾', order: 2, shiYao: 2, yingYao: 5,
    trigramTop: '乾', trigramBottom: '艮',
    stemTop: '壬', stemBottom: '丙',
    earthlyBranches: ['丙辰', '丙午', '丙申', '壬午', '壬申', '壬戌'],
    element: '金',
    judgment: '亨，小利贞',
    greatImage: '天下有山，遁。君子以远小人' },

  { name: '天地否', symbol: '乾上坤下', palace: '乾', order: 3, shiYao: 3, yingYao: 6,
    trigramTop: '乾', trigramBottom: '坤',
    stemTop: '壬', stemBottom: '乙',
    earthlyBranches: ['乙未', '乙巳', '乙卯', '壬午', '壬申', '壬戌'],
    element: '金',
    judgment: '否之匪人，不利君子贞，大往小来',
    greatImage: '天地不交，否。君子以俭德辟难' },

  { name: '风地观', symbol: '巽上坤下', palace: '乾', order: 4, shiYao: 4, yingYao: 1,
    trigramTop: '巽', trigramBottom: '坤',
    stemTop: '辛', stemBottom: '乙',
    earthlyBranches: ['乙未', '乙巳', '乙卯', '辛未', '辛巳', '辛卯'],
    element: '金',
    judgment: '盥而不荐，有孚颙若',
    greatImage: '风行地上，观。先王以省方观民设教' },

  { name: '山地剥', symbol: '艮上坤下', palace: '乾', order: 5, shiYao: 5, yingYao: 2,
    trigramTop: '艮', trigramBottom: '坤',
    stemTop: '丙', stemBottom: '乙',
    earthlyBranches: ['乙未', '乙巳', '乙卯', '丙申', '丙戌', '丙子'],
    element: '金',
    judgment: '剥，不利有攸往',
    greatImage: '山附于地，剥。上以厚下安宅' },

  { name: '火地晋', symbol: '离上坤下', palace: '乾', order: 6, shiYao: 4, yingYao: 1, // 游魂
    trigramTop: '离', trigramBottom: '坤',
    stemTop: '己', stemBottom: '乙',
    earthlyBranches: ['乙未', '乙巳', '乙卯', '己酉', '己未', '己巳'],
    element: '金',
    judgment: '康侯用锡马蕃庶，昼日三接',
    greatImage: '明出地上，晋。君子以自昭明德' },

  { name: '火天大有', symbol: '离上乾下', palace: '乾', order: 7, shiYao: 3, yingYao: 6, // 归魂
    trigramTop: '离', trigramBottom: '乾',
    stemTop: '己', stemBottom: '甲',
    earthlyBranches: ['甲子', '甲寅', '甲辰', '己酉', '己未', '己巳'],
    element: '金',
    judgment: '元亨',
    greatImage: '火在天上，大有。君子以遏恶扬善' },

  // ===== 坎宫八卦 ===== 五行：水
  { name: '坎为水', symbol: '坎上坎下', palace: '坎', order: 8, shiYao: 6, yingYao: 3,
    trigramTop: '坎', trigramBottom: '坎',
    stemTop: '戊', stemBottom: '戊',
    earthlyBranches: ['戊寅', '戊辰', '戊午', '戊申', '戊戌', '戊子'],
    element: '水',
    judgment: '习坎，有孚，维心亨，行有尚',
    greatImage: '水洊至，习坎。君子以常德行' },

  { name: '水泽节', symbol: '坎上兑下', palace: '坎', order: 1, shiYao: 1, yingYao: 4,
    trigramTop: '坎', trigramBottom: '兑',
    stemTop: '戊', stemBottom: '丁',
    earthlyBranches: ['丁巳', '丁卯', '丁丑', '戊申', '戊戌', '戊子'],
    element: '水',
    judgment: '亨。苦节不可贞',
    greatImage: '泽上有水，节。君子以制数度' },

  { name: '水雷屯', symbol: '坎上震下', palace: '坎', order: 2, shiYao: 2, yingYao: 5,
    trigramTop: '坎', trigramBottom: '震',
    stemTop: '戊', stemBottom: '庚',
    earthlyBranches: ['庚子', '庚寅', '庚辰', '戊申', '戊戌', '戊子'],
    element: '水',
    judgment: '元亨利贞。勿用有攸往',
    greatImage: '云雷，屯。君子以经纶' },

  { name: '水火既济', symbol: '坎上离下', palace: '坎', order: 3, shiYao: 3, yingYao: 6,
    trigramTop: '坎', trigramBottom: '离',
    stemTop: '戊', stemBottom: '己',
    earthlyBranches: ['己卯', '己丑', '己亥', '戊申', '戊戌', '戊子'],
    element: '水',
    judgment: '亨小，利贞。初吉终乱',
    greatImage: '水在火上，既济。君子以思患而豫防之' },

  { name: '泽火革', symbol: '兑上离下', palace: '坎', order: 4, shiYao: 4, yingYao: 1,
    trigramTop: '兑', trigramBottom: '离',
    stemTop: '丁', stemBottom: '己',
    earthlyBranches: ['己卯', '己丑', '己亥', '丁亥', '丁酉', '丁未'],
    element: '水',
    judgment: '巳日乃孚。元亨利贞，悔亡',
    greatImage: '泽中有火，革。君子以治历明时' },

  { name: '雷火丰', symbol: '震上离下', palace: '坎', order: 5, shiYao: 5, yingYao: 2,
    trigramTop: '震', trigramBottom: '离',
    stemTop: '庚', stemBottom: '己',
    earthlyBranches: ['己卯', '己丑', '己亥', '庚午', '庚辰', '庚寅'],
    element: '水',
    judgment: '亨，王假之，勿忧，宜日中',
    greatImage: '雷电皆至，丰。君子以折狱致刑' },

  { name: '地火明夷', symbol: '坤上离下', palace: '坎', order: 6, shiYao: 4, yingYao: 1, // 游魂
    trigramTop: '坤', trigramBottom: '离',
    stemTop: '癸', stemBottom: '己',
    earthlyBranches: ['己卯', '己丑', '己亥', '癸丑', '癸亥', '癸酉'],
    element: '水',
    judgment: '明夷，利艰贞',
    greatImage: '明入地中，明夷。君子以莅众' },

  { name: '地水师', symbol: '坤上坎下', palace: '坎', order: 7, shiYao: 3, yingYao: 6, // 归魂
    trigramTop: '坤', trigramBottom: '坎',
    stemTop: '癸', stemBottom: '戊',
    earthlyBranches: ['戊寅', '戊辰', '戊午', '癸丑', '癸亥', '癸酉'],
    element: '水',
    judgment: '贞，丈人吉，无咎',
    greatImage: '地中有水，师。君子以容民畜众' },

  // ===== 艮宫八卦 ===== 五行：土
  { name: '艮为山', symbol: '艮上艮下', palace: '艮', order: 8, shiYao: 6, yingYao: 3,
    trigramTop: '艮', trigramBottom: '艮',
    stemTop: '丙', stemBottom: '丙',
    earthlyBranches: ['丙辰', '丙午', '丙申', '丙戌', '丙子', '丙寅'],
    element: '土',
    judgment: '艮其背，不获其身，行其庭不见其人，无咎',
    greatImage: '兼山，艮。君子以思不出其位' },

  { name: '山火贲', symbol: '艮上离下', palace: '艮', order: 1, shiYao: 1, yingYao: 4,
    trigramTop: '艮', trigramBottom: '离',
    stemTop: '丙', stemBottom: '己',
    earthlyBranches: ['己卯', '己丑', '己亥', '丙戌', '丙子', '丙寅'],
    element: '土',
    judgment: '亨。小利有攸往',
    greatImage: '山下有火，贲。君子以明庶政' },

  { name: '山天大畜', symbol: '艮上乾下', palace: '艮', order: 2, shiYao: 2, yingYao: 5,
    trigramTop: '艮', trigramBottom: '乾',
    stemTop: '丙', stemBottom: '甲',
    earthlyBranches: ['甲子', '甲寅', '甲辰', '丙戌', '丙子', '丙寅'],
    element: '土',
    judgment: '利贞，不家食吉，利涉大川',
    greatImage: '天在山中，大畜。君子以多识前言往行' },

  { name: '山泽损', symbol: '艮上兑下', palace: '艮', order: 3, shiYao: 3, yingYao: 6,
    trigramTop: '艮', trigramBottom: '兑',
    stemTop: '丙', stemBottom: '丁',
    earthlyBranches: ['丁巳', '丁卯', '丁丑', '丙戌', '丙子', '丙寅'],
    element: '土',
    judgment: '有孚，元吉，无咎，可贞，利有攸往',
    greatImage: '山下有泽，损。君子以惩忿窒欲' },

  { name: '火泽睽', symbol: '离上兑下', palace: '艮', order: 4, shiYao: 4, yingYao: 1,
    trigramTop: '离', trigramBottom: '兑',
    stemTop: '己', stemBottom: '丁',
    earthlyBranches: ['丁巳', '丁卯', '丁丑', '己酉', '己未', '己巳'],
    element: '土',
    judgment: '小事吉',
    greatImage: '上火下泽，睽。君子以同而异' },

  { name: '天泽履', symbol: '乾上兑下', palace: '艮', order: 5, shiYao: 5, yingYao: 2,
    trigramTop: '乾', trigramBottom: '兑',
    stemTop: '壬', stemBottom: '丁',
    earthlyBranches: ['丁巳', '丁卯', '丁丑', '壬午', '壬申', '壬戌'],
    element: '土',
    judgment: '履虎尾，不咥人，亨',
    greatImage: '上天下泽，履。君子以辨上下' },

  { name: '风泽中孚', symbol: '巽上兑下', palace: '艮', order: 6, shiYao: 4, yingYao: 1, // 游魂
    trigramTop: '巽', trigramBottom: '兑',
    stemTop: '辛', stemBottom: '丁',
    earthlyBranches: ['丁巳', '丁卯', '丁丑', '辛未', '辛巳', '辛卯'],
    element: '土',
    judgment: '中孚，豚鱼吉，利涉大川，利贞',
    greatImage: '泽上有风，中孚。君子以议狱缓死' },

  { name: '风山渐', symbol: '巽上艮下', palace: '艮', order: 7, shiYao: 3, yingYao: 6, // 归魂
    trigramTop: '巽', trigramBottom: '艮',
    stemTop: '辛', stemBottom: '丙',
    earthlyBranches: ['丙辰', '丙午', '丙申', '辛未', '辛巳', '辛卯'],
    element: '土',
    judgment: '女归吉，利贞',
    greatImage: '山上有木，渐。君子以居贤德善俗' },

  // ===== 震宫八卦 ===== 五行：木
  { name: '震为雷', symbol: '震上震下', palace: '震', order: 8, shiYao: 6, yingYao: 3,
    trigramTop: '震', trigramBottom: '震',
    stemTop: '庚', stemBottom: '庚',
    earthlyBranches: ['庚子', '庚寅', '庚辰', '庚午', '庚申', '庚戌'],
    element: '木',
    judgment: '亨。震来虩虩，笑言哑哑',
    greatImage: '洊雷，震。君子以恐惧修省' },

  { name: '雷地豫', symbol: '震上坤下', palace: '震', order: 1, shiYao: 1, yingYao: 4,
    trigramTop: '震', trigramBottom: '坤',
    stemTop: '庚', stemBottom: '乙',
    earthlyBranches: ['乙未', '乙巳', '乙卯', '庚午', '庚辰', '庚寅'],
    element: '木',
    judgment: '利建侯行师',
    greatImage: '雷出地奋，豫。先王以作乐崇德' },

  { name: '雷水解', symbol: '震上坎下', palace: '震', order: 2, shiYao: 2, yingYao: 5,
    trigramTop: '震', trigramBottom: '坎',
    stemTop: '庚', stemBottom: '戊',
    earthlyBranches: ['戊寅', '戊辰', '戊午', '庚午', '庚辰', '庚寅'],
    element: '木',
    judgment: '利西南，无所往，其来复吉',
    greatImage: '雷雨作，解。君子以赦过宥罪' },

  { name: '雷风恒', symbol: '震上巽下', palace: '震', order: 3, shiYao: 3, yingYao: 6,
    trigramTop: '震', trigramBottom: '巽',
    stemTop: '庚', stemBottom: '辛',
    earthlyBranches: ['辛丑', '辛亥', '辛酉', '庚午', '庚辰', '庚寅'],
    element: '木',
    judgment: '亨，无咎，利贞，利有攸往',
    greatImage: '雷风，恒。君子以立不易方' },

  { name: '地风升', symbol: '坤上巽下', palace: '震', order: 4, shiYao: 4, yingYao: 1,
    trigramTop: '坤', trigramBottom: '巽',
    stemTop: '癸', stemBottom: '辛',
    earthlyBranches: ['辛丑', '辛亥', '辛酉', '癸丑', '癸亥', '癸酉'],
    element: '木',
    judgment: '元亨，用见大人，勿恤',
    greatImage: '地中生木，升。君子以顺德积小以高大' },

  { name: '水风井', symbol: '坎上巽下', palace: '震', order: 5, shiYao: 5, yingYao: 2,
    trigramTop: '坎', trigramBottom: '巽',
    stemTop: '戊', stemBottom: '辛',
    earthlyBranches: ['辛丑', '辛亥', '辛酉', '戊申', '戊戌', '戊子'],
    element: '木',
    judgment: '改邑不改井，无丧无得，往来井井',
    greatImage: '木上有水，井。君子以劳民劝相' },

  { name: '泽风大过', symbol: '兑上巽下', palace: '震', order: 6, shiYao: 4, yingYao: 1, // 游魂
    trigramTop: '兑', trigramBottom: '巽',
    stemTop: '丁', stemBottom: '辛',
    earthlyBranches: ['辛丑', '辛亥', '辛酉', '丁亥', '丁酉', '丁未'],
    element: '木',
    judgment: '栋桡，利有攸往，亨',
    greatImage: '泽灭木，大过。君子以独立不惧' },

  { name: '泽雷随', symbol: '兑上震下', palace: '震', order: 7, shiYao: 3, yingYao: 6, // 归魂
    trigramTop: '兑', trigramBottom: '震',
    stemTop: '丁', stemBottom: '庚',
    earthlyBranches: ['庚子', '庚寅', '庚辰', '丁亥', '丁酉', '丁未'],
    element: '木',
    judgment: '元亨利贞，无咎',
    greatImage: '泽中有雷，随。君子以向晦入宴息' },

  // ===== 巽宫八卦 ===== 五行：木
  { name: '巽为风', symbol: '巽上巽下', palace: '巽', order: 8, shiYao: 6, yingYao: 3,
    trigramTop: '巽', trigramBottom: '巽',
    stemTop: '辛', stemBottom: '辛',
    earthlyBranches: ['辛丑', '辛亥', '辛酉', '辛未', '辛巳', '辛卯'],
    element: '木',
    judgment: '小亨，利有攸往，利见大人',
    greatImage: '随风，巽。君子以申命行事' },

  { name: '风天小畜', symbol: '巽上乾下', palace: '巽', order: 1, shiYao: 1, yingYao: 4,
    trigramTop: '巽', trigramBottom: '乾',
    stemTop: '辛', stemBottom: '甲',
    earthlyBranches: ['甲子', '甲寅', '甲辰', '辛未', '辛巳', '辛卯'],
    element: '木',
    judgment: '亨。密云不雨，自我西郊',
    greatImage: '风行天上，小畜。君子以懿文德' },

  { name: '风火家人', symbol: '巽上离下', palace: '巽', order: 2, shiYao: 2, yingYao: 5,
    trigramTop: '巽', trigramBottom: '离',
    stemTop: '辛', stemBottom: '己',
    earthlyBranches: ['己卯', '己丑', '己亥', '辛未', '辛巳', '辛卯'],
    element: '木',
    judgment: '利女贞',
    greatImage: '风自火出，家人。君子以言有物而行有恒' },

  { name: '风雷益', symbol: '巽上震下', palace: '巽', order: 3, shiYao: 3, yingYao: 6,
    trigramTop: '巽', trigramBottom: '震',
    stemTop: '辛', stemBottom: '庚',
    earthlyBranches: ['庚子', '庚寅', '庚辰', '辛未', '辛巳', '辛卯'],
    element: '木',
    judgment: '利有攸往，利涉大川',
    greatImage: '风雷，益。君子以见善则迁，有过则改' },

  { name: '天雷无妄', symbol: '乾上震下', palace: '巽', order: 4, shiYao: 4, yingYao: 1,
    trigramTop: '乾', trigramBottom: '震',
    stemTop: '壬', stemBottom: '庚',
    earthlyBranches: ['庚子', '庚寅', '庚辰', '壬午', '壬申', '壬戌'],
    element: '木',
    judgment: '元亨利贞。其匪正有眚，不利有攸往',
    greatImage: '天下雷行，物与无妄。先王以茂对时育万物' },

  { name: '火雷噬嗑', symbol: '离上震下', palace: '巽', order: 5, shiYao: 5, yingYao: 2,
    trigramTop: '离', trigramBottom: '震',
    stemTop: '己', stemBottom: '庚',
    earthlyBranches: ['庚子', '庚寅', '庚辰', '己酉', '己未', '己巳'],
    element: '木',
    judgment: '亨，利用狱',
    greatImage: '雷电，噬嗑。先王以明罚敕法' },

  { name: '山雷颐', symbol: '艮上震下', palace: '巽', order: 6, shiYao: 4, yingYao: 1, // 游魂
    trigramTop: '艮', trigramBottom: '震',
    stemTop: '丙', stemBottom: '庚',
    earthlyBranches: ['庚子', '庚寅', '庚辰', '丙戌', '丙子', '丙寅'],
    element: '木',
    judgment: '贞吉。观颐，自求口实',
    greatImage: '山下有雷，颐。君子以慎言语，节饮食' },

  { name: '山风蛊', symbol: '艮上巽下', palace: '巽', order: 7, shiYao: 3, yingYao: 6, // 归魂
    trigramTop: '艮', trigramBottom: '巽',
    stemTop: '丙', stemBottom: '辛',
    earthlyBranches: ['辛丑', '辛亥', '辛酉', '丙戌', '丙子', '丙寅'],
    element: '木',
    judgment: '元亨，利涉大川。先甲三日，后甲三日',
    greatImage: '山下有风，蛊。君子以振民育德' },

  // ===== 离宫八卦 ===== 五行：火
  { name: '离为火', symbol: '离上离下', palace: '离', order: 8, shiYao: 6, yingYao: 3,
    trigramTop: '离', trigramBottom: '离',
    stemTop: '己', stemBottom: '己',
    earthlyBranches: ['己卯', '己丑', '己亥', '己酉', '己未', '己巳'],
    element: '火',
    judgment: '利贞，亨。畜牝牛，吉',
    greatImage: '明两作，离。大人以继明照于四方' },

  { name: '火山旅', symbol: '离上艮下', palace: '离', order: 1, shiYao: 1, yingYao: 4,
    trigramTop: '离', trigramBottom: '艮',
    stemTop: '己', stemBottom: '丙',
    earthlyBranches: ['丙辰', '丙午', '丙申', '己酉', '己未', '己巳'],
    element: '火',
    judgment: '旅，小亨，旅贞吉',
    greatImage: '山上有火，旅。君子以明慎用刑而不留狱' },

  { name: '火风鼎', symbol: '离上巽下', palace: '离', order: 2, shiYao: 2, yingYao: 5,
    trigramTop: '离', trigramBottom: '巽',
    stemTop: '己', stemBottom: '辛',
    earthlyBranches: ['辛丑', '辛亥', '辛酉', '己酉', '己未', '己巳'],
    element: '火',
    judgment: '元吉，亨',
    greatImage: '木上有火，鼎。君子以正位凝命' },

  { name: '火水未济', symbol: '离上坎下', palace: '离', order: 3, shiYao: 3, yingYao: 6,
    trigramTop: '离', trigramBottom: '坎',
    stemTop: '己', stemBottom: '戊',
    earthlyBranches: ['戊寅', '戊辰', '戊午', '己酉', '己未', '己巳'],
    element: '火',
    judgment: '亨。小狐汔济，濡其尾，无攸利',
    greatImage: '火在水上，未济。君子以慎辨物居方' },

  { name: '山水蒙', symbol: '艮上坎下', palace: '离', order: 4, shiYao: 4, yingYao: 1,
    trigramTop: '艮', trigramBottom: '坎',
    stemTop: '丙', stemBottom: '戊',
    earthlyBranches: ['戊寅', '戊辰', '戊午', '丙戌', '丙子', '丙寅'],
    element: '火',
    judgment: '亨。匪我求童蒙，童蒙求我',
    greatImage: '山下出泉，蒙。君子以果行育德' },

  { name: '风水涣', symbol: '巽上坎下', palace: '离', order: 5, shiYao: 5, yingYao: 2,
    trigramTop: '巽', trigramBottom: '坎',
    stemTop: '辛', stemBottom: '戊',
    earthlyBranches: ['戊寅', '戊辰', '戊午', '辛未', '辛巳', '辛卯'],
    element: '火',
    judgment: '亨。王假有庙，利涉大川',
    greatImage: '风行水上，涣。先王以享于帝立庙' },

  { name: '天水讼', symbol: '乾上坎下', palace: '离', order: 6, shiYao: 4, yingYao: 1, // 游魂
    trigramTop: '乾', trigramBottom: '坎',
    stemTop: '壬', stemBottom: '戊',
    earthlyBranches: ['戊寅', '戊辰', '戊午', '壬午', '壬申', '壬戌'],
    element: '火',
    judgment: '有孚窒惕，中吉，终凶',
    greatImage: '天与水违行，讼。君子以作事谋始' },

  { name: '天火同人', symbol: '乾上离下', palace: '离', order: 7, shiYao: 3, yingYao: 6, // 归魂
    trigramTop: '乾', trigramBottom: '离',
    stemTop: '壬', stemBottom: '己',
    earthlyBranches: ['己卯', '己丑', '己亥', '壬午', '壬申', '壬戌'],
    element: '火',
    judgment: '同人于野，亨。利涉大川，利君子贞',
    greatImage: '天与火，同人。君子以类族辨物' },

  // ===== 坤宫八卦 ===== 五行：土
  { name: '坤为地', symbol: '坤上坤下', palace: '坤', order: 8, shiYao: 6, yingYao: 3,
    trigramTop: '坤', trigramBottom: '坤',
    stemTop: '癸', stemBottom: '乙',
    earthlyBranches: ['乙未', '乙巳', '乙卯', '癸丑', '癸亥', '癸酉'],
    element: '土',
    judgment: '元亨，利牝马之贞',
    greatImage: '地势坤，君子以厚德载物' },

  { name: '地雷复', symbol: '坤上震下', palace: '坤', order: 1, shiYao: 1, yingYao: 4,
    trigramTop: '坤', trigramBottom: '震',
    stemTop: '癸', stemBottom: '庚',
    earthlyBranches: ['庚子', '庚寅', '庚辰', '癸丑', '癸亥', '癸酉'],
    element: '土',
    judgment: '亨。出入无疾，朋来无咎',
    greatImage: '雷在地中，复。先王以至日闭关' },

  { name: '地泽临', symbol: '坤上兑下', palace: '坤', order: 2, shiYao: 2, yingYao: 5,
    trigramTop: '坤', trigramBottom: '兑',
    stemTop: '癸', stemBottom: '丁',
    earthlyBranches: ['丁巳', '丁卯', '丁丑', '癸丑', '癸亥', '癸酉'],
    element: '土',
    judgment: '元亨利贞。至于八月有凶',
    greatImage: '泽上有地，临。君子以教思无穷' },

  { name: '地天泰', symbol: '坤上乾下', palace: '坤', order: 3, shiYao: 3, yingYao: 6,
    trigramTop: '坤', trigramBottom: '乾',
    stemTop: '癸', stemBottom: '甲',
    earthlyBranches: ['甲子', '甲寅', '甲辰', '癸丑', '癸亥', '癸酉'],
    element: '土',
    judgment: '小往大来，吉亨',
    greatImage: '天地交，泰。后以财成天地之道' },

  { name: '雷天大壮', symbol: '震上乾下', palace: '坤', order: 4, shiYao: 4, yingYao: 1,
    trigramTop: '震', trigramBottom: '乾',
    stemTop: '庚', stemBottom: '甲',
    earthlyBranches: ['甲子', '甲寅', '甲辰', '庚午', '庚辰', '庚寅'],
    element: '土',
    judgment: '利贞',
    greatImage: '雷在天上，大壮。君子以非礼弗履' },

  { name: '泽天夬', symbol: '兑上乾下', palace: '坤', order: 5, shiYao: 5, yingYao: 2,
    trigramTop: '兑', trigramBottom: '乾',
    stemTop: '丁', stemBottom: '甲',
    earthlyBranches: ['甲子', '甲寅', '甲辰', '丁亥', '丁酉', '丁未'],
    element: '土',
    judgment: '扬于王庭，孚号有厉',
    greatImage: '泽上于天，夬。君子以施禄及下' },

  { name: '水天需', symbol: '坎上乾下', palace: '坤', order: 6, shiYao: 4, yingYao: 1, // 游魂
    trigramTop: '坎', trigramBottom: '乾',
    stemTop: '戊', stemBottom: '甲',
    earthlyBranches: ['甲子', '甲寅', '甲辰', '戊申', '戊戌', '戊子'],
    element: '土',
    judgment: '有孚，光亨，贞吉。利涉大川',
    greatImage: '云上于天，需。君子以饮食宴乐' },

  { name: '水地比', symbol: '坎上坤下', palace: '坤', order: 7, shiYao: 3, yingYao: 6, // 归魂
    trigramTop: '坎', trigramBottom: '坤',
    stemTop: '戊', stemBottom: '乙',
    earthlyBranches: ['乙未', '乙巳', '乙卯', '戊申', '戊戌', '戊子'],
    element: '土',
    judgment: '吉。原筮，元永贞，无咎',
    greatImage: '地上有水，比。先王以建万国亲诸侯' },

  // ===== 兑宫八卦 ===== 五行：金
  { name: '兑为泽', symbol: '兑上兑下', palace: '兑', order: 8, shiYao: 6, yingYao: 3,
    trigramTop: '兑', trigramBottom: '兑',
    stemTop: '丁', stemBottom: '丁',
    earthlyBranches: ['丁巳', '丁卯', '丁丑', '丁亥', '丁酉', '丁未'],
    element: '金',
    judgment: '亨，利贞',
    greatImage: '丽泽，兑。君子以朋友讲习' },

  { name: '泽水困', symbol: '兑上坎下', palace: '兑', order: 1, shiYao: 1, yingYao: 4,
    trigramTop: '兑', trigramBottom: '坎',
    stemTop: '丁', stemBottom: '戊',
    earthlyBranches: ['戊寅', '戊辰', '戊午', '丁亥', '丁酉', '丁未'],
    element: '金',
    judgment: '亨，贞，大人吉，无咎',
    greatImage: '泽无水，困。君子以致命遂志' },

  { name: '泽地萃', symbol: '兑上坤下', palace: '兑', order: 2, shiYao: 2, yingYao: 5,
    trigramTop: '兑', trigramBottom: '坤',
    stemTop: '丁', stemBottom: '乙',
    earthlyBranches: ['乙未', '乙巳', '乙卯', '丁亥', '丁酉', '丁未'],
    element: '金',
    judgment: '亨。王假有庙，利见大人',
    greatImage: '泽上于地，萃。君子以除戎器戒不虞' },

  { name: '泽山咸', symbol: '兑上艮下', palace: '兑', order: 3, shiYao: 3, yingYao: 6,
    trigramTop: '兑', trigramBottom: '艮',
    stemTop: '丁', stemBottom: '丙',
    earthlyBranches: ['丙辰', '丙午', '丙申', '丁亥', '丁酉', '丁未'],
    element: '金',
    judgment: '亨，利贞，取女吉',
    greatImage: '山上有泽，咸。君子以虚受人' },

  { name: '水山蹇', symbol: '坎上艮下', palace: '兑', order: 4, shiYao: 4, yingYao: 1,
    trigramTop: '坎', trigramBottom: '艮',
    stemTop: '戊', stemBottom: '丙',
    earthlyBranches: ['丙辰', '丙午', '丙申', '戊申', '戊戌', '戊子'],
    element: '金',
    judgment: '利西南，不利东北。利见大人，贞吉',
    greatImage: '山上有水，蹇。君子以反身修德' },

  { name: '地山谦', symbol: '坤上艮下', palace: '兑', order: 5, shiYao: 5, yingYao: 2,
    trigramTop: '坤', trigramBottom: '艮',
    stemTop: '癸', stemBottom: '丙',
    earthlyBranches: ['丙辰', '丙午', '丙申', '癸丑', '癸亥', '癸酉'],
    element: '金',
    judgment: '亨，君子有终',
    greatImage: '地中有山，谦。君子以裒多益寡' },

  { name: '雷山小过', symbol: '震上艮下', palace: '兑', order: 6, shiYao: 4, yingYao: 1, // 游魂
    trigramTop: '震', trigramBottom: '艮',
    stemTop: '庚', stemBottom: '丙',
    earthlyBranches: ['丙辰', '丙午', '丙申', '庚午', '庚辰', '庚寅'],
    element: '金',
    judgment: '亨，利贞，可小事不可大事',
    greatImage: '山上有雷，小过。君子以行过乎恭' },

  { name: '雷泽归妹', symbol: '震上兑下', palace: '兑', order: 7, shiYao: 3, yingYao: 6, // 归魂
    trigramTop: '震', trigramBottom: '兑',
    stemTop: '庚', stemBottom: '丁',
    earthlyBranches: ['丁巳', '丁卯', '丁丑', '庚午', '庚辰', '庚寅'],
    element: '金',
    judgment: '征凶，无攸利',
    greatImage: '泽上有雷，归妹。君子以永终知敝' },
];

module.exports = bagua64;
