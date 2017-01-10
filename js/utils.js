Transamerica.Utils = (function(){
	var changePriorityOne = function (ScenarioGuid, comparisonResult) {
		try {
			var baseURl = "http://ladbsqldev02/App5/Services/SHARPAriesAutoTestCacheService.asmx/DoCOMUpdateScenarioPriority";
			var value = "NotSet"; // NotSet = Normal
		    if (comparisonResult === false) {
		    	value = "High";
		    }
		    
		    var url = baseURl + "?systemID=" + "1" + "&scenarioGUID=" + ScenarioGuid + "&priorityCode=" + value  + "&userID=" + "RBEWERNI";
            $.ajax({
		        type: "POST",
		        url: url,
		        contentType: "application/json; charset=utf-8",
		        dataType: "json",
		        xhrFields: { withCredentials: true },
		        success: function (data, status) {
			            try {
			                if (data.d != "" && status.toLowerCase() == "success") {

			                }
			                else {
			                    //alert("FAILED");
			                }
			            } catch (err) {
			                if (level1Alert == 1) {
			                    alert(err);
			                }
		            }
		        },
		        error: function (request, status, error) {
		            console.log("FAILED Product Update: " + error);
		        }
    		});
        }
        catch(err)
        {
          
            console.log("Error Caught"+ err.message);
        }
        var errorcallback = function (data) {
            console.log("");
         
        } 
    };

	//AJAX
	var  AjaxCallCORS = function(url, data, type, callback,errorcallback)
	{
		$.ajax(
		{
			contentType : 'application/json; charset=utf-8',
			url : url,
			type: type,
			data : data,
			dataType: 'jsonp',
			crossDomain: true,
			success : function(d)
			{
				if(callback != null)
				{
					callback(d);
				}
				else
				{
					console.log("no callback provided");
					console.log(d);
				}
			},
			error: function ( data){
				if(data.status == 404){
					if(errorcallback != undefined){
						errorcallback(data);
					}
				}

			} 
		});
	};
	
	var  AjaxCall = function(url, data, type, callback, errorcallback)
	{
		console.log(url);
		$.ajax(
		{
			contentType : 'application/json; charset=utf-8',
			url : url,
			type: type,
			data : data,
			dataType: 'json',
			success : function(d)
			{
				if(callback != null)
				{
					callback(d);
				}
				else
				{
					console.log("no callback provided");
					console.log(d);
				}
			},
			error: function ( data){
				if(data.status == 404){
					if(errorcallback != undefined){
						errorcallback(data);
					}
				}

			} 
		});
	};

	var comparisionTable = function (scenarioGUID) {
        $("#testCaseName").html("- Test Case: " + testCaseName);
        var table = $("#comparisonTable");
        var outputs = Transamerica.ARIESRegression.outputs;
        console.log(outputs);
        table.empty();
    
        var num = Object.keys(outputs).length;
      //  console.log(num);

        // add header 

        table.append($("<thead></thead>"));


        var comparedOutputs = outputs[scenarioGUID]["version1"]["selectedKeyOutputs"];
        for (var key in comparedOutputs) {
            if (comparedOutputs.hasOwnProperty(key)) {
           
                    var tbody = $("<tbody></tbody");
                    var currentNode = key;
                    var currentNodeData = comparedOutputs[currentNode];
                    var currentNodeData2 = outputs[scenarioGUID]["version2"]["selectedKeyOutputs"][currentNode];

                    var len = currentNodeData.length;
                    var j;
                    tbody.append($("<tr style='background:yellow;'><td colspan='2'>" + key + "</td></tr>"));
                    for (j = 0; j < len; j++) {

                        var row = $("<tr><td>" + currentNodeData[j] + "</td>" +
                            "<td>" + currentNodeData2[j] + " </td>" +
                            "</tr>");
                        tbody.append(row);
                    }                
                    table.append(tbody);                    
            }
        }
    };

	//export function 
	return {
		changePriorityOne : changePriorityOne,
		AjaxCallCORS : AjaxCallCORS,
		AjaxCall: AjaxCall,
		comparisionTable:comparisionTable
	}
})();