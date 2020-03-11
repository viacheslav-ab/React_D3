import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import LinearProgress from '@material-ui/core/LinearProgress';

const styles = theme => ({
    paper: {
        position: 'relative',
        width: theme.spacing.unit * 100,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing.unit * 4,
    },
});

class Progressbar extends Component {
    
    constructor(props) {
        super(props);
        this.defaultStyle = this.defaultStyle.bind(this);
    }

    defaultStyle() {
        const top = 50;
        const left = 50;

        return {
            top: `${top}%`,
            left: `${left}%`,
            transform: `translate(-${top}%, -${left}%)`,
        };
    }

    componentDidMount() {
        // console.log("Progressbar didmount");
    }

    componentDidUpdate() {
        // console.log("Progressbar didupdate");
    }
    
    render() {
        const { classes } = this.props;

        return (
            <div className={this.props.name}>
                <Modal
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                    open={this.props.open}
                    disableBackdropClick={true}
                    disableEscapeKeyDown={true}>

                    <div style={this.defaultStyle()} className={classes.paper}>
                        <Typography variant="title" id="simple-modal-title">
                            {this.props.status}
                        </Typography>
                        <Typography variant="subheading" id="simple-modal-description">
                            <LinearProgress variant="determinate" value={this.props.progress}>
                            </LinearProgress>
                        </Typography>
                    </div>
                </Modal>
            </div>
        );
    }
}

Progressbar.defaultProps = {
    name: "",
    width: 400,
    height: 100,
    progress: 0.0,
    status: "",
    open: false
};

Progressbar.propsType = {
    name:       PropTypes.string.isRequired,
    width:      PropTypes.number,
    height:     PropTypes.number,
    progress:   PropTypes.number,
    status:     PropTypes.string,
    open:       PropTypes.bool,
    classes:    PropTypes.object.isRequired
};


const ProgressbarWrapped = withStyles(styles)(Progressbar);
export default ProgressbarWrapped;
