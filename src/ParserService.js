var service = {
    parse: function(text) {
        console.log("parsing",text);

        var words = text.split(" ").map((w)=>w.toLowerCase());
        console.log("words",words);
        if(!words.includes("please")) return false;


        var n = words.findIndex(() => 'please');
        var verb = words[n+1];
        var nextWord = words[n+2];

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

    },
    actionToURL:function(command) {
        console.log("analyzing action",command);
        var cloudName = "pubnub";
        var resource = "image";
        var operation = "upload";
        var filename = "sample";
        var format = "jpg";
        var transforms = [];

        if(command.action === 'format') {
            format = command.format;
        }
        if(command.action === 'resize') {
            transforms.push("w_"+command.size);
        }
        if(command.action === 'compound') {
            command.actions.forEach((cmd)=>{
                if(cmd.action === 'autoContrast') transforms.push("e_auto_contrast");
                if(cmd.action === 'autoSharpen') transforms.push("e_sharpen");
            });
        }
        if(command.action === "pad") {
            transforms.push("w_200,h_300,c_fill,"+"g_"+command.gravity);
        }
        if(command.action === 'overlay') {
            console.log("doing an overlay");
            var fname = command.target;
            fname = "sample";
            var scale = 1.0;
            scale = 0.2;
            var grav = command.direction;
            transforms.push("l_"+fname+",w_"+scale+",g_"+grav);
        }

        let apiUrl = 'http://res.cloudinary.com/' +
            cloudName + '/' + resource + '/' + operation + '/';
        if(transforms.length > 0) {
            apiUrl += transforms.join("/") + "/"
        }
        apiUrl += filename  + '.' + format;
        return apiUrl;
    }
};

module.exports = service;