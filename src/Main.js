import React, { useState, useEffect, useReducer } from "react";

import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Alert from "@material-ui/lab/Alert";
import Paper from "@material-ui/core/Paper";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import RemoveIcon from "@material-ui/icons/Close";

import Graph from "./Graph";

const bgColor = "#fff";

const SET_RESULT_TEXT = "SET_RESULT_TEXT";
const SET_DATA = "SET_DATA";
const ADD_LINE = "ADD_LINE";
const REMOVE_LINE = "REMOVE_LINE";
const SET_STATE = "SET_STATE";

const reducer = (state, action) => {
    switch (action.type) {
        case SET_STATE:
            return action.state;

        case SET_RESULT_TEXT:
            return { ...state, resultText: action.resultText };

        case SET_DATA:
            return { ...state, data: action.data };

        case ADD_LINE:
            return {
                ...state,
                lines: [...state.lines, { name: action.lineName, cells: action.lineCells }],
            };

        case REMOVE_LINE:
            return {
                ...state,
                lines: [...state.lines.filter((_, i) => i !== action.index)],
            };

        default:
            return state;
    }
};

const headers = ["Time", "T"];
const n = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
n.forEach((i) => headers.push("B" + i));
n.forEach((i) => headers.push("C" + i));
n.forEach((i) => headers.push("D" + i));
n.forEach((i) => headers.push("E" + i));
n.forEach((i) => headers.push("F" + i));
n.forEach((i) => headers.push("G" + i));

const Main = () => {
    const [showTable, setShowTable] = useState(false);
    const [lineName, setLineName] = useState("");
    const [lineCells, setLineCells] = useState([]);
    const [graphs, setGraphs] = useState([]);
    const [title, setTitle] = useState("Title");
    const [showErrors, setShowErrors] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [state, dispatch] = useReducer(reducer, {
        resultText: "",
        data: [],
        lines: [],
    });

    useEffect(() => {
        const dataText = window.localStorage.getItem("data");
        if (dataText) {
            const data = JSON.parse(dataText);
            setTitle(data.title);
            dispatch({ type: SET_STATE, state: data.state });
        }
    }, []);

    const handleSave = () => {
        const data = { title, state };

        window.localStorage.setItem("data", JSON.stringify(data));
    };

    const handleReadTable = () => {
        if (state.resultText === "") {
            setErrorMsg("Forgot to copy the result?");
            return;
        }

        const lines = state.resultText.split("\n");
        if (!lines[0].startsWith("Time")) {
            setErrorMsg("The copied table should start with 'Time'");
            return;
        }

        const data = [];

        for (let row = 1; row < lines.length; row++) {
            const r = {};
            const line = lines[row].split("\t");
            line.forEach((value, col) => {
                r[headers[col]] = value;
            });
            data.push(r);
        }

        console.log("data", data);

        dispatch({ type: SET_DATA, data });
    };

    const handleAddLine = () => {
        dispatch({ type: "ADD_LINE", lineName, lineCells });

        setLineName("");
        setLineCells("");
    };

    const handleAddCell = (row, col) => {
        if (lineCells === "") {
            setLineCells(row + col);
        } else {
            setLineCells(lineCells + "," + row + col);
        }
    };

    const getTime = (t) => {
        // convert 1:42:01 to hours
        const f = t.split(":");
        const x = parseInt(f[0]) + parseInt(f[1]) / 60 + parseInt(f[2]) / 3600;

        console.log(f, x);
        return x;
    };

    const processLine = (line) => {
        console.log(line);
        const cells = line.cells.split(",").filter((x) => x !== "");

        const graph = { name: line.name, data: [] };

        state.data.forEach((d) => {
            let sum = 0;
            let errorsSum = 0;

            cells.forEach((cell) => (sum += parseFloat(d[cell])));
            const mean = sum / cells.length;

            cells.forEach((cell) => {
                const x = parseFloat(d[cell]);
                errorsSum += (x - mean) * (x - mean);
            });

            const std = Math.sqrt(errorsSum / cells.length);

            graph.data.push({ x: getTime(d.Time), y: mean, errorY: std });
        });

        //console.log(cells, state.data);
        console.log(graph);

        return graph;
    };

    const handleGenerateGraph = () => {
        const _graphs = [];
        state.lines.forEach((line) => {
            const graph = processLine(line);
            _graphs.push(graph);
        });

        setGraphs(_graphs);
    };

    return (
        <div style={{ margin: 20 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                }}
            >
                <Typography variant="h6">Anat's Graph</Typography>
                <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    onClick={handleSave}
                >
                    Save
                </Button>
            </div>

            {errorMsg ? (
                <Alert variant="filled" severity="warning" onClose={() => setErrorMsg("")}>
                    {errorMsg}
                </Alert>
            ) : null}

            <Paper style={{ padding: 20, marginBottom: 20, backgroundColor: bgColor }}>
                <Typography>Step 1) Copy the result table including headers</Typography>

                <pre>
                    <TextField
                        multiline
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        label="Result Table"
                        rows={10}
                        value={state.resultText}
                        onChange={(e) =>
                            dispatch({ type: SET_RESULT_TEXT, resultText: e.target.value })
                        }
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ style: { fontSize: 12 } }} // font size of input text
                    />
                </pre>

                <div>
                    <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={handleReadTable}
                    >
                        Read Table
                    </Button>

                    <Button
                        variant="contained"
                        size="small"
                        color="secondary"
                        onClick={() => setShowTable(!showTable)}
                        style={{ marginLeft: 16 }}
                    >
                        {showTable ? "Hide Table" : "Show Table"}
                    </Button>
                </div>

                {showTable ? (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {headers.map((header, headerIndex) => (
                                    <TableCell key={header}>{header}</TableCell>
                                ))}
                            </TableRow>
                            <TableBody>
                                {state.data.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {Object.values(row).map((col, colIndex) => (
                                            <TableCell key={rowIndex + "." + colIndex}>
                                                {col}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableHead>
                    </Table>
                ) : null}
            </Paper>

            <Paper style={{ padding: 20, marginBottom: 20, backgroundColor: bgColor }}>
                <Typography>Step 2) Add Lines</Typography>
                <br />

                {[" ", "A", "B", "C", "D", "E", "F", "G", "H"].map((row) => {
                    if (row === " ") {
                        return (
                            <div key={row} style={{ display: "flex" }}>
                                <div style={{ width: 70, height: 40 }}>.</div>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((col) => (
                                    <div
                                        key={col}
                                        style={{
                                            width: 70,
                                            height: 40,
                                            textAlign: "center",
                                        }}
                                    >
                                        {col}
                                    </div>
                                ))}
                            </div>
                        );
                    } else {
                        return (
                            <div key={row} style={{ display: "flex" }}>
                                <div style={{ width: 70, height: 40 }}>{row}</div>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((col) => (
                                    <div key={col} style={{ width: 70, height: 40 }}>
                                        {row !== "A" &&
                                        row !== "H" &&
                                        col !== 1 &&
                                        col !== 12 ? (
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => handleAddCell(row, col)}
                                            >
                                                {row + col}
                                            </Button>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        );
                    }
                })}

                <div>
                    <TextField
                        variant="outlined"
                        margin="dense"
                        label="Line Name"
                        value={lineName}
                        onChange={(e) => setLineName(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        variant="outlined"
                        margin="dense"
                        label="Line Cells"
                        value={lineCells}
                        onChange={(e) => setLineCells(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        style={{ marginLeft: 16 }}
                    />

                    <Button
                        variant="contained"
                        size="medium"
                        color="primary"
                        onClick={handleAddLine}
                        style={{ marginLeft: 16, marginTop: 9 }}
                    >
                        Add Line
                    </Button>
                </div>

                <br />
                <Typography>Selected Lines:</Typography>
                {state.lines.map((line, index) => (
                    <div key={line.name} style={{ display: "flex" }}>
                        <Typography style={{ width: 30 }}>{index + 1}</Typography>
                        <Typography style={{ width: 200 }}>{line.name}</Typography>
                        <Typography style={{ width: 200 }}>{line.cells}</Typography>
                        <Button
                            size="small"
                            color="secondary"
                            startIcon={<RemoveIcon />}
                            onClick={() => dispatch({ type: REMOVE_LINE, index })}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
            </Paper>

            <Paper style={{ padding: 20, marginBottom: 20, backgroundColor: bgColor }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Typography>Step 3) </Typography>
                    <Button
                        variant="contained"
                        size="small"
                        color="secondary"
                        onClick={handleGenerateGraph}
                        style={{ marginLeft: 16, marginTop: 9 }}
                    >
                        Generate Graph
                    </Button>

                    <TextField
                        variant="outlined"
                        margin="dense"
                        label="Graph Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        style={{ marginLeft: 16 }}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showErrors}
                                onChange={() => setShowErrors(!showErrors)}
                                color="primary"
                                style={{ marginLeft: 16 }}
                            />
                        }
                        label="Show Errors"
                    />
                </div>
            </Paper>
            <Paper style={{ padding: 20, marginBottom: 20, backgroundColor: bgColor }}>
                <Graph data={graphs} title={title} showErrors={showErrors} />
            </Paper>
            <br />
        </div>
    );
};

export default Main;
