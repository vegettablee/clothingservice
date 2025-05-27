const rawStores = [
  {
    places: [
      { id: "12345" },
      { id: "54321" },
      { id: "67890" },
      { id: "98765" },
      { id: "22222" },
      { id: "33333" },
      { id: "44444" },
      { id: "55555" },
    ],
    nextPageToken: null,
  },
  {
    places: [
      { id: "12345" }, // duplicate
      { id: "66666" },
      { id: "77777" },
      { id: "88888" },
      { id: "54321" }, // duplicate
      { id: "99999" },
      { id: "10101" },
      { id: "11111" },
      { id: "12121" },
      { id: "13131" },
    ],
    nextPageToken: null,
  },
  {
    places: [
      { id: "14141" },
      { id: "15151" },
      { id: "67890" }, // duplicate
      { id: "16161" },
      { id: "17171" },
      { id: "18181" },
      { id: "19191" },
      { id: "20202" },
      { id: "21212" },
      { id: "22222" }, // duplicate
    ],
    nextPageToken: null,
  },
  {
    places: [
      { id: "23232" },
      { id: "24242" },
      { id: "25252" },
      { id: "26262" },
      { id: "27272" },
      { id: "28282" },
      { id: "29292" },
      { id: "30303" },
      { id: "31313" },
      { id: "33333" }, // duplicate
    ],
    nextPageToken: null,
  },
  {
    places: [
      { id: "34343" },
      { id: "35353" },
      { id: "36363" },
      { id: "37373" },
      { id: "38383" },
      { id: "39393" },
      { id: "40404" },
      { id: "41414" },
      { id: "42424" },
      { id: "43434" },
    ],
    nextPageToken:
      "AXQCQNQRB1WtnxNoepPl3dNiBupnAMqIQmeOO5E4CTw4zD_GPv4ZZqFo8HDZe4eosudrdyy9s4lrjsDLWWUj1PkkGPP6OrHEbdRNpCasQO86RmmhXUimWwXzTHgeq5G00Ef5w_lq0hxxIpRDAheM1-dFEUSBNzk8Pdh5uYp92nkCMm6fQhKyrBVPz_Fef0b-H_P7PoVkN-AwPH8LfaS0tBVFA4Ij29xKKllWPiNodOM5ztxyR-RXq19FVfgmxc-yRwg0kAjIYzA4VoLKFbnARY00oG-CLFrDkvlIonwsBJLNnk-83jYPE3nhCbSSNLtC3wihTwb5Ov2Aii5S1-J5w_g2PosTEc98uaDislLKQ4-0cNq_EBW-qitDpCdLzmqfekNTxTx5MLENf3gxw1Y8MqEQJSNRLVc_SfMsZsPit8kn_g3PHKuFYyNhFvkDUg52JC-iZP1cRnh_",
  },
];

module.exports = rawStores;
