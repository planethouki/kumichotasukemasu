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
  const [resultWorkbook, setResultWorkbook] = useState<XLSX.WorkBook | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsDone(false);
      setResultWorkbook(null);
    }
    e.target.value = '';
  };

  interface AttendanceData {
    name: string;
    session: string;
    party: string;
    isSessionAttend: boolean;
  }

  const handleProcess = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 1行目がタイトル
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);
        
        // 必要なデータを抽出
        // 「お名前（りんごネーム）」「セッション出欠」「打ち上げ出欠」
        const attendees: AttendanceData[] = [];
        const absentees: AttendanceData[] = [];
        
        rows.forEach((row) => {
          const name = row['お名前（りんごネーム）'];
          const sessionAttendance = row['セッション出欠'];
          const partyAttendance = row['打ち上げ出欠'];
          
          if (!name) return;

          const data = {
            name,
            session: sessionAttendance === '出席' ? '〇' : '×',
            party: partyAttendance === '出席' ? '〇' : '×',
            isSessionAttend: sessionAttendance === '出席'
          };

          if (data.isSessionAttend) {
            attendees.push(data);
          } else {
            absentees.push(data);
          }
        });

        // 出力用データの作成
        const outputData: string[][] = [];
        
        // 1行目はメモ欄で空白
        outputData.push([]);
        
        // 2行目がヘッダー
        // Ａ列は「名札」、Ｂ列は「エントリー」、Ｃ列は「セッション出欠」、Ｄ列は空白、Ｅ列は空白、Ｆ列が「打上」、Ｈ列が「最後に参加した月」、Ｉ列が「備考」
        // (G列は空白だが、ヘッダーの説明にはない。3行目以降はGも空白とのこと)
        outputData.push(['名札', 'エントリー', 'セッション出欠', '', '', '打ち上げ出欠', '', '最後に参加した月', '備考']);
        
        // 3行目以降がデータ
        // Ａ、Ｂ、Ｄ、Ｇ、Ｈ、Ｉは空白
        // Ｃはセッション出欠で出席なら「〇」欠席なら「×」
        // Ｅは「お名前（りんごネーム）」
        // Ｆは「打ち上げ出欠」で出席なら「〇」欠席なら「×」
        attendees.forEach(a => {
          outputData.push(['', '', a.session, '', a.name, a.party, '', '', '']);
        });

        // 集計行
        const sessionAttendCount = attendees.length;
        const partyAttendCount = attendees.filter(a => a.party === '〇').length;
        
        const sessionFee = 1000;
        const partyFee = 4000;
        
        const sessionTotalAmount = sessionAttendCount * sessionFee;
        const partyTotalAmount = partyAttendCount * partyFee;

        outputData.push([]);
        // 「会場費25000円 xx名分xxxx円」
        outputData.push(['', '', '', '', `会場費25000円 ${sessionAttendCount}名分${sessionTotalAmount}円`]);
        // 「打ち上げxx名分xxxxx円」
        outputData.push(['', '', '', '', `打ち上げ${partyAttendCount}名分${partyTotalAmount}円`]);
        outputData.push([]);

        // 下部にセッション欠席の表。ヘッダー不要。
        absentees.forEach(a => {
          outputData.push(['', '', a.session, '', a.name, a.party, '', '', '']);
        });

        const newWorksheet = XLSX.utils.aoa_to_sheet(outputData);

        // 列の幅を設定
        newWorksheet['!cols'] = [
          { wch: 10 }, // A: 名札
          { wch: 10 }, // B: エントリー
          { wch: 10 }, // C: セッション出欠
          { wch: 5 },  // D: 空白
          { wch: 25 }, // E: お名前（りんごネーム）
          { wch: 10 }, // F: 打ち上げ出欠
          { wch: 15 }, // G: 空白
          { wch: 20 }, // H: 最後に参加した月
          { wch: 30 }, // I: 備考
        ];

        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, '出欠集計');
        
        setResultWorkbook(newWorkbook);
        setIsProcessing(false);
        setIsDone(true);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('ファイルの処理中にエラーが発生しました');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultWorkbook) {
        alert('集計機能はまだ実装されていません');
        return;
    }
    
    XLSX.writeFile(resultWorkbook, 'りんご受付.xlsx');
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
            出欠集計（β）
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
                4月りんごなかま選曲・出欠 （回答）.xlsxを選択してね
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
