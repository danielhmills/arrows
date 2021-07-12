function sparql(model) {
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
        p = render(props(node)).split(",")
        let pr = render(props(node))

        statements.push(":" + node.caption().replace(/ /g,"_")  + " rdfs:label " + '"' + node.caption() + '"')

    });

    model.nodeList().forEach(function (node) {
        let s = []
        let pr = render(props(node))
        let prs = pr.split(",")
        let l = pr.length

        prs.forEach((x,index) =>{
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
            
            statements.push(
                ":" + quote(rel.relationshipType()).replace(/ /g,"_") + 
                " :" + x.replace(/:.*/g,"")+
                " \""  + x.replace(/.*\:/g,"").replace(/\'/g,"") + "\""
            )        
        })
    });
    model.relationshipList().forEach(function (rel) {
        //Create Triples about Properties
        pa = []
        p = render(props(rel))
        statements.push(
            ":" + quote(rel.relationshipType()) +
            " rdf:type rdf:Property.\n" +
            "\n:" + quote(rel.relationshipType()) + 
            " rdfs:label \"" + quote(rel.relationshipType()) + '"' 
            );
    });
    if (statements.length==0) return "";
    let uniqueStatements = Array .from(new Set(statements))
    uniqueStatements.sort();
    //uniqueStatements.unshift("PREFIX: <#>")
    return "PREFIX : <#>\nPREFIX ex: <http://example.com#>\nPREFIX rdf: <http://www.w3.org/2000/01/rdf-schema#>\nPREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\n INSERT INTO GRAPH <urn:arrows-ttl>\n\n { " +  uniqueStatements.join(".\n\n") + "\n }";
};
if (typeof exports != "undefined") exports.sparql=sparql
gd.sparql=function(model) {return sparql(model || this.model());}