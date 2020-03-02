function mapBuild() {
const placemarks = require('./data.json');

ymaps.ready(function () {
    const balloonLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="popover top">' +
        '<a class="close" href="#">&times;</a>' +
        '<div class="arrow"></div>' +
        '<div class="popover-inner">' +
            '<h3 class="popover-title"><i class="fa fa-small fa-map-marker" aria-hidden="true"></i>&#8195$[properties.balloonHeader]</h3>' +
                '<div class="reviews">$[properties.reviews]</div>'+
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
                console.log('build');
                this.constructor.superclass.build.call(this);
                this._$element = $('.popover', this.getParentElement());
                this.applyElementOffset();
                this._$element.find('.close')
                .on('click', $.proxy(this.onCloseClick, this));
            },
            clear: function () {
                console.log('clear');
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
                console.log('onCloseClick');
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
        <div class="cluster__header">Заголовок</div>
        <div class="cluster__link"><a class="search_by_address">{{ properties.adress|raw }}</a></div>
        <div class=cluster__review>{{ properties.review|raw }}</div>`);

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

    // myMap.options.set({ balloonLayout });

    myMap.events.add('click', e => {
        let target = e.get('target');

        if (!myMap.balloon.isOpen()) {
            const coords = e.get('coords');
            let adress;
            ymaps.geocode(coords).then(res => {
                adress = res.geoObjects.get(0).getAddressLine();
            });
            let baloon = myMap.balloon.open();
            document.addEventListener('click', e => {
                    e.preventDefault();
                    let target = e.target;
                    let btn = document.querySelector('form #add_rewiew');
                    if(target === btn){
                        addReview(coords, adress);
                    }
            })
        }
    });



function addReview(coords, adress) {
    let name = document.querySelector('form #name').value;
    let place = document.querySelector('form #place').value;
    let comment = document.querySelector('form #comment').value;
    let date = getDate();

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
        if(!placemarks.find(item => item.adress == adress)){
            addMark(coords, adress, newReview);
        } else {
            placemarks.review.push(newReview);
        }


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

function addMark(coords, adress, newReview) {
    placemarks.push(
    { 
        coords: coords,
        adress: adress,
        review: [newReview]
    }
    );
console.log(placemarks);
newMark();
}

function newMark() {
        placemarks.forEach(item => {
        const point = new ymaps.Placemark(item.coords, {
            balloonHeader: item.adress,
            review: item.review
            // reviews__item_name: placemarks[i].name,
            // reviews__item_place: placemarks[i].place,
            // date: item.date,
            // reviews__item_text: placemarks[i].text
        }, 
        {
            iconLayout: 'default#imageWithContent',
            iconImageHref: '',
            iconContentLayout: MyIconContentLayout,
            iconImageOffset: [-15, -50]
        }
        );

        clusterer.add(point);
    });

    myMap.geoObjects.add(clusterer);
}




    // const myPlacemark = function() {
    //     for (let i = 0; i < placemarks.length; i++) {
    //         newMark[i] = new ymaps.Placemark([placemarks[i].latitude, placemarks[i].longitude], {
    //             balloonHeader: placemarks[i].adress,
    //             reviews__item_name: placemarks[i].name,
    //             reviews__item_place: placemarks[i].place,
    //             date: placemarks[i].date,
    //             reviews__item_text: placemarks[i].text
    //         },
    //         {
    //             balloonShadow: false,
    //             balloonLayout: MyBalloonLayout,
    //             balloonContentLayout: MyBalloonContentLayout,
    //             balloonPanelMaxMapArea: 0,
    //             iconLayout: 'default#imageWithContent',
    //             iconImageHref: '',
    //             iconContentLayout: MyIconContentLayout,
    //             iconImageOffset: [-15, -50],
    //             hideIconOnBalloonOpen: false
    //         });
    //         myMap.geoObjects.add(newMark[i]);
    //     };
    //  };

    //  myPlacemark();

    // myMap.geoObjects.add(myPlacemark);



    // const clasterContentLayout = ymaps.templateLayoutFactory.createClass(`
    //     <div class="cluster__header">Заголовок</div>
    //     <div class="cluster__link"><a class="search_by_address">{{ properties.address|raw }}</a></div>
    //     <div class=cluster__review>{{ properties.review|raw }}</div>`
    // );
  
    
    // placemarks.forEach(item => {
    //     const mark = new ymaps.Placemark(item.coords, {
    //         balloonHeader: item.address,
    //         reviews__item_name: item.name,
    //         reviews__item_place: item.place,
    //         date: item.date,
    //         reviews__item_text: item.text
    //     }, {
    //         balloonShadow: false,
    //         balloonLayout: MyBalloonLayout,
    //         balloonContentLayout: MyBalloonContentLayout,
    //         balloonPanelMaxMapArea: 0,
    //         iconLayout: 'default#imageWithContent',
    //         iconImageHref: '',
    //         iconContentLayout: MyIconContentLayout,
    //         iconImageOffset: [-15, -50],
    //         hideIconOnBalloonOpen: false
    //     });

    //     clusterer.add(mark);
    // });


});
}
export {
   mapBuild
};