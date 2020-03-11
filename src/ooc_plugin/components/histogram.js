import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

class Histogram extends Component {
    constructor(props) {
        super(props);
        this.createHistogram = this.createHistogram.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
    }

    componentDidMount() {
        var bins = this.createHistogram();
        this.props.onInit(bins);
    }

    componentDidUpdate() {
        var bins = this.createHistogram();
        this.props.onInit(bins);
    }

    handleMouseOver(d, i) {
        if (!this.props.enabled) return;

        var classname = '.' + this.props.name;
        var bar_id = "#barno" + i;
        var bar = d3.select(classname).select(bar_id);
        bar.style("fill", this.props.hlcolor);

        if (this.props.onSelected === null) return;
        this.props.onSelected(i, true);
    }

    handleMouseOut(d, i) {
        if (!this.props.enabled) return;

        var classname = '.' + this.props.name;
        var bar_id = "#barno" + i;
        var bar = d3.select(classname).select(bar_id);
        bar.style("fill", this.props.color);

        if (this.props.onSelected === null) return;
        this.props.onSelected(i, false);
    }

    createHistogram() {
        var data = this.props.data;
        var margin = this.props.margin;
        var width = this.props.width - margin.left - margin.right;
        var height = this.props.height - margin.top - margin.bottom;
        var color = this.props.color;
        var discolor = this.props.discolor;
        var classname = "." + this.props.name;
    
        var x = d3.scaleBand().paddingInner([0.05]);
        var y = d3.scaleLinear();
        var xAxis = d3.axisBottom(x).tickSize(6, 0).tickFormat(d3.format(".02f"));

        var bins;
        if (data.length > 0) {
            // Compute the histogram
            var histogram = d3.histogram();
            bins = histogram(data);

            // Update the x-scale
            x.domain(bins.map(function(d) { return d3.max(d); }))
            .rangeRound([0, width]);
            // Update the y-scale
            y.domain([0, d3.max(bins, function(d) { return d.length; })])
            .range([height, 0]);
        } else {
            x.domain([0, width]).range([0, width]);
            y.domain([height, 0]).range([height, 0]);
        }

        // Select the svg element
        var svg = d3.select(classname).data([bins]);
        var g = svg.select("g");
        if (g) {
            g.remove();
        }

        var gEnter = svg.append("g");
        gEnter.append("g").attr("class", "histogram");
        gEnter.append("g").attr("class", "x axis");

        // Update the outer dimensions
        svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
        
        // Update the inner dimensions
        g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Update the x-axis
        g.select(".x.axis")
        .attr("transform", "translate(0," + y.range()[0] + ")")
        .call(xAxis);

        if (bins === undefined || !bins.length) {
            return null;
        }

        // Update the bars
        if (this.props.enabled) {
            svg.select(".histogram")
                .selectAll(".bar")
                .data(bins)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d3.max(d)); })
                .attr("y", function(d) { return y(d.length); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return y.range()[0] - y(d.length); })
                .attr("id", function(d,i) { return ("barno" + i); })
                .style("fill", color)
                .order()
                .on("mouseover", this.handleMouseOver)
                .on("mouseout", this.handleMouseOut);
        } else {
            svg.select(".histogram")
                .selectAll(".bar")
                .data(bins)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d3.max(d)); })
                .attr("y", function(d) { return y(d.length); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return y.range()[0] - y(d.length); })
                .attr("id", function(d,i) { return ("barno" + i); })
                .style("fill", discolor)
                .order();
        }

        return bins;
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

Histogram.defaultProps = {
    name: "",
    width: 346,
    height: 346,
    margin: {top: 20, right: 20, bottom: 30, left: 40},
    discolor: "#c6c6c6",
    color: "#333333",
    hlcolor: "#d3d3d3",
    data: [],
    onInit: null,
    onSelected: null,
    enabled: false
};

Histogram.propsType = {
    name:     PropTypes.string.isRequired,
    width:    PropTypes.number,
    height:   PropTypes.number,
    margin:   PropTypes.object,
    discolor: PropTypes.string,
    color:    PropTypes.string,
    hlcolor:  PropTypes.string,
    data:     PropTypes.object,
    onInit:   PropTypes.func,
    onSelected: PropTypes.func,
    enabled:  PropTypes.bool
};

export default Histogram;