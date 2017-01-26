import React, { Component } from 'react';
import './App.css';
import ImageService from "./ImageService";
import ParserService from './ParserService';
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
    textKeydown(e) {
        if(e.keyCode === 13) {
            this.sendMessage();
        }
    }
    sendMessage() {
        console.log("-------------");
        var text = this.state.currentText;
        var action = ParserService.parse(text);
        console.log("using the action",action);
        var payload = {
            text:text
        };
        if(action !== false) {
            var url = ParserService.actionToURL(action);
            console.log("got the url",url);
            payload.cloudinaryLink = url;
        }
        //ImageService.send(this.state.currentText);
        setTimeout(()=>{
            this.setState({
                messages:[payload]
            })
        },500);
        this.setState({currentText:""});
    }

    renderHistory() {
        var items = this.state.messages.map((msg,i)=>{
            var items = [];
            items.push(msg.text);
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
                           value={this.state.currentText} onChange={this.textEdit.bind(this)}
                           onKeyDown={this.textKeydown.bind(this)}
                    />
                    <button onClick={this.sendMessage.bind(this)}>send</button>
                </div>
            </div>
        );
    }
}

export default App;
