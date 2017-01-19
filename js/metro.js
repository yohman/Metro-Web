/*

	Global variables

*/
var metro = {};

//bus stop location array
metro.busstops = [];

// map markers
metro.busicon = L.icon({
	iconUrl: 'images/bus.png',
	iconSize: [22, 22], // size of the icon
});

metro.livebusicon = L.icon({
	iconUrl: 'images/livebus.png',
	iconSize: [32, 32], // size of the icon
});



/*

	Run this when the html document is loaded
	Source: https://learn.jquery.com/using-jquery-core/document-ready/

*/
$( document ).ready(function() {
	metro.init();
});

/*

	The initialize function is the first thing this application does

*/
metro.init = function()
{
	console.log("hello world")
	metro.map = L.map('map').setView([34.0522, -118.2437], 10);

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(metro.map);

	metro.getBusRoutes();
	//Map bus route 20
	metro.mapBusStops(10);

}


//get bus routes
metro.getBusRoutes = function()
{
	$.getJSON('http://api.metro.net/agencies/lametro/routes/',
		function(data)
		{
		    console.log(data);

			//loop through each item
			$.each(data.items, function(i,item){
				//add bus stops to the side panel
				$('#stoplist').append('<div onclick="metro.mapBusStops('+item.id+')">'+item.display_name+'</div>');

			});


		}
	);
}

//map bus stops
metro.mapBusStops = function(busnum)
{
	//remove any existing bus stops
	metro.removeLayer();

	$.getJSON('http://api.metro.net/agencies/lametro/routes/' + busnum + '/sequence/', function(data)
	{
		$.each(data.items, function(i,item){
			console.log(i + ': ' + item.display_name);
			console.log(item.latitude);
			console.log(item.longitude);
			//create the lat/lon for this stop
			var thisbusstop = L.marker([item.latitude, item.longitude],{icon:metro.busicon}).addTo(metro.map)
				.bindPopup(item.display_name);

			metro.busstops.push(thisbusstop); //adds this new stop to the busstop array
		});
		// zoom map to extent of all bus stops
		var group = new L.featureGroup(metro.busstops);
		metro.map.fitBounds(group.getBounds());

	});

	// let's also get the location of live buses
	metro.getLiveBus(busnum);

}

//remove layer
metro.removeLayer = function()
{
	//check if busstops has values in it
    if (metro.busstops) 
    {
    	//loop through each bus stop and remove it
        for (i in metro.busstops) 
        {
            metro.map.removeLayer(metro.busstops[i]);
        }
        // reset the busstops array to null
        metro.busstops = [];
    }
}

//get bus routes
metro.getLiveBus = function(busnum)
{
	// get real time buses from metro API
	$.getJSON('http://api.metro.net/agencies/lametro/routes/' + busnum + '/vehicles/',
		function(data)
		{
			console.log(data)
			//loop through each item
			$.each(data.items, function(i,item){

				//create the marker for this bus
				var thisbusstop = L.marker([item.latitude, item.longitude],{icon:metro.livebusicon}).addTo(metro.map)
					.bindPopup(item.display_name);

				//add this bus to the busstop array (so that we can delete it later)
				metro.busstops.push(thisbusstop); 
			});
		}
	);
}

