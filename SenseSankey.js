requirejs.config({
  shim : {
    "extensions/SenseSankey/sankeymore" : {
      "deps" : ["extensions/SenseSankey/d3.min"]
    }
  }
});
//define(["jquery", "text!./style.css","extensions/SenseSankey/sankeymore"], function($, cssContent) {
define(["jquery", "text!./style.css","core.utils/theme","extensions/SenseSankey/sankeymore"], function($, cssContent, Theme) {
	'use strict';
	$( "<style>" ).html( cssContent ).appendTo( "head" );
	return {
		initialProperties: {
			version: 1.2,
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 5,
					qHeight: 2000
				}]
			},
			selectionMode: "QUICK"
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 2,
					max: 4				},
				measures: {
					uses: "measures",
					min: 1,
					max: 1
				},
				//sorting: {
				//	uses: "sorting"
				//},
				settings: {
					uses: "settings",
					type: "items",
					items : {
							SankeyGroup:{
							label : "Sankey Settings",
							type:"items",
							items : {
							flowMax:{
								type: "integer",
								label: "Flow max",
								ref: "flowMax",
								defaultValue: 500
								},	
							flowColor:{
								type: "string",
								component: "color-picker",
								expression: "optional",
								label: "Color Flow",
								ref: "flowColor",
								defaultValue: 2
								},
								
							flowColorCustom:{
								type: "string",
								label: "Custom Hex Color for Flow",
								ref: "flowColorCustom",
								defaultValue: "#999999"
							    },
								
							Separateur:{
								ref: "displaySeparateur",
								type: "string",
								component: "dropdown",
								label: "Pop-up Separator",
								options:
								[
									{
									value:" - ",
									label:"-"
									},
									{
									value:" <-> ",
									label:"<->"
									},
									{
									value: " → ",
									label: " → "
									},
								],
								defaultValue: " - "
							},
							Format:{
								ref: "displayFormat",
								type: "string",
								component: "dropdown",
								label: "Pop-up Format",
								options: 
								[ 
									{
									value: "Number2",
									label: "1000.12"
									},
									{
									value: "Number1",
									label: "1000.1"
									},
									{
									value: "Number",
									label: "1000"
									},
									{
									value: "Money2",
									label: "1000.12 €"
									},
									{
									value: "Money1",
									label: "1000.1 €"
									},
									{
									value: "Money",
									label: "1000 €"
									},
								],
									defaultValue: "Number"
									},
									
							Palette:{
								ref:"displayPalette",
								type:"string",
								component: "dropdown",
								label : "Palette",
								options:
								[
									{
									value: "10",
									label: "Palette 10 colors"
									},
									{
									value: "20",
									label: "Palette 20 colors"
									},
									{
									value: "20b",
									label: "Autumn Palette 20 colors"
									},
									{
									value: "20c",
									label: "Pastel Palette 20 colors"
									},
								],
									defaultValue: "10"
									}
							}
						}
						
					}
				}
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},

		paint: function ( $element, layout ) {
			
		// Fonction format pop-up		
		function formatMoney(n, c, d, t, m, l){
			var c = isNaN(c = Math.abs(c)) ? 2 : c, 
				d = d == undefined ? "." : d, 
				t = t == undefined ? "," : t, 
				s = n < 0 ? "-" : "", 
				i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
				j = (j = i.length) > 3 ? j % 3 : 0;
			   return l + ' \n ' + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "")+ m;
			 };
			
		  
		  var _this = this;
		  var maxHeight = layout.flowMax;
		  var displayFormat = layout.displayFormat;
		  var displaySeparateur = layout.displaySeparateur;
		  var displayPalette = layout.displayPalette;
		  
		  var flowColor = (typeof layout.flowColorCustom !== 'undefined' && layout.flowColorCustom !=='') ? layout.flowColorCustom : Theme.palette[layout.flowColor];
		  
	      var qData = layout.qHyperCube.qDataPages[0];
		  // create a new array that contains the dimension labels
		  var qDim  = layout.qHyperCube.qDimensionInfo.map(function(d) {
				return d.qFallbackTitle;
			});
		  
		  
	      var divName = layout.qInfo.qId;
	      var qMatrix = qData.qMatrix;
		  var source = qMatrix.map(function(d) {
			  
			var path = ""; 
			var sep = ""; 
			for (var i = 0; i < d.length - 1; i++) {
			  path += sep + (d[i].qText.replace('|', ' ')) + '|' + (d[i].qElemNumber); 
			  sep = ",";
			}
			    
	        return {
	          //"Path":d[0].qText,
			  "Path": path,
	          "Frequency": d[d.length - 1].qNum
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
	      //var output = [];
	      var endArr = [];
	      var catArray = [];
	    
	      //********Creates Duplicate IDs*************
	      //		$element.attr("id",id)
          //******************************************
	      //var td = _this.Data;
	      var sNodes = [];
	      var jNodes = [];
	      var rev = 0; //permet de pivoter les dimensions
		  
		 
	      source=source.slice(0,maxHeight);
	      //source foreach
	    source.forEach(function(d) {
	      //var row = d;
	      var path = d.Path;
	      var val = parseFloat(d.Frequency);
	      if(val > 0) {
			var tArr = path.split(",",4);  
	        if (rev == "1") {
				tArr.reverse();
			} 	 	
			if (tArr.length > 1) {
				$.each(tArr, function(i) {
					
				if(tArr.length === (i + 1)){
					tArr[i] = this.toString().trim() + "~end";
				}else{
					tArr[i] = this.toString().trim() + "~" + i;	
				}
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
						name: d.toString()
					})
			});
	  
		  //source foreach
		source.forEach(function(d) {
	      //var row = d;
	      var path = d.Path
	      var val = parseFloat(d.Frequency);
	      if(val > 0) {
	      var tArr = path.split(",");  
	  
	      if (rev == "1") {
	        tArr.reverse();
	      } 	 	
	      if (tArr.length > 1) {
	      	$.each(tArr, function(i) {
					
					if(tArr.length === (i + 1)){
						tArr[i] = this.toString().trim() + "~end";
					}else{
						tArr[i] = this.toString().trim() + "~" + i;	
					}
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
	
	  
	  var margin = {
	      top : 1,
	      right : 1,
	      bottom : 0,
	      left : 1
	    }, width = $element.width(), height = $element.height();
		
		
		var color = d3.scale.category10();
		if (displayPalette === "10") {
			var color = d3.scale.category10();
		}
		if (displayPalette === "20") {
			var color = d3.scale.category20();
		}
		if (displayPalette === "20b") {
			var color = d3.scale.category20b();
		}
		if (displayPalette === "20c") {
			var color = d3.scale.category20c();
		}
		

	    var svg = d3.select("#sk_" + divName).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	  
	    var sankey = d3.sankey().nodeWidth(15).nodePadding(10).size([width -10 , height-10]);
	    var path = sankey.link();
	 

	    sankey.nodes(jNodes).links(sLinks).layout(32);
	    var link = svg.append("g").selectAll(".link").data(sLinks).enter().append("path").attr("class", "link").attr("d", path).style("stroke-width",function(d) {
	      return Math.max(1, d.dy);
	    }).sort(function(a, b) {
	      return b.dy - a.dy;
	    });
		
		//Color of Flow 
		link.style('stroke', flowColor);

		// affiche la valeur sur le flux en popup
			link.append("title").text(function(d) {
			//Je supprime les tildes et les pipes
			var start = d.source.name.split('|')[0];
			//var start = d.source.name.substr(0, d.source.name.length - 2).split('|')[0];
			var end = d.target.name.split('|')[0];
			
	      if (displayFormat === "Number"){
		  return formatMoney(d.value, 0, '.', ' ','' , start + displaySeparateur + end);
		  }
		  if (displayFormat === "Number1"){
		  return formatMoney(d.value, 1, '.', ' ','' , start + displaySeparateur + end);
		  }
		  if (displayFormat === "Number2"){
		  return formatMoney(d.value, 2, '.', ' ','' , start + displaySeparateur + end);
		  }
		  if (displayFormat === "Money"){
		  return formatMoney(d.value, 0, '.', ' ',' €' , start + displaySeparateur + end);
		  }
		  if (displayFormat === "Money1"){
		  return formatMoney(d.value, 1, '.', ' ',' €' , start + displaySeparateur + end);
		  }
		  if (displayFormat === "Money2"){
		  return formatMoney(d.value, 2, '.', ' ',' €' , start + displaySeparateur + end);
		  }
	    });
		
		var node = svg
		.append("g").selectAll(".node").data(jNodes).enter().append("g").attr("class", "node").attr("transform", function(d) {
	      return "translate(" + d.x + "," + d.y + ")";
	    })
		
		node.on("click",function(d, i) {
			//on passe a la fonction l'identifiant qElement precedemment stocké dans le nom et le nom de la dimension sous forme d'un tableau
			
			_this.backendApi.selectValues(
				parseInt(d.name.split('~')[1].replace('end', qDim.length - 1)),
				[ parseInt(d.name.split('~')[0].split('|')[1]) ],
				true
			);
		})
		
		//dessin du noeud
	    	    node.append("text").attr("class", "nodeTitle").attr("x", -6).attr("y", function(d) {
	      //console.log(d)
	      return d.dy / 2;
	    }).attr("dy", ".35em").attr("text-anchor", "end").attr("transform", null).text(function(d) {
	      var str = d.name.substring(0, d.name.indexOf("~")).split('|')[0];
	      //console.log(str);
	      return str 
	    }).filter(function(d) {
	      return d.x < width / 2;
	    }).attr("x", 6 + sankey.nodeWidth()).attr("text-anchor", "start");
		
		// AVEC POPUP sur le carré de couleur
		node.append("rect").attr("height", function(d) {
	      return d.dy;
	    }).attr("width", sankey.nodeWidth()).style("fill", function(d) {
	      return d.color = color(d.name.substring(0, d.name.indexOf("~")).replace(/ .*/, ""));
	    }).style("stroke", function(d) {
	      return d3.rgb(d.color).darker(2);
	    }).append("title").text(function(d) {
			
		var level = d.name.substr(d.name.indexOf("~")+1,1);
		// test si on est à la fin du flux ou pas
		if (level === "e" ){level = qDim.length -1;}
		var entete = qDim[level] + ' : ' + d.name.substr(0,d.name.indexOf("~"));
			
	      if (displayFormat === "Number"){
		  return formatMoney(d.value, 0, '.', ' ','', entete);
		  }
		  if (displayFormat === "Number1"){
		  return formatMoney(d.value, 1, '.', ' ','',entete);
		  }
		  if (displayFormat === "Number2"){
		  return formatMoney(d.value, 2, '.', ' ','',entete);
		  }
		  if (displayFormat === "Money"){
		  return formatMoney(d.value, 0, '.', ' ',' €',entete);
		  }
		  if (displayFormat === "Money1"){
		  return formatMoney(d.value, 1, '.', ' ',' €',entete);
		  }
		  if (displayFormat === "Money2"){
		  return formatMoney(d.value, 2, '.', ' ',' €',entete);
		  }
		  
	    });
	    /*
	     function dragmove(d) {
	      d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
	      sankey.relayout();
	      link.attr("d", path);
	    }
		*/
		}        
    };
    
} );