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
    const fixedScaleRangeCharts = this.props.args.config.fixed_scale_range_chart;
    const barRounded = this.props.args.config.bar_rounded !== false; // Default to true if not specified

    const headers = tableContainer.querySelectorAll('th');
    // Check if index is included BEFORE modifying headers[0]
    // pandas to_html() includes index as first header and first cell in rows
    // If row has same number of cells as headers, index is included in both
    const firstRow = tableContainer.querySelector('tbody tr');
    const rowCellCount = firstRow ? firstRow.children.length : 0;
    const headerCount = headers.length;
    const indexIncluded = rowCellCount === headerCount; // If equal, index is included in both
    
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
          container.style.height = '18px';
          
          // Create the bar element
          const bar = document.createElement('div');
          bar.style.position = 'absolute';
          bar.style.height = '18px';
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
            bar.style.backgroundColor = 'var(--neg-color)';
            bar.style.width = `${Math.abs(numericValue) * scaleFactorLeft}%`;
            
            // For negative values, position text on the right
            textContainer.style.left = 'auto';
            textContainer.style.right = '5px';
            textContainer.style.textAlign = 'right';
          } else {
            bar.style.left = '50%';
            bar.style.right = 'auto';
            bar.style.backgroundColor = 'var(--pos-color)';
            bar.style.width = `${numericValue * scaleFactorRight}%`;
            
            // For positive values, position text on the left
            textContainer.style.right = 'auto';
            textContainer.style.left = '5px';
            textContainer.style.textAlign = 'left';
          }
          bar.style.opacity = '60%';
          bar.style.borderRadius = barRounded ? '9px' : '0px';

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
                
                // Create horizontal connector line to the center for context
                const horizontalLine = document.createElement('div');
                horizontalLine.style.position = 'absolute';
                horizontalLine.style.top = '9px';
                horizontalLine.style.height = '2px';
                horizontalLine.style.backgroundColor = '#9CA3AF';
                horizontalLine.style.zIndex = '45';
                
                // Draw from marker to the middle (50%) depending on side
                const lineStart = Math.min(markerPosition, 50);
                const lineEnd = Math.max(markerPosition, 50);
                horizontalLine.style.left = `${lineStart}%`;
                horizontalLine.style.width = `${lineEnd - lineStart}%`;
                
                // Create the vertical marker
                const verticalMarker = document.createElement('div');
                verticalMarker.style.position = 'absolute';
                verticalMarker.style.width = '2px';
                verticalMarker.style.height = '12px';
                // Medium gray for visibility without overpowering
                verticalMarker.style.backgroundColor = '#9CA3AF';
                verticalMarker.style.top = '5px';
                verticalMarker.style.left = `${markerPosition}%`;
                verticalMarker.style.transform = 'translateX(-50%)';
                verticalMarker.style.zIndex = '50';
                
                // Add lines to container
                container.appendChild(horizontalLine);
                container.appendChild(verticalMarker);

                // Flip value text to opposite side of the center relative to marker
                if (markerPosition <= 50) {
                  textContainer.style.left = '52%';
                  textContainer.style.right = 'auto';
                  textContainer.style.textAlign = 'left';
                } else {
                  textContainer.style.right = '52%';
                  textContainer.style.left = 'auto';
                  textContainer.style.textAlign = 'right';
                }
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
            bar.style.backgroundColor = 'var(--pos-color)';
            bar.style.width = `${value*scaleFactor}%`;
            bar.style.opacity = '60%';
            bar.style.borderRadius = barRounded ? '9px' : '0px';
            
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

          // Create the range chart container / axis
          const rangeChart = document.createElement('div');
          rangeChart.style.position = 'relative';
          // rangeChart.style.height = '20px';
          rangeChart.style.width = '100%';
          rangeChart.style.display = 'flex';
          rangeChart.style.justifyContent = 'space-between';

          rangeChart.classList.add('range-line');
          // Override CSS border-radius based on bar_rounded setting
          rangeChart.style.borderRadius = barRounded ? '9px' : '0px';

          // Helper to add a continuous band (range) between two positions
          const addBand = (startPct: number, endPct: number, color: string, opacity: number, heightPx: number) => {
            const left = Math.min(startPct, endPct);
            const right = Math.max(startPct, endPct);
            const width = Math.max(right - left, 0.5); // ensure visible
            const band = document.createElement('div');
            band.style.position = 'absolute';
            band.style.left = `${left}%`;
            band.style.width = `${width}%`;
            band.style.height = `${heightPx}px`;
            band.style.top = '0px';
            band.style.backgroundColor = color;
            band.style.opacity = String(opacity);
            band.style.borderRadius = barRounded ? `${heightPx/2}px` : '0px';
            band.style.zIndex = '2';
            rangeChart.appendChild(band);
          };

          // Calculate positions (as percentages) for each dot
          const longTermLowPos = this.getLeftPosition(longTermLow, longTermLow, longTermHigh);
          const shortTermLowPos = this.getLeftPosition(shortTermLow, longTermLow, longTermHigh);
          const currentPos = this.getLeftPosition(current, longTermLow, longTermHigh);
          const shortTermHighPos = this.getLeftPosition(shortTermHigh, longTermLow, longTermHigh);
          const longTermHighPos = this.getLeftPosition(longTermHigh, longTermLow, longTermHigh);

          // Bands: grayscale palette (same hue, different emphasis)
          // long-term = slate (lighter), short-term = slate (darker)
          addBand(longTermLowPos, longTermHighPos, '#6B7280', 0.15, 18);
          addBand(shortTermLowPos, shortTermHighPos, '#6B7280', 0.35, 18);

          // Current marker: a small rounded pill centered on the axis
          const currentMarker = document.createElement('div');
          currentMarker.style.position = 'absolute';
          currentMarker.style.left = `${currentPos}%`;
          currentMarker.style.top = '3px';
          currentMarker.style.width = '10px';
          currentMarker.style.height = '12px';
          currentMarker.style.transform = 'translateX(-50%)';
          currentMarker.style.backgroundColor = current_color;
          currentMarker.style.borderRadius = barRounded ? '6px' : '0px';
          currentMarker.style.boxShadow = '0 0 0 2px #fff inset, 0 0 0 1px rgba(0,0,0,.12)';
          currentMarker.style.zIndex = '3';
          rangeChart.appendChild(currentMarker);

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
      if (Array.isArray(fixedScaleRangeCharts)) {
        fixedScaleRangeCharts.forEach((chartConfig: any) => {
          const { 
            col_idx, 
            min, 
            max, 
            dot1_idx, 
            dot2_idx, 
            dot3_idx,
            dot1_color = '#9CA3AF',
            dot2_color = '#9CA3AF',
            dot3_color = '#9CA3AF',
            line_color = '#D1D5DB',
            line_height = 2,
            tick_marks = true
          } = chartConfig;

          // Use the index inclusion detection from above
          // If index is included, row.children[0] is index, so we need to offset by 1
          const indexOffset = indexIncluded ? 1 : 0;
          
          const actualColIdx = col_idx + indexOffset;
          const chartCell = row.children[actualColIdx] as HTMLElement;
          if (!chartCell) return;

          // Verify this is the correct cell (should be empty)
          const cellContent = chartCell.textContent?.trim() || '';
          // Only render if cell is empty (allows for empty string placeholders)
          if (cellContent && cellContent !== '') {
            // Skip if cell has content (might be wrong column)
            return;
          }
          
          // Update dot indices to account for index column
          const dot1ActualIdx = dot1_idx + indexOffset;
          const dot2ActualIdx = dot2_idx + indexOffset;
          const dot3ActualIdx = dot3_idx + indexOffset;

          // Add CSS class for proper positioning
          chartCell.className = 'fixed-scale-range-chart-cell';

          // Create the chart container
          const chartContainer = document.createElement('div');
          chartContainer.style.position = 'relative';
          chartContainer.style.width = '100%';
          chartContainer.style.height = '30px';
          chartContainer.style.padding = '5px 0';

          // Calculate range for positioning
          const range = max - min;

          // Calculate tick marks (7 total: 3 left, midpoint, 3 right)
          const tickSpacing = range / 6;
          const ticks: number[] = [];
          for (let i = 0; i <= 6; i++) {
            ticks.push(min + i * tickSpacing);
          }

          // Create tick marks container (if enabled)
          if (tick_marks) {
            const tickContainer = document.createElement('div');
            tickContainer.style.position = 'absolute';
            tickContainer.style.bottom = '0px';
            tickContainer.style.width = '100%';
            tickContainer.style.height = '12px';
            tickContainer.style.display = 'flex';
            tickContainer.style.justifyContent = 'space-between';
            tickContainer.style.padding = '0 2px';

            ticks.forEach((tickValue) => {
              const tickWrapper = document.createElement('div');
              tickWrapper.style.position = 'relative';
              tickWrapper.style.display = 'flex';
              tickWrapper.style.flexDirection = 'column';
              tickWrapper.style.alignItems = 'center';

              // Tick mark line
              const tickLine = document.createElement('div');
              tickLine.style.width = '1px';
              tickLine.style.height = '4px';
              tickLine.style.backgroundColor = '#9CA3AF';
              tickLine.style.marginBottom = '2px';

              // Tick label
              const tickLabel = document.createElement('div');
              tickLabel.style.fontSize = '9px';
              tickLabel.style.color = '#6B7280';
              tickLabel.style.textAlign = 'center';
              tickLabel.textContent = tickValue.toFixed(1);

              tickWrapper.appendChild(tickLine);
              tickWrapper.appendChild(tickLabel);
              tickContainer.appendChild(tickWrapper);
            });

            chartContainer.appendChild(tickContainer);
          }

          // Create the horizontal line
          const line = document.createElement('div');
          line.style.position = 'absolute';
          line.style.top = '15px';
          line.style.left = '0';
          line.style.width = '100%';
          line.style.height = `${line_height}px`;
          line.style.backgroundColor = line_color;
          line.style.borderRadius = barRounded ? `${line_height / 2}px` : '0px';
          line.style.zIndex = '1';
          chartContainer.appendChild(line);

          // Create vertical midpoint line (grey, 1px)
          const midpointLine = document.createElement('div');
          midpointLine.style.position = 'absolute';
          midpointLine.style.left = '50%';
          midpointLine.style.top = '5px';
          midpointLine.style.width = '1px';
          midpointLine.style.height = '20px';
          midpointLine.style.backgroundColor = '#9CA3AF';
          midpointLine.style.transform = 'translateX(-50%)';
          midpointLine.style.zIndex = '2';
          chartContainer.appendChild(midpointLine);

          // Helper function to calculate position percentage (range already calculated above)
          const getPositionPercent = (value: number): number => {
            if (value < min) return 0;
            if (value > max) return 100;
            return ((value - min) / range) * 100;
          };

          // Get dot values from specified columns (using adjusted indices)
          const dot1Value = parseFloat(row.children[dot1ActualIdx]?.textContent || '0');
          const dot2Value = parseFloat(row.children[dot2ActualIdx]?.textContent || '0');
          const dot3Value = parseFloat(row.children[dot3ActualIdx]?.textContent || '0');

          // Create dots
          const dots = [
            { value: dot1Value, color: dot1_color },
            { value: dot2Value, color: dot2_color },
            { value: dot3Value, color: dot3_color }
          ];

          dots.forEach((dot) => {
            if (isNaN(dot.value)) return; // Skip if value is not a number

            const dotPosition = getPositionPercent(dot.value);
            const dotElement = document.createElement('div');
            dotElement.style.position = 'absolute';
            dotElement.style.left = `${dotPosition}%`;
            dotElement.style.top = '9px';
            dotElement.style.width = '10px';
            dotElement.style.height = '12px';
            dotElement.style.transform = 'translateX(-50%)';
            dotElement.style.backgroundColor = dot.color;
            dotElement.style.opacity = '0.5'; // 50% transparency for overlapping visibility
            dotElement.style.borderRadius = barRounded ? '6px' : '0px';
            // No border/shadow for cleaner look
            dotElement.style.zIndex = '3';
            chartContainer.appendChild(dotElement);
          });

          // Clear cell and append chart
          chartCell.textContent = '';
          chartCell.appendChild(chartContainer);
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