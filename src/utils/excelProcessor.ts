import * as XLSX from 'xlsx';

const normalizePart = (part: string) => {
  const normalized = part.trim().replace(/\.+$/, '');
  if (normalized === 'Gt') return 'Gt1';
  if (normalized === 'Gt.2') return 'Gt2';
  return normalized;
};

const normalizePartsList = (partsStr: string) => {
  return partsStr
      .split(/[,，、\n]/)
      .map(p => normalizePart(p));
};

interface SongData {
  song: string;
  name: string;
  myParts: string;
  allParts: string;
}

// 楽器リスト
const INSTRUMENTS = ['Vo.', 'Cho.', 'Gt1.', 'Gt2.', 'Ba.', 'Dr.', 'Key.'];

export const processExcelFile = async (data: Uint8Array): Promise<XLSX.WorkBook | null> => {
  const workbook = XLSX.read(data, { type: 'array' });

  // JSONデータの取得
  let songDataList: SongData[] = [];
  try {
    const songSelector = import.meta.env.VITE_SONG_SELECTOR;
    if (songSelector) {
      songDataList = JSON.parse(songSelector) as SongData[];
    }
  } catch (error) {
    console.error('Failed to parse song selector data:', error);
  }
  
  // 最初のシートを取得
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // シートを2次元配列として取得 (空セルも保持するため)
  const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, defval: '' });
  
  if (rows.length < 2) {
    return null;
  }

  const headers = rows[0];
  // 3列目以降が曲名
  const songNames = headers.slice(2);
  
  const memberResponses = rows.slice(1).map(row => {
    const name = row[1] || '';
    const responses = row.slice(2);
    return { name, responses };
  }).filter(m => m.name.trim() !== ''); // 名前が空の行は除外
  
  // 出力用データの配列
  const outputData: string[][] = [
    [],
    [],
    [],
    [],
    [],
    ['', '', '選曲者', 'タイトル/アーティスト', ...INSTRUMENTS]
  ];

  songNames.forEach((song, songIdx) => {
    if (!song || song.trim() === '') return; // 曲名が空の場合はスキップ

    const cleanedSong = song.trim().replace(/^\[/, '').replace(/\]$/, '').trim();

    // 選曲者情報の検索
    const songInfo = songDataList.find(s => s.song.trim() === cleanedSong);
    const selectionPerson = songInfo ? songInfo.name : '';
    const selectionPersonPart = songInfo ? songInfo.myParts : '';
    const requiredParts = songInfo ? normalizePartsList(songInfo.allParts) : [];

    const rowData = [
      (songIdx + 1).toString(), // 番号
      '', // (空)
      selectionPerson, // 選曲者
      cleanedSong, // タイトル/アーティスト
    ];

    // 各楽器の担当者を探す
    INSTRUMENTS.forEach(inst => {
      const normalizedInst = normalizePart(inst);

      // その曲にそのパートが必要ない場合は全角ハイフン
      if (songInfo && !requiredParts.includes(normalizedInst)) {
        rowData.push('－');
        return;
      }

      const participants: string[] = [];

      // 選曲者がこのパートの担当者の場合は追加
      if (selectionPerson && selectionPersonPart) {
        const parts = normalizePartsList(selectionPersonPart.toString());
        if (parts.includes(normalizedInst)) {
          participants.push(selectionPerson);
        }
      }

      memberResponses.forEach(m => {
        const resp = m.responses[songIdx] || '';
        // パート指定が "Cho., Gt1" のように複数ある場合も考慮
        const parts = normalizePartsList(resp.toString());

        if (parts.includes(normalizedInst)) {
          // 重複チェック
          if (!participants.includes(m.name)) {
            participants.push(m.name);
          }
        }
      });
      rowData.push(participants.join('・'));
    });

    outputData.push(rowData);
  });

  // 新しいワークブックとシートの作成
  const newWorksheet = XLSX.utils.aoa_to_sheet(outputData);

  // 列の幅を設定
  newWorksheet['!cols'] = [
    { wch: 5 },  // 番号
    { wch: 2 },  // (空)
    { wch: 15 }, // 選曲者
    { wch: 40 }, // タイトル/アーティスト
    ...INSTRUMENTS.map(() => ({ wch: 15 })) // 各楽器
  ];

  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, '集計結果');

  return newWorkbook;
};
