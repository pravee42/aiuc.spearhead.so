"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridToolbar,
  useGridApiContext,
} from "@mui/x-data-grid";
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

// Custom header component with filter button
function CustomColumnHeader({
  field,
  headerName,
}: {
  field: string;
  headerName: string;
}) {
  const apiRef = useGridApiContext();

  const handleFilterClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Open the filter panel for this column
    const api = apiRef.current;
    if (api) {
      try {
        // Try to use showFilterPanel method (available in MUI DataGrid v6+)
        if (typeof (api as any).showFilterPanel === "function") {
          (api as any).showFilterPanel(field);
        } else {
          // Fallback: Find the column header menu button and click it, then click filter option
          const columnHeaderElement = document.querySelector(
            `[data-field="${field}"].MuiDataGrid-columnHeader`
          );
          if (columnHeaderElement) {
            // Find the menu button (three dots icon)
            const menuButton = columnHeaderElement.querySelector(
              ".MuiDataGrid-menuIconButton"
            ) as HTMLElement;
            if (menuButton) {
              menuButton.click();
              // Wait for menu to open, then click the filter option
              setTimeout(() => {
                const menuItems = Array.from(
                  document.querySelectorAll('[role="menuitem"]')
                );
                const filterItem = menuItems.find((item) =>
                  item.textContent?.toLowerCase().includes("filter")
                ) as HTMLElement;
                if (filterItem) {
                  filterItem.click();
                }
              }, 100);
            }
          }
        }
      } catch (error) {
        console.error("Error opening filter panel:", error);
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        gap: 1,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: "#1a1a1a",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {headerName}
      </Typography>
      <IconButton
        size="small"
        onClick={handleFilterClick}
        sx={{
          padding: "4px",
          color: PURE_ORANGE,
          "&:hover": {
            backgroundColor: "#fff5f2",
          },
        }}
        aria-label={`Filter ${headerName}`}
      >
        <FilterListIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

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
          "& .MuiTablePagination-root": {
            color: "#1a1a1a",
          },
          "& .MuiTablePagination-selectLabel": {
            color: "#1a1a1a",
          },
          "& .MuiTablePagination-displayedRows": {
            color: "#1a1a1a",
          },
          "& .MuiSelect-select": {
            color: "#1a1a1a",
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
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          color: "#1a1a1a",
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
  page_size: number;
  data: Omit<UseCaseData, "id">[];
}

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState<UseCaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const fetchData = async (page: number, pageSize: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/use-cases?page=${page + 1}&page_size=${pageSize}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies in request
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login on 401
          router.push("/login");
          return;
        }
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      // Add id field for DataGrid
      const dataWithIds = result.data.map((item, index) => ({
        ...item,
        id: page * pageSize + index + 1,
      }));

      setData(dataWithIds);
      setTotalRows(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(paginationModel.page, paginationModel.pageSize);
  }, [paginationModel.page, paginationModel.pageSize]);

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
  };

  // Helper function to render chips - clipped when collapsed, wrapped when expanded
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

  const columns: GridColDef[] = useMemo(() => {
    const chipFields = [
      "AI Algorithms & Frameworks",
      "Datasets",
      "AI Tools & Models",
      "Digital Platforms and Tools",
      "Expected Outcomes and Results",
    ];

    return [
      {
        field: "Capability",
        headerName: "Capability",
        width: 120,
        type: "number",
        filterable: true,
        renderHeader: () => (
          <CustomColumnHeader field="Capability" headerName="Capability" />
        ),
        renderCell: (params) => {
          const rowId = params.row.id as number;
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
              }}
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
        filterable: true,
        renderHeader: () => (
          <CustomColumnHeader
            field="Business Function"
            headerName="Business Function"
          />
        ),
        renderCell: (params) => {
          const rowId = params.row.id as number;
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
        filterable: true,
        renderHeader: () => (
          <CustomColumnHeader
            field="Business Capability"
            headerName="Business Capability"
          />
        ),
        renderCell: (params) => {
          const rowId = params.row.id as number;
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
        filterable: true,
        renderHeader: () => (
          <CustomColumnHeader
            field="Stakeholder or User"
            headerName="Stakeholder or User"
          />
        ),
        renderCell: (params) => {
          const rowId = params.row.id as number;
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
        filterable: true,
        renderHeader: () => (
          <CustomColumnHeader field="AI Use Case" headerName="AI Use Case" />
        ),
        renderCell: (params) => {
          const rowId = params.row.id as number;
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
        filterable: true,
        renderHeader: () => (
          <CustomColumnHeader
            field="AI Algorithms & Frameworks"
            headerName="AI Algorithms & Frameworks"
          />
        ),
        renderCell: (params) => {
          const rowId = params.row.id as number;
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
        filterable: true,
        renderHeader: () => (
          <CustomColumnHeader field="Datasets" headerName="Datasets" />
        ),
        renderCell: (params) => {
          const rowId = params.row.id as number;
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
        filterable: true,
        renderHeader: () => (
          <CustomColumnHeader
            field="Action / Implementation"
            headerName="Action / Implementation"
          />
        ),
        renderCell: (params) => {
          const rowId = params.row.id as number;
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
        filterable: true,
        renderHeader: () => (
          <CustomColumnHeader
            field="AI Tools & Models"
            headerName="AI Tools & Models"
          />
        ),
        renderCell: (params) => {
          const rowId = params.row.id as number;
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
        filterable: true,
        renderHeader: () => (
          <CustomColumnHeader
            field="Digital Platforms and Tools"
            headerName="Digital Platforms and Tools"
          />
        ),
        renderCell: (params) => {
          const rowId = params.row.id as number;
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
        filterable: true,
        renderHeader: () => (
          <CustomColumnHeader
            field="Expected Outcomes and Results"
            headerName="Expected Outcomes and Results"
          />
        ),
        renderCell: (params) => {
          const rowId = params.row.id as number;
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Logo
                src="/assets/purelogo.png"
                alt="Pure Storage"
                width={120}
                height={32}
                fallbackText="PURESTORAGE"
              />
            </Box>

            {/* Title and Results */}
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
                sx={{
                  color: "#1a1a1a",
                  fontWeight: 600,
                  fontSize: "1.75rem",
                }}
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
            overflow: "hidden",
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
              overflow: "hidden",
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
              <DataGrid
                rows={data}
                columns={columns}
                paginationMode="server"
                rowCount={totalRows}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 20, 50, 100]}
                loading={loading}
                disableRowSelectionOnClick
                filterMode="client"
                getRowHeight={(params) => {
                  // Use a larger fixed height for expanded rows to accommodate wrapped content
                  // Expanded rows need more space for wrapped chips and text
                  return expandedRows.has(params.id as number) ? 300 : 52;
                }}
                slots={{
                  toolbar: GridToolbar,
                }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
                sx={{
                  border: "none",
                  "& .MuiDataGrid-cell": {
                    overflow: "hidden !important",
                  },
                  "& .MuiDataGrid-row.expanded": {
                    "& .MuiDataGrid-cell": {
                      overflow: "visible !important",
                      whiteSpace: "normal !important",
                    },
                  },
                  "& .MuiDataGrid-cell:focus": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-cell:focus-within": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-columnHeader:focus": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-columnHeader:focus-within": {
                    outline: "none",
                  },
                }}
                getRowClassName={(params) => {
                  return expandedRows.has(params.id as number)
                    ? "expanded"
                    : "";
                }}
              />
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
