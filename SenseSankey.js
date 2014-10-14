requirejs.config({
  shim : {
    "extensions/SenseSankey/sankeymore" : {
      "deps" : ["extensions/SenseSankey/d3.min"]
    }
  }
});

define(["jquery", "text!./style.css","extensions/SenseSankey/sankeymore"], function($, cssContent) {
	'use strict';
	$( "<style>" ).html( cssContent ).appendTo( "head" );
	return {
		initialProperties: {
			version: 1.0,
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 10,
					qHeight: 50
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 1,
					max: 1
				},
				measures: {
					uses: "measures",
					min: 1,
					max: 1
				},
				sorting: {
					uses: "sorting"
				},
				settings: {
					uses: "settings"
				}
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},

		paint: function ( $element, layout ) {
			console.info("Paint NOW");
	      var _this = this;
	      var qData = layout.qHyperCube.qDataPages[0];
	      var divName = layout.qInfo.qId;
	      var qMatrix = qData.qMatrix;
	      var source = qMatrix.map(function(d) {
	        return {
	          "Path":d[0].qText,
	          "Frequency":d[1].qNum
	        }
	       });
	      var id = "sk_"+ layout.qInfo.qId;

	       if (document.getElementById(id)) {
             $("#" + id).empty();
	       }
	       else {
	        $element.append($('<div />').attr("id", id));        
	       }
		  $("#" + id).width($element.width()).height($element.height());
	      var sLinks = [];
	      var output = [];
	      var endArr = [];
	      var colormap = ["#FFCC99","#3399FF","#FFCC33","#99CC00","#33CCFF","#CCFF33","#CCFF33","white"]
	      var catArray = [];
	      var path = source.Path;

	      //********Creates Duplicate IDs*************
	      //		$element.attr("id",id)
          //******************************************
	      var td = _this.Data;
	      var sNodes = [];
	      var jNodes = [];
	      var rev = 0; //row[1].text.toString();
	      
	      //source foreach
	    source.forEach(function(d) {
	      var row = d;
	      var path = d.Path;
	      var val = parseFloat(d.Frequency);
	      if(val > 0) {
	      var tArr = path.split(",");  
	      /*
	      console.log("d");
	      console.log(d);
	      console.log("path");
	      console.log(path);
	      console.log(path.length);
	      console.log("tArr");
		  console.log(tArr);
		  console.log("sNodes");
		  console.log(sNodes);
		  console.log(tArr.length);
		  */
	      if (rev == "1") {
	        tArr.reverse();
	      } 	 	
	      if (tArr.length > 1) {
	      	$.each(tArr, function(i) {
					//tArr[i] = this.toString().trim() + "~" + i;
					if(tArr.length === (i + 1)){
						tArr[i] = this.toString().trim() + "~end";
					}else{
						tArr[i] = this.toString().trim() + "~" + i;	
					}
					/*var newThis = this.toString() + i;
					 if(countInArray(tArr,newThis) > 1){
					 tArr = searchAndChange(newThis, tArr, countInArray(tArr,newThis));
					 }*/
				});
				$.each(tArr, function(i) {
					if ($.inArray(this.toString().trim(), sNodes) === -1) {
						sNodes.push(this.toString().trim());
					}
				});
	   		}
	   		}
			});

	       sNodes.forEach(function(d) {
					jNodes.push({
					"name" : d.toString()
					})
			});
	  
		  //source foreach
	    source.forEach(function(d) {
	      var row = d;
	      var path = d.Path
	      var val = parseFloat(d.Frequency);
	      if(val > 0) {
	      var tArr = path.split(",");  
	      /*console.log("d");
	      console.log(d);
	      console.log("path");
	      console.log(path);
	      console.log(path.length);
	      console.log("tArr");
		  console.log(tArr);
		  console.log("sNodes");
		  console.log(sNodes);
		  console.log(tArr.length);
		  */
	      if (rev == "1") {
	        tArr.reverse();
	      } 	 	
	      if (tArr.length > 1) {
	      	$.each(tArr, function(i) {
					/*if(tArr.length === (i + 1)){
						var cur = this;
						if(endArr.length > 0){
							$.each(endArr,function(){
								var trimmed = this.substring(0,this.indexOf("~"));
								if(cur == trimmed){

								}
							});
						}else{
							endArr.push(cur.toString().trim() + "~" + i);
						}
					}*/
					if(tArr.length === (i + 1)){
						tArr[i] = this.toString().trim() + "~end";
					}else{
						tArr[i] = this.toString().trim() + "~" + i;	
					}
					
					/*var newThis = this.toString() + i;
					 if(countInArray(tArr,newThis) > 1){
					 tArr = searchAndChange(newThis, tArr, countInArray(tArr,newThis));
					 }*/
				});
	        
	        $.each(tArr, function(i) {
					var tFlag = "no";
					if ((i + 1) != tArr.length) {
						////console.info(this.toString().trim() + " to " + tArr[i + 1]);
						var cS = $.inArray(this.toString().trim(), sNodes);
						var cT = $.inArray(tArr[i + 1].toString().trim(), sNodes);

						//////console.info(cT + " " + cS);
						$.each(sLinks, function(i, v) {
							if ((v.source === cS) && (v.target === cT)) {
								////console.info(this);
								tFlag = "yes";
								v.value = v.value + val;

							}
						});
						if (tFlag == "no") {
							sLinks.push({
								"source" : cS,
								"target" : cT,
								"value" : val
							});
						}

					}
				});

			}
		}
	    });
		//console.log("tArr");
		//console.log(tArr);
		//console.log("jNodes");
 		//console.log(jNodes);
		//console.log("sNodes");
		//console.log(sNodes);
		//console.log("sLinks");
		//console.log(sLinks);



	  var margin = {
	      top : 1,
	      right : 1,
	      bottom : 6,
	      left : 1
	    }, width = $element.width(), height = $element.height();

	    var formatNumber = d3.format(",.0f"), format = function(d) {
	      return formatNumber(d) + " TWh";
	    }, color = d3.scale.category20();

	    var svg = d3.select("#sk_" + divName).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	   //console.log(divName);
	    var sankey = d3.sankey().nodeWidth(15).nodePadding(10).size([width, height]);

	    var path = sankey.link();
	    //console.log(path)

	    sankey.nodes(jNodes).links(sLinks).layout(32);
	    var link = svg.append("g").selectAll(".link").data(sLinks).enter().append("path").attr("class", "link").attr("d", path).style("stroke-width", function(d) {
	      return Math.max(1, d.dy);
	    }).sort(function(a, b) {
	      return b.dy - a.dy;
	    });

	    link.append("title").text(function(d) {
	      return d.value;
	    });

	    var node = svg.append("g").selectAll(".node").data(jNodes).enter().append("g").attr("class", "node").attr("transform", function(d) {
	      return "translate(" + d.x + "," + d.y + ")";
	    }).call(d3.behavior.drag().origin(function(d) {
	      return d;
	    }).on("dragstart", function() {
	      this.parentNode.appendChild(this);
	    }).on("drag", dragmove));
	   //console.info("node definition");
	    //console.log(node);

	    node.append("rect").attr("height", function(d) {
	      return d.dy;
	    }).attr("width", sankey.nodeWidth()).style("fill", function(d) {
	      return d.color = color(d.name.substring(0, d.name.indexOf("~")).replace(/ .*/, ""));
	    }).style("stroke", function(d) {
	      return d3.rgb(d.color).darker(2);
	    }).append("title").text(function(d) {
	      return d.value;
	    });

	    node.append("text").attr("class", "nodeTitle").attr("x", -6).attr("y", function(d) {
	      //console.log(d)
	      return d.dy / 2;
	    }).attr("dy", ".35em").attr("text-anchor", "end").attr("transform", null).text(function(d) {
	      var str = d.name.substring(0, d.name.indexOf("~"));
	      //console.log(str);
	      return str;
	    }).filter(function(d) {
	      return d.x < width / 2;
	    }).attr("x", 6 + sankey.nodeWidth()).attr("text-anchor", "start");
	    

	    

	    function dragmove(d) {
	      d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
	      sankey.relayout();
	      link.attr("d", path);
	    }
	
		//console.log("JRP_PAINT");
	   },
      //resize:function($el,layout){
      		//this.paint($el,layout);
       // }
        
    };
    
	//meat -full closure
} );
