Transamerica.Utils = (function(){
	var changePriorityOne = function (ScenarioGuid, comparisonResult) {
		try {
			var baseURl = "http://ladbsqldev02/App5/Services/SHARPAriesAutoTestCacheService.asmx/DoCOMUpdateScenarioPriority";
			var value = "Low";
		    if (comparisonResult === false) {
		    	value = "High";
		    }
		    else{
		    	value = "Low"; 
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


	//export function 
	return {
		changePriorityOne : changePriorityOne,
		AjaxCallCORS : AjaxCallCORS,
		AjaxCall: AjaxCall
	}
})();