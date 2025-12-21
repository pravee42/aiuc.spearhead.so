'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Logo from '../components/Logo';

// Pure Storage theme color
const PURE_ORANGE = '#fe5000';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: PURE_ORANGE,
      light: '#ff7a33',
      dark: '#cc4000',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
});

export default function LoginPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Redirect to home page on success
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: '40px',
            maxWidth: '450px',
            width: '100%',
            borderRadius: '8px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Logo
              src="/assets/purelogo.png"
              alt="Pure Storage"
              width={150}
              height={40}
              fallbackText="PURESTORAGE"
            />
            <Typography
              variant="h5"
              component="h1"
              sx={{
                mt: 3,
                mb: 1,
                color: '#1a1a1a',
                fontWeight: 600,
              }}
            >
              AI Use Case Repository
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666666',
                textAlign: 'center',
              }}
            >
              Enter your authentication token to continue
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                backgroundColor: '#fff5f2',
                borderLeft: `4px solid ${PURE_ORANGE}`,
                color: '#1a1a1a',
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Authentication Token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              disabled={loading}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: PURE_ORANGE,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: PURE_ORANGE,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: PURE_ORANGE,
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !token.trim()}
              sx={{
                backgroundColor: PURE_ORANGE,
                color: '#ffffff',
                padding: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#cc4000',
                },
                '&:disabled': {
                  backgroundColor: '#cccccc',
                  color: '#666666',
                },
              }}
            >
              {loading ? 'Authenticating...' : 'Login'}
            </Button>
          </form>

          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Logo
              src="/assets/spearhead.png"
              alt="Spearhead"
              width={40}
              height={40}
              fallbackText=""
            />
            <Typography
              variant="body2"
              sx={{
                color: '#666666',
                fontSize: '0.75rem',
              }}
            >
              Powered by Spearhead
            </Typography>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

