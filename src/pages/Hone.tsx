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
import { processExcelFile } from '../utils/excelProcessor.ts'

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


function Hone() {
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
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const newWorkbook = await processExcelFile(data);
      
      if (!newWorkbook) {
        setIsProcessing(false);
        return;
      }

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
            エントリー集計
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
            今のところ4月セッションのみ対応
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

export default Hone
