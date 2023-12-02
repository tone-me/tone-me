import React from "react";
import "./table.css"
import { useReactTable, flexRender } from "@tanstack/react-table";
import { columnDef } from "./columns";



const Table = ({ tonestring, predictionOutput, inputText }) => {
  let dataJSON = inputText.split(' ').map((word, index) => {
        return {
          word: word,
          pronunciation: predictionOutput[index] || {} // Use empty object if out of bounds
        };
      });

  dataJSON = JSON.stringify(dataJSON, null, 2);


  const tableInstance = useReactTable({
    columns: columnDef
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
      </table>
    
    </>
  )
};

export default Table;
