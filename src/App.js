import React, { Component } from 'react';
import Ooc from './ooc_plugin/ooc';

class App extends Component {
    render() {
        return (
            <div className={"ooctest"}>
                <Ooc name={"ooc"}>
                </Ooc>
            </div>
        )
    }
}

export default App;