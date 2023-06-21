function assignment6() {
    let filePath = "2019.csv";
    question0("2019.csv");
}

let question0 = function (filePath) {
    //preprocess data
    d3.csv(filePath).then(function (data) {
        question1(data);
        question2(data);
        question3(); //this uses data.json
        question4(data);

    });
}

let question1 = function (data) {
    const margin = { top: 50, right: 50, bottom: 50, left: 50 },
        width = 1000 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;





    // Create the SVG container
    const svg = d3.select("#q1_plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            `translate(${margin.left}, ${margin.top})`);



    // Load the map data (GeoJSON file)
    d3.json("world.json").then(function (geojson) {
        // Load the data values
        d3.csv("2019.csv").then(function (data) {
            console.log(data)

            d3.json("data.json").then(function (countries) {
                const nodes = countries.nodes;
                var nodeIDs = nodes.map((node) => node.name);
                nodeIDs.unshift("Select a Country..")

                d3.select("#selectButton")
                    .selectAll('myOptions')
                    .data(nodeIDs)
                    .enter()
                    .append('option')
                    .text(function (d) { return d; })
                    .attr("value", function (d) { return d; })
            });

            // Create a color scale based on the values
            const colorScale = d3
                .scaleSequential()
                .interpolator(d3.interpolateGreens)
                .domain(d3.extent(data, (d) => +d.Score));




            const projection = d3.geoNaturalEarth1().translate([width / 2, height / 2]);
            const pathgeo = d3.geoPath().projection(projection);
            const tooltip = d3.select("#tooltip")

            svg.append('path')
                .attr('class', 'sphere')
                .attr('d', pathgeo({ type: 'Sphere' }))
                .attr("fill", "skyblue");


                
                const legendWidth = 160;
                const legendHeight = 15;
                const legendX = 10;
                const legendY = height - 30;

                // Create a legend group
                const legend = svg.append("g")
                    .attr("class", "legend")
                    .attr("transform", `translate(${legendX}, ${legendY})`);

                // Create a color gradient for the legend
                const gradient = legend.append("linearGradient")
                    .attr("id", "color-gradient")
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", 0)
                    .attr("x2", legendWidth)
                    .attr("y1", 0)
                    .attr("y2", 0);

                // Append color stops to the gradient
                gradient.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", colorScale.range()[0]);

                gradient.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", colorScale.range()[1]);

                // Draw the color legend rectangle
                legend.append("rect")
                    .attr("x", 0)
                    .attr("y", -200)
                    .attr("width", legendWidth)
                    .attr("height", legendHeight)
                    .style("fill", "url(#color-gradient)");

                // Create scale for the legend axis
                const legendScale = d3.scaleLinear()
                    .domain([0,8]) // Adjust the domain based on your data
                    .range([0, legendWidth]);

                // Create the legend axis
                const legendAxis = d3.axisBottom(legendScale)
                    .ticks(8) // Adjust the number of ticks as needed

                // Append the legend axis to the legend group
                legend.append("g")
                    .attr("transform", `translate(0, ${legendHeight - 200})`)
                    .call(legendAxis);

                    legend.append("text")
                    .attr("transform", `translate(${30}, ${legendHeight - 220})`)
                    .text("Happiness Score")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", 12);
            // Draw the map
            svg
                .selectAll("path")
                .data(geojson.features)
                .enter()
                .append("path")
                .attr("class", "Country")
                .attr("d", pathgeo)
                .style("fill", function (d) {
                    // Find the corresponding value from the data
                    const value = data.find((item) => item.Country === d.properties.name).Score;
                    console.log(data.find((item) => item.Country === d.properties.name).Country)
                    // Map the value to the color scale
                    return colorScale(value);
                })
                .on("mouseover", function (event, d) {
                    tooltip
                        .style("opacity", .9)
                        .style("position", "absolute")
                        .style("background-color", "white")
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 100) + "px")
                        .style("border", "1px solid black")
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("stroke", "black")

                    const svg2 = d3.select("#tooltip")
                    svg2.append("svg")
                        .attr("width", 400)
                        .attr("height", 400)
                        .attr("class", "tip")
                        .style("stroke", "black")
                        .append("g")

                    var tip = d3.select(".tip")

                    var dict = {}
                    dict["Freedom"] = data.find((item) => item.Country === d.properties.name)["Freedom to make life choices"];
                    dict["GDP"] = data.find((item) => item.Country === d.properties.name)["GDP per capita"];
                    dict["Generosity"] = data.find((item) => item.Country === d.properties.name)["Generosity"];
                    dict["Life Exp."] = data.find((item) => item.Country === d.properties.name)["Healthy life expectancy"];
                    dict["Support"] = data.find((item) => item.Country === d.properties.name)["Social support"];
                    dict["Corruption"] = data.find((item) => item.Country === d.properties.name)["Perceptions of corruption"];

                    var xScale = d3.scaleBand()
                        .range([0, 300])
                        .padding(0.1)
                        .domain(Object.keys(dict));

                    let xAxis = d3.axisBottom()
                        .scale(xScale);

                    tip.append("g")
                        .attr("transform", "translate(" + 50 + "," + 350 + ")")
                        .call(d3.axisBottom(xScale))

                    tip.append("text")
                        .attr("transform",
                            "translate(" + (200) + " ," +
                            (390) + ")")
                        .style("text-anchor", "middle")
                        .attr("font-size", 15)
                        .text("Happiness Factors");

                    tip.append("text")
                        .attr("transform",
                            "translate(" + (200) + " ," +
                            (40) + ")")
                        .style("text-anchor", "middle")
                        .attr("font-size", 22)
                        .text(d.properties.name + ": " + (data.find((item) => item.Country === d.properties.name).Score));


                    var yScale = d3.scaleLinear()
                        .range([300, 0])
                        .domain([0, 1.7]);

                    let yAxis = d3.axisLeft()
                        .scale(yScale);

                    tip.append("g").call(yAxis)
                        .attr("transform", "translate(" + 50 + "," + 50 + ")")
                        .attr("class", "yAxis")

                    tip.append("text")
                        .attr("text-anchor", "end")
                        .attr("y", 6)
                        .attr("x", -180)
                        .attr("font-size", 15)
                        .attr("dy", ".75em")
                        .attr("transform", "rotate(-90)")
                        .text("Weight");


                    if ((dict["Freedom"] == 0) && (dict["Corruption"] == 0)) {
                        tip.append("text")
                            .attr("transform",
                                "translate(" + (200) + " ," +
                                (200) + ")")
                            .style("text-anchor", "middle")
                            .attr("font-size", 45)
                            .text("NO DATA");
                    }
                    else {
                        tip.selectAll("rect")
                            .data(Object.entries(dict))
                            .enter()
                            .append("rect")
                            .attr("x", function (d) {
                                return xScale(d[0]) + 50;
                            })
                            .attr("y", function (d) {
                                return yScale(d[1]) + 50;
                            })
                            .attr("width", xScale.bandwidth())
                            .attr("height", function (d) {
                                return 300 - yScale(d[1]);
                            })
                            .attr("fill", "orange");
                    }




                })
                .on("mouseout", function () {
                    tooltip.style("opacity", 0);
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("stroke", "transparent")
                    d3.select(".tip").remove()
                })
            svg.selectAll("path").data(geojson.features);


            function updateChart(selectedGroup) {
                svg.selectAll(".link").remove()
                svg.selectAll(".node").remove()
                if (selectedGroup != "Select a Country..") {
                    d3.json("data.json").then(function (data) {
                        const nodes = data.nodes;
                        const links = data.links;
                        d3.csv("locations.csv").then(function (coordinates) {
                            // Convert latitude and longitude to path coordinates using the projection
                            nodes.forEach((node) => {
                                const coordinate = coordinates.find((coord) => coord.Country === node.name);
                                node.latitude = +coordinate.Latitude;
                                node.longitude = +coordinate.Longitude;
                            });


                            nodes.forEach(node => console.log(node.latitude))

                            const projection = d3.geoNaturalEarth1().translate([width / 2, height / 2]);
                            // Filter the links to include only those with a source of "A"
                            const filteredLinks = links.filter((link) => link.source === selectedGroup);
                            const thicknessScale = d3.scaleLinear()
                                .domain(d3.extent(filteredLinks, (d) => d.value)) // Assuming 'value' is the attribute for link thickness
                                .range([.5, 4]); // Adjust the range of thickness values as needed
                            nodes.forEach((node) => {
                                const [x, y] = projection([node.longitude, node.latitude]);
                                console.log(x)
                                node.x = x;
                                node.y = y;
                            });

                            // Create path elements for the filtered links
                            const linkPaths = svg
                                .selectAll(".link")
                                .data(filteredLinks)
                                .enter()
                                .append("path")
                                .attr("class", "link")
                                .attr("d", (d) => {
                                    const sourceNode = nodes.find((node) => node.name === d.source);
                                    const targetNode = nodes.find((node) => node.name === d.target);

                                    // Create a curved path from source to target
                                    return `M ${sourceNode.x},${sourceNode.y} Q ${(sourceNode.x + targetNode.x) / 2},${sourceNode.y} ${targetNode.x},${targetNode.y}`;
                                });



                            linkPaths
                                .style("fill", "none")
                                .style("stroke", "yellow")
                                .style("stroke-width", (d) => thicknessScale(d.value));

                            const nodeCircles = svg
                                .selectAll(".node")
                                .data(nodes)
                                .enter()
                                .append("circle")
                                .attr("class", "node")
                                .attr("cx", (d) => d.x)
                                .attr("cy", (d) => d.y)
                                .attr("r", 2) // Adjust the radius as needed
                                .style("fill", "yellow");
                        });
                    });
                }

            }

            // Listen to the slider?

            d3.select("#selectButton").on("change", function (d) {
                console.log(this.value)
                selectedGroup = this.value;
                updateChart(selectedGroup);
            })

            d3.select("#reset").on("click", function (d) {
                let element = document.getElementById("selectButton");
                element.value = "Select a Country..";
                svg.selectAll(".link").remove()
                svg.selectAll(".node").remove()

            })



        })

    });
}

let question2 = function (data) {
    /*
    d3.json("data.json").then(function (data) {
        const nodes = data.nodes;
        const links = data.links;

        const margin = { top: 50, right: 50, bottom: 50, left: 50 },
            width = 1000 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        // Create the SVG container
        const svg = d3.select("#q2_plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                `translate(${margin.left}, ${margin.top})`);

        // Set up the force simulation
        const simulation = d3
            .forceSimulation(nodes)
            .force(
                "link",
                d3.forceLink(links).id((d) => d.id)
            )
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(width / 2, height / 2));

        // Create the links
        const link = svg
            .selectAll(".link")
            .data(links)
            .enter()
            .append("line")
            .attr("class", "link")
            .style("stroke-width", (d) => d.value / 10000000);

        // Create the nodes
        const node = svg
            .selectAll(".node")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", 10);

        // Add labels to the nodes
        const label = svg
            .selectAll(".label")
            .data(nodes)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("dx", 15)
            .attr("dy", ".35em")
            .text((d) => d.id);

        // Update positions of nodes and links on each tick of the simulation
        simulation.on("tick", () => {
            link
                .attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);

            node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

            label.attr("x", (d) => d.x).attr("y", (d) => d.y);
        });
    });
    */
}

let question3 = function () {

}
let question4 = function (data) {

}


