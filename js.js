function MapCalculator({ maps, eleBtnCalc, eleRate, eleDistance } = {}) {
	this.maps = {};
	this.eleRate = document.querySelector(eleRate);
	this.eleDistance = document.querySelector(eleDistance);
	this.eleBtnCalc =  eleBtnCalc;
	this.prices = new Map([
		[[0, 4], 2],
		[[4, 5], 2.5],
		[[5, 6], 3],
		[[6, 8], 3.5],
		[[8, 10], 4],
		[[10, 12], 4.5],
		[[12, 14], 5.5],
		[[16, 18], 6],
		[[18, 20], 7],
		[[20, 23], 8],
	]);

	this.ini(maps);
	this.startListeners();
}
MapCalculator.prototype.ini = function(maps) {
	this.maps = {};

	if (maps == null)
		return;

	maps.forEach((value, key) => this.maps[key] = value);
}
MapCalculator.prototype.startListeners = function() {
	document.addEventListener("click", () => {
		if (event.target.matches(this.eleBtnCalc))
			this.calc();
	});
}
MapCalculator.prototype.getPoints = function () {
	return Object.values(this.maps).map((map) => map.selectedPoint);
}
MapCalculator.prototype.checkCalculationAvailability = function() {
	const points = this.getPoints();

	return points.length > 1 && points.every((point) => point != null);
}
MapCalculator.prototype.showResult = function({ distance, cost }) {
	this.eleDistance.textContent = `${distance.km} km`;

	if (cost)
		this.eleRate.textContent = cost;
	else
		this.eleRate.innerHTML = "<i>no calculable</i>";
}
MapCalculator.prototype.calcDistance = function(pointA, pointB) {
	const distance = google.maps.geometry.spherical.computeDistanceBetween(pointA, pointB);

	return { value: distance, km: (distance/1000).toFixed(2) };
}
MapCalculator.prototype.calc = function() {
	let points, distance, cost = false;

	points = this.getPoints();
	distance = this.calcDistance(points[0].coords, points[1].coords);

	this.prices.forEach((relativeCost, kilometerRange) => {
		if (distance.km > kilometerRange[0] && distance.km <= kilometerRange[1])
			cost = relativeCost;
	});

	this.showResult({ distance, cost });
}

function GeoMap({ id, eleInput } = {}) {
	this.eleId = id;
	this.eleInput = document.querySelector(eleInput);
	this.apiKey = "AIzaSyCW9M4eUbwlk9xbgC01c1F04vNKeCESslg";
	this.selectedPoint = {};
	this.autocomplete;
	this.iniCoords = [-2.185019916904568, -79.89617879132192];//[25.77481000000006, -80.19772999999998]; // miami coords
	this.centerLocally = true;

	this.ini();
	this.startListeners();
}
GeoMap.prototype.ini = function() {
	const center = { lat: 50.064192, lng: -130.605469 };
	// Create a bounding box with sides ~10km away from the center point
	const defaultBounds = {
		north: center.lat + 0.1,
		south: center.lat - 0.1,
		east: center.lng + 0.1,
		west: center.lng - 0.1,
	};
	this.autocomplete = new google.maps.places.Autocomplete(this.eleInput, {
		bounds: defaultBounds,
		componentRestrictions: { country: "ec" },
		fields: ["address_components", "geometry"],
		strictBounds: false,
		types: ["establishment"],
	});
}
GeoMap.prototype.getPlace = function(location) {
	const address = [];

	for (let i = 0; i < location.address_components.length - 1; i++)
		address.push((location.address_components[i] && location.address_components[i].short_name) || "");

	return address.join(" ");
}
GeoMap.prototype.getCoords = function(location) {
	let coords = location.geometry.location.toJSON();

	return new google.maps.LatLng(coords.lat, coords.lng);
}
GeoMap.prototype.startListeners = function() {
	this.autocomplete.addListener("place_changed", () => {
		const location = this.autocomplete.getPlace();
		let place, coords;

		if (location.address_components)
			place = this.getPlace(location);
		coords = this.getCoords(location);

		this.selectedPoint = { place, coords }
	});
}


function initMap() {
	document.addEventListener("DOMContentLoaded", async () => {
		const map1 = new GeoMap({ id: "map1", eleInput: "#point-a" });
		const map2 = new GeoMap({ id: "map2", eleInput: "#point-b" });
		const calc = new MapCalculator({
			maps: new Map([["maps1", map1], ["map2", map2]]),
			eleRate: "#calc-rate",
			eleDistance: "#calc-distance",
			eleBtnCalc: "#calc-btn"
		});
	});
}

window.initMap = initMap;

	
