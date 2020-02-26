function mapBuild() {
   // ymaps.ready(init);

   // function init(){
   //    let myMap = new ymaps.Map("map", {
   //       center: [59.93181443, 30.36136798],
   //       zoom: 16,
   //       controls: ['zoomControl', 'fullscreenControl']
   //    });
   //    let placeMark = new ymaps.Placemark([59.932482, 30.363550], {
   //       balloonHeader: [            
   //          '<div class="map__ballon_top">',
   //          '<div class="title"><i class="fas fa-map-marker-alt"></i>Адрес</div>',
   //          '</div>'
   //       ].join(''),
   //       balloonContent: [
   //          '<div class="map__baloon">',
   //          '<div class="map__ballon_reviews">',
   //          '<div class="item">',
   //          '<div class="item_name">Оля</div>',
   //          '<div class="item_place">Шоколадница</div>',
   //          '<div class="item_text">Все плохо</div>',
   //          '</div>',
   //          '</div>',
   //          '<div class="map__ballon_bottom">',
   //          '<div class="bottom_text">Ваш отзыв</div>',
   //          '<form class="map__ballon_form">',
   //          '<input type="text" id="" name="" value="" placeholder="Ваше имя">',
   //          '<input type="text" id="" name="" value="" placeholder="Укажите место">',
   //          '<input type="text" id="" name="" value="" placeholder="Поделитесь впечатлениями">',
   //          '<button id="" type="submit">Добавить</button>',
   //          '</form>',
   //          '</div>',
   //          '</div>'
   //       ].join('')
   //    },
   //    {
   //       preset: 'default#image',
   //       iconColor: '#7109AA'
   //    }
   //   );

   //   myMap.geoObjects.add(placeMark);


   
   // }
   ymaps.ready(function () {
      // Создание экземпляра карты и его привязка к созданному контейнеру.
      var myMap = new ymaps.Map('map', {
            center: [59.93181443, 30.36136798],
            zoom: 16,
            controls: ['zoomControl', 'fullscreenControl'],
            behaviors: ['default', 'scrollZoom']
          },
           {
              searchControlProvider: 'yandex#search'
          }),
  
          // Создание макета балуна на основе Twitter Bootstrap.
          MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
              '<div class="popover top">' +
                  '<a class="close" href="#">&times;</a>' +
                  '<div class="arrow"></div>' +
                  '<div class="popover-inner">' +
                  '$[[options.contentLayout observeSize minWidth=235 maxWidth=235 maxHeight=350]]' +
                  '</div>' +
                  '</div>', {
                  /**
                   * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
                   * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
                   * @function
                   * @name build
                   */
                  build: function () {
                      this.constructor.superclass.build.call(this);
  
                      this._$element = $('.popover', this.getParentElement());
  
                      this.applyElementOffset();
  
                      this._$element.find('.close')
                          .on('click', $.proxy(this.onCloseClick, this));
                  },
  
                  /**
                   * Удаляет содержимое макета из DOM.
                   * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
                   * @function
                   * @name clear
                   */
                  clear: function () {
                      this._$element.find('.close')
                          .off('click');
  
                      this.constructor.superclass.clear.call(this);
                  },
  
                  /**
                   * Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.
                   * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                   * @function
                   * @name onSublayoutSizeChange
                   */
                  onSublayoutSizeChange: function () {
                      MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);
  
                      if(!this._isElement(this._$element)) {
                          return;
                      }
  
                      this.applyElementOffset();
  
                      this.events.fire('shapechange');
                  },
  
                  /**
                   * Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.
                   * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                   * @function
                   * @name applyElementOffset
                   */
                  applyElementOffset: function () {
                      this._$element.css({
                          left: -(this._$element[0].offsetWidth / 2),
                          top: -(this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight)
                      });
                  },
  
                  /**
                   * Закрывает балун при клике на крестик, кидая событие "userclose" на макете.
                   * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                   * @function
                   * @name onCloseClick
                   */
                  onCloseClick: function (e) {
                      e.preventDefault();
  
                      this.events.fire('userclose');
                  },
  
                  /**
                   * Используется для автопозиционирования (balloonAutoPan).
                   * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ILayout.xml#getClientBounds
                   * @function
                   * @name getClientBounds
                   * @returns {Number[][]} Координаты левого верхнего и правого нижнего углов шаблона относительно точки привязки.
                   */
                  getShape: function () {
                      if(!this._isElement(this._$element)) {
                          return MyBalloonLayout.superclass.getShape.call(this);
                      }
  
                      var position = this._$element.position();
  
                      return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                          [position.left, position.top], [
                              position.left + this._$element[0].offsetWidth,
                              position.top + this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight
                          ]
                      ]));
                  },
  
                  /**
                   * Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).
                   * @function
                   * @private
                   * @name _isElement
                   * @param {jQuery} [element] Элемент.
                   * @returns {Boolean} Флаг наличия.
                   */
                  _isElement: function (element) {
                      return element && element[0] && element.find('.arrow')[0];
                  }
              }),
  
          // Создание вложенного макета содержимого балуна.
          MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
              '<h3 class="popover-title"><i class="fas fa-map-marker-alt"></i>$[properties.balloonHeader]</h3>' +
                  '<div class="popover-content">$[properties.balloonContent]</div>' +
                  '<div class="popover-content">$[properties.balloonContent2]</div>'
          ),
  
          // Создание метки с пользовательским макетом балуна.
          myPlacemark = window.myPlacemark = new ymaps.Placemark(myMap.getCenter(), {
              balloonHeader: 'Некий адрес',
              balloonContent: 'Контент балуна',
              balloonContent2: 'sdsadaa'
          },
          {
              balloonShadow: false,
              balloonLayout: MyBalloonLayout,
              balloonContentLayout: MyBalloonContentLayout,
              balloonPanelMaxMapArea: 0,
              iconColor: '#7109AA'
              // Не скрываем иконку при открытом балуне.
              // hideIconOnBalloonOpen: false,
              // И дополнительно смещаем балун, для открытия над иконкой.
              // balloonOffset: [3, -40]
          });
  
      myMap.geoObjects.add(myPlacemark);
  });
   
}

export {
   mapBuild
};