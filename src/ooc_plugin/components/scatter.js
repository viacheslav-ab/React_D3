import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

class Scatter extends Component {
    constructor(props) {
        super(props);
        this.createScatter = this.createScatter.bind(this);
        this.buildPlotData = this.buildPlotData.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.highlight_sample = this.highlight_sample.bind(this);
        this.highlight_outsamples = this.highlight_outsamples.bind(this);
    }

    componentDidMount() {
        this.createScatter();
    }

    componentDidUpdate() {
        this.createScatter();
    }

    buildPlotData(data) {
        if (data === undefined || !data.length) {
            return null;
        }

        var plotdata = new Array(data.length);
        for (let i = 0; i < data.length; i++) {
            plotdata[i] = {x: i, y: data[i]};
        }
        return plotdata;
    }

    highlight_sample(no, selected) {
        if (!this.props.enabled) return;

        var dot_id = "#sc" + no;
        var classname = '.' + this.props.name;
        var dot = d3.select(classname).select(dot_id);
    
        if (selected) {
            dot.attr("r", this.props.hlradius);
            dot.style("fill", this.props.outcolor);
        } else {
            dot.attr("r", this.props.radius);
            dot.style("fill", this.props.color);
        }
    }

    highlight_outsamples(samples, selected) {
        var color = this.props.color;
        var classname = '.' + this.props.name;
        if (samples === null) {
            var dots = d3.select(classname).selectAll(".dot");
            dots.style("fill", color);
            return;            
        }

        if (samples.length <= 0) return;

        var outcolor = this.props.outcolor;
        var dot_id, dot;
        for (let i = 0; i < samples.length; i++) {
            dot_id = "#sc" + samples[i];
            dot = d3.select(classname).select(dot_id);
            if (selected) {
                dot.style("fill", outcolor);
            } else {
                dot.style("fill", color)
            }
        }
    }

    handleMouseOver(d, i) {
        console.log("yjs");
        if (!this.props.enabled) return;

        var classname = '.' + this.props.name;
        var dot_id = "#sc" + i;
        var dot = d3.select(classname).select(dot_id);
        dot.style("fill", this.props.outcolor)
           .attr("r", this.props.hlradius);

        if ( this.props.onSelected === null ) return;
        this.props.onSelected(i, true);
    }

    handleMouseOut(d, i) {
        
        if (!this.props.enabled) return;

        var classname = '.' + this.props.name;
        var dot_id = "#sc" + i;
        var dot = d3.select(classname).select(dot_id);
        dot.style("fill", this.props.color)
           .attr("r", this.props.radius);

        if ( this.props.onSelected === null ) return;
        this.props.onSelected(i, false);
    }

    createScatter() {
        var data = this.buildPlotData(this.props.data);
        var margin = this.props.margin;
        var width = this.props.width - margin.left - margin.right;
        var height = this.props.height - margin.top - margin.bottom;
        var color = this.props.color;
        var discolor = this.props.discolor;
        var radius = this.props.radius;
        var classname = "." + this.props.name;
    
        var x = d3.scaleLinear()
            .range([0, width]);
        var y = d3.scaleLinear()
            .range([height, 0]);
        
        var xAxis = d3.axisBottom(x);
        var yAxis = d3.axisLeft(y);
    
        var svg = d3.select(classname)
            //.attr("class", this.props.name)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        
        var g = svg.select("g");
        if (g) {
            g.remove();
        }        
    
        svg = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        if (data && data.length > 0) {
            x.domain(d3.extent(data, function(d) { return d.x; })).nice();
            y.domain(d3.extent(data, function(d) { return d.y; })).nice();
        } else {
            x.domain([0, width]).nice();
            y.domain([-10.0, 10.0]).nice();
        }
        
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("");
    
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("");
    
        if (data === null || !data.length) {
            return;
        }
    
        if (this.props.enabled) {
            svg.append("g")
                .selectAll(".dot")
                .data(data)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("r", radius)
                .attr("cx", function(d) { return x(d.x); })
                .attr("cy", function(d) { return y(d.y); })
                .attr("id", function(d,i) { return ("sc" + i); })
                .style("fill", color)
                .on("mouseover", this.handleMouseOver)
                .on("mouseout", this.handleMouseOut);
        } else {
            svg.append("g")
                .selectAll(".dot")
                .data(data)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("r", radius)
                .attr("cx", function(d) { return x(d.x); })
                .attr("cy", function(d) { return y(d.y); })
                .attr("id", function(d,i) { return ("sc" + i); })
                .style("fill", discolor);
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

Scatter.defaultProps = {
    name: "",
    width: 346,
    height: 346,
    margin: {top: 20, right: 20, bottom: 30, left: 40},
    discolor: "#979797",
    color: "#333333",
    outcolor: "#333333",
    radius: 2.5,
    hlradius: 3.5,
    data: [],
    onSelected: null,
    enabled: false
};

Scatter.propsType = {
    name:     PropTypes.string.isRequired,
    width:    PropTypes.number,
    height:   PropTypes.number,
    margin:   PropTypes.object,
    discolor: PropTypes.string,
    color:    PropTypes.string,
    outcolor: PropTypes.string,
    radius:   PropTypes.number,
    hlradius: PropTypes.number,
    data:     PropTypes.object,
    onSelected: PropTypes.func,
    enabled:  PropTypes.bool
};

export default Scatter;