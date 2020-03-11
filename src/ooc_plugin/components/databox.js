import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Databox extends Component {
    constructor(props) {
        super(props);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    componentDidMount() {
    }

    componentDidUpdate() {
    }

    handleKeyUp = (e) => {
        var value = e.target.value;

        if (this.props.onDataChanged === null) return;
        this.props.onDataChanged(value);
    }

    render() {
        var enabled = this.props.enabled;
        if (enabled) {
            let classname = this.props.name + " active";
            return(
                <textarea className={classname} 
                    id={this.props.id}
                    placeholder={this.props.placeholder}
                    onKeyUp={this.handleKeyUp}>
                </textarea>
            );
        } else {
            return(
                <textarea className={this.props.name} 
                    id={this.props.id}
                    placeholder={this.props.placeholder}
                    onKeyUp={this.handleKeyUp}>
                </textarea>
            );
        }
    }
}

Databox.defaultProps = {
    id: "",
    name: "",
    placeholder: "",
    onDataChanged: null,
    enabled: false
};

Databox.propsType = {
    id:       PropTypes.string.isRequired,
    name:     PropTypes.string.isRequired,
    placeholder:   PropTypes.string,
    onDataChanged: PropTypes.func,
    enabled:  PropTypes.bool
};

export default Databox;