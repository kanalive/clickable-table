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
  // Helper function to calculate the position of dots in percentage
  private getLeftPosition = (value: number, min: number, max: number): number => {
    // console.log([value, min, max])
    return ((value - min) / (max - min)) * 98;
  }
  
  
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
    const rangeChartColumns = this.props.args.config.range_chart;


    const headers = tableContainer.querySelectorAll('th');
    if(headers){
      headers[0].textContent = idxColName
    }
  
    
    const theadIndexCol = tableContainer.querySelectorAll('thead tr th');
  
    // Get all rows within the tbody of the table
    const rows = tableContainer.querySelectorAll('tbody tr');
    // console.log(rows)

    rows.forEach(row => {
      // Apply styles to the cells of the identified percentage columns
      if (Array.isArray(dataBarChartColumns)) {
        dataBarChartColumns.forEach((columnConfig: { col_idx: any; min: any; max: any }) => {
          const { col_idx, min, max } = columnConfig;

          const scaleFactorLeft = 50 / Math.abs(min);
          const scaleFactorRight = 50 / max;

          const cell = row.children[col_idx] as HTMLElement;

          if (!cell) return;
    
          // Assume cell content is a numeric value
          const value = parseFloat(cell.textContent || '0') 
          const cellContent = cell.textContent || '';

          let numericValue;

          if (cellContent.includes('%')) {
              // Remove the '%' symbol and parse as float
              numericValue = parseFloat(cellContent.replace('%', '')) ;
          } else {
              // Parse directly as a float if it's a numeric value
              numericValue = parseFloat(cellContent);
          }
    
          // Create the bar element
          const bar = document.createElement('div');
          bar.style.position = 'relative';
          bar.style.height = '20px';
          bar.style.top = '0';
          bar.style.float = 'left';
          
          // Determine the bar's color and position based on the value
          


          if (numericValue < 0) {
            bar.style.left = `${50 - Math.abs(numericValue) * scaleFactorLeft}%`;
            bar.style.backgroundColor = '#FF0000'; // Red for negative values
            bar.style.width = `${Math.abs(numericValue) * scaleFactorLeft}%`;
            bar.style.borderRight = "1px solid black";
        } else {
            bar.style.left = '50%';
            bar.style.backgroundColor = '#0000FF'; // Blue for positive values
            bar.style.width = `${numericValue * scaleFactorRight}%`;
            bar.style.borderLeft = "1px solid black";
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
          textContainer.textContent = cellContent.trim(); 
    
          // Append the text container
          cell.appendChild(textContainer);
        });
      }
      if (Array.isArray(davidHumColumns)) {
        davidHumColumns.forEach((columnConfig: { col_idx: any; min: any; max: any; exception_col_color:any }) => {
          const { col_idx, min, max, exception_col_color } = columnConfig;

          const scaleFactor = 65 / max;

          const cell = row.children[col_idx] as HTMLElement;


          if (!cell) return;
    
          var cellContent = cell.textContent || '';
          const value = parseFloat(cell.textContent || '0') 
          
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
      }
      if (Array.isArray(rangeChartColumns)) {
        rangeChartColumns.forEach((rangeConfig: any) => {
          const { col_idx, long_term_high_idx, long_term_low_idx, short_term_high_idx, short_term_low_idx, current_idx, long_term_color, short_term_color, current_color } = rangeConfig;

          // Extract the data for this row from the specified column indices
          const longTermHigh = parseFloat(row.children[long_term_high_idx].textContent || '0');
          const longTermLow = parseFloat(row.children[long_term_low_idx].textContent || '0');
          const shortTermHigh = parseFloat(row.children[short_term_high_idx].textContent || '0');
          const shortTermLow = parseFloat(row.children[short_term_low_idx].textContent || '0');
          const current = parseFloat(row.children[current_idx].textContent || '0');
          console.log([longTermHigh, longTermLow, shortTermHigh, shortTermLow, current])


          const rangeCell = row.children[col_idx] as HTMLElement;

          if (!rangeCell) return;

          // Create the 5-dot range chart
          const rangeChart = document.createElement('div');
          rangeChart.style.position = 'relative';
          // rangeChart.style.height = '20px';
          rangeChart.style.width = '100%';
          rangeChart.style.display = 'flex';
          rangeChart.style.justifyContent = 'space-between';

          rangeChart.classList.add('range-line'); // Add the line class for 1px line

          // Helper function to create dots
          const createDot = (position: number, color: string): HTMLElement => {
            const dot = document.createElement('div');
            dot.style.position = 'absolute';
            dot.style.left = `${position}%`;
            dot.style.marginTop = '-5px';
            dot.style.width = '10px';
            dot.style.height = '10px';
            dot.style.backgroundColor = color;
            dot.style.borderRadius = '50%';
            dot.style.opacity = '70%'
            return dot;
          };

          // Calculate positions (as percentages) for each dot
          const longTermLowPos = this.getLeftPosition(longTermLow, longTermLow, longTermHigh);
          const shortTermLowPos = this.getLeftPosition(shortTermLow, longTermLow, longTermHigh);
          const currentPos = this.getLeftPosition(current, longTermLow, longTermHigh);
          const shortTermHighPos = this.getLeftPosition(shortTermHigh, longTermLow, longTermHigh);
          const longTermHighPos = this.getLeftPosition(longTermHigh, longTermLow, longTermHigh);

          // Append dots to the chart
          rangeChart.appendChild(createDot(longTermLowPos, long_term_color)); // Long Term Low (orange)
          rangeChart.appendChild(createDot(shortTermLowPos, short_term_color)); // Short Term Low (light orange)
          rangeChart.appendChild(createDot(shortTermHighPos, short_term_color)); // Short Term High (light orange)
          rangeChart.appendChild(createDot(longTermHighPos, long_term_color)); // Long Term High (orange)
          rangeChart.appendChild(createDot(currentPos, current_color)); // Current (green)

          // Clear the existing cell content and append the range chart
          rangeCell.textContent = '';
          rangeCell.appendChild(rangeChart);
        });
      }

    });
  };

  public render = (): ReactNode => {

    const html = this.props.args["html"];
    const config = this.props.args["config"];
    var max_height = this.props.args["max_height"];


    const { theme } = this.props
    const style: React.CSSProperties = {}


    if (theme && theme.primaryColor) {
      // document.documentElement.style.setProperty('--border-color', theme.secondaryBackgroundColor);

      document.documentElement.style.setProperty('--header-bg-color', theme.secondaryBackgroundColor);
      document.documentElement.style.setProperty('--max-height', max_height);
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

export default withStreamlitConnection(ClickableTable)
