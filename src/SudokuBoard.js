import React from 'react';
import { makeSudokuJs } from './sudoku.js';
import Timer from './Timer.js';
import ButtonPanel from './ButtonPanel.js';
import Square from './Square.js';

class SudokuBoard extends React.Component {
   
    constructor(props) {
        super(props);
        this.sudokujs = makeSudokuJs();
        this.state = {
            selected: -1,
            gameBoard: Array(81).map(() => Array(9)),
            notes: Array.from(Array(81), () => new Set()),
            cellErrors: Array(81).fill(false),
            gameStart: Date.now(),
            startingCells: Array(81).fill(null),
            solution: Array(81).fill(null),
            noteMode: false
        };        
        this.handleClickedSquare = this.handleClickedSquare.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.calculateInError = this.calculateInError.bind(this);
        this.validNines = Array(81).fill().map((_, idx)  => (getNinesForIndex(idx)));
    }

    keydownHandler(event) {
        let pressed = event.key;

        if(pressed.startsWith("Arrow")){
            this.handleArrowPress(pressed);
        }

        if(pressed.match("^[1-9]$")){
            let selectedIdx = this.state.selected;
            if(this.state.startingCells[selectedIdx] !== " "){
                return;
            }
            if(this.state.noteMode){
                this.updateNoteValue(pressed);
            } else {
                this.updateSelectedValue(pressed);
            }
        }

        if(pressed === "n" || pressed === "N" || pressed === " "){
            this.toggleNote();
        }

        if(pressed === "Backspace" || pressed === "Delete") {
            this.updateSelectedValue(" ");
        }
        
    }

    handleArrowPress(pressed){
        let selected = this.state.selected;
        if(pressed === "ArrowUp"){
            selected = selected - 9;
        } 
        if(pressed === "ArrowDown"){
            selected = selected + 9;
        }
        if(pressed === "ArrowLeft"){
            selected = selected - 1;
        }
        if(pressed === "ArrowRight"){
            selected = selected + 1;
        }
        if(selected < 0 || selected >= 81){
            return;
        }
        this.setState({
            selected: selected
        })

    }
    updateSelectedValue(value){
        let selectedIdx = this.state.selected;
        if(this.state.startingCells[selectedIdx] !== " "){
            return;
        }
        let newCommitedValues = global.structuredClone(this.state.gameBoard);
        newCommitedValues[this.state.selected] = value;
        this.setState({
            gameBoard: newCommitedValues,  
            cellErrors: this.calculateInError(newCommitedValues)
        });
    }

    updateNoteValue(value){
        let newNotes = global.structuredClone(this.state.notes)
        let newCommitedValues = global.structuredClone(this.state.gameBoard);
        let note = newNotes[this.state.selected];

        if(note.has(value)){
            note.delete(value);
        } else {
            note.add(value);
        }
        newCommitedValues[this.state.selected] = " ";
        this.setState({
            gameBoard: newCommitedValues,  
            cellErrors: this.calculateInError(newCommitedValues),
            notes: newNotes
        });
    }


    handleClickedSquare(i){
        this.setState({
            selected: i,
        })
    }

    makeGameAndSolution(){
        let gameStr = this.sudokujs.generate("hard");
        let solutionStr = this.sudokujs.solve(gameStr);
        let game = Array.from(gameStr.replaceAll('.', ' '));
        let solution = Array.from(solutionStr);
        return {game, solution};
    }

    newGame(){
        let {game, solution} = this.makeGameAndSolution();
        let gameBoard = structuredClone(game);
        this.setState({
            selected: -1,
            gameBoard: gameBoard,
            cellErrors: Array(81).fill(false),
            gameStart: Date.now(),
            startingCells: game,
            solution: solution
        });
    }

    solve(){
        this.setState({
            selected: -1,
            inputError: false,
            gameBoard: this.state.solution,
            cellErrors: Array(81).fill(false),
        });
    }

    toggleNote(){
        this.setState({
            noteMode: !this.state.noteMode
        })
    }
   
    render() {
       const elems = [];
        for(let x = 0; x < 9; x++){
            let innerElems = [];
            for(let y = 0; y < 9; y++){
               
                /*
                    Calculate grid index. Sudoku board in array is from left to right across the whole board, 
                    vs the html rendering which is per square game board. The maths below works out for a given x,y what the array idx position is.
                */
                let idx = ((Math.floor(y / 3) * 9) + y % 3) + ( Math.floor(x / 3) * 27) +  (( x % 3) * 3);
                innerElems.push(<Square key = {`${idx}` }
                                     displayValue = {this.state.gameBoard[idx] || ""}
                                    selected = {idx === this.state.selected}
                                    inputError = {this.state.cellErrors[idx]}
                                    idx = {idx}
                                    validNines = {this.validNines[this.state.selected]}
                                    onClick = {() => {this.handleClickedSquare(idx)}}
                                    locked = {this.state.startingCells[idx] !== ' '}
                                    incorrect = {(this.state.gameBoard[idx] || ' ' ) !== this.state.solution[idx]}
                                    notes = {this.state.notes[idx]}
                                    />
                )
            }
            elems.push(<div className="box">{innerElems}</div>);
        }

         return (
            <div className = "board">
                <h1>Welcome to the Sudoku game!</h1>
                <div className="control-panel">
                    <ButtonPanel newGame = {() => this.newGame()} solve = {() => this.solve()} toggleNote = {(() => this.toggleNote())} noteMode={this.state.noteMode}/>
                    <Timer gameStart = {this.state.gameStart} />
                </div>
                <div className = "sudoku">
                { elems }
                </div>
            </div>
        )
    }
    calculateInError(gameBoard){
        let newErrors = Array(81).fill(false);
       
        for(let i = 0 ; i < this.validNines.length; i++){
           
            if(newErrors[i]){ //Short circuit if cell is already in error.
                continue;
            }

            let selectedNines = this.validNines[i];
            let dupeIdx = [];
            for(let nineGridIdx = 0; nineGridIdx < selectedNines.length; nineGridIdx++){
                let considerCells = selectedNines[nineGridIdx]            
                let inputtedNumbersForScope = considerCells.flatMap((val) => gameBoard[val]);
                let dupeElems = inputtedNumbersForScope.filter((value, index, self) => self.indexOf(value) !== index && value.match("^[1-9]$"));
                considerCells.forEach((idx) => {
                    if(dupeElems.includes(gameBoard[idx])) {
                        dupeIdx.push(idx);
                    }
                })
                dupeIdx.forEach((value) => newErrors[value] = true)
            }
        }
        return newErrors;
    } 

    
    componentDidMount() {
        //Register Keyboard Handler
        document.addEventListener("keydown", this.keydownHandler);
        //Initialise game.
        this.newGame();
    }
    
    componentWillUnmount() {
        //Unregister keyboard handler.
        document.removeEventListener("keydown", this.keydownHandler);
    }
}

/**
 * Gives the indexes of the three sets of 9 cells to check for any given index in a one dimensional sudoku game. 
 * 
 * @param {*} idx the idx to calculate the sets of nines for. 
 * @returns  the three sets indexes (horizontal row, vertical row, adjacent cells)
 */
function getNinesForIndex(idx){
    const oneToNineIdx = [];

    let firstX = Math.floor(idx / 9) * 9;
    let firstY =  idx % 9;

    const xNine = [];
    for(let i = firstX; i < firstX + 9; i++){
        xNine.push(i);
    }
    oneToNineIdx.push(xNine);

    const yNine = [];
    for(let i = 0; i < 9; i++){
        yNine.push(( i * 9)+  firstY);
    }
    oneToNineIdx.push(yNine);

    let yOffset = Math.floor(idx / 27);
    let xRoot = idx % 9;
    let xRootOffset = xRoot % 3;
    let xSquareIdx = xRoot - xRootOffset;
    let squareTopLeft = xSquareIdx + (yOffset * 27)

    const squareNines = [
        squareTopLeft + 0,  squareTopLeft + 1,  squareTopLeft + 2,
        squareTopLeft + 9,  squareTopLeft + 10, squareTopLeft + 11,
        squareTopLeft + 18, squareTopLeft + 19, squareTopLeft + 20,
    ]

    oneToNineIdx.push(squareNines);
    return oneToNineIdx;
}

export default SudokuBoard;