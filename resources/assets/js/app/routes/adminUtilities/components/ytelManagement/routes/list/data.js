export const x5ContactGroups = [
  {
    X5ContactGroup: {
      x5_contact_group_id: "585",
      super: true,
      type: "1",
      group_name: "Super Admin",
      group_description: "Super Admin",
      create_datetime: "2017-02-13 19:25:55"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "668",
      super: false,
      type: "2",
      group_name: "Users",
      group_description: "Users Can only do some operations",
      create_datetime: "2017-04-27 06:47:14"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "900",
      super: false,
      type: "2",
      group_name: "demo",
      group_description: "temp",
      create_datetime: "2017-12-15 08:39:42"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "901",
      super: false,
      type: "2",
      group_name: "temp",
      group_description: "test",
      create_datetime: "2017-12-15 08:58:04"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "902",
      super: false,
      type: "2",
      group_name: "Testdata",
      group_description: "Test1212",
      create_datetime: "2017-12-15 09:25:01"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "906",
      super: false,
      type: "2",
      group_name: "Demo123",
      group_description: "test",
      create_datetime: "2017-12-15 09:31:12"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "909",
      super: false,
      type: "2",
      group_name: "temp",
      group_description: "hi",
      create_datetime: "2017-12-15 09:54:29"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "910",
      super: false,
      type: "2",
      group_name: "ok",
      group_description: "hi",
      create_datetime: "2017-12-15 10:06:42"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "911",
      super: false,
      type: "2",
      group_name: "BALAJI TEST",
      group_description: "ok ok",
      create_datetime: "2017-12-15 12:19:09"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "924",
      super: false,
      type: "2",
      group_name: "Test",
      group_description: "This is the Test Group",
      create_datetime: "2018-01-05 10:50:06"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "925",
      super: false,
      type: "2",
      group_name: "Admin",
      group_description: "Test",
      create_datetime: "2018-01-05 10:50:50"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "926",
      super: false,
      type: "2",
      group_name: "Administrator",
      group_description: "Administrator",
      create_datetime: "2018-01-05 10:51:52"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "927",
      super: false,
      type: "2",
      group_name: "Admin",
      group_description: "Admin",
      create_datetime: "2018-01-05 10:52:20"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "979",
      super: false,
      type: "2",
      group_name: "test",
      group_description: "test test",
      create_datetime: "2018-03-15 10:03:56"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "980",
      super: false,
      type: "2",
      group_name: "TEST User",
      group_description: "Test User",
      create_datetime: "2018-03-15 10:23:56"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "1081",
      super: false,
      type: "2",
      group_name: "RTPMM",
      group_description: "a",
      create_datetime: "2018-05-26 11:53:35"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "1084",
      super: false,
      type: "2",
      group_name: "BAVP",
      group_description: "aaa",
      create_datetime: "2018-05-28 07:00:01"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "1085",
      super: false,
      type: "2",
      group_name: "YTEL_TEST",
      group_description: "YTEL_TEST",
      create_datetime: "2018-05-28 07:00:50"
    }
  },
  {
    X5ContactGroup: {
      x5_contact_group_id: "1086",
      super: false,
      type: "2",
      group_name: "YTEL_TEST",
      group_description: "YTEL_TEST",
      create_datetime: "2018-05-28 07:01:17"
    }
  }
];

export const x5Contacts = {
  x5Contacts: [
    {
      X5Contact: {
        x5_contact_id: "345",
        name: "sangeeth",
        username: "sangeeth@xoyal.com",
        enable: true,
        group_ids: "585",
        group_names: "Super Admin"
      }
    },
    {
      X5Contact: {
        x5_contact_id: "1064",
        name: "Krishna Belkune test",
        username: "balaji@ytel.co.in",
        enable: true,
        group_ids: "585,924",
        group_names: "Super Admin,Test"
      }
    },
    {
      X5Contact: {
        x5_contact_id: "2315",
        name: "Sharat",
        username: "sharat@xoyal.com",
        enable: true,
        group_ids: "911,924,926,979",
        group_names: "BALAJI TEST,Test,Administrator"
      }
    }
  ],
  $allowContactGroup: [
    "585",
    "668",
    "899",
    "900",
    "901",
    "902",
    "903",
    "904",
    "905",
    "906",
    "907",
    "908",
    "909",
    "910",
    "911",
    "912",
    "913",
    "914",
    "915",
    "924",
    "925",
    "926",
    "927",
    "979",
    "980",
    "998",
    "1036",
    "1059",
    "1060",
    "1066",
    "1081",
    "1082",
    "1084",
    "1085",
    "1086"
  ],
  status: true
};

export const style_header = {
  backgroundColor: "#15bcd4",
  color: "#FFFFFF",
  fontSize: "20px",
  marginTop: "3px",
  padding: "10px",
  width: "100%"
};

export const permissionList = [
  {
    type: 1,
    name: "Campaign",
    order: 25,
    items: [
      {
        label: "040588",
        key: "040588"
      },
      {
        label: "0406",
        key: "0406"
      },
      {
        label: "1",
        key: "1"
      },
      {
        label: "1000",
        key: "1000"
      },
      {
        label: "1111",
        key: "1111"
      },
      {
        label: "1231",
        key: "1231"
      },
      {
        label: "12312",
        key: "12312"
      },
      {
        label: "123124",
        key: "123124"
      },
      {
        label: "12345",
        key: "12345"
      },
      {
        label: "131313",
        key: "131313"
      },
      {
        label: "15812879",
        key: "15812879"
      },
      {
        label: "18001",
        key: "18001"
      },
      {
        label: "1988",
        key: "1988"
      },
      {
        label: "2004",
        key: "2004"
      },
      {
        label: "2005",
        key: "2005"
      },
      {
        label: "2112",
        key: "2112"
      },
      {
        label: "2173",
        key: "2173"
      },
      {
        label: "2222",
        key: "2222"
      },
      {
        label: "3333",
        key: "3333"
      },
      {
        label: "34343",
        key: "34343"
      },
      {
        label: "40004",
        key: "40004"
      },
      {
        label: "4444",
        key: "4444"
      },
      {
        label: "509070",
        key: "509070"
      },
      {
        label: "52258878",
        key: "52258878"
      },
      {
        label: "606070",
        key: "606070"
      },
      {
        label: "76986116",
        key: "76986116"
      },
      {
        label: "7777",
        key: "7777"
      },
      {
        label: "8214_nw1",
        key: "8214_nw1"
      },
      {
        label: "82141_nw",
        key: "82141_nw"
      },
      {
        label: "87292888",
        key: "87292888"
      },
      {
        label: "883478",
        key: "883478"
      },
      {
        label: "8888",
        key: "8888"
      },
      {
        label: "888888",
        key: "888888"
      },
      {
        label: "9000000",
        key: "9000000"
      },
      {
        label: "95959595",
        key: "95959595"
      },
      {
        label: "9999",
        key: "9999"
      },
      {
        label: "99999999",
        key: "99999999"
      },
      {
        label: "Alest1",
        key: "Alest1"
      },
      {
        label: "ALEX",
        key: "ALEX"
      },
      {
        label: "AlexINBO",
        key: "AlexINBO"
      },
      {
        label: "alexte",
        key: "alexte"
      },
      {
        label: "Aroma",
        key: "Aroma"
      },
      {
        label: "Callbk",
        key: "Callbk"
      },
      {
        label: "callbk2",
        key: "callbk2"
      },
      {
        label: "CSTEST",
        key: "CSTEST"
      },
      {
        label: "DAN598",
        key: "DAN598"
      },
      {
        label: "DustinD",
        key: "DustinD"
      },
      {
        label: "Garthok",
        key: "Garthok"
      },
      {
        label: "Jornaya",
        key: "Jornaya"
      },
      {
        label: "KEVIN",
        key: "KEVIN"
      },
      {
        label: "LeadBeam",
        key: "LeadBeam"
      },
      {
        label: "moh_camp",
        key: "moh_camp"
      },
      {
        label: "Newcar",
        key: "Newcar"
      },
      {
        label: "nw1000",
        key: "nw1000"
      },
      {
        label: "nw1001",
        key: "nw1001"
      },
      {
        label: "nw1002",
        key: "nw1002"
      },
      {
        label: "nwtest1",
        key: "nwtest1"
      },
      {
        label: "nwtest10",
        key: "nwtest10"
      },
      {
        label: "OnHook",
        key: "OnHook"
      },
      {
        label: "Patricio",
        key: "Patricio"
      },
      {
        label: "Patricky",
        key: "Patricky"
      },
      {
        label: "snake",
        key: "snake"
      },
      {
        label: "Solar",
        key: "Solar"
      },
      {
        label: "Solar126",
        key: "Solar126"
      },
      {
        label: "Solar2",
        key: "Solar2"
      },
      {
        label: "spiLOAD",
        key: "spiLOAD"
      },
      {
        label: "SSupport",
        key: "SSupport"
      },
      {
        label: "Test123",
        key: "Test123"
      },
      {
        label: "testvide",
        key: "testvide"
      },
      {
        label: "train",
        key: "train"
      },
      {
        label: "VB_Test",
        key: "VB_Test"
      },
      {
        label: "www",
        key: "www"
      }
    ]
  },
  {
    type: 2,
    name: "Agent Group",
    order: 50,
    items: [
      {
        label: "ADMIN",
        key: "ADMIN"
      },
      {
        label: "1000",
        key: "1000"
      },
      {
        label: "KevinYtel",
        key: "KevinYtel"
      },
      {
        label: "C2C",
        key: "C2C"
      },
      {
        label: "Acurian",
        key: "Acurian"
      },
      {
        label: "VannyTest",
        key: "VannyTest"
      },
      {
        label: "DANIELTEST",
        key: "DANIELTEST"
      },
      {
        label: "Newcarr",
        key: "Newcarr"
      },
      {
        label: "WinBack",
        key: "WinBack"
      },
      {
        label: "Hanyytel",
        key: "Hanyytel"
      },
      {
        label: "1001",
        key: "1001"
      },
      {
        label: "BVP",
        key: "BVP"
      },
      {
        label: "KiranGroup2",
        key: "KiranGroup2"
      },
      {
        label: "3332221",
        key: "3332221"
      },
      {
        label: "8182",
        key: "8182"
      },
      {
        label: "1111",
        key: "1111"
      },
      {
        label: "8183",
        key: "8183"
      },
      {
        label: "8184",
        key: "8184"
      },
      {
        label: "DANI",
        key: "DANI"
      },
      {
        label: "8185",
        key: "8185"
      },
      {
        label: "8186",
        key: "8186"
      },
      {
        label: "RTEEWE",
        key: "RTEEWE"
      },
      {
        label: "8188",
        key: "8188"
      },
      {
        label: "KiranGroup3",
        key: "KiranGroup3"
      },
      {
        label: "KiranGroup",
        key: "KiranGroup"
      },
      {
        label: "8189",
        key: "8189"
      },
      {
        label: "123333",
        key: "123333"
      },
      {
        label: "11233333",
        key: "11233333"
      },
      {
        label: "1111aaa222",
        key: "1111aaa222"
      },
      {
        label: "11111111",
        key: "11111111"
      },
      {
        label: "111111",
        key: "111111"
      },
      {
        label: "33432222",
        key: "33432222"
      },
      {
        label: "qqqrrrr",
        key: "qqqrrrr"
      },
      {
        label: "1111111",
        key: "1111111"
      },
      {
        label: "9999",
        key: "9999"
      },
      {
        label: "wwwwwwww",
        key: "wwwwwwww"
      },
      {
        label: "mohini_group",
        key: "mohini_group"
      },
      {
        label: "group32",
        key: "group32"
      },
      {
        label: "TTTT",
        key: "TTTT"
      },
      {
        label: "qq",
        key: "qq"
      },
      {
        label: "asdff",
        key: "asdff"
      },
      {
        label: "6565",
        key: "6565"
      }
    ]
  },
  {
    type: 3,
    name: "Inbound Queue",
    order: 100,
    items: [
      {
        label: "111",
        key: "111"
      },
      {
        label: "111111",
        key: "111111"
      },
      {
        label: "121",
        key: "121"
      },
      {
        label: "1211",
        key: "1211"
      },
      {
        label: "12111111111111111",
        key: "12111111111111111"
      },
      {
        label: "122",
        key: "122"
      },
      {
        label: "123",
        key: "123"
      },
      {
        label: "12345",
        key: "12345"
      },
      {
        label: "1801",
        key: "1801"
      },
      {
        label: "20012",
        key: "20012"
      },
      {
        label: "212",
        key: "212"
      },
      {
        label: "212333",
        key: "212333"
      },
      {
        label: "2222222222222",
        key: "2222222222222"
      },
      {
        label: "22222222222222222222",
        key: "22222222222222222222"
      },
      {
        label: "2234",
        key: "2234"
      },
      {
        label: "23234",
        key: "23234"
      },
      {
        label: "3000",
        key: "3000"
      },
      {
        label: "3001",
        key: "3001"
      },
      {
        label: "333333",
        key: "333333"
      },
      {
        label: "4444_44",
        key: "4444_44"
      },
      {
        label: "60001",
        key: "60001"
      },
      {
        label: "6222",
        key: "6222"
      },
      {
        label: "6666",
        key: "6666"
      },
      {
        label: "666666",
        key: "666666"
      },
      {
        label: "7000",
        key: "7000"
      },
      {
        label: "767676",
        key: "767676"
      },
      {
        label: "767678",
        key: "767678"
      },
      {
        label: "8000",
        key: "8000"
      },
      {
        label: "8686",
        key: "8686"
      },
      {
        label: "87878787",
        key: "87878787"
      },
      {
        label: "888",
        key: "888"
      },
      {
        label: "88888",
        key: "88888"
      },
      {
        label: "898989",
        key: "898989"
      },
      {
        label: "9000",
        key: "9000"
      },
      {
        label: "963000000",
        key: "963000000"
      },
      {
        label: "963258741",
        key: "963258741"
      },
      {
        label: "96963636",
        key: "96963636"
      },
      {
        label: "9696969696",
        key: "9696969696"
      },
      {
        label: "aaaa",
        key: "aaaa"
      },
      {
        label: "addgroup",
        key: "addgroup"
      },
      {
        label: "addInboundQueue12",
        key: "addInboundQueue12"
      },
      {
        label: "AlexINB",
        key: "AlexINB"
      },
      {
        label: "AlexLBTest_1",
        key: "AlexLBTest_1"
      },
      {
        label: "Americor",
        key: "Americor"
      },
      {
        label: "ASASASAS",
        key: "ASASASAS"
      },
      {
        label: "asd11111",
        key: "asd11111"
      },
      {
        label: "asd12",
        key: "asd12"
      },
      {
        label: "asd123",
        key: "asd123"
      },
      {
        label: "asd1234",
        key: "asd1234"
      },
      {
        label: "asd12345",
        key: "asd12345"
      },
      {
        label: "asdnew",
        key: "asdnew"
      },
      {
        label: "asdnew12",
        key: "asdnew12"
      },
      {
        label: "asdnew123",
        key: "asdnew123"
      },
      {
        label: "asdnew1234",
        key: "asdnew1234"
      },
      {
        label: "BALAJI",
        key: "BALAJI"
      },
      {
        label: "balaji`",
        key: "balaji`"
      },
      {
        label: "balaji1",
        key: "balaji1"
      },
      {
        label: "balajiTR",
        key: "balajiTR"
      },
      {
        label: "balajiVp",
        key: "balajiVp"
      },
      {
        label: "BeaconMorningTest",
        key: "BeaconMorningTest"
      },
      {
        label: "BVPAAAA",
        key: "BVPAAAA"
      },
      {
        label: "CallerID",
        key: "CallerID"
      },
      {
        label: "check",
        key: "check"
      },
      {
        label: "clone1",
        key: "clone1"
      },
      {
        label: "Closer",
        key: "Closer"
      },
      {
        label: "CSTEST123",
        key: "CSTEST123"
      },
      {
        label: "DANIELTEST",
        key: "DANIELTEST"
      },
      {
        label: "DCurl_Test",
        key: "DCurl_Test"
      },
      {
        label: "demo",
        key: "demo"
      },
      {
        label: "dfgfhfj",
        key: "dfgfhfj"
      },
      {
        label: "dfgfhsdsdfj",
        key: "dfgfhsdsdfj"
      },
      {
        label: "DNC_Alex_Test",
        key: "DNC_Alex_Test"
      },
      {
        label: "DNC_goodsell_hq",
        key: "DNC_goodsell_hq"
      },
      {
        label: "dsdsds",
        key: "dsdsds"
      },
      {
        label: "dsfdg",
        key: "dsfdg"
      },
      {
        label: "dsfdgd",
        key: "dsfdgd"
      },
      {
        label: "eee",
        key: "eee"
      },
      {
        label: "EndSurvey",
        key: "EndSurvey"
      },
      {
        label: "fdfgdfghfg",
        key: "fdfgdfghfg"
      },
      {
        label: "fdfhggvfdj",
        key: "fdfhggvfdj"
      },
      {
        label: "fdgd",
        key: "fdgd"
      },
      {
        label: "fffff",
        key: "fffff"
      },
      {
        label: "fghfg",
        key: "fghfg"
      },
      {
        label: "fghfgh",
        key: "fghfgh"
      },
      {
        label: "fhfgghglh",
        key: "fhfgghglh"
      },
      {
        label: "fhfgh",
        key: "fhfgh"
      },
      {
        label: "fhfghf",
        key: "fhfghf"
      },
      {
        label: "fhfghglh",
        key: "fhfghglh"
      },
      {
        label: "fhfglh",
        key: "fhfglh"
      },
      {
        label: "fhggvfdj",
        key: "fhggvfdj"
      },
      {
        label: "fhgvfdj",
        key: "fhgvfdj"
      },
      {
        label: "fhgvj",
        key: "fhgvj"
      },
      {
        label: "FID_2173",
        key: "FID_2173"
      },
      {
        label: "fjhjhj",
        key: "fjhjhj"
      },
      {
        label: "frytyty",
        key: "frytyty"
      },
      {
        label: "Garthok_Drop",
        key: "Garthok_Drop"
      },
      {
        label: "ggg",
        key: "ggg"
      },
      {
        label: "ghjggh",
        key: "ghjggh"
      },
      {
        label: "ghjgghhh",
        key: "ghjgghhh"
      },
      {
        label: "ghjghjhj",
        key: "ghjghjhj"
      },
      {
        label: "hdfhg",
        key: "hdfhg"
      },
      {
        label: "hhghgh",
        key: "hhghgh"
      },
      {
        label: "hhh",
        key: "hhh"
      },
      {
        label: "iiii",
        key: "iiii"
      },
      {
        label: "KevInbound",
        key: "KevInbound"
      },
      {
        label: "KevVM",
        key: "KevVM"
      },
      {
        label: "KIRTET",
        key: "KIRTET"
      },
      {
        label: "LBv2_Morning",
        key: "LBv2_Morning"
      },
      {
        label: "lctest",
        key: "lctest"
      },
      {
        label: "ljljkl",
        key: "ljljkl"
      },
      {
        label: "mmmm",
        key: "mmmm"
      },
      {
        label: "MOHINI",
        key: "MOHINI"
      },
      {
        label: "Mohini1",
        key: "Mohini1"
      },
      {
        label: "myclone",
        key: "myclone"
      },
      {
        label: "myclone1",
        key: "myclone1"
      },
      {
        label: "myclone12",
        key: "myclone12"
      },
      {
        label: "Newcari3",
        key: "Newcari3"
      },
      {
        label: "newclone",
        key: "newclone"
      },
      {
        label: "newdemo",
        key: "newdemo"
      },
      {
        label: "newdemoinbound",
        key: "newdemoinbound"
      },
      {
        label: "NTestGrpId",
        key: "NTestGrpId"
      },
      {
        label: "NTI",
        key: "NTI"
      },
      {
        label: "Patrick_DNC1",
        key: "Patrick_DNC1"
      },
      {
        label: "Patrick_DNC2",
        key: "Patrick_DNC2"
      },
      {
        label: "PatrickDROP",
        key: "PatrickDROP"
      },
      {
        label: "ppp",
        key: "ppp"
      },
      {
        label: "pppp",
        key: "pppp"
      },
      {
        label: "pppppp",
        key: "pppppp"
      },
      {
        label: "QAQAQ",
        key: "QAQAQ"
      },
      {
        label: "QAQAQww",
        key: "QAQAQww"
      },
      {
        label: "QAQAQww9",
        key: "QAQAQww9"
      },
      {
        label: "QAQAQww93",
        key: "QAQAQww93"
      },
      {
        label: "qewe545",
        key: "qewe545"
      },
      {
        label: "qq",
        key: "qq"
      },
      {
        label: "qqq",
        key: "qqq"
      },
      {
        label: "qqw",
        key: "qqw"
      },
      {
        label: "qwert",
        key: "qwert"
      },
      {
        label: "qwq",
        key: "qwq"
      },
      {
        label: "RTRRRRRRRRR",
        key: "RTRRRRRRRRR"
      },
      {
        label: "RTTTT",
        key: "RTTTT"
      },
      {
        label: "rwrwe",
        key: "rwrwe"
      },
      {
        label: "ryrty",
        key: "ryrty"
      },
      {
        label: "S1_1",
        key: "S1_1"
      },
      {
        label: "sdfsd",
        key: "sdfsd"
      },
      {
        label: "sdfsdsdf",
        key: "sdfsdsdf"
      },
      {
        label: "sdfsf",
        key: "sdfsf"
      },
      {
        label: "ss",
        key: "ss"
      },
      {
        label: "sss",
        key: "sss"
      },
      {
        label: "sss1",
        key: "sss1"
      },
      {
        label: "sss12",
        key: "sss12"
      },
      {
        label: "sss123",
        key: "sss123"
      },
      {
        label: "sss1233",
        key: "sss1233"
      },
      {
        label: "sss12334",
        key: "sss12334"
      },
      {
        label: "SSSS",
        key: "SSSS"
      },
      {
        label: "SurveyINB",
        key: "SurveyINB"
      },
      {
        label: "test12345",
        key: "test12345"
      },
      {
        label: "test2",
        key: "test2"
      },
      {
        label: "TESTR",
        key: "TESTR"
      },
      {
        label: "TESTTT",
        key: "TESTTT"
      },
      {
        label: "testVideo",
        key: "testVideo"
      },
      {
        label: "TESTY",
        key: "TESTY"
      },
      {
        label: "TRTRRRRR",
        key: "TRTRRRRR"
      },
      {
        label: "TRTRTR",
        key: "TRTRTR"
      },
      {
        label: "ttt",
        key: "ttt"
      },
      {
        label: "ttt123",
        key: "ttt123"
      },
      {
        label: "ttt12323",
        key: "ttt12323"
      },
      {
        label: "ttt1233",
        key: "ttt1233"
      },
      {
        label: "TTTTT",
        key: "TTTTT"
      },
      {
        label: "TYPOU",
        key: "TYPOU"
      },
      {
        label: "TYTYRT",
        key: "TYTYRT"
      },
      {
        label: "uu",
        key: "uu"
      },
      {
        label: "uuu",
        key: "uuu"
      },
      {
        label: "Verifier_test",
        key: "Verifier_test"
      },
      {
        label: "wdfsdfvd",
        key: "wdfsdfvd"
      },
      {
        label: "ww",
        key: "ww"
      },
      {
        label: "wwww",
        key: "wwww"
      },
      {
        label: "wwwww",
        key: "wwwww"
      }
    ]
  },
  {
    type: 10,
    name: "Recordings",
    order: 125,
    items: [
      {
        label: "ADMIN",
        key: "ADMIN"
      },
      {
        label: "1000",
        key: "1000"
      },
      {
        label: "KevinYtel",
        key: "KevinYtel"
      },
      {
        label: "C2C",
        key: "C2C"
      },
      {
        label: "Acurian",
        key: "Acurian"
      },
      {
        label: "VannyTest",
        key: "VannyTest"
      },
      {
        label: "DANIELTEST",
        key: "DANIELTEST"
      },
      {
        label: "Newcarr",
        key: "Newcarr"
      },
      {
        label: "WinBack",
        key: "WinBack"
      },
      {
        label: "Hanyytel",
        key: "Hanyytel"
      },
      {
        label: "1001",
        key: "1001"
      },
      {
        label: "BVP",
        key: "BVP"
      },
      {
        label: "KiranGroup2",
        key: "KiranGroup2"
      },
      {
        label: "3332221",
        key: "3332221"
      },
      {
        label: "8182",
        key: "8182"
      },
      {
        label: "1111",
        key: "1111"
      },
      {
        label: "8183",
        key: "8183"
      },
      {
        label: "8184",
        key: "8184"
      },
      {
        label: "DANI",
        key: "DANI"
      },
      {
        label: "8185",
        key: "8185"
      },
      {
        label: "8186",
        key: "8186"
      },
      {
        label: "RTEEWE",
        key: "RTEEWE"
      },
      {
        label: "8188",
        key: "8188"
      },
      {
        label: "KiranGroup3",
        key: "KiranGroup3"
      },
      {
        label: "KiranGroup",
        key: "KiranGroup"
      },
      {
        label: "8189",
        key: "8189"
      },
      {
        label: "123333",
        key: "123333"
      },
      {
        label: "11233333",
        key: "11233333"
      },
      {
        label: "1111aaa222",
        key: "1111aaa222"
      },
      {
        label: "11111111",
        key: "11111111"
      },
      {
        label: "111111",
        key: "111111"
      },
      {
        label: "33432222",
        key: "33432222"
      },
      {
        label: "qqqrrrr",
        key: "qqqrrrr"
      },
      {
        label: "1111111",
        key: "1111111"
      },
      {
        label: "9999",
        key: "9999"
      },
      {
        label: "wwwwwwww",
        key: "wwwwwwww"
      },
      {
        label: "mohini_group",
        key: "mohini_group"
      },
      {
        label: "group32",
        key: "group32"
      },
      {
        label: "TTTT",
        key: "TTTT"
      },
      {
        label: "qq",
        key: "qq"
      },
      {
        label: "asdff",
        key: "asdff"
      },
      {
        label: "6565",
        key: "6565"
      }
    ]
  }
];

export const systemComponents = {
  Dashboard: [
    {
      SystemComponent: {
        system_component_id: "16",
        system_component_group_id: "5",
        name: "Dashboard",
        order: "1",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "5",
        name: "Dashboard",
        order: "1"
      }
    },
    {
      SystemComponent: {
        system_component_id: "63",
        system_component_group_id: "5",
        name: "Campaign Summary",
        order: "2",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "5",
        name: "Dashboard",
        order: "1"
      }
    }
  ],
  Users: [
    {
      SystemComponent: {
        system_component_id: "14",
        system_component_group_id: "4",
        name: "User",
        order: "1",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "4",
        name: "Users",
        order: "5"
      }
    },
    {
      SystemComponent: {
        system_component_id: "15",
        system_component_group_id: "4",
        name: "User Group",
        order: "2",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "4",
        name: "Users",
        order: "5"
      }
    }
  ],
  Campaigns: [
    {
      SystemComponent: {
        system_component_id: "7",
        system_component_group_id: "3",
        name: "Campaign",
        order: "1",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "3",
        name: "Campaigns",
        order: "10"
      }
    },
    {
      SystemComponent: {
        system_component_id: "8",
        system_component_group_id: "3",
        name: "Campaign Statuses",
        order: "2",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "3",
        name: "Campaigns",
        order: "10"
      }
    },
    {
      SystemComponent: {
        system_component_id: "9",
        system_component_group_id: "3",
        name: "Campaign List Mix",
        order: "3",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "3",
        name: "Campaigns",
        order: "10"
      }
    },
    {
      SystemComponent: {
        system_component_id: "10",
        system_component_group_id: "3",
        name: "Lead Recycle",
        order: "4",
        _create: true,
        _read: true,
        _update: true,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "3",
        name: "Campaigns",
        order: "10"
      }
    },
    {
      SystemComponent: {
        system_component_id: "11",
        system_component_group_id: "3",
        name: "Pause Codes",
        order: "5",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "3",
        name: "Campaigns",
        order: "10"
      }
    },
    {
      SystemComponent: {
        system_component_id: "12",
        system_component_group_id: "3",
        name: "AC-CID",
        order: "6",
        _create: true,
        _read: true,
        _update: true,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "3",
        name: "Campaigns",
        order: "10"
      }
    },
    {
      SystemComponent: {
        system_component_id: "13",
        system_component_group_id: "3",
        name: "Call Transfer Presents",
        order: "7",
        _create: true,
        _read: true,
        _update: true,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "3",
        name: "Campaigns",
        order: "10"
      }
    }
  ],
  "Data Management": [
    {
      SystemComponent: {
        system_component_id: "17",
        system_component_group_id: "6",
        name: "Data List",
        order: "1",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "6",
        name: "Data Management",
        order: "30"
      }
    },
    {
      SystemComponent: {
        system_component_id: "67",
        system_component_group_id: "6",
        name: "Data List - Download",
        order: "2",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "6",
        name: "Data Management",
        order: "30"
      }
    },
    {
      SystemComponent: {
        system_component_id: "18",
        system_component_group_id: "6",
        name: "Advanced List Rule",
        order: "3",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "6",
        name: "Data Management",
        order: "30"
      }
    },
    {
      SystemComponent: {
        system_component_id: "19",
        system_component_group_id: "6",
        name: "Data Search",
        order: "4",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "6",
        name: "Data Management",
        order: "30"
      }
    },
    {
      SystemComponent: {
        system_component_id: "20",
        system_component_group_id: "6",
        name: "Custom Fields",
        order: "5",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "6",
        name: "Data Management",
        order: "30"
      }
    },
    {
      SystemComponent: {
        system_component_id: "21",
        system_component_group_id: "6",
        name: "Lead Management",
        order: "6",
        _create: false,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "6",
        name: "Data Management",
        order: "30"
      }
    }
  ],
  "Data Loader": [
    {
      SystemComponent: {
        system_component_id: "5",
        system_component_group_id: "1",
        name: "Main Access",
        order: "1",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "1",
        name: "Data Loader",
        order: "40"
      }
    },
    {
      SystemComponent: {
        system_component_id: "1",
        system_component_group_id: "1",
        name: "Data File",
        order: "2",
        _create: true,
        _read: true,
        _update: false,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "1",
        name: "Data Loader",
        order: "40"
      }
    },
    {
      SystemComponent: {
        system_component_id: "2",
        system_component_group_id: "1",
        name: "Process File",
        order: "3",
        _create: true,
        _read: true,
        _update: false,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "1",
        name: "Data Loader",
        order: "40"
      }
    },
    {
      SystemComponent: {
        system_component_id: "4",
        system_component_group_id: "1",
        name: "Queue",
        order: "4",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "1",
        name: "Data Loader",
        order: "40"
      }
    },
    {
      SystemComponent: {
        system_component_id: "3",
        system_component_group_id: "1",
        name: "Error File",
        order: "5",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "1",
        name: "Data Loader",
        order: "40"
      }
    }
  ],
  Inbound: [
    {
      SystemComponent: {
        system_component_id: "22",
        system_component_group_id: "7",
        name: "Inbound Queues",
        order: "1",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "7",
        name: "Inbound",
        order: "50"
      }
    },
    {
      SystemComponent: {
        system_component_id: "23",
        system_component_group_id: "7",
        name: "Numbers",
        order: "1",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "7",
        name: "Inbound",
        order: "50"
      }
    },
    {
      SystemComponent: {
        system_component_id: "24",
        system_component_group_id: "7",
        name: "Call Menu",
        order: "2",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "7",
        name: "Inbound",
        order: "50"
      }
    },
    {
      SystemComponent: {
        system_component_id: "25",
        system_component_group_id: "7",
        name: "Filter Phone Group",
        order: "3",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "7",
        name: "Inbound",
        order: "50"
      }
    },
    {
      SystemComponent: {
        system_component_id: "71",
        system_component_group_id: "7",
        name: "Agent",
        order: "5",
        _create: false,
        _read: true,
        _update: true,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "7",
        name: "Inbound",
        order: "50"
      }
    }
  ],
  "Admin Utility": [
    {
      SystemComponent: {
        system_component_id: "26",
        system_component_group_id: "8",
        name: "Scripts",
        order: "1",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "8",
        name: "Admin Utility",
        order: "60"
      }
    },
    {
      SystemComponent: {
        system_component_id: "27",
        system_component_group_id: "8",
        name: "Audio",
        order: "2",
        _create: true,
        _read: true,
        _update: false,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "8",
        name: "Admin Utility",
        order: "60"
      }
    },
    {
      SystemComponent: {
        system_component_id: "28",
        system_component_group_id: "8",
        name: "Voicemail",
        order: "3",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "8",
        name: "Admin Utility",
        order: "60"
      }
    },
    {
      SystemComponent: {
        system_component_id: "29",
        system_component_group_id: "8",
        name: "DNC Management",
        order: "4",
        _create: true,
        _read: true,
        _update: false,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "8",
        name: "Admin Utility",
        order: "60"
      }
    },
    {
      SystemComponent: {
        system_component_id: "30",
        system_component_group_id: "8",
        name: "Lead Filter List",
        order: "5",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "8",
        name: "Admin Utility",
        order: "60"
      }
    },
    {
      SystemComponent: {
        system_component_id: "31",
        system_component_group_id: "8",
        name: "Call Time",
        order: "6",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "8",
        name: "Admin Utility",
        order: "60"
      }
    },
    {
      SystemComponent: {
        system_component_id: "32",
        system_component_group_id: "8",
        name: "Shifts",
        order: "7",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "8",
        name: "Admin Utility",
        order: "60"
      }
    },
    {
      SystemComponent: {
        system_component_id: "33",
        system_component_group_id: "8",
        name: "System Audit",
        order: "8",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "8",
        name: "Admin Utility",
        order: "60"
      }
    },
    {
      SystemComponent: {
        system_component_id: "64",
        system_component_group_id: "8",
        name: "System Status",
        order: "9",
        _create: true,
        _read: true,
        _update: true,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "8",
        name: "Admin Utility",
        order: "60"
      }
    },
    {
      SystemComponent: {
        system_component_id: "69",
        system_component_group_id: "8",
        name: "Recordings",
        order: "9",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "8",
        name: "Admin Utility",
        order: "60"
      }
    },
    {
      SystemComponent: {
        system_component_id: "65",
        system_component_group_id: "8",
        name: "Music On Hold",
        order: "10",
        _create: true,
        _read: true,
        _update: true,
        _delete: true
      },
      SystemComponentGroup: {
        system_component_group_id: "8",
        name: "Admin Utility",
        order: "60"
      }
    }
  ],
  Report: [
    {
      SystemComponent: {
        system_component_id: "34",
        system_component_group_id: "9",
        name: "Export Call Report",
        order: "1",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "35",
        system_component_group_id: "9",
        name: "Export Lead Report",
        order: "2",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "36",
        system_component_group_id: "9",
        name: "Inbound Report",
        order: "3",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "37",
        system_component_group_id: "9",
        name: "Inbound Report By DID",
        order: "4",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "38",
        system_component_group_id: "9",
        name: "Inbound Service Level Report",
        order: "5",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "39",
        system_component_group_id: "9",
        name: "Inbound Summary Hourly Report",
        order: "6",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "40",
        system_component_group_id: "9",
        name: "Inbound Daily Report",
        order: "7",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "41",
        system_component_group_id: "9",
        name: "Inbound DID Report",
        order: "8",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "42",
        system_component_group_id: "9",
        name: "Inbound IVR Report",
        order: "9",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "43",
        system_component_group_id: "9",
        name: "Outbound Calling Report",
        order: "10",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "44",
        system_component_group_id: "9",
        name: "Outbound Summary Interval Report",
        order: "11",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "45",
        system_component_group_id: "9",
        name: "Outbound IVR Report",
        order: "12",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "46",
        system_component_group_id: "9",
        name: "Fronter Closer Report",
        order: "13",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "47",
        system_component_group_id: "9",
        name: "Lists Campaign Statuses Report",
        order: "14",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "48",
        system_component_group_id: "9",
        name: "Campaign Status List Report",
        order: "15",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "49",
        system_component_group_id: "9",
        name: "Agent Time Report",
        order: "16",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "50",
        system_component_group_id: "9",
        name: "Agent Status Report",
        order: "17",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "51",
        system_component_group_id: "9",
        name: "Agent Performance Report",
        order: "18",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "52",
        system_component_group_id: "9",
        name: "Team Performance Report",
        order: "19",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "53",
        system_component_group_id: "9",
        name: "Single Agent Report",
        order: "20",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "54",
        system_component_group_id: "9",
        name: "User Group Login Report",
        order: "21",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "55",
        system_component_group_id: "9",
        name: "User Stats Report",
        order: "22",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "56",
        system_component_group_id: "9",
        name: "User Time Sheet Report",
        order: "23",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "57",
        system_component_group_id: "9",
        name: "Agent Login Report",
        order: "24",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "58",
        system_component_group_id: "9",
        name: "User Timeclock Report",
        order: "25",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "59",
        system_component_group_id: "9",
        name: "User Group Timeclock Status Report",
        order: "26",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "60",
        system_component_group_id: "9",
        name: "User Timeclock Detail Report",
        order: "27",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "61",
        system_component_group_id: "9",
        name: "Outbound IVR Report Export",
        order: "28",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "62",
        system_component_group_id: "9",
        name: "Performance Comparison Report",
        order: "29",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    },
    {
      SystemComponent: {
        system_component_id: "68",
        system_component_group_id: "9",
        name: "Campaign List Detail Report",
        order: "30",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "9",
        name: "Report",
        order: "70"
      }
    }
  ],
  App: [
    {
      SystemComponent: {
        system_component_id: "66",
        system_component_group_id: "10",
        name: "Leadbeam",
        order: "1",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "10",
        name: "App",
        order: "200"
      }
    },
    {
      SystemComponent: {
        system_component_id: "72",
        system_component_group_id: "10",
        name: "AMD",
        order: "1",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "10",
        name: "App",
        order: "200"
      }
    },
    {
      SystemComponent: {
        system_component_id: "74",
        system_component_group_id: "10",
        name: "Score Cards",
        order: "1",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "10",
        name: "App",
        order: "200"
      }
    },
    {
      SystemComponent: {
        system_component_id: "73",
        system_component_group_id: "10",
        name: "Voice Messaging",
        order: "1",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "10",
        name: "App",
        order: "200"
      }
    },
    {
      SystemComponent: {
        system_component_id: "75",
        system_component_group_id: "10",
        name: "Mobile_App",
        order: "1",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "10",
        name: "App",
        order: "200"
      }
    },
    {
      SystemComponent: {
        system_component_id: "70",
        system_component_group_id: "10",
        name: "Leadbeam 2",
        order: "2",
        _create: false,
        _read: true,
        _update: false,
        _delete: false
      },
      SystemComponentGroup: {
        system_component_group_id: "10",
        name: "App",
        order: "200"
      }
    }
  ]
};
