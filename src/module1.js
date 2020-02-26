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
            '<div class="title"><i class="fas fa-map-marker-alt"></i>Адрес</div>',
            '</div>',
            '<div class="map__ballon_reviews">',
            '<div class="item">',
            '<div class="item_name">Оля</div>',
            '<div class="item_place">Шоколадница</div>',
            '<div class="item_text">Все плохо</div>',
            '</div>',
            '</div>',
            '<div class="map__ballon_bottom">',
            '<div class="bottom_text">Ваш отзыв</div>',
            '<form class="map__ballon_form">',
            '<input type="text" id="" name="" value="" placeholder="Ваше имя">',
            '<input type="text" id="" name="" value="" placeholder="Укажите место">',
            '<input type="text" id="" name="" value="" placeholder="Поделитесь впечатлениями">',
            '<button id="" type="submit">Добавить</button>',
            '</form>',
            '</div>',
            '</div>'
         ].join('')
      },
      {
         preset: 'default#image',
         iconColor: '#7109AA'
      }
     );

     myMap.geoObjects.add(placeMark);
   }
   
}

export {
   mapBuild
};