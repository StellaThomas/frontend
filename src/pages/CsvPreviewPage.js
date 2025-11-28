// src/pages/CsvPreviewPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useNavigate, useLocation } from "react-router-dom";

export default function CsvPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const incomingRows = state.rows || [];

  // UI state
  const [query, setQuery] = useState("");
  const [filteredRows, setFilteredRows] = useState(incomingRows);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sortBy, setSortBy] = useState(null); // column id
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc'

  useEffect(() => {
    setFilteredRows(incomingRows);
    setPage(0);
  }, [incomingRows]);

  const columns = useMemo(
    () => [
      { id: "AgentCode", label: "AgentCode", align: "left" },
      { id: "ItemCode", label: "ItemCode", align: "left" },
      { id: "Quantity", label: "Quantity", align: "right" },
      { id: "OrderDate", label: "OrderDate", align: "center" },
      { id: "OrderTime", label: "OrderTime", align: "center" },
    ],
    []
  );

  // filter rows by query (search across AgentCode, ItemCode)
  useEffect(() => {
    if (!query) {
      setFilteredRows(incomingRows);
      setPage(0);
      return;
    }
    const q = query.trim().toLowerCase();
    const out = incomingRows.filter((r) => {
      return (
        String(r.AgentCode ?? "").toLowerCase().includes(q) ||
        String(r.ItemCode ?? "").toLowerCase().includes(q) ||
        String(r.OrderDate ?? "").toLowerCase().includes(q)
      );
    });
    setFilteredRows(out);
    setPage(0);
  }, [query, incomingRows]);

  // sorting
  const handleSort = (colId) => {
    if (sortBy === colId) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(colId);
      setSortDir("asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortBy) return filteredRows;
    const rowsCopy = [...filteredRows];
    rowsCopy.sort((a, b) => {
      const va = a[sortBy] ?? "";
      const vb = b[sortBy] ?? "";
      // numeric compare when both numeric
      const na = Number(va);
      const nb = Number(vb);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) {
        return sortDir === "asc" ? na - nb : nb - na;
      }
      // fallback string compare
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      if (sa < sb) return sortDir === "asc" ? -1 : 1;
      if (sa > sb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rowsCopy;
  }, [filteredRows, sortBy, sortDir]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const buildCsv = (rowsData) => {
    const header = columns.map((c) => c.label).join(",");
    const lines = [header];
    for (const r of rowsData) {
      const vals = columns.map((c) => {
        const v = r[c.id] ?? "";
        const s = String(v);
        return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      });
      lines.push(vals.join(","));
    }
    return lines.join("\r\n");
  };

  const handleDownload = () => {
    const visibleRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const csvString = buildCsv(visibleRows.length > 0 ? visibleRows : sortedRows);
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `preview-orders-${state.fromDate || "all"}-to-${state.toDate || "all"}-${ts}.csv`;
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // show message when no rows
  if (!incomingRows || incomingRows.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 6 }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <IconButton onClick={() => navigate(-1)} color="primary">
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                CSV Preview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No data available for preview. Generate CSV from the previous screen.
              </Typography>
            </Box>
          </Stack>

          <Box mt={2}>
            <Button variant="contained" onClick={() => navigate(-1)}>
              Go back
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 6 }}>
        {/* Header row */}
        <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="space-between" spacing={2} mb={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={() => navigate(-1)} color="primary" sx={{ bgcolor: "action.hover" }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                CSV Preview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {state.fromDate || "All dates"} — {state.toDate || "All dates"}
              </Typography>
            </Box>
            <Chip label={`${incomingRows.length.toLocaleString()} rows`} size="small" sx={{ ml: 2 }} />
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Search agent, item or date..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: 320 } }}
            />

            <Tooltip title="Download visible rows or full filtered set">
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownload}>
                Download
              </Button>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Table */}
        <TableContainer sx={{ maxHeight: "65vh", borderRadius: 2 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align}
                    sx={{
                      background: (theme) => theme.palette.background.default,
                      fontWeight: 700,
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => handleSort(col.id)}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>{col.label}</span>
                      {sortBy === col.id ? (
                        sortDir === "asc" ? (
                          <ArrowUpwardIcon fontSize="inherit" sx={{ fontSize: 16 }} />
                        ) : (
                          <ArrowDownwardIcon fontSize="inherit" sx={{ fontSize: 16 }} />
                        )
                      ) : (
                        <SortIcon sx={{ fontSize: 16, opacity: 0.35 }} />
                      )}
                    </Stack>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => {
                const globalIndex = page * rowsPerPage + idx;
                return (
                  <TableRow
                    key={globalIndex}
                    hover
                    sx={{
                      bgcolor: (theme) => (globalIndex % 2 === 0 ? "transparent" : theme.palette.action.hover),
                      transition: "background-color 150ms",
                    }}
                  >
                    <TableCell>{row.AgentCode}</TableCell>
                    <TableCell>{row.ItemCode}</TableCell>
                    <TableCell align="right">
                      <Typography component="span" sx={{ fontWeight: 700 }}>
                        {row.Quantity}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{row.OrderDate}</TableCell>
                    <TableCell align="center">{row.OrderTime}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="body2" color="text.secondary">
            Showing <strong>{Math.min(sortedRows.length, page * rowsPerPage + 1)}</strong> to{" "}
            <strong>{Math.min(sortedRows.length, (page + 1) * rowsPerPage)}</strong> of <strong>{sortedRows.length}</strong> entries
          </Typography>

          <TablePagination
            component="div"
            count={sortedRows.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            sx={{ ".MuiTablePagination-toolbar": { px: 0 } }}
          />
        </Box>
      </Paper>
    </Container>
  );
}
