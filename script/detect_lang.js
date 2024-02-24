/**
 * @typedef {Object} LangInfo - ツイートの主言語を示すオブジェクト
 * @property {string} primary - 最も可能性が高い言語
 * @property {string?} secondary - 2番目に可能性が高い言語
 */

/**
 * 種類ごとに文字を分類する連想配列。
 * @type {Object<string, Array<Array<number> | number>>}
 */
const characterRanges = {
  'ja': [
    [0x30_40, 0x30_9F], // ひらがな
    [0x30_A0, 0x30_FF], // カタカナ
    [0xFF_65, 0xFF_9F], // 半角カタカナ
    [0x4E_00, 0x9F_FF], // 漢字
  ],
  'en': [
    [0x00_41, 0x00_5A], // 英大文字
    [0x00_61, 0x00_7A], // 英小文字
  ],
  'ar': [0x06_00, 0x06_FF], // アラビア文字
  'zh': [0x4E_00, 0x9F_FF], // 漢字（中国語）
  'ko': [0xAC_00, 0xD7_AF], // ハングル（韓国語）
  'ru': [0x04_00, 0x04_FF], // キリル文字（ロシア語）
  'he': [0x05_90, 0x05_FF], // ヘブライ文字
  'hi': [0x09_00, 0x09_7F], // ヒンディー語
  'th': [0x0E_00, 0x0E_7F], // タイ文字
  'fa': [0x06_00, 0x06_FF], // ペルシャ語
  'de': [
    [0x00_C0, 0x00_FF], // Umlauts, ß, etc.
    [0x01_52, 0x01_53], // Œ, œ
    [0x20_A0, 0x20_CF], // Currency symbols, etc.
  ],
  'es': [
    [0x00_C0, 0x00_FF], // Accented characters
    [0x20_A0, 0x20_CF], // Currency symbols, etc.
  ],
  'emoji': [0x1_F3_00, 0x1_F5_FF], // 絵文字
};

/**
 * ツイートの主言語を推測する。
 *
 * @param {string} text - ツイートのテキスト
 * @return {LangInfo} 推測したツイートの主言語
 */
function detectLang(text) { // eslint-disable-line no-unused-vars
  const langStats = {};
  let totalCount = 0;

  // 言語ごとの出現数をカウント
  for (let index = 0; index < text.length; index++) {
    const charCode = text.charCodeAt(index);
    let found = false;

    for (const lang in characterRanges) {
      if (characterRanges.hasOwnProperty(lang)) {
        if (!langStats[lang]) {
          langStats[lang] = 0;
        }

        const ranges = characterRanges[lang];

        for (let index = 0; index < ranges.length; index++) {
          const range = ranges[index];
          if (Array.isArray(range)) {
            if (charCode >= range[0] && charCode <= range[1]) {
              langStats[lang]++;
              totalCount++;
              found = true;
              break;
            }
          } else {
            if (charCode >= ranges[0] && charCode <= ranges[1]) {
              langStats[lang]++;
              totalCount++;
              found = true;
              break;
            }
          }
        }

        if (found) {
          break;
        }
      }
    }

    if (!found) {
      langStats['unknown'] = (langStats['unknown'] || 0) + 1;
      totalCount++;
    }
  }

  // 言語判定
  const langPercentages = [];
  for (const lang in langStats) {
    if (langStats.hasOwnProperty(lang)) {
      const percentage = langStats[lang] / totalCount;
      langPercentages.push({lang: lang, percentage: percentage});
    }
  }

  // もしlangPercentagesが空の場合、'unknown' を追加
  if (langPercentages.length === 0) {
    langPercentages.push({lang: 'unknown', percentage: 1});
  }

  // 確率の高い順にソート
  langPercentages.sort(function(a, b) {
    return b.percentage - a.percentage;
  });

  // 2番目の可能性も返す
  const secondLang = langPercentages[1] ? langPercentages[1].lang : null;

  return {primary: langPercentages[0].lang, secondary: secondLang};
}
