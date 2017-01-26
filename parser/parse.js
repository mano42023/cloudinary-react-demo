/**
 * Created by josh on 1/4/17.
 */

var assert = require('assert');

var ParserService = require('../src/ParserService');

function test(text, expected) {
    var result = ParserService.parse(text);
    console.log(result);
    assert.deepEqual(expected,result);
}

/*
Please upload library fall-collection-pics
Please display images in WebP format
Please resize to 1024 wide
Please auto-contrast and auto-sharpen.
please set gravity to auto and pad crop mode with black and crop
Please overlay ACME-30x60-logo at south_west corner


next step: turn an action into a URL

 let apiUrl = 'http://res.cloudinary.com/' +
 cloudName + '/' + resource + '/' + operation + '/';
 if(transformations && transformations.length > 0) {
 apiUrl += transformations.join(',') + '/';
 }
 apiUrl += fileName;

 request.message.cloudinaryLink = apiUrl;
 console.log("request = ", request);

 */

function testParser() {

//should not return any action
    test("hello, how are you doing",false);
    test("Please upload library fall-collection-pics",{
        action:'upload',
        target:'fall-collection-pics',
    });
    test("Please display images in WebP format", {
        action:"format",
        format:"webp"
    });
    test("Please resize to 1024 wide", {
        action:'resize',
        size:1024,
        axis:'width'
    });
    test("Please auto-contrast and auto-sharpen", {
        action:"compound",
        actions:[
            {
                action:'autoContrast'
            },
            {
                action:"autoSharpen"
            }
        ]
    });
    test("please set gravity to auto and pad crop mode with black and crop", {
        action:"compound",
        actions:[
            {
                action:"setGravity",
                value:"auto"
            },
            {
                action:"pad",
                values:['black','crop']
            }
        ]
    });
    test("Please overlay ACME-30x60-logo at south_west corner",{
        action:'overlay',
        target:'ACME-30x60-logo',
        direction:'south_west'
    });
}

function testAction(action, expected) {
    var result = ParserService.actionToURL(action);
    console.log(result);
    assert.deepEqual(expected,result);
}


function testActions() {
    testAction({action:'format',format:'webp'},
        "http://res.cloudinary.com/pubnub/image/upload/sample.webp");
    testAction({action:'resize',size:150, axis:'width'},
        "http://res.cloudinary.com/pubnub/image/upload/w_150/sample.jpg");
    testAction({action:"compound", actions:[{action:'autoContrast'},{action:'autoSharpen'}]},
        "http://res.cloudinary.com/pubnub/image/upload/e_auto_contrast/e_sharpen/sample.jpg");
    testAction(    {
            action:"pad",
            gravity:"auto",
            color:'black'
        }
        ,"http://res.cloudinary.com/pubnub/image/upload/w_200,h_300,c_fill,g_auto/sample.jpg");


    testAction({
        action:'overlay',
        target:'ACME-30x60-logo',
        direction:'south_west'
    },
        "http://res.cloudinary.com/pubnub/image/upload/l_sample,w_0.2,g_south_west/sample.jpg");
}



testParser();
testActions();