const mininavbar = document.querySelectorAll('.navbarmini-item');
const hawkerList = document.querySelectorAll('.hawkercentreItem');
const hawkercentresList = document.querySelector('#hawkercentresList');
const showAll = document.querySelector('.show-all');

for (const navLetter of mininavbar ) {
    navLetter.addEventListener('click', () => {
        hawkercentresList.innerHTML = '';
        
        const letter = navLetter.textContent;
        const listToBeShown = [];
        for (const hawkerItem of hawkerList) {
            if (hawkerItem.textContent.charAt(0) === letter) {
                listToBeShown.push(hawkerItem.textContent);
            }
        }
        listToBeShown.forEach( (item) => {
            const listItem  = `<li class="hawkercentreItem"><a href="/hawkercentre?name=${item}">${item}</a></li>`
            hawkercentresList.innerHTML += listItem;
        }); 
    }) 
}

showAll.addEventListener('click', () => {
    hawkercentresList.innerHTML = '';

    for (const hawkerItem of hawkerList ) {
        const eachHawkerCentre = `<li class="hawkercentreItem"><a href="/hawkercentre?name=${hawkerItem.textContent}">${hawkerItem.textContent}</a></li>`
        hawkercentresList.innerHTML += eachHawkerCentre;
    }
});

//geolocation to get nearest hawker centres


function distance(lat1, lon1, lat2, lon2) {
    const p = 0.017453292519943295;    // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + 
           c(lat1 * p) * c(lat2 * p) * 
           (1 - c((lon2 - lon1) * p))/2;
 
   return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

const getNearestHawkerCentre = async () => {

    let userLongitude;
    let userLatitude;   
           

    try {
        const res = await fetch('/hawkercentre/coordinates', {
            method: 'GET',            
            headers: {'Content-Type': 'application/json'}
        });
        const data = await res.json();
        
        const options = {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0
          };
            
        function success(pos) {
            const crd = pos.coords;
            userLongitude = crd.longitude;
            userLatitude = crd.latitude;

            const distanceList = [];

            for (const element of data) {
                const distanceFromHawkerCentre = distance(userLatitude, userLongitude, element.latitude, element.longitude);            
                distanceList.push(distanceFromHawkerCentre);
            }

            const originalList = [...distanceList];
            
            //getting minimum distance
            distanceList.sort();
            const nearestHawkerList = document.querySelector('#nearestHawkers');
            nearestHawkerList.innerHTML = '';
            const indexOfThreeNearest = [];
            let searchHawkerCentre;

            for (let i=0; i<3; i++) {
                indexOfThreeNearest.push(originalList.indexOf(distanceList[i]));
                
                if (data[indexOfThreeNearest[i]].name.includes("BLK")) {
                    const tempArray = data[indexOfThreeNearest[i]].name.split(" ");
                    let blk, blknumber, rest;
                    [blk, blknumber, ...rest] = tempArray;
                    searchHawkerCentre = `${rest.join(' ')} BLK ${blknumber}`;
                    
                } else if (data[indexOfThreeNearest[i]].name.includes("BLKS")) {
                    const tempArray = data[indexOfThreeNearest[i]].name.split(" ");
                    let blk, blknumber, rest;
                    [blk, blknumber, ...rest] = tempArray;
                    searchHawkerCentre = `${rest.join(' ')} BLKS ${blknumber} `;   
                         
                } else {
                    searchHawkerCentre = data[indexOfThreeNearest[i]].name;
                }    

                nearestHawkerList.innerHTML += `<li><a href="/hawkercentre?name=${searchHawkerCentre}">${searchHawkerCentre}</a></li>`
            }
                        
        }
            
        function error(err) {
            console.warn(`ERROR(${err.code}): ${err.message}`);
        }
            
        navigator.geolocation.getCurrentPosition(success, error, options); 

                
    }

    catch (err) {
        console.log(err);
    }

}

getNearestHawkerCentre();

// let count = 0;

// for (coordinate of coordinates) {
// let distanceTaxi = distance(redhillLat, redhillLong, coordinate[1], coordinate[0]);
// if (distanceTaxi <= 1) {
//     count++;
// }
// }