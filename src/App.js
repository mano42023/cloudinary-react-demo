import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ImageService from "./ImageService";
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages:[],
            currentText:""
        };

        ImageService.init();
        ImageService.onMessage((msg, messages) => {
            this.setState({
                messages:messages
            })
        });
    }
    textEdit() {
        this.setState({currentText:this.refs.text.value});
    }
    sendMessage() {
        ImageService.send(this.state.currentText);
        this.setState({currentText:""});
    }

    renderHistory() {
        var items = this.state.messages.map((msg,i)=>{
            var items = [];
            if(msg.cloudinaryLink) {
                items.push(<img key='img' src={msg.cloudinaryLink}/>);
            }
            return <li key={i}>message: {items}</li>
        });
        return <ul>{items}</ul>;
    }
    render() {
        return (
            <div className="vbox fill">
                <div className="scroll grow">
                    {this.renderHistory()}
                </div>
                <div className="hbox">
                    <input ref='text' type="text" className="grow"
                           value={this.state.currentText} onChange={this.textEdit.bind(this)}/>
                    <button onClick={this.sendMessage.bind(this)}>send</button>
                </div>
            </div>
        );
    }
}

export default App;
