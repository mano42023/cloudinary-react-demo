var service = {
    parse: function(text) {
        console.log("parsing",text);

        var words = text.split(" ")
            .map((w)=>w.toLowerCase())
            .filter((w)=>{
                if(w === 'the') return false;
                if(w === 'it') return false;
                if(w === 'to') return false;
                return true;
            });
        console.log("words",words);
        if(!words.includes("please")) return false;

        var n = words.findIndex((w) => w === 'please');
        var verb = words[n+1];
        var nextWord = words[n+2];
        console.log("verb = ", n,verb, nextWord);

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
                if(w === 'jpg') return true;
                return false;
            });
            return {
                action:'format',
                format:format
            }
        }
        if(verb === 'show') {
            return {
                action:'show'
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

        if(verb === 'reset') {
            return {
                action:'reset'
            }
        }

        if(verb === 'make' && nextWord === 'square') {
            console.log("squaring it");
            if(words[n+3] === 'and' && words[n+4] === 'center') {
                console.log("centering too");
                return {
                    action: "crop",
                    gravity:'auto',
                    shape:'square'
                }
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

        if(verb === 'set' && nextWord === 'width') {
            return {
                action: 'resize',
                size:parseInt(words[n+3]),
                axis:'width'
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
            console.log("scanning words",words);
            var dir = words.slice(n).find((w)=>{
                var ww = w.replace("_","").replace("-","");
                if(ww == 'southwest') return true;
                if(ww == 'south_west') return true;
                if(ww == 'south-west') return true;
                return false;
            });
            return {
                action:'overlay',
                target:nextWord,
                direction:dir.replace("_","").replace("-","")
            }
        }


        return {
            action:'error',
            message:'command not recognized'
        };
    },
    actionToURL:function(command, context) {
        console.log("analyzing action",command,context);
        var cloudName = "pubnub";
        var resource = "image";
        var operation = "upload";
        var transforms = [];

        //adjust the context
        if(command.action === 'show') {
        }
        if(command.action === 'format') {
            context.format = command.format;
        }
        if(command.action === 'reset') {
            context = {};
        }
        if(command.action === 'resize') {
            context.width = command.size;
        }
        if(command.action === 'compound') {
            command.actions.forEach((cmd)=>{
                if(cmd.action === 'autoContrast') context.autoContrast = true;
                if(cmd.action === 'autoSharpen') context.autoSharpen = true;
            });
        }
        //if(command.action === "pad") {
        //    transforms.push("w_200,h_300,c_fill,"+"g_"+command.gravity);
        //}
        if(command.action === 'crop') {
            context.crop = true;
            context.shape = 'square';
            context.gravity = command.gravity;
            //transforms.push("w_200,h_200,c_fill,g_"+command.gravity);
        }

        if(command.action === 'overlay') {
            console.log("doing an overlay");
            var fname = command.target;
            fname = "sample";
            var scale = 1.0;
            scale = 0.2;
            var grav = command.direction;
            if(command.direction === 'southwest') {
                grav = 'south_west';
            }
            transforms.push("l_"+fname+",w_"+scale+",g_"+grav);
        }


        //apply the context
        if(!context.format) context.format = 'jpg';
        if(context.width) {
            transforms.push("w_"+context.width);
        }
        if(context.autoContrast) transforms.push("e_auto_contrast");
        if(context.autoSharpen) transforms.push("e_sharpen");
        if(context.crop) {
            transforms.push("w_"+context.width+",h_"+context.width
                +",c_fill,g_"+context.gravity);
        }

        console.log("final context is",context);


        //generate the final url
        var apiUrl = 'http://res.cloudinary.com/' +
            cloudName + '/' + resource + '/' + operation + '/';
        if(transforms.length > 0) {
            apiUrl += transforms.join("/") + "/"
        }
        var filename = context.path.substring(0,context.path.lastIndexOf('.'));
        apiUrl += filename  + '.' + context.format;
        return apiUrl;
    }
};

module.exports = service;
