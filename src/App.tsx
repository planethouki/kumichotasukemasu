import { useState, type ChangeEvent } from 'react'
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  ThemeProvider, 
  createTheme, 
  CssBaseline 
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import * as XLSX from 'xlsx'
import './App.css'

// 手書きのイラストレーターに優しい、暖かみのあるテーマ設定
const theme = createTheme({
  palette: {
    primary: {
      main: '#ff9800', // オレンジ系で親しみやすさを
    },
    secondary: {
      main: '#4caf50', // 緑系で安心感を
    },
    background: {
      default: '#fff9f0', // 少し温かみのある白
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16, // 角を丸くして優しく
  },
});

const normalizePart = (part: string) => part.trim().replace(/\.+$/, '');

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [resultWorkbook, setResultWorkbook] = useState<XLSX.WorkBook | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsDone(false);
      setResultWorkbook(null);
    }
    // 同じファイルを再度選択してもonChangeが発火するように、inputのvalueをリセット
    e.target.value = '';
  };

  const handleProcess = () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // 最初のシートを取得
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // シートを2次元配列として取得 (空セルも保持するため)
      const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, defval: '' });
      
      if (rows.length < 2) {
        setIsProcessing(false);
        return;
      }

      const headers = rows[0];
      // 3列目以降が曲名
      const songNames = headers.slice(2);
      
      const memberResponses = rows.slice(1).map(row => {
        const name = row[1] || '';
        const responses = row.slice(2);
        return { name, responses };
      }).filter(m => m.name.trim() !== ''); // 名前が空の行は除外

      // 楽器リスト
      const instruments = ['Vo.', 'Cho.', 'Gt1.', 'Gt2.', 'Ba.', 'Dr.', 'Key.'];
      
      // 出力用データの配列
      const outputData: any[][] = [
        ['4:30 OPEN'],
        ['5:00 受付'],
        ['5:30 1曲目音出し'],
        ['5:50 朝礼'],
        [],
        ['', '', '選曲者', 'タイトル/アーティスト', ...instruments]
      ];

      songNames.forEach((song, songIdx) => {
        if (!song || song.trim() === '') return; // 曲名が空の場合はスキップ

        const cleanedSong = song.trim().replace(/^\[/, '').replace(/\]$/, '').trim();

        const rowData = [
          (songIdx + 1).toString(), // 番号
          '', // (空)
          '', // 選曲者
          cleanedSong, // タイトル/アーティスト
        ];

        // 各楽器の担当者を探す
        instruments.forEach(inst => {
          const participants: string[] = [];
          const normalizedInst = normalizePart(inst);

          memberResponses.forEach(m => {
            const resp = m.responses[songIdx] || '';
            // パート指定が "Cho., Gt1" のように複数ある場合も考慮
            const parts = resp
              .toString()
              .split(/[,，、\n]/)
              .map(p => normalizePart(p));

            if (parts.includes(normalizedInst)) {
              participants.push(m.name);
            }
          });
          rowData.push(participants.join('・'));
        });

        outputData.push(rowData);
      });

      // 新しいワークブックとシートの作成
      const newWorksheet = XLSX.utils.aoa_to_sheet(outputData);
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, '集計結果');

      setResultWorkbook(newWorkbook);
      
      setTimeout(() => {
        setIsProcessing(false);
        setIsDone(true);
      }, 1500);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownload = () => {
    if (!resultWorkbook) return;
    
    // エクセルファイルとして書き出し
    XLSX.writeFile(resultWorkbook, 'エントリー集計結果.xlsx');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', backgroundColor: '#ffffff' }}>
          <Typography variant="h4" gutterBottom color="primary">
            エクセルお助け隊
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
            エクセルファイルをアップロードすると、<br />
            自動で使いやすく整えます。
          </Typography>

          <Box sx={{ mb: 4 }}>
            <input
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                size="large"
                sx={{ px: 4, py: 2, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                {file ? file.name : 'エクセルを選ぶ'}
              </Button>
            </label>
          </Box>

          {file && !isProcessing && !isDone && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleProcess}
              sx={{ py: 1.5, fontSize: '1.1rem', color: 'white' }}
            >
              ファイルを整える
            </Button>
          )}

          {isProcessing && (
            <Box sx={{ mt: 2 }}>
              <CircularProgress size={40} />
              <Typography sx={{ mt: 2 }}>一生懸命、整えています...</Typography>
            </Box>
          )}

          {isDone && (
            <Box sx={{ mt: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ mb: 3 }}>
                完成しました！
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                startIcon={<FileDownloadIcon />}
                onClick={handleDownload}
                sx={{ py: 1.5, fontSize: '1.1rem', color: 'white' }}
              >
                ダウンロードする
              </Button>
              <Button 
                variant="text" 
                sx={{ mt: 2 }} 
                onClick={() => { setFile(null); setIsDone(false); }}
              >
                別のファイルをやり直す
              </Button>
            </Box>
          )}
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#999' }}>
            ※PCが苦手な方でも大丈夫。ゆっくり進めてくださいね。
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App
