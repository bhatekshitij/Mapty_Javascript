'use strict';

// prettier-ignore


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class workout {

    date = new Date();
    id = Date.now(); // for taking only last digits from date and assigning it to id, ' ' is done to convert the date into string and then assign it to id, a unique identifiaction stuf
    //    id = (Date.now() + '').slice(-10);



    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;


    }

    setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.Description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
        /*${this.type[0].toUppercase()}*/

    }
}


class Running extends workout {
    type = 'running';
    constructor(coords, distance, duration, cadence) {  /// as this is the child class of workout(parent) we first call all the parametres of the parent and then the child, and that's why first coords, distance, duration coming from parents and then cadence coming from childclass itself.
        super(coords, distance, duration); // super keyword to access elements from the parents class, just as we use in java to inherit the properties of parent class;

        this.cadence = cadence;  // intializing the object pointing to variable to the local class variable.
        this.calcPace();
        this.setDescription();


    }
    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;

    }


}

class Cycling extends workout {
    type = 'cycling';

    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;

        this.calcSpeed();

        this.setDescription();
    }
    calcSpeed() {


        this.speed = this.distance / (this.duration / 60);
        return this.speed;

    }


}

const run = new Running([2.3, 55.6], 15, 552, 23);
const cycl = new Cycling([12.3, 75.6], 58, 52, 78);
console.log(run, cycl);





///////////////////////////////
//APPLIACTION ARCHITECTURE
class App {
    #map;
    #mapEvent;
    #mapE
    #workoutstotal = [];

    // created this so that this property is present on every instance of the class called, according to the current thinking it seems that as every instance of class will have its own map data so thats why its made seperate for every instance.

    constructor() {

        this._getPosition();
        //  this._loadMap();

        this._getLocalStorage();

        form.addEventListener('submit', this._newWorkout.bind(this));

        inputType.addEventListener('change', this._toggleElevationField)

        inputType.addEventListener('submit', this._renderWorkout.bind(this));

        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));

    }



    _getPosition() {

        navigator.geolocation.getCurrentPosition(
            this._loadMap.bind(this),
            function () {
                alert('Could not get your location');
            })
    }





    _loadMap(position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;

        console.log(longitude);
        console.log(position.coords);
        console.log(`https://www.google.co.in/maps/@${latitude},${longitude}`);
        const coords = [latitude, longitude];

        this.#map = L.map('map').setView(coords, 13);  // the 'map' in L.map is the id of the div from the html saying where to exactly place the map, in this case the map is supposed to be placed in the div element having the id of map  

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);


        this.#map.on('click', this._showForm.bind(this));


        this.#workoutstotal.forEach(work => this.renderWorkoutMarker(work)); /// this function is for loading markers from the local storage, it is not stored at the beginning as the map should be declared first and then should be retrived from the local storage.

    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
    }

    _hideForm() {
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';
        form.classList.add('hidden');

    }



    _toggleElevationField() {

        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }





    _newWorkout(e) { /// this method is just to implement the other classes defined outside of the main architecture, that workout as parent and running and cycling as its children. those classes will be called by this method.


        const validinputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));        ///// this arrow function figures out wheather the number is valid or not , in this case it is based on true or false, if the number.is finite return false then we check again at the if condition wheather it return false or true based on that the return alert is called
        const allPositives = (...inputs) => inputs.every(inp => inp > 0);
        let workout;

        e.preventDefault();
        console.log(this);
        //console.log(coords);


        //Get daata from the form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng; // moved from line 207, if not declared first over here then it will cause error in creating object of running class as it requires the data from lat and lng, if this is declared afterwards then it won't find this in scope as it declared after it was called which is actually not possible, you cannot call a variable before declaring it\



        //If workout running then create running object

        if (type === 'running') {
            const cadence = +inputCadence.value;


            //Check if data makes sense
            if (validinputs(distance, duration, cadence) || !allPositives(distance, duration, cadence)) {// calling the arrow function valid inputs, if the input are valid then the if condition is not executed and if its false then the alert is triggered
                return alert('input right numbers');

            }

            workout = new Running([lat, lng], distance, duration, cadence);  /// let workout is not declared because workout variable is decalred inside the if paranthesis and hence is not accessible for pushing it to array


        }

        // if Workout cycling then create cycling object

        if (type === 'cycling') {
            const elevation = +inputElevation.value;

            if (validinputs(distance, duration, elevation) || !allPositives(distance, duration)) {
                return alert('input right numbers');
            }
            workout = new Cycling([lat, lng], duration, distance, elevation);


        }


        //Add new object to the workout array

        this.#workoutstotal.push(workout);
        console.log(workout);
        console.log(this.#workoutstotal.coords);


        //render workout on map as marker

        this.renderWorkoutMarker(workout);


        // Render workout as a list 
        this._renderWorkout(workout);

        // Hide + clear Form

        this._hideForm();


        // store to local storage
        this._setLocalStorage();


        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /* e.preventDefault();
         const { lat, lng } = this.#mapEvent.latlng;
         L.marker([lat, lng]).addTo(this.#map)
             .bindPopup(L.popup({
                 maxWidth: 250,
                 minWidth: 100,
                 autoClose: false,
                 closeOnClick: false,
                 className: 'running-popup',
 
             }))
             .setPopupContent('workout')
             .openPopup();
 
 
         inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';*/


        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    }

    renderWorkoutMarker(workout) {
        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`,

            }))
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.Description}`)
            .openPopup();



    }


    _renderWorkout(workout) {

        console.log(workout);
        let html = `<li class="workout workout--${workout.type}" data-id="${workout.id} ">
            <h2 class="workout__title" > ${workout.Description}</ >
        <div class="workout__details">
          <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} </span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div >
            <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${workout.duration}</span>
                <span class="workout__unit">min</span>
            </div>`;


        if (workout.type === 'running') {
            html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace}</span>
                <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">spm</span>
                </div>
                </li>`;



        }

        if (workout.type === `cycling`) {
            html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">km/h</span>
            </div >
            <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
            </div>
            </li > `

            console.log(html);
        }

        form.insertAdjacentHTML('afterend', html)

    }

    _moveToPopup(e) {
        const workOutEl = e.target.closest('.workout');
        //console.log(workOutEl);

        if (!workOutEl) return;
        // console.log(this.#workoutstotal);

        //const workout = this.#workoutstotal[0].id === workOutEl.dataset.id;
        //console.log(this.#workoutstotal[0]);

        console.log(workout);
        //const workout = workOutEl.dataset.id;
        //console.log(workout);


        // this.#map.setView(workOutEl.coords, 13)



    }

    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workoutstotal));

    }

    _getLocalStorage() {
        const data = localStorage.getItem('workouts');

        if (!data) return;

        const dataAlready = JSON.parse(localStorage.getItem('workouts'));

        this.#workoutstotal = dataAlready;

        this.#workoutstotal.forEach(work => this._renderWorkout(work));
        //  this.#workoutstotal.forEach(work => this.renderWorkoutMarker(work));


        //console.log(data);

    }

    reset() {
        localStorage.removeItem('workouts');
        location.reload();


    }
}


const a1 = new App();


