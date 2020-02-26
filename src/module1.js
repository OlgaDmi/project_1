function mapBuild() {
   ymaps.ready(init);

   function init(){
      let myMap = new ymaps.Map("map", {
         center: [59.93181443, 30.36136798],
         zoom: 16,
         controls: ['zoomControl', 'fullscreenControl']
      });
      let placeMark = new ymaps.Placemark([59.932482, 30.363550], {
         balloonContent: [
            '<div class="map__baloon">',
            '<div class="map__ballon_top">',
            '<div class="title">Адрес</div>',
            '<button type="button" class="close">✖</button>',
            '</div>',
            '<div class="map__ballon_reviews">',
            '<div class="map__ballon_reviews_item">',
            '<div class="map__ballon_reviews_item_name">Оля</div>',
            '<div class="map__ballon_reviews_place">Шоколадница</div>',
            '<div class="map__ballon_reviews_text">Все плохо</div>',
            '</div>',
            '</div>',
            '<div class="map__ballon_form">',
            '<form>',
            '<input class="" type="text" id="" name="" value="" placeholder="Ваше имя">',
            '<input class="" type="text" id="" name="" value="" placeholder="Укажите место">',
            '<input class="" type="text" id="" name="" value="" placeholder="Поделитесь впечатлениями">',
            '<button id="" type="submit" class="">Добавить</button>',
            '</form>',
            '</div>',
            '</div>'
         ].join('')
      },
      {
         preset: 'islands#icon',
         iconColor: '#0095b6'
      }
     );

     myMap.geoObjects.add(placeMark);
   }
   
}

export {
   mapBuild
};