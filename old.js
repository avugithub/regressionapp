var displaySchema = function (data, endpointDOMId) {
		var parsedData = JSON.parse(data);
		var errorCode = parsedData.ErrorCode;
		if(errorCode == 0)
		{
			var selectBox = $("#"+endpointDOMId+"Select");
			var Quote = parsedData.Quote;
			var Illustration = parsedData.Illustration;
			outputNodes = getAllkeys(parsedData);
			var len = outputNodes.length;
			var  i = 0;
			for(i; i < len; i++){
				var option = $("<option val="+outputNodes[i]+">"+outputNodes[i]+"</option>");
				selectBox.append(option);
			}
			selectBox.select2(); // make select box searchable
			selectBox.change(function(){
				//add selected nodes to an array
				var value = selectBox.val();
				if(value != ""){
					selectedNodes[endpointDOMId].push(value);
					displaySelectedNode("selected_nodes_" + endpointDOMId,selectedNodes[endpointDOMId]);
				}else{
					return;
				}
			});

			$("#clear_"+endpointDOMId).click(function(){
					selectedNodes[endpointDOMId] = [];
					var tbody = $("#selected_nodes_" + endpointDOMId);
					tbody.empty();
					
			});
		}
		else if(errorCode == null || errorCode!=0)
		{
			//TODO : customize this for each url
			$("#notification").html("<h4 style='color:red'>Error! Error: " + parsedData.Messages + "</h4>");
		}
	}

	
	
	var testEndPoint = function(endpoint, sampleJSON, endpointDOMId){
		var url = getMyTranswareServiceURL(endpoint,sampleJSON);
		var callback = function(data){
			displaySchema(data, endpointDOMId);
		}
		var errorcallback = function(data){
			$.notify("Status : "+ data.status+" !No response received from !" + $("#"+endpointDOMId).val());
			$("#nodeSelectBox").hide();
		}
		if(url.includes("http")){
			AjaxCallCORS(url,"","GET",callback,errorcallback);
		}else if(url.includes("https")){
			AjaxCall(url,"","GET",callback,errorcallback);
		}else{
			var newUrl = "http://" + url;
			AjaxCallCORS(newUrl,"","GET",callback,errorcallback);
			$("#"+endpointDOMId).val("http://"+ endpoint);
		}
	}

	$("#compare").click(function(){
			var selectedNodesArray = selectedNodes["endpoint1"];
			var selectedNodesArray2 = selectedNodes["endpoint2"];

			//validation
			if(selectedNodesArray1.length == 0 && selectedNodesArray2.length == 0){
				alert("Please select node for both end points");
				return false;
			}
			else if(selectedNodesArray1.length != selectedNodesArray2.length)
			{
				alert("Can't compare ! Make sure the number of selected nodes for both endpoints are the same");
				return false;
			}

			var thead = $("#tableTitle");
			thead.empty();
			var header = "<tr><th>No</th><th>Name</th>";
			for(var o = 0 ; o < selectedNodesArray1.length; o++){
				header += "<th>"+ selectedNodesArray1[o] + " vs "+ selectedNodesArray2[o]+"</th>";
			}
			header = header + "</tr>";
			thead.append($(header));
			compareTwoEndPoints();
		});




	// 01/12



	   		$("#search").click(function(){
   			if(validateKibanaUrl()){
   				$.notify(`Getting test cases for ${selectedProduct} ! `, "success");
   				if(selectedProduct === ""){
					$.notify("Please select a product");
				}else{
					Transamerica.Utils.searchCases(selectedProduct, $("#kibana_url").val(), displayCasesv1);
				}
			}	
   		});




	   			var displayCasesv1 = function(data){
		var response = data["response"];

		if(Array.isArray(response) == false){
			$.notify("No Test Case Received For the Given Query Url");
		}else{
			testCases = [];
			testCases = response;
			buildScenarioTable();
		}
	};

	var validateKibanaUrl = function(){
			var kibana_url = $("#kibana_url");
   			var value = kibana_url.val();
   			var valid = true;
   			const regex = /(index:[^,]+)/g;
   			var name;
   			var matchArray = regex.exec(value);

   			if(value == ""){
   				$.notify(`Please provide a kibana url for ${selectedProduct} ! `);
   				return false;
   			}

   			if(matchArray !== null){
   				for(var i = 0; i < matchArray.length;i++){
   					var k = matchArray[i].split(":");
   					if(k.length == 2) {   						
   						name = k[1];
   						break;
   					}else{
   						continue;
   					}
   				}
   				if(name  !== selectedProduct.toLowerCase()){
   					$.notify(`This  kibana url is not for ${selectedProduct} ! `);
   					$(this).val("");
   					valid = false;
   				}else{
   					valid = true;
   				}
   			}else{
   				$.notify(`This kibana url is not for ${selectedProduct} !`);
   				$(this).val("");
   				valid = false;
   			}
			return valid;
   		};


$("#redirectKibana").click(function(){
			if(selectedProduct === ""){
				$.notify("Please Select A Product");
				return false;
			}
			var index = selectedProduct.toLowerCase();
			var kibanaUrl = `https://search-scenarios-llsguds6zuyl7hl4gfsomx4pxi.us-west-2.es.amazonaws.com/_plugin/kibana/#/discover?_g=(refreshInterval:(display:Off,pause:!f,section:0,value:0),time:(from:now-30d,mode:quick,to:now))&_a=(columns:!(_source),\
index:${index},interval:auto,query:(query_string:(analyze_wildcard:!t,query:'*')),sort:!(ComparisonLog.endTime,desc))`;
			window.open(kibanaUrl);
		});

	//Utils
	var searchCases = function(selectedProduct, url, callback){
		var value = url;
		var splitTerms = value.split("),");
		var queryStatement  = [];
		var len = splitTerms.length;
		for(var i = 0 ; i < len ; i++){
			if(splitTerms[i].includes("query:(match:(")){
		  queryStatement.push(splitTerms[i]);

		  }
		} 
		var tableName = selectedProduct.toLowerCase();
		var baseURl = "https://m7kx722wp8.execute-api.us-west-2.amazonaws.com/prod/gettestcasesfromkibanaurl";
		var requestUrl = baseURl + "?tableName=" + tableName + "&url="+queryStatement.join();
		AjaxCall(requestUrl, "", "GET",callback);
	};



