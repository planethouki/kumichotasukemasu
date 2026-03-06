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

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsDone(false);
    }
  };

  const handleProcess = () => {
    if (!file) return;
    
    setIsProcessing(true);
    // 整形処理のシミュレーション（後で実装）
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
    }, 2000);
  };

  const handleDownload = () => {
    // ダウンロード処理のシミュレーション
    alert('整えられたエクセルファイルをダウンロードします！');
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
