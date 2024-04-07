import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { ReactNode } from "react"
import "./app.css"
interface State {
  cellValue: string
  header: string
  rowIndex: number
}

/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
class KlickableTable extends StreamlitComponentBase<State> {
  public state = { cellValue: "", header: "", rowIndex: -2 }
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

          // Use setState to update the state and then use its callback to communicate with Streamlit
          this.setState({ cellValue, header, rowIndex }, () => {
            Streamlit.setComponentValue({ cellValue, header, rowIndex });
            console.log({ cellValue, header, rowIndex });
          });
        }
      }
    }


  }
  public render = (): ReactNode => {

    const html = this.props.args["html"];

    // Streamlit sends us a theme object via props that we can use to ensure
    // that our component has visuals that match the active theme in a
    // streamlit app.
    const { theme } = this.props
    const style: React.CSSProperties = {}

    // Maintain compatibility with older versions of Streamlit that don't send
    // a theme object.
    if (theme) {
      // Use the theme object to style our button border. Alternatively, the
      // theme style is defined in CSS vars.
      const borderStyling = `1px solid`
      style.border = borderStyling
      style.outline = borderStyling
    }

    // Show a button and some text.
    // When the button is clicked, we'll increment our "numClicks" state
    // variable, and send its new value back to Streamlit, where it'll
    // be available to the Python program.
    
    console.log(html);
    return (
      <div>
        <div 
          dangerouslySetInnerHTML={{ __html: html }} 

          onClick={this.handleClick}
          style={{ cursor: 'pointer' }}  // Change cursor on hover
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
export default withStreamlitConnection(KlickableTable)
