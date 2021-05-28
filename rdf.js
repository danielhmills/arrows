function rdf(model) {
    function props(element) {
        var props = {};
        element.properties().list().forEach(function (property) {
            props[property.key] = property.value;
        });
        return props;
    }

    function isIdentifier(name) {
        return /^[_a-zA-Z]\w*$/.test(name);
    }

    function quote(name) {
        return isIdentifier(name) ? name : "`" + name + "`";
    }

    function render(props) {
        var res = "";
        for (var key in props) {
            if (res.length > 0) res += ",";
            if (props.hasOwnProperty(key)) {
                res += quote(key) + ":";
                var value = props[key];
                res += typeof value == "string" && value[0] != "'" && value[0] != '"' ? "'" + value + "'" : value;
            }
        }
        return res;
    }

    var statements = [];
    model.nodeList().forEach(function (node,index) {
        //Create Triples
        p = render(props(node)).split(",")
        let pr = render(props(node))
        //console.log(p)

        statements.push(":" + node.caption().replace(/ /g,"_")  + " rdfs:label " + '"' + node.caption() + '"')
        //console.log(node.caption())

    });

    model.nodeList().forEach(function (node) {
        let s = []
        let pr = render(props(node))
        let prs = pr.split(",")
        //console.log(prs)
        let l = pr.length

        prs.forEach((x,index) =>{
            //if(x.replace(/:.*/,"") == "domain")
            //    //s.push(render(pr).replace(/\'/g,'"').replace(/\:/," ").toString().split(','))
            //    statements.push(":" + node.caption()  + " rdfs:domain " + ":" + pr.replace(/.*:/,"").replace(/\'/g,""))
            //if(x.replace(/:.*/,"") == "range")
            //    //s.push(render(pr).replace(/\'/g,'"').replace(/\:/," ").toString().split(','))
            //    statements.push(":" + node.caption()  + " rdfs:range " + ":" + pr.replace(/.*:/,"").replace(/\'/g,""))
            //if(x.replace(/:.*/,"") == "type" || x.replace(/:.*/,"") == "a")
            //    //s.push(render(pr).replace(/\'/g,'"').replace(/\:/," ").toString().split(','))
            //    statements.push(":" + node.caption()  + " a " + ":" + pr.replace(/.*:/,"").replace(/\'/g,""))  
            if(x && x.length > 1){
                console.log(prs[index].replace(/:.*/,"").replace(/\'/g,""))
                typeCheck = prs[index].replace(/:.*/,"").replace(/\'/g,"")
                //console.log(typeCheck)

                if(typeCheck == "type"){
                    
                    statements.push(":" + node.caption().replace(/ /g,"_")  + " rdf:type " + ":" + prs[index].replace(/.*:/,"").replace(/\'/g,""))
                }
                else{

                    //s.push(render(pr).replace(/\'/g,'"').replace(/\:/," ").toString().split(','))
                    statements.push(":" + node.caption().replace(/ /g,"_")  + " " + ":" + x.replace(/\:/g," ").replace(/',/g,"';\n   :").replace(/\'/g,'"'))    
                }         
            }
            
        })
        

    });
    model.relationshipList().forEach(function (rel,index) {
        p = render(props(rel)).split(",")
        //pt=(p.replace(/:.*/,""))
        //console.log(p)
        //console.log(render(props(rel)))
        //console.log(rel)
        statements.push(
            ":" + rel.start.caption().replace(/ /g,"_") +
            " :" + quote(rel.relationshipType()) +
            //render(props(rel)) +
            " :" + rel.end.caption().replace(/ /g,"_")
        );
        p.forEach(x =>{
            if(x.includes("domain"))
            statements.push(
            ":" + quote(rel.relationshipType()).replace(/ /g,"_") + 
            " " + "rdfs:domain "
            + ":" +x.replace(/\'/g,"").replace(/.*:/g,"")
            )
            if(x.includes("range"))
                statements.push(
                ":" + quote(rel.relationshipType()).replace(/ /g,"_") + 
                " " + "rdfs:range "
                + ":" + x.replace(/\'/g,"").replace(/.*:/g,"")
            )
            
            if(!x.includes("domain") && !x.includes("range") && !(x.replace(/.*:/,"").charAt(0) == '"') && (x.length > 0) )
                statements.push(
                    ":" + quote(rel.relationshipType()).replace(/ /g,"_") + 
                    " :" + x.replace(/:.*/g,"")
                    +" :" + x.replace(/\'/g,"").replace(/.*:/g,"")
                )
            if((!x.includes("domain") && !x.includes("range")) && (x.replace(/.*:/,"").charAt(0) == '"') && (x.length > 0))
            statements.push(
                ":" + quote(rel.relationshipType()).replace(/ /g,"_") + 
                " :" + x.replace(/:.*/g,"")+
                " "  + x.replace(/.*\:/g,"").replace(/\'/g,"")
            )
            
        
        })
        //console.log(statements)
    });
    model.relationshipList().forEach(function (rel) {
        //Create Triples about Properties
        pa = []
        p = render(props(rel))
        //console.log(render(props(rel)))
        statements.push(
            ":" + quote(rel.relationshipType()) +
            " rdf:type rdf:Property;\n rdfs:label \"" + quote(rel.relationshipType()) + '"' 
            );
    });
    if (statements.length==0) return "";
    let uniqueStatements = Array .from(new Set(statements))
    uniqueStatements.sort();
    //uniqueStatements.unshift("@prefix: <#>")
    return "@prefix: <#>.\n@prefix : <http://example.com#>.\n@prefix rdf: <http://www.w3.org/2000/01/rdf-schema#>.\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.\n\n" + uniqueStatements.join(".\n") + ".";
};
if (typeof exports != "undefined") exports.rdf=rdf
gd.rdf=function(model) {return rdf(model || this.model());}