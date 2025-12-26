"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi, GridReadyEvent, BodyScrollEvent } from "ag-grid-community";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Button,
  IconButton,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import Logo from "./components/Logo";

// Pure Storage theme color
const PURE_ORANGE = "#fe5000";

// Note: MUI DataGrid-specific header/filter logic has been removed.



const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: PURE_ORANGE,
      light: "#ff7a33",
      dark: "#cc4000",
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h4: {
      fontWeight: 600,
      color: "#1a1a1a",
    },
  },
  components: {
    // @ts-ignore - MUI DataGrid component overrides
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "none",
          backgroundColor: "#ffffff",
          color: "#1a1a1a",
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #e0e0e0",
            color: "#1a1a1a",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            "& > *": {
              overflow: "hidden",
            },
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#fafafa",
            borderBottom: `2px solid ${PURE_ORANGE}`,
            fontWeight: 600,
            fontSize: "0.875rem",
            color: "#1a1a1a",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 600,
            color: "#1a1a1a",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#fff5f2",
          },
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor: "#ffe8e0",
            "&:hover": {
              backgroundColor: "#ffe8e0",
            },
          },
          "& .MuiDataGrid-filterForm": {
            backgroundColor: "#ffffff",
            color: "#1a1a1a",
          },
          "& .MuiDataGrid-toolbarContainer": {
            padding: "16px",
            backgroundColor: "#fafafa",
            borderBottom: "1px solid #e0e0e0",
            "& .MuiInputBase-root": {
              color: "#1a1a1a",
              "& input": {
                color: "#1a1a1a",
              },
            },
          },
          "& .MuiButton-root": {
            color: PURE_ORANGE,
            "&:hover": {
              backgroundColor: "#fff5f2",
            },
          },
          "& .MuiIconButton-root": {
            color: PURE_ORANGE,
            "&:hover": {
              backgroundColor: "#fff5f2",
            },
          },
          "& .MuiInputBase-root": {
            color: "#1a1a1a",
            "&.Mui-focused": {
              borderColor: PURE_ORANGE,
            },
            "& input": {
              color: "#1a1a1a",
            },
          },
          "& .MuiCheckbox-root": {
            color: PURE_ORANGE,
            "&.Mui-checked": {
              color: PURE_ORANGE,
            },
          },
          // Hide standard pagination
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff5f2",
          color: "#1a1a1a",
          border: `1px solid ${PURE_ORANGE}`,
          margin: "2px",
          height: "24px",
          fontSize: "0.75rem",
          "&:hover": {
            backgroundColor: "#ffe8e0",
            borderColor: PURE_ORANGE,
          },
        },
      },
    },
  },
});

interface UseCaseData {
  id: number;
  Capability: number;
  "Business Function": string;
  "Business Capability": string;
  "Stakeholder or User": string;
  "AI Use Case": string;
  "AI Algorithms & Frameworks": string;
  Datasets: string;
  "Action / Implementation": string;
  "AI Tools & Models": string;
  "Digital Platforms and Tools": string;
  "Expected Outcomes and Results": string;
}

interface ApiResponse {
  total: number;
  page: number;
  page_size: number | string;
  data: Omit<UseCaseData, "id">[];
}

// Use a conservative page size that the API definitely accepts
const PAGE_SIZE = 20;

export default function Home() {
  const router = useRouter();

  // AG Grid API ref so we can recalculate row heights when rows expand/collapse
  const gridApiRef = useRef<GridApi | null>(null);

  // State for data and pagination
  const [data, setData] = useState<UseCaseData[]>([]);
  const [page, setPage] = useState(0); // 0-indexed page
  const [loading, setLoading] = useState(true); // Initial loading
  const [isFetchingMore, setIsFetchingMore] = useState(false); // Background loading
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const loadData = useCallback(
    async (currentPage: number) => {
      try {
        if (currentPage === 0) setLoading(true);
        else setIsFetchingMore(true);

        setError(null);

        const response = await fetch(
          `/api/use-cases?page=${currentPage + 1}&page_size=${PAGE_SIZE}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const result: ApiResponse = await response.json();

        // Respect the page_size actually returned by the API (some APIs cap it)
        const parsedPageSize =
          typeof result.page_size === "string"
            ? parseInt(result.page_size, 10)
            : result.page_size;
        const effectivePageSize =
          typeof parsedPageSize === "number" && !Number.isNaN(parsedPageSize)
            ? parsedPageSize
            : PAGE_SIZE;

        console.log(
          "[loadData] page",
          currentPage,
          "result.page",
          result.page,
          "result.page_size",
          result.page_size,
          "effectivePageSize",
          effectivePageSize,
          "result.total",
          result.total,
          "result.data.length",
          result.data.length
        );

        const newData = result.data.map((item, index) => ({
          ...item,
          id: item.Capability,
        }));

        setData((prevData) => {
          const combined =
            currentPage === 0 ? newData : [...prevData, ...newData];
          console.log(
            "[loadData] setting data length",
            combined.length,
            "prev",
            prevData.length,
            "added",
            newData.length
          );
          return combined;
        });

        const totalFetched =
          currentPage * effectivePageSize + result.data.length;
        if (typeof result.total === "number" && result.total > 0) {
          setHasMore(totalFetched < result.total);
        } else {
          setHasMore(result.data.length === effectivePageSize);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    },
    [router]
  );

  // Initial load
  useEffect(() => {
    loadData(0);
  }, []);

  // Handler for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (!isFetchingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage);
    }
  }, [isFetchingMore, hasMore, loading, page, loadData]);

  const onBodyScroll = useCallback((event: BodyScrollEvent) => {
    const { api } = event;
    const lastDisplayedRow = api.getLastDisplayedRow();
    const totalRows = api.getDisplayedRowCount();

    // Load more when we are near the bottom (e.g. 10 rows remaining)
    if (totalRows > 0 && lastDisplayedRow >= totalRows - 10) {
      handleLoadMore();
    }
  }, [handleLoadMore]);

  // Helper function to parse CSV values
  const parseChipItems = (value: string | null | undefined): string[] => {
    if (!value) return [];
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  // Helper function to toggle row expansion
  const toggleRowExpansion = (rowId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });

    // Ask AG Grid to recompute row heights after the expanded set changes
    if (gridApiRef.current) {
      gridApiRef.current.resetRowHeights();
    }
  };

  // Helper function to render chips
  const renderChips = (
    value: string | null | undefined,
    rowId: number,
    isExpanded: boolean
  ) => {
    const items = parseChipItems(value);
    if (items.length === 0) return null;

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: isExpanded ? "wrap" : "nowrap",
          gap: 0.5,
          py: 1,
          width: "100%",
          maxWidth: "100%",
          overflow: isExpanded ? "visible" : "hidden",
          whiteSpace: isExpanded ? "normal" : "nowrap",
          cursor: "pointer",
          minHeight: isExpanded ? "auto" : "24px",
          "&:hover": {
            opacity: 0.8,
          },
        }}
      >
        {items.map((item, index) => (
          <Chip
            key={index}
            label={item}
            size="small"
            sx={{
              fontSize: "0.75rem",
              flexShrink: 0,
              maxWidth: "none",
            }}
          />
        ))}
      </Box>
    );
  };

  const getRowId = useCallback((params: any) => {
    return String(params.data.id);
  }, []);

  const columnDefs: ColDef<UseCaseData>[] = useMemo(() => {
    return [
      {
        field: "Capability",
        headerName: "Capability",
        width: 120,
        filter: true,
        sortable: true,
        cellRenderer: (params: any) => {
          const rowId = (params.data?.id as number) ?? 0;
          return (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                toggleRowExpansion(rowId);
              }}
              sx={{ width: "100%", cursor: "pointer", py: 1 }}
            >
              {params.value}
            </Box>
          );
        },
      },
      {
        field: "Business Function",
        headerName: "Business Function",
        width: 180,
        filter: true,
        sortable: true,
        cellRenderer: (params: any) => {
          const rowId = (params.data?.id as number) ?? 0;
          const isExpanded = expandedRows.has(rowId);
          return (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                toggleRowExpansion(rowId);
              }}
              sx={{
                width: "100%",
                cursor: "pointer",
                py: 1,
                whiteSpace: isExpanded ? "normal" : "nowrap",
                overflow: isExpanded ? "visible" : "hidden",
                textOverflow: isExpanded ? "clip" : "ellipsis",
              }}
            >
              {params.value}
            </Box>
          );
        },
      },
      {
        field: "Business Capability",
        headerName: "Business Capability",
        width: 200,
        filter: true,
        sortable: true,
        autoHeight: true,
        cellRenderer: (params: any) => {
          const rowId = (params.data?.id as number) ?? 0;
          const isExpanded = expandedRows.has(rowId);
          return (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                toggleRowExpansion(rowId);
              }}
              sx={{
                width: "100%",
                cursor: "pointer",
                py: 1,
                whiteSpace: isExpanded ? "normal" : "nowrap",
                overflow: isExpanded ? "visible" : "hidden",
                textOverflow: isExpanded ? "clip" : "ellipsis",
              }}
            >
              {params.value}
            </Box>
          );
        },
      },
      {
        field: "Stakeholder or User",
        headerName: "Stakeholder or User",
        width: 180,
        filter: true,
        sortable: true,
        autoHeight: true,
        cellRenderer: (params: any) => {
          const rowId = (params.data?.id as number) ?? 0;
          const isExpanded = expandedRows.has(rowId);
          return (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                toggleRowExpansion(rowId);
              }}
              sx={{
                width: "100%",
                cursor: "pointer",
                py: 1,
                whiteSpace: isExpanded ? "normal" : "nowrap",
                overflow: isExpanded ? "visible" : "hidden",
                textOverflow: isExpanded ? "clip" : "ellipsis",
              }}
            >
              {params.value}
            </Box>
          );
        },
      },
      {
        field: "AI Use Case",
        headerName: "AI Use Case",
        width: 200,
        filter: true,
        sortable: true,
        autoHeight: true,
        cellRenderer: (params: any) => {
          const rowId = (params.data?.id as number) ?? 0;
          const isExpanded = expandedRows.has(rowId);
          return (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                toggleRowExpansion(rowId);
              }}
              sx={{
                width: "100%",
                cursor: "pointer",
                py: 1,
                whiteSpace: isExpanded ? "normal" : "nowrap",
                overflow: isExpanded ? "visible" : "hidden",
                textOverflow: isExpanded ? "clip" : "ellipsis",
              }}
            >
              {params.value}
            </Box>
          );
        },
      },
      {
        field: "AI Algorithms & Frameworks",
        headerName: "AI Algorithms & Frameworks",
        width: 550,
        filter: true,
        sortable: true,
        autoHeight: true,
        cellRenderer: (params: any) => {
          const rowId = (params.data?.id as number) ?? 0;
          const isExpanded = expandedRows.has(rowId);
          return (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                toggleRowExpansion(rowId);
              }}
              sx={{
                width: "100%",
                maxWidth: "100%",
                overflow: isExpanded ? "visible" : "hidden",
                position: "relative",
                display: "flex",
                alignItems: isExpanded ? "flex-start" : "center",
              }}
            >
              {renderChips(params.value, rowId, isExpanded)}
            </Box>
          );
        },
      },
      {
        field: "Datasets",
        headerName: "Datasets",
        width: 450,
        filter: true,
        sortable: true,
        autoHeight: true,
        cellRenderer: (params: any) => {
          const rowId = (params.data?.id as number) ?? 0;
          const isExpanded = expandedRows.has(rowId);
          return (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                toggleRowExpansion(rowId);
              }}
              sx={{
                width: "100%",
                maxWidth: "100%",
                overflow: isExpanded ? "visible" : "hidden",
                position: "relative",
                display: "flex",
                alignItems: isExpanded ? "flex-start" : "center",
              }}
            >
              {renderChips(params.value, rowId, isExpanded)}
            </Box>
          );
        },
      },
      {
        field: "Action / Implementation",
        headerName: "Action / Implementation",
        width: 400,
        filter: true,
        sortable: true,
        autoHeight: true,
        cellRenderer: (params: any) => {
          const rowId = (params.data?.id as number) ?? 0;
          const isExpanded = expandedRows.has(rowId);
          return (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                toggleRowExpansion(rowId);
              }}
              sx={{
                whiteSpace: isExpanded ? "normal" : "nowrap",
                overflow: isExpanded ? "visible" : "hidden",
                textOverflow: isExpanded ? "clip" : "ellipsis",
                lineHeight: 1.5,
                py: 1,
                cursor: "pointer",
                wordWrap: isExpanded ? "break-word" : "normal",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              {params.value}
            </Box>
          );
        },
      },
      {
        field: "AI Tools & Models",
        headerName: "AI Tools & Models",
        width: 450,
        filter: true,
        sortable: true,
        autoHeight: true,
        cellRenderer: (params: any) => {
          const rowId = (params.data?.id as number) ?? 0;
          const isExpanded = expandedRows.has(rowId);
          return (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                toggleRowExpansion(rowId);
              }}
              sx={{
                width: "100%",
                maxWidth: "100%",
                overflow: isExpanded ? "visible" : "hidden",
                position: "relative",
                display: "flex",
                alignItems: isExpanded ? "flex-start" : "center",
              }}
            >
              {renderChips(params.value, rowId, isExpanded)}
            </Box>
          );
        },
      },
      {
        field: "Digital Platforms and Tools",
        headerName: "Digital Platforms and Tools",
        width: 250,
        filter: true,
        sortable: true,
        autoHeight: true,
        cellRenderer: (params: any) => {
          const rowId = (params.data?.id as number) ?? 0;
          const isExpanded = expandedRows.has(rowId);
          return (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                toggleRowExpansion(rowId);
              }}
              sx={{
                width: "100%",
                maxWidth: "100%",
                overflow: isExpanded ? "visible" : "hidden",
                position: "relative",
                display: "flex",
                alignItems: isExpanded ? "flex-start" : "center",
              }}
            >
              {renderChips(params.value, rowId, isExpanded)}
            </Box>
          );
        },
      },
      {
        field: "Expected Outcomes and Results",
        headerName: "Expected Outcomes and Results",
        width: 300,
        filter: true,
        sortable: true,
        autoHeight: true,
        cellRenderer: (params: any) => {
          const rowId = (params.data?.id as number) ?? 0;
          const isExpanded = expandedRows.has(rowId);
          return (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                toggleRowExpansion(rowId);
              }}
              sx={{
                width: "100%",
                maxWidth: "100%",
                overflow: isExpanded ? "visible" : "hidden",
                position: "relative",
                display: "flex",
                alignItems: isExpanded ? "flex-start" : "center",
              }}
            >
              {renderChips(params.value, rowId, isExpanded)}
            </Box>
          );
        },
      },
    ];
  }, [expandedRows]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            backgroundColor: "#ffffff",
            padding: "20px 32px",
            borderBottom: `3px solid ${PURE_ORANGE}`,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            {/* Pure Storage Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Logo
                src="/assets/purelogo.png"
                alt="Pure Storage"
                width={120}
                height={32}
                fallbackText="PURESTORAGE"
              />
            </Box>

            {/* Title */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                flex: 1,
                justifyContent: "center",
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{ color: "#1a1a1a", fontWeight: 600, fontSize: "1.75rem" }}
              >
                AI Use Case Repository
              </Typography>
            </Box>

            {/* Logout Button */}
            <Box>
              <Button
                onClick={async () => {
                  try {
                    await fetch("/api/auth/logout", {
                      method: "POST",
                      credentials: "include",
                    });
                    router.push("/login");
                    router.refresh();
                  } catch (err) {
                    console.error("Logout error:", err);
                    router.push("/login");
                  }
                }}
                sx={{
                  color: PURE_ORANGE,
                  borderColor: PURE_ORANGE,
                  "&:hover": {
                    backgroundColor: "#fff5f2",
                    borderColor: PURE_ORANGE,
                  },
                }}
                variant="outlined"
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            padding: "24px 32px",
            maxWidth: "100%",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Paper
            sx={{
              flex: 1,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
              backgroundColor: "#ffffff",
            }}
          >
            {error && (
              <Alert
                severity="error"
                sx={{
                  m: 2,
                  backgroundColor: "#fff5f2",
                  borderLeft: `4px solid ${PURE_ORANGE}`,
                  color: "#1a1a1a",
                }}
              >
                {error}
              </Alert>
            )}

            {loading && data.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress sx={{ color: PURE_ORANGE }} />
              </Box>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
                  <div
                    className="ag-theme-alpine"
                    style={{ width: "100%", height: "70vh" }}
                  >
                    <AgGridReact<UseCaseData>
                      rowData={data}
                      columnDefs={columnDefs}
                      suppressPaginationPanel
                      suppressRowClickSelection
                      rowSelection="single"
                      onBodyScroll={onBodyScroll}
                      getRowId={getRowId}
                      onGridReady={(params: GridReadyEvent) => {
                        gridApiRef.current = params.api;
                      }}
                      rowHeight={52}
                    />
                  </div>
                  {isFetchingMore && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 32,
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        borderRadius: "24px",
                        padding: "8px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        zIndex: 1000,
                        border: `1px solid ${PURE_ORANGE}`,
                      }}
                    >
                      <CircularProgress size={16} sx={{ color: PURE_ORANGE }} />
                      <Typography
                        variant="body2"
                        sx={{ color: PURE_ORANGE, fontWeight: 600 }}
                      >
                        Loading more...
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            backgroundColor: "#ffffff",
            borderTop: `1px solid ${PURE_ORANGE}`,
            padding: "16px 16px",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#666666",
              fontSize: "0.75rem",
            }}
          >
            Powered by
          </Typography>
          <Logo
            src="/assets/spearhead.png"
            alt="Spearhead"
            width={60}
            height={60}
            fallbackText=""
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
