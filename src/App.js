/*

next steps

the script

say, "good morning". nothing gets parsed.
upload image
please show the image
please set the width to 500
Since we are all using chrome, please display the image in webp format
that doesn't look right. please auto-contrast and auto-sharpen
it should be centered. please make it square and center the dress
please overlay acme_logo at the south-west corner



TODOS:

* //button to upload an image. use filename as the image name.
* //figure out the pad crop with auto action. it should center the image on the point of interest
* //make it remember the previously set commands
* find a demo image that works. like the dress
* upload an acme logo at a small size, so we don't have to specify the scale
* move the parser service into a block
 */
import React, { Component } from 'react';
import './App.css';
import ImageService from "./ImageService";
import ParserService from './ParserService';
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages:[],
            currentText:"please overlay acme_logo at the south-west corner"
        };

        ImageService.init();
        ImageService.onMessage((msg, messages) => {
            this.setState({
                messages:messages
            });
            this.scrollDown();
        });
        this.ctx = {};
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
        ImageService.send(this.state.currentText);
        this.setState({currentText:""});
    }
    scrollDown() {
        //document.getElementById('scroll');
    }

    renderHistory() {
        var items = this.state.messages.map((msg,i)=>{
            var items = [];
            items.push(msg.originalText);
            if(msg.cloudinaryURL) {
                items.push(<img key='img' src={msg.cloudinaryURL}/>);
            }
            return <li key={i}>message: {items}</li>
        });
        return <ul>{items}</ul>;
    }
    render() {
        return (
            <div className="vbox fill">
                <div className="scroll grow" id="scroll">
                    {this.renderHistory()}
                </div>
                <div className="hbox">
                    <input ref='text' type="text" className="grow"
                           value={this.state.currentText} onChange={this.textEdit.bind(this)}
                           onKeyDown={this.textKeydown.bind(this)}
                    />
                    <button onClick={this.sendMessage.bind(this)}>send</button>
                    <button onClick={this.showUploader.bind(this)}>Upload Image</button>
                </div>
            </div>
        );
    }

    showUploader() {
        var cloudinary = window.cloudinary;
        cloudinary.openUploadWidget({ cloud_name: 'pubnub', upload_preset: 'mcipauzl'},
            (error, result) => {
                console.log(error, result);
                console.log("the upload path is", result[0].path);
                ImageService.setImagePath(result[0].path);
            });
    }
}

export default App;
