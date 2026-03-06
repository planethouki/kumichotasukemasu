import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid,
  ThemeProvider, 
  createTheme, 
  CssBaseline 
} from '@mui/material'
import { Link } from 'react-router'
import CalculateIcon from '@mui/icons-material/Calculate'

// イラストレーターに優しい、暖かみのあるパステル調のテーマ設定
const theme = createTheme({
  palette: {
    primary: {
      main: '#64b5f6', // 空のような爽やかな青
    },
    secondary: {
      main: '#ffb74d', // 太陽のような暖かみのあるオレンジ
    },
    background: {
      default: '#fdfcf0', // 画用紙のような優しい色
    },
  },
  typography: {
    fontFamily: '"M PLUS Rounded 1c", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 24, // さらに丸くして柔らかい印象に
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '12px 24px',
        },
      },
    },
  },
});

function Home() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" gutterBottom color="primary.dark">
            エクセル集計くん
          </Typography>
          <Typography variant="h6" color="text.secondary">
            エクセル作業をパパッと済ませる魔法の道具箱
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)' }
              }}
            >
              <CalculateIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                エントリー集計
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: '#666' }}>
                4月セッションなどの、複雑なエントリー集計をワンクリックで整えます。
              </Typography>
              <Button
                component={Link}
                to="/entry/calc"
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}
              >
                ここから始める
              </Button>
            </Paper>
          </Grid>

          {/* 今後追加される予定のダミーカード */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 4, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                opacity: 0.6,
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography variant="h5" gutterBottom color="text.disabled">
                準備中...
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'text.disabled' }}>
                他にも役立つ機能を準備しています。お楽しみに。
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#aaa' }}>
            ※むずかしい設定はありません。イラストを描くように、気楽に使ってください。
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default Home;