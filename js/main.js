console.log("Hello world");
var filterApplied = false;
document.getElementById("reset-button").disabled = true;
let solarSystemData = [];
let globalData;

d3.csv('data/exoplanets-1.csv')
  .then(data => {
  	console.log('Data loading complete. Work with dataset.');
	var loading = document.getElementById("loading");
	loading.classList.add("loading");
	setTimeout(function() {
	solarSystemData.push({"planetType":"Mercurian","pl_bmasse": 0.0553, "pl_rade":.3825, "pl_name":"Mercury","hostname":"Sun", "sys_name":"Our Solar System", "pl_orbsmax":"0.3871",  "st_rad":"1",  "st_mass":"1", "st_spectype":"G2V"});
	solarSystemData.push({"planetType":"Terran","pl_bmasse": 0.815, "pl_rade":.9489, "pl_name":"Venus","hostname":"Sun", "sys_name":"Our Solar System", "pl_orbsmax":"0.7233",  "st_rad":"1",  "st_mass":"1", "st_spectype":"G2V"});
	solarSystemData.push({"planetType":"Terran","pl_bmasse": 1, "pl_rade":1, "pl_name":"Earth","hostname":"Sun", "sys_name":"Our Solar System", "pl_orbsmax":"1",  "st_rad":"1",  "st_mass":"1", "st_spectype":"G2V"});
	solarSystemData.push({"planetType":"Subterran","pl_bmasse": .1075, "pl_rade":.5325, "pl_name":"Mars","hostname":"Sun", "sys_name":"Our Solar System", "pl_orbsmax":"1.5273",  "st_rad":"1",  "st_mass":"1", "st_spectype":"G2V"});
	solarSystemData.push({"planetType":"Jovian","pl_bmasse": 317.8, "pl_rade":11.2092, "pl_name":"Jupiter","hostname":"Sun", "sys_name":"Our Solar System", "pl_orbsmax":"5.2028",  "st_rad":"1",  "st_mass":"1", "st_spectype":"G2V"});
	solarSystemData.push({"planetType":"Jovian","pl_bmasse": 95.2, "pl_rade":9.4494, "pl_name":"Saturn","hostname":"Sun", "sys_name":"Our Solar System", "pl_orbsmax":"9.53881",  "st_rad":"1",  "st_mass":"1", "st_spectype":"G2V"});
	solarSystemData.push({"planetType":"Neptunian","pl_bmasse": 14.6, "pl_rade":4.0074, "pl_name":"Uranus","hostname":"Sun", "sys_name":"Our Solar System", "pl_orbsmax":"19.1914",  "st_rad":"1",  "st_mass":"1", "st_spectype":"G2V"});
	solarSystemData.push({"planetType":"Neptunian","pl_bmasse": 17.2, "pl_rade":3.8827, "pl_name":"Neptune","hostname":"Sun", "sys_name":"Our Solar System", "pl_orbsmax":"30.0611",  "st_rad":"1",  "st_mass":"1", "st_spectype":"G2V"});

	globalData = data;

	data.forEach(planet => {
		const mass = parseFloat(planet.pl_bmasse);
		let planetType;
		switch (true) {
		  case (mass < 0.00001):
			planetType = "Asteroidan"; // Mass less than 0.00001 Earth masses
			break;
		  case (mass < 0.1):
			planetType = "Mercurian"; // Mass between 0.00001 and 0.1 Earth masses
			break;
		  case (mass < 0.5):
			planetType = "Subterran"; // Mass between 0.1 and 0.5 Earth masses
			break;
		  case (mass < 2):
			planetType = "Terran"; // Mass between 0.5 and 2 Earth masses
			break;
		  case (mass < 10):
			planetType = "Superterran"; // Mass between 2 and 10 Earth masses
			break;
		  case (mass < 50):
			planetType = "Neptunian"; // Mass between 10 and 50 Earth masses
			break;
		  default:
			planetType = "Jovian"; // Mass greater than or equal to 50 Earth masses
		}
		planet.planetType = planetType;
	});

	// Discovery Method Help button
	d3.selectAll('.help-button').on('click', function() {
		window.open('https://exoplanets.nasa.gov/alien-worlds/ways-to-find-a-planet/');
	});

	// Star Type Help button
	d3.selectAll('.type-help-button').on('click', function() {
		window.open('https://exoplanets.nasa.gov/what-is-an-exoplanet/stars/#:~:text=Astronomers%20use%20these%20characteristics%20to,biggest%20to%20coolest%20and%20smallest.');
	});

	let firstRowOffset = 282;

	// Discovery Method Bar Chart
	let methodBar = new BarChart({
		'parentElement': '#methodbar',
		'containerHeight': (window.innerHeight) * 0.324,
		'containerWidth': (window.innerWidth - firstRowOffset) * 0.3
	}, getMethodCount(data), "Exoplanets by Discovery Method", (filterData) => {
		let selectedFilter = [filterData];
		let filteredData = data.filter(d => selectedFilter.includes(d.discoverymethod))
		updateData(filteredData);
	}, "#66d9ef");


  	// # of Stars in System Bar Chart
	let systemStarBar = new BarChart({
		'parentElement': '#starbar',
		'containerHeight': (window.innerHeight) * 0.324,
		'containerWidth': (window.innerWidth - firstRowOffset) * 0.15
	}, getStarCount(data), "Exoplanets by # of Stars in System", (filterData) => {
		let selectedFilter = [filterData];
		let filteredData = data.filter(d => selectedFilter.includes(d.sy_snum));
		updateData(filteredData);
	}, '#0483e9');


	// # of Planets in System Bar Chart
	let systemPlanetBar = new BarChart({
		'parentElement': '#planetbar',
		'containerHeight': (window.innerHeight) * 0.324,
		'containerWidth': (window.innerWidth - firstRowOffset) * 0.2
	}, getPlanetCount(data), "Exoplanets by # of Planets in System", (filterData) => {
		let selectedFilter = [filterData];
		let filteredData = data.filter(d => selectedFilter.includes(d.sy_pnum))
		updateData(filteredData);
	}, '#648198');


	// Star Type Bar Chart
	let typeBar = new BarChart({
		'parentElement': '#typebar',
		'containerHeight': (window.innerHeight) * 0.324,
		'containerWidth': (window.innerWidth - firstRowOffset) * 0.2
	}, getTypeCount(data), "Exoplanets by Star Type", (filterData) => {
		let selectedFilter = [filterData];
		if (filterData != "reset" && filterData != "N/A"){
			let filteredData = data.filter(d => selectedFilter.includes(d.st_spectype[0]));
			updateData(filteredData);
		} else if(filterData == "N/A"){
			let filteredData = data.filter(d => d.st_spectype[0] != "A" && d.st_spectype[0] != "F" && d.st_spectype[0] != "G" && d.st_spectype[0] != "K" && d.st_spectype[0] != "M" );
			updateData(filteredData);
		}
	}, '#1a0f35');

	// Habitability Bar Chart
	let habitabilityBar = new BarChart({
		'parentElement': '#habitablebar',
		'containerHeight': (window.innerHeight) * 0.324,
		'containerWidth': (window.innerWidth - firstRowOffset) * 0.15
	}, getHabitabilityCount(data), "Exoplanets by Habitability", (filterData) => { 
		let selectedFilter = [filterData];
		if (selectedFilter.includes("Habitable")){
			let filterData = data.filter(d => {
				let st_spectype = d.st_spectype[0];
				let pl_orbsmax = d.pl_orbsmax;
				switch (st_spectype) {
					case 'A':
						return (pl_orbsmax >= 8.5 && pl_orbsmax <= 12.5);
					case 'F':
						return (pl_orbsmax >= 1.5 && pl_orbsmax <= 2.2);
					case 'G':
						return (pl_orbsmax >= 0.95 && pl_orbsmax <= 1.4);
					case 'K':
						return (pl_orbsmax >= 0.38 && pl_orbsmax <= 0.56);
					case 'M':
						return (pl_orbsmax >= 0.08 && pl_orbsmax <= 0.12);
					default:
						return false;
				}
			});
			updateData(filterData);
		}
		if (selectedFilter.includes("Too Cold")){
			let filterData = data.filter(d => {
				let st_spectype = d.st_spectype[0];
				let pl_orbsmax = d.pl_orbsmax;
				switch (st_spectype) {
					case 'A':
						return (pl_orbsmax < 8.5);
					case 'F':
						return (pl_orbsmax < 1.5);
					case 'G':
						return (pl_orbsmax < 0.95);
					case 'K':
						return (pl_orbsmax < 0.38);
					case 'M':
						return (pl_orbsmax < 0.08);
					default:
						return false;
				}
			});
			updateData(filterData);
		}
		if (selectedFilter.includes("Too Hot")){
			let filterData = data.filter(d => {
				let st_spectype = d.st_spectype[0];
				let pl_orbsmax = d.pl_orbsmax;
				switch (st_spectype) {
					case 'A':
						return (pl_orbsmax > 12.5);
					case 'F':
						return (pl_orbsmax > 2.2);
					case 'G':
						return (pl_orbsmax > 1.4);
					case 'K':
						return (pl_orbsmax > 0.56);
					case 'M':
						return (pl_orbsmax > 0.12);
					default:
						return false;
				}
			});
			updateData(filterData);
		}
	}, '#a1e9f7');

	let secondRowOffset = 182;

	// Exoplanet Distance Histogram
	let distanceHisto = new Histogram({
		'parentElement': '#distancehisto',
		'containerHeight': (window.innerHeight) * 0.4,
		'containerWidth': (window.innerWidth - secondRowOffset) * 0.175
	}, getHistoData(data), "Exoplanets by Distance", (filterData) => {
		let selectedFilter = [filterData]; // Get an array of selected bin ranges
		let filteredData = data.filter(d => {
			let dist = d.sy_dist;
			if (dist >= 0 && dist < 50 && selectedFilter.includes('0-50')) {
				return true;
			} else if (dist >= 50 && dist < 500 && selectedFilter.includes('50-500')) {
				return true;
			} else if (dist >= 500 && dist < 1000 && selectedFilter.includes('500-1000')) {
				return true;
			} else if (dist >= 1000 && dist < 1500 && selectedFilter.includes('1000-1500')) {
				return true;
			} else if (dist >= 1500 && selectedFilter.includes('>1500')) {
				return true;
			} else {
				return false;
			}
		});
		updateData(filteredData);
	}, '#104494');


	// Year Line Chart
	let yearLine = new Line({
		'parentElement': '#yearline',
		'containerHeight': (window.innerHeight) * 0.4,
		'containerWidth': (window.innerWidth - secondRowOffset) * 0.325
	}, getYearCount(data), (filterData) => {
		let selectedFilter = [filterData];
		let filteredData = data.filter(d => selectedFilter.includes(d.disc_year))
		updateData(filteredData);
	})

	// Scatterplot
	scatterplot = new Scatterplot({
		'parentElement': '#scatterplot',
		'containerHeight': (window.innerHeight) * 0.4,
		'containerWidth': (window.innerWidth - secondRowOffset) * 0.5
	},  getScatterData(data.concat(solarSystemData)), (m1,m2,r1,r2) => {
		let minM = parseFloat(m1)
		let maxM = parseFloat(m2)
		let minR = parseFloat(r1)
		let maxR = parseFloat(r2)
		filteredData = data.filter(d => parseFloat(d.pl_bmasse) >= minM).filter(d => parseFloat(d.pl_bmasse) <= maxM).filter(d => parseFloat(d.pl_rade) >= minR).filter(d => parseFloat(d.pl_rade) <= maxR)
		filteredSolarSystemData = solarSystemData.filter(d => parseFloat(d.pl_bmasse) >= minM).filter(d => parseFloat(d.pl_bmasse) <= maxM).filter(d => parseFloat(d.pl_rade) >= minR).filter(d => parseFloat(d.pl_rade) <= maxR)
		if(filteredData.length != 0 || filteredSolarSystemData.length != 0){
			updateData(filteredData, filteredSolarSystemData)
		} else {
			resetData();
		}

	});

	d3.selectAll('.legend-btn').on('click', function() {
		// Toggle 'inactive' class
		d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));
		// Check which categories are active
		let selectedCategory = [];
		d3.selectAll('.legend-btn:not(.inactive)').each(function() {
		  selectedCategory.push(d3.select(this).attr('category'));
		});

		// Filter data accordingly and update vis
		//filteredData = (data.filter(d => selectedCategory.includes(d.st_spectype[0]))) ;
		if (selectedCategory.includes('N/A')){
			filteredData = (data.filter(d => d.st_spectype == "" || selectedCategory.includes(d.st_spectype[0])));
		} else {
			filteredData = (data.filter(d => selectedCategory.includes(d.st_spectype[0]))) ;
		}
		updateData(filteredData);
	  });

	
	function updateData(filteredData, filteredSolarSystemData = false){
		// Show the loading message
		var loading = document.getElementById("loading");
		loading.classList.add("loading");
		document.getElementById("reset-button").disabled = false;
		setTimeout(function() {
			methodBar.data = getMethodCount(filteredData);
			systemStarBar.data = getStarCount(filteredData);
			systemPlanetBar.data = getPlanetCount(filteredData);
			typeBar.data = getTypeCount(filteredData);
			habitabilityBar.data = getHabitabilityCount(filteredData);
			distanceHisto.data = getHistoData(filteredData);
			yearLine.data = getYearCount(filteredData);
			if (filteredSolarSystemData != false){
				scatterplot.data = getScatterData(filteredData.concat(filteredSolarSystemData));
				buildTable(filteredData.concat(filteredSolarSystemData));
			} else {
				scatterplot.data = getScatterData(filteredData);
				buildTable(filteredData);
			}
			methodBar.updateVis();
			typeBar.updateVis();
			systemStarBar.updateVis();
			systemPlanetBar.updateVis();
			habitabilityBar.updateVis();
			distanceHisto.updateVis();
			yearLine.updateVis();	
			scatterplot.updateVis();
			// Hide the loading message
			loading.classList.remove("loading");
		}, 100);
	  }
	  
	// Reset data
	d3.selectAll('.reset-button').on('click', function() {
		document.getElementById("system-container").style.display = "none";
		resetData();
		document.getElementById("content").style.filter = "none";
	});

	function resetData(){
		// Show the loading message
		var loading = document.getElementById("loading");
		loading.classList.add("loading");
		document.getElementById("reset-button").disabled = true;
		setTimeout(function() {
			methodBar.data = getMethodCount(data);
			systemStarBar.data = getStarCount(data);
			systemPlanetBar.data = getPlanetCount(data);
			typeBar.data = getTypeCount(data);
			habitabilityBar.data = getHabitabilityCount(data);
			distanceHisto.data = getHistoData(data);
			yearLine.data = getYearCount(data);
			scatterplot.data = getScatterData(data.concat(solarSystemData));
			buildTable(data);
			methodBar.updateVis();
			typeBar.updateVis();
			systemStarBar.updateVis();
			systemPlanetBar.updateVis();
			habitabilityBar.updateVis();
			distanceHisto.updateVis();
			yearLine.updateVis();
			scatterplot.updateVis();
			d3.selectAll("#A").attr("class","legend-btn")
			d3.selectAll("#B").attr("class","legend-btn")
			d3.selectAll("#F").attr("class","legend-btn")
			d3.selectAll("#G").attr("class","legend-btn")
			d3.selectAll("#K").attr("class","legend-btn")
			d3.selectAll("#M").attr("class","legend-btn")
			d3.selectAll("#NA").attr("class","legend-btn")
			loading.classList.remove("loading");
		}, 100);
	}

	buildTable(data);
	loading.classList.remove("loading");
	}, 100);

	// Reset data
	d3.selectAll('.system-close-button').on('click', function() {
		document.getElementById("system-container").style.display = "none";
		document.getElementById("content").style.filter = "none";
	});

	// # of Planets in System Bar Chart
	system = new System({
		'parentElement': '#system',
		'containerHeight': 450,
		'containerWidth': 1200
	}, data, data);
})
.catch(error => {
    console.error('Error loading the data');
	console.error(error);
});

function setExoplanet(exoplanetData){
	document.getElementById("system-container").style.display = "flex";
	document.getElementById("reset-button").disabled = false;
	console.log(exoplanetData)
	if (exoplanetData == "solarsystem"){
		filteredData = solarSystemData;
	} else {
		filteredData = globalData.filter(d => d.sys_name == exoplanetData[0].sys_name)
	}
	buildTable(filteredData);
	system.data = filteredData;
	document.getElementById("content").style.filter = "blur(5px)";
	system.updateVis();
}

function getMethodCount(datar){
	const counts = {};
	datar.forEach(d => {
		if (!counts[d.discoverymethod]) {
		  counts[d.discoverymethod] = 1;
		} else {
		  counts[d.discoverymethod]++;
		}
	});
	// Convert the counts object to an array of objects
	dataArray = [];
	for (let key in counts) {
		dataArray.push({key: key, count: counts[key]});
	}
	return dataArray;
}

function getTypeCount(datar){
	const counts = {'A': 0, 'F': 0, 'G': 0, 'K': 0, 'M': 0, 'N/A': 0 };
	datar.forEach(d => {
		if (['A', 'F', 'G', 'K', 'M', 'undefined'].includes(d.st_spectype[0])) {
			counts[d.st_spectype[0]] = counts[d.st_spectype[0]] + 1 || 1;
		} else {
			counts['N/A'] = counts['N/A'] + 1 || 1;
		}
	});

	// Convert the counts object to an array of objects
	const dataArray = [];
	for (let key in counts) {
		dataArray.push({key: key, count: counts[key]});
	}
	return dataArray;
}

function getPlanetCount(datar) {
	const counts = {};
	datar.forEach(d => {
		if (!counts[d.sy_pnum]) {
		  counts[d.sy_pnum] = 1;
		} else {
		  counts[d.sy_pnum]++;
		}
	});

	// Convert the counts object to an array of objects
	const dataArray = [];
	for (let key in counts) {
		dataArray.push({key: key, count: counts[key]});
	}
	return dataArray;
}

function getStarCount(datar) {
	const counts = {};
	datar.forEach(d => {
		if (!counts[d.sy_snum]) {
		  counts[d.sy_snum] = 1;
		} else {
		  counts[d.sy_snum]++;
		}
	});

	// Convert the counts object to an array of objects
	const dataArray = [];
	for (let key in counts) {
		dataArray.push({key: key, count: counts[key]});
	}
	return dataArray;
}

function getYearCount(datar){
	const counts = {};
	datar.forEach(d => {
		if (!counts[d.disc_year]) {
		  counts[d.disc_year] = 1;
		} else {
		  counts[d.disc_year]++;
		}
	});

	// Convert the counts object to an array of objects
	const dataArray = [];
	for (let key in counts) {
		dataArray.push({key: key, count: counts[key]});
	}
	return dataArray;
}

function getScatterData(data){
	filteredData = data.filter( d => d.pl_bmasse != "" );
	filteredData.sort((a, b) => d3.descending(a.pl_name, b.pl_name));
	filteredData = filteredData.filter( d => d.pl_rade != "" );
	return filteredData; // Add solar system data to scatterplot
}

function getHabitabilityCount(datar){
	const counts = {'Habitable': 0, 'Too Cold': 0, 'Too Hot': 0};
	datar.forEach(d => {
	  switch (d.st_spectype[0]) {
		case 'A':
		  if (d.pl_orbsmax >= 8.5 && d.pl_orbsmax <= 12.5) {
			counts['Habitable']++;
		  } else if (d.pl_orbsmax < 8.5) {
			counts['Too Cold']++;
		  } else {
			counts['Too Hot']++;
		  }
		  break;
		case 'F':
		  if (d.pl_orbsmax >= 1.5 && d.pl_orbsmax <= 2.2) {
			counts['Habitable']++;
		  } else if (d.pl_orbsmax < 1.5) {
			counts['Too Cold']++;
		  } else {
			counts['Too Hot']++;
		  }
		  break;
		case 'G':
		  if (d.pl_orbsmax >= 0.95 && d.pl_orbsmax <= 1.4) {
			counts['Habitable']++;
		  } else if (d.pl_orbsmax < 0.95) {
			counts['Too Cold']++;
		  } else {
			counts['Too Hot']++;
		  }
		  break;
		case 'K':
		  if (d.pl_orbsmax >= 0.38 && d.pl_orbsmax <= 0.56) {
			counts['Habitable']++;
		  } else if (d.pl_orbsmax < 0.38) {
			counts['Too Cold']++;
		  } else {
			counts['Too Hot']++;
		  }
		  break;
		case 'M':
		  if (d.pl_orbsmax >= 0.08 && d.pl_orbsmax <= 0.12) {
			counts['Habitable']++;
		  } else if (d.pl_orbsmax < 0.08) {
			counts['Too Cold']++;
		  } else {
			counts['Too Hot']++;
		  }
		  break;
		default:
		  break;
	  }
	});
	// Convert the counts object to an array of objects
	const dataArray = [];
	for (let key in counts) {
		dataArray.push({key: key, count: counts[key]});
	}
	return dataArray;
}

function getHistoData(datar){
	const counts = {
		'0-50': 0, 
		'50-500': 0, 
		'500-1000': 0, 
		'1000-1500': 0, 
		'>1500': 0
	};
	
	datar.forEach(d => {
		if (d.sy_dist >= 0 && d.sy_dist < 50) {
			counts['0-50']++;
		} else if (d.sy_dist >= 50 && d.sy_dist < 500) {
			counts['50-500']++;
		} else if (d.sy_dist >= 500 && d.sy_dist < 1000) {
			counts['500-1000']++;
		} else if (d.sy_dist >= 1000 && d.sy_dist < 1500) {
			counts['1000-1500']++;
		} else if (d.sy_dist >= 1500) {
			counts['>1500']++;
		}
	});

	// Convert the counts object to an array of objects
	const dataArray = [];
	for (let key in counts) {
		dataArray.push({key: key, count: counts[key]});
	}
	return dataArray;
}

function buildTable(data) {
	// Remove any existing tables
	d3.selectAll("table").remove();
  
	// Define table properties
	const tableid = "#exoplanettable";
	const columns = ["Planet Name", "System Name", "Discover Facility", "Planet Radius (Re)", "Planet Mass (Me)"];

	const tableWidth = exoplanettable.offsetWidth;
	const tableHeight = exoplanettable.offsetHeight;

	// Define a descending sort function based on planet name
	const sortNameDescending = (a, b) => b.pl_name - a.pl_name;
  
	// Create the outer table
	const outerTable = d3.select(tableid).append("table")
		.attr("width", tableWidth + "px");
  
	// Create the header row
	const headerRow = outerTable
		.append("tr");

	const headerTable = headerRow
		.append("td")
		.append("table")
		.attr("class", "headerTable")
		.attr("width", tableWidth + "px");

	headerTable.append("tr")
		.selectAll("th")
		.data(columns)
		.enter()
		.append("th")
		.attr("width", tableWidth + "px")
		.style("font-family", "system-ui")
		.text(column => column);
  
	// Create the body of the table with scrollable div
	const bodyDiv = outerTable
		.append("tr")
		.append("td")
		.append("div")
		.attr("class", "scroll")
		.attr("style", `height: ${(tableHeight - 60) + "px"};`)
		.append("table")
		.attr("class", "bodyTable")
		.attr("border", 1)
		.attr("width", tableWidth + "px")
		.attr("height", tableHeight - 60)
		.attr("style", "table-layout: fixed");
  
	// Add rows to table
	const rows = bodyDiv.append("tbody")
		.selectAll("tr")
		.data(data)
		.enter()
		.append("tr")
		.sort(sortNameDescending)
		.style("text-align", "center");
  
	// Add cells to each row
	const cells = rows.selectAll("td")
		.data(d => columns.map(column => ({
			column,
			name: d.pl_name,
			sysName: d.sys_name,
			discFacility: d.disc_facility,
			planetRadius: d.pl_rade,
			planetMass: d.pl_bmasse
		})))
		.enter()
		.append("td")
		.text(d => {
			switch (d.column) {
				case columns[0]: return d.name;
				case columns[1]: return d.sysName;
				case columns[2]: return d.discFacility;
				case columns[3]: return d.planetRadius;
				case columns[4]: return d.planetMass;
				default: return "";
			}
		});
  
	// Click event (get specific exoplanet)
	cells.on("click", (event, d) => {
		let selectedPlanet = data.filter(da => da.pl_name == d.name);
		setExoplanet(selectedPlanet);
	});
}

function setExoplanetFromScatterplot(pl_name){
	let selectedPlanet = globalData.filter(da => da.pl_name == pl_name);
	if (pl_name == "Mercury" || pl_name == "Venus" || pl_name == "Earth" || pl_name == "Mars" || pl_name == "Jupiter" || pl_name == "Saturn" || pl_name == "Uranus" || pl_name == "Neptune"){
		setExoplanet("solarsystem")
	} else {
		setExoplanet(selectedPlanet);
	}
	
}
  
