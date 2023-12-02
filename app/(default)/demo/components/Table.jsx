import React from "react";
import "./table.css"
import { useReactTable, flexRender, getCoreRowModel } from "@tanstack/react-table";
import { columnDef } from "./columns";



const Table = ({ tonestring, predictionOutput, inputText }) => {
  let data = inputText.split(' ').map((word, index) => {
        return {
          word: word,
          pronunciation: predictionOutput[index] || {} // Use empty object if out of bounds
        };
      });
      
  const finalData = React.useMemo( () => data, [])
  const finalColumnDef = React.useMemo( () => columnDef, [])
    
  const tableInstance = useReactTable({
    columns: finalColumnDef,
    data: finalData,
    getCoreRowModel: getCoreRowModel()
  })
  return (
    <>
      <table>
        <thead>
          {tableInstance.getHeaderGroups().map((headerEl) => {
            return (
              <tr key={headerEl.id}>
                {headerEl.headers.map((columnEl) => {
                  return (
                    <th key={columnEl.id} colSpan={columnEl.colSpan}>
                      {columnEl.isPlaceholder
                        ? null
                        : flexRender(
                            columnEl.column.columnDef.header,
                            columnEl.getContext()
                          )}
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody>
          {tableInstance.getRowModel().rows.map((rowEl) => {
            return (
              <tr key={rowEl.id}>
                {rowEl.getVisibleCells().map((cellEl) => {
                  return (
                    <td key={cellEl.id}>
                      {flexRender(
                        cellEl.column.columnDef.cell,
                        cellEl.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          </tbody>
      </table>
    
    </>
  )
};

export default Table;
