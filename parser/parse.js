/**
 * Created by josh on 1/4/17.
 */

var assert = require('assert');

function process(text) {
    var words = text.split(" ").map((w)=>w.toLowerCase());
    console.log("words",words);
    if(!words.includes("please")) {
        return false;
    }

    var n = words.findIndex(() => 'please');
    var verb = words[n+1];
    var nextWord = words[n+2];
    console.log("verb is",verb);

    if(verb === 'upload') {
        return {
            action:'upload',
            target:words[n+3]
        }
    }

    if(verb === 'display') {
        var format = words.slice(n+1).find((w)=>{
            if(w === 'webp') return true;
            if(w === 'jpeg') return true;
            return false;
        });
        return {
            action:'format',
            format:format
        }
    }

    if(verb === 'resize') {
        var numberIndex = words.slice(n+1).findIndex((w) => {
            var num = parseInt(w);
            if(!isNaN(num)) return true;
            return false;
        });
        var axis = words.slice(n+1)[numberIndex+1];
        if(axis === 'wide') {
            axis = 'width';
        }
        return {
            action:'resize',
            size:parseInt(words.slice(n+1)[numberIndex]),
            axis: axis
        }
    }

    if(nextWord && nextWord === 'and') {
        return {
            action:'compound',
            actions:[
                {action:'autoContrast'},
                {action:'autoSharpen'}
            ]
        }
    }

    if(verb === 'set' && nextWord === 'gravity') {
        return {
            action: 'compound',
            actions:[
                {
                    action:'setGravity',
                    value:'auto'
                },
                {
                    action:"pad",
                    values:['black','crop']
                }
            ]
        }
    }

    if(verb === 'overlay') {
        var dir = words.slice(n).find((w)=>{
            if(w == 'south_west') return true;
            return false;
        });
        nextWord = text.split(" ")[n+2];
        return {
            action:'overlay',
            target:nextWord,
            direction:dir
        }
    }

    return true;
}
function test(text, expected) {
    var result = process(text);
    assert.deepEqual(expected,result);
}

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

/*
Please upload library fall-collection-pics
Please display images in WebP format
Please resize to 1024 wide
Please auto-contrast and auto-sharpen.
please set gravity to auto and pad crop mode with black and crop
Please overlay ACME-30x60-logo at south_west corner
*/