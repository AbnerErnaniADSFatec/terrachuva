import { Component, OnInit } from '@angular/core';


import Map from 'ol/Map';
import {defaults as defaultControls} from 'ol/control.js';
import MousePosition from 'ol/control/MousePosition.js';
import {createStringXY} from 'ol/coordinate.js';

import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import TileWMS from 'ol/source/TileWMS';
import Vector from 'ol/source/Vector';
import Stamen from 'ol/source/Stamen';
import GeoJSON from 'ol/format/GeoJSON';
import FullScreen from 'ol/control/FullScreen';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Select from 'ol/interaction/Select';
import { Icon, Style, Stroke } from 'ol/style';

// import VectorSource from 'ol/source';
// import Overlay from 'ol/Overlay';
// import Point from 'ol/geom/Point';
// import Feature from 'ol/Feature';
// import VectorLayer from 'ol/layer';


import { MapService } from 'src/app/map.service';
import { mapToMapExpression } from '@angular/compiler/src/render3/util';
import { projection } from '@angular/core/src/render3';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {
  private geoserverIBGE = 'http://www.geoservicos.ibge.gov.br/geoserver/wms?';
  private geoserverTerraMaCurso = 'http://www.terrama2.dpi.inpe.br/curso/geoserver/wms?';
  private geoserverTerraMaLocal = 'http://localhost:8080/geoserver/wms?';
  private geoserverCemaden = 'http://200.133.244.148:8080/geoserver/cemaden_dev/wms';
  private geoserverQueimada = 'http://queimadas.dgi.inpe.br/queimadas/geoserver/wms?';
  private geoserver20Chuva = 'http://www.terrama2.dpi.inpe.br/chuva/geoserver/wms?';

  private map;
  private waterColor;
  private toner;
  private osm;
  private gebco;
  private terrain;

  private analise;

  //private busca;
  value: number = 0;
  testep: boolean = false;
  setMap: string = 'GEBCO';

  /*
  private pcd;
  private merge4km;
  private prec5km;
  private estado;
  private baciashidrografica;
  private quimadalayer;
  */

  // Controle das camadas
  private commonLayer;
  private layers = [];
  
  minDate: Date;
  maxDate: Date;
  invalidDates: Array<Date>;
  vals: number[] = [];
  checked: boolean[] = [];
  dates: Date[] = [];

  // selectedCategories: string[] = ['pcd', 'estado'];

  // [ Nome da layer, Origem, EPSG:Preojeção ]
  private names = [
    ['terrama2_10:view10', this.geoserver20Chuva, '4674'],       /** Estados */
    /** ['terrama2_1:view1', this.geoserverTerraMaLocal, '4326'],    /** Prec4km */
    ['terrama2_3:view3', this.geoserver20Chuva,'4326'],          /** Merge4km */
    ['terrama2_3:view3', this.geoserverTerraMaLocal, '4326'],    /**  PCD's */
    ['cemaden_dev:br_estados', this.geoserverCemaden, '4326'],   /** Divisão Estados */
    ['bdqueimadas:focos', this.geoserverQueimada, '4326'],       /** Queimadas */
    ['terrama2_11:view11', this.geoserver20Chuva, '4326']        /** Análise */
  ];

  constructor(private mapService: MapService) { }

  ngOnInit() {
    this.initilizeMap();
    this.initilizeJson();
    let today = new Date();
    this.minDate = new Date();
    this.minDate.setDate(1);
    this.minDate.setMonth(1);
    this.minDate.setFullYear(1998);
    this.maxDate = new Date();
    this.maxDate.setDate(31); //today.getDate());
    this.maxDate.setMonth(0); //today.getMonth());
    this.maxDate.setFullYear(2019); //today.getFullYear());
    this.invalidDates = [this.minDate, this.maxDate];
  }

  initilizeMap() {
    let interval = setInterval(() => {
      this.value = this.value + Math.floor(Math.random() * 10) + 1;
      if (this.value >= 100) {
        this.value = 100;
        this.testep = true;
        // this.messageService.add({severity: 'info', summary: 'Success', detail: 'Process Completed'});
        clearInterval(interval);
      } else if (this.value >= 10) {
        // this.map.addLayer(this.pcd);
      } else if (this.value >= 5) {
        // this.map.addLayer(this.prec4km);
      } else if (this.value >= 2) {
        // this.map.addLayer(this.estado);
        // this.map.addLayer(this.baciashidrografica);
      }
    }, 2000);

    for ( let ind in this.names ){
      this.commonLayer = new TileLayer({
        title : this.names[ind][0],
        visible: false,
        source: new TileWMS({
          url: this.names[ind][1],
          params: {
            'LAYERS': this.names[ind][0],
            'VERSION': '1.1.1',
            'FORMAT': 'image/png',
            'EPSG': this.names[ind][2],
            'TILED': true,
            'TIME': this.dates[ind]
          },
          preload: Infinity,
          projection: 'EPSG:'.concat(this.names[ind][2]),
          serverType: 'geoserver',
          name: this.names[ind][0]
        }),
      });
      this.layers[ind] = this.commonLayer;
      this.checked[ind] = false;
      this.vals[ind] = 100;
    }

    /**
    this.analise = new TileLayer({
      title: "view_An_PrecMedia_Bacias_N1",
      visible: false,
      source: new TileWMS({
        url: this.geoserver20Chuva,
        params: {
          'LAYERS': 'terrama2_11:view11',
          'VERSION': '1.1.1',
          'FORMAT': 'image/png',
          'EPSG': '4326',
          'TILED': true,
          'TIME' : '1998-02-01'
        },
        preload: Infinity,
        projection: 'EPSG:4326',
        serverType: 'geoserver',
        name: 'view_An_PrecMedia_Bacias_N1'
      })
    });

    this.layers[5] = this.analise;
    this.checked[5] = false;
    this.vals[5] = 100;
    */

    /*
    this.quimadalayer = new TileLayer({
      title: 'queimada',
      visible: false,
      source: new TileWMS({
        url: this.geoserverQueimada,
        params: {
          'LAYERS': 'bdqueimadas:focos',
          'VERSION': '1.1.1',
          'FORMAT': 'image/png',
          'EPSG': '4326',
          'TILED': true
        },
        preload: Infinity,
        // opacity: 1,
        projection: 'EPSG:4326',
        serverType: 'geoserver',
        name: 'layer_queimada'
      })
    });


    this.baciashidrografica = new TileLayer({
      title: 'baciashidrografica',
      visible: false,
      source: new TileWMS({
        url: this.geoserverTerraMaCurso,
        params: {
          'LAYERS': 'bacias',
          'VERSION': '1.1.1',
          'FORMAT': 'image/png',
          'EPSG': '4326',
          'TILED': true
        },
        preload: Infinity,
        // opacity: 1,
        projection: 'EPSG:4326',
        serverType: 'geoserver',
        name: 'layer_baciashidrografica'
      })
    });

    this.merge4km = new TileLayer({
      title: 'merge4km',
      source: new TileWMS({
        url: this.geoserver20Chuva,
        params: {
          'LAYERS': 'terrama2_3:view3',
          'VERSION': '1.1.1',
          'FORMAT': 'image/png',
          'EPSG': '4326',
          'TILED': true,
          'TIME': '2019-01-01'
        },
        preload: Infinity,
        projection: 'EPSG:4326',
        serverType: 'geoserver',
        name: 'merge4km'
      })
    });

    this.prec5km = new TileLayer({
      title: 'prec5km',
      visible: false,
      source: new TileWMS({
        url: this.geoserverTerraMaLocal,
        params: {
          'LAYERS': 'terrama2_1:view1',
          'VERSION': '1.1.1',
          'FORMAT': 'image/png',
          'EPSG': '4326',
          'TILED': true,
        },
        preload: Infinity,
        projection: 'EPSG:4326',
        serverType: 'geoserver',
        name: 'layer_prec4km'
      })
    });

    this.pcd = new TileLayer({
      title: 'pcd',
      visible: false,
      source: new TileWMS({
        url: this.geoserverTerraMaLocal,
        params: {
          'LAYERS': 'terrama2_3:view3',
          'VERSION': '1.1.1',
          'FORMAT': 'image/png',
          'EPSG': '4326',
          'TILED': true
        },
        preload: Infinity,
        projection: 'EPSG:4326',
        serverType: 'geoserver',
        name: 'layer_pcd'
      })
    });

    this.estado = new TileLayer({
      title: 'estados',
      visible: false,
      source: new TileWMS({
        url: this.geoserverCemaden,
        params: {
          'LAYERS': 'cemaden_dev:br_estados',
          'VERSION': '1.1.1',
          'FORMAT': 'image/png',
          'EPSG': '4326',
          'TILED': true
        },
        preload: Infinity,
        projection: 'EPSG:4326',
        serverType: 'geoserver',
        name: 'layer_estado'
      })
    });
    */
    //-------------------grup test---------------------------//
    // var teste = new Vector({
    //   title: 'added Layer',
    //   source: new Vector({
    //     url: 'http://localhost:8080/geoserver/terrama2_1/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=terrama2_1:view1&outputFormat=application/json&srsname=EPSG:4326',
    //     format: new GeoJSON()
    //   })
    // });

    // var vectorSource = new Vector(
    //   {
    //     url: 'http://www.geoservicos.ibge.gov.br/geoserver/CCAR/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=CCAR:BC100_Capital_P&maxFeatures=50&outputFormat=json',
    //     projection: 'EPSG:3857',
    //     format: new GeoJSON(),
    //     attributions: ["&copy; <a href='https://data.culture.gouv.fr/explore/dataset/fonds-de-la-guerre-14-18-extrait-de-la-base-memoire'>data.culture.gouv.fr</a>"],
    //     logo: "https://www.data.gouv.fr/s/avatars/37/e56718abd4465985ddde68b33be1ef.jpg"
    //   });


    // var vector = new Vector(
    //   {
    //     name: '1914-18',
    //     preview: "http://visible: false,www.culture.gouv.fr/Wave/image/memoire/2445/sap40_z0004141_v.jpg",
    //     source: vectorSouvisible: false,rce
    //   });visible: false,


    // var iconFeature = new Feature({
    //   geometry: new Point([-6124801.2015823, -1780692.0106836]),
    //   name: 'Null Island',
    //   population: 4000,
    //   rainfall: 500
    // });


    // var vectorSource = new Vector({
    //   features: [iconFeature]
    // });

    // var vectorLayer = new Vector({
    //   source: vectorSource
    // });

    // var vectorSource = new Vector({
    //   format: new GeoJSON(),
    //   url: function (extent) {
    //     return 'http://localhost:8080/geoserver/terrama2_1/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=terrama2_1:view1&outputFormat=application/json&srsname=EPSG:4326&' +
    //       'bbox=' + extent.join(',') + ',EPSG:32640';

    //   },
    //   // strategy: LoadingStrategy.bbox
    // });


    //---------------------final test ----------------------------//     

    var interaction = new DragRotateAndZoom();

    var control = new FullScreen();

    this.osm = new TileLayer({
      preload: Infinity,
      visible: false,
      title: "osm",
      baseLayer: true,
      source: new OSM(),
      layer: 'osm',
    });

    this.gebco = new TileLayer({
      source: new TileWMS(({
        preload: Infinity,
        visible: false,
        title: "gebco",
        baseLayer: true,
        url: 'http://www.gebco.net/data_and_products/gebco_web_services/web_map_service/mapserv?',
        params: { 'LAYERS': 'GEBCO_LATEST', 'VERSION': '1.1.1', 'FORMAT': 'image/png' }
      })),
      serverType: 'mapserver'
    });

    this.waterColor = new TileLayer({
      preload: Infinity,
      visible: false,
      title: "Watercolor",
      baseLayer: true,
      source: new Stamen({
        layer: 'watercolor'
      })
    });


    this.toner = new TileLayer(
      {
        preload: Infinity,
        title: "Toner",
        baseLayer: true,
        visible: false,
        source: new Stamen({
          layer: 'toner'
        })
      });


    this.terrain = new TileLayer(
      {
        preload: Infinity,
        title: "terrain",
        baseLayer: true,
        visible: false,
        source: new Stamen({
          layer: 'terrain'
        })
      });

    var center = [-6124801.2015823, -1780692.0106836];
    var view = new View({
      center: center,
      zoom: 4
    });

    var mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: 'EPSG:4326',
      className: 'custom-mouse-position',
      target: document.getElementById('mouse-position'),
      undefinedHTML: '&nbsp;'
    });

    this.map = new Map({
      controls: defaultControls().extend([mousePositionControl, control]),
      layers: [this.osm, this.gebco, this.waterColor, this.toner, this.terrain],
      // interactions: [interaction],
      target: 'map',
      view: view
    });

    /**
    var precisionInput = document.getElementById('precision');
    precisionInput.addEventListener('change', function(event){
      var format = createStringXY(event.target.valueAsNumber);
      mousePositionControl.setCoordinateFormat(format);
    });
    */

    for ( let layer of this.layers ){
      this.map.addLayer(layer);
    }

    // var lis = document.getElementById('menu') as HTMLElement;
    // console.log(lis);
    // var lis = document.getElementById('menu').getElementsByTagName('li');
    // var lis_array = [].slice.call(lis); //convert to array
    // lis_array.forEach(function (li) {
    //   li.addEventListener('click', switchLayer, false);
    // });


    // this.map.addLayer(this.prec4km);
    // this.map.addLayer(this.baciashidrografica);
    // this.baciashidrografica.setOpacity(0.52);
    // this.prec4km.setOpacity(0.52);
    // this.map.addLayer(this.estado);
    // this.map.addLayer(this.pcd);
    // this.map.addLayer(this.quimadalayer);

    this.map.on('singleclick', function (evt) {
      // var coordinate = evt.coordinate;
      // console.log(coordinate);
      // var pixel = map.getPixelFromCoordinate(coordinate);
      // var el = document.getElementById('name');
      console.log(evt.pixel);
    });

    function changeMap() {
      console.log('name');
    }
    // function setMapType(newType) {
    //   console.log('teste');
    //   if (newType == 'OSM') {
    //     this.map.setLayerGroup(this.osm);
    //   } else if (newType == 'MAPQUEST_OSM') {
    //     this.map.setLayerGroup(this.Watercolor);
    //   }
    // }

  }

  // Método json pcd
  initilizeJson() {

    // this.mapService.listar()
    // .subscribe(resposta => this.features = <any>resposta)

    // console.log(this.features[0]);

    // for (var i = 1; i <= 2; i++) {

    //   console.log(i);
    // console.log(this.selectedCategories);
    // }
  }

  private setLayerType(){
    /*
    var layers = [
      this.baciashidrografica,
      this.prec5km,
      this.pcd,
      this.estado,
      this.quimadalayer
    ]*/
    for ( let ind in this.layers ){
      console.log(this.vals[ind]/100);
      this.layers[ind].setVisible(this.checked[ind]);
      this.layers[ind].setOpacity(this.vals[ind]/100);
    }
  }

  private setTimeLayer(){
    for ( let ind in this.dates ){
      var day = this.dates[ind].getDate();
      var month = this.dates[ind].getMonth() + 1;
      var year = this.dates[ind].getFullYear();
      this.layers[ind].getSource().updateParams({'TIME': year + '-' + month + '-' + day}); /** '2019-01-05'}); */
    }
  }

  private setMapType() {
    switch (this.setMap) {
      case 'osm':
        this.osm.setVisible(true);
        this.waterColor.setVisible(false);
        this.toner.setVisible(false);
        this.terrain.setVisible(false);
        this.gebco.setVisible(false);
        break;
      case 'GEBCO':
        this.gebco.setVisible(true);
        this.osm.setVisible(false);
        this.waterColor.setVisible(false);
        this.toner.setVisible(false);
        this.terrain.setVisible(false);
        break;
      case 'Watercolor':
        this.osm.setVisible(false);
        this.waterColor.setVisible(true);
        this.toner.setVisible(false);
        this.terrain.setVisible(false);
        this.gebco.setVisible(false);
        break;
      case 'Toner':
        this.osm.setVisible(false);
        this.waterColor.setVisible(false);
        this.toner.setVisible(true);
        this.terrain.setVisible(false);
        this.gebco.setVisible(false);
        break;
      case 'Terrain':
        this.osm.setVisible(false);
        this.waterColor.setVisible(false);
        this.toner.setVisible(false);
        this.terrain.setVisible(true);
        this.gebco.setVisible(false);
        break;
    }
  }

  // Botão salvar
  private salvar() {
    // this.prec4km.setOpacity(0.52);
    // this.prec4km.setVisible(false);
    // this.estado.setVisible(false);
    // this.prec4km.setParams('TIME : 2018-01-01 ');

    // this.map.addLayer(this.osm);


    // var group = this.map.getLayerGroup();
    // var layers = group.getLayers();
    // var element = layers.item(0);
    // var name = element.get('title');
    // console.log(layers.length);



    // var layers = this.map.getLayers().getArray();
    // var baseLayers = new Array();
    // for (var i = 0; i < layers.length; i++) {
    //   var lyrprop = layers[i].getProperties();
    //   baseLayers.push(layers[i]);
    //   console.log(layers[i]);
    //   // if (lyrprop.type == 'Watercolor') {
    //   //   baseLayers.push(layers[i]);
    //   //   console.log(layers[i]);
    //   // }
    // }

    var group = this.map.getLayerGroup();
    var gruplayers = group.getLayers();
    var layers = this.map.getLayers().getArray();
    for (var i = 5; i < layers.length; i++) {
      var element = gruplayers.item(i);
      // this.map.removeLayer(element);
      var name = element.get('title');
      // console.log(element);
      console.log(name);
    }
    //this.merge4km.getSource().updateParams({'TIME': '2019-01-05'});

    // if (this.busca == null) {
    //   console.log("nulo");
    // } else {
    //   console.log(this.busca);
    // }
  }

  private activeLayer() {
  }

  dellLayer() {
  }
}
