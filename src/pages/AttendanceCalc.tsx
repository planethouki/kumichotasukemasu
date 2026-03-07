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
import { Link } from 'react-router'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import * as XLSX from 'xlsx'

// 出欠集計用の独自テーマ（他と見分けがつくように紫・ピンク系に）
const theme = createTheme({
  palette: {
    primary: {
      main: '#9c27b0', // 紫系
    },
    secondary: {
      main: '#e91e63', // ピンク系
    },
    background: {
      default: '#fdf0f7', // ほんのりピンクの白
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
});


function AttendanceCalc() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [resultWorkbook, _setResultWorkbook] = useState<XLSX.WorkBook | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsDone(false);
      // setResultWorkbook(null);
    }
    e.target.value = '';
  };

  const handleProcess = () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    // 集計機能はまだ作らないため、タイマーで完了をシミュレート
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
    }, 1500);
  };

  const handleDownload = () => {
    if (!resultWorkbook) {
        alert('集計機能はまだ実装されていません');
        return;
    }
    
    XLSX.writeFile(resultWorkbook, '出欠集計結果.xlsx');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBackIcon />}
            sx={{ color: 'text.secondary' }}
          >
            戻る
          </Button>
        </Box>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', backgroundColor: '#ffffff' }}>
          <Typography variant="h4" gutterBottom color="primary">
            出欠集計
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
            回答エクセルを読み込んで、出欠を分かりやすくまとめます
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
                sx={{ px: 4, py: 2, borderWidth: 2, '&:hover': { borderWidth: 2 }, color: 'primary.main', borderColor: 'primary.main' }}
              >
                {file ? file.name : 'エクセルを選ぶ'}
              </Button>
            </label>
            {!file && (
              <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                出欠回答のエクセルを選択してね
              </Typography>
            )}
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
              集計を開始する
            </Button>
          )}

          {isProcessing && (
            <Box sx={{ mt: 2 }}>
              <CircularProgress size={40} />
              <Typography sx={{ mt: 2 }}>一生懸命、集計しています...</Typography>
            </Box>
          )}

          {isDone && (
            <Box sx={{ mt: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ mb: 3 }}>
                集計が完了しました！
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
                結果をダウンロードする
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
            ※集計機能は順次アップデート予定です。
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default AttendanceCalc
