
// Sends an XMLHttpRequest to the server, asking for data 
// The first argument should contain the URL on the server, with
// the query, and the second should be the name of the callback 
// function.  The callback gets one parameter, containing the 
// requested data.


function makeRequest(requestString, callbackFunction) {
    
    // first, make a request object
    var req = new XMLHttpRequest();
    
    // set up callback function
    // "onreadystatechange" method is called a bunch of times 
    // as the request makes its way out to the internet and back
    req.onreadystatechange = function() {
        if (req.readyState === XMLHttpRequest.DONE) {
            // the whole process is over
            if (req.status === 200) { // status 200 means all went well! 
                var resp = req.response;  // response shows up in the object
                callbackFunction(resp);     // call the callback function
            } else {
                console.log("Problem requesting data from server");
                console.log("Response code ",req.status);
            }
        }
    }

    var reqURL = "/query?"+requestString;
    req.open('GET', reqURL, true);  // load up the request string
    req.send(null);    // and send it off!
}

function Model(array, lowColor, highColor) {
    this.lowColor = lowColor;
    this.highColor = highColor;
    this.maxRatio = array[0];
    this.minRatio = this.maxRatio;
    this.ratios = [];
    for(var i = 0; i < array.length; i++) {
        var r = array[i];                           
        this.maxRatio = Math.max(this.maxRatio, r);  // update maxRatio
        this.minRatio = Math.min(this.minRatio, r);  // update minRatio
        this.ratios.push(r);                         // append to ratio list
    }
    
    this.colors = [];
    for(var i = 0; i < array.length; i++) {
        this.colors.push(this.calculateColor(i));   // for each ratio, calculate gradient color
    }
}

// converts this.ratios[index] to be a value between 0-1
Model.prototype.normalize = function(index) {
    return (this.ratios[index]-this.minRatio)/(this.maxRatio-this.minRatio);
}

// calculate gradient color for a given index
Model.prototype.calculateColor = function(index) {
    var norm = this.normalize(index);                // want high ratios to be gray, low ratios to be blue
    var resultColor = [0,0,0];
    for(var i = 0; i < this.lowColor.length; i++) {
        // interpolate between gray and blue
        resultColor[i] = Math.round( (this.highColor[i]-this.lowColor[i])*norm + this.lowColor[i] );
    }
    return this.colorToRGBString(resultColor);
}

Model.prototype.colorToRGBString = function(resultColor) {
    return "rgb("+resultColor.join(",")+")";
}

Model.prototype.gradientString = function() {
    return "linear-gradient(0deg,"+this.colorToRGBString(this.lowColor)+
                ","+this.colorToRGBString(this.highColor)+")";
}

function appendWords(bern,totalB){
    console.log(bern);
    var myB = totalB + Math.round(bern*158);
    var myH = 470 - myB;
    console.log(myB);
    console.log(myH);
    var theDiv = document.getElementById("rightSide");

    var content = document.createElement('p');
    var content2 = document.createElement('p');
    content.setAttribute("id", "add1");
    content2.setAttribute("id", "add2");
    content.textContent = "Hillary: "+ Math.round((1-bern)*100) + " Bernie: " + Math.round(bern*100);
    content2.textContent = "Hillary: "+ myH + " Bernie: " + myB;

    theDiv.appendChild(content);
    theDiv.appendChild(content2);
}


function removeWords(){
    var theDiv = document.getElementById("add1");
        var theDiv2 = document.getElementById("add2");

    if(theDiv)
        theDiv.remove();
    if(theDiv2)
        theDiv2.remove();
}

// Color the map and blocks based on the model
function drawModel(resp) {
    resp = JSON.parse(resp);
    console.log("This");
    console.log(resp);

    
    var bernieRatio = [];
    var totalHVotes = 0;
    var totalBVotes = 0;
    for(var i = 0; i < resp.length; i++) {
        var current = resp[i];
        var disTotal = current.hVotes+current.bVotes;
        bernieRatio.push(current.bVotes/disTotal);

        totalHVotes += current.hVotes;
        totalBVotes += current.bVotes;
    }

    var numberBernieDel = 0;
    for (var i = 0; i < 53; i++) {
        numberBernieDel += Math.round(districts[i]*bernieRatio[i]);
    }

    
    // create the color gradient
    var m = new Model(bernieRatio, [255,0,0], [0,0,255]);
        
    var boxList = d3.selectAll(".delegateBox");
    boxList.style("background-color", "red");
    
    var topBars = d3.selectAll(".topbar")
    topBars.style("height", function(d, i){ 
            var numBernieDelegates = Math.round(districts[i]*bernieRatio[i]);
            return numBernieDelegates*5+"px";})
    
    var landTitles = d3.selectAll("path.land title");
    landTitles.text(function(d, i) {return d.id});
    
    var paths = d3.selectAll("path.land");
    paths.style("fill", function(d){return m.colors[d.id-1]});
    
    var stateDelegates = d3.selectAll(".stateBox");
    var percentBernieVotes = totalBVotes/(totalHVotes+totalBVotes);
    removeWords();
    appendWords(percentBernieVotes,numberBernieDel);


    total = Math.round(percentBernieVotes*stateWide.length);
    stateDelegates.style("background-color", 
        function(d, i){
            if(i<total)
                return"rgb(0,0,255)" ;
            else 
                return "rgb(255,0,0)";})
            
    updateScale(m);
}



