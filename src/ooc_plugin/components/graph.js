import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import $ from 'jquery';
const { icdf_normal } = require("../ooc/ooc_module.js");

class Graph extends Component {
    constructor(props) {
        super(props);
        this.createGraph = this.createGraph.bind(this);
        this.handleMouseOverLSample = this.handleMouseOverLSample.bind(this);
        this.handleMouseOutLSample = this.handleMouseOutLSample.bind(this);
        this.handleMouseOverWSample = this.handleMouseOverWSample.bind(this);
        this.handleMouseOutWSample = this.handleMouseOutWSample.bind(this);
        this.handleMouseOverLayer = this.handleMouseOverLayer.bind(this);
        this.handleMouseOutLayer = this.handleMouseOutLayer.bind(this);
        this.highlight_lsample = this.highlight_lsample.bind(this);
        this.highlight_wsample = this.highlight_wsample.bind(this);
        this.highlight_lhistogram_samples = this.highlight_lhistogram_samples.bind(this);
        this.highlight_whistogram_samples = this.highlight_whistogram_samples.bind(this);
        this.highlight_layer = this.highlight_layer.bind(this);
    }

    componentDidMount() {
        this.createGraph();
    }

    componentDidUpdate() {
        this.createGraph();
    }

    handleMouseOverLSample(d, i) {
        if (!this.props.enabled) return;

        var dot_id = "#sc" + i;
        var dot = d3.select(".lsamples").select(dot_id);
        dot.attr("r", this.props.hlsampleradius);

        if (this.props.onLSampleSelected === null) return;
        this.props.onLSampleSelected(i, true);
    }

    handleMouseOutLSample(d, i) {
        if (!this.props.enabled) return;

        var dot_id = "#sc" + i;
        var dot = d3.select(".lsamples").select(dot_id);
        dot.attr("r", this.props.sampleradius);

        if (this.props.onLSampleSelected === null) return;
        this.props.onLSampleSelected(i, false);
    }

    handleMouseOverWSample(d, i) {
        if (!this.props.enabled) return;

        var dot_id = "#sc" + i;
        var dot = d3.select(".wsamples").select(dot_id);
        dot.attr("r", this.props.hlsampleradius);
        dot.style("fill", this.props.layeroutcolor);

        if (this.props.onWSampleSelected === null) return;
        this.props.onWSampleSelected(i, true);
    }

    handleMouseOutWSample(d, i) {
        if (!this.props.enabled) return;

        var dot_id = "#sc" + i;
        var dot = d3.select(".wsamples").select(dot_id);
        dot.attr("r", this.props.sampleradius);
        dot.style("fill", this.props.windowcolor);

        if (this.props.onWSampleSelected === null) return;
        this.props.onWSampleSelected(i, false);
    }

    handleMouseOverLayer(d, i, nodes) {
        if (!this.props.enabled) return;

        var outsamples = [];
        var layerid = nodes[i].attributes.id.nodeValue;
        var layer = d3.select("#" + layerid);

        layer.attr("opacity", this.props.hllayerstyle.opacity)
            .attr("fill", this.props.hllayerstyle.fillcolor)
            .attr("stroke", this.props.hllayerstyle.strokecolor)
            .attr("stroke-width", this.props.hllayerstyle.strokewidth);
        
        var layeroutcolor = this.props.layeroutcolor;
        var layerincolor = this.props.layerincolor;
        var samplecolor = this.props.windowcolor;
        d3.select(".wsamples").selectAll("circle")
          .style("fill", function(d,i) {
            var query = "g.wsamples > circle#sc" + i;
            var ishigh = $(query).attr(layerid);
            if (ishigh === "1") { 
                // return samplecolor;
                return layerincolor;
            } else {
                outsamples.push(i);
                return layeroutcolor;
            }
        })

        if (this.props.onLayerSelected === null) return;
        if (outsamples.length > 0) {
            this.props.onLayerSelected(layerid, true, outsamples);
            return;
        }
        this.props.onLayerSelected(layerid, true);
    }

    handleMouseOutLayer(d, i, nodes) {
        if (!this.props.enabled) return;

        var layerid = nodes[i].attributes.id.nodeValue;
        var layer = d3.select("#" + layerid);

        layer.attr("opacity", this.props.layerstyle.opacity)
            .attr("fill", this.props.layerstyle.fillcolor)
            .attr("stroke", this.props.layerstyle.strokecolor)
            .attr("stroke-width", this.props.layerstyle.strokewidth);

        var samplecolor = this.props.windowcolor;
        d3.select(".wsamples").selectAll("circle")
            .style("fill", samplecolor);

        if (this.props.onLayerSelected === null) return;
        this.props.onLayerSelected(layerid, false);
    }

    highlight_lsample(no, selected) {
        if (!this.props.enabled) return;

        if (no < 0) return;

        var dot_id = "#sc" + no;
        var dot = d3.select('.lsamples').select(dot_id);
        
        if (selected) {
            dot.attr("r", this.props.hlsampleradius);
        } else {
            dot.attr("r", this.props.sampleradius);
        }
    }

    highlight_wsample(no, selected) {
        if (!this.props.enabled) return;

        if (no < 0) return;

        var dot_id = "#sc" + no;
        var dot = d3.select('.wsamples').select(dot_id);
        
        if (selected) {
            dot.attr("r", this.props.hlsampleradius);
            dot.style("fill", this.props.layeroutcolor);
        } else {
            dot.attr("r", this.props.sampleradius);
            dot.style("fill", this.props.windowcolor);
        }
    }

    highlight_lhistogram_samples(barno, selected) {
        if (!this.props.enabled) return;

        if (barno < 0) return;

        var hlsampleradius = this.props.hlsampleradius;
        var sampleradius = this.props.sampleradius;

        var samples = d3.select(".lsamples").selectAll("circle");
        if (selected) {
            samples.attr("r", function(d,i) {
                var query = "g.lsamples > circle#sc" + i;
                var no = parseInt($(query).attr("barno"), 10);
                if (no === barno) {
                    return hlsampleradius;
                } else {
                    return sampleradius;
                }
            });
        } else {
            samples.attr("r", sampleradius);
        }
    }

    highlight_whistogram_samples(barno, selected) {
        if (!this.props.enabled) return;

        if (barno < 0) return;

        var hlsampleradius = this.props.hlsampleradius;
        var sampleradius = this.props.sampleradius;

        var samples = d3.select(".wsamples").selectAll("circle");
        if (selected) {
            samples.attr("r", function(d,i) {
                var query = "g.wsamples > circle#sc" + i;
                var no = parseInt($(query).attr("barno"), 10);
                if (no === barno) {
                    return hlsampleradius;
                } else {
                    return sampleradius;
                }
            });
        } else {
            samples.attr("r", sampleradius);
        }
    }

    highlight_layer(layerno, selected) {
        if (!this.props.enabled) return;

        var layer = d3.select("#layer" + layerno);

        var outsamples = [];
        var samplecolor = this.props.windowcolor;
        if (selected) {
            layer.attr("opacity", this.props.hllayerstyle.opacity)
            .attr("fill", this.props.hllayerstyle.fillcolor)
            .attr("stroke", this.props.hllayerstyle.strokecolor)
            .attr("stroke-width", this.props.hllayerstyle.strokewidth);
        
            var layerid = 'layer' + layerno;
            var layeroutcolor = this.props.layeroutcolor;
            var layerincolor = this.props.layerincolor;
            d3.select(".wsamples").selectAll("circle")
            .style("fill", function(d,i) {
                var query = "g.wsamples > circle#sc" + i;
                var ishigh = $(query).attr(layerid);
                if (ishigh === "1") { 
                    return layerincolor;
                } else {
                    outsamples.push(i);
                    return layeroutcolor;
                }
            })

            if (outsamples.length > 0) {
                this.props.onLayerHighlighted(outsamples, true);
            }
        } else {
            layer.attr("opacity", this.props.layerstyle.opacity)
            .attr("fill", this.props.layerstyle.fillcolor)
            .attr("stroke", this.props.layerstyle.strokecolor)
            .attr("stroke-width", this.props.layerstyle.strokewidth);

            d3.select(".wsamples").selectAll("circle")
                .style("fill", samplecolor);

            this.props.onLayerHighlighted(null, false);
        }
    }

    createGraph() {
        function isInside(point, polygon) {
            var x = point.x, y = point.y;
            var beinside = false;
        
            for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                var xi = polygon[i].x, yi = polygon[i].y;
                var xj = polygon[j].x, yj = polygon[j].y;
          
                var intersect = ((yi > y) !== (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) beinside = !beinside;
            }
          
            return beinside;
        };

        var margin = this.props.margin;
        var width = this.props.width - margin.left - margin.right;
        var height = this.props.height - margin.top - margin.bottom;
        var classname = "." + this.props.name;
        var learncolor = this.props.learncolor;
        var windowcolor = this.props.windowcolor;
        var disablecolor = this.props.disablecolor;
        var sampleradius = this.props.sampleradius;
        var layerstyle = this.props.layerstyle;
        var learn = this.props.learndata;           // icdf data
        var window = this.props.windowdata;         // icdf data
        var lhistogram = this.props.lhistogram;
        var whistogram = this.props.whistogram;
        var layers = this.props.layerdata;

        var x = d3.scaleLinear()
            .range([0, width]);
        var y = d3.scaleLinear()
            .rangeRound([height, 0]);
        
        var y_label = [0.001, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.999]; // original grids
        var y_scaleTicks = icdf_normal(y_label); //transformed grids
        
        var xAxis = d3.axisBottom(x);
        var yAxis = d3.axisLeft(y)
            .tickValues(y_scaleTicks)
            .tickFormat(d3.format(".02f"));
    
        var svg = d3.select(classname)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
    
        var g = svg.select("g");
        if (g) {
            g.remove();
        }        
        
        svg = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        var min = 0, max = 0;
        
        if (learn.length > 0) {
            [min, max] = d3.extent(learn, function(d) { return d.x; });
        }
        
        if (window.length > 0) {
            let wmin, wmax;
            [wmin, wmax] = d3.extent(window, function(d) {return d.x; });
            if (wmin < min) min = wmin;
            if (wmax > max) max = wmax;
        }
        
        if (min === 0 && max === 0) {
            min = -10.0;
            max = 10.0;
        }
    
        if ( min < 0) {
            min += min / 10.0; 
        } else {
            min -= min / 10.0;
        }
        if ( max > 0) {
            max += max / 10.0;
        } else {
            max -= max / 10.0;
        }
        
        x.domain([min + min/10.0, max - max/10.0]).nice();
        y.domain([d3.min(y_scaleTicks), d3.max(y_scaleTicks)]);
    
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("font-size", "14px")
            .attr("class", "label")
            .attr("x", width + 35)
            .attr("y", 6)
            .style("text-anchor", "end")
            .text("Wert");
    
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("font-size", "14px")
            .attr("class", "label")
            .attr("transform", "translate(60, -25)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Wahrscheinlichkeit");
    
        svg.select(".y.axis")
            .selectAll(".tick")
            .select("text")
            .text(function(d, i) { return y_label[i]; });
    
        if (layers.length > 0) {
            // draw polyfill
            var lineFunc = d3.line()
                .x(function(d) { return x(d.x); })
                .y(function(d) { return y(d.y); })
                .curve(d3.curveLinearClosed);

            for (let i = layers.length - 1; i >= 0; i--) {
                if (this.props.enabled) {
                    svg.append("g")
                        .attr("class", "polyfill")
                        .append("path")
                        .datum(layers[i])
                        .attr("id", "layer" + i)
                        .attr("d", lineFunc)
                        .attr("fill", layerstyle.fillcolor)
                        .attr("opacity", layerstyle.opacity)
                        .attr("stroke", layerstyle.strokecolor)
                        .attr("stroke-width", layerstyle.strokewidth)
                        .on("mouseover", this.handleMouseOverLayer)
                        .on("mouseout", this.handleMouseOutLayer);
                } else {
                    svg.append("g")
                        .attr("class", "polyfill")
                        .append("path")
                        .datum(layers[i])
                        .attr("id", "layer" + i)
                        .attr("d", lineFunc)
                        .attr("fill", layerstyle.fillcolor)
                        .attr("opacity", layerstyle.opacity)
                        .attr("stroke", layerstyle.strokecolor)
                        .attr("stroke-width", layerstyle.strokewidth);
                }
             }                        
        }
    
        // draw samples
        if (learn.length > 0) {
            if (this.props.enabled) {
                svg.append("g")
                .attr("class", "lsamples")
                .selectAll()
                .data(learn)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("r", sampleradius)
                .attr("cx", function(d) { return x(d.x); })
                .attr("cy", function(d) { return y(d.y); })
                .attr("id", function(d,i) { return ("sc" + i); })
                .style("fill", learncolor)
                .attr("barno", function(d,i) {
                    if (!lhistogram.length) return -1;
                    for (let idx = 0; idx < lhistogram.length; ++idx) {
                        if (d.x >= lhistogram[idx].min && d.x <= lhistogram[idx].max) {
                            return idx;
                        }
                    }
                })
                .attr("layer0", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[0]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
                .attr("layer1", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[1]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
                .attr("layer2", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[2]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
                .attr("layer3", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[3]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
                .on("mouseover", this.handleMouseOverLSample)
                .on("mouseout", this.handleMouseOutLSample);
    
            } else {
                svg.append("g")
                .attr("class", "lsamples")
                .selectAll()
                .data(learn)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("r", sampleradius)
                .attr("cx", function(d) { return x(d.x); })
                .attr("cy", function(d) { return y(d.y); })
                .attr("id", function(d,i) { return ("sc" + i); })
                .style("fill", disablecolor)
                .attr("barno", function(d,i) {
                    if (!lhistogram.length) return -1;
                    for (let idx = 0; idx < lhistogram.length; ++idx) {
                        if (d.x >= lhistogram[idx].min && d.x <= lhistogram[idx].max) {
                            return idx;
                        }
                    }
                })
                .attr("layer0", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[0]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
                .attr("layer1", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[1]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
                .attr("layer2", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[2]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
                .attr("layer3", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[3]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
            }
        }
        
        if (window) {
            if (this.props.enabled) {
                svg.append("g")
                .attr("class", "wsamples")
                .selectAll()
                .data(window)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("r", sampleradius)
                .attr("cx", function(d) { return x(d.x); })
                .attr("cy", function(d) { return y(d.y); })
                .attr("id", function(d,i) { return ("sc" + i); })
                .style("fill", windowcolor)
                .attr("barno", function(d,i) {
                    if (!whistogram.length) return -1;
                    for (let idx = 0; idx < whistogram.length; ++idx) {
                        if (d.x >= whistogram[idx].min && d.x <= whistogram[idx].max) {
                            return idx;
                        }
                    }
                })
                .attr("layer0", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[0]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
                .attr("layer1", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[1]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
                .attr("layer2", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[2]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
                .attr("layer3", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[3]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
                .on("mouseover", this.handleMouseOverWSample)
                .on("mouseout", this.handleMouseOutWSample);
            } else {
                svg.append("g")
                .attr("class", "wsamples")
                .selectAll()
                .data(window)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("r", sampleradius)
                .attr("cx", function(d) { return x(d.x); })
                .attr("cy", function(d) { return y(d.y); })
                .attr("id", function(d,i) { return ("sc" + i); })
                .style("fill", disablecolor)
                .attr("barno", function(d,i) {
                    if (!whistogram.length) return -1;
                    for (let idx = 0; idx < whistogram.length; ++idx) {
                        if (d.x >= whistogram[idx].min && d.x <= whistogram[idx].max) {
                            return idx;
                        }
                    }
                })
                .attr("layer0", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[0]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
                .attr("layer1", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[1]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
                .attr("layer2", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[2]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
                .attr("layer3", function(d,i) {
                    if (!layers.length) return 0;
                    if (isInside(d, layers[3]) === false) {
                        return 0;
                    } else {
                        return 1;
                    }
                })
            }
        }
    }

    render() {
        var classname = this.props.name;
        return(
            <div>
                <svg className={classname} ref={node => this.node = node}>
                </svg>
            </div>
        );
    }
}

Graph.defaultProps = {
    name: "",
    width: 834,
    height: 401,
    margin: {top: 20, right: 50, bottom: 30, left: 65},
    learncolor: "#333333",
    windowcolor: "#00c6ff",
    disablecolor: "#c6c6c6",
    sampleradius: 2.5,
    hlsampleradius: 4.5,
    layerstyle: {strokecolor: "#032a3d", strokewidth: 1, fillcolor: "#e6f4e6", opacity: 0.2},
    hllayerstyle: {strokecolor: "#33cc33", strokewidth: 2, fillcolor: "#c6d4c6", opacity: 0.7},
    layeroutcolor: "#ff2d80",
    layerincolor: "#50e3c2",
    learndata: [],
    windowdata: [],
    lhistogram: [],
    whistogram: [],
    layerdata: [],
    onLSampleSelected: null,
    onWSampleSelected: null,
    onLayerSelected: null,
    onLayerHighlighted: null,
    enabled: false
};

Graph.propsType = {
    name:       PropTypes.string.isRequired,
    width:      PropTypes.number,
    height:     PropTypes.number,
    margin:     PropTypes.object,
    learncolor: PropTypes.string,
    windowcolor: PropTypes.string,
    disablecolor: PropTypes.string,
    sampleradius: PropTypes.number,
    hlsampleradius: PropTypes.number,
    layerstyle: PropTypes.object,
    hllayerstyle: PropTypes.object,
    layeroutcolor: PropTypes.string,
    layerincolor: PropTypes.string,
    learndata:  PropTypes.object,
    windowdata: PropTypes.object,
    lhistogram: PropTypes.object,
    whistogram: PropTypes.object,
    layerdata:  PropTypes.object,
    onLSampleSelected: PropTypes.func,
    onWSampleSelected: PropTypes.func,
    onLayerSelected: PropTypes.func,
    onLayerHighlighted: PropTypes.func,
    enabled: PropTypes.bool
};

export default Graph;