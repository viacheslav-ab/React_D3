import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

class Donut extends Component {
    constructor(props) {
        super(props);
        this.createDonut = this.createDonut.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.highlight = this.highlight.bind(this);
    }

    componentDidMount() {
        this.createDonut();
    }

    componentDidUpdate() {
        this.createDonut();
    }

    handleMouseOver() {
        if (!this.props.enabled) return;

        var classname = '.' + this.props.name;
        var svg = d3.select(classname);
        var foreground = svg.select("#foreground");
        var background = svg.select("#background");

        foreground.attr("fill", this.props.hlforecolor);
        background.attr("fill", this.props.hlbackcolor);

        if (this.props.onSelected === null) return;
        this.props.onSelected(this.props.name, true);
    }

    handleMouseOut(d, i) {
        if (!this.props.enabled) return;

        var classname = '.' + this.props.name;
        var svg = d3.select(classname);
        var foreground = svg.select("#foreground");
        var background = svg.select("#background");

        foreground.attr("fill", this.props.forecolor);
        background.attr("fill", this.props.backcolor);

        if (this.props.onSelected === null) return;
        this.props.onSelected(this.props.name, false);
    }

    highlight(selected) {
        if (!this.props.enabled) return;

        var name = '.' + this.props.name;
        var svg = d3.select(name);
        var foreground = svg.select("#foreground");
        var background = svg.select("#background");
    
        if (selected) {
            foreground.attr("fill", this.props.hlforecolor);
            background.attr("fill", this.props.hlbackcolor);
        } else {
            foreground.attr("fill", this.props.forecolor);
            background.attr("fill", this.props.backcolor);
        }
    }

    createDonut() {
        var progress = this.props.progress;
        var margin = this.props.margin;
        var width = this.props.width - margin.left - margin.right;
        var height = this.props.height - margin.top - margin.bottom;
        var classname = "." + this.props.name;

        var twoPi = 2 * Math.PI;
        var formatPercent = d3.format(".0%");    
    
        var arc = d3.arc()
        .startAngle(this.props.startangle)
        .innerRadius(this.props.innerradius)
        .outerRadius(this.props.outerradius);

        var svg;
        if (this.props.enabled) {
            svg = d3.select(classname)
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", this.handleMouseOver)
            .on("mouseout", this.handleMouseOut);
        } else {
            svg = d3.select(classname)
            .attr("width", width)
            .attr("height", height);
        }
        
        var g = svg.select("g");
        if (g) {
            g.remove();
        }
        
        g = svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var meter = g.append("g")
            .attr("class", "progress-meter");
        
        if (this.props.enabled) {
            meter.append("path")
            .attr("id", "background")
            .attr("fill", this.props.backcolor)
            .attr("d", arc.endAngle(twoPi));
        
            meter.append("path")
            .attr("id", "foreground")
            .attr("fill", this.props.forecolor)
            .attr("d", arc.endAngle(twoPi * progress));
        } else {
            meter.append("path")
            .attr("id", "background")
            .attr("fill", this.props.disbackcolor)
            .attr("d", arc.endAngle(twoPi));
        
            meter.append("path")
            .attr("id", "foreground")
            .attr("fill", this.props.disforecolor)
            .attr("d", arc.endAngle(twoPi * progress));
        }

        var text = meter.append("text")
            .attr("text-anchor", "middle")
            .attr("fill", "#888888")
            .attr("dy", ".35em");
        
        text.text(formatPercent(progress)); 
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

Donut.defaultProps = {
    name: "",
    width: 128,
    height: 128,
    margin: {top: 0, right: 0, bottom: 0, left: 0},
    disbackcolor: "#e5e4e4",
    backcolor: "#C2C2C2",
    hlbackcolor: "#50e3c2",
    disforecolor: "#c6c6c6",
    forecolor: "#474747",
    hlforecolor: "#ff2d80",
    startangle: 0.0,
    innerradius: 50.0,
    outerradius: 60.0,
    progress: 0.0,
    onSelected: null,
    enabled: false
};

Donut.propsType = {
    name:       PropTypes.string.isRequired,
    width:      PropTypes.number,
    height:     PropTypes.number,
    margin:     PropTypes.object,
    disbackcolor: PropTypes.string,
    backcolor:  PropTypes.string,
    hlbackcolor: PropTypes.string,
    disforecolor: PropTypes.string,
    forecolor:  PropTypes.string,
    hlforecolor: PropTypes.string,
    startangle: PropTypes.number,
    innerradius:    PropTypes.number,
    outerradius:    PropTypes.number,
    progress:   PropTypes.number,
    onSelected: PropTypes.func,
    enabled:    PropTypes.bool
};

export default Donut;