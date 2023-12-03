import React from "react";
import "./table.css"
import { useReactTable, flexRender, getCoreRowModel } from "@tanstack/react-table";
import { columnDef } from "./columns";



const Table = ({ tonestring, predictionOutput, inputText }) => {
  let data = inputText.split(" ").map((word, index) => {
        return {
          word: word,
          pronunciation: <> 
            <p>Expected Tone: {predictionOutput[index]["expected"]}</p> 
            {predictionOutput[index]["correctness"] ? 
            (<p className="text-green-500"> {predictionOutput[index]["prediction"]} </p>) : 
            (<p className="text-red-400"> {predictionOutput[index]["prediction"]}</p>) }
          </>
          
          // Use empty object if out of bounds
        };
      });

  console.log(data)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const finalData = React.useMemo( () => data, []);
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
                  // console.log(cellEl.column)
                  return (
                    <td key={cellEl.id}>
                      {(
                        // Render other columns as usual
                        flexRender(
                          cellEl.column.columnDef.cell,
                          cellEl.getContext()
                        )
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
