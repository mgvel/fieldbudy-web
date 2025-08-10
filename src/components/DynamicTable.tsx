import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  X,
} from "lucide-react";
import { Box, Paper, TableContainer, Chip } from "@mui/material";

interface ColumnConfig {
  header: string;
  accessor: string;
  filterable?: boolean;
  render?: (val: any) => React.ReactNode;
  width?: string;
  type?: "string" | "number" | "date" | "boolean";
}

interface DataTableProps {
  columns: ColumnConfig[];
  data: Record<string, any>[];
  itemsPerPage?: number;
  defaultItemsPerPage?: number;
  onRowClick?: (row: any) => void;
  enableQuickFilter?: boolean;
  enableHeaderFilters?: boolean;
}

const DynamicTable: React.FC<DataTableProps> = ({
  columns,
  data,
  itemsPerPage,
  onRowClick,
  enableQuickFilter = true,
  enableHeaderFilters = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const value=itemsPerPage?itemsPerPage:100;
  const [itemsPerPages, setItemsPerPages] = useState(value);
  const [headerFilters, setHeaderFilters] = useState<Record<string, string>>({});

  const filteredData = useMemo(() => {
    let result = data;

    if (enableQuickFilter && quickFilters.length) {
      result = result.filter((row) =>
        quickFilters.some((filter) =>
          columns.some(
            (col) =>
              col.filterable &&
              String(row[col.accessor]).toLowerCase().includes(filter.toLowerCase())
          )
        )
      );
    } else if (searchQuery) {
      // Global search
      result = result.filter((row) =>
        columns.some(
          (col) =>
            col.filterable &&
            String(row[col.accessor]).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    Object.entries(headerFilters).forEach(([accessor, value]) => {
      if (value) {
        result = result.filter((row) =>
          String(row[accessor]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    return result;
  }, [searchQuery, data, columns, headerFilters, quickFilters, enableQuickFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPages));
  const paginatedData = filteredData.slice(
    (page - 1) * itemsPerPages,
    page * itemsPerPages
  );

  const visiblePages = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);

    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("…");
    }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  return (

      <Box
      component={Paper}
      elevation={3}
      className="p-2 sm:p-4 rounded-lg w-full max-w-full overflow-x-auto scrollbar-thin"
    >

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {filteredData.length} {filteredData.length === 1 ? "Project" : "Projects"}
        </h2>


        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (enableQuickFilter && val.includes(",")) {
                const filters = val
                  .split(",")
                  .map((f) => f.trim())
                  .filter(Boolean);
                setQuickFilters(filters);
              } else {
                setQuickFilters([]);
              }
              setPage(1);
            }}
            placeholder={
              enableQuickFilter
                ? "Search or filter with comma (e.g., admin, active)"
                : "Search Projects..."
            }
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>


      {enableQuickFilter && quickFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {quickFilters.map((filter, i) => (
            <Chip
              key={i}
              label={filter}
              onDelete={() => {
                const copy = [...quickFilters];
                copy.splice(i, 1);
                setQuickFilters(copy);
                setSearchQuery(copy.join(", "));
              }}
              size="small"
              className="bg-blue-100 text-primary"
            />
          ))}
        </div>
      )}


      <TableContainer className="overflow-x-auto">
        <table className="w-full min-w-max text-sm divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className={`px-3 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider ${col.width || ""}`}
                >
                  <div className="flex flex-col">
                    <span>{col.header}</span>
                    {enableHeaderFilters && (
                      <div className="relative mt-1">
                        <div className="flex items-center">
                          <input
                            value={headerFilters[col.accessor] || ""}
                            onChange={(e) =>
                              setHeaderFilters((prev) => ({
                                ...prev,
                                [col.accessor]: e.target.value,
                              }))
                            }
                            placeholder={`Filter ${col.header}`}
                            className="w-full pl-8 pr-6 py-1 border rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                          {headerFilters[col.accessor] && (
                            <button
                              onClick={() =>
                                setHeaderFilters(({ [col.accessor]: _, ...rest }) => rest)
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, idx) => (
              <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className="group hover:bg-secondary rounded-lg cursor-pointer transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.accessor}
                  className="px-3 py-3 whitespace-nowrap text-sm text-slate-900 group-hover:text-white"
                >
                  {col.render ? col.render(row[col.accessor]) : row[col.accessor]}
                </td>
              ))}
            </tr>
            ))}

            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">
                  No matching records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableContainer>

      {/* pagination */}
     {itemsPerPage&& <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-gray-600 gap-3">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPages(+e.target.value);
              setPage(1);
            }}
            className="border px-2 py-1 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {[20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 flex-wrap justify-center">
          <button
            disabled={page === 1}
            onClick={() => setPage(1)}
            className="p-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            aria-label="First page"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {visiblePages.map((p) =>
            typeof p === "number" ? (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded border ${
                  p === page ? "bg-secondary text-white" : "hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={`ellipsis-${p}`} className="px-2 py-1">
                {p}
              </span>
            )
          )}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
            className="p-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            aria-label="Last page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>

        <div>
          Showing {(page - 1) * itemsPerPage + 1}–
          {Math.min(page * itemsPerPage, filteredData.length)} of {filteredData.length} entries
        </div>
      </div>
}
    </Box>

  );
};

export default DynamicTable;
