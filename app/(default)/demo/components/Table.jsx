import React from "react";
import "./table.css"
import "app/globals.css";
import { useReactTable, flexRender, getCoreRowModel } from "@tanstack/react-table";
import { columnDef } from "./columns";


const utterance = new SpeechSynthesisUtterance();

const Table = ({ tonestring, predictionOutput, inputText }) => {
  let data = inputText.map((word, index) => {
    return {
      word: word,
      pronunciation: predictionOutput[index]
    };
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const finalColumnDef = React.useMemo( () => columnDef, [])
  

  const tableInstance = useReactTable({
    columns: finalColumnDef,
    data: data,
    getCoreRowModel: getCoreRowModel()
  })

  
  //console.log(data);
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
                  //console.log(cellEl.id)
                  // console.log(cellEl.getValue())
                  return (
                    <td key={cellEl.id}>
                      {typeof cellEl.getValue() !== "string"  ? (
                      <> 
                        <p>Expected Tone: {cellEl.getValue()["expected"]}</p> 
                        {cellEl.getValue()["correctness"] ? 
                        (<p style={{ color: '#00D100' }}>Actual Tone:  {cellEl.getValue()["prediction"]} </p>) : 
                        (<p style={{ color: '#ff0000' }}>Actual Tone: {cellEl.getValue()["prediction"]}</p>) }
                      </>) :
                      (
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
