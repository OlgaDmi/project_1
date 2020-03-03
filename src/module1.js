function mapBuild() {
const placemarks = require('./data.json');

ymaps.ready(function () {
    const balloonLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="popover top" id="$[properties.coords]">' +
        '<a class="close" href="#">&times;</a>' +
        '<div class="arrow"></div>' +
        '<div class="popover-inner">' +
            '<h3 class="popover-title"><i class="fa fa-small fa-map-marker" aria-hidden="true"></i>&#8195$[properties.balloonHeader]</h3>' +
                '<div class="reviews">'+
                '$[properties.review] ' +
                '</div>'+
                '<div class="bottom">' +
                '<div class="bottom__text">Ваш отзыв</div>' +
                '<form class="bottom__form">' +
                '<input type="text" id="name" value="" placeholder="Ваше имя">' +
                '<input type="text" id="place" value="" placeholder="Укажите место">' +
                '<input type="text" id="comment" value="" placeholder="Поделитесь впечатлениями">' +
                '<button id="add_rewiew">Добавить</button>' +
                '</form>' +
                '</div>' +
        '</div>' +
        '</div>', 
        {
            build: function () {
                this.constructor.superclass.build.call(this);
                this._$element = $('.popover', this.getParentElement());
                this.applyElementOffset();
                this._$element.find('.close')
                .on('click', $.proxy(this.onCloseClick, this));
            },
            clear: function () {
                this._$element.find('.close')
                .off('click');
                this.constructor.superclass.clear.call(this);
            },
            applyElementOffset: function () {
                this._$element.css({
                    left: -(this._$element[0].offsetWidth / 2),
                    top: -(this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight)
                });
            },
            onCloseClick: function (e) {
                e.preventDefault();
                this.events.fire('userclose');
            },
            getShape: function () {
                if(!this._isElement(this._$element)) {
                    return MyBalloonLayout.superclass.getShape.call(this);
                }
                let position = this._$element.position();

                return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                    [position.left, position.top], [
                        position.left + this._$element[0].offsetWidth,
                        position.top + this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight
                    ]
                ]));
            },
            _isElement: function (element) {
                return element && element[0] && element.find('.arrow')[0];
            }
        })
    const MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
        '<i class="fa fa-big fa-map-marker" aria-hidden="true"></i>'
    );      
    const clasterContentLayout = ymaps.templateLayoutFactory.createClass(`
        <div class="cluster__header"><b>{{ properties.place|raw }}</b></div>
        <div class="cluster__link"><a href="#{{ properties.coords|raw }}" class="search_by_address">{{ properties.balloonHeader|raw }}</a></div>
        <div class="cluster__review">{{ properties.text|raw }}</div>
        <div class="cluster__review date">{{ properties.date|raw }}</div>`);

    const clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons', // стили кластера
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        balloonLayout: 'islands#balloon', // переопределяем кастомный popup на стандартный
        clusterBalloonItemContentLayout: clasterContentLayout,
        clusterBalloonPanelMaxMapArea: 0, // не будет открываться в режиме панели
        clusterBalloonPagerSize: 5, // кол-во страниц
        groupByCoordinates: false, // если true то группирует только с одинаковыми координатами
        clusterDisableClickZoom: true, // отключаем зумирование при клике на кластер
        clusterHideIconOnBalloonOpen: false,
    });

    const myMap = new ymaps.Map('map', {
        center: [59.93181443, 30.36136798],
        zoom: 16,
        controls: ['zoomControl', 'fullscreenControl']
    }, { balloonLayout });

    myMap.events.add('click', e => {
        let target = e.get('target');
        let coords = e.get('coords');
        let adress;
        ymaps.geocode(coords).then(res => {
            adress = res.geoObjects.get(0).getAddressLine();
        });
        let baloon = myMap.balloon.open(coords);
        document.addEventListener('click', e => {
            let target = e.target;
            let btn = document.querySelector('form #add_rewiew');
            if (target === btn) {
                console.log('bom');
                e.preventDefault();
                addReview(coords, adress);
            }
        })
    });



function addReview(coords, adress) {
    let name = document.querySelector('form #name').value;
    let place = document.querySelector('form #place').value;
    let comment = document.querySelector('form #comment').value;
    let date = getDate();
    let header = document.querySelector('.popover-title');
    header.innerHTML = `<i class="fa fa-small fa-map-marker" aria-hidden="true"></i>&#8195 ${adress}`;

    if(name != '' & place != '' & comment != '') {
        let reviews = document.querySelector('.reviews');
        let newReview = document.createElement('div');
        let newReviewName = document.createElement('div');
        let newReviewText = document.createElement('div');

        newReview.setAttribute('class', 'reviews__item');
        newReviewName.setAttribute('class', 'reviews__item_name');
        newReviewText.setAttribute('class', 'reviews__item_text');
        newReviewName.innerHTML= `<b>${name}</b> ${place} ${date}`;
        newReviewText.innerText = comment;
        reviews.appendChild(newReview);
        newReview.appendChild(newReviewName);
        newReview.appendChild(newReviewText);
        let review = { name: name, place: place, text: comment, date: date};

            addMark(coords, adress, review, place, date, comment);
            newMark(coords, adress, review, place, date, comment);
        // if(!placemarks.find(item => item.adress == adress)){
        //     console.log('other adress');
        //     // addMark(coords, adress, review, place, date, comment);
        //     newMark(coords, adress, review, place, date, comment);
        // } 
        // else {
        //      console.log('same adress');
        //     let item = placemarks.find(item => item.adress == adress);
        //     // item.review.push(review);
        //     newMark(coords, adress, review, place, date, comment);
        // }
    }
}

function getDate() {
    let newDate = new Date();
    let options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timezone: 'UTC',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };

    newDate = newDate.toLocaleString("ru", options);
    return newDate;
}

function addMark(coords, adress, review, place, date, comment) {
    placemarks.push(
    { 
        coords: coords,
        adress: adress,
        review: [ review ],
        place:  place,
        date: date,
        text: comment
    }
    ); 

}

function newMark(coords, adress, review, place, date, comment) {
    //     placemarks.forEach(item => {
    //     let arrRev = item.review;

    //     function review(arrRev) {
    //             let arr = [];
    //             for (let i = 0; i < arrRev.length; i++) {
    //                 arr.push(`<div class="reviews__item"><div class="reviews__item_name"><b>${arrRev[i].name}</b> ${arrRev[i].place} ${arrRev[i].date}</div>
    //                 <div class="reviews__item_text">${arrRev[i].text}</div></div>`);
    //             }
    //             return arr.join('');
    //         };  

    //     let newReview = review(arrRev);      
    //     const point = new ymaps.Placemark(item.coords, {
    //         balloonHeader: item.adress,
    //         review: newReview,
    //         place: item.review[0].place,
    //         date: item.review[0].date,
    //         text: item.review[0].text

    //     }, 
    //     {
    //         iconLayout: 'default#imageWithContent',
    //         iconImageHref: '',
    //         iconContentLayout: MyIconContentLayout,
    //         iconImageOffset: [-15, -50]
    //     }
    //     );
    //     console.log(placemarks);
    //     clusterer.add(point);
    // });
        function buildReview(review) {
                // console.log(review.name);
                let arr = (`<div class="reviews__item"><div class="reviews__item_name"><b>${review.name}</b> ${review.place} ${review.date}</div>
                <div class="reviews__item_text">${review.text}</div></div>`);
                return arr;
            };  

        let newReview = buildReview(review);      
        const point = new ymaps.Placemark(coords, {
            coords: coords,
            balloonHeader: adress,
            review: newReview,
            place: place,
            date: date,
            text: comment
        }, 
        {
            iconLayout: 'default#imageWithContent',
            iconImageHref: '',
            iconContentLayout: MyIconContentLayout,
            iconImageOffset: [-15, -50]
        }
        );

        console.log(point);
        console.log(placemarks);
        clusterer.add(point);
    myMap.geoObjects.add(clusterer);
}

function addA() {
    let clusterA = document.querySelector('.search_by_address');
    let coords = ;
    clusterA.addEventListener('click', e => {

    })

}

});
}
export {
   mapBuild
};