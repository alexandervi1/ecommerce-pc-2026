"use client";

import { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function TableRow({ children, className = "", onClick, hoverable = true }: TableRowProps) {
  return (
    <tr
      className={cn(
        "border-b border-gray-100",
        hoverable && "hover:bg-gray-50 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function TableCell({ children, className = "", ...props }: TableCellProps) {
  return (
    <td className={cn("px-6 py-4 text-sm", className)} {...props}>
      {children}
    </td>
  );
}

interface TableHeadCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function TableHeadCell({ children, className = "", ...props }: TableHeadCellProps) {
  return (
    <th
      className={cn(
        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return (
    <thead className={cn("bg-gray-50", className)}>
      <tr>{children}</tr>
    </thead>
  );
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return <tbody className={cn("divide-y divide-gray-100", className)}>{children}</tbody>;
}

interface TableContainerProps {
  children: ReactNode;
  className?: string;
}

export function TableContainer({ children, className = "" }: TableContainerProps) {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm overflow-hidden", className)}>
      {children}
    </div>
  );
}

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className = "" }: ResponsiveTableProps) {
  return (
    <div className={cn("overflow-x-auto -mx-6 px-6", className)}>
      <table className="min-w-full">{children}</table>
    </div>
  );
}

interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = "No hay datos",
  className = "",
}: DataTableProps<T>) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <TableContainer className={className}>
      <ResponsiveTable>
        <TableHeader>
          <tr>
            {columns.map((col) => (
              <TableHeadCell key={String(col.key)} className={col.align ? alignClasses[col.align] : ""}>
                {col.header}
              </TableHeadCell>
            ))}
          </tr>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <TableRow key={keyExtractor(row)} onClick={onRowClick ? () => onRowClick(row) : undefined}>
                {columns.map((col) => (
                  <TableCell key={String(col.key)} className={col.align ? alignClasses[col.align] : ""}>
                    {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </ResponsiveTable>
    </TableContainer>
  );
}

interface SimpleTableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

export function SimpleTable({ headers, children, className = "" }: SimpleTableProps) {
  return (
    <TableContainer className={className}>
      <ResponsiveTable>
        <TableHeader>
          <tr>
            {headers.map((header, i) => (
              <TableHeadCell key={i}>{header}</TableHeadCell>
            ))}
          </tr>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </ResponsiveTable>
    </TableContainer>
  );
}