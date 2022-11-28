import React from 'react';

function Square(props){
     
    function calcClasses() {
        let classNames = ["cell"]
        let idx = props.idx;
    
        if(props.selected) {
            classNames.push("cell-clicked");
        }
    
        if(props.locked){
            classNames.push("cell-locked");
        }
    
        if(props.incorrect){
            classNames.push("cell-incorrect");
        }
    
        if(props.inputError){
            classNames.push("cell-error");
        }
    
        if(props.validNines?.flatMap(num => num).includes(idx)){
            classNames.push("cell-selected");
        }
        
        return classNames.join(' ');
    }

    
    
    let className = calcClasses();
        let displayNotes = [];
        if(props.displayValue === " " || props.displayValue === ""){
            for(var note of props.notes){
                displayNotes.push(<div className = {`note note-${note}`}>{note}</div>)
            }
        }

        return (
           <div className = {className}> 
                <input inputMode="numeric" 
                      readOnly={props.locked}
                      pattern="[1-9]" 
                      type="text" 
                      className="text" 
                      onClick={props.onClick} 
                      onChange={() => {}} // Suppress console warning about read-only as keypresses are captured globablly
                      value={props.displayValue}
                      />
                {displayNotes}
            </div>
        )
}

export default Square;