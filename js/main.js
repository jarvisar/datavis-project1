console.log("Hello world");
document.getElementById("reset-button").disabled = true;
var filterApplied = false;
let globalData;

d3.csv('data/exoplanets-1.csv')
  .then(data => {
  	console.log('Data loading complete. Work with dataset.');
	var loading = document.getElementById("loading");
	loading.classList.add("loading");
	setTimeout(function() {
	globalData = data;

		// Reset data
		d3.selectAll('.help-button').on('click', function() {
			window.open('https://exoplanets.nasa.gov/alien-worlds/ways-to-find-a-planet/');
		});

	// Discovery Method Bar Chart
	let methodBar = new BarChart({
		'parentElement': '#methodbar',
		'containerHeight': 400,
		'containerWidth': 500
	}, getMethodCount(data), "Exoplanets by Discovery Method", (filterData) => {
		let selectedFilter = [filterData];
		let filteredData = data.filter(d => selectedFilter.includes(d.discoverymethod))
		updateData(filteredData);
	}, "#66d9ef");


  	// # of Stars in System Bar Chart
	let systemStarBar = new BarChart({
		'parentElement': '#starbar',
		'containerHeight': 400,
		'containerWidth': 300
	}, getStarCount(data), "Exoplanets by # of Stars in their System", (filterData) => {
		let selectedFilter = [filterData];
		let filteredData = data.filter(d => selectedFilter.includes(d.sy_snum));
		updateData(filteredData);
	}, '#0483e9');


	// # of Planets in System Bar Chart
	let systemPlanetBar = new BarChart({
		'parentElement': '#planetbar',
		'containerHeight': 400,
		'containerWidth': 400
	}, getPlanetCount(data), "Exoplanets by # of Planets in their System", (filterData) => {
		let selectedFilter = [filterData];
		let filteredData = data.filter(d => selectedFilter.includes(d.sy_pnum))
		updateData(filteredData);
	}, '#104494');


	// Star Type Bar Chart
	let typeBar = new BarChart({
		'parentElement': '#typebar',
		'containerHeight': 400,
		'containerWidth': 400
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
		'containerHeight': 400,
		'containerWidth': 200
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


	// Exoplanet Distance Histogram
	let distanceHisto = new Histogram({
		'parentElement': '#distancehisto',
		'containerHeight': 400,
		'containerWidth': 300
	}, getHistoData(data), "Exoplanets by Distance", (filterData) => {
		let selectedFilter = [filterData]; // Get an array of selected bin ranges
		let filteredData = data.filter(d => {
			let dist = d.sy_dist;
			if (dist >= 0 && dist < 50 && selectedFilter.includes('0-50')) {
				return true;
			} else if (dist >= 50 && dist < 100 && selectedFilter.includes('50-100')) {
				return true;
			} else if (dist >= 100 && dist < 250 && selectedFilter.includes('100-250')) {
				return true;
			} else if (dist >= 250 && dist < 500 && selectedFilter.includes('250-500')) {
				return true;
			} else if (dist >= 500 && selectedFilter.includes('>500')) {
				return true;
			} else {
				return false;
			}
		});
		updateData(filteredData);
	}, '#648198');


	// Year Line Chart
	let yearLine = new Line({
		'parentElement': '#yearline',
		'containerHeight': 400,
		'containerWidth': 700
	}, getYearCount(data), (filterData) => {
		let selectedFilter = [filterData];
		let filteredData = data.filter(d => selectedFilter.includes(d.disc_year))
		updateData(filteredData);
	})


	// Scatterplot & Brush
	let scatterplot = new Scatterplot({
		'parentElement': '#scatterplot',
		'containerHeight': 400,
		'containerWidth': 800
	}, getScatterData(data), (filterData, shouldReset = false) => {
		if (filterData.length == 1){
			setExoplanet(filterData);
		} else {
			updateData(filterData);
			if (shouldReset){
				document.getElementById("reset-button").disabled = true;
			}
			scatterplot.data = getScatterData(data);
			scatterplot.updateVis();
		}
	})	
	var toggle = false;
	d3.selectAll('.toggle-brush-button').on('click', function() {

		if (toggle == false){
			scatterplot.updateVis(true);
			toggle = true
		} else if (toggle == true) {
			scatterplot.updateVis(false);
			toggle = false
		}
	});

	
	function updateData(filteredData){
		// Show the loading message
		var loading = document.getElementById("loading");
		loading.classList.add("loading");
		document.getElementById("reset-button").disabled = false;
		
		// Wait for 500 milliseconds before updating the visualizations
		setTimeout(function() {
			methodBar.data = getMethodCount(filteredData);
			systemStarBar.data = getStarCount(filteredData);
			systemPlanetBar.data = getPlanetCount(filteredData);
			typeBar.data = getTypeCount(filteredData);
			habitabilityBar.data = getHabitabilityCount(filteredData);
			distanceHisto.data = getHistoData(filteredData);
			yearLine.data = getYearCount(filteredData);
			buildTable(filteredData);
			methodBar.updateVis();
			typeBar.updateVis();
			systemStarBar.updateVis();
			systemPlanetBar.updateVis();
			habitabilityBar.updateVis();
			distanceHisto.updateVis();
			yearLine.updateVis();	
			// Hide the loading message
			loading.classList.remove("loading");
		}, 100);
	  }
	  

	// Reset data
	d3.selectAll('.reset-button').on('click', function() {
		resetData();
	});

	function resetData(){
		// Show the loading message
		var loading = document.getElementById("loading");
		loading.classList.add("loading");
		document.getElementById("reset-button").disabled = true;

		setTimeout(function() {
			document.getElementById("reset-button").disabled = true;
			methodBar.data = getMethodCount(data);
			console.log(methodBar.data);
			systemStarBar.data = getStarCount(data);
			systemPlanetBar.data = getPlanetCount(data);
			typeBar.data = getTypeCount(data);
			habitabilityBar.data = getHabitabilityCount(data);
			distanceHisto.data = getHistoData(data);
			yearLine.data = getYearCount(data);
			scatterplot.data = getScatterData(data);
			buildTable(data);
			methodBar.updateVis();
			typeBar.updateVis();
			systemStarBar.updateVis();
			systemPlanetBar.updateVis();
			habitabilityBar.updateVis();
			distanceHisto.updateVis();
			yearLine.updateVis();
			scatterplot.updateVis();
			loading.classList.remove("loading");
		}, 100);
	}

	buildTable(data);
	loading.classList.remove("loading");
	}, 100);
})
.catch(error => {
    console.error('Error loading the data');
	console.error(error);
});

function setExoplanet(exoplanetData){
	document.getElementById("reset-button").disabled = false;
	buildTable(exoplanetData);
	
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
	console.log(dataArray) ;
	return dataArray;
}

function getScatterData(datar){
	// Convert the counts object to an array of objects
	let filteredData = datar.filter(d => d.pl_rade != "" && d.pl_bmasse != "");
	return filteredData;
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
		'50-100': 0, 
		'100-250': 0, 
		'250-500': 0, 
		'>500': 0
	};
	
	datar.forEach(d => {
		if (d.sy_dist >= 0 && d.sy_dist < 50) {
			counts['0-50']++;
		} else if (d.sy_dist >= 50 && d.sy_dist < 100) {
			counts['50-100']++;
		} else if (d.sy_dist >= 100 && d.sy_dist < 250) {
			counts['100-250']++;
		} else if (d.sy_dist >= 250 && d.sy_dist < 500) {
			counts['250-500']++;
		} else if (d.sy_dist >= 500) {
			counts['>500']++;
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
	const tableid = "#dataTable";
	const columns = ["Planet Name", "System Name", "Discover Facility", "Planet Radius", "Planet Mass"];
	const tableWidth = dataTable.offsetWidth;
	const tableHeight = dataTable.offsetHeight;
	const twidth = (tableWidth - 25) + "px";
	const divHeight = (tableHeight - 60) + "px";
  
	// Define functions for extracting data from each row
	const nameFunc = (data) => data.pl_name;
	const sysNameFunc = (data) => data.sys_name;
	const discFacilityFunc = (data) => data.disc_facility;
	const planetRadiusFunc = (data) => data.pl_rade;
	const planetMassFunc = (data) => data.pl_bmasse;
  
	// Define a descending sort function based on planet name
	const sortNameDescending = (a, b) => nameFunc(b) - nameFunc(a);
  
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
		.attr("width", twidth)
		.style("font-family", "system-ui")
		.text(column => column);
  
	// Create the body of the table with scrollable div
	const bodyDiv = outerTable
		.append("tr")
		.append("td")
		.append("div")
		.attr("class", "scroll")
		.attr("style", `height: ${divHeight};`)
		.append("table")
		.attr("class", "bodyTable")
		.attr("border", 1)
		.attr("width", twidth)
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
			name: nameFunc(d),
			sysName: sysNameFunc(d),
			discFacility: discFacilityFunc(d),
			planetRadius: planetRadiusFunc(d),
			planetMass: planetMassFunc(d)
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
		console.log(selectedPlanet);
	});
}
  
