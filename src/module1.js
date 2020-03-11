function mapBuild() {
    let placemarks = JSON.parse(localStorage.getItem('placemarks')) || [],
    coords, adress;

    ymaps.ready(function () {
        const balloonLayout = ymaps.templateLayoutFactory.createClass(
            '<div class="popover top">' +
            '<a class="close" href="#">&times;</a>' +
            '<div class="arrow"></div>' +
            '<div class="popover-inner">' +
            '<h3 class="popover-title"><i class="fa fa-small fa-map-marker" aria-hidden="true"></i>&#8195$[properties.review_adress]</h3>' +
            '<div class="reviews">'+  
            '<div class="reviews__item">' +
            '<div class="reviews__item_name"><b>$[properties.review_name]</b> $[properties.review_place] $[properties.review_date]</div>'+
            '<div class="reviews__item_text">$[properties.text]</div>' +
            '</div>'+
            '</div>'+
            '<div class="bottom">' +
            '<div class="bottom__text">Ваш отзыв</div>' +
            '<form class="bottom__form">' +
            '<input type="text" id="name" value="" placeholder="Ваше имя">' +
            '<input type="text" id="place" value="" placeholder="Укажите место">' +
            '<input type="text" id="comment" value="" placeholder="Поделитесь впечатлениями">' +
            '<button id="add_rewiew" class="add_rewiew">Добавить</button>' +
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
                    if (!this._isElement(this._$element)) {
                        return balloonLayout.superclass.getShape.call(this);
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
            <div class="cluster__header"><b>{{ properties.review_place|raw }}</b></div>
            <div class="cluster__link"><a href="#" class="search_by_address" data-coords="{{ properties.review_coords|raw }}">{{ properties.review_adress|raw }}</a></div>
            <div class="cluster__review">{{ properties.review_text|raw }}</div>
            <div class="cluster__review date">{{ properties.review_date|raw }}</div>`);

        const clusterer = new ymaps.Clusterer({
            preset: 'islands#invertedVioletClusterIcons',
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            balloonLayout: 'islands#balloon',
            clusterBalloonItemContentLayout: clasterContentLayout,
            clusterBalloonPanelMaxMapArea: 0,
            clusterBalloonPagerSize: 5,
            groupByCoordinates: false,
            clusterOpenBalloonOnClick: true,
            clusterDisableClickZoom: true,
            clusterHideIconOnBalloonOpen: false,
        });

        const myMap = new ymaps.Map('map', {
            center: [59.93181443, 30.36136798],
            zoom: 16,
            controls: ['zoomControl', 'fullscreenControl'] 
        }, {yandexMapDisablePoiInteractivity: true, balloonLayout: balloonLayout });

        myMap.geoObjects.add(clusterer);

        myMap.events.add('click', e => {
            e.preventDefault();
            coords = e.get('coords');
            ymaps.geocode(coords).then(res => {
                adress = res.geoObjects.get(0).getAddressLine();
                myMap.balloon.open(coords, {
                    properties: {
                        review_adress: adress,
                    }
                });
            })
        });

        document.addEventListener('click', e => {
            if (e.target.classList.contains('add_rewiew')) {
                e.preventDefault();
                addReview(coords, adress);
            }
        })

        document.addEventListener('click', e => {
            if (e.target.classList.contains('search_by_address')) {
                adress = document.querySelector('.search_by_address').innerText;
                coords = document.querySelector('.search_by_address').getAttribute('data-coords').split(',');

                myMap.balloon.open(coords, {
                    properties: {
                        review_adress: adress,
                    }
                }).then(function(){
                    placemarks.forEach(item => {
                        if (adress == item.review_adress) {
                            addLastReview(item.review_name, item.review_place, item.review_text, item.review_date);
                        }
                    })
                })
            }
        })        

        function addReview(coords, adress) {
            let name = document.querySelector('form #name').value;
            let place = document.querySelector('form #place').value;
            let comment = document.querySelector('form #comment').value;
            let date = getDate();

            if (name != '' & place != '' & comment != '') {
                let reviews = document.querySelector('.reviews');
                let newReview = document.createElement('div');
                let newReviewName = document.createElement('div');
                let newReviewText = document.createElement('div');
                let review = { name: name, place: place, text: comment, date: date };

                newReview.setAttribute('class', 'reviews__item');
                newReviewName.setAttribute('class', 'reviews__item_name');
                newReviewText.setAttribute('class', 'reviews__item_text');
                newReviewName.innerHTML= `<b>${name}</b> ${place} ${date}`;
                newReviewText.innerText = comment;
                reviews.appendChild(newReview);
                newReview.appendChild(newReviewName);
                newReview.appendChild(newReviewText);
                clearForm();
                addMark(coords, adress, review);
                newMark(coords, adress, review);
            }
        }

        function addLastReview(name, place, comment, date) {
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
            newDate = newDate.toLocaleString('ru', options);

            return newDate;
        }

        function clearForm() {
            let input = document.querySelectorAll('form input');
            input.forEach(function(inputItem) {
                inputItem.value = '';
            });
        }

        function addMark(coords, adress, review) {
            placemarks.push(
                {
                    review_coords: coords,
                    review_adress: adress,
                    review_name: review.name,
                    review_place: review.place,
                    review_date: review.date,
                    review_text: review.text
                }
            ); 
            localStorage.setItem('placemarks', JSON.stringify(placemarks));
        }

        function newMark(coords, adress, review) {  
            const point = new ymaps.Placemark(coords, {
                review_coords: coords,
                review_adress: adress,
                review_name: review.name,
                review_place: review.place,
                review_date: review.date,
                review_text: review.text
            }, 
            {
                balloonPanelMaxMapArea: 0,
                iconLayout: 'default#imageWithContent',
                iconImageHref: '',
                iconContentLayout: MyIconContentLayout,
                iconImageOffset: [-15, -50]
            }
            );
            
            clusterer.add(point);
        }

        function findOldMarks(placemarks) {
            if (placemarks.length != 0) {
                placemarks.forEach(object => {
                    let review = { name: object.review_name, place: object.review_place, text: object.review_text, date: object.review_date };
                    newMark(object.review_coords, object.review_adress, review)
                })
            }
        }

        findOldMarks(placemarks)
    });
}

export {
    mapBuild
};