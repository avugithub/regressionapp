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
            AjaxCallCORS(url, "", "POST", dispatchEvent,errorcallback);
        }
        catch(err)
        {
          
            console.log("Error Caught"+ err.message);
        }
        var errorcallback = function (data) {
            console.log("");
         
        } 
    };
	//export function 
	return {
		changePriorityOne : changePriorityOne
	}
})();