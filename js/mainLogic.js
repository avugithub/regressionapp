

Transamerica.ARIESRegression = (function() {
	//private 
	var selectedProduct = "";
	const products = ["FEBII", "ACCUMIULr" ,"FFIULII", "IUL09", "LB201701", "Super201701"];
	var selectedNodes = [];
	var outputs = {};	
	var testCases = [];
	var isSameSystem = true;
	var myTWJSONkeys = Transamerica.Globals.myTWJSONkeys;

	//save endpoint 1 and 2 
	// var endpoint1 = "";
	// var endpoint2 = "";

	var displayCases = function(data){
		var response = data["response"];
		if(Array.isArray(response) == false){
			$.notify("No Test Case Received For the Given Query Url");
		}else{
			testCases = [];
			testCases = response;
			buildScenarioTable();
		}
	};

	var buildScenarioTable = function (){
		var tbody = $("#testCases");
		tbody.empty();
		var num = testCases.length;
		var i;
		for (i =0 ; i < num; i++ ){
			var row = $("<tr id="+testCases[i]["_source"]["ScenarioGuid"]+"><td>"+(i+1)+
				"</td><td class='ScenarioName'>"+testCases[i]["_source"]["ScenarioName"] +
				"</tr>");
			tbody.append(row);
		}
		$("#num_cases").html("( num: " + testCases.length + " cases)");
	}



	var compareTwoEndPoints = function(){
		var i = 0;
		var len = testCases.length;
		for(i; i<len;i++){
			testCase = testCases[i];
			var scenarioID = testCase["_source"]["ScenarioGuid"];
			var inputJSON  = testCase["_source"]["InputJSON"]
			processComparison(scenarioID, inputJSON);
		}		
	};
	
	var errorHandlingCallBack = function(data){
		$.notify(`The webservice did not send any response back ! Status: ${data.status}`);
		console.log(data);
	}

	//COMPARING
	var processComparison = function(scenarioID, inputJSON){
		//the reason I moved the code is closure in JS is only created inside function
		//refer to http://www.w3schools.com/js/js_function_closures.asp
		var url1  = getMyTranswareServiceURL($("#endpoint1").val(),inputJSON);
		var url2  = getMyTranswareServiceURL($("#endpoint2").val(),inputJSON);

		var row = $("#"+scenarioID);

		outputs[scenarioID] = {};

		//send 2 ajax requests in order
		Transamerica.Utils.AjaxCallCORS(url1,"","GET", function(data){

			outputs[scenarioID]["version1"] = {};
			var version1 = JSON.parse(data);
			row.append($("<td><span class='glyphicon glyphicon-stop' style='color:green'></span></td>"));

			Transamerica.Utils.AjaxCallCORS(url2,"","GET", function(data){

				row.append($("<td><span class='glyphicon glyphicon-stop' style='color:green'></span></td>"));
				outputs[scenarioID]["version2"] = {};
				var version2 = JSON.parse(data);
				
				//object for storing comparison data
				outputs[scenarioID]["version1"]["selectedKeyOutputs"] = {};
				outputs[scenarioID]["version2"]["selectedKeyOutputs"] = {};

				var len = selectedNodes.length;
				var outputString = "";
				var tds = "";				

				if(version1 != null & version2 != null){
					if(version1.ErrorCode !== 9 & version2.ErrorCode !== 9 ){
					   //start compare
						var finalResult = true;

						for(var j =0; j< len; j++){
						   var currentNode = selectedNodes[j];
						   var version1Values = getValueForNode(version1,currentNode);
						   var version2Values = getValueForNode(version2,currentNode);

						   //cache the  values for current node so we can display later
						   outputs[scenarioID]["version1"]["selectedKeyOutputs"][currentNode] = version1Values;
						   outputs[scenarioID]["version2"]["selectedKeyOutputs"][currentNode] = version2Values;

						   console.log(`Comparing : (${currentNode})`, version1Values, version2Values)
						   var result = compareTwoNodes(version1Values,version2Values)
						   if(result === false){ 
						   		finalResult = false;
						   }
						   outputString =`<span class='glyphicon glyphicon-stop' style="color:`+colorCode(result)+`"></span>`;
						   tds += `<td>${outputString}</td>`;
						}

						tds += `<td style="color:`+colorCode(finalResult)+`">${finalResult === true ? "PASS" : "FAIL" }&nbsp<a id='details_${scenarioID}' style='cursor:pointer'>Details</a></td>`
						row.append($(tds));
						rowClickEventHandler(scenarioID);
					}
				   	else if(version1.ErrorCode === 9 || version2.ErrorCode === 9 ){
						for(var j =0; j< len; j++){
						   var currentNode = selectedNodes[j];						   
						   outputString =`<span class='glyphicon glyphicon-stop' style="color:red"></span>`;
						   tds += `<td>${outputString}</td>`;
						}
						var message = version1.ErrorCode === 9 ? "ENDPOINT A returns an Error Message : " + version1.Messages :  "ENDPOINT B returns an Error Message : " + version2.Messages;
						if(version1.ErrorCode === 9 && version2.ErrorCode === 9 ){
							message = "BOTH ENDPOINTS RETURN ERROR. ENDPOINT A: " + version1.Messages + "| ENDPOINT B :" + version2.Messages;
						}
						tds += `<td style="color:red">FAIL</td><td>${message}</td>`
						row.append($(tds));
				    }
				}else{
				   $.notify("No Data Received From Endpoint" +  version1 != null ? $("#endpoint1").val() : $("#endpoint2").val());
				}
			},function(data){ 
							$.notify(" ENDPOINT 2 - ERROR : Got error from the webervice. Status: "+ data.status);
							row.append($("<td><span class='glyphicon glyphicon-stop' style='color:red'></span></td>"));
				});
		},function(data){ 
							$.notify("ENDPOINT 1 - ERROR : Got error from the webervice. Status: "+ data.status);
							row.append($("<td><span class='glyphicon glyphicon-stop' style='color:red'></span></td>"));
				});

		//update global object
		Transamerica.ARIESRegression.outputs = outputs;
	};

	var colorCode = function(bool){
		if(bool === true){
			return "green";
		}else{
			return "red";
		}
	}

	var rowClickEventHandler = function (scenarioId) {
        $(`#details_${scenarioId}`).click(function () {
            $("#detailsModal").modal("show");
            Transamerica.Utils.comparisionTable(scenarioId);
        });
    };

	var getValueForNode = function(grandObj, nodeString){
		var nodes  = nodeString.split(".");
		var obj = grandObj;
		for (var i = 0, len = nodes.length; i < len; i++) {
			obj = obj[nodes[i]]; 
		}
		return obj;
	}
	
	var compareTwoNodes = function(obj1 , obj2)
	{
		var result = true; 
		if(obj1 instanceof Array == true){
			if(obj1.len == obj2.len){
				result = compareTwoArrays(obj1,obj2)
			}else{
				result = false;
			}
		}
		else
		{
			if (obj1 == obj2){
				result =true;
			}else{
				result = false;
			}
		}
		return result;
	}
	
	var compareTwoArrays = function (arr1, arr2){
		result = true;
		var len = arr1.length;
		var i = 0;
		for(i; i< len; i++){
			if(typeof(arr1[i]) == "object" && typeof(arr2[i]) == "object"){
				result = JSON.stringify(arr1[i]) === JSON.stringify(arr2[i]); // we can go deeper !
			}else{
				if(arr1[i] != arr2[i])
				{	
					return false;
				}
			}
		}
		return result;
	};
	
	var displaySelectedNode = function(tbodyId, currentSelectedNodes){
		var tbody = $("#" + tbodyId);
		tbody.empty();
		var i = 0;
		var len  = currentSelectedNodes.length;
		for (i; i<len; i++){
			tbody.append($("<tr><td>"+(i+1)+"</td><td>"+currentSelectedNodes[i]+"</td></tr>"));
		}
	};
	
	var getMyTranswareServiceURL = function(endpoint,caseJSON){
		var calServiceUrl = endpoint;
		var paramString = JSON.stringify(caseJSON);
		var re = new RegExp("\" \"" , 'g');
		paramString = paramString.replace(re, "\"\"");
		var url = endpoint + "?key=f19d590dcc2b" + "&configuration=&jsWebIllustration=" + paramString;
		return url;
	};

	var fillSelectBox = function(){
		var selectBox = $("#endpointSelect");
		var myTWNodes = myTWJSONkeys;
		var len = myTWNodes.length;
		var  i = 0;
		for(i; i < len; i++){
			var option = $("<option val="+myTWNodes[i]+">"+myTWNodes[i]+"</option>");
			selectBox.append(option);
		}
		selectBox.select2();
		selectBox.change(function(){
				//add selected nodes to an array
				var value = selectBox.val();
				if(value != ""){
					selectedNodes.push(value);
					displaySelectedNode("selected_nodes_tbody", selectedNodes);
				}else{
					return;
				}
		});
		$("#clear_endpoint").click(function(){
			selectedNodes = [];
			var tbody = $("#selected_nodes_tbody");
			var testCasestbody = $("#testCases");
			testCasestbody.empty();
			tbody.empty();
			buildScenarioTable();
		});	
	}


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

	//public
	var initialize = function (){
		fillSelectBox();
		$("#nodeSelectBox").hide();
		$("#kibanaBox").hide();

		$("#compare").click(function(){
			var selectedNodesArray = selectedNodes;
			//validation
			if(selectedNodesArray.length == 0){
				alert("Please select node to compare");
				return false;
			}
			var testCasestbody = $("#testCases");
			testCasestbody.empty();
			buildScenarioTable();
			var thead = $("#tableTitle");
			thead.empty();
			var header = "<tr class='info'><th>No</th><th>Name</th><th>Endpoint 1</th><th>Endpoint 2</th>";
			for(var o = 0 ; o < selectedNodesArray.length; o++){
				header += "<th>"+ selectedNodesArray[o] +"</th>";
			}
			header += "<th>Final Result</th></tr>";
			thead.append($(header));
			compareTwoEndPoints();
		});

		$("#pressNext").click(function(){
			var endpoint1 = $("#endpoint1").val();			
			var endpoint2 = $("#endpoint2").val();

			if(endpoint1 === "" || endpoint2 === ""){
				$.notify("Please provide 2 endpoints to compare");
				return false;
			}
			if(testCases.length == 0){
				$.notify("There is no test case for testing. Please provide the kibana url and press Search")
				return false;
			}
			else if(isSameSystem === false)
			{	
				//do this for if the systems are different
				//actually get a case that is currently passing 
			}else if(isSameSystem === true)
			{
				$("#nodeSelectBox").show();
			}
		});

		$('input[type=radio][name=sameSystem]').change(function() {
	        if (this.value == 'yes') 
	        {
	            isSameSystem = true;
	        }
	        else if (this.value == 'no') 
	        {
	            isSameSystem = false;
	        }
   		});

   		$("#search").click(function(){
   			if(validateKibanaUrl()){
   				$.notify(`Getting test cases for ${selectedProduct} ! `, "success");
   				if(selectedProduct === ""){
					$.notify("Please select a product");
				}else{
					Transamerica.Utils.searchCases(selectedProduct, $("#kibana_url").val());
				}
			}	
   		});

   		$("#discoverTestCase").click(function(){
   			Transamerica.Utils.getIndexAttributeDistribution(selectedProduct);
   		});
	};
	var updateProduct = function(value){
		selectedProduct = value;
		$("#productTitle").text(value);
	}

	var loadProducts = function(selectBoxId){
		selectBox = $("#productSelect");
		var  i = 0;
		for(i; i < products.length; i++){
			var option = $("<option val="+products[i]+">"+products[i]+"</option>");
			selectBox.append(option);
		}
		selectBox.change(function(){
			var value = $(this).val();
			if(value == ""){
				$("#productTitle").text("Please select a product !");
				return;
			}
			updateProduct(value);
			$("#kibana_url").val("");
			$("#kibanaBox").show();
		});

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
	};
	return {
		loadProducts : loadProducts,
		initialize: initialize,
		outputs:outputs // for testing - remove 
	};
})();


