console.log("Hello world");

d3.csv('data/exoplanets-1.csv')
  .then(data => {
  	console.log('Data loading complete. Work with dataset.');


	// Discovery Method Bar Chart
	let methodBar = new BarChart({
		'parentElement': '#methodbar',
		'containerHeight': 400,
		'containerWidth': 300
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
		'containerWidth': 300
	}, getPlanetCount(data), "Exoplanets by # of Planets in their System", (filterData) => {
		let selectedFilter = [filterData];
		let filteredData = data.filter(d => selectedFilter.includes(d.sy_pnum))
		updateData(filteredData);
	}, '#104494');


	// Star Type Bar Chart
	let typeBar = new BarChart({
		'parentElement': '#typebar',
		'containerHeight': 400,
		'containerWidth': 300
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
		'containerWidth': 300
	}, getHabitabilityCount(data), "Exoplanets by Habitability", (filterData) => { 
		let selectedFilter = [filterData];
		updateData(data);
	}, '#a1e9f7');

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

	// Scatterplot
	let scatterplot = new Scatterplot({
		'parentElement': '#scatterplot',
		'containerHeight': 400,
		'containerWidth': 700
	}, data)

	
	function updateData(filteredData){
		methodBar.data = getMethodCount(filteredData);
		systemStarBar.data = getStarCount(filteredData);
		systemPlanetBar.data = getPlanetCount(filteredData);
		typeBar.data = getTypeCount(filteredData);
		habitabilityBar.data = getHabitabilityCount(filteredData);
		yearLine.data = getYearCount(filteredData);
		methodBar.updateVis();
		typeBar.updateVis();
		systemStarBar.updateVis();
		systemPlanetBar.updateVis();
		habitabilityBar.updateVis();
		yearLine.updateVis();
	}

	d3.selectAll('.reset-button').on('click', function() {
		resetData();
	});

	function resetData(){
		methodBar.data = getMethodCount(data);
		console.log(methodBar.data);
		systemStarBar.data = getStarCount(data);
		systemPlanetBar.data = getPlanetCount(data);
		typeBar.data = getTypeCount(data);
		habitabilityBar.data = getHabitabilityCount(data);
		yearLine.data = getYearCount(data);
		methodBar.updateVis();
		typeBar.updateVis();
		systemStarBar.updateVis();
		systemPlanetBar.updateVis();
		habitabilityBar.updateVis();
		yearLine.updateVis();
	}
})
.catch(error => {
    console.error('Error loading the data');
	console.error(error);
});

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
	const dataArray = [];
	datar.forEach(d => {
		dataArray.push({pl_name: d.pl_name, radius: d.pl_rade, mass: d.pl_bmasse});
	});
	console.log(dataArray) ;
	return dataArray;
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
