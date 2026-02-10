import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { ReactNode } from "react"
import "./app.css"

interface State {
  key: string
  cellValue: string
  header: string
  rowIndex: number
}

interface DataBarParams {
  col_idx: number
  min: number
  max: number
  recommended_idx?: number
  line_color?: string
}

interface DavidHumParams {
  col_idx: number
  min: number
  max: number
  exception_col_color: string
}

interface RangeChartParams {
  col_idx: number
  long_term_high_idx: number
  long_term_low_idx: number
  short_term_high_idx: number
  short_term_low_idx: number
  current_idx: number
  long_term_color: string
  short_term_color: string
  current_color: string
  low_text?: string
  high_text?: string
}

interface FixedScaleChartParams {
  col_idx: number
  min: number
  max: number
  dot1_idx: number
  dot2_idx: number
  dot3_idx: number
  dot1_color?: string
  dot2_color?: string
  dot3_color?: string
  line_color?: string
  line_height?: number
  tick_marks?: boolean
}

interface TooltipData {
  columnName: string
  value: number
  recommendedColumnName: string
  recommendedValue: number
}

function adjustColor(hex: string, percent: number) {
  hex = hex.replace(/^\s*#|\s*$/g, '');

  let r = parseInt(hex.substring(0, 2), 16),
      g = parseInt(hex.substring(2, 4), 16),
      b = parseInt(hex.substring(4, 6), 16);

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

class ClickableTable extends StreamlitComponentBase<State> {
  public state = { key: "", cellValue: "", header: "", rowIndex: -2 }

  // ========================================
  // Utility Methods
  // ========================================

  private setElementStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    Object.keys(styles).forEach(key => {
      (element.style as any)[key] = (styles as any)[key];
    });
  }

  /**
   * Returns the <th> elements from the last row of <thead>.
   * For single-level headers, this is the only header row.
   * For multi-level (MultiIndex) headers, this is the bottom-level row
   * which has a 1:1 mapping to data columns.
   */
  private getBottomHeaderRow(tableContainer: Element): {
    headers: NodeListOf<Element>;
    theadRows: NodeListOf<Element> | null;
  } {
    const thead = tableContainer.querySelector('thead');
    const theadRows = thead ? thead.querySelectorAll('tr') : null;
    if (theadRows && theadRows.length > 0) {
      const lastRow = theadRows[theadRows.length - 1];
      return { headers: lastRow.querySelectorAll('th'), theadRows };
    }
    // Fallback for tables without <thead>
    return { headers: tableContainer.querySelectorAll('th'), theadRows: null };
  }

  private getLeftPosition(value: number, min: number, max: number): number {
    return ((value - min) / (max - min)) * 98;
  }

  private getPositionPercent(value: number, min: number, max: number): number {
    if (value < min) return 0;
    if (value > max) return 100;
    return ((value - min) / (max - min)) * 100;
  }

  private parseNumericValue(cellContent: string): number {
    if (cellContent.includes('%')) {
      return parseFloat(cellContent.replace('%', ''));
    }
    return parseFloat(cellContent);
  }

  // ========================================
  // Data Bar Chart Methods
  // ========================================

  private createDataBarContainer(): HTMLElement {
    const container = document.createElement('div');
    this.setElementStyles(container, {
      position: 'relative',
      width: '100%',
      height: '18px'
    });
    return container;
  }

  private createBar(width: number, isNegative: boolean, barRounded: boolean): HTMLElement {
    const bar = document.createElement('div');

    const styles: Partial<CSSStyleDeclaration> = {
      position: 'absolute',
      height: '18px',
      top: '0',
      width: `${width}%`,
      opacity: '60%',
      borderRadius: barRounded ? '9px' : '0px'
    };

    if (isNegative) {
      styles.right = '50%';
      styles.left = 'auto';
      styles.backgroundColor = 'var(--neg-color)';
    } else {
      styles.left = '50%';
      styles.right = 'auto';
      styles.backgroundColor = 'var(--pos-color)';
    }

    this.setElementStyles(bar, styles);
    return bar;
  }

  private createBarText(cellContent: string, isNegative: boolean): HTMLElement {
    const textContainer = document.createElement('div');

    const styles: Partial<CSSStyleDeclaration> = {
      position: 'absolute',
      zIndex: '100',
      padding: '0 5px'
    };

    if (isNegative) {
      styles.left = 'auto';
      styles.right = '5px';
      styles.textAlign = 'right';
    } else {
      styles.right = 'auto';
      styles.left = '5px';
      styles.textAlign = 'left';
    }

    this.setElementStyles(textContainer, styles);
    textContainer.textContent = cellContent.trim();
    return textContainer;
  }

  private createRecommendationMarker(
    recommendedValue: number,
    scaleFactorLeft: number,
    scaleFactorRight: number,
    textContainer: HTMLElement
  ): { horizontalLine: HTMLElement; verticalMarker: HTMLElement } | null {
    if (isNaN(recommendedValue)) return null;

    let markerPosition: number;

    if (recommendedValue < 0) {
      markerPosition = 50 - Math.abs(recommendedValue) * scaleFactorLeft;
    } else {
      markerPosition = 50 + (recommendedValue * scaleFactorRight);
    }

    const horizontalLine = document.createElement('div');
    const lineStart = Math.min(markerPosition, 50);
    const lineEnd = Math.max(markerPosition, 50);

    this.setElementStyles(horizontalLine, {
      position: 'absolute',
      top: '9px',
      height: '2px',
      backgroundColor: '#9CA3AF',
      zIndex: '45',
      left: `${lineStart}%`,
      width: `${lineEnd - lineStart}%`
    });

    const verticalMarker = document.createElement('div');
    this.setElementStyles(verticalMarker, {
      position: 'absolute',
      width: '2px',
      height: '12px',
      backgroundColor: '#9CA3AF',
      top: '5px',
      left: `${markerPosition}%`,
      transform: 'translateX(-50%)',
      zIndex: '50'
    });

    // Flip text position based on marker location
    if (markerPosition <= 50) {
      this.setElementStyles(textContainer, {
        left: '52%',
        right: 'auto',
        textAlign: 'left'
      });
    } else {
      this.setElementStyles(textContainer, {
        right: '52%',
        left: 'auto',
        textAlign: 'right'
      });
    }

    return { horizontalLine, verticalMarker };
  }

  private attachTooltip(cell: HTMLElement, data: TooltipData): void {
    const tooltip = document.createElement('div');
    tooltip.className = 'data-bar-tooltip';

    this.setElementStyles(tooltip, {
      display: 'none',
      position: 'absolute',
      backgroundColor: 'rgba(218, 218, 218, 0.76)',
      color: 'black',
      padding: '5px 10px',
      marginTop: '-20px',
      marginLeft: '120px',
      borderRadius: '5px',
      zIndex: '1000',
      whiteSpace: 'nowrap',
      pointerEvents: 'none'
    });

    tooltip.innerHTML = `${data.columnName}: ${data.value}<br>${data.recommendedColumnName}: ${data.recommendedValue}`;
    document.body.appendChild(tooltip);

    cell.addEventListener('mouseover', () => {
      const rect = cell.getBoundingClientRect();
      tooltip.style.left = `${rect.left + window.scrollX + rect.width/2}px`;
      tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 5}px`;
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.style.display = 'block';
    });

    cell.addEventListener('mouseout', () => {
      tooltip.style.display = 'none';
    });

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

  private createDataBarChart(
    cell: HTMLElement,
    params: DataBarParams,
    cellContent: string,
    headers: NodeListOf<Element>,
    row: Element,
    barRounded: boolean
  ): void {
    const { min, max, recommended_idx } = params;

    const scaleFactorLeft = 50 / Math.abs(min);
    const scaleFactorRight = 50 / max;
    const numericValue = this.parseNumericValue(cellContent);
    const isNegative = numericValue < 0;

    const width = isNegative
      ? Math.abs(numericValue) * scaleFactorLeft
      : numericValue * scaleFactorRight;

    cell.textContent = '';

    const container = this.createDataBarContainer();
    const bar = this.createBar(width, isNegative, barRounded);
    const textContainer = this.createBarText(cellContent, isNegative);

    container.appendChild(bar);
    container.appendChild(textContainer);

    // Add recommendation marker if specified
    if (recommended_idx !== undefined) {
      const recommendedCell = row.children[recommended_idx] as HTMLElement;
      if (recommendedCell) {
        const recommendedValue = parseFloat(recommendedCell.textContent || '0');
        const marker = this.createRecommendationMarker(
          recommendedValue,
          scaleFactorLeft,
          scaleFactorRight,
          textContainer
        );

        if (marker) {
          container.appendChild(marker.horizontalLine);
          container.appendChild(marker.verticalMarker);

          // Attach tooltip
          const columnName = headers[params.col_idx]?.textContent || `Column ${params.col_idx}`;
          const recommendedHeaderElement = headers[recommended_idx];
          const recommendedColumnName = recommendedHeaderElement?.textContent || `Column ${recommended_idx}`;

          this.attachTooltip(cell, {
            columnName,
            value: numericValue,
            recommendedColumnName,
            recommendedValue
          });
        }
      }
    }

    cell.appendChild(container);
  }

  // ========================================
  // David Hum Chart Methods
  // ========================================

  private createDavidHumChart(
    cell: HTMLElement,
    params: DavidHumParams,
    cellContent: string,
    barRounded: boolean
  ): void {
    const { max, exception_col_color } = params;
    const scaleFactor = 65 / max;
    const value = parseFloat(cellContent || '0');

    cell.textContent = '';

    if (Number.isNaN(value) && cellContent.trim() !== '') {
      // Non-numeric value - apply exception color
      cell.style.backgroundColor = exception_col_color;

      const textContainer = document.createElement('div');
      this.setElementStyles(textContainer, {
        zIndex: '100',
        width: '100%',
        textAlign: 'center'
      });
      textContainer.textContent = cellContent;
      cell.appendChild(textContainer);
    } else {
      // Numeric value - create bar
      const bar = document.createElement('div');
      this.setElementStyles(bar, {
        height: '20px',
        float: 'left',
        backgroundColor: 'var(--pos-color)',
        width: `${value * scaleFactor}%`,
        opacity: '60%',
        borderRadius: barRounded ? '9px' : '0px'
      });

      const textContainer = document.createElement('div');
      this.setElementStyles(textContainer, {
        zIndex: '100',
        width: '35%',
        textAlign: 'right',
        float: 'right'
      });
      textContainer.textContent = `${value}%`;

      cell.appendChild(bar);
      cell.appendChild(textContainer);
    }
  }

  // ========================================
  // Range Chart Methods
  // ========================================

  private createRangeBand(
    startPct: number,
    endPct: number,
    color: string,
    opacity: number,
    heightPx: number,
    barRounded: boolean
  ): HTMLElement {
    const left = Math.min(startPct, endPct);
    const right = Math.max(startPct, endPct);
    const width = Math.max(right - left, 0.5);

    const band = document.createElement('div');
    this.setElementStyles(band, {
      position: 'absolute',
      left: `${left}%`,
      width: `${width}%`,
      height: `${heightPx}px`,
      top: '0px',
      backgroundColor: color,
      opacity: String(opacity),
      borderRadius: barRounded ? `${heightPx/2}px` : '0px',
      zIndex: '2'
    });

    return band;
  }

  private createCurrentMarker(
    currentPos: number,
    currentColor: string,
    barRounded: boolean
  ): HTMLElement {
    const marker = document.createElement('div');
    this.setElementStyles(marker, {
      position: 'absolute',
      left: `${currentPos}%`,
      top: '3px',
      width: '10px',
      height: '12px',
      transform: 'translateX(-50%)',
      backgroundColor: currentColor,
      borderRadius: barRounded ? '6px' : '0px',
      boxShadow: '0 0 0 2px #fff inset, 0 0 0 1px rgba(0,0,0,.12)',
      zIndex: '3'
    });
    return marker;
  }

  private createRangeChartText(text: string): HTMLElement {
    const textContainer = document.createElement('div');
    textContainer.className = 'range-chart-text';
    textContainer.textContent = text;
    return textContainer;
  }

  private createRangeChart(
    cell: HTMLElement,
    params: RangeChartParams,
    row: Element,
    barRounded: boolean
  ): void {
    const {
      long_term_high_idx,
      long_term_low_idx,
      short_term_high_idx,
      short_term_low_idx,
      current_idx,
      current_color,
      low_text,
      high_text
    } = params;

    const longTermHigh = parseFloat(row.children[long_term_high_idx].textContent || '0');
    const longTermLow = parseFloat(row.children[long_term_low_idx].textContent || '0');
    const shortTermHigh = parseFloat(row.children[short_term_high_idx].textContent || '0');
    const shortTermLow = parseFloat(row.children[short_term_low_idx].textContent || '0');
    const current = parseFloat(row.children[current_idx].textContent || '0');

    cell.className = 'range-chart-cell';
    cell.textContent = '';

    // Check for out-of-range conditions
    if (low_text && current < shortTermLow && current < longTermLow) {
      cell.appendChild(this.createRangeChartText(low_text));
      return;
    }

    if (high_text && current > shortTermHigh && current > longTermHigh) {
      cell.appendChild(this.createRangeChartText(high_text));
      return;
    }

    // Create range chart
    const rangeChart = document.createElement('div');
    this.setElementStyles(rangeChart, {
      position: 'relative',
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      borderRadius: barRounded ? '9px' : '0px'
    });
    rangeChart.classList.add('range-line');

    // Calculate positions
    const longTermLowPos = this.getLeftPosition(longTermLow, longTermLow, longTermHigh);
    const shortTermLowPos = this.getLeftPosition(shortTermLow, longTermLow, longTermHigh);
    const currentPos = this.getLeftPosition(current, longTermLow, longTermHigh);
    const shortTermHighPos = this.getLeftPosition(shortTermHigh, longTermLow, longTermHigh);
    const longTermHighPos = this.getLeftPosition(longTermHigh, longTermLow, longTermHigh);

    // Add bands
    rangeChart.appendChild(this.createRangeBand(longTermLowPos, longTermHighPos, '#6B7280', 0.15, 18, barRounded));
    rangeChart.appendChild(this.createRangeBand(shortTermLowPos, shortTermHighPos, '#6B7280', 0.35, 18, barRounded));

    // Add current marker
    rangeChart.appendChild(this.createCurrentMarker(currentPos, current_color, barRounded));

    cell.appendChild(rangeChart);
  }

  // ========================================
  // Fixed Scale Range Chart Methods
  // ========================================

  private createTickMarks(
    ticks: number[]
  ): HTMLElement {
    const tickContainer = document.createElement('div');
    this.setElementStyles(tickContainer, {
      position: 'absolute',
      bottom: '0px',
      width: '100%',
      height: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 2px'
    });

    ticks.forEach((tickValue) => {
      const tickWrapper = document.createElement('div');
      this.setElementStyles(tickWrapper, {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      });

      const tickLine = document.createElement('div');
      this.setElementStyles(tickLine, {
        width: '1px',
        height: '4px',
        backgroundColor: '#9CA3AF',
        marginBottom: '2px'
      });

      const tickLabel = document.createElement('div');
      this.setElementStyles(tickLabel, {
        fontSize: '9px',
        color: '#6B7280',
        textAlign: 'center'
      });
      tickLabel.textContent = tickValue.toFixed(1);

      tickWrapper.appendChild(tickLine);
      tickWrapper.appendChild(tickLabel);
      tickContainer.appendChild(tickWrapper);
    });

    return tickContainer;
  }

  private createHorizontalLine(
    lineHeight: number,
    lineColor: string,
    barRounded: boolean
  ): HTMLElement {
    const line = document.createElement('div');
    this.setElementStyles(line, {
      position: 'absolute',
      top: '15px',
      left: '0',
      width: '100%',
      height: `${lineHeight}px`,
      backgroundColor: lineColor,
      borderRadius: barRounded ? `${lineHeight / 2}px` : '0px',
      zIndex: '1'
    });
    return line;
  }

  private createMidpointLine(): HTMLElement {
    const midpointLine = document.createElement('div');
    this.setElementStyles(midpointLine, {
      position: 'absolute',
      left: '50%',
      top: '5px',
      width: '1px',
      height: '20px',
      backgroundColor: '#9CA3AF',
      transform: 'translateX(-50%)',
      zIndex: '2'
    });
    return midpointLine;
  }

  private createDot(
    position: number,
    color: string,
    barRounded: boolean
  ): HTMLElement {
    const dot = document.createElement('div');
    this.setElementStyles(dot, {
      position: 'absolute',
      left: `${position}%`,
      top: '9px',
      width: '10px',
      height: '12px',
      transform: 'translateX(-50%)',
      backgroundColor: color,
      opacity: '0.5',
      borderRadius: barRounded ? '6px' : '0px',
      zIndex: '3'
    });
    return dot;
  }

  private createFixedScaleChart(
    cell: HTMLElement,
    params: FixedScaleChartParams,
    row: Element,
    indexOffset: number,
    barRounded: boolean
  ): void {
    const {
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
    } = params;

    const cellContent = cell.textContent?.trim() || '';
    if (cellContent && cellContent !== '') return;

    cell.className = 'fixed-scale-range-chart-cell';
    cell.textContent = '';

    const chartContainer = document.createElement('div');
    this.setElementStyles(chartContainer, {
      position: 'relative',
      width: '100%',
      height: '30px',
      padding: '5px 0'
    });

    const range = max - min;

    // Create tick marks
    if (tick_marks) {
      const tickSpacing = range / 6;
      const ticks: number[] = [];
      for (let i = 0; i <= 6; i++) {
        ticks.push(min + i * tickSpacing);
      }
      chartContainer.appendChild(this.createTickMarks(ticks));
    }

    // Create horizontal line
    chartContainer.appendChild(this.createHorizontalLine(line_height, line_color, barRounded));

    // Create midpoint line
    chartContainer.appendChild(this.createMidpointLine());

    // Create dots
    const dot1ActualIdx = dot1_idx + indexOffset;
    const dot2ActualIdx = dot2_idx + indexOffset;
    const dot3ActualIdx = dot3_idx + indexOffset;

    const dot1Value = parseFloat(row.children[dot1ActualIdx]?.textContent || '0');
    const dot2Value = parseFloat(row.children[dot2ActualIdx]?.textContent || '0');
    const dot3Value = parseFloat(row.children[dot3ActualIdx]?.textContent || '0');

    const dots = [
      { value: dot1Value, color: dot1_color },
      { value: dot2Value, color: dot2_color },
      { value: dot3Value, color: dot3_color }
    ];

    dots.forEach((dot) => {
      if (!isNaN(dot.value)) {
        const position = this.getPositionPercent(dot.value, min, max);
        chartContainer.appendChild(this.createDot(position, dot.color, barRounded));
      }
    });

    cell.appendChild(chartContainer);
  }

  // ========================================
  // Main Application Methods
  // ========================================

  private applyDataBarCharts(
    row: Element,
    configs: DataBarParams[] | undefined,
    headers: NodeListOf<Element>,
    barRounded: boolean
  ): void {
    if (!Array.isArray(configs)) return;

    configs.forEach((config) => {
      const cell = row.children[config.col_idx] as HTMLElement;
      if (!cell) return;

      const cellContent = cell.textContent || '';
      this.createDataBarChart(cell, config, cellContent, headers, row, barRounded);
    });
  }

  private applyDavidHumCharts(
    row: Element,
    configs: DavidHumParams[] | undefined,
    barRounded: boolean
  ): void {
    if (!Array.isArray(configs)) return;

    configs.forEach((config) => {
      const cell = row.children[config.col_idx] as HTMLElement;
      if (!cell) return;

      const cellContent = cell.textContent || '';
      this.createDavidHumChart(cell, config, cellContent, barRounded);
    });
  }

  private applyRangeCharts(
    row: Element,
    configs: RangeChartParams[] | undefined,
    barRounded: boolean
  ): void {
    if (!Array.isArray(configs)) return;

    configs.forEach((config) => {
      const cell = row.children[config.col_idx] as HTMLElement;
      if (!cell) return;

      this.createRangeChart(cell, config, row, barRounded);
    });
  }

  private applyFixedScaleCharts(
    row: Element,
    configs: FixedScaleChartParams[] | undefined,
    indexOffset: number,
    barRounded: boolean
  ): void {
    if (!Array.isArray(configs)) return;

    configs.forEach((config) => {
      const actualColIdx = config.col_idx + indexOffset;
      const cell = row.children[actualColIdx] as HTMLElement;
      if (!cell) return;

      this.createFixedScaleChart(cell, config, row, indexOffset, barRounded);
    });
  }

  private applyStylesToPercentageCells(): void {
    const tableContainer = document.querySelector('.clickabletable-container');
    if (!tableContainer || !this.props.args.config) return;

    const dataBarChartColumns = this.props.args.config.data_bar_chart_columns;
    const davidHumColumns = this.props.args.config.david_hum_columns;
    const idxColName = this.props.args.config.idx_col_name;
    const rangeChartColumns = this.props.args.config.range_chart;
    const fixedScaleRangeCharts = this.props.args.config.fixed_scale_range_chart;
    const barRounded = this.props.args.config.bar_rounded !== false;

    // Get bottom-level headers (last row of <thead>) for column mapping
    const { headers, theadRows } = this.getBottomHeaderRow(tableContainer);
    const firstRow = tableContainer.querySelector('tbody tr');
    const rowCellCount = firstRow ? firstRow.children.length : 0;
    const headerCount = headers.length;
    const indexIncluded = rowCellCount === headerCount;

    // Set idx_col_name on the first <th> of the first header row
    if (theadRows && theadRows.length > 0) {
      const firstTh = theadRows[0].querySelector('th');
      if (firstTh) {
        firstTh.textContent = idxColName;
      }
      // For multi-level headers, also set on subsequent header rows' index cell
      // to keep them consistent (they're typically empty spacers)
      if (theadRows.length > 1) {
        for (let i = 1; i < theadRows.length; i++) {
          const th = theadRows[i].querySelector('th');
          if (th && (!th.textContent || th.textContent.trim() === '')) {
            th.textContent = '';  // Keep lower-level index cells empty
          }
        }
      }
    } else if (headers && headers[0]) {
      headers[0].textContent = idxColName;
    }

    const rows = tableContainer.querySelectorAll('tbody tr');
    const indexOffset = indexIncluded ? 1 : 0;

    rows.forEach(row => {
      this.applyDataBarCharts(row, dataBarChartColumns, headers, barRounded);
      this.applyDavidHumCharts(row, davidHumColumns, barRounded);
      this.applyRangeCharts(row, rangeChartColumns, barRounded);
      this.applyFixedScaleCharts(row, fixedScaleRangeCharts, indexOffset, barRounded);
    });
  }

  private handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    const target = event.target as HTMLElement;

    if (target.tagName === "TD" || target.tagName === "TH") {
      const cell = target as HTMLTableCellElement;
      const cellValue = cell.innerText;

      // For multi-level headers, get the column name from the last (bottom-level) header row
      const table = cell.closest("table");
      const thead = table?.querySelector('thead');
      const theadRows = thead ? thead.querySelectorAll('tr') : null;
      const lastHeaderRow = theadRows && theadRows.length > 0
        ? theadRows[theadRows.length - 1]
        : null;
      const headerElement = lastHeaderRow
        ? lastHeaderRow.querySelector(`th:nth-child(${cell.cellIndex + 1})`)
        : table?.querySelector(`th:nth-child(${cell.cellIndex + 1})`);

      if (headerElement instanceof HTMLElement) {
        const header = headerElement.innerText;
        const rowElement = cell.parentElement;

        if (rowElement && rowElement.tagName === "TR") {
          const tableRow = rowElement as HTMLTableRowElement;
          // For multi-level headers, subtract the number of header rows instead of just 1
          const headerRowCount = theadRows ? theadRows.length : 1;
          const rowIndex = tableRow.rowIndex - headerRowCount;
          const key = this.props.args["key"];
          this.setState({ key, cellValue, header, rowIndex }, () => {
            Streamlit.setComponentValue({key, cellValue, header, rowIndex });
          });
        }
      }
    }
  }

  private applyColumnWidth = (): void => {
    if (!this.props.args.config.column_width) return;
    if (this.props.args.config.column_width.length <= 0) return;

    const tableContainer = document.querySelector('.clickabletable-container');
    if (!tableContainer) return;

    // Apply widths to the bottom-level header row (1:1 mapping with data columns)
    const { headers } = this.getBottomHeaderRow(tableContainer);
    if (headers) {
      for (let i = 0; i < headers.length; i++) {
        (headers[i] as HTMLElement).style.width = this.props.args.config.column_width[i];
      }
    }
  }

  private applyHiddenColumnClasses = (): void => {
    const hiddenColumns: number[] = this.props.args.config.hidden_columns;
    const hiddenClass: string = this.props.args.config.hidden_column_class;
    if (!hiddenColumns || !hiddenClass || hiddenColumns.length <= 0) return;

    const tableContainer = document.querySelector('.clickabletable-container');
    if (!tableContainer) return;

    const table = tableContainer.querySelector('table');
    if (!table) return;

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    const theadRows = thead ? thead.querySelectorAll('tr') : null;
    const isMultiLevel = theadRows && theadRows.length > 1;

    // For multi-level headers, use zero-width hiding to keep cells in the table
    // grid so that colspan alignment in upper header rows works correctly.
    // For single-level headers, use display:none (the original behavior).
    const hideClass = isMultiLevel ? 'hide-column-zero-width' : hiddenClass;

    // Handle body rows
    if (tbody) {
      const bodyRows = tbody.querySelectorAll('tr');
      bodyRows.forEach(row => {
        hiddenColumns.forEach((colIdx: number) => {
          const cssColIdx = colIdx + 1;
          const cell = row.querySelector(`th:nth-child(${cssColIdx}), td:nth-child(${cssColIdx})`);
          if (cell) {
            cell.classList.add(hideClass);
          }
        });
      });
    }

    // Handle header rows
    if (theadRows) {
      const lastHeaderRowIdx = theadRows.length - 1;

      theadRows.forEach((row, rowIdx) => {
        if (rowIdx === lastHeaderRowIdx) {
          // Last header row has 1:1 column mapping - hide cells directly
          hiddenColumns.forEach((colIdx: number) => {
            const cssColIdx = colIdx + 1;
            const cell = row.querySelector(`th:nth-child(${cssColIdx})`);
            if (cell) {
              cell.classList.add(hideClass);
            }
          });
        } else if (isMultiLevel) {
          // Upper header rows with colspan: DON'T adjust colspan.
          // The zero-width hidden cells in the bottom row keep them in the grid,
          // so colspans naturally span the correct positions.
          // Only hide a group header entirely if ALL its sub-columns are hidden.
          const cells = row.querySelectorAll('th');
          let visualCol = 0;
          cells.forEach(cell => {
            const colspan = parseInt(cell.getAttribute('colspan') || '1', 10);
            const spannedCols: number[] = [];
            for (let i = 0; i < colspan; i++) {
              spannedCols.push(visualCol + i);
            }

            const hiddenCount = spannedCols.filter(c => hiddenColumns.includes(c)).length;

            if (hiddenCount === colspan) {
              // All columns under this group header are hidden - hide the group too
              cell.classList.add(hideClass);
            }

            visualCol += colspan;
          });
        }
        // For single-level headers (only 1 header row), it's handled as the
        // lastHeaderRowIdx case above.
      });
    }
  }

  public render = (): ReactNode => {
    const html = this.props.args["html"];
    const max_height = this.props.args["max_height"];

    const { theme } = this.props
    const style: React.CSSProperties = {}

    if (theme && theme.primaryColor) {
      document.documentElement.style.setProperty('--header-bg-color', theme.secondaryBackgroundColor);
      document.documentElement.style.setProperty('--max-height', max_height);
      document.documentElement.style.setProperty('--hover-color', theme.primaryColor);
      document.documentElement.style.setProperty('--border-color', adjustColor(theme.secondaryBackgroundColor, -5));
      const borderStyling = `1px solid`
      style.border = borderStyling
      style.outline = borderStyling
    }

    setTimeout(() => {
      this.applyStylesToPercentageCells();
      this.applyColumnWidth();
      this.applyHiddenColumnClasses();
    }, 0);

    return (
      <div className="clickabletable-container">
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          onClick={this.handleClick}
          style={{ cursor: 'pointer' }}
        ></div>
      </div>
    )
  }
}

export default withStreamlitConnection(ClickableTable)
