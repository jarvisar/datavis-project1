console.log("Hello world");

d3.csv('data/exoplanets-1.csv')
  .then(data => {
  	console.log('Data loading complete. Work with dataset.');
    console.log(data);


  	// Create an instance (for example in main.js)
		let systemStarBar = new SystemStarBar({
			'parentElement': '#starbar',
			'containerHeight': 400,
			'containerWidth': 300
		}, data);
		
		let systemPlanetBar = new SystemPlanetBar({
			'parentElement': '#planetbar',
			'containerHeight': 400,
			'containerWidth': 300
		}, data);
		
		let typeBar = new TypeBar({
			'parentElement': '#typebar',
			'containerHeight': 400,
			'containerWidth': 300
		}, data);
		
		let methodBar = new MethodBar({
			'parentElement': '#methodbar',
			'containerHeight': 400,
			'containerWidth': 300
		}, data);
		
		
		let habitabilityBar = new HabitabilityBar({
			'parentElement': '#habitablebar',
			'containerHeight': 400,
			'containerWidth': 300
		}, data);

})
.catch(error => {
    console.error('Error loading the data');
	console.error(error);
});