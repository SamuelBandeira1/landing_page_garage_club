/* ============================================================
   GARAGE CLUB — data.js  (content model)
   ============================================================ */
window.GC = window.GC || {};

GC.cuts = [
  { img:"assets/img/new-01.webp", no:"01", name:"Pompadour & Barba Full",  tag:"DESTAQUE", featured:true },
  { img:"assets/img/new-03.webp", no:"02", name:"Side Part Texturizado",   tag:"CLASSIC" },
  { img:"assets/img/cut-03.jpg", no:"03", name:"Pompadour Slick",         tag:"SIGNATURE" },
  { img:"assets/img/cut-02.jpg", no:"04", name:"Mid Fade Natural",        tag:"FADE" },
  { img:"assets/img/new-04.webp", no:"05", name:"Cacheado Definido",       tag:"NATURAL" },
  { img:"assets/img/cut-09.jpg", no:"06", name:"Side Part Clássico",      tag:"CLASSIC" },
  { img:"assets/img/cut-07.jpg", no:"07", name:"Undercut Desenhado",      tag:"DESIGN" },
  { img:"assets/img/cut-01.jpg", no:"08", name:"Quiff & Barba",           tag:"SIGNATURE" },
  { img:"assets/img/cut-05.jpg", no:"09", name:"Low Fade Cravado",        tag:"FADE" },
  { img:"assets/img/cut-06.jpg", no:"10", name:"Full Beard Sculpt",       tag:"BARBA" },
  { img:"assets/img/cut-10.jpg", no:"11", name:"Crop Moderno",            tag:"FADE" },
  { img:"assets/img/kid-02.jpg", no:"12", name:"Garage Kids",             tag:"KIDS" }
];

GC.barbers = [
  {
    first:"YAN", last:"STOCKLI", sign:"Yan Stockli",
    role:"FUNDADOR / MASTER BARBER",
    desc:"Fundador da Garage Club em Fortaleza. Yan une a disciplina da velha escola com a precisão milimétrica do fade moderno — cada corte é uma assinatura.",
    years:"12", cuts:"38k",
    main:"assets/img/yan-stockli.webp",
    thumbs:["assets/img/new-01.webp","assets/img/cut-06.jpg","assets/img/barber-02.jpg"]
  },
  {
    first:"BARBEIRO", last:"GARAGE", sign:"Garage Club",
    role:"BARBEIRO / ESPECIALISTA EM FADE",
    desc:"Mão firme, olho de régua. Transições limpas, linhas cravadas e acabamento na navalha. A equipe da Garage Club está pronta pra te atender.",
    years:"08", cuts:"24k",
    main:"assets/img/new-02.webp",
    thumbs:["assets/img/cut-09.jpg","assets/img/new-04.webp","assets/img/cut-11.jpg"]
  }
];

GC.services = [
  { name:"Corte Clássico",          price:"R$60",  img:"assets/img/cut-09.jpg" },
  { name:"Garage Fade",             price:"R$70",  img:"assets/img/cut-02.jpg" },
  { name:"Barba & Toalha Quente",   price:"R$45",  img:"assets/img/cut-06.jpg" },
  { name:"Barboterapia Completa",   price:"R$90",  img:"assets/img/cut-01.jpg" },
  { name:"Tratamento Royal",        price:"R$130", img:"assets/img/barber-01.jpg" },
  { name:"Corte Kids",              price:"R$35",  img:"assets/img/kid-01.jpg" }
];

/* asymmetric heights/widths for the carousel rail (vw / vh based) */
GC.railSizes = [
  { w:"30vw", h:"66vh", y:"0" },
  { w:"22vw", h:"46vh", y:"8vh" },
  { w:"34vw", h:"72vh", y:"-3vh" },
  { w:"24vw", h:"52vh", y:"12vh" },
  { w:"30vw", h:"62vh", y:"-6vh" },
  { w:"21vw", h:"44vh", y:"6vh" },
  { w:"32vw", h:"70vh", y:"2vh" },
  { w:"25vw", h:"50vh", y:"-8vh" },
  { w:"29vw", h:"60vh", y:"10vh" },
  { w:"22vw", h:"46vh", y:"-4vh" },
  { w:"33vw", h:"68vh", y:"4vh" },
  { w:"26vw", h:"54vh", y:"-2vh" }
];
