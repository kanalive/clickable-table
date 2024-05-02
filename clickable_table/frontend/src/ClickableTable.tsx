import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { ReactNode } from "react"
import "./app.css"
import internal from "stream"
interface State {
  key: string
  cellValue: string
  header: string
  rowIndex: number
}

function adjustColor(hex: string, percent:number) {
  // Trim the leading hash if present
  hex = hex.replace(/^\s*#|\s*$/g, '');

  // Convert to decimal and change luminosity
  let r = parseInt(hex.substr(0, 2), 16),
      g = parseInt(hex.substr(2, 2), 16),
      b = parseInt(hex.substr(4, 2), 16);

  r = Math.round(r * (100 + percent) / 100);
  g = Math.round(g * (100 + percent) / 100);
  b = Math.round(b * (100 + percent) / 100);

  r = (r < 255) ? r : 255;  
  g = (g < 255) ? g : 255;
  b = (b < 255) ? b : 255;

  let rr = ((r.toString(16).length === 1) ? "0" + r.toString(16) : r.toString(16));
  let gg = ((g.toString(16).length === 1) ? "0" + g.toString(16) : g.toString(16));
  let bb = ((b.toString(16).length === 1) ? "0" + b.toString(16) : b.toString(16));

  return "#" + rr + gg + bb;
}

function calculateColumnWidth(numberOfCols: number){
  return 100/numberOfCols;
}
/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
class ClickableTable extends StreamlitComponentBase<State> {
  public state = { key: "", cellValue: "", header: "", rowIndex: -2 }
  
  private handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {

    const target = event.target as HTMLElement;

    if (target.tagName === "TD" || target.tagName === "TH") {
      const cell = target as HTMLTableCellElement;
      const cellValue = cell.innerText;
      const headerElement = cell.closest("table")?.querySelector(`th:nth-child(${cell.cellIndex + 1})`);

      if (headerElement instanceof HTMLElement) {
        const header = headerElement.innerText;
        const rowElement = cell.parentElement;

        if (rowElement && rowElement.tagName === "TR") {
          const tableRow = rowElement as HTMLTableRowElement;
          const rowIndex = tableRow.rowIndex - 1;  // Adjusting for header row
          const key = this.props.args["key"];
          // Use setState to update the state and then use its callback to communicate with Streamlit
          this.setState({ key, cellValue, header, rowIndex }, () => {
            Streamlit.setComponentValue({key, cellValue, header, rowIndex });
            console.log(key)
          });
        }
      }
    }


  }

  private applyColumnWidth = (config:string): void => {
    if (!this.props.args.config.column_width) return;
    if (this.props.args.config.column_width.length <= 0 ) return;
    const tableContainer = document.querySelector('.clickabletable-container');
    if (!tableContainer ) return;
      const headers = tableContainer.querySelectorAll('th');
      if(headers){
        for (let i = 0; i < headers.length; i++) {
          headers[i].style.width = this.props.args.config.column_width[i]
        } 
      }
  }

  private applyStylesToPercentageCells = (config:string): void => {

    // First, get the headers
    const tableContainer = document.querySelector('.clickabletable-container');
    if (!tableContainer ||!this.props.args.config ) return;
  
    const dataBarChartColumns = this.props.args.config.data_bar_chart_columns;
    const davidHumColumns = this.props.args.config.david_hum_columns;
    const idxColName = this.props.args.config.idx_col_name;

    const headers = tableContainer.querySelectorAll('th');
    if(headers){
      headers[0].textContent = idxColName
    }
  
    
    const theadIndexCol = tableContainer.querySelectorAll('thead tr th');
    console.log(theadIndexCol)
  
    // Get all rows within the tbody of the table
    const rows = tableContainer.querySelectorAll('tbody tr');
    // console.log(rows)

    rows.forEach(row => {
      // console.log(row)
      // Apply styles to the cells of the identified percentage columns
      dataBarChartColumns.forEach((columnConfig: { col_idx: any; min: any; max: any }) => {
        const { col_idx, min, max } = columnConfig;
        // console.log(columnConfig)
        // console.log(col_idx)
        // console.log(min)

        const scaleFactorLeft = 50 / Math.abs(min);
        const scaleFactorRight = 50 / max;

        const cell = row.children[col_idx] as HTMLElement;
        console.log(row.children)

        if (!cell) return;
  
        // Assume cell content is a numeric value
        const value = parseFloat(cell.textContent || '0') 
  
        // Create the bar element
        const bar = document.createElement('div');
        bar.style.position = 'relative';
        bar.style.height = '20px';
        bar.style.top = '0';
        bar.style.float = 'left';
        
        // Determine the bar's color and position based on the value
        
        console.log(cell.style)


        if (value < 0) {
          bar.style.left = `${50 - Math.abs(value) * scaleFactorLeft }%`;
          bar.style.backgroundColor = '#FF0000'; // Red for negative values
          bar.style.width = `${Math.abs(value) * scaleFactorLeft }%`;
          bar.style.borderRight = "1px solid black"
        } else {
          bar.style.left = '50%';
          bar.style.backgroundColor = '#0000FF'; // Blue for positive values
          bar.style.width = `${value*scaleFactorRight}%`;
          bar.style.borderLeft = "1px solid black"

        }
        bar.style.opacity = '50%';
  
        // Clear the cell's content and append the bar
        cell.textContent = '';
        cell.appendChild(bar);
  
        // Add the numeric value as text
        const textContainer = document.createElement('div');
        textContainer.style.position = 'relative';
        textContainer.style.padding = '0 5px';
        textContainer.style.float = 'right';
        textContainer.style.zIndex = '100';
        textContainer.textContent = `${(value )}%`;
  
        // Append the text container
        cell.appendChild(textContainer);
      });

      davidHumColumns.forEach((columnConfig: { col_idx: any; min: any; max: any; exception_col_color:any }) => {
        const { col_idx, min, max, exception_col_color } = columnConfig;

        const scaleFactor = 65 / max;

        const cell = row.children[col_idx] as HTMLElement;
        console.log(cell.textContent)


        if (!cell) return;
  
        var cellContent = cell.textContent || '';
        const value = parseFloat(cell.textContent || '0') 
        console.log(value)
        
        const bar = document.createElement('div');


        if ((Number.isNaN(value)) && cellContent.trim() !== '') {
          // It's a non-numeric string, apply yellow background
          cell.style.backgroundColor = exception_col_color;
        } else {
          // Create the bar element
          bar.style.height = '20px';
          bar.style.float = 'left';
          bar.style.backgroundColor = '#0000FF'; 
          bar.style.width = `${value*scaleFactor}%`;
          bar.style.opacity = '50%';
          
        }
        
        
  
        // Clear the cell's content and append the bar
        cell.textContent = '';
  
        // Add the numeric value as text
        const textContainer = document.createElement('div');
        textContainer.style.zIndex = '100';
        
        if ((Number.isNaN(value)) && cellContent.trim() !== '') {
          textContainer.textContent = cellContent
          textContainer.style.width = '100%%';
          textContainer.style.textAlign = 'center';

        }
        else{
          textContainer.textContent = `${value}%`;
          textContainer.style.width = '35%';
          textContainer.style.textAlign = 'right';
          textContainer.style.float = 'right';


        }

        cell.appendChild(bar);
        cell.appendChild(textContainer);

        // Append the text container
      });


    });
  };
  
  

  // public componentDidMount() {
  //   // Since componentDidMount only runs once, use it to apply styles after initial render
  //   this.applyStylesToPercentageCells();
  // }
  
  // public componentDidUpdate() {
  //   // Use componentDidUpdate to reapply styles when the component updates
  //   this.applyStylesToPercentageCells();
  // }
  
  public render = (): ReactNode => {

    const html = this.props.args["html"];
    const config = this.props.args["config"];

    const { theme } = this.props
    const style: React.CSSProperties = {}

    console.log(theme)

    if (theme && theme.primaryColor) {
      // document.documentElement.style.setProperty('--border-color', theme.secondaryBackgroundColor);

      document.documentElement.style.setProperty('--header-bg-color', theme.secondaryBackgroundColor);
      document.documentElement.style.setProperty('--hover-color', theme.primaryColor);
      document.documentElement.style.setProperty('--border-color', adjustColor(theme.secondaryBackgroundColor, -5)); // Darker by 5%
      const borderStyling = `1px solid`
      style.border = borderStyling
      style.outline = borderStyling
    }

    // After render, apply the styles to the percentage cells
    setTimeout(() => {
      this.applyStylesToPercentageCells(config);
      this.applyColumnWidth(config);
    }, 0);

    return (
      <div className="clickabletable-container">
        <div 
          dangerouslySetInnerHTML={{ __html: html }} 
          onClick={this.handleClick}
          style={{ cursor: 'pointer' }}   // Change cursor on hover
          ></div>
      </div>
    )
  }

  
}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(ClickableTable)
