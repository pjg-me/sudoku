function ButtonPanel(props) {
    return (
     <div className="button-panel">
        <button onClick={props.newGame}>New Game</button>
        <button onClick={props.solve}>Solve</button>
        <button className={props.noteMode ? "note-toggle-on": "note-toggle-off"} onClick={props.toggleNote}>Toggle Note: {props.noteMode ? "On": "Off"} (Space) </button>
     </div>
    )
}
export default ButtonPanel;