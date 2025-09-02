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

  private applyColumnWidth = (config: any): void => {
    if (!this.props.args.config.column_width) return;
    if (this.props.args.config.column_width.length <= 0 ) return;
    const tableContainer = document.querySelector('.clickabletable-container');
    if (!tableContainer ) return;
      const headers = tableContainer.querySelectorAll('th');
      if(headers){
        for (let i = 0; i < headers.length; i++) {
          headers[i].style.width = this.props.args.config.column_width[i];
        } 
      }
  }

  private applyHiddenColumnClasses = (config: any): void => {
    // If no hidden columns or class name defined, exit early
    if (!this.props.args.config.hidden_columns || !this.props.args.config.hidden_column_class) return;
    if (this.props.args.config.hidden_columns.length <= 0) return;
    
    const tableContainer = document.querySelector('.clickabletable-container');
    if (!tableContainer) return;
    
    const table = tableContainer.querySelector('table');
    if (!table) return;
    
    // Get all rows in the table
    const allRows = table.querySelectorAll('tr');
    
    allRows.forEach(row => {
      // For each hidden column index, add the class to the cell
      this.props.args.config.hidden_columns.forEach((colIdx: number) => {
        // Add 1 to colIdx because CSS nth-child is 1-based
        const cssColIdx = colIdx + 1;
        
        // Find the cell in this row at the specified index
        const cell = row.querySelector(`th:nth-child(${cssColIdx}), td:nth-child(${cssColIdx})`);
        
        if (cell) {
          cell.classList.add(this.props.args.config.hidden_column_class);
        }
      });
    });
  }

  private applyStylesToPercentageCells = (config: any): void => {
    // First, get the headers
    const tableContainer = document.querySelector('.clickabletable-container');
    if (!tableContainer ||!this.props.args.config ) return;
  
    const dataBarChartColumns = this.props.args.config.data_bar_chart_columns;
    const davidHumColumns = this.props.args.config.david_hum_columns;
    const idxColName = this.props.args.config.idx_col_name;
    const rangeChartColumns = this.props.args.config.range_chart;

    const headers = tableContainer.querySelectorAll('th');
    if(headers){
      headers[0].textContent = idxColName;
    }
    
    const theadIndexCol = tableContainer.querySelectorAll('thead tr th');
  
    // Get all rows within the tbody of the table
    const rows = tableContainer.querySelectorAll('tbody tr');
    // console.log(rows)

    rows.forEach(row => {
      // Apply styles to the cells of the identified percentage columns
      if (Array.isArray(dataBarChartColumns)) {
        dataBarChartColumns.forEach((columnConfig: { 
          col_idx: any; 
          min: any; 
          max: any;
          recommended_idx?: any;
          line_color?: string; // New parameter for line color
        }) => {
          const { col_idx, min, max, recommended_idx, line_color } = columnConfig;

          // Default line color if not specified
          const markerColor = line_color || '#0c7500';

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

          // Get column header name for tooltip
          const headerElement = headers[col_idx];
          const columnName = headerElement ? headerElement.textContent || `Column ${col_idx}` : `Column ${col_idx}`;

          // Clear the cell's content before adding elements
          cell.textContent = '';
          
          // Create a container for better positioning control
          const container = document.createElement('div');
          container.style.position = 'relative';
          container.style.width = '100%';
          container.style.height = '20px';
          
          // Create the bar element
          const bar = document.createElement('div');
          bar.style.position = 'absolute';
          bar.style.height = '20px';
          bar.style.top = '0';
          
          // Determine if the bar goes left or right
          const isNegative = numericValue < 0;
          
          // Add the numeric value as text
          const textContainer = document.createElement('div');
          textContainer.style.position = 'absolute';
          textContainer.style.zIndex = '100';
          textContainer.style.padding = '0 5px';
          textContainer.textContent = cellContent.trim();
          
          // Determine the bar's color, position, and text position based on the value
          if (isNegative) {
            bar.style.right = '50%';
            bar.style.left = 'auto';
            bar.style.backgroundColor = '#FF0000'; // Red for negative values
            bar.style.width = `${Math.abs(numericValue) * scaleFactorLeft}%`;
            bar.style.borderRight = "1px solid black";
            
            // For negative values, position text on the right
            textContainer.style.left = 'auto';
            textContainer.style.right = '5px';
            textContainer.style.textAlign = 'right';
          } else {
            bar.style.left = '50%';
            bar.style.right = 'auto';
            bar.style.backgroundColor = '#0000FF'; // Blue for positive values
            bar.style.width = `${numericValue * scaleFactorRight}%`;
            bar.style.borderLeft = "1px solid black";
            
            // For positive values, position text on the left
            textContainer.style.right = 'auto';
            textContainer.style.left = '5px';
            textContainer.style.textAlign = 'left';
          }
          bar.style.opacity = '50%';

          // Append elements to container
          container.appendChild(bar);
          container.appendChild(textContainer);
          
          // Add the container to the cell
          cell.appendChild(container);

          // Add hover functionality and tooltip
          let recommendedValue: number | null = null;
          let recommendedColumnName: string = "";

          // Add the recommended value marker if specified
          if (recommended_idx !== undefined) {
            // Get the recommended value from the specified column
            const recommendedCell = row.children[recommended_idx] as HTMLElement;
            if (recommendedCell) {
              recommendedValue = parseFloat(recommendedCell.textContent || '0');
              
              // Get the recommended column name for tooltip
              const recommendedHeaderElement = headers[recommended_idx];
              recommendedColumnName = recommendedHeaderElement ? 
                recommendedHeaderElement.textContent || `Column ${recommended_idx}` : 
                `Column ${recommended_idx}`;
              
              if (!isNaN(recommendedValue)) {
                // Calculate position based on value
                let markerPosition;
                const barStartPosition = isNegative ? 50 - Math.abs(numericValue) * scaleFactorLeft : 50;
                
                if (recommendedValue < 0) {
                  markerPosition = 50 - Math.abs(recommendedValue) * scaleFactorLeft;
                } else {
                  markerPosition = 50 + (recommendedValue * scaleFactorRight);
                }
                
                // Create horizontal connector line
                const horizontalLine = document.createElement('div');
                horizontalLine.style.position = 'absolute';
                horizontalLine.style.top = '10px'; // Middle of the cell
                horizontalLine.style.height = '1px';
                horizontalLine.style.backgroundColor = markerColor; // Use the custom color
                horizontalLine.style.zIndex = '45';
                
                // Set line position and width based on the direction
                if (isNegative) {
                  // For negative values, connect from the marker to the middle (50%)
                  const lineStart = Math.min(markerPosition, 50);
                  const lineEnd = Math.max(markerPosition, 50);
                  horizontalLine.style.left = `${lineStart}%`;
                  horizontalLine.style.width = `${lineEnd - lineStart}%`;
                } else {
                  // For positive values, connect from the middle (50%) to the marker
                  const lineStart = Math.min(markerPosition, 50);
                  const lineEnd = Math.max(markerPosition, 50);
                  horizontalLine.style.left = `${lineStart}%`;
                  horizontalLine.style.width = `${lineEnd - lineStart}%`;
                }
                
                // Create the vertical marker
                const verticalMarker = document.createElement('div');
                verticalMarker.style.position = 'absolute';
                verticalMarker.style.width = '1px';
                verticalMarker.style.height = '10px';
                verticalMarker.style.backgroundColor = markerColor; // Use the custom color
                verticalMarker.style.top = '6px';
                verticalMarker.style.left = `${markerPosition}%`;
                verticalMarker.style.transform = 'translateX(-50%)';
                verticalMarker.style.zIndex = '50';
                
                // Add lines to container
                container.appendChild(horizontalLine);
                container.appendChild(verticalMarker);
              }
            }
          }

          // Create tooltip for the entire cell
          if (recommended_idx !== undefined && recommendedValue !== null) {
            // Create custom tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'data-bar-tooltip';
            tooltip.style.display = 'none';
            tooltip.style.position = 'absolute';
            tooltip.style.backgroundColor = 'rgba(218, 218, 218, 0.76)';
            tooltip.style.color = 'black';
            tooltip.style.padding = '5px 10px';
            tooltip.style.marginTop = '-20px';
            tooltip.style.marginLeft = '120px';
            tooltip.style.borderRadius = '5px';
            tooltip.style.zIndex = '1000';
            tooltip.style.whiteSpace = 'nowrap';
            tooltip.style.pointerEvents = 'none';
            tooltip.innerHTML = `${columnName}: ${numericValue}<br>${recommendedColumnName}: ${recommendedValue}`;
            
            document.body.appendChild(tooltip);
            
            // Show tooltip on mouseover
            cell.addEventListener('mouseover', (e) => {
              const rect = cell.getBoundingClientRect();
              tooltip.style.left = `${rect.left + window.scrollX + rect.width/2}px`;
              tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 5}px`;
              tooltip.style.transform = 'translateX(-50%)';
              tooltip.style.display = 'block';
            });
            
            // Hide tooltip on mouseout
            cell.addEventListener('mouseout', () => {
              tooltip.style.display = 'none';
            });
            
            // Clean up on cell removal
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.removedNodes) {
                  mutation.removedNodes.forEach((node) => {
                    if (node === cell || cell.contains(node as Node)) {
                      document.body.removeChild(tooltip);
                      observer.disconnect();
                    }
                  });
                }
              });
            });
            
            observer.observe(cell.parentElement || document.body, { 
              childList: true, 
              subtree: true 
            });
          }
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
          const { col_idx, long_term_high_idx, long_term_low_idx, short_term_high_idx, short_term_low_idx, current_idx, long_term_color, short_term_color, current_color, low_text, high_text } = rangeConfig;

          // Extract the data for this row from the specified column indices
          const longTermHigh = parseFloat(row.children[long_term_high_idx].textContent || '0');
          const longTermLow = parseFloat(row.children[long_term_low_idx].textContent || '0');
          const shortTermHigh = parseFloat(row.children[short_term_high_idx].textContent || '0');
          const shortTermLow = parseFloat(row.children[short_term_low_idx].textContent || '0');
          const current = parseFloat(row.children[current_idx].textContent || '0');
          // console.log([longTermHigh, longTermLow, shortTermHigh, shortTermLow, current])


          const rangeCell = row.children[col_idx] as HTMLElement;

          if (!rangeCell) return;
          
          // Add CSS class for proper positioning
          rangeCell.className = 'range-chart-cell';

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

          // Check if current is lower than both short term low and long term low
          if (low_text && current < shortTermLow && current < longTermLow) {
            // Create text container for the low value message
            const textContainer = document.createElement('div');
            textContainer.className = 'range-chart-text';
            textContainer.textContent = low_text;
            
            // Clear the existing cell content and append ONLY the text (no range chart)
            rangeCell.textContent = '';
            rangeCell.appendChild(textContainer);
          } else if (high_text && current > shortTermHigh && current > longTermHigh) {
            // Create text container for the high value message
            const textContainer = document.createElement('div');
            textContainer.className = 'range-chart-text';
            textContainer.textContent = high_text;

            // Clear and append only text
            rangeCell.textContent = '';
            rangeCell.appendChild(textContainer);
          } else {
            // Clear the existing cell content and append only the range chart
            rangeCell.textContent = '';
            rangeCell.appendChild(rangeChart);
          }
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
      this.applyHiddenColumnClasses(config); // Apply hidden column classes
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