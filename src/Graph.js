import React from "react";

import { sprintf } from "sprintf-js";

import {
    VictoryChart,
    VictoryBar,
    VictoryLine,
    VictoryArea,
    VictoryAxis,
    VictoryTheme,
    VictoryZoomContainer,
    VictoryBrushContainer,
    VictoryLegend,
    VictoryLabel,
    VictoryGroup,
    VictoryTooltip,
    VictoryVoronoiContainer,
    VictoryScatter,
    VictoryErrorBar,
} from "victory";

const colors = [
    "#3366cc",
    "#dc3912",
    "#ff9900",
    "#109618",
    "#990099",
    "#0099c6",
    "#dd4477",
    "#66aa00",
    "#b82e2e",
    "#316395",
    "#994499",
    "#22aa99",
    "#aaaa11",
    "#6633cc",
    "#e67300",
    "#8b0707",
    "#651067",
    "#329262",
    "#5574a6",
    "#3b3eac",
    "#b77322",
    "#16d620",
    "#b91383",
    "#f4359e",
    "#9c5935",
    "#a9c413",
    "#2a778d",
    "#668d1c",
    "#bea413",
    "#0c5922",
    "#743411",
];

const Graph = ({
    data,
    width = 600,
    height = 400,
    title = "graph",
    textColor = "black",
    yLabel = "Fluorescence",
    xLabel = "Time [Hours]",
    showErrors,
}) => {
    return (
        <div>
            <VictoryChart
                width={width}
                height={height}
                standalone={true}
                crossAxis={false}
                theme={VictoryTheme.material}
                scale={{ x: "linear" }}
                title={title}
                padding={{ top: 50, right: 30, bottom: 60, left: 80 }}
                containerComponent={<VictoryVoronoiContainer />}
            >
                <VictoryLabel
                    x={25}
                    y={24}
                    text={title}
                    style={{
                        fill: textColor,
                        fontFamily: "inherit",
                        fontSize: "16px",
                        fontWeight: "bold",
                    }}
                />

                <VictoryLegend
                    x={80}
                    y={50}
                    orientation="vertical"
                    gutter={20}
                    style={{
                        border: { stroke: textColor },
                        title: { fontSize: 20 },
                        labels: { fill: textColor },
                    }}
                    data={data.map((d, index) => ({
                        name: d.name,
                        symbol: { fill: d.color ? d.color : colors[index % colors.length] },
                    }))}
                    itemsPerRow={5}
                />

                {data.map((d, index) => (
                    <VictoryLine
                        key={d.name}
                        data={d.data}
                        style={{
                            data: {
                                stroke: d.color ? d.color : colors[index % colors.length],
                            },
                        }}
                    />
                ))}

                {showErrors
                    ? data.map((d, index) => (
                          <VictoryErrorBar
                              key={d.name}
                              data={d.data}
                              style={{
                                  data: {
                                      stroke: d.color
                                          ? d.color
                                          : colors[index % colors.length],
                                  },
                              }}
                          />
                      ))
                    : null}

                <VictoryAxis
                    theme={VictoryTheme.material}
                    label={xLabel}
                    crossAxis={false}
                    tickValues={[0, 5, 10, 15, 20, 25, 30, 35, 40]}
                    style={{
                        axis: { stroke: textColor },
                        grid: { stroke: "gray" },
                        axisLabel: { padding: 30, fill: textColor },
                        tickLabels: { fill: textColor },
                    }}
                />

                <VictoryAxis
                    dependentAxis
                    crossAxis={false}
                    label={yLabel}
                    theme={VictoryTheme.material}
                    style={{
                        axis: { stroke: textColor },
                        grid: { stroke: "gray" },
                        axisLabel: { padding: 60, fill: textColor },
                        tickLabels: { fill: textColor },
                    }}
                />
            </VictoryChart>
        </div>
    );
};

export default Graph;
